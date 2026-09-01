# Sprint 28.2 — Family Domain Outcome Images + st-11 Anchor Tightening

> **Goal:** Generate **30 good-outcome illustrations** (1 per scenario) for the result page of the Family Domain pilot, plus **re-prompt st-11** to tighten the anchor character (which drifted slightly older-looking in v2.13.1).
> **Status:** Plan only. **Not yet executed.**
> **Parent plan:** BUILD_LOG.md v2.13.1 entry — *"Open / future: outcome images (good / bad reaction per option, 60-90 PNGs) — earmarked for v28.2 ... anchor character tightening — st-11 anchor looks slightly older than he-*; v28.2 will refine prompt"*
> **Branch target:** `feat/family-life-domain-pilot` → v2.13.2 (PATCH on v2.13.1).

---

## 0. Recap — what we already have

| Asset | Path | Items | Use |
|---|---|---|---|
| 30 main scenario illustrations | `assets/images/scenarios/{he,st}-N.png` | 30 | Renderer fallback at `src/engine.js:1300` |
| **0** outcome images for family | `assets/images/outcomes/{he,st}-*.png` | 0 | New — this sprint |
| 744 outcome images (old) | `assets/images/outcomes/s-*_opt{1,2,3}.png` | 744 (259 scenarios × ~3) | Result-page reward |
| Renderer support | `src/engine.js:224` and `:1403` | `${result.outcomeImage ? <img ...> : ''}` | Schema-compatible, currently unused |
| Image-gen pipeline | `tools/expansion/gen_family_images.py` | Reusable | Add `gen_family_outcome_images.py` clone |
| Style guide | `assets/images/scenarios/BATCH3_PROMPTS_HQ.md` | 30 prompts | v28.1 source-of-truth |

### Family domain option structure (verified via probe)

All 30 family scenarios have **2 good options (+15 / +18) + 2 bad options (-10 to -15)**, a clean symmetric pattern. The 4-option scoring always maps to:

| Option | moralChange | Type | Tally (he-* + st-*) |
|---|---|---|---|
| `a` | **+15** | good (cooperative / honest) | 30/30 |
| `b` | -10 to -15 | bad (rude / dishonest) | 30/30 |
| `c` | **+18** | best (negotiation / mature) | 30/30 |
| `d` | -12 to -15 | bad (worst — secret / deceptive) | 30/30 |

→ Option `c` is consistently the **highest-scoring** option (+18 across all 30). Pick `c` as the **single good-outcome target** — it covers the **"best possible"** path the teacher / system is steering students toward.

### Why only 1 outcome per scenario (not 2 or 3)

- Existing convention: 259 scenarios × 3 outcomes = 744 (not 4 — neutral option skipped in older domains)
- For Family domain, the **deliberate "collaborative tone"** means the +18 path is the desired behavior. The -10/-15 paths are *what to avoid* — students can imagine them from the text `comment` field. Showing all 4 outcomes = 4× the image budget, diminishing returns.
- Tightest minimal ship = **30 good outcomes (one per scenario, target option `c`)**. We can extend to 60 or 120 in v28.3 if data shows the value.

---

## 1. Decisions

### 1.1 Scope: 30 good outcomes (1 per scenario, option `c`) + 1 regen

| Item | Decision | Rationale |
|---|---|---|
| **Good outcome target** | Option `c` (+18, "negotiation / mature") for all 30 | Highest moral score, "best possible" path; matches `collaborative tone` design |
| **Bad outcome target** | None this sprint | Defer to v28.3. The text `comment` field on bad options already explains the consequence |
| **Anchor character for outcomes** | Reuse 小明 (same as 28.1 main scenes) | Visual continuity — student sees "same boy" in main + result pages |
| **st-11 anchor regen** | Re-prompt with stricter prefix to make 小明 look 7-yo | Cosmetic polish, 1 PNG. Re-uses `gen_family_images.py` with new prompt |
| **Image dimensions** | 1280×720 (16:9) — same as main scenes | Renderer supports same CSS. Avoids complexity |
| **Field placement** | `option.outcomeImage: "assets/images/outcomes/<sid>_c.png"` | Per-option field, matches existing older-domain schema (744 outcomes use this exact key) |
| **imagePrompt provenance** | `option.outcomeImagePrompt: "..."` | New field, same pattern as 28.1's `imagePrompt` on scenarios |
| **Test invariants** | 4 (PNG presence, sync parity, schema field, prompt-shape) | Mirror 28.1's 5-invariants pattern, slimmed |
| **Version** | 2.13.1 → **2.13.2** (PATCH) | New PNGs, no schema break (just adds optional fields) |

