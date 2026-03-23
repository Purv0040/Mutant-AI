import os
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

# Free models tried in order — broad list so we always get a response even if
# the first few are rate-limited or temporarily unavailable.
FREE_MODELS = [
    # ── Tier 1: large capable models ──────────────────────────────────────────
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-4-maverick:free",
    "google/gemini-2.0-flash-exp:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "deepseek/deepseek-v3-base:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "mistralai/mistral-small-3.2-24b-instruct:free",
    # ── Tier 2: mid-size reliable models ──────────────────────────────────────
    "nvidia/llama-3.1-nemotron-nano-8b-v1:free",
    "nvidia/llama-3.3-nemotron-super-49b-v1:free",
    "qwen/qwen3-4b:free",
    "qwen/qwen3-8b:free",
    "qwen/qwen3-14b:free",
    "google/gemma-3-12b-it:free",
    "google/gemma-3-27b-it:free",
    # ── Tier 3: lightweight fallbacks ─────────────────────────────────────────
    "mistralai/mistral-7b-instruct:free",
    "openchat/openchat-3.5-0106:free",
    "liquid/lfm-2.5-1.2b-instruct:free",
]

# Status codes that mean "this model is unavailable / throttling" — try next
_RETRY_STATUS_CODES = {429, 503, 502, 529}


def call_openrouter(
    system_prompt: str,
    user_prompt: str,
    preferred_models: list | None = None,
    temperature: float = 0.2,
) -> str:
    """
    Call OpenRouter, trying models in order.
    `preferred_models`: list of model IDs to try first, then falls back to
    FREE_MODELS for any that weren't already in the list.
    Returns the assistant message text or raises RuntimeError.
    """
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is not set in .env")

    # Build ordered deduplicated list: preferred first, then remaining FREE_MODELS
    if preferred_models:
        seen = set(preferred_models)
        models_to_try = list(preferred_models) + [m for m in FREE_MODELS if m not in seen]
    else:
        models_to_try = list(FREE_MODELS)

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Mutant-AI",
    }

    last_error = ""

    for model in models_to_try:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_prompt})

        payload = {
            "model": model,
            "temperature": temperature,
            "messages": messages,
        }

        try:
            response = requests.post(
                OPENROUTER_BASE_URL, headers=headers, json=payload, timeout=90
            )
        except requests.exceptions.Timeout:
            last_error = f"Timeout on {model}"
            print(f"[LLM] {last_error} — trying next model")
            continue
        except requests.exceptions.RequestException as exc:
            last_error = f"Network error on {model}: {exc}"
            print(f"[LLM] {last_error} — trying next model")
            continue

        try:
            data = response.json()
        except Exception:
            last_error = f"Non-JSON response from {model}: {response.text[:200]}"
            print(f"[LLM] {last_error} — trying next model")
            continue

        if response.status_code in _RETRY_STATUS_CODES:
            err_msg = ""
            if isinstance(data, dict):
                err_obj = data.get("error", {})
                err_msg = err_obj.get("message", "") if isinstance(err_obj, dict) else str(err_obj)
            last_error = f"HTTP {response.status_code} on {model}: {err_msg or 'rate limited / unavailable'}"
            print(f"[LLM] {last_error} — trying next model")
            continue

        if not response.ok:
            err_msg = ""
            if isinstance(data, dict):
                err_obj = data.get("error", {})
                err_msg = err_obj.get("message", "") if isinstance(err_obj, dict) else str(err_obj)
            last_error = f"OpenRouter error {response.status_code} on {model}: {err_msg or data}"
            print(f"[LLM] {last_error} — trying next model")
            continue

        try:
            text = data["choices"][0]["message"]["content"].strip()
            if text:
                print(f"[LLM] Successfully used model: {model}")
                return text
            last_error = f"Empty response from {model}"
            continue
        except (KeyError, IndexError, TypeError):
            last_error = f"Unexpected response shape from {model}: {str(data)[:200]}"
            print(f"[LLM] {last_error} — trying next model")
            continue

    raise RuntimeError(f"All {len(models_to_try)} models failed. Last error: {last_error}")


# ── convenience wrappers ────────────────────────────────────────────────────────

def get_fast_llm():
    """Fast, lightweight LLM. Falls back through FREE_MODELS on rate limit."""
    return _LLMWrapper(
        preferred=["mistralai/mistral-7b-instruct:free", "qwen/qwen3-4b:free"],
        temperature=0.1,
    )


def get_smart_llm():
    """Smarter LLM for summarization/categorization. Falls back through FREE_MODELS."""
    return _LLMWrapper(
        preferred=[
            "meta-llama/llama-3.3-70b-instruct:free",
            "google/gemini-2.0-flash-exp:free",
            "deepseek/deepseek-chat-v3-0324:free",
            "mistralai/mistral-small-3.1-24b-instruct:free",
        ],
        temperature=0.2,
    )


class _LLMWrapper:
    """Thin wrapper so existing code calling llm.invoke(prompt) still works."""

    def __init__(self, preferred: list, temperature: float):
        self.preferred = preferred
        self.temperature = temperature

    def invoke(self, messages) -> "_FakeResponse":
        """
        Accept either:
          - a plain string  → treated as the user prompt (no system prompt)
          - a list of dicts → LangChain-style [{"role": ..., "content": ...}, ...]
        """
        if isinstance(messages, str):
            system = ""
            user   = messages
        elif isinstance(messages, list):
            system = next(
                (m["content"] for m in messages
                 if isinstance(m, dict) and m.get("role") == "system"), ""
            )
            user = next(
                (m["content"] for m in messages
                 if isinstance(m, dict) and m.get("role") == "user"), ""
            )
        else:
            system = ""
            user   = str(messages)

        text = call_openrouter(
            system, user,
            preferred_models=self.preferred,
            temperature=self.temperature,
        )
        return _FakeResponse(text)


class _FakeResponse:
    def __init__(self, content: str):
        self.content = content

