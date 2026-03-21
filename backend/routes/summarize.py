import json

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from langchain.chains.summarize import load_summarize_chain
from langchain.schema import Document as LangDocument

from auth.dependencies import get_current_user
from database import get_db
from models import Document, User
from services.llm import get_smart_llm
from services.parser import parse_file

router = APIRouter(tags=["ai"])


class SummarizeRequest(BaseModel):
    filename: str = Field(min_length=1)


@router.post("/summarize")
def summarize_document(
    payload: SummarizeRequest,
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

    if doc.summary:
        try:
            cached = json.loads(doc.summary)
            return cached
        except json.JSONDecodeError:
            pass

    chunks = parse_file(doc.file_path, doc.filename)
    if not chunks:
        raise HTTPException(status_code=400, detail="No readable text found in document")

    lc_docs = [LangDocument(page_content=chunk["text"]) for chunk in chunks]
    llm = get_smart_llm()
    chain = load_summarize_chain(llm, chain_type="map_reduce")
    summary = chain.run(lc_docs)

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

    page_count = max(int(chunk.get("page", 1)) for chunk in chunks)
    result = {"summary": summary, "findings": findings, "page_count": page_count}

    doc.summary = json.dumps(result)
    doc.status = "summarized"
    db.commit()

    return result
