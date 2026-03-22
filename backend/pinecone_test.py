import os
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()

def test_connection():
    api_key = os.getenv("PINECONE_API_KEY", "********-****-****-****-************").strip()
    pc = Pinecone(api_key=api_key)
    index = pc.Index("mutant-ai")

    stats = index.describe_index_stats()
    print("✅ Connected!")
    print(stats)


if __name__ == "__main__":
    test_connection()