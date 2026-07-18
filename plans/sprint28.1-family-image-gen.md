# Sprint 28.1 — Family Domain Image Generation Patch

> **Goal:** Add scenario illustrations for the 30 Family Domain scenarios (15 healthy-eating + 15 screen-time) shipped in v2.13.0.
> **Status:** Plan only. **Not yet executed.**
> **Parent plan:** BUILD_LOG.md v2.13.0 entry line 121: *"Sprint 28.1 可以 patch 加 60 張 image (`<topic>_<scenario>-<role>.png` 16:9)."*
> **Branch target:** `feat/family-life-domain-pilot` → merge into `main` after `npm run build` clean.

---

## 0. Recap — What already exists (from probes)

| Asset / source | Path | Lines / items | Use |
|---|---|---|---|
| Scenario fallback renderer | `src/engine.js:1300` | `<img src="${escapeAttr(s.scenarioImage \|\| 'assets/images/scenarios/${s.id}.png')}" ...>` | Fallback = `<id>.png`, **no schema change needed** if we drop PNG at `<id>.png` |
| Image source-of-truth | `assets/images/scenarios/` | 260 existing PNGs (e.g. `s-c2.png`, `s-new1.png`) | Source of truth; prebuild-sync mirrors to `public/assets/images/scenarios/` |
| Style guide | `assets/images/scenarios/BATCH2_PROMPTS_HQ.md` | 50+ exemplar prompts | "Hong Kong primary school, anime cartoon style, warm tones, expressive character art, no text, no logos, 16:9" |
| Existing image-gen pipeline | `tools/expansion/gen_new_images.py` | 116 LoC, MiniMax image-01, reads `scenario.imagePrompt` per scenario, batch-skip-existing, 180s timeout, fallback "no imagePrompt" prompt | **Reusable as-is** — sole addition = `imagePrompt` field per new scenario |
| Prebuild sync | `prebuild-sync.sh` | rsync --update --delete + .md/.txt/.json exclusion | Idempotent mirror to `public/assets/images/`. Already wired to `npm run build` via `prebuild` hook |
| Existing tests | `tests/sprint28-family-domain.test.js` | 28 invariants | Already pinned v2.13.0 ship; **must NOT regress** |

---

## 1. Critical schema observation — this is the lock-in decision

**Current state of the 30 new scenarios:**

```jsonc
// data/scenarios/healthy-eating.json (excerpt — he-1)
{
  "id": "he-1",
  "title": "媽媽煮了青菜，你想吃薯條",
  ...
  "description": "媽媽今天煮了翠玉瓜炒蛋...",
  "hints": [...],
  "options": [...],
  // ❌ NO scenarioImage, NO scenarioImageAlt, NO imagePrompt
}
```

**The renderer at `src/engine.js:1300`:**

```html
<img src="${escapeAttr(s.scenarioImage || `assets/images/scenarios/${s.id}.png`)}"
     alt="${escapeAttr(s.scenarioImageAlt || s.title)}" ...>
```

**→ Insight:** Because the fallback is `<id>.png`, **NO schema change is required** to make the images appear at runtime. Just drop a 16:9 PNG at `assets/images/scenarios/he-1.png` (or `st-1.png`) and `npm run build` will ship it via `prebuild-sync.sh`.

The only two non-shipping choices:
- **Persist `imagePrompt` in JSON?** — only needed if we add `imagePrompt` to schema for future re-gen. v2.13.0 scenarios don't have it. Recommendation: **YES add it now** to lock generation provenance and let regen be idempotent.
- **Persist `scenarioImage` / `scenarioImageAlt`?** — Optional. If we want to override path (e.g. role-specific image via `<id>-<role>.png`), set it explicitly. For v2.13.0 base set, leave implicit and rely on `<id>.png` fallback.

---

## 2. Decision matrix — 60 vs 90 vs 30 images

Total work = scenarios × illustrations.

| Scenarios | Illustrations per scenario | Total PNGs | Token cost (image-01, ~¥0.5/img) | Wall-clock (sequential, ~12s/img) | Use case |
|---|---|---|---|---|---|
| 30 | **1** (one main scene) | **30** | ~¥15 | ~6 min | Baseline — sprint 28.1 ships here ✅ |
| 30 | **2** (main + option-A outcome) | **60** | ~¥30 | ~12 min | Adds "what good looks like" reward image per pick |
| 30 | **3** (main + good + bad) | **90** | ~¥45 | ~18 min | Triple — matches existing 744 outcome images' footprint |
| 60 (old+sprint 28) | 1 | 60 | ~¥30 | ~12 min | If filling older domains' gaps alongside |

