print("=== Testing full Q&A pipeline ===")

# 1. Test LLM with new model list
from services.llm import call_openrouter
result = call_openrouter(
    system_prompt="You are a helpful assistant. Answer in 2 sentences.",
    user_prompt="What is a user story in software development?",
)
print("LLM Response:", result[:300])
print()

# 2. Test Pinecone query for purv@gmail.com
from services.embedder import query_documents
user_id = "69bfb2f0fe6bc526bed445a2"
matches = query_documents("what is user story", user_id=user_id, top_k=3)
print(f"Pinecone matches for user {user_id}: {len(matches)}")
for m in matches:
    meta = m.get("metadata", {})
    print(f"  - file={meta.get('filename')}  score={round(m.get('score',0), 4)}")
    print(f"    text={meta.get('text','')[:80]}...")

print()
print("=== ALL GOOD ===")