### 1.2 What we are NOT doing (explicit non-goals for v28.2)

- ❌ Adding bad outcomes (60-90 PNGs) — defer to v28.3
- ❌ Adding neutral outcomes (middle-of-road) — never done in older domains
- ❌ Renaming or re-prompting any of the 30 main scenario images (28.1 batch)
- ❌ Touching renderer code (renderer already supports `outcomeImage`)
- ❌ Character diversity (小美 / 小晴) — defer to v28.3 (lower impact for v28.2)
- ❌ Replacing all 744 older outcomes (out of scope)

---

## 2. Schema additions (in-scope, additive, backward-compat)

```jsonc
// data/scenarios/healthy-eating.json — he-1 options[2] before:
{
  "id": "he-1-c",
  "text": "同媽媽講：可以一半青菜一半薯條嗎？",
  "effects": [{ "moralChange": 18, "comment": "識得表達口味，又肯同家人商量，係成熟的做法！" }],
  "next_scenario": "he-2"
}

// AFTER (v2.13.2):
{
  "id": "he-1-c",
  "text": "同媽媽講：可以一半青菜一半薯條嗎？",
  "effects": [{ "moralChange": 18, "comment": "識得表達口味，又肯同家人商量，係成熟的做法！" }],
  "next_scenario": "he-2",
  "outcomeImage": "assets/images/outcomes/he-1_c.png",
  "outcomeImagePrompt": "A 7-year-old boy (小明) and his mother both smiling at a dinner table splitting a plate of stir-fried zucchini and a small portion of fries in the middle, warm family bonding moment, warm amber lighting, gentle happy expressions, Hong Kong home dining, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio"
}
```

**Schema change is additive only.** Older code that doesn't read `outcomeImage` / `outcomeImagePrompt` keeps working. Renderer already has the rendering branch.

**Naming convention** — older domain uses `_opt1` (underscore) — I'll use **`_c`** (lowercase letter, dot replaced with underscore for filesystem) to match scenario-id pattern AND distinguish the v28.2 batch. e.g. `he-1_c.png`, `st-7_c.png`. Older-domain existing files like `s-c2_opt1.png` stay as-is (don't rename — that'd be a non-trivial git history rewrite).

---

## 3. Image content matrix

For each `he-N` / `st-N`, the option-`c` outcome is a "**reward scene**" showing what the good path looks like in practice. Must:

- Show **the actual positive consequence** (e.g. "媽媽 + 小明 sharing fries + veggies happily"), NOT a generic thumbs-up
- Use **same character (小明)** as the main scene for visual continuity
- Use **secondary characters in the same role** as the main scene (same mom / dad / grandma / friend)
- Keep **warm tone, no text/logos**, 16:9
- Reinforce the **moral lesson** the scenario teaches (e.g. cooperation, honesty, time management)

Sample prompts (full set of 30 will be in `BATCH4_PROMPTS_HQ.md`):

