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

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
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

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

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
async def export_all(x_teacher_token: Optional[str] = None):
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
@app.post("/api/teacher/import")
async def import_students(x_teacher_token: Optional[str] = None, background: BackgroundTasks = None):
    """Import a JSON backup (multipart file upload)."""
    # For now, let the frontend handle import via sync endpoint
    # This endpoint is for full backup restore
    raise HTTPException(501, "Import via file upload not yet implemented — use sync endpoint")

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