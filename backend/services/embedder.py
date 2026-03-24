import os
from pathlib import Path
from dotenv import load_dotenv
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# Initialize Pinecone
api_key = os.getenv("PINECONE_API_KEY", "").strip()
index_name = os.getenv("PINECONE_INDEX_NAME", "").strip()
host = os.getenv("PINECONE_HOST", "").strip()

if not api_key:
    raise RuntimeError("PINECONE_API_KEY is missing in .env")

pc = Pinecone(api_key=api_key)

if host:
    index = pc.Index(host=host)
elif index_name:
    index = pc.Index(index_name)
else:
    raise RuntimeError("Neither PINECONE_HOST nor PINECONE_INDEX_NAME is set in .env")

# Initialize Embedding Model
# Using the same model as in diagnose.py
print("Loading embedding model...")
model = SentenceTransformer('BAAI/bge-large-en-v1.5')

def embed_and_store(chunks, user_id, filename, metadata=None):
    """
    Embeds text chunks and stores them in Pinecone.
    """
    vectors = []
    metadata = metadata or {}
    for i, chunk in enumerate(chunks):
        text = chunk.get("text", "")
        if not text:
            continue
        
        # Generate embedding
        embedding = model.encode(text).tolist()
        
        # Create unique ID for the vector
        vector_id = f"u{user_id}_{filename}_{i}"
        
        vector_metadata = {
            "user_id": str(user_id),
            "filename": filename,
            "text": text,
            "chunk_index": i,
            **metadata,
        }

        vectors.append({
            "id": vector_id,
            "values": embedding,
            "metadata": vector_metadata,
        })
    
    # Upsert to Pinecone
    if vectors:
        index.upsert(vectors=vectors)
    
    return len(vectors)

def query_documents(question, user_id, top_k=5, metadata_filter=None):
    """
    Queries Pinecone for relevant document chunks.
    """
    # Generate query embedding
    query_embedding = model.encode(question).tolist()
    
    # Query Pinecone with filter for user_id
    effective_filter = metadata_filter or {"user_id": str(user_id)}
    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        filter=effective_filter,
        include_metadata=True
    )
    
    return results.get("matches", [])

def count_document_vectors(user_id, filename):
    """
    Counts how many vectors exist for a specific document.
    Note: Pinecone doesn't have a direct "count with filter" for small scales easily,
    but we can query with a dummy vector and filter.
    """
    # Dummy query to count matches
    dummy_vec = [0.0] * 1024 # Model dimension is 1024 for bge-large
    results = index.query(
        vector=dummy_vec,
        top_k=10000,
        filter={
            "user_id": str(user_id),
            "filename": filename
        },
        include_metadata=False
    )
    return len(results.get("matches", []))

def delete_document_vectors(user_id, filename):
    """
    Deletes all vectors associated with a specific document.
    """
    # We can use delete with filter if the index supports it (Pod based or Serverless)
    try:
        index.delete(filter={
            "user_id": str(user_id),
            "filename": filename
        })
        return True
    except Exception as e:
        print(f"Error deleting vectors: {e}")
        return False


def fetch_document_chunks(user_id, filename, max_chunks=500):
    """
    Fetch stored chunks for a single document from Pinecone.
    This is useful when the original uploaded file is no longer available on disk.
    """
    try:
        dummy_vec = [0.0] * 1024  # bge-large-en-v1.5 embedding dimension
        results = index.query(
            vector=dummy_vec,
            top_k=max_chunks,
            filter={
                "user_id": str(user_id),
                "filename": filename,
            },
            include_metadata=True,
        )
        matches = results.get("matches", []) or []

        chunks = []
        for match in matches:
            meta = match.get("metadata", {}) or {}
            text = (meta.get("text") or "").strip()
            if not text:
                continue
            try:
                idx = int(meta.get("chunk_index", 0))
            except (TypeError, ValueError):
                idx = 0
            chunks.append({"text": text, "chunk_index": idx})

        chunks.sort(key=lambda c: c.get("chunk_index", 0))
        return chunks
    except Exception as e:
        print(f"Error fetching document chunks from Pinecone: {e}")
        return []
