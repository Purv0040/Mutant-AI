import json

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database import get_db
from models import Document, User
from services.llm import get_fast_llm
from services.parser import parse_file

router = APIRouter(tags=["ai"])


class CategorizeRequest(BaseModel):
    filename: str = Field(min_length=1)


@router.post("/categorize")
def categorize_document(
    payload: CategorizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = (
        db.query(Document)
        .filter(Document.user_id == current_user.id, Document.filename == payload.filename)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    chunks = parse_file(doc.file_path, doc.filename)
    sample = "\n".join(chunk.get("text", "") for chunk in chunks)[:3000]

    llm = get_fast_llm()
    prompt = (
        "Classify this document into one of: Finance, HR, Legal, Management, IT. "
        "Return JSON only with keys: category, confidence, document_type, extracted_fields. "
        "extracted_fields must be an array of short strings.\n\n"
        f"Document sample:\n{sample}"
    )

    raw = llm.invoke(prompt)
    text = getattr(raw, "content", str(raw)).strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        parsed = {
            "category": "Management",
            "confidence": 0.5,
            "document_type": "unknown",
            "extracted_fields": [],
        }

    doc.category = parsed.get("category", "Management")
    doc.status = "categorized"
    db.commit()

    return parsed
