"""
友愛教室 V2 — FastAPI Backend
Sync + Teacher Auth

Run: uvicorn main:app --reload --port 8000
"""
import os
import json
import hashlib
import secrets
import time
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

# ── Config ──────────────────────────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv()

TEACHER_PASSWORD = os.getenv("TEACHER_PASSWORD", "admin")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_hex(32))

DATA_DIR = Path(os.getenv("DATA_DIR", str(Path(__file__).parent / "data")))
DATA_DIR.mkdir(parents=True, exist_ok=True)

# ── In-memory session store (teacher tokens) ────────────────────────────────
# token -> expiry timestamp
TEACHER_TOKENS: dict[str, float] = {}

# ── Pydantic models ──────────────────────────────────────────────────────────
class SyncRequest(BaseModel):
    name: str
    completedScenarios: list[str]
    topicProgress: dict
    subjectProgress: dict
    totalMoralScore: int
    lastPlayed: Optional[str] = None
    deviceId: Optional[str] = None  # for deduplication

class LoginRequest(BaseModel):
    password: str

class SyncResponse(BaseModel):
    ok: bool
    message: str
    lastSynced: Optional[str] = None

class StudentRecord(BaseModel):
    name: str
    completedScenarios: list[str]
    topicProgress: dict
    subjectProgress: dict
    totalMoralScore: int
    lastPlayed: Optional[str]
    syncedAt: str
    scenarioCount: int

# ── Helpers ──────────────────────────────────────────────────────────────────
def _student_file(name: str) -> Path:
    """Sanitize name → safe filename."""
    safe = "".join(c for c in name if c.isalnum() or c in ("_", "-")).strip()
    if not safe:
        raise HTTPException(400, "Invalid student name")
    return DATA_DIR / f"{safe}.json"

def _teacher_token_valid(token: str) -> bool:
    if token not in TEACHER_TOKENS:
        return False
    if TEACHER_TOKENS[token] < time.time():
        del TEACHER_TOKENS[token]
        return False
    return True

def _require_teacher(token: Optional[str] = None) -> bool:
    """Raise 401 if no valid teacher token. Returns True if ok."""
    if not token:
        raise HTTPException(401, "Missing X-Teacher-Token header")
    if not _teacher_token_valid(token):
        raise HTTPException(401, "Invalid or expired token")
    return True

# ── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(title="友愛教室 V2 API", version="1.0.0")

# CORS
origins = [o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health ───────────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "students": len(list(DATA_DIR.glob("*.json")))}

# ── Student Sync ─────────────────────────────────────────────────────────────
@app.post("/api/sync", response_model=SyncResponse)
async def sync_progress(data: SyncRequest):
    """Student uploads progress. Latest timestamp wins (compare syncedAt)."""
    if not data.name or len(data.name) > 100:
        raise HTTPException(400, "Invalid name")

    fpath = _student_file(data.name)
    now = datetime.utcnow().isoformat() + "Z"

    # Load existing record (if any)
    existing = {}
    if fpath.exists():
        try:
            existing = json.loads(fpath.read_text())
        except Exception:
            existing = {}

    # Merge: scenarios union, moral max, topic/subject completed max
    merged = {
        "name": data.name,
        "completedScenarios": list(set(existing.get("completedScenarios", []) + data.completedScenarios)),
        "topicProgress": {},
        "subjectProgress": {},
        "totalMoralScore": max(existing.get("totalMoralScore", 0), data.totalMoralScore),
        "lastPlayed": data.lastPlayed or existing.get("lastPlayed"),
        "syncedAt": now,
        "deviceId": data.deviceId,
    }

    # Merge topic progress (take max completed)
    for tid, tp in (data.topicProgress or {}).items():
        existing_tp = existing.get("topicProgress", {}).get(tid, {})
        merged["topicProgress"][tid] = {
            "completed": max(existing_tp.get("completed", 0), tp.get("completed", 0)),
            "total": max(existing_tp.get("total", 0), tp.get("total", 0)),
        }

    # Merge subject progress
    for sid, sp in (data.subjectProgress or {}).items():
        existing_sp = existing.get("subjectProgress", {}).get(sid, {})
        merged["subjectProgress"][sid] = {
            "completed": max(existing_sp.get("completed", 0), sp.get("completed", 0)),
            "total": max(existing_sp.get("total", 0), sp.get("total", 0)),
        }

    fpath.write_text(json.dumps(merged, ensure_ascii=False, indent=2))

    return SyncResponse(
        ok=True,
        message=f"Synced for {data.name}",
        lastSynced=now,
    )

