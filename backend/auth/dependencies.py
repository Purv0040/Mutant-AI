from fastapi import Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

from auth.utils import decode_token
from database import get_db
from services.access import normalize_department

bearer_scheme = HTTPBearer(auto_error=False)


def _resolve_current_user(token: str):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        payload = decode_token(token)
        user_id = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except Exception as exc:
        print(f"Token decode error: {exc}")
        raise credentials_exception from exc

    try:
        db = get_db()
        obj_id = ObjectId(user_id) if len(str(user_id)) == 24 else user_id
        user = db["users"].find_one({"_id": obj_id})
    except Exception as e:
        print(f"Database error: {e}")
        user = None

    if not user:
        raise credentials_exception

    return {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "role": str(user.get("role") or "user").lower(),
        "department": normalize_department(user.get("department")),
    }


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials if credentials else None
    return _resolve_current_user(token)


def get_current_user_for_preview(
    token: str | None = Query(default=None),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    token_value = credentials.credentials if credentials else token
    return _resolve_current_user(token_value)