```
he-1-c | 媽媽 + 小明 兩種食物都吃, 一齊 happy
A 7-year-old boy (小明) and his mother both smiling at a dinner table, plate of stir-fried zucchini on one side and small portion of fries on the other, both holding chopsticks, warm family bonding moment, warm amber lighting, gentle happy expressions, Hong Kong home dining, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio

he-2-c | 小明 同 阿嫲 分享水果
A 7-year-old boy (小明) cutting an apple and sharing pieces with his elderly grandmother (阿嫲) on a kitchen counter, both smiling, fruit plate full in foreground, Hong Kong home kitchen, soft afternoon light, intergenerational bonding mood, anime cartoon style, warm soft pastel tones, no text, no logos, no watermarks, 16:9 aspect ratio

st-1-c | 小明 自己收起 iPad + 8:50 鬧鐘
A 7-year-old boy (小明) putting his iPad into a drawer with a gentle smile, alarm clock on bedside table showing 8:50pm, tidy bed made, Hong Kong home bedroom, warm evening light, self-discipline moment, anime cartoon style, warm soft pastel tones, no text, no logos, no watermarks, 16:9 aspect ratio

st-11-c | 小明 同 媽媽 一齊睇陌生 DM
A 7-year-old boy (小明) and his mother looking at a smartphone together, mother pointing at the screen with a reassuring smile, boy looking relieved and trusting, abstract notification dots on screen, Hong Kong home living room, protective mother-son moment, anime cartoon style, warm soft pastel tones, no text, no logos, no watermarks, 16:9 aspect ratio
```

---

## 4. Workflow (end-to-end)

### 4.1 Pre-flight

```bash
cd ~/workspace/friendly-classroom-v2
git checkout feat/family-life-domain-pilot   # ensure on right branch
git log --oneline -1   # should be ad6bb81 (Sprint 28.1)
```

### 4.2 Populate `outcomeImage` + `outcomeImagePrompt` on option-c (30 sites)

**Step 4.2a** — Author 30 outcome-image prompts (myself, EN + 16:9 anchor suffix, same as 28.1).

**Step 4.2b** — Write a small one-shot Python script `tools/expansion/populate_outcome_prompts.py` that:
1. Loads both `healthy-eating.json` + `screen-time.json`
2. For each scenario, finds option `c` (the +18 best option) — there's exactly one per scenario, no ambiguity
3. Adds `outcomeImage` and `outcomeImagePrompt` fields to that option
4. Writes back to disk

This keeps the population logic centralized and reproducible (vs. 30 hand-edits in JSON).

### 4.3 Outcome image generation

**Step 4.3a** — Write `tools/expansion/gen_family_outcome_images.py` (clones pattern of `gen_family_images.py`):
- Iterate all 30 scenarios, pick `options[2]` (option `c`)
- Read `outcomeImagePrompt`, append anchor suffix (already included in prompt)
- Skip existing PNGs > 1KB (idempotent)
- Write to `assets/images/outcomes/<sid>_c.png` (matches `outcomeImage` field)
- ~30 images, ~6 min sequential

### 4.4 st-11 anchor regen (separate small loop)

**Step 4.4a** — Manually edit `data/scenarios/screen-time.json` `st-11.imagePrompt` to add anchor-tightening prefix:
```
{EXISTING st-11 prompt}, EXACTLY 7 years old boy, child face proportions
(no teenager, no adult, no pre-teen), small body, round cheeks
```

**Step 4.4b** — Delete `assets/images/scenarios/st-11.png` (forces regen) + `public/assets/images/scenarios/st-11.png` (forces re-mirror)

**Step 4.4c** — Run `python3 tools/expansion/gen_family_images.py` (existing script) — it'll regen st-11 + skip the other 29

**Step 4.4d** — Re-run `prebuild-sync.sh` to mirror the new st-11

### 4.5 Prebuild sync + build + tests

```bash
cd ~/workspace/friendly-classroom-v2
./prebuild-sync.sh  # 30 new + 1 regen mirrored
ls public/assets/images/outcomes/ | grep -E "^(he|st)-" | wc -l   # expect 30
npm test  # AC1: 412+ pass
npm run build  # AC2: 30 outcome PNGs in dist/
```

### 4.6 Visual QA

Sample 6 outcome PNGs (he-1-c, he-7-c, st-1-c, st-5-c, st-7-c, st-11-c) + the new st-11 main scene:
- Anchor character consistent with 28.1 main scenes? ✅
- Show the **positive consequence** clearly, not just "happy child"? ✅
- No text/logos, warm tone preserved? ✅
- st-11 main scene 小明 looks 7-yo now? ✅

