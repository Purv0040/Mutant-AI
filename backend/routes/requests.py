import os
import shutil
from pathlib import Path
from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel
from typing import Optional

from auth.dependencies import get_current_user
from database import get_db

from services.botpress import upload_file_to_botpress
from services.access import normalize_access_mode, to_object_id
from services.embedder import embed_and_store
from services.parser import parse_file

router = APIRouter(prefix="/upload-requests", tags=["upload-requests"])

UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".csv", ".xlsx", ".pptx"}

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
    file: UploadFile = File(...),
    access_mode: str = Form("All"),
    department: str = Form(None),
    current_user: dict = Depends(get_current_user),
):
    """Any logged-in user can submit an upload request with a file."""
    db = get_db()
    
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, CSV, XLSX, and PPTX are supported")

    req_prefix = f"req_{current_user['user_id']}_{int(datetime.utcnow().timestamp())}"
    target_name = f"{req_prefix}_{Path(file.filename).name}"
    destination = UPLOAD_DIR / target_name

    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = 0
    if os.path.exists(destination):
        file_size = os.path.getsize(destination)

    doc = {
        "file_name": Path(file.filename).name,
        "file_size": file_size,
        "file_path": str(destination),
        "access_mode": access_mode,
        "department": department or current_user.get("department") or "General",
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
    req = db["upload_requests"].find_one({"_id": obj_id})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if payload.status == "Approved" and req.get("status") != "Approved":
        file_path = req.get("file_path")
        file_name = req.get("file_name")
        req_user_id = req.get("user_id")
        
        # Determine actual owner identifiers
        owner_user_id = str(req_user_id)
        owner_role = "user"
        owner_department = req.get("department", "General")
        normalized_access_mode = normalize_access_mode(req.get("access_mode", "All"))

        user_obj_id = to_object_id(req_user_id) if req_user_id else None

        if file_path and os.path.exists(file_path):
            chunks = parse_file(file_path, file_name)
            stored = 0
            if chunks:
                stored = embed_and_store(
                    chunks,
                    owner_user_id,
                    file_name,
                    metadata={
                        "access_mode": normalized_access_mode,
                        "owner_role": owner_role,
                        "owner_department": owner_department,
                    },
                )

            botpress_result = {"botpress_file_id": None, "botpress_status": "not_indexed"}
            try:
                botpress_result = upload_file_to_botpress(file_path, file_name, owner_user_id)
            except Exception as exc:
                print(f"[Botpress] upload failed for request: {exc}")

            from datetime import datetime
            
            # Delete older copies of the same file for this user
            if user_obj_id:
                db["documents"].delete_many({
                    "user_id": user_obj_id,
                    "filename": file_name,
                })

            doc = {
                "user_id": user_obj_id,
                "filename": file_name,
                "file_path": file_path,
                "chunks_stored": stored,
                "botpress_file_id": botpress_result.get("botpress_file_id"),
                "status": "indexed",
                "access_mode": normalized_access_mode,
                "owner_role": owner_role,
                "owner_department": owner_department,
                "uploaded_at": datetime.utcnow(),
                "category": None,
                "summary": None,
                "approved_by": current_user["user_id"]
            }
            db["documents"].insert_one(doc)

    result = db["upload_requests"].find_one_and_update(
        {"_id": obj_id},
        {"$set": {"status": payload.status}},
        return_document=True,
    )

    return _serialize(result)
