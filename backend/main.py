import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from sqlalchemy.exc import OperationalError

from auth.router import router as auth_router
from database import Base, engine
from routes.ask import router as ask_router
from routes.categorize import router as categorize_router
from routes.summarize import router as summarize_router
from routes.upload import router as upload_router

load_dotenv()

app = FastAPI(title="Mutant AI Backend", version="0.1.0")

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(ask_router)
app.include_router(summarize_router)
app.include_router(categorize_router)


@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
    except OperationalError as exc:
        if "already exists" not in str(exc).lower():
            raise

    inspector = inspect(engine)
    if "documents" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("documents")}
    if "botpress_file_id" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE documents ADD COLUMN botpress_file_id VARCHAR"))


@app.get("/")
def healthcheck():
    return {"status": "ok", "service": "mutant-ai-backend"}
