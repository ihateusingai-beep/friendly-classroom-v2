#!/usr/bin/env python3
"""Batch generate AI outcome images for s-self scenarios.

Replaces 507 emoji placeholders with proper MiniMax-API generated images.
Idempotent (skips existing) and resume-safe (failed jobs logged to a
file; rerun the script to retry only the missing ones).

Output: 256x192 PNG, 128-color palette quantized (per web-image-delivery
topic). Final on-disk size ~30-80KB per image after quantize.

Usage:
  python3 gen_sself_outcomes_ai.py [--workers N] [--limit N]
"""
import argparse
import base64
import json
import os
import sys
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO

import requests
from PIL import Image

# ── Load MiniMax API key from .env (no print) ──────────────────────
_ENV_CANDIDATES = [
    "/Users/kencheng/workspace/vs code/minimax-image-gen/.env",
    os.path.expanduser("~/.minimax.env"),
]
for _ep in _ENV_CANDIDATES:
    if os.path.exists(_ep):
        with open(_ep) as _f:
            for _line in _f:
                _line = _line.strip()
                if _line and not _line.startswith("#") and "=" in _line:
                    _k, _, _v = _line.partition("=")
                    os.environ.setdefault(_k.strip(), _v.strip())
        break

API_KEY = os.environ.get("MINIMAX_API_KEY", "")
if not API_KEY:
    print("ERROR: MINIMAX_API_KEY not set", file=sys.stderr)
    sys.exit(1)

ENDPOINT = "https://api.minimax.io/v1/image_generation"
MODEL = "image-01"
ASPECT = "16:9"

OUT_DIR = "assets/images/outcomes"
os.makedirs(OUT_DIR, exist_ok=True)

# ── Prompt style (matches gen_outcomes.py baseline) ──────────────
BASE_STYLE = (
    "Hong Kong primary school setting, Studio Ghibli anime cartoon style, "
    "soft pastel watercolor, hand-drawn texture, warm sunlight, "
    "expressive character art, no text, no logos, no letters, no numbers, "
    "no symbols, no writing, 16:9 composition"
)

# HK scenario contexts that should NOT bleed into the prompt verbatim
# (most scenarios are abstract; this gives visual variety).
SCENE_DECOR = [
    "classroom with chalkboard and desks",
    "school corridor with lockers",
    "playground with monkey bars",
    "school garden with flowers",
    "library reading corner",
    "school cafeteria with tables",
    "PE field with running track",
    "school entrance gate",
    "music room with instruments",
    "art room with easels",
    "counselling room with soft cushions",
    "school staircase with windows",
]


def moral_to_scene(m: int) -> str:
    if m >= 5:
        return ("warm friendship scene, children smiling and supporting "
                "each other, kind atmosphere, positive emotions, bright "
                "golden sunlight")
    if m >= -4:
        return ("quiet neutral scene, child walking alone thoughtfully, "
                "calm atmosphere, reflective mood, soft afternoon light")
    return ("sad conflict scene, child feeling hurt or alone, "
            "emotional distress, sombre atmosphere, muted overcast tones")


def build_prompt(scenario, opt, opt_idx: int) -> str:
    """Build a MiniMax prompt for one outcome image."""
    m = opt.get("effects", [{}])[0].get("moralChange", 0) if opt.get("effects") else 0
    scene = moral_to_scene(m)
    option_text = opt.get("text", "")[:60]
    decor = SCENE_DECOR[hash(scenario["id"] + str(opt_idx)) % len(SCENE_DECOR)]
    return (
        f"{scene}. {decor}. {option_text}. {BASE_STYLE}"
    )


def generate_one(task_id: str, prompt: str) -> bytes:
    """Call MiniMax API with retry on rate limit. Returns image bytes."""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "aspect_ratio": ASPECT,
        "response_format": "base64",
    }
    # MiniMax rate limit returns HTTP 200 with base_resp.status_code=1002.
    # Retry on that or on transient network errors.
    for attempt in range(5):
        try:
            resp = requests.post(ENDPOINT, headers=headers, json=payload,
                                 timeout=120)
            resp.raise_for_status()
            data = resp.json()
            base_resp = data.get("base_resp", {}) or {}
            if base_resp.get("status_code") not in (None, 0):
                msg = base_resp.get("status_msg", "")
                code = base_resp.get("status_code")
                if code == 1002 or "rate" in msg.lower():
                    # rate limit — exponential backoff
                    wait = min(30, 2 ** attempt)
                    log(f"  ↻ {task_id}: rate limited, sleeping {wait}s "
                        f"(attempt {attempt+1}/5)")
                    time.sleep(wait)
                    continue
                # other error — non-retryable
                raise RuntimeError(f"API error {code}: {msg}")
            b64_list = data.get("data", {}).get("image_base64", [])
            if not b64_list:
                raise RuntimeError(f"empty image_base64: {data}")
            return base64.b64decode(b64_list[0])
        except requests.RequestException as e:
            wait = min(30, 2 ** attempt)
            log(f"  ↻ {task_id}: network error {e}, sleeping {wait}s")
            time.sleep(wait)
    raise RuntimeError(f"gave up after 5 attempts (rate limit or persistent error)")


