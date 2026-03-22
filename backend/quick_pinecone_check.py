import os
from pathlib import Path
from dotenv import load_dotenv
from pinecone import Pinecone

# Load from backend/.env
load_dotenv(Path(__file__).resolve().parent / ".env")

def search_test():
    api_key = os.getenv("PINECONE_API_KEY", "").strip()
    index_host = os.getenv("PINECONE_HOST", "").strip()
    
    if not api_key or not index_host:
        print("❌ Missing Pinecone credentials")
        return

    try:
        pc = Pinecone(api_key=api_key)
        index = pc.Index(host=index_host)
        
        # Search with a dummy vector of 384 dimensions (default for sentence-transformers)
        # Actually I'll check the dimension of the index first
        stats = index.describe_index_stats()
        # Pinecone index stats doesn't give dimensions directly in the same call...
        # But usually it's 384 or 768 or 1536
        
        # Let's try searching for anything with a dummy vector
        # The total vector count is 18.
        
        # Actually I just want to know if it's "running".
        # If it returns stats, it's running.
        print("✅ Pinecone Service is UP")
    except Exception as e:
        print(f"❌ Pinecone Error: {e}")

if __name__ == "__main__":
    search_test()
