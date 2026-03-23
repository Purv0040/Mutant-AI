from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status

from auth.dependencies import get_current_user
from services.access import normalize_department
from services.embedder import query_documents
from services.llm import call_openrouter

router = APIRouter(tags=["ai"])


class AskRequest(BaseModel):
    question: str = Field(min_length=2)
    top_k: int = 5


@router.post("/ask")
def ask_question(payload: AskRequest, current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["user_id"]
        role = str(current_user.get("role") or "user").lower()
        department = normalize_department(current_user.get("department"))
        print(f"[Ask] user={user_id} question={payload.question[:60]}")

        if role == "admin":
            pinecone_filter = None
        else:
            pinecone_filter = {
                "$or": [
                    {"user_id": str(user_id)},
                    {"owner_role": "admin", "access_mode": {"$in": ["All", department]}},
                    {"owner_role": "admin", "access_mode": {"$exists": False}},
                ]
            }

        # ── 1. Retrieve relevant chunks from Pinecone ──────────────────────────
        try:
            matches = query_documents(
                payload.question,
                user_id,
                top_k=payload.top_k,
                metadata_filter=pinecone_filter,
            )
        except Exception as e:
            print(f"[Ask] Pinecone error: {e}")
            matches = []

        if not matches:
            return {
                "answer": (
                    "I couldn't find any relevant information in your uploaded documents. "
                    "Please upload a document first and then ask a question about it."
                ),
                "sources": [],
                "provider": "pinecone+openrouter",
            }

        # ── 2. Build context from top matches ─────────────────────────────────
        context_parts = []
        sources = []
        seen_files = set()

        for match in matches:
            meta = match.get("metadata", {})
            text = meta.get("text", "").strip()
            filename = meta.get("filename", "unknown")
            score = match.get("score", 0.0)

            if text:
                context_parts.append(f"[Source: {filename}]\n{text}")

            if filename not in seen_files:
                sources.append({"filename": filename, "score": round(score, 4)})
                seen_files.add(filename)

        context = "\n\n---\n\n".join(context_parts)

        # ── 3. Ask the LLM with context ───────────────────────────────────────
        system_prompt = (
            "You are a helpful AI assistant. Answer questions strictly based on the "
            "provided document context. If the answer is not in the context, say so honestly. "
            "Always cite the source filename when referencing information."
        )

        user_prompt = (
            f"Context from uploaded documents:\n\n{context}\n\n"
            f"Question: {payload.question}\n\n"
            "Answer based only on the context above:"
        )

        try:
            answer = call_openrouter(system_prompt, user_prompt)
        except Exception as llm_err:
            print(f"[Ask] LLM error: {llm_err}")
            # Display a much cleaner and concise snippet list when the model completely fails
            snippets = []
            for s in sources:
                matching_text = next((m.get("metadata", {}).get("text", "").strip() 
                                      for m in matches 
                                      if m.get("metadata", {}).get("filename") == s["filename"]), "")
                if matching_text:
                    snippet = matching_text[:120].replace('\n', ' ') + "..."
                    snippets.append(f"• **{s['filename']}**: {snippet}")
            
            answer = (
                "**Smart Fallback**\n\nThe AI analysis engine is currently handling high traffic. "
                "However, I was able to find the following exact matches across your documents:\n\n" + 
                "\n".join(snippets)
            )

        return {
            "answer": answer,
            "sources": sources,
            "provider": "pinecone+openrouter",
        }

    except Exception as e:
        print(f"[Ask] Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )

