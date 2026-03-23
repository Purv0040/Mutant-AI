import os
import requests
import time
import hashlib
import threading
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

from database import get_db

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# Hardcoded pool of API keys if environment variable is not comma-separated
_env_key = os.getenv("OPENROUTER_API_KEY", "").strip()
OPENROUTER_API_KEYS = [k.strip() for k in _env_key.split(",")] if _env_key else [
    "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",
    "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",
    "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",
    "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",
    "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"
]
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

# 1. Multi-model fallback configuration
# Ordered by: free/cheap first, falling back to larger/primary if needed
ROBUST_MODELS = [
    "google/gemini-2.0-flash-lite-001",
    "meta-llama/llama-3.3-70b-instruct:free",          # Primary model
    "liquid/lfm-2.5-1.2b-instruct:free",               # Secondary model
    "mistralai/mistral-small-3.1-24b-instruct:free",   # Backup 1
    "qwen/qwen3-4b:free",                              # Backup 2
    "meta-llama/llama-3.3-70b-instruct",               # Ultimate Backup (Paid fallback if account allows)
]

# 2. Rate limit & backoff config
MAX_RETRIES = 2
BACKOFF_DELAYS = [1, 2]  # seconds (Total wait per model = 3s before moving onto fallback)

# 3. Request queue (prevent too many simultaneous overlapping calls)
MAX_CONCURRENT_REQUESTS = 3
_request_semaphore = threading.Semaphore(MAX_CONCURRENT_REQUESTS)

# 5. Daily usage protection config
MAX_DAILY_CALLS = 100

def generate_cache_key(system_prompt: str, user_prompt: str, model: str, temperature: float) -> str:
    """Generate a deterministic hash for caching."""
    data = f"{system_prompt}|{user_prompt}|{model}|{temperature}"
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

def check_daily_limit() -> bool:
    """Track and enforce daily usage limits via MongoDB."""
    try:
        db = get_db()
        today = datetime.utcnow().strftime("%Y-%m-%d")
        
        # Increment usage counter safely
        usage = db["ai_usage"].find_one_and_update(
            {"date": today},
            {"$inc": {"calls": 1}},
            upsert=True,
            return_document=True
        )
        
        # Simple limit check
        if usage and usage.get("calls", 0) > MAX_DAILY_CALLS:
            return False
            
        return True
    except Exception as e:
        print(f"[LLM Usage Tracker] Warning: {e}")
        return True # Default allow if DB fails


