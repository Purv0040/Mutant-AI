from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends

from auth.dependencies import get_current_user
from models import User
from services.embedder import query_documents
from services.llm import get_fast_llm

router = APIRouter(tags=["ai"])


class AskRequest(BaseModel):
    question: str = Field(min_length=2)
    top_k: int = 5


@router.post("/ask")
def ask_question(payload: AskRequest, current_user: User = Depends(get_current_user)):
    matches = query_documents(payload.question, current_user.id, top_k=payload.top_k)

    source_details = []
    context_blocks = []
    for m in matches:
        meta = m.get("metadata", {}) if isinstance(m, dict) else {}
        filename = meta.get("filename") or meta.get("source") or "unknown"
        page = meta.get("page", 1)
        text = meta.get("text", "")
        source_details.append({"filename": filename, "page": page})
        context_blocks.append(f"[Source: {filename} | Page: {page}]\n{text}")

    llm = get_fast_llm()
    prompt = (
        "You are a strict company knowledge assistant. Answer only from the provided context. "
        "If answer is missing, say you do not have enough document evidence. "
        "Always cite source labels with filename and page.\n\n"
        f"Question: {payload.question}\n\n"
        "Context:\n"
        + "\n\n".join(context_blocks)
    )

    response = llm.invoke(prompt)
    answer = getattr(response, "content", str(response))

    sources = [f"{s['filename']} (p.{s['page']})" for s in source_details]
    dedup_sources = list(dict.fromkeys(sources))
    dedup_source_details = [dict(t) for t in {tuple(sorted(item.items())) for item in source_details}]

    return {
        "answer": answer,
        "sources": dedup_sources,
        "source_details": dedup_source_details,
    }
