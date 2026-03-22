import os
import shutil
from pathlib import Path
from datetime import datetime
from bson import ObjectId

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from auth.dependencies import get_current_user
from database import get_db
from services.botpress import delete_file_from_botpress, upload_file_to_botpress
from services.embedder import count_document_vectors, delete_document_vectors, embed_and_store
from services.parser import parse_file

router = APIRouter(tags=["documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".csv"}
UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    try:
        db = get_db()
        user_id = current_user["user_id"]
        
        extension = Path(file.filename or "").suffix.lower()
        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF, DOCX, and CSV are supported")

        user_prefix = f"u{user_id}"
        target_name = f"{user_prefix}_{Path(file.filename).name}"
        destination = UPLOAD_DIR / target_name

        user_obj_id = ObjectId(user_id) if len(str(user_id)) == 24 else user_id
        existing_docs = list(db["documents"].find({
            "user_id": user_obj_id,
            "filename": Path(file.filename).name,
        }))

        if existing_docs:
            try:
                delete_document_vectors(user_id, Path(file.filename).name)
            except Exception as exc:
                print(f"Vector cleanup failed for re-upload: {exc}")

            for existing_doc in existing_docs:
                if existing_doc.get("botpress_file_id"):
                    try:
                        delete_file_from_botpress(existing_doc["botpress_file_id"])
                    except Exception as exc:
                        print(f"[Botpress] cleanup failed before re-upload: {exc}")

                old_path = existing_doc.get("file_path")
                if old_path and os.path.exists(old_path):
                    try:
                        os.remove(old_path)
                    except Exception as exc:
                        print(f"Local file cleanup failed before re-upload: {exc}")

            db["documents"].delete_many({
                "user_id": user_obj_id,
                "filename": Path(file.filename).name,
            })

        with destination.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        chunks = parse_file(str(destination), Path(file.filename).name)
        if not chunks:
            if destination.exists():
                destination.unlink(missing_ok=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No readable text found in this document",
            )

        stored = embed_and_store(chunks, user_id, Path(file.filename).name)

        botpress_result = {"botpress_file_id": None, "botpress_status": "not_indexed"}
        try:
            botpress_result = upload_file_to_botpress(str(destination), Path(file.filename).name, user_id)
        except Exception as exc:
            print(f"[Botpress] upload failed: {exc}")

        doc = {
            "user_id": user_obj_id,
            "filename": Path(file.filename).name,
            "file_path": str(destination),
            "chunks_stored": stored,
            "botpress_file_id": botpress_result.get("botpress_file_id"),
            "status": "indexed",
            "uploaded_at": datetime.utcnow(),
            "category": None,
            "summary": None
        }
        result = db["documents"].insert_one(doc)
        doc_id = str(result.inserted_id)

        return {
            "message": "Document uploaded and indexed",
            "document_id": doc_id,
            "filename": doc["filename"],
            "chunks_stored": stored,
            "botpress_file_id": doc["botpress_file_id"],
            "botpress_status": botpress_result.get("botpress_status"),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/documents")
def get_documents(current_user: dict = Depends(get_current_user)):
    try:
        db = get_db()
        user_id = ObjectId(current_user["user_id"]) if len(str(current_user["user_id"])) == 24 else current_user["user_id"]
        
        docs = db["documents"].find({"user_id": user_id}).sort("uploaded_at", -1)
        
        return [
            {
                "id": str(d["_id"]),
                "filename": d["filename"],
                "file_path": d["file_path"],
                "category": d.get("category"),
                "summary": d.get("summary"),
                "chunks_stored": d.get("chunks_stored"),
                "botpress_file_id": d.get("botpress_file_id"),
                "status": d.get("status"),
                "uploaded_at": d["uploaded_at"].isoformat() if d.get("uploaded_at") else None,
            }
            for d in docs
        ]
    except Exception as e:
        print(f"Get documents error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/documents/chunk-counts")
def get_document_chunk_counts(current_user: dict = Depends(get_current_user)):
    try:
        db = get_db()
        user_id_raw = current_user["user_id"]
        user_id = ObjectId(user_id_raw) if len(str(user_id_raw)) == 24 else user_id_raw

        docs = list(db["documents"].find({"user_id": user_id}, {"filename": 1, "chunks_stored": 1}))
        result = []
        for doc in docs:
            filename = doc.get("filename")
            pinecone_chunks = 0
            error = None
            try:
                pinecone_chunks = count_document_vectors(user_id_raw, filename)
            except Exception as exc:
                error = str(exc)

            result.append({
                "document_id": str(doc.get("_id")),
                "filename": filename,
                "chunks_stored": doc.get("chunks_stored"),
                "pinecone_chunks": pinecone_chunks,
                "verified": pinecone_chunks > 0,
                "error": error,
            })

        return result
    except Exception as e:
        print(f"Get chunk counts error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/documents/{doc_id}")
def delete_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        db = get_db()
        user_id = ObjectId(current_user["user_id"]) if len(str(current_user["user_id"])) == 24 else current_user["user_id"]
        
        try:
            doc_obj_id = ObjectId(doc_id)
        except:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid document ID")
        
        doc = db["documents"].find_one({"_id": doc_obj_id, "user_id": user_id})
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

        botpress_deleted = False
        if doc.get("botpress_file_id"):
            try:
                botpress_deleted = delete_file_from_botpress(doc["botpress_file_id"])
            except Exception as exc:
                print(f"[Botpress] delete failed: {exc}")

        if doc.get("file_path") and os.path.exists(doc["file_path"]):
            os.remove(doc["file_path"])

        db["documents"].delete_one({"_id": doc_obj_id})

        return {
            "message": "Document deleted successfully",
            "document_id": doc_id,
            "botpress_deleted": botpress_deleted,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete document error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
