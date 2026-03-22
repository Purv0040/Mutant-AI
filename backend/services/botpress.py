import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def _get_headers() -> dict:
    token = os.getenv("BOTPRESS_TOKEN", "").strip()
    bot_id = os.getenv("BOTPRESS_BOT_ID", "").strip()
    if not token or not bot_id:
        raise RuntimeError("BOTPRESS_TOKEN and BOTPRESS_BOT_ID must be set")
    return {
        "Authorization": f"Bearer {token}",
        "x-bot-id": bot_id,
    }


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


def upload_file_to_botpress(file_path: str, filename: str, user_id: int):
    headers = _get_headers()
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
    headers = _get_headers()
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

    headers = _get_headers()
    url = f"https://api.botpress.cloud/v1/files/{botpress_file_id}"
    response = requests.delete(url, headers=headers, timeout=30)
    return response.status_code in {200, 204}


def list_botpress_files():
    headers = _get_headers()
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


def query_botpress(question: str, user_id: str) -> dict:
    """
    Send a question to Botpress and get an answer from the knowledge base.
    Uses Botpress Conversation API.
    """
    headers = _get_headers()
    bot_id = os.getenv("BOTPRESS_BOT_ID", "").strip()
    
    if not bot_id:
        raise RuntimeError("BOTPRESS_BOT_ID is not set in environment variables")
    
    # Create conversation with bot ID in URL
    conversation_url = f"https://api.botpress.cloud/v1/bots/{bot_id}/conversations"
    conv_payload = {"userId": str(user_id)}
    
    try:
        conv_response = requests.post(conversation_url, headers=headers, json=conv_payload, timeout=30)
        conv_response.raise_for_status()
    except requests.exceptions.HTTPError as e:
        print(f"[Botpress] Conversation creation failed: {e}")
        print(f"[Botpress] URL: {conversation_url}")
        print(f"[Botpress] Response: {conv_response.text if conv_response else 'No response'}")
        raise RuntimeError(f"Failed to create Botpress conversation: {e}")
    
    conversation_data = conv_response.json()
    conversation_id = conversation_data.get("id") or conversation_data.get("conversationId")
    
    if not conversation_id:
        raise RuntimeError(f"Failed to create Botpress conversation: {conversation_data}")
    
    # Send message to conversation
    message_url = f"https://api.botpress.cloud/v1/bots/{bot_id}/conversations/{conversation_id}/messages"
    message_payload = {
        "payload": {
            "type": "text",
            "text": question
        }
    }
    
    try:
        msg_response = requests.post(message_url, headers=headers, json=message_payload, timeout=30)
        msg_response.raise_for_status()
    except requests.exceptions.HTTPError as e:
        print(f"[Botpress] Message send failed: {e}")
        raise
    
    # Poll for bot response
    bot_answer = _poll_for_response(conversation_id, bot_id, headers)
    
    return {
        "answer": bot_answer,
        "conversation_id": conversation_id,
        "sources": ["Botpress Knowledge Base"]
    }


def _poll_for_response(conversation_id: str, bot_id: str, headers: dict, max_attempts: int = 10) -> str:
    """Poll Botpress conversation for bot response."""
    messages_url = f"https://api.botpress.cloud/v1/bots/{bot_id}/conversations/{conversation_id}/messages"
    
    for attempt in range(max_attempts):
        time.sleep(1)  # Wait before polling
        
        try:
            response = requests.get(messages_url, headers=headers, timeout=30)
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            print(f"[Botpress] Poll attempt {attempt+1}/{max_attempts} failed: {e}")
            if attempt == max_attempts - 1:
                break
            continue
        
        messages = response.json()
        if isinstance(messages, dict):
            messages = messages.get("messages", [])
        
        # Get the last bot message
        for msg in reversed(messages):
            if msg.get("userId") != "bot_user":  # Bot message
                payload = msg.get("payload", {})
                if payload.get("type") == "text":
                    text = payload.get("text")
                    if text:
                        return text
        
        if attempt == max_attempts - 1:
            break
    
    return "I could not retrieve a response from Botpress at this time."
