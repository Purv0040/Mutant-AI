import os
import uuid
from typing import Any, Dict, List

from dotenv import load_dotenv
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "").strip()
PINECONE_HOST = os.getenv("PINECONE_HOST", "").strip() or None
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "mutant-ai").strip()

_model = None
_index = None


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")  # 384 dim to match Pinecone index
    return _model


def get_index():
    global _index
    if _index is None:
        api_key = os.getenv("PINECONE_API_KEY", "********-****-****-****-************").strip()
        pc = Pinecone(api_key=api_key)
        _index = pc.Index("mutant-ai")

    return _index


# 🔹 STORE DATA
def embed_and_store(chunks: List[Dict[str, Any]], user_id: int, filename: str):
    model = get_model()
    index = get_index()

    texts = [c["text"] for c in chunks]
    vectors = model.encode(texts, normalize_embeddings=True)

    data = []
    for i, vec in enumerate(vectors):
        data.append({
            "id": f"{user_id}_{uuid.uuid4().hex}",
            "values": vec.tolist(),
            "metadata": {
                "text": texts[i],
                "user_id": str(user_id),
                "filename": filename
            }
        })

    index.upsert(vectors=data)
    return len(data)


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