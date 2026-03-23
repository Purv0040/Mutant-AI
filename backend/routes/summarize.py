import json
import os
import re
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

from auth.dependencies import get_current_user
from database import get_db
from services.access import build_document_visibility_query
from services.llm import get_smart_llm
from services.parser import parse_file

router = APIRouter(tags=["ai"])

# Resolve upload directory relative to THIS file so it always points to the
# correct local path regardless of what was stored in MongoDB.
UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"


def _resolve_file_path(doc: dict) -> str:
    """
    Return the actual on-disk path for a document.
    First try the stored file_path; if it doesn't exist on disk, fall back to
    reconstructing it from UPLOAD_DIR using the stored filename and user_id.
    """
    stored = doc.get("file_path", "")
    if stored and os.path.exists(stored):
        return stored

    # Reconstruct: uploads/u<user_id>_<filename>
    user_id = str(doc.get("user_id", ""))
    filename = doc.get("filename", "")
    if user_id and filename:
        candidate = UPLOAD_DIR / f"u{user_id}_{filename}"
        if candidate.exists():
            return str(candidate)

    # Last resort: scan uploads dir for any file ending with _{filename}
    if filename and UPLOAD_DIR.exists():
        for entry in UPLOAD_DIR.iterdir():
            if entry.name.endswith(f"_{filename}"):
                return str(entry)

    raise FileNotFoundError(
        f"File '{filename}' not found on disk. "
        "It may have been moved or the original upload path is no longer valid."
    )


def _parse_findings(raw_text: str) -> list:
    """
    Robustly extract a list of finding dicts from the LLM output.
    Handles: markdown fences, surrounding prose, bare string items.
    Always returns a list[dict] with 'text' and 'type' keys.
    """
    text = raw_text.strip()

    # Strip markdown code fences
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(l for l in lines if not l.strip().startswith("```")).strip()

    # Try to extract a JSON array even if there's surrounding prose
    match = re.search(r'\[.*\]', text, re.DOTALL)
    if match:
        text = match.group(0)

    try:
        parsed = json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return []

    if not isinstance(parsed, list):
        # Maybe the LLM wrapped it: {"findings": [...]}
        if isinstance(parsed, dict):
            for v in parsed.values():
                if isinstance(v, list):
                    parsed = v
                    break
            else:
                return []
        else:
            return []

    # Sanitise: ensure every item is a dict with 'text' and 'type'
    valid_types = {"positive", "neutral", "warning", "risk"}
    clean = []
    for item in parsed:
        if isinstance(item, dict):
            entry = {
                "text": str(
                    item.get("text") or item.get("finding") or
                    item.get("description") or ""
                ),
                "type": str(item.get("type") or item.get("category") or "neutral"),
            }
        elif isinstance(item, str):
            entry = {"text": item, "type": "neutral"}
        else:
            entry = {"text": str(item), "type": "neutral"}

        if entry["type"] not in valid_types:
            entry["type"] = "neutral"

        if entry["text"]:
            clean.append(entry)

    return clean


class SummarizeRequest(BaseModel):
    filename: str = Field(min_length=1)
    force: bool = False   # set True to bypass cache and regenerate


