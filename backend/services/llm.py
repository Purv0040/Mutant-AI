import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"


def get_fast_llm() -> ChatOpenAI:
    return ChatOpenAI(
        model="mistralai/mistral-7b-instruct:free",
        openai_api_key=OPENROUTER_API_KEY,
        openai_api_base=OPENROUTER_BASE_URL,
        temperature=0.1,
    )


def get_smart_llm() -> ChatOpenAI:
    return ChatOpenAI(
        model="meta-llama/llama-3.3-70b-instruct:free",
        openai_api_key=OPENROUTER_API_KEY,
        openai_api_base=OPENROUTER_BASE_URL,
        temperature=0.2,
    )
