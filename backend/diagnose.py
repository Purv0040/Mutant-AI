"""
Quick diagnostic: shows all documents in MongoDB + Pinecone vector counts.
Run from backend/ folder: python diagnose.py
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

# ── MongoDB ────────────────────────────────────────────────────────────────────
print("\n========== MONGODB DOCUMENTS ==========")
try:
    from pymongo import MongoClient
    from pymongo.server_api import ServerApi
    url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    kwargs = {"serverSelectionTimeoutMS": 5000}
    if url.startswith("mongodb+srv://"):
        kwargs["server_api"] = ServerApi("1")
    client = MongoClient(url, **kwargs)
    db = client[os.getenv("MONGODB_DB_NAME", "mutant_ai")]

    users = list(db["users"].find({}, {"_id": 1, "email": 1, "name": 1}))
    print(f"Total users: {len(users)}")
    for u in users:
        uid = str(u["_id"])
        docs = list(db["documents"].find({"user_id": u["_id"]}, {"filename": 1, "chunks_stored": 1, "status": 1}))
        print(f"\n  User: {u.get('email')} (id={uid})")
        print(f"  Documents ({len(docs)}):")
        for d in docs:
            print(f"    • {d.get('filename')}  chunks_stored={d.get('chunks_stored')}  status={d.get('status')}")
except Exception as e:
    print(f"  MongoDB ERROR: {e}")

# ── Pinecone ───────────────────────────────────────────────────────────────────
print("\n========== PINECONE INDEX STATS ==========")
try:
    from pinecone import Pinecone
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY", "").strip())
    index = pc.Index(host=os.getenv("PINECONE_HOST", "").strip())
    stats = index.describe_index_stats()
    total = stats.get("total_vector_count", 0)
    print(f"  Total vectors in Pinecone: {total}")
    namespaces = stats.get("namespaces", {})
    if namespaces:
        for ns, info in namespaces.items():
            print(f"  Namespace '{ns}': {info.get('vector_count', 0)} vectors")
    else:
        print("  (default namespace / no namespaces)")
except Exception as e:
    print(f"  Pinecone ERROR: {e}")

# ── Test Query ─────────────────────────────────────────────────────────────────
print("\n========== TEST PINECONE QUERY ==========")
try:
    from sentence_transformers import SentenceTransformer
    print("  Loading embedding model (may take a moment)...")
    model = SentenceTransformer('BAAI/bge-large-en-v1.5')
    query_vec = model.encode("what is this document about").tolist()
    results = index.query(vector=query_vec, top_k=3, include_metadata=True)
    matches = results.get("matches", [])
    print(f"  Query returned {len(matches)} matches:")
    for m in matches:
        meta = m.get("metadata", {})
        print(f"    score={m.get('score'):.4f}  file={meta.get('filename')}  user={meta.get('user_id')}")
        print(f"    text preview: {meta.get('text','')[:100]}...")
except Exception as e:
    print(f"  Query ERROR: {e}")

print("\n========== DONE ==========\n")
