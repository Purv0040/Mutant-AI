import os
import shutil
import mimetypes
from pathlib import Path
from datetime import datetime
from bson import ObjectId

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from auth.dependencies import get_current_user
from database import get_db
from services.botpress import delete_file_from_botpress, upload_file_to_botpress
from services.access import build_document_visibility_query, normalize_access_mode, to_object_id
from services.embedder import count_document_vectors, delete_document_vectors, embed_and_store
from services.parser import parse_file

router = APIRouter(tags=["documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".csv"}
UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    access_mode: str = Form("All"),
    current_user: dict = Depends(get_current_user),
):
    try:
        db = get_db()
        user_id = current_user["user_id"]
        owner_role = str(current_user.get("role") or "user").lower()
        owner_department = current_user.get("department") or "General"
        normalized_access_mode = normalize_access_mode(access_mode)
        
        extension = Path(file.filename or "").suffix.lower()
        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF, DOCX, and CSV are supported")

        user_prefix = f"u{user_id}"
        target_name = f"{user_prefix}_{Path(file.filename).name}"
        destination = UPLOAD_DIR / target_name

        user_obj_id = to_object_id(user_id)
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

        stored = embed_and_store(
            chunks,
            user_id,
            Path(file.filename).name,
            metadata={
                "access_mode": normalized_access_mode,
                "owner_role": owner_role,
                "owner_department": owner_department,
            },
        )

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
            "access_mode": normalized_access_mode,
            "owner_role": owner_role,
            "owner_department": owner_department,
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
            "access_mode": normalized_access_mode,
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
        visibility_query = build_document_visibility_query(current_user)
        docs = db["documents"].find(visibility_query).sort("uploaded_at", -1)
        
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
                "access_mode": d.get("access_mode", "All"),
                "owner_department": d.get("owner_department"),
                "owner_role": d.get("owner_role"),
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
        docs = list(
            db["documents"].find(
                build_document_visibility_query(current_user),
                {"filename": 1, "chunks_stored": 1, "user_id": 1},
            )
        )
        result = []
        for doc in docs:
            filename = doc.get("filename")
            pinecone_chunks = 0
            error = None
            try:
                owner_user_id = str(doc.get("user_id"))
                pinecone_chunks = count_document_vectors(owner_user_id, filename)
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


@router.get("/documents/{doc_id}/preview")
def preview_document(
    doc_id: str,
    token: str = None,
    current_user: dict = Depends(get_current_user),
):
    """Stream the original file so the browser can preview it (token accepted via query param for iframe use)."""
    try:
        db = get_db()
        try:
            doc_obj_id = ObjectId(doc_id)
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid document ID")

        doc = db["documents"].find_one({
            "_id": doc_obj_id,
            **build_document_visibility_query(current_user),
        })
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

        file_path = doc.get("file_path")
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found on disk")

        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = "application/octet-stream"

        return FileResponse(
            path=file_path,
            media_type=mime_type,
            filename=doc.get("filename", Path(file_path).name),
            headers={"Content-Disposition": f'inline; filename="{doc.get("filename", Path(file_path).name)}"'},
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Preview document error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/documents/{doc_id}")
def delete_document(
    doc_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        db = get_db()
        user_id = to_object_id(current_user["user_id"])
        
        try:
            doc_obj_id = ObjectId(doc_id)
        except:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid document ID")
        
        role = str(current_user.get("role") or "user").lower()
        delete_query = {"_id": doc_obj_id} if role == "admin" else {"_id": doc_obj_id, "user_id": user_id}
        doc = db["documents"].find_one(delete_query)
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
