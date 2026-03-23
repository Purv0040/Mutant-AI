from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional

from auth.dependencies import get_current_user
from database import get_db

router = APIRouter(prefix="/upload-requests", tags=["upload-requests"])


class CreateUploadRequestPayload(BaseModel):
    file_name: str
    file_size: Optional[int] = None
    access_mode: str = "All"
    department: Optional[str] = None


class UpdateUploadRequestPayload(BaseModel):
    status: str  # "Approved" or "Rejected"


def _serialize(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "fileName": doc.get("file_name", ""),
        "fileSize": doc.get("file_size"),
        "accessMode": doc.get("access_mode", "All"),
        "department": doc.get("department", "General"),
        "requestedBy": doc.get("requested_by", ""),
        "requestedByEmail": doc.get("requested_by_email", ""),
        "status": doc.get("status", "Pending"),
        "date": doc["date"].isoformat() if doc.get("date") else None,
    }


@router.post("", status_code=201)
def create_upload_request(
    payload: CreateUploadRequestPayload,
    current_user: dict = Depends(get_current_user),
):
    """Any logged-in user can submit an upload request."""
    db = get_db()
    doc = {
        "file_name": payload.file_name,
        "file_size": payload.file_size,
        "access_mode": payload.access_mode,
        "department": payload.department or current_user.get("department") or "General",
        "requested_by": current_user.get("name", ""),
        "requested_by_email": current_user.get("email", ""),
        "user_id": current_user["user_id"],
        "status": "Pending",
        "date": datetime.utcnow(),
    }
    result = db["upload_requests"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


@router.get("")
def list_upload_requests(current_user: dict = Depends(get_current_user)):
    """Admin sees all requests; regular users see only their own."""
    db = get_db()
    role = str(current_user.get("role") or "user").lower()

    if role == "admin":
        docs = list(db["upload_requests"].find().sort("date", -1))
    else:
        docs = list(
            db["upload_requests"]
            .find({"user_id": current_user["user_id"]})
            .sort("date", -1)
        )

    return [_serialize(d) for d in docs]


@router.patch("/{request_id}")
def update_upload_request(
    request_id: str,
    payload: UpdateUploadRequestPayload,
    current_user: dict = Depends(get_current_user),
):
    """Only admin can approve or reject requests."""
    role = str(current_user.get("role") or "user").lower()
    if role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    if payload.status not in ("Approved", "Rejected"):
        raise HTTPException(status_code=400, detail="status must be 'Approved' or 'Rejected'")

    try:
        obj_id = ObjectId(request_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid request ID")

    db = get_db()
    result = db["upload_requests"].find_one_and_update(
        {"_id": obj_id},
        {"$set": {"status": payload.status}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Request not found")

    return _serialize(result)
