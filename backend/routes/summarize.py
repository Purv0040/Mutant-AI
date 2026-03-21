import json
from bson import ObjectId

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status

from auth.dependencies import get_current_user
from database import get_db
from services.llm import get_smart_llm
from services.parser import parse_file

router = APIRouter(tags=["ai"])


class SummarizeRequest(BaseModel):
    filename: str = Field(min_length=1)


@router.post("/summarize")
def summarize_document(
    payload: SummarizeRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        db = get_db()
        user_id = ObjectId(current_user["user_id"]) if len(str(current_user["user_id"])) == 24 else current_user["user_id"]
        
        doc = db["documents"].find_one({
            "user_id": user_id,
            "filename": payload.filename
        })
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        if doc.get("summary"):
            try:
                cached = json.loads(doc["summary"])
                return cached
            except json.JSONDecodeError:
                pass

        chunks = parse_file(doc["file_path"], doc["filename"])
        if not chunks:
            raise HTTPException(status_code=400, detail="No readable text found in document")

        llm = get_smart_llm()
        combined_text = "\n\n".join(chunk.get("text", "") for chunk in chunks)
        summary_prompt = (
            "Summarize the following document content in concise, clear business language. "
            "Include the main objective, key decisions or policy points, and important numbers if present.\n\n"
            f"Content:\n{combined_text[:15000]}"
        )
        summary_raw = llm.invoke(summary_prompt)
        summary = getattr(summary_raw, "content", str(summary_raw)).strip()

        findings_prompt = (
            "From this summary, produce exactly 4 key findings as JSON array. "
            "Each item must contain: text and type. "
            "Allowed type values: positive, neutral, warning, risk.\n\n"
            f"Summary:\n{summary}"
        )
        findings_raw = llm.invoke(findings_prompt)
        findings_text = getattr(findings_raw, "content", str(findings_raw)).strip()

        try:
            findings = json.loads(findings_text)
            if not isinstance(findings, list):
                findings = []
        except json.JSONDecodeError:
            findings = []

        if len(findings) < 4:
            findings.extend(
                [
                    {"text": "Summary generated successfully.", "type": "neutral"},
                    {"text": "Review full source for nuanced details.", "type": "warning"},
                    {"text": "Cross-check with latest internal updates.", "type": "risk"},
                    {"text": "Potential opportunities identified.", "type": "positive"},
                ]
            )
            findings = findings[:4]

        try:
            page_count = max(int(chunk.get("page", 1)) for chunk in chunks) if chunks else 1
        except (ValueError, TypeError):
            page_count = 1
        
        result = {"summary": summary, "findings": findings, "page_count": page_count}

        # Update document in MongoDB
        db["documents"].update_one(
            {"_id": doc["_id"]},
            {"$set": {
                "summary": json.dumps(result),
                "status": "summarized"
            }}
        )

        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Summarize error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
