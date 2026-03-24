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

        # ── Detect if user is asking about a specific filename ─────────────────
        import re
        filename_match = re.search(r'"([^"]+\.\w+)"', payload.question)
        mentioned_filename = filename_match.group(1) if filename_match else None

        # If a specific file is mentioned, add filename filter to search within it
        if mentioned_filename:
            filename_filter = {"filename": mentioned_filename}
            if pinecone_filter is not None:
                # Combine access filter with filename filter
                pinecone_filter = {"$and": [pinecone_filter, filename_filter]}
            else:
                pinecone_filter = filename_filter
            print(f"[Ask] Filtering Pinecone for filename: {mentioned_filename}")

        # ── 1. Retrieve relevant chunks from Pinecone ──────────────────────────
        try:
            matches = query_documents(
                payload.question,
                user_id,
                top_k=8,  # fetch more chunks when searching specific file
                metadata_filter=pinecone_filter,
            )
        except Exception as e:
            print(f"[Ask] Pinecone error: {e}")
            matches = []

        # If filename-specific search found nothing, retry without filename filter
        if not matches and mentioned_filename:
            print(f"[Ask] No results for filename filter, retrying without it.")
            try:
                base_filter = None if role == "admin" else {
                    "$or": [
                        {"user_id": str(user_id)},
                        {"owner_role": "admin", "access_mode": {"$in": ["All", department]}},
                        {"owner_role": "admin", "access_mode": {"$exists": False}},
                    ]
                }
                matches = query_documents(payload.question, user_id, top_k=15, metadata_filter=base_filter)
            except Exception as e:
                print(f"[Ask] Pinecone retry error: {e}")
                matches = []

        if not matches:
            return {
                "answer": (
                    f"I could not find any content from \"{mentioned_filename}\" in the indexed documents. "
                    "Please make sure the file has been uploaded and indexed successfully."
                ) if mentioned_filename else (
                    "I couldn't find any relevant information in your uploaded documents. "
                    "Please upload a document first and then ask a question about it."
                ),
                "sources": [],
                "provider": "pinecone+openrouter",
            }

        # ── 2. Build context — keyword re-rank to find best-matching doc ────────
        # Extract keywords from question for re-ranking
        question_words = set(payload.question.lower().split())
        stop_words = {'what', 'is', 'are', 'a', 'an', 'the', 'in', 'of', 'to', 'and', 'or', 'how', 'why', 'when', 'where', 'tell', 'me', 'about', 'give', 'please'}
        keywords = question_words - stop_words

        def keyword_score(match):
            text = (match.get("metadata", {}).get("text", "") + " " + match.get("metadata", {}).get("filename", "")).lower()
            return sum(1 for kw in keywords if kw in text)

        # Re-rank: sort by keyword hits first, then by Pinecone semantic score
        matches_sorted = sorted(matches, key=lambda m: (keyword_score(m), m.get("score", 0)), reverse=True)

        context_parts = []
        sources = []
        seen_files = set()

        for match in matches_sorted:
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
            "You are a helpful and knowledgeable AI assistant connected to a company document system. "
            "You have access to document excerpts retrieved from the user's uploaded files. "
            "Your rules:\n"
            "1. Read ALL the document context carefully. If ANY part is relevant to the question, use it to answer.\n"
            "2. If the context clearly answers the question, cite the source filename in your answer.\n"
            "3. If the context is NOT relevant at all, answer using your general knowledge without mentioning the documents.\n"
            "4. NEVER say 'I am sorry', 'I apologize', or 'the document does not contain'. Always give a useful answer.\n"
            "5. Answer in a clear, well-structured, and informative way."
        )

        user_prompt = (
            f"Retrieved document context:\n\n{context}\n\n"
            f"User question: {payload.question}\n\n"
            "Give a complete and helpful answer:"
        )

        try:
            answer = call_openrouter(system_prompt, user_prompt)
            # Filter sources to only include files that the AI actually cited in its response
            used_sources = [s for s in sources if str(s["filename"]) in answer]
            # If the AI failed to explicitly cite, fallback to picking the highest scoring source
            if not used_sources and sources:
                used_sources = [sources[0]]
            sources = used_sources
            
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