### My recommendation: **30 images (1 per scenario)** for v28.1 base ship.

Why:
1. **Smallest blast radius.** No outcome rewrite, no schema migration. ~6 min gen.
2. **Matches what the existing renderer expects.** Fallback already handles 1 image.
3. **Honest about risk.** First image-gen round is the right place to learn style drift before mass-producing. Style drift × 60 = 3× rework cost.
4. **Token ceiling.** ¥15 = well under any user-token budget for a one-off patch. ¥45 = do-able but you might pay again for tone adjustments.

**v28.2 (later)** can expand to 60 (add good-outcome image) or 90 (add bad-outcome) using the same `imagePrompt` field for re-gen.

---

## 3. Naming + folder placement

Two options:

| Option | Layout | Pro | Con |
|---|---|---|---|
| **A. Inline** | `assets/images/scenarios/he-1.png` | Matches existing 260 (e.g. `s-c2.png`, `s-new1.png`); zero fallback changes | Heaps all 290 scenarios in one folder (`ls` gets noisy) |
| **B. Subfolder per topic** | `assets/images/scenarios/family/healthy-eating/he-1.png` | Cleaner separation; future `family/screen-time/` etc. scale | Renderer fallback (`${s.id}.png`) **breaks** — every new scenario needs explicit `scenarioImage` field in JSON, OR renderer patched to check subfolder |

**Recommendation: Option A** for v28.1, **Option B** if we exceed ~300 scenarios (~30 per topic in one folder = still scannable, >50 = switch).

If we want each topic grouped without renderer patch, compromise: **add `scenarioImage: "assets/images/scenarios/he-1.png"` to all 30 JSON entries** for explicitness — even though it's same path as fallback, it makes intent clear and lets us grep `"scenarioImage"` to see coverage.

---

## 4. Visual content matrix — what to draw

Sprint 27 mandate: **warm tone, primary-school appropriate, SEN/ASD/MID-friendly**. Avoid:
- Cluttered backgrounds
- Realistic faces (lure uncanny-valley)
- Dark themes (anxiety risk)
- Any text/logos inside the picture (i18n broken otherwise)

Each `he-*` / `st-*` scenario has:
- **`title`** — short setup label
- **`description`** — 30–60 字 Chinese prose, mentions characters + setting + props

**Suggested visual brief per scenario:**

```
[Visual Brief for he-1]
- Anchor characters: child (主角) + mother (家人). Use the same 小明-ish protagonist
  across he-* for consistency (mirrors emotion-detective's single-character anchor).
- Setting: 翠玉瓜炒蛋 dinner → dining table → warm kitchen light.
- Props: 一碟青菜 + 一碟薯條, 母子坐對面.
- Emotion body language: child 輕微好奇 (not angry), mother 微笑 (welcoming).
- Style: anime cartoon, soft pastel, warm tones (amber #F59E0B family theme).
- Composition: 16:9 wide — child left-of-center, mom right, food table top-down hint.
- No text, no logos. 1376×768 (matches ED baseline).
```

**For screen-time (`st-*`):**
- Same character (小明 continued), with `iPad`/`phone`/`laptop` as primary prop.
- Bedtime scenes = warm bedroom, low light.
- Stranger-DM scenario (riskLevel 2) = child looking worried + phone screen glow + abstract notification icon (NOT real text).
- Cyberbullying = child looking sad + phone face-down.

This stays consistent with Sprint 23's single-anchor-character trick — easier for SEN kids to track the protagonist.

---

## 5. Image generation workflow (step-by-step)

### 5.1 Pre-flight

```bash
cd ~/workspace/friendly-classroom-v2
git checkout feat/family-life-domain-pilot   # ensure on right branch
git pull                                       # fetch latest from origin (or just stay local)
```

### 5.2 Populate `imagePrompt` for the 30 scenarios

**Two routes:**

**(a) Inline — add `imagePrompt` to each scenario JSON** (recommended)
- Pros: schema-clean, re-runnable, future regen no re-prompting
- Cons: 60-line JSON diff × 2 files

**(b) Inline in gen script** (faster initial patch, but future-gen needs re-prompting)
- Pros: zero schema diff
- Cons: needs re-prompt for any regen, "single source of truth" violation

**Going with (a).** I'll author 30 EN visual prompts (mirroring `BATCH2_PROMPTS_HQ.md` style), append to each scenario, no `scenarioImage`/`scenarioImageAlt` change (rely on fallback).