### 4.7 Tests

Add `tests/sprint28-2-family-outcomes.test.js` (4 invariants):

1. **Outcome PNG presence**: every scenario's option-c has a PNG at `assets/images/outcomes/<sid>_c.png`
2. **PNG ≥ 5KB**: catches broken/empty/truncated files
3. **Schema field**: every option-c carries `outcomeImage` + `outcomeImagePrompt` field, prompt ends with the 16:9 anchor suffix
4. **Sync parity**: source assets mirrored to `public/assets/images/outcomes/`

Plus regen test: `st-11.png` exists + 16:9 + prompt updated to anchor-tightened version.

That's 4-5 new invariants, total 412-413 tests (was 408 v2.13.1).

### 4.8 Commit (NO push)

```bash
cd ~/workspace/friendly-classroom-v2
git add data/scenarios/healthy-eating.json data/scenarios/screen-time.json
git add assets/images/outcomes/{he,st}-*_c.png
git add assets/images/scenarios/st-11.png   # the regen
git add public/assets/images/outcomes/{he,st}-*_c.png
git add public/assets/images/scenarios/st-11.png
git add tests/sprint28-2-family-outcomes.test.js
git add plans/sprint28.2-outcome-images.md
git add assets/images/outcomes/BATCH4_PROMPTS_HQ.md
git add BUILD_LOG.md ARCHITECTURE.md package.json
# Pre-commit guard:
git diff --cached --name-only | wc -l
git commit -m "feat(outcomes): Sprint 28.2 — 30 good-outcome illustrations + st-11 anchor regen (v2.13.2)

- Generated 30 outcome PNGs (option-c / +18 'negotiate' path) showing
  the positive consequence after the right choice
- Added outcomeImage + outcomeImagePrompt field on each scenario's
  option-c — additive schema, backward-compat with existing renderer
  (src/engine.js:224, 1403 — both already support outcomeImage)
- Re-prompted st-11 with anchor-tightening prefix to fix the slightly
  older-looking boy drift; regen via existing gen_family_images.py
- Mirror: prebuild-sync.sh → 30 new + 1 regen PNGs in public/
- New tests/sprint28-2-family-outcomes.test.js (4 invariants:
  PNG presence × 30, ≥5KB, schema field shape, sync parity)
- New BATCH4_PROMPTS_HQ.md (regen source-of-truth, parallel to BATCH3)
- Version: 2.13.1 → 2.13.2 (PATCH)"
```

**NO `git push`** — token still in URL per v2.13.0 checklist.

---

## 5. Acceptance criteria — Sprint 28.2

| AC | Verification |
|---|---|
| AC1 | `npm test` 412+ passed (was 408 in v2.13.1), 0 fail |
| AC2 | `npm run build` clean, `dist/assets/images/outcomes/{he,st}-*_c.png` exists (30 files) |
| AC3 | Visual QA 6 outcome PNGs + st-11 regen — anchor consistency, no text/logos, shows positive consequence clearly |
| AC4 | `git log` shows 5 commits (28.1 + 28.2) on `feat/family-life-domain-pilot` |
| AC5 | `package.json` version 2.13.1 → 2.13.2 |
| AC6 | `BUILD_LOG.md` has v2.13.2 entry referencing this plan |
| AC7 | `ARCHITECTURE.md` `Last reviewed:` header → `2026-07-05 (post Sprint 28.2, v2.13.2)` |
| AC8 | st-11 main scene anchor looks 7-yo (visual confirmation, not testable) |

If AC3 fails for an outcome PNG → don't ship. v28.2.1 patch with refined prompt.

---

