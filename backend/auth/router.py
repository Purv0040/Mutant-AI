from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
import re

from auth.utils import create_access_token, hash_password, verify_password
from auth.dependencies import get_current_user
from database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)


@router.post("/register")
def register(payload: RegisterRequest):
    try:
        db = get_db()
        normalized_email = payload.email.strip().lower()
        
        # Check if email already exists
        existing = db["users"].find_one({
            "email": {
                "$regex": f"^{re.escape(normalized_email)}$",
                "$options": "i",
            }
        })
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        # Create new user document
        user_doc = {
            "name": payload.name,
            "email": normalized_email,
            "hashed_password": hash_password(payload.password),
            "created_at": datetime.utcnow()
        }
        
        result = db["users"].insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Create access token
        token = create_access_token({"sub": normalized_email, "user_id": user_id, "username": payload.name})
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "name": payload.name,
                "email": normalized_email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Register error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/login")
def login(payload: LoginRequest):
    try:
        db = get_db()
        normalized_email = payload.email.strip().lower()
        
        # Find user by email (case-insensitive) so older mixed-case records still work.
        user = db["users"].find_one({
            "email": {
                "$regex": f"^{re.escape(normalized_email)}$",
                "$options": "i",
            }
        })
        if not user or not verify_password(payload.password, user["hashed_password"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        user_id = str(user["_id"])
        
        # Create access token
        token = create_access_token({"sub": user["email"], "user_id": user_id, "username": user["name"]})
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "name": user["name"],
                "email": user["email"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/change-password")
def change_password(payload: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    """POST - Change the authenticated user's password"""
    try:
        db = get_db()
        user_id = ObjectId(current_user["user_id"]) if len(str(current_user["user_id"])) == 24 else current_user["user_id"]

        user = db["users"].find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if not verify_password(payload.current_password, user["hashed_password"]):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

        db["users"].update_one(
            {"_id": user_id},
            {"$set": {
                "hashed_password": hash_password(payload.new_password),
                "password_changed_at": datetime.utcnow()
            }}
        )

        return {"message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Change password error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    """GET - Read user profile information"""
    try:
        db = get_db()
        user_id = ObjectId(current_user["user_id"]) if len(str(current_user["user_id"])) == 24 else current_user["user_id"]
        
        user = db["users"].find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "created_at": user.get("created_at").isoformat() if user.get("created_at") else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get profile error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/profile")
def update_profile(payload: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    """PUT - Update user profile information"""
    try:
        db = get_db()
        user_id = ObjectId(current_user["user_id"]) if len(str(current_user["user_id"])) == 24 else current_user["user_id"]
        normalized_email = payload.email.strip().lower()
        
        # Check if new email is already taken by another user
        if normalized_email != str(current_user["email"]).strip().lower():
            existing = db["users"].find_one({
                "email": {
                    "$regex": f"^{re.escape(normalized_email)}$",
                    "$options": "i",
                },
                "_id": {"$ne": user_id}
            })
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")
        
        # Update user document
        db["users"].update_one(
            {"_id": user_id},
            {"$set": {
                "name": payload.name,
                "email": normalized_email,
                "updated_at": datetime.utcnow()
            }}
        )
        
        # Fetch updated user
        user = db["users"].find_one({"_id": user_id})
        
        # Create new token with updated info
        token = create_access_token({
            "sub": normalized_email,
            "user_id": str(user_id),
            "username": payload.name
        })
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"]
            },
            "message": "Profile updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update profile error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/profile")
def delete_profile(current_user: dict = Depends(get_current_user)):
    """DELETE - Delete user account and all associated data"""
    try:
        db = get_db()
        user_id = ObjectId(current_user["user_id"]) if len(str(current_user["user_id"])) == 24 else current_user["user_id"]
        
        # Delete all user documents from storage
        documents = db["documents"].find({"user_id": user_id})
        for doc in documents:
            if doc.get("file_path"):
                import os
                try:
                    if os.path.exists(doc["file_path"]):
                        os.remove(doc["file_path"])
                except:
                    pass
        
        # Delete all user documents from database
        db["documents"].delete_many({"user_id": user_id})
        
        # Delete user account
        db["users"].delete_one({"_id": user_id})
        
        return {
            "message": "Account deleted successfully",
            "detail": "All your data has been removed"
        }
    except Exception as e:
        print(f"Delete profile error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

