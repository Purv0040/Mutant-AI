import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "mutant_ai")

try:
    client = MongoClient(MONGODB_URL, server_api=ServerApi('1'), serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("✓ Connected to MongoDB")
except Exception as e:
    print(f"✗ MongoDB connection failed: {e}")
    client = None

db = client[MONGODB_DB_NAME] if client else None

def get_db():
    """Return the MongoDB database instance"""
    if db is None:
        raise RuntimeError("MongoDB not connected")
    return db

def close_db():
    """Close the MongoDB connection"""
    if client:
        client.close()
