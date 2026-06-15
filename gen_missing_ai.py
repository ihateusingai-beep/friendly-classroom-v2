#!/usr/bin/env python3
"""Batch generate missing AI images (outcomes + scenario covers) for
scenarios that are missing one or both.

Reuses the gen_sself_outcomes_ai.py infrastructure: MiniMax API,
128-color PIL quantize, rate-limit retry. Generalised to all
scenario categories (s-bn, s-cm, s-dl, s-ni, s-self, etc).

Wholesome-prompt fallback: if the API returns success_count=0
(content filter refusal), retry with a softened prompt that
emphasises "wholesome, educational, no conflict".

Run from repo root:
  python3 gen_missing_ai.py
"""
import argparse
import base64
import json
import os
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO

import requests
from PIL import Image

# Reuse infrastructure from gen_sself_outcomes_ai
sys.path.insert(0, ".")
from gen_sself_outcomes_ai import (
    API_KEY, ENDPOINT, MODEL, ASPECT,
    BASE_STYLE, SCENE_DECOR, moral_to_scene,
    log, _print_lock,
)

# Paths
SC_OUT_DIR = "assets/images/outcomes"
SC_SCEN_DIR = "assets/images/scenarios"
os.makedirs(SC_OUT_DIR, exist_ok=True)
os.makedirs(SC_SCEN_DIR, exist_ok=True)


def build_outcome_prompt(scenario, opt, opt_idx: int) -> str:
    """Build prompt for an outcome image."""
    m = opt.get("effects", [{}])[0].get("moralChange", 0) if opt.get("effects") else 0
    scene = moral_to_scene(m)
    option_text = opt.get("text", "")[:60]
    decor = SCENE_DECOR[hash(scenario["id"] + str(opt_idx)) % len(SCENE_DECOR)]
    return f"{scene}. {decor}. {option_text}. {BASE_STYLE}"


def build_scenario_prompt(scenario) -> str:
    """Build prompt for a scenario cover image. The cover sets the
    scene; the title + background establish context. Avoid moral
    descriptors (those belong on outcomes) — just the setup.
    """
    title = scenario.get("title", "")
    bg = scenario.get("background", "")[:80]
    decor = SCENE_DECOR[hash(scenario["id"]) % len(SCENE_DECOR)]
    return (
        f"A child arriving at a meaningful moment. {decor}. "
        f"{bg}. {title}. {BASE_STYLE}"
    )


WHOLESOME_SUFFIX = (
    " wholesome educational illustration for children, no conflict, "
    "no weapons, no politics, peaceful and kind scene"
)


