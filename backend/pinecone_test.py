import os
from pathlib import Path
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv(Path(__file__).resolve().parent / ".env")

def test_connection():
    api_key = os.getenv("PINECONE_API_KEY", "").strip()
    index_name = os.getenv("PINECONE_INDEX_NAME", "").strip()
    host = os.getenv("PINECONE_HOST", "").strip()

    if not api_key:
        raise RuntimeError("PINECONE_API_KEY is missing in backend/.env")

    pc = Pinecone(api_key=api_key)

    if host:
        index = pc.Index(host=host)
    else:
        if not index_name:
            raise RuntimeError("PINECONE_INDEX_NAME is missing in backend/.env")
        index = pc.Index(index_name)

    stats = index.describe_index_stats()
    print("✅ Connected!")
    print(stats)


if __name__ == "__main__":
    test_connection()