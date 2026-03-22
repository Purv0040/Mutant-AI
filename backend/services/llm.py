import os
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

# Free models tried in order — verified available on OpenRouter (queried live)
FREE_MODELS = [
    "openai/gpt-oss-120b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "qwen/qwen3-4b:free",
    "google/gemma-3n-e4b-it:free",
    "arcee-ai/trinity-large-preview:free",
    "liquid/lfm-2.5-1.2b-instruct:free",
]


def call_openrouter(
    system_prompt: str,
    user_prompt: str,
    model: str | None = None,
    temperature: float = 0.2,
) -> str:
    """
    Call OpenRouter directly using requests (no LangChain).
    Tries FREE_MODELS in order if rate-limited (429).
    Returns the assistant message text.
    """
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is not set in .env")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Mutant-AI",
    }

    models_to_try = [model] if model else FREE_MODELS
    last_error = ""

    for m in models_to_try:
        payload = {
            "model": m,
            "temperature": temperature,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
        }

        response = requests.post(OPENROUTER_BASE_URL, headers=headers, json=payload, timeout=60)

        try:
            data = response.json()
        except Exception:
            last_error = f"Non-JSON response from {m}: {response.text[:200]}"
            continue

        if response.status_code == 429:
            last_error = f"Rate limited on {m}"
            print(f"[LLM] {last_error} — trying next model")
            continue

        if not response.ok:
            err = data.get("error", {})
            last_error = f"OpenRouter error {response.status_code} on {m}: {err.get('message', data)}"
            print(f"[LLM] {last_error} — trying next model")
            continue

        try:
            text = data["choices"][0]["message"]["content"].strip()
            print(f"[LLM] Successfully used model: {m}")
            return text
        except (KeyError, IndexError) as e:
            last_error = f"Unexpected response shape from {m}: {data}"
            continue

    raise RuntimeError(f"All models failed. Last error: {last_error}")


# ── convenience wrappers (so other modules keep working) ──────────────────────

def get_fast_llm():
    """Returns a callable that mimics LangChain's .invoke() interface."""
    return _LLMWrapper(model="mistralai/mistral-7b-instruct:free", temperature=0.1)


def get_smart_llm():
    """Returns a callable that mimics LangChain's .invoke() interface."""
    return _LLMWrapper(model="meta-llama/llama-3.3-70b-instruct:free", temperature=0.2)


class _LLMWrapper:
    """Thin wrapper so existing code calling llm.invoke([...]) still works."""

    def __init__(self, model: str, temperature: float):
        self.model = model
        self.temperature = temperature

    def invoke(self, messages: list) -> "_FakeResponse":
        system = next((m["content"] for m in messages if m["role"] == "system"), "")
        user   = next((m["content"] for m in messages if m["role"] == "user"),   "")
        text = call_openrouter(system, user, model=self.model, temperature=self.temperature)
        return _FakeResponse(text)


class _FakeResponse:
    def __init__(self, content: str):
        self.content = content
