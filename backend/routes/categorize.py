import json

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status

from auth.dependencies import get_current_user
from database import get_db
from services.access import build_document_visibility_query
from services.llm import get_fast_llm
from services.parser import parse_file

router = APIRouter(tags=["ai"])


class CategorizeRequest(BaseModel):
    filename: str = Field(min_length=1)


@router.post("/categorize")
def categorize_document(
    payload: CategorizeRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        db = get_db()
        visibility_query = build_document_visibility_query(current_user)
        doc = db["documents"].find_one({
            **visibility_query,
            "filename": payload.filename,
        })
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        chunks = parse_file(doc["file_path"], doc["filename"])
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

        # Update document in MongoDB
        db["documents"].update_one(
            {"_id": doc["_id"]},
            {"$set": {
                "category": parsed.get("category", "Management"),
                "status": "categorized"
            }}
        )

        return parsed
    except HTTPException:
        raise
    except Exception as e:
        print(f"Categorize error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
