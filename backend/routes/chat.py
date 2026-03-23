"""
Chat Session Routes
────────────────────────────────────────────────────────────────────────────────
POST   /chat/sessions            – create or upsert a full session
GET    /chat/sessions            – list all sessions for current user
GET    /chat/sessions/{sess_id}  – get one session
DELETE /chat/sessions/{sess_id}  – delete one session
"""

from datetime import datetime, timezone
from typing import Any, List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from auth.dependencies import get_current_user
from database import get_db

router = APIRouter(prefix="/chat", tags=["chat"])


# ── Pydantic models ───────────────────────────────────────────────────────────

class ChatMessageModel(BaseModel):
    id: Any            # frontend-generated id (int or str)
    role: str          # "user" | "ai"
    text: str
    sources: Optional[List[str]] = []
    provider: Optional[str] = None


class UpsertSessionRequest(BaseModel):
    session_id: str            # frontend-generated session key
    title: Optional[str] = "New Chat"
    messages: List[ChatMessageModel] = []
    active_doc: Optional[Any] = None


class SessionResponse(BaseModel):
    session_id: str
    title: str
    messages: List[dict]
    active_doc: Optional[Any]
    created_at: str
    updated_at: str


def _to_session_response(doc: dict) -> dict:
    return {
        "session_id": doc["session_id"],
        "title":      doc.get("title", "New Chat"),
        "messages":   doc.get("messages", []),
        "active_doc": doc.get("active_doc"),
        "created_at": doc["created_at"].isoformat() if isinstance(doc.get("created_at"), datetime) else doc.get("created_at", ""),
        "updated_at": doc["updated_at"].isoformat() if isinstance(doc.get("updated_at"), datetime) else doc.get("updated_at", ""),
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/sessions", status_code=status.HTTP_200_OK)
def upsert_session(
    payload: UpsertSessionRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create or fully update a chat session for the authenticated user."""
    db        = get_db()
    user_id   = current_user["user_id"]
    now       = datetime.now(timezone.utc)
    col       = db["chat_sessions"]

    existing = col.find_one({"session_id": payload.session_id, "user_id": user_id})

    doc = {
        "session_id": payload.session_id,
        "user_id":    user_id,
        "title":      payload.title or "New Chat",
        "messages":   [m.model_dump() for m in payload.messages],
        "active_doc": payload.active_doc,
        "updated_at": now,
    }

    if existing:
        col.update_one(
            {"_id": existing["_id"]},
            {"$set": doc},
        )
        doc["created_at"] = existing.get("created_at", now)
    else:
        doc["created_at"] = now
        col.insert_one(doc)

    return _to_session_response(doc)


@router.get("/sessions", status_code=status.HTTP_200_OK)
def list_sessions(current_user: dict = Depends(get_current_user)):
    """Return all chat sessions for the authenticated user, newest first."""
    db      = get_db()
    user_id = current_user["user_id"]
    col     = db["chat_sessions"]

    cursor = col.find({"user_id": user_id}).sort("updated_at", -1).limit(50)
    return [_to_session_response(doc) for doc in cursor]


@router.get("/sessions/{session_id}", status_code=status.HTTP_200_OK)
def get_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Return a single session by its frontend session_id."""
    db      = get_db()
    user_id = current_user["user_id"]
    col     = db["chat_sessions"]

    doc = col.find_one({"session_id": session_id, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")
    return _to_session_response(doc)


@router.delete("/sessions/{session_id}", status_code=status.HTTP_200_OK)
def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a single session."""
    db      = get_db()
    user_id = current_user["user_id"]
    col     = db["chat_sessions"]

    result = col.delete_one({"session_id": session_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"deleted": True, "session_id": session_id}
