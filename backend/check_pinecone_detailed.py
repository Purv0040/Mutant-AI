import os
from pathlib import Path
from dotenv import load_dotenv
from pinecone import Pinecone

# Load from backend/.env
load_dotenv(Path(__file__).resolve().parent / ".env")

def check_pinecone():
    api_key = os.getenv("PINECONE_API_KEY", "").strip()
    index_host = os.getenv("PINECONE_HOST", "").strip()
    
    if not api_key:
        print("❌ Error: PINECONE_API_KEY is missing in .env")
        return False
    
    if not index_host:
        print("❌ Error: PINECONE_HOST is missing in .env")
        return False

    try:
        pc = Pinecone(api_key=api_key)
        index = pc.Index(host=index_host)
        
        stats = index.describe_index_stats()
        print(f"✅ Connection successful!")
        print(f"Index Status: {stats}")
        print(f"Total Vectors: {stats.get('total_vector_count', 0)}")
        return True
    except Exception as e:
        print(f"❌ Error connecting to Pinecone: {e}")
        return False

if __name__ == "__main__":
    check_pinecone()