**Prompt template per scenario:**
```
A [C1 main child + C2 secondary character] in [SETTING], 
[ACTION/PROPS key visual]. Mood: [emotional tone — softened, never harsh]. 
Hong Kong primary school / home environment, anime cartoon style, 
warm tones, expressive character art, soft pastel, no text, no logos, 
16:9 aspect ratio
```

### 5.3 Image generation script (`tools/expansion/gen_family_images.py`)

**Pattern source:** clone `tools/expansion/gen_new_images.py`, specialise:

```python
#!/usr/bin/env python3
"""
gen_family_images.py — Sprint 28.1
Family-domain scenario illustrations:
  15 healthy-eating (he-1..he-15) + 15 screen-time (st-1..st-15) = 30 PNGs.

Reuses the existing MiniMax image-01 pipeline (mirrors gen_new_images.py).
Idempotent: skips existing PNGs >1KB.
"""
import os, json, time, base64, urllib.request, urllib.error
from pathlib import Path

# Load API key (same env path as gen_new_images.py)
API_KEY = None
env_path = Path("/Users/kencheng/workspace/vs code/minimax-image-gen/.env")
with open(env_path) as f:
    for line in f:
        if line.startswith("MINIMAX_API_KEY="):
            API_KEY = line.strip().split("=", 1)[1].strip()
            break
if not API_KEY:
    raise SystemExit("MINIMAX_API_KEY not found")

ROOT = Path("/Users/kencheng/workspace/friendly-classroom-v2")
OUT_DIR = ROOT / "assets" / "images" / "scenarios"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Load all chunks, flatten, filter to family domain
CHUNKS = ["healthy-eating.json", "screen-time.json"]
scenarios = []
for chunk in CHUNKS:
    with open(ROOT / "data" / "scenarios" / chunk) as f:
        scenarios.extend(json.load(f))
print(f"[start] family scenarios: {len(scenarios)}")

ok, skipped, errors = 0, 0, []
for i, s in enumerate(scenarios):
    sid = s["id"]
    out_path = OUT_DIR / f"{sid}.png"
    if out_path.exists() and out_path.stat().st_size > 1000:
        print(f"[{i+1}/{len(scenarios)}] SKIP {sid} (exists)")
        skipped += 1
        continue

    prompt = s.get("imagePrompt", "")
    if not prompt:
        errors.append(sid)
        print(f"[{i+1}/{len(scenarios)}] WARN {sid} no imagePrompt in JSON — skipping")
        continue

    # 16:9 guard
    if "16:9" not in prompt and "aspect" not in prompt.lower():
        prompt = prompt + ", 16:9"

    payload = {
        "model": "image-01",
        "prompt": prompt,
        "aspect_ratio": "16:9",
        "response_format": "base64",
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://api.minimax.io/v1/image_generation",
        data=data,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            body = json.loads(resp.read())
        # Same decode pattern as gen_new_images.py (matrix MCP returns
        # either url or b64_json — handle both for safety)
        data_field = body.get("data", [])
        if not data_field:
            raise RuntimeError(f"empty data: {body}")
        item = data_field[0]
        if "b64_json" in item:
            img_bytes = base64.b64decode(item["b64_json"])
        elif "url" in item:
            with urllib.request.urlopen(item["url"], timeout=60) as r:
                img_bytes = r.read()
        else:
            raise RuntimeError(f"unknown data shape: {item.keys()}")
        out_path.write_bytes(img_bytes)
        size_kb = len(img_bytes) / 1024
        print(f"[{i+1}/{len(scenarios)}] OK   {sid} → {size_kb:.0f}KB")
        ok += 1
        time.sleep(0.5)  # gentle rate-limit cushion
    except Exception as e:
        errors.append(sid)
        print(f"[{i+1}/{len(scenarios)}] ERR  {sid}: {e}")

print(f"\n=== DONE === ok={ok} skip={skipped} err={len(errors)}")
if errors:
    print("errors:", errors)
```

### 5.4 Run

```bash
cd ~/workspace/friendly-classroom-v2
python3 tools/expansion/gen_family_images.py    # ~6 min sequential, ~12s/img + 0.5s sleep
```

### 5.5 Verify artifacts

```bash
ls assets/images/scenarios/ | grep -E "^(he|st)-" | sort | head -32     # expect 30
find assets/images/scenarios -name "he-*.png" -o -name "st-*.png" | wc -l   # expect 30
# Quick magic-byte sanity:
file assets/images/scenarios/he-1.png   # JPEG-in-PNG-extension (existing pattern), or PNG; both fine
```

### 5.6 Prebuild sync + build

