from services.embedder import embed_and_store, query_documents


def run_test():
    print("🚀 Testing Full Flow...\n")

    chunks = [
        {"text": "Artificial Intelligence simulates human intelligence."},
        {"text": "Pinecone is a vector database used in AI applications."}
    ]

    user_id = 101
    filename = "test.txt"

    # 1️⃣ Store
    count = embed_and_store(chunks, user_id, filename)
    print(f"✅ Stored {count} chunks")

    # 2️⃣ Query
    results = query_documents("What is Pinecone?", user_id)

    print("\n🔍 Results:")
    for i, r in enumerate(results):
        print(f"{i+1}. {r.metadata['text']} (score={r.score:.4f})")


if __name__ == "__main__":
    run_test()