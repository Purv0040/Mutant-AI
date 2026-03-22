from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional

from auth.dependencies import get_current_user
from services.embedder import query_documents

router = APIRouter(prefix="/rag", tags=["rag"])

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=2)
    top_k: int = 5

class Source(BaseModel):
    filename: str
    text: str
    score: float

class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]

@router.post("/query", response_model=QueryResponse)
def rag_query(payload: QueryRequest, current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["user_id"]
        
        # 1. Retrieve relevant documents from Pinecone
        matches = query_documents(payload.query, user_id, top_k=payload.top_k)
        
        sources = []
        context_texts = []
        for match in matches:
            metadata = match.get("metadata", {})
            text = metadata.get("text", "")
            filename = metadata.get("filename", "unknown")
            sources.append(Source(
                filename=filename,
                text=text,
                score=match.get("score", 0.0)
            ))
            context_texts.append(f"[File: {filename}] {text}")
        
        # 2. For now, since we don't have a full LLM integration in this module yet, 
        # we'll return the matches or a simple combined string.
        # But we can call openrouter if it's available.
        # Let's check services/llm.py
        
        context = "\n\n".join(context_texts)
        if not context:
            return QueryResponse(
                answer="No relevant documents found. Please upload documents first.",
                sources=[]
            )
            
        return QueryResponse(
            answer=f"Found {len(sources)} results. (Context attached below)",
            sources=sources
        )
        
    except Exception as e:
        print(f"RAG Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        )