def generate_one(task_id: str, prompt: str) -> bytes:
    """Call MiniMax API. Retry on rate limit (1002) and content refusal
    (200 + empty image_base64). For content refusal, retry with a
    softened/wholesome-flavored prompt.
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    last_err = None
    for attempt in range(4):
        # Try the current prompt; on refusal, swap to softened variant.
        cur_prompt = prompt
        if attempt >= 2:
            cur_prompt = prompt + WHOLESOME_SUFFIX
        payload = {
            "model": MODEL,
            "prompt": cur_prompt,
            "aspect_ratio": ASPECT,
            "response_format": "base64",
        }
        try:
            resp = requests.post(ENDPOINT, headers=headers, json=payload,
                                 timeout=120)
            resp.raise_for_status()
            data = resp.json()
            base_resp = data.get("base_resp", {}) or {}
            if base_resp.get("status_code") not in (None, 0):
                code = base_resp.get("status_code")
                msg = base_resp.get("status_msg", "")
                if code == 1002 or "rate" in msg.lower():
                    wait = min(30, 2 ** attempt)
                    log(f"  ↻ {task_id}: rate limited, sleep {wait}s")
                    time.sleep(wait)
                    continue
                raise RuntimeError(f"API error {code}: {msg}")
            b64_list = data.get("data", {}).get("image_base64", [])
            meta = data.get("metadata", {}) or {}
            success = int(meta.get("success_count", 1))
            if not b64_list or success == 0:
                # Content filter — try with softened prompt next attempt
                log(f"  ↻ {task_id}: content refusal, "
                    f"will retry with wholesome tweak")
                time.sleep(2)
                continue
            return base64.b64decode(b64_list[0])
        except requests.RequestException as e:
            last_err = e
            wait = min(30, 2 ** attempt)
            log(f"  ↻ {task_id}: network {e}, sleep {wait}s")
            time.sleep(wait)
    raise RuntimeError(f"gave up after 4 attempts: {last_err}")


def quantize(raw_bytes: bytes, out_path: str) -> int:
    """Decode, resize, 128-color quantize, save. Returns file size."""
    img = Image.open(BytesIO(raw_bytes))
    if img.mode != "RGB":
        img = img.convert("RGB")
    img.thumbnail((512, 512), Image.LANCZOS)
    pal = img.quantize(colors=128, method=Image.Quantize.MEDIANCUT,
                       dither=Image.Dither.FLOYDSTEINBERG)
    pal.save(out_path, "PNG", optimize=True)
    return os.path.getsize(out_path)


def collect_missing_tasks() -> list[dict]:
    """Find all missing outcome + scenario cover images."""
    with open("data/scenarios.json") as f:
        scenarios = json.load(f)
    tasks = []
    have_out = set(os.listdir(SC_OUT_DIR))
    have_sc = set(os.listdir(SC_SCEN_DIR))
    for s in scenarios:
        sid = s["id"]
        # outcome images
        for i in range(len(s.get("options", []))):
            fn = f"{sid}_opt{i+1}.png"
            if fn not in have_out:
                opt = s["options"][i]
                tasks.append({
                    "kind": "outcome",
                    "sid": sid,
                    "idx": i + 1,
                    "out_path": os.path.join(SC_OUT_DIR, fn),
                    "prompt": build_outcome_prompt(s, opt, i + 1),
                })
        # scenario cover
        if f"{sid}.png" not in have_sc:
            tasks.append({
                "kind": "scenario",
                "sid": sid,
                "idx": 0,
                "out_path": os.path.join(SC_SCEN_DIR, f"{sid}.png"),
                "prompt": build_scenario_prompt(s),
            })
    return tasks


def process_one(task: dict) -> tuple[str, str, int | None]:
    """Generate one image, save to disk. Returns (kind, task_id, size)."""
    task_id = f"{task['kind']}:{task['sid']}" + (
        f"_opt{task['idx']}" if task["kind"] == "outcome" else ""
    )
    try:
        raw = generate_one(task_id, task["prompt"])
        size = quantize(raw, task["out_path"])
        log(f"✓ {task_id}  {size//1024}KB")
        return task["kind"], task_id, size
    except Exception as e:
        log(f"✗ {task_id}  ERROR: {e}")
        return task["kind"], task_id, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=3)
    args = ap.parse_args()

    tasks = collect_missing_tasks()
    log(f"Total missing: {len(tasks)} images  workers: {args.workers}")

    if not tasks:
        log("Nothing to do — all images present")
        return

    outcomes = sum(1 for t in tasks if t["kind"] == "outcome")
    scenarios = sum(1 for t in tasks if t["kind"] == "scenario")
    log(f"  outcomes: {outcomes}  scenarios: {scenarios}")

    done = 0
    failed = 0
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futures = [ex.submit(process_one, t) for t in tasks]
        for fut in as_completed(futures):
            kind, task_id, size = fut.result()
            if size is None:
                failed += 1
            else:
                done += 1
            elapsed = time.time() - t0
            total = done + failed
            if total % 5 == 0 or total == len(tasks):
                rate = total / max(elapsed, 1)
                eta = (len(tasks) - total) / max(rate, 0.01)
                log(f"progress: done={done} fail={failed} "
                    f"rate={rate:.2f}/s eta={eta:.0f}s")

    elapsed = time.time() - t0
    log(f"FINAL: done={done} fail={failed} elapsed={elapsed:.0f}s")


if __name__ == "__main__":
    main()