# ── Teacher Auth ─────────────────────────────────────────────────────────────
@app.post("/api/teacher/login")
async def teacher_login(req: LoginRequest):
    """Teacher logs in with password → receives a session token."""
    if req.password != TEACHER_PASSWORD:
        raise HTTPException(401, "Wrong password")

    token = secrets.token_urlsafe(32)
    # Token valid for 24 hours
    TEACHER_TOKENS[token] = time.time() + 86400

    return {
        "ok": True,
        "token": token,
        "expiresIn": 86400,
    }

@app.post("/api/teacher/logout")
async def teacher_logout(x_teacher_token: Optional[str] = None):
    _require_teacher(x_teacher_token)
    if x_teacher_token in TEACHER_TOKENS:
        del TEACHER_TOKENS[x_teacher_token]
    return {"ok": True}

# ── Teacher: List Students ─────────────────────────────────────────────────────
@app.get("/api/teacher/students", response_model=list[StudentRecord])
async def list_students(
    x_teacher_token: Optional[str] = None,
    limit: int = Query(default=50, le=200),
):
    """List all synced student records. Requires teacher auth."""
    _require_teacher(x_teacher_token)

    students = []
    for fpath in sorted(DATA_DIR.glob("*.json"), key=lambda p: -p.stat().st_mtime):
        try:
            data = json.loads(fpath.read_text())
            students.append(StudentRecord(
                name=data.get("name", fpath.stem),
                completedScenarios=data.get("completedScenarios", []),
                topicProgress=data.get("topicProgress", {}),
                subjectProgress=data.get("subjectProgress", {}),
                totalMoralScore=data.get("totalMoralScore", 0),
                lastPlayed=data.get("lastPlayed"),
                syncedAt=data.get("syncedAt", ""),
                scenarioCount=len(data.get("completedScenarios", [])),
            ))
        except Exception:
            continue

        if len(students) >= limit:
            break

    return students

# ── Teacher: Delete Student Record ───────────────────────────────────────────
@app.delete("/api/teacher/students/{name}")
async def delete_student(
    name: str,
    x_teacher_token: Optional[str] = None,
):
    _require_teacher(x_teacher_token)
    fpath = _student_file(name)
    if fpath.exists():
        fpath.unlink()
        return {"ok": True, "message": f"Deleted {name}"}
    raise HTTPException(404, "Student not found")

# ── Teacher: Export All ──────────────────────────────────────────────────────
@app.get("/api/teacher/export")
async def export_all(x_teacher_token: Optional[str] = Header(None, alias="X-Teacher-Token")):
    """Export all student data as a single JSON (for backup/restore)."""
    _require_teacher(x_teacher_token)

    all_data = {}
    for fpath in DATA_DIR.glob("*.json"):
        try:
            all_data[fpath.stem] = json.loads(fpath.read_text())
        except Exception:
            continue

    return JSONResponse(
        content=all_data,
        headers={"Content-Disposition": "attachment; filename=fc_backup.json"},
    )

# ── Teacher: Import ───────────────────────────────────────────────────────────
def _safe_stem(stem: str) -> Optional[str]:
    """Validate a backup key (filename stem) — reject anything that could escape DATA_DIR.

    Mirrors `_student_file()` sanitization: alnum + `_` + `-`, must be non-empty.
    Rejects if the original stem contains characters that would be stripped
    (e.g. `../etc/passwd` → `etcpasswd` is unsafe-looking, even though path
    can't escape — we want to surface the attempt, not silently rename it).
    """
    if not stem or not isinstance(stem, str):
        return None
    safe = "".join(c for c in stem if c.isalnum() or c in ("_", "-")).strip()
    if not safe:
        return None
    # Reject if sanitization altered the stem — operator probably mistyped a
    # path-like key. Keeps `/api/teacher/students` listings clean.
    if safe != stem.strip():
        return None
    return safe