```bash
cd ~/workspace/friendly-classroom-v2
./prebuild-sync.sh                          # mirrors assets → public
ls public/assets/images/scenarios/ | grep -E "^(he|st)-" | wc -l   # expect 30 — confirms sync worked
npm run build                               # vite production build
```

### 5.7 Visual QA — option A (low-effort)

Sample 6 PNGs (he-1, he-3, he-7, st-1, st-3, st-7) with `qlmanage -t -s 1376x768 -o /tmp` to generate thumbnails, open in Preview, eyeball:

- Anchor character looks consistent across samples? ✅ or ⚠️
- Warm tone, no text/logos? ✅ or ⚠️
- Children look SEN-friendly (not creepy)? ✅ or ⚠️
- Setting matches scenario description? ✅ or ⚠️

If any ⚠️ — regen with refined prompt, document in a `BATCH3_PROMPTS_HQ.md` for future regen.

### 5.8 Tests + audit

```bash
cd ~/workspace/friendly-classroom-v2
npm test                                     # AC1: existing 403 still pass + new image-coverage invariants
```

**Add new invariants** to a `tests/sprint28-1-family-images.test.js`:

1. **Asset presence**: each of 30 scenarios in `healthy-eating.json` + `screen-time.json` has corresponding PNG in `assets/images/scenarios/`
2. **PNG ≥ 1KB**: skip 0-byte / broken files
3. **Prompt coverage**: each scenario in the two topic files has `imagePrompt` field (string, ≥100 chars, contains "16:9")
4. **Sync parity**: every PNG in `assets/images/scenarios/he-*.png` mirrors to `public/assets/images/scenarios/`
5. **No schema break**: `scenarioImage` field is still optional in all data files (renderer fallback still works for pre-v28 scenarios that may not have it)

That's 5 invariants, plus 28 existing = 33 in the next test pass. Should give ~410-420 passed.

### 5.9 Commit + (deferred) push

```bash
cd ~/workspace/friendly-classroom-v2

# Stage carefully — 30 PNGs + 2 JSON files + 1 script + 1 test file
git add data/scenarios/healthy-eating.json data/scenarios/screen-time.json
git add assets/images/scenarios/he-*.png assets/images/scenarios/st-*.png
git add tools/expansion/gen_family_images.py
git add tests/sprint28-1-family-images.test.js

# Pre-commit guard: confirm staged list (per memory rule)
git diff --cached --name-only | wc -l   # expect 35 (1 test + 1 script + 2 JSON + 30 PNGs + 1 prompt-doc)

git commit -m "feat(images): Sprint 28.1 — 30 family-domain scenario illustrations (he-* 15 + st-* 15)

- Authored 30 EN imagePrompts per STYLE_GUIDE_V3 + BATCH2_PROMPTS_HQ.md precedent
- Generated via MiniMax image-01 (16:9, anime cartoon, warm tones, no text)
- Single anchor character preserved across family domain (mirrors ED single-anchor pattern)
- Renderer fallback (src/engine.js:1300) needs no change — drops PNGs at <id>.png
- prebuild-sync.sh mirrors to public/assets/images/scenarios/ on npm run build
- New test: tests/sprint28-1-family-images.test.js (5 invariants)"
```

**DO NOT `git push`** — token still in https remote URL. Per BUILD_LOG pre-push checklist v2.13.0.

---

## 6. Acceptance criteria — Sprint 28.1

| AC | Verification |
|---|---|
| AC1 | `npm test` — 410+ passed (was 403), 0 failures |
| AC2 | `npm run build` — succeeds; `dist/assets/images/scenarios/he-1.png` exists; `dist/assets/images/scenarios/st-1.png` exists |
| AC3 | Manual visual QA on 6 sampled PNGs (he-1/3/7, st-1/3/7) — anchor consistent, warm tone, no text, SEN-friendly |
| AC4 | `git log --oneline feat/family-life-domain-pilot ^main` shows 4 commits (Sprint 28 + 28.1) |
| AC5 | `package.json` version: 2.13.0 → 2.13.1 (PATCH bump) |
| AC6 | BUILD_LOG.md has v2.13.1 entry referencing this plan |
| AC7 | ARCHITECTURE.md `Last reviewed:` header → `2026-07-04 (post Sprint 28.1, v2.13.1)` |
| AC8 | No new console warnings at app first-paint (PR-ready smoke test) |

If AC3 fails → don't ship. Roll forward to v28.2 with refined prompts.

---

