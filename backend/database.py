import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

load_dotenv(Path(__file__).resolve().parent / ".env")

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "mutant_ai")

client = None
db = None
last_error = None


def _connect():
    """Create or refresh MongoDB connection and cache it for reuse."""
    global client, db, last_error
    try:
        kwargs = {"serverSelectionTimeoutMS": 5000}
        # Atlas SRV connections are compatible with Stable API v1.
        if MONGODB_URL.startswith("mongodb+srv://"):
            kwargs["server_api"] = ServerApi("1")

        client = MongoClient(MONGODB_URL, **kwargs)
        client.admin.command("ping")
        db = client[MONGODB_DB_NAME]
        last_error = None
        print("✓ Connected to MongoDB")
    except Exception as e:
        last_error = str(e)
        client = None
        db = None
        print(f"✗ MongoDB connection failed: {e}")


# Initial connect attempt at startup; runtime calls can retry.
_connect()

def get_db():
    """Return the MongoDB database instance"""
    if db is None:
        _connect()
    if db is None:
        error_suffix = f". Last error: {last_error}" if last_error else ""
        raise RuntimeError(f"MongoDB not connected{error_suffix}")
    return db

def close_db():
    """Close the MongoDB connection"""
    if client:
        client.close()
