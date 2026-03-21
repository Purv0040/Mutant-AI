import os
import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database import get_db
from models import Document, User
from services.botpress import delete_file_from_botpress, upload_file_to_botpress
from services.embedder import embed_and_store
from services.parser import parse_file

router = APIRouter(tags=["documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".csv"}
UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF, DOCX, and CSV are supported")

    user_prefix = f"u{current_user.id}"
    target_name = f"{user_prefix}_{Path(file.filename).name}"
    destination = UPLOAD_DIR / target_name

    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    chunks = parse_file(str(destination), Path(file.filename).name)
    stored = embed_and_store(chunks, current_user.id, Path(file.filename).name)

    botpress_result = {"botpress_file_id": None, "botpress_status": "not_indexed"}
    try:
        botpress_result = upload_file_to_botpress(str(destination), Path(file.filename).name, current_user.id)
    except Exception as exc:
        print(f"[Botpress] upload failed: {exc}")
        botpress_result = {"botpress_file_id": None, "botpress_status": "upload_failed"}

    doc = Document(
        user_id=current_user.id,
        filename=Path(file.filename).name,
        file_path=str(destination),
        botpress_file_id=botpress_result.get("botpress_file_id"),
        status="indexed",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "message": "Document uploaded and indexed",
        "document_id": doc.id,
        "filename": doc.filename,
        "chunks_stored": stored,
        "botpress_file_id": doc.botpress_file_id,
        "botpress_status": botpress_result.get("botpress_status"),
    }


@router.get("/documents")
def get_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "file_path": d.file_path,
            "category": d.category,
            "summary": d.summary,
            "botpress_file_id": d.botpress_file_id,
            "status": d.status,
            "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None,
        }
        for d in docs
    ]


@router.delete("/documents/{doc_id}")
def delete_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = (
        db.query(Document)
        .filter(Document.id == doc_id, Document.user_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    botpress_deleted = False
    if doc.botpress_file_id:
        try:
            botpress_deleted = delete_file_from_botpress(doc.botpress_file_id)
        except Exception as exc:
            print(f"[Botpress] delete failed for {doc.botpress_file_id}: {exc}")

    if doc.file_path and os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    db.delete(doc)
    db.commit()

    return {
        "message": "Document deleted successfully",
        "document_id": doc_id,
        "botpress_deleted": botpress_deleted,
    }
