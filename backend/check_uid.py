"""
Find which user_id is actually stored in Pinecone vectors,
and match it back to a MongoDB user.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

from pinecone import Pinecone
from pymongo import MongoClient
from pymongo.server_api import ServerApi

# --- Pinecone: fetch sample vectors and extract user_ids ---
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY", "").strip())
index = pc.Index(host=os.getenv("PINECONE_HOST", "").strip())

from sentence_transformers import SentenceTransformer
print("Loading model...")
model = SentenceTransformer('BAAI/bge-large-en-v1.5')
vec = model.encode("user story document").tolist()

results = index.query(vector=vec, top_k=10, include_metadata=True)
matches = results.get("matches", [])

pinecone_user_ids = set()
print(f"\nPinecone top {len(matches)} matches:")
for m in matches:
    meta = m.get("metadata", {})
    uid = meta.get("user_id", "")
    fname = meta.get("filename", "?")
    pinecone_user_ids.add(uid)
    print(f"  user_id={uid}  file={fname}  score={round(m.get('score',0),4)}")

# --- Match back to MongoDB ---
url = os.getenv("MONGODB_URL")
kwargs = {"serverSelectionTimeoutMS": 5000}
if url.startswith("mongodb+srv://"):
    kwargs["server_api"] = ServerApi("1")
client = MongoClient(url, **kwargs)
db = client[os.getenv("MONGODB_DB_NAME", "mutant_ai")]

print(f"\nMatching Pinecone user_ids to MongoDB users:")
from bson import ObjectId
for uid in pinecone_user_ids:
    try:
        user = db["users"].find_one({"_id": ObjectId(uid)})
        if user:
            docs = list(db["documents"].find({"user_id": ObjectId(uid)}, {"filename": 1}))
            filenames = [d.get("filename") for d in docs]
            print(f"  user_id={uid} -> email={user.get('email')}  docs={filenames}")
        else:
            print(f"  user_id={uid} -> NOT FOUND in MongoDB")
    except Exception as e:
        print(f"  user_id={uid} -> error: {e}")
