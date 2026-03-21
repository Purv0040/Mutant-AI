import os
import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database import get_db
from models import Document, User
from services.embedder import embed_and_store
from services.parser import parse_file

router = APIRouter(tags=["documents"])

ALLOWED_EXTENSIONS = {".pdf", ".pptx", ".xlsx"}
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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF, PPTX, and XLSX are supported")

    user_prefix = f"u{current_user.id}"
    target_name = f"{user_prefix}_{Path(file.filename).name}"
    destination = UPLOAD_DIR / target_name

    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    chunks = parse_file(str(destination), Path(file.filename).name)
    stored = embed_and_store(chunks, current_user.id, Path(file.filename).name)

    doc = Document(
        user_id=current_user.id,
        filename=Path(file.filename).name,
        file_path=str(destination),
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
            "status": d.status,
            "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None,
        }
        for d in docs
    ]
