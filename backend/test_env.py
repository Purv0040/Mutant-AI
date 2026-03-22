import os
from dotenv import load_dotenv

load_dotenv("c:/Users/Digisha/Desktop/project/Mutant-AI/backend/.env")

print(f"KEY: '{os.getenv('PINECONE_API_KEY')}'")
print(f"HOST: '{os.getenv('PINECONE_HOST')}'")
print(f"INDEX: '{os.getenv('PINECONE_INDEX_NAME')}'")