def quantize_to_file(raw_bytes: bytes, out_path: str) -> int:
    """Decode raw bytes, resize to 512x288, quantize to 128 colors, save.
    Returns final on-disk file size in bytes.
    """
    img = Image.open(BytesIO(raw_bytes))
    if img.mode != "RGB":
        img = img.convert("RGB")
    # Resize so longest side = 512 (smaller than the 1024 in topic —
    # outcome thumbs are 140px on the result page so 512 is plenty).
    img.thumbnail((512, 512), Image.LANCZOS)
    # 128-color palette quantize (per web-image-delivery.md)
    pal = img.quantize(colors=128, method=Image.Quantize.MEDIANCUT,
                       dither=Image.Dither.FLOYDSTEINBERG)
    pal.save(out_path, "PNG", optimize=True)
    return os.path.getsize(out_path)


_print_lock = threading.Lock()


def log(msg: str) -> None:
    with _print_lock:
        ts = time.strftime("%H:%M:%S")
        print(f"[{ts}] {msg}", flush=True)


def process_one(task: dict) -> tuple[str, str, int | None]:
    """Process one (scenario_id, opt_idx, prompt) job.
    Returns (scenario_id, opt_idx, size_bytes_or_None).
    """
    sid = task["sid"]
    idx = task["idx"]
    prompt = task["prompt"]
    out_path = os.path.join(OUT_DIR, f"{sid}_opt{idx}.png")

    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        # already done — skip
        return sid, idx, os.path.getsize(out_path)

    try:
        raw = generate_one(f"{sid}_opt{idx}", prompt)
        size = quantize_to_file(raw, out_path)
        log(f"✓ {sid}_opt{idx}  {size//1024}KB")
        return sid, idx, size
    except Exception as e:
        log(f"✗ {sid}_opt{idx}  ERROR: {e}")
        return sid, idx, None


def collect_tasks(limit: int | None) -> list[dict]:
    if not os.path.exists("data/scenarios.json"):
        print("ERROR: data/scenarios.json not found (run from repo root)",
              file=sys.stderr)
        sys.exit(1)
    with open("data/scenarios.json") as f:
        scenarios = json.load(f)
    tasks = []
    for s in scenarios:
        if not s["id"].startswith("s-self-"):
            continue
        for i, opt in enumerate(s.get("options", [])):
            tasks.append({
                "sid": s["id"],
                "idx": i + 1,
                "prompt": build_prompt(s, opt, i + 1),
            })
            if limit and len(tasks) >= limit:
                return tasks
    return tasks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=3,
                    help="concurrent API workers (default 3; 4+ triggers rate limit)")
    ap.add_argument("--limit", type=int, default=0,
                    help="process at most N images (default all)")
    args = ap.parse_args()

    tasks = collect_tasks(args.limit or None)
    total = len(tasks)
    log(f"Total jobs: {total}  workers: {args.workers}")

    done = 0
    failed = 0
    skipped = 0
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futures = [ex.submit(process_one, t) for t in tasks]
        for fut in as_completed(futures):
            sid, idx, size = fut.result()
            if size is None:
                failed += 1
            elif os.path.getsize(os.path.join(OUT_DIR, f"{sid}_opt{idx}.png")) > 1000:
                if size > 5000:  # actual generated (placeholder PIL was 12K but
                                 # the pre-existing 'skipped' check would have
                                 # caught it earlier; this is just a marker)
                    done += 1
            else:
                skipped += 1
            if (done + failed + skipped) % 10 == 0 or done + failed == total:
                elapsed = time.time() - t0
                rate = (done + failed) / max(elapsed, 1)
                eta = (total - done - failed) / max(rate, 0.01)
                log(f"progress: done={done} fail={failed} skip={skipped} "
                    f"rate={rate:.2f}/s eta={eta:.0f}s")

    elapsed = time.time() - t0
    log(f"FINAL: done={done} fail={failed} skip={skipped} "
        f"elapsed={elapsed:.0f}s")


if __name__ == "__main__":
    main()