def call_openrouter(
    system_prompt: str,
    user_prompt: str,
    preferred_models: list | None = None,
    temperature: float = 0.2,
) -> str:
    """
    Robust AI Core Implementation. Include:
    - Thread-safe Semaphores (Request Queuing)
    - Redis/Mongo Caching layer
    - Exponential Backoff & Smart Retries
    - Automated Model Eviction & Fallback
    """
    if not OPENROUTER_API_KEYS:
        print("[LLM Warn] OPENROUTER_API_KEYS not set. Cannot use Pinecone LLM embedder.")
        return ""
    # --- 5. Daily Usage Protection ---
    if not check_daily_limit():
        return "Daily AI limit reached, try again tomorrow."

    models_to_try = preferred_models or ROBUST_MODELS
    db = None
    try:
        db = get_db()
    except Exception as e:
        print(f"[LLM Cache] DB Connection failed: {e}")

    # --- 4. Caching System ---
    if db is not None:
        try:
            # We use the generic models list to generate a hash key insensitive to the exact model that succeeds
            cache_key = generate_cache_key(system_prompt, user_prompt, "auto-router", temperature)
            cached_ans = db["llm_cache"].find_one({"_id": cache_key})
            if cached_ans:
                print(f"[LLM Cache] Cache HIT for prompt.")
                return cached_ans["response"]
        except Exception as e:
            print(f"[LLM Cache] Read Error: {e}")

    # Build HTTP request tools
    last_error = "Unknown error"

    # --- 3. Request Queue System ---
    with _request_semaphore:
        # --- 0. Multi-Key Fallback Loop ---
        for api_key in OPENROUTER_API_KEYS:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "Mutant-AI (Robust)",
            }
            # --- 1. Multi-model Fallback Loop ---
            for model in models_to_try:
                
                payload = {
                    "model": model,
                    "temperature": temperature,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ]
                }

                # --- 2. Graceful retries + Backoff Loop ---
                for attempt in range(MAX_RETRIES + 1):
                    try:
                        response = requests.post(OPENROUTER_BASE_URL, headers=headers, json=payload, timeout=60)
                        
                        if response.ok:
                            data = response.json()
                            text = data["choices"][0]["message"]["content"].strip()
                            print(f"[LLM Core] Success on model: {model} (Attempt {attempt+1})")
                            
                            # --- Store in Cache ---
                            if db is not None and text:
                                try:
                                    db["llm_cache"].insert_one({
                                        "_id": cache_key,
                                        "response": text,
                                        "model_used": model,
                                        "cached_at": datetime.utcnow()
                                    })
                                except Exception as e:
                                    print(f"[LLM Cache] Write Error: {e}")
                                    
                            return text
                            
                        elif response.status_code == 429:
                            last_error = "Rate Limit 429"
                            
                            if attempt < MAX_RETRIES:
                                delay = BACKOFF_DELAYS[attempt]
                                print(f"[LLM Core] Model {model} rate limited. Backing off for {delay}s... (Key: {api_key[:12]}...)")
                                time.sleep(delay)
                                continue  # Retry this model
                            else:
                                print(f"[LLM Core] Exhausted retries for {model}, switching models.")
                                break # Go to outer loop to switch model
                                
                        elif response.status_code in (401, 403, 402):
                            # API Key burnt or empty credits
                            last_error = f"API Key Failed {response.status_code}: {response.text[:100]}"
                            print(f"[LLM Core] API Key Exception on {api_key[:12]}... Switching to next API key.")
                            break # Break model loop, continue to next api_key loop
                                
                        else:
                            # 6. Graceful Error Handling (Other HTTP Codes)
                            last_error = f"HTTP {response.status_code}: {response.text[:100]}"
                            print(f"[LLM Core] Non-retryable error on {model}: {last_error}")
                            break # Switch model
                            
                    except requests.exceptions.RequestException as exc:
                        last_error = f"Network Exception: {exc}"
                        print(f"[LLM Core] Network error on {model}: {last_error}")
                        # Switch model directly to avoid hanging on unstable routes
                        break
                        
                    except (KeyError, IndexError, ValueError) as exc:
                        last_error = f"Malformed JSON/Shape: {exc}"
                        print(f"[LLM Core] Malformed response from {model}: {last_error}")
                        break
                
                # If we broke out of the attempt loop due to an API Key error (401, 403, 402), 
                # we also need to break out of the model loop so we can switch to the next key.
                if "API Key Failed" in last_error:
                    break 

    # 6. Graceful error handling (Do not return false positives)
    print(f"[LLM Core] ALL MODELS FAILED. Final error: {last_error}")
    raise RuntimeError("AI is currently busy. Please retry.")


# ── Adapters for old codebase ──────────────────────────────────────────────────

def get_fast_llm():
    """Cost-optimized secondary models first."""
    return _LLMWrapper(
        preferred=["mistralai/mistral-7b-instruct:free", "qwen/qwen3-4b:free", "liquid/lfm-2.5-1.2b-instruct:free"],
        temperature=0.1,
    )

def get_smart_llm():
    """High capability models first."""
    return _LLMWrapper(
        preferred=ROBUST_MODELS,
        temperature=0.2,
    )

class _LLMWrapper:
    """Wrapper to maintain backwards compatibility with llm.invoke()"""
    def __init__(self, preferred: list, temperature: float):
        self.preferred = preferred
        self.temperature = temperature

    def invoke(self, messages) -> "_FakeResponse":
        if isinstance(messages, str):
            system, user = "", messages
        elif isinstance(messages, list):
            system = next((m["content"] for m in messages if isinstance(m, dict) and m.get("role") == "system"), "")
            user   = next((m["content"] for m in messages if isinstance(m, dict) and m.get("role") == "user"), "")
        else:
            system, user = "", str(messages)

        text = call_openrouter(
            system, user,
            preferred_models=self.preferred,
            temperature=self.temperature,
        )
        return _FakeResponse(text)

class _FakeResponse:
    def __init__(self, content: str):
        self.content = content
