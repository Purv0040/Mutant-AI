import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

print(f"KEY: '{os.getenv('PINECONE_API_KEY')}'")
print(f"HOST: '{os.getenv('PINECONE_HOST')}'")
print(f"INDEX: '{os.getenv('PINECONE_INDEX_NAME')}'")
