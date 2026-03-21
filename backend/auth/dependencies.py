from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId

from auth.utils import decode_token
from database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

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
        "name": user["name"]
    }