def _merge_student_records(existing: dict, incoming: dict) -> dict:
    """Merge two student records. Mirrors `/api/sync` semantics:

    - completedScenarios: union
    - totalMoralScore: max
    - topicProgress / subjectProgress: per-key take max(completed) and max(total)
    - lastPlayed: latest non-empty
    - syncedAt: max timestamp
    - name / deviceId: incoming wins (most recent)
    """
    name = incoming.get("name") or existing.get("name", "")
    merged = {
        "name": name,
        "completedScenarios": list(
            set(existing.get("completedScenarios", []) + incoming.get("completedScenarios", []))
        ),
        "topicProgress": {},
        "subjectProgress": {},
        "totalMoralScore": max(
            existing.get("totalMoralScore", 0) or 0,
            incoming.get("totalMoralScore", 0) or 0,
        ),
        "lastPlayed": incoming.get("lastPlayed") or existing.get("lastPlayed"),
        "syncedAt": max(
            existing.get("syncedAt", "") or "",
            incoming.get("syncedAt", "") or "",
        ),
        "deviceId": incoming.get("deviceId") or existing.get("deviceId"),
    }

    # Topic progress: per-topic max(completed), max(total)
    tp_existing = existing.get("topicProgress", {}) or {}
    tp_incoming = incoming.get("topicProgress", {}) or {}
    for tid in set(tp_existing) | set(tp_incoming):
        a = tp_existing.get(tid, {}) or {}
        b = tp_incoming.get(tid, {}) or {}
        merged["topicProgress"][tid] = {
            "completed": max(a.get("completed", 0) or 0, b.get("completed", 0) or 0),
            "total": max(a.get("total", 0) or 0, b.get("total", 0) or 0),
        }

    # Subject progress: same pattern
    sp_existing = existing.get("subjectProgress", {}) or {}
    sp_incoming = incoming.get("subjectProgress", {}) or {}
    for sid in set(sp_existing) | set(sp_incoming):
        a = sp_existing.get(sid, {}) or {}
        b = sp_incoming.get(sid, {}) or {}
        merged["subjectProgress"][sid] = {
            "completed": max(a.get("completed", 0) or 0, b.get("completed", 0) or 0),
            "total": max(a.get("total", 0) or 0, b.get("total", 0) or 0),
        }

    # Streak: take the record with the longer current streak
    s_in = incoming.get("streak") or {}
    s_ex = existing.get("streak") or {}
    if s_in or s_ex:
        merged["streak"] = (
            s_in
            if (s_in.get("current", 0) or 0) >= (s_ex.get("current", 0) or 0)
            else s_ex
        )

    return merged


@app.post("/api/teacher/import")
async def import_students(
    x_teacher_token: Optional[str] = Header(None, alias="X-Teacher-Token"),
    file: UploadFile = File(...),
    merge: bool = Form(True),
):
    """Import a JSON backup produced by `/api/teacher/export`.

    Body: multipart/form-data with a `file` field (the JSON).
    Form: `merge=true` (default) merges with existing records; `merge=false` overwrites.

    Returns: {ok, written, skipped, replaced, merge}
    """
    _require_teacher(x_teacher_token)

    # Read & parse
    raw = await file.read()
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(400, f"Invalid JSON: {e.msg} at line {e.lineno}")

    if not isinstance(payload, dict):
        raise HTTPException(400, "Backup must be a JSON object keyed by student stem")

    written: list[str] = []
    replaced: list[str] = []
    skipped: list[str] = []
    merged_count = 0

    for stem, record in payload.items():
        safe = _safe_stem(stem)
        if not safe or not isinstance(record, dict):
            skipped.append(str(stem))
            continue
        if "name" not in record:
            skipped.append(stem)
            continue

        out_path = DATA_DIR / f"{safe}.json"
        if out_path.exists() and merge:
            try:
                existing = json.loads(out_path.read_text())
            except Exception:
                existing = {}
            final = _merge_student_records(existing, record)
            merged_count += 1
        else:
            # New file (or replace mode): sanitize record, ensure name present
            final = {
                "name": record.get("name", safe),
                "completedScenarios": list(record.get("completedScenarios", []) or []),
                "topicProgress": dict(record.get("topicProgress", {}) or {}),
                "subjectProgress": dict(record.get("subjectProgress", {}) or {}),
                "totalMoralScore": int(record.get("totalMoralScore", 0) or 0),
                "lastPlayed": record.get("lastPlayed"),
                "syncedAt": record.get("syncedAt", "") or "",
                "deviceId": record.get("deviceId"),
            }
            if out_path.exists():
                replaced.append(safe)

        out_path.write_text(json.dumps(final, ensure_ascii=False, indent=2))
        written.append(safe)

    return {
        "ok": True,
        "merge": merge,
        "written": written,
        "replaced": replaced,
        "merged": merged_count,
        "skipped": skipped,
    }

# ── Static files (serves built app if running from project root) ─────────────
dist_path = Path(__file__).parent.parent / "dist"
if dist_path.exists():
    app.mount("/", StaticFiles(directory=str(dist_path), html=True), name="static")

# ── Cleanup expired tokens every hour ───────────────────────────────────────
@app.on_event("startup")
async def startup():
    # Clean up expired tokens
    now = time.time()
    for token, expiry in list(TEACHER_TOKENS.items()):
        if expiry < now:
            del TEACHER_TOKENS[token]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:fastapi", host="0.0.0.0", port=8000, reload=True)