## 7. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Style drift** between generated PNGs (小明 looks different in he-1 vs he-7) | Med | Med (visual consistency) | Use a fixed anchor prompt prefix across all 30; document any drift in BATCH3_PROMPTS_HQ.md for regen |
| **MiniMax rate limit / 5xx** during a 30-img batch | Low (30 is small) | Low (re-run is idempotent) | Existing `gen_new_images.py` didn't have retry; if 429/5xx seen, add `time.sleep(2)` + retry-1 |
| **Single character `小明` doesn't reflect HK primary diversity** | Med | Med (representation) | For v28.1 ship anchor `小明` consistent; consider second character (e.g. `小美` for some screen-time scenarios) in v28.2 |
| **Screen-time `riskLevel: 2` scenarios (stranger-DM, cyberbullying)** visuals need stronger emotion cues — easy to overdo | Med | High (SEN safety) | Lean warm/gentle even in negative scenes; abstract the threat (notification icon abstract, no menacing faces) |
| **Emotion-detective-style face cards NOT requested** — these are moral-choice scenarios (radio text), not face-pick. Avoid generating face option variants — only generate the scene frame | Low | Low (over-gen) | Explicit prompt: "wide establishing scene, no face closeups needed" |

---

## 8. Time + cost summary

| Item | Estimate |
|---|---|
| Total images | 30 (1 per scenario) |
| Per-image time | ~12s gen + 0.5s sleep |
| Sequential wall-clock | ~6 min |
| MiniMax cost | ~¥15 (image-01, 1376×768) |
| Prompt authoring (me, batch) | ~10 min |
| JSON diff (2 files × 30 entries) | ~5 min |
| Script + test authoring | ~10 min |
| Build + audit + commit | ~10 min |
| **Total Mavis effort** | **~45 min + 6 min gen + ~5 min QA = ~55 min** |

---

## 9. What this patch does NOT do (explicit non-goals)

- ❌ Does NOT add outcome images (out-of-scope; see v28.2)
- ❌ Does NOT add face-option variants (these are moral-choice, not emotion-pick — irrelevant)
- ❌ Does NOT change renderer code (renderer fallback handles it)
- ❌ Does NOT migrate older 289 scenarios (260 already have PNGs; 29 are text-only but they were already text-only in v2.13.0)
- ❌ Does NOT add `scenarioImage`/`scenarioImageAlt` to JSON (rely on `<id>.png` fallback)
- ❌ Does NOT push to remote (still on https+PAT, user decides)
- ❌ Does NOT touch `teaching-mode` or any domain outside Family
- ❌ Does NOT add riskLevel-2 child-protection images with menacing faces (review each visual prompt explicitly)

---

## 10. Open questions for kencheng — DO answer before I run

**Q1.** Ship scope? 30 vs 60 vs 90 PNGs.
- **My pick: 30.** Confirm or override.

**Q2.** Where do characters come from?
- (a) Reuse `小明` everywhere (mirrors emotion-detective's single-anchor pattern; simplest)
- (b) `小明` for most, `小美` / `小晴` for ~half (more diverse but consistency harder)
- **My pick: (a) for v28.1 ship**, (b) for v28.2 polish.

**Q3.** Hard prompts for riskLevel-2 (stranger DM in st-* + cyberbullying):
- (a) Lean abstract — phone-screen-with-questionable-DM-icon, no menacing face
- (b) Show emotional reaction only (worried child looking at phone)
- **My pick: (b)** — kinder for SEN kids.

**Q4.** `imagePrompt` field — append to JSON or keep inline-only?
- **My pick: append to JSON** — locks provenance for regen + test coverage.

**Q5.** Want me to also author `BATCH3_PROMPTS_HQ.md` (parallel to BATCH2) documenting the 30 imagePrompts for future regen?
- **My pick: yes**, ~15 min extra, helps Sprint 28.2/29 regen.

**Q6.** Pre-shipping smoke test — should I open Chrome on the live dev server (http://localhost:5173 → click into Family → click scenario → eyeball)?
- **My pick: yes**, ~5 min, catches image-700-quiet (broken src path) early.

Default: I start with **30 PNGs + `小明` anchor + abstract threat + imagePrompt in JSON + BATCH3_PROMPTS + live smoke**. Say the word to override.

---

## 11. After-kill-criteria (when to abandon mid-sprint)

Stop and report back to user if:
1. MiniMax returns >20% errors in first 5 attempts → style/safety issue, don't burn 60 calls
2. Anchor character drift looks unrecoverable in first 3 generations → 30-PNG ship not viable, propose v28.2 plan with character-reference-image strategy
3. Any generated image contains text/logos/CJK glyphs → batch-rotate prompts to add explicit "no text" guards, regenerate from scratch

---

**Plan ready. Confirm Q1–Q6 (or just say "go") and I execute.**
