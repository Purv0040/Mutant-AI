from typing import Any, Dict

from bson import ObjectId


VALID_ACCESS_MODES = {"All", "Engineering", "Product", "Marketing", "Design"}


def to_object_id(value: str):
    return ObjectId(value) if len(str(value)) == 24 else value


def normalize_access_mode(value: str) -> str:
    mode = (value or "All").strip()
    if not mode:
        return "All"
    if mode.lower() == "all departments":
        return "All"
    normalized = mode.title()
    return normalized if normalized in VALID_ACCESS_MODES else "All"


def normalize_department(value: str) -> str:
    dept = (value or "").strip()
    if not dept:
        return "General"
    normalized = dept.title()
    if normalized == "Engineer":
        return "Engineering"
    return normalized


def build_document_visibility_query(current_user: Dict[str, Any]) -> Dict[str, Any]:
    """Documents visible to caller: own docs + admin-shared docs for their department."""
    user_obj_id = to_object_id(current_user["user_id"])
    role = str(current_user.get("role") or "user").lower()
    department = normalize_department(current_user.get("department"))

    if role == "admin":
        return {}

    return {
        "$or": [
            {"user_id": user_obj_id},
            {"owner_role": "admin", "access_mode": {"$in": ["All", department]}},
            {"owner_role": "admin", "access_mode": {"$exists": False}},
        ]
    }