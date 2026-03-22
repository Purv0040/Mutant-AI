import os
import re
import uuid
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "").strip()
PINECONE_HOST = os.getenv("PINECONE_HOST", "").strip() or None
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "mutant-ai").strip()

_model = None
_index = None


def _id_safe_filename(filename: str) -> str:
    # Keep IDs readable and queryable by replacing uncommon characters.
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "_", filename or "document")
    return cleaned[:120]


def _vector_id_prefix(user_id: int, filename: str) -> str:
    return f"{user_id}:{_id_safe_filename(filename)}:"


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")  # 384 dim to match Pinecone index
    return _model


def get_index():
    global _index
    if _index is None:
        api_key = os.getenv("PINECONE_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("PINECONE_API_KEY is missing in backend/.env")

        pc = Pinecone(api_key=api_key)

        if PINECONE_HOST:
            _index = pc.Index(host=PINECONE_HOST)
        else:
            if not PINECONE_INDEX_NAME:
                raise RuntimeError("PINECONE_INDEX_NAME is missing in backend/.env")
            _index = pc.Index(PINECONE_INDEX_NAME)

    return _index


# 🔹 STORE DATA
def embed_and_store(chunks: List[Dict[str, Any]], user_id: int, filename: str):
    if not chunks:
        return 0

    model = get_model()
    index = get_index()

    texts = [c["text"] for c in chunks]
    vectors = model.encode(texts, normalize_embeddings=True)

    data = []
    prefix = _vector_id_prefix(user_id, filename)
    for i, vec in enumerate(vectors):
        data.append({
            "id": f"{prefix}{i:06d}:{uuid.uuid4().hex[:12]}",
            "values": vec.tolist(),
            "metadata": {
                "text": texts[i],
                "user_id": str(user_id),
                "filename": filename
            }
        })

    index.upsert(vectors=data)
    return len(data)


def delete_document_vectors(user_id: int, filename: str) -> bool:
    """Delete vectors for a previously indexed document to support safe re-uploads."""
    index = get_index()

    prefix = _vector_id_prefix(user_id, filename)
    ids_to_delete: List[str] = []

    try:
        for batch in index.list(prefix=prefix, limit=100):
            if not batch:
                continue
            ids_to_delete.extend(batch)
    except Exception as exc:
        print(f"Prefix list delete fallback due to error: {exc}")

    if ids_to_delete:
        for start in range(0, len(ids_to_delete), 1000):
            index.delete(ids=ids_to_delete[start:start + 1000])
        return True

    index.delete(filter={
        "user_id": {"$eq": str(user_id)},
        "filename": {"$eq": filename},
    })
    return True


def count_document_vectors(user_id: int, filename: str) -> int:
    """Count vectors for a document using ID prefix listing (Starter-compatible)."""
    index = get_index()
    prefix = _vector_id_prefix(user_id, filename)
    total = 0

    for batch in index.list(prefix=prefix, limit=100):
        if not batch:
            continue
        total += len(batch)

    return total


# 🔹 QUERY DATA
def query_documents(question: str, user_id: int, top_k: int = 5):
    model = get_model()
    index = get_index()

    query_vec = model.encode(question, normalize_embeddings=True).tolist()

    res = index.query(
        vector=query_vec,
        top_k=top_k,
        include_metadata=True,
        filter={"user_id": {"$eq": str(user_id)}}
    )

    return res.matches   # ✅ correct