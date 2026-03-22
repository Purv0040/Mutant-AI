from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from auth.dependencies import get_current_user
from database import get_db
from services.botpress import query_botpress

router = APIRouter(tags=["ai"])


class AskRequest(BaseModel):
    question: str = Field(min_length=2)
    top_k: int = 5


@router.post("/ask")
def ask_question(payload: AskRequest, current_user: dict = Depends(get_current_user)):
    try:
        # Query Botpress directly for answer
        botpress_result = query_botpress(payload.question, current_user["user_id"])
        
        return {
            "answer": botpress_result["answer"],
            "sources": botpress_result["sources"],
            "conversation_id": botpress_result["conversation_id"],
            "provider": "botpress"
        }
    except Exception as e:
        print(f"Ask error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
