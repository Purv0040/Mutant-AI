import os
import uuid
from typing import Any, Dict, List

from dotenv import load_dotenv
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_HOST = os.getenv("PINECONE_HOST", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "mutant-ai")

_model: SentenceTransformer | None = None
_index = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def _get_index():
    global _index
    if _index is None:
        if not PINECONE_API_KEY:
            raise RuntimeError("PINECONE_API_KEY is not configured")
        client = Pinecone(api_key=PINECONE_API_KEY)
        if PINECONE_HOST:
            _index = client.Index(host=PINECONE_HOST)
        else:
            _index = client.Index(PINECONE_INDEX_NAME)
    return _index


def embed_and_store(chunks: List[Dict[str, Any]], user_id: int, filename: str) -> int:
    if not chunks:
        return 0

    model = _get_model()
    index = _get_index()

    texts = [str(item.get("text", "")) for item in chunks]
    vectors = model.encode(texts, normalize_embeddings=True)

    payload = []
    for i, vec in enumerate(vectors):
        item = chunks[i]
        payload.append(
            {
                "id": f"{user_id}:{filename}:{uuid.uuid4().hex}",
                "values": vec.tolist(),
                "metadata": {
                    "text": str(item.get("text", "")),
                    "source": str(item.get("source", filename)),
                    "page": int(item.get("page", 1)),
                    "user_id": str(user_id),
                    "filename": filename,
                },
            }
        )

    index.upsert(vectors=payload)
    return len(payload)


def query_documents(question: str, user_id: int, top_k: int = 5) -> List[Dict[str, Any]]:
    model = _get_model()
    index = _get_index()

    vector = model.encode(question, normalize_embeddings=True).tolist()
    response = index.query(
        vector=vector,
        top_k=top_k,
        include_metadata=True,
        filter={"user_id": {"$eq": str(user_id)}},
    )
    return response.get("matches", [])
