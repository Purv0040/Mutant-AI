import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# ─────────────────────────── helpers ──────────────────────────────────────────

def _get_mgmt_headers() -> dict:
    """Headers for the Management/Files API (api.botpress.cloud)."""
    token = os.getenv("BOTPRESS_TOKEN", "").strip()
    bot_id = os.getenv("BOTPRESS_BOT_ID", "").strip()
    if not token or not bot_id:
        raise RuntimeError("BOTPRESS_TOKEN and BOTPRESS_BOT_ID must be set")
    return {
        "Authorization": f"Bearer {token}",
        "x-bot-id": bot_id,
    }

# Keep old name as alias for callers that use _get_headers
_get_headers = _get_mgmt_headers


def _get_chat_base() -> str:
    """Base URL for the Botpress Chat API (chat.botpress.cloud/{botId})."""
    bot_id = os.getenv("BOTPRESS_BOT_ID", "").strip()
    if not bot_id:
        raise RuntimeError("BOTPRESS_BOT_ID must be set")
    return f"https://chat.botpress.cloud/{bot_id}"


def _extract_file_id(payload: dict) -> str | None:
    if not isinstance(payload, dict):
        return None

    candidates = [
        payload.get("id"),
        payload.get("fileId"),
        (payload.get("file") or {}).get("id") if isinstance(payload.get("file"), dict) else None,
        (payload.get("data") or {}).get("id") if isinstance(payload.get("data"), dict) else None,
        (payload.get("data") or {}).get("fileId") if isinstance(payload.get("data"), dict) else None,
    ]
    return next((item for item in candidates if item), None)


def _extract_status(payload: dict) -> str | None:
    if not isinstance(payload, dict):
        return None

    candidates = [
        payload.get("status"),
        (payload.get("file") or {}).get("status") if isinstance(payload.get("file"), dict) else None,
        (payload.get("data") or {}).get("status") if isinstance(payload.get("data"), dict) else None,
    ]
    return next((item for item in candidates if item), None)

# ─────────────────────────── file management ──────────────────────────────────

def upload_file_to_botpress(file_path: str, filename: str, user_id: int):
    headers = _get_mgmt_headers()
    url = "https://api.botpress.cloud/v1/files"

    with open(file_path, "rb") as file_stream:
        files = {"file": (filename, file_stream)}
        data = {"index": "true", "user_id": str(user_id)}
        response = requests.post(url, headers=headers, files=files, data=data, timeout=60)

    response.raise_for_status()
    payload = response.json()
    file_id = _extract_file_id(payload)
    if not file_id:
        raise RuntimeError("Botpress upload succeeded but no file id was returned")

    indexing_status = _poll_indexing(file_id)
    return {
        "botpress_file_id": file_id,
        "botpress_status": indexing_status,
    }


def _poll_indexing(file_id: str):
    headers = _get_mgmt_headers()
    url = f"https://api.botpress.cloud/v1/files/{file_id}"

    last_status = "indexing_in_progress"
    for attempt in range(1, 13):
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        payload = response.json()
        status = _extract_status(payload) or "indexing_in_progress"
        last_status = status

        print(f"[Botpress] file {file_id} indexing attempt {attempt}/12 status={status}")

        if status in {"indexing_completed", "indexing_failed"}:
            break

        time.sleep(5)

    return last_status


def delete_file_from_botpress(botpress_file_id: str):
    if not botpress_file_id:
        return False

    headers = _get_mgmt_headers()
    url = f"https://api.botpress.cloud/v1/files/{botpress_file_id}"
    response = requests.delete(url, headers=headers, timeout=30)
    return response.status_code in {200, 204}


def list_botpress_files():
    headers = _get_mgmt_headers()
    url = "https://api.botpress.cloud/v1/files"
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()

    payload = response.json()
    if isinstance(payload, dict):
        files = payload.get("files")
        if isinstance(files, list):
            return files
        data = payload.get("data")
        if isinstance(data, list):
            return data
    if isinstance(payload, list):
        return payload
    return []

# ─────────────────────────── chat / Q&A ───────────────────────────────────────

def query_botpress(question: str, user_id: str) -> dict:
    """
    Send a question to Botpress and get an answer using the Chat API.
    Endpoint: https://chat.botpress.cloud/{botId}/...
    """
    base = _get_chat_base()

    # 1. Create an anonymous user
    try:
        user_resp = requests.post(f"{base}/users", json={}, timeout=30)
        user_resp.raise_for_status()
        user_data = user_resp.json()
        bp_user_id = user_data.get("user", user_data).get("id") or user_data.get("id")
        bp_user_key = (
            user_data.get("key")  # top-level key
            or (user_data.get("user") or {}).get("key")
        )
    except Exception as e:
        print(f"[Botpress Chat] User creation failed: {e}")
        raise RuntimeError(f"Failed to create Botpress user: {e}")

    # Build auth header for the chat session
    chat_headers: dict = {}
    if bp_user_key:
        chat_headers["x-user-key"] = bp_user_key

    # 2. Create a conversation
    try:
        conv_resp = requests.post(
            f"{base}/conversations",
            headers=chat_headers,
            json={},
            timeout=30,
        )
        conv_resp.raise_for_status()
        conv_data = conv_resp.json()
        conversation_id = (
            (conv_data.get("conversation") or conv_data).get("id")
            or conv_data.get("id")
        )
    except Exception as e:
        print(f"[Botpress Chat] Conversation creation failed: {e}")
        raise RuntimeError(f"Failed to create Botpress conversation: {e}")

    # 3. Send message
    try:
        msg_resp = requests.post(
            f"{base}/conversations/{conversation_id}/messages",
            headers=chat_headers,
            json={"payload": {"type": "text", "text": question}},
            timeout=30,
        )
        msg_resp.raise_for_status()
    except Exception as e:
        print(f"[Botpress Chat] Message send failed: {e}")
        raise RuntimeError(f"Failed to send message to Botpress: {e}")

    # 4. Poll for bot response
    bot_answer = _poll_for_chat_response(
        base, conversation_id, chat_headers, question
    )

    return {
        "answer": bot_answer,
        "conversation_id": conversation_id,
        "sources": ["Botpress Knowledge Base"],
    }


def _poll_for_chat_response(
    base: str,
    conversation_id: str,
    chat_headers: dict,
    user_question: str,
    max_attempts: int = 15,
) -> str:
    """Poll until a bot (non-user) text message appears in the conversation."""
    url = f"{base}/conversations/{conversation_id}/messages"

    for attempt in range(max_attempts):
        time.sleep(2)

        try:
            resp = requests.get(url, headers=chat_headers, timeout=30)
            resp.raise_for_status()
        except Exception as e:
            print(f"[Botpress Chat] Poll attempt {attempt + 1}/{max_attempts} failed: {e}")
            continue

        data = resp.json()
        messages = data.get("messages", [])

        # Bot messages have direction == "incoming" or no userId / different type.
        # We skip the user's own question and return the first bot text message.
        for msg in reversed(messages):
            direction = msg.get("direction")
            payload = msg.get("payload", {})
            text = payload.get("text", "").strip()

            if not text:
                continue

            # If direction is explicitly "incoming" → bot reply
            if direction == "incoming":
                return text

            # Fallback: if the text is NOT the user's question, it's likely the bot
            if text.lower() != user_question.strip().lower():
                return text

    return "I could not retrieve a response from Botpress at this time."
