import os
from pathlib import Path
from dotenv import load_dotenv
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# Global variables for caching
_model = None
_pinecone_client = None
_index = None

def get_model():
    global _model
    if _model is None:
        # BAAI/bge-large-en-v1.5 produces 1024 dimensions
        _model = SentenceTransformer('BAAI/bge-large-en-v1.5')
    return _model


def get_pinecone_index():
    global _pinecone_client, _index
    if _index is None:
        api_key = os.getenv("PINECONE_API_KEY", "").strip()
        index_host = os.getenv("PINECONE_HOST", "").strip()
        
        if not api_key or not index_host:
            raise RuntimeError("Pinecone credentials missing in .env")
        
        _pinecone_client = Pinecone(api_key=api_key)
        _index = _pinecone_client.Index(host=index_host)
    return _index

def embed_and_store(chunks, user_id, filename):
    model = get_model()
    index = get_pinecone_index()
    
    vectors = []
    for i, chunk in enumerate(chunks):
        text = chunk.get("text", "")
        if not text:
            continue
            
        embedding = model.encode(text).tolist()
        
        # Consistent ID format: u{user_id}_{filename}_{chunk_index}
        vector_id = f"u{user_id}_{filename}_{i}"
        
        vectors.append({
            "id": vector_id,
            "values": embedding,
            "metadata": {
                "user_id": str(user_id),
                "filename": filename,
                "text": text,
                "chunk_index": i
            }
        })
    
    if vectors:
        # Upsert in batches of 100
        for i in range(0, len(vectors), 100):
            batch = vectors[i:i + 100]
            index.upsert(vectors=batch)
            
    return len(vectors)

def delete_document_vectors(user_id, filename):
    index = get_pinecone_index()
    # Pinecone doesn't support direct filtering on delete for all index types easily,
    # but we can use metadata filtering if the index has indexing enabled on that field.
    # Alternatively, we could prefix IDs.
    # For now, let's assume we use the metadata filter.
    index.delete(filter={
        "user_id": str(user_id),
        "filename": filename
    })
    return True

def count_document_vectors(user_id, filename):
    index = get_pinecone_index()
    stats = index.describe_index_stats(filter={
        "user_id": str(user_id),
        "filename": filename
    })
    return stats.get("total_vector_count", 0)

def query_documents(query, user_id, top_k=5):
    model = get_model()
    index = get_pinecone_index()
    
    query_embedding = model.encode(query).tolist()
    
    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True,
        filter={"user_id": str(user_id)}
    )
    
    return results.get("matches", [])