@router.post("/summarize")
def summarize_document(
    payload: SummarizeRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        db = get_db()
        visibility_query = build_document_visibility_query(current_user)
        doc = db["documents"].find_one({
            **visibility_query,
            "filename": payload.filename,
        })
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # --- Return cached summary unless force-regenerate requested ---
        if not payload.force and doc.get("summary"):
            try:
                cached = json.loads(doc["summary"])
                # Only return cache if it's a proper structured result dict
                if (
                    isinstance(cached, dict)
                    and cached.get("summary")
                    and isinstance(cached.get("findings"), list)
                ):
                    cached["cached"] = True
                    return cached
                else:
                    # Stale / malformed cache – clear it and regenerate
                    db["documents"].update_one(
                        {"_id": doc["_id"]},
                        {"$unset": {"summary": ""}}
                    )
            except (json.JSONDecodeError, TypeError):
                # Not valid JSON – clear and regenerate
                db["documents"].update_one(
                    {"_id": doc["_id"]},
                    {"$unset": {"summary": ""}}
                )

        # --- Resolve actual file path ---
        try:
            file_path = _resolve_file_path(doc)
        except FileNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))

        chunks = parse_file(file_path, doc["filename"])
        if not chunks:
            raise HTTPException(status_code=400, detail="No readable text found in document")

        llm = get_smart_llm()
        combined_text = "\n\n".join(
            chunk["text"] if isinstance(chunk, dict) else str(chunk)
            for chunk in chunks
        )

        summary_prompt = (
            "Summarize the following document content in concise, clear business language. "
            "Include the main objective, key decisions or policy points, and important numbers if present.\n\n"
            f"Content:\n{combined_text[:15000]}"
        )
        summary_raw = llm.invoke(summary_prompt)
        summary = getattr(summary_raw, "content", str(summary_raw)).strip()

        findings_prompt = (
            "From this summary, produce exactly 4 key findings as a raw JSON array "
            "(no markdown, no code fences, no prose — ONLY the JSON array). "
            "Each item must have: text (string) and type (one of: positive, neutral, warning, risk).\n\n"
            f"Summary:\n{summary}"
        )
        findings_raw = llm.invoke(findings_prompt)
        findings_text = getattr(findings_raw, "content", str(findings_raw)).strip()

        findings = _parse_findings(findings_text)

        fallbacks = [
            {"text": "Summary generated successfully.", "type": "neutral"},
            {"text": "Review full source for nuanced details.", "type": "warning"},
            {"text": "Cross-check with latest internal updates.", "type": "risk"},
            {"text": "Potential opportunities identified.", "type": "positive"},
        ]
        while len(findings) < 4:
            findings.append(fallbacks[len(findings) % len(fallbacks)])
        findings = findings[:4]

        try:
            page_count = max(
                int(chunk.get("page", 1) if isinstance(chunk, dict) else 1)
                for chunk in chunks
            ) if chunks else 1
        except (ValueError, TypeError):
            page_count = 1

        word_count = len(combined_text.split())

        result = {
            "summary": summary,
            "findings": findings,
            "page_count": page_count,
            "word_count": word_count,
            "cached": False,
        }

        db["documents"].update_one(
            {"_id": doc["_id"]},
            {"$set": {"summary": json.dumps(result), "status": "summarized"}},
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"Summarize error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/summarize/export")
def export_summary(
    filename: str = Query(..., min_length=1),
    current_user: dict = Depends(get_current_user),
):
    """Return the stored summary as a plain-text file download."""
    try:
        db = get_db()
        visibility_query = build_document_visibility_query(current_user)
        doc = db["documents"].find_one({**visibility_query, "filename": filename})
        if not doc or not doc.get("summary"):
            raise HTTPException(status_code=404, detail="No summary found for this document")

        try:
            data = json.loads(doc["summary"])
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Stored summary is malformed")

        lines = [
            f"KNOWLEDGE SUMMARY — {filename}",
            "=" * 60,
            "",
            "EXECUTIVE SUMMARY",
            "-" * 40,
            data.get("summary", ""),
            "",
            "KEY FINDINGS",
            "-" * 40,
        ]
        for i, f in enumerate(data.get("findings", []), 1):
            lines.append(f"{i}. [{f.get('type','').upper()}] {f.get('text','')}")

        lines += [
            "",
            "METRICS",
            "-" * 40,
            f"Pages Analyzed : {data.get('page_count', 'N/A')}",
            f"Word Count     : {data.get('word_count', 'N/A')}",
        ]

        safe_name = filename.replace(" ", "_").replace("/", "_")
        return PlainTextResponse(
            content="\n".join(lines),
            headers={"Content-Disposition": f'attachment; filename="summary_{safe_name}.txt"'},
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Export summary error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