## 6. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **MiniMax returns >20% errors in first 5 attempts** | Low | Med (60s wasted) | Same as 28.1 — built-in skip-on-existing, log mtime check |
| **Outcome scene looks too generic** ("happy child" without context) | Med | Med (low educational value) | Each prompt is scenario-specific, mentions specific props/setting/secondary characters from the original scenario |
| **Anchor character (小明) doesn't match 28.1 main scenes** | Med | High (visual continuity) | Use the same anchor prefix as 28.1 prompts; visual QA on 6 samples to catch drift early |
| **st-11 regen still looks older** | Med | Low (cosmetic) | Try max 3 anchor-tightening prefixes; if still drift, accept ship — main scenes are 28.1 baseline, st-11 is just one outlier |
| **Outcome image set fails the 80% success rate gate** | Low | High (60-90% done = ship blocker) | Same as 28.1 — script writes JSON back only if ≥80% succeed; on failure, JSON stays un-patched, no source data corruption |
| **Schema field naming disagreement** (older domains use `_opt1`, v28.2 uses `_c`) | Low | Low (visual ID convention only) | Documented in §2 + BATCH4 doc; future migration if user wants consistency |

---

## 7. Time + cost summary

| Item | Estimate |
|---|---|
| Total new images | 30 outcomes + 1 regen = 31 PNGs |
| Per-image time | ~12-19s gen + 1.5s sleep |
| Sequential wall-clock | ~6-10 min |
| MiniMax cost | ~¥15-20 (image-01, 1280×720) |
| 30 outcome prompts authored (me) | ~15 min |
| populate_outcome_prompts.py (script) | ~5 min |
| gen_family_outcome_images.py (script) | ~5 min |
| st-11 prompt edit + regen | ~3 min |
| Tests + audit + commit | ~15 min |
| **Total Mavis effort** | **~50 min + 10 min gen + 5 min QA = ~65 min** |

---

## 8. Open questions for kencheng — DO answer before I run

**Q1.** Scope: 30 good outcomes (option-c only) vs 60 (good+bad) vs 120 (all 4 options per scenario).
- **My pick: 30.** Matches v2.13.1 minimal-ship discipline, ¥15 cost, ~6 min. Bad options covered by text comment.

**Q2.** Anchor character for outcomes — reuse 小明 (continuity with 28.1 main scenes) or introduce 小美 / 小晴 now?
- **My pick: reuse 小明.** Continuity > diversity for v28.2. Diversity defer to v28.3.

**Q3.** Naming convention — `_c` (option letter) vs `_opt1` (older domain pattern)?
- **My pick: `_c`.** Matches the option's *semantic role* (the "best" / "negotiate" choice) rather than a numeric order. Older domains had _opt1/2/3 because they weren't structured around a "best" path.

**Q4.** st-11 regen — should I do this *together* with 28.2 (3rd item from 28.1 deferred list), or skip and defer to v28.3?
- **My pick: include in 28.2.** 1 regen, 3 min, ships a cleaner st-11. Cheap improvement.

**Q5.** Want me to also update `BATCH3_PROMPTS_HQ.md` with the new st-11 prompt, or leave it as-is + add a note about regen in `BATCH4`?
- **My pick: leave BATCH3 + add `BATCH4_PROMPTS_HQ.md` for outcomes + new st-11 prompt.** Cleaner history — BATCH3 stays frozen as the 28.1 ship snapshot.

**Q6.** Live Chrome smoke test on http://localhost:5173 — pick scenario → pick option-c → see outcome image?
- **My pick: yes.** 5 min extra, catches the renderer-fallback issue (what if `outcomeImage` is set but path is wrong, browser shows broken image silently).

Default: I start with **30 outcomes on option-c + reuse 小明 + `_c` naming + st-11 regen + BATCH4 + live smoke**. Say the word to override.

---

## 9. After-kill-criteria (when to abandon mid-sprint)

Stop and report back to user if:
1. MiniMax returns >20% errors in first 5 attempts → style/safety issue, don't burn 60 calls
2. Anchor character drift looks unrecoverable in first 3 outcome generations → 30-PNG ship not viable, propose v28.3 plan with character-reference-image strategy
3. Any generated outcome image contains text/logos/CJK glyphs → batch-rotate prompts to add explicit "no text" guards
4. st-11 regen looks the same as v2.13.1 (no anchor change) after 3 attempts → accept the drift, ship v28.2 without the regen, file as v28.3 separate item

---

**Plan ready. Confirm Q1–Q6 (or just say "go") and I execute.**
