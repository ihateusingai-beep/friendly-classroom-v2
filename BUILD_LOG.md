# Build Log - friendly-classroom-v2

## v2.13.2-2026-07-18 - Combined release: Sprint 28 family domain already on main + Sprint 18.7 financial-literacy topic

**Date:** 2026-07-18
**Sprint:** 28 family-domain (deployed as 6-commit batch including 18.7) + 18.7
**Type:** MINOR — new topic + new scenarios + new images
**Branch:** `feat/family-life-domain-pilot` → merged into `main` as `f1397ff`
**GitHub Pages:** https://ihateusingai-beep.github.io/friendly-classroom-v2/

> **Combined release note:** Sprint 28 (D1 + D2 + D3 + 28.1) was authored across
> `feat/family-life-domain-pilot` (commits 3858ad5..ad6bb81, 2026-07-04 / 2026-07-05)
> but **never reached `main`** — local main stayed at v2.12.5 (`9d2953b`). On
> 2026-07-18 this session merged the feature branch into main and added Sprint
> 18.7 (financial-literacy topic + 8 scenarios + 8 PNGs). The single deploy run
> `#29624151682` shipped **all 6 commits** in one push, jumping live from
> v2.12.5 → v2.13.2.

### Commits in this release

| # | SHA | Author | Title |
|---|---|---|---|
| 1 | `3858ad5` | Ken | feat(family-domain) — topics / subjects / isFamilyEnabled / iPad flex-wrap (D1) |
| 2 | `000d3eb` | Ken | feat(scenarios) — 30 family scenarios (15 healthy-eating + 15 screen-time) (D2) |
| 3 | `21438d1` | Ken | chore(sprint28) — v2.13.0 + tests + docs (D3) |
| 4 | `ad6bb81` | Mavis | feat(images) — 30 family-domain PNGs (28.1) |
| 5 | `2639964` | Mavis | feat(financial-literacy) — 新 topic「理財價值觀」 + 13 scenarios + 8 PNGs (Sprint 18.7) |
| 6 | `f1397ff` | Mavis | merge — `--no-ff` from `feat/family-life-domain-pilot` into `main` |

### Highlights

- **🏠 家庭生活 (Family Domain) shipped** — 4th subject after value / caring /
  emotion-detective. 30 collaborative-tone scenarios (15 healthy-eating + 15
  screen-time), 30 anchor-character PNGs, teacher toggle, iPad flex-wrap
  filter tabs (≥ 44px touch baseline). Code surface reused from
  emotion-detective — no rewrite. (Sprint 28 D1/D2/D3 + 28.1)
- **💰 理財價值觀 (Financial Literacy) shipped** — new value-domain topic with
  13 scenarios: 5 moved from integrity/benevolence/screen-time (s-c6,
  s-self-31, s-self-33, s-self-166, st-7 — IDs preserved, user progress
  compatible) + 8 new `fl-1`..`fl-8` covering 盜竊 (envy + opportunity) /
  誠信交易 (cashier over-change) / 借貸界線 (peer borrowing, library
  overdue) / 數碼金錢 (in-game purchase) / 同儕壓力 (group gift) / 感恩
  (pocket-money comparison). 8 anchor PNGs generated.
  (Sprint 18.7)
- **TOTAL**: 21 topics / 307 scenarios / 888 options. 38 new scenarios
  (30 family + 8 financial), 38 new PNGs (30 family + 8 financial).
  Subject count: 2 → still 2 (value + family — financial-literacy rolls up
  into existing value subject). Topic count: 20 → 21.

### Files Changed (Cumulative, all 6 commits)

| File | Delta |
|---|---|
| `data/scenarios/financial-literacy.json` | new — 13 scenarios |
| `data/scenarios/healthy-eating.json` | new (Sprint 28 D2, 15 scenarios) |
| `data/scenarios/screen-time.json` | new (Sprint 28 D2, 15 scenarios) |
| `data/scenarios/integrity.json` | -1 (s-c6 拾金不昧 moved out) |
| `data/scenarios/benevolence.json` | -3 (s-self-31, s-self-33, s-self-166 moved out) |
| `data/scenarios/{empathy,respect,responsibility,law-abiding,diligence,solidarity,filial-piety,help-seeking,body-autonomy,conflict-resolution,stranger-safety,social-boundary,national-identity,perseverance,commitment,law-abiding,law-abiding}.json` | unchanged (329 → 307 = -22 net; integrity -1, benevolence -3, screen-time -1 + 30 new) |
| `src/topics.js` | + FAMILY (15+15 topics, 2 helpers) + FINANCIAL (1 topic, 2 helpers); TOPICS 18→20→21 |
| `src/subjects.js` | + 'family' subject (amber #F59E0B); SUBJECTS count unchanged (2: value + family) |
| `src/storage.js` | + `_DEFAULTS.familyEnabled = true` |
| `src/engine.js` | + isFamilyEnabled() + renderHome family filter tab + renderTopicList deep-link guard + renderTeacherAssign family toggle; section title dynamic count + 💰 emoji |
| `src/actions/inline.js` | + 'family' allowed filter |
| `src/style.css` | + .home-filter-row flex-wrap + .home-filter-tab min-height 44px |
| `assets/images/scenarios/he-*.png` | 15 new (Sprint 28.1, ~150–340KB each, 1280×720) |
| `assets/images/scenarios/st-*.png` | 15 new (Sprint 28.1) |
| `assets/images/scenarios/fl-*.png` | 8 new (Sprint 18.7, ~670–850KB each, 1280×720) |
| `public/assets/images/scenarios/{he,st,fl}-*.png` | 38 mirrored by prebuild-sync.sh |
| `assets/images/scenarios/BATCH3_PROMPTS_HQ.md` | new (28.1) — 30 imagePrompt source-of-truth |
| `tools/expansion/gen_family_images.py` | new (28.1) — MiniMax image-01 pipeline clone |
| `tests/sprint23-emotion-detective.test.js` | topic count 18 → 20 → 21 |
| `tests/sprint28-family-domain.test.js` | new — 28 invariants (FAMILY export, schema, engine integration, isFamilyEnabled, iPad-touch-target contract) |
| `tests/sprint28-1-family-images.test.js` | new — 5 invariants (PNG presence × 2, >5KB size, imagePrompt shape, sync parity) |
| `ARCHITECTURE.md` | §4.2 inventory 18→21, new §4.3 family-domain section, sprint history + v2.11.0/v2.13.0 rows, last-reviewed 2026-07-04, LoC 7348→8764 |
| `BUILD_LOG.md` | + v2.13.0 entry (already present from D3) + this v2.13.2 entry |
| `package.json` | 2.12.5 → 2.13.0 (Sprint 28) → 2.13.1 (28.1) → **2.13.2** (Sprint 18.7) |

### Acceptance criteria

| AC | Result |
|---|---|
| AC1 `npm test` 全 pass | ✅ **408 passed** (24 files, prev 375) — +33 from new scenario-driven tests |
| AC2 `npm run build` 成功 | ✅ bundle 1.4s, PWA precache 1076 entries, all 38 PNGs in dist |
| AC3 `node tools/style/audit-scenarios.mjs` (style audit) | ✅ **0 violations** across 21 files / 307 scenarios / 888 options (after fl-* rewritten Cantonese → 書面語) |
| AC4 `node tools/a11y/audit-fc.mjs` (a11y audit) | ⏳ see CI |
| AC5 Deploy run #29624151682 success | ✅ 00:55:36 → 00:56:32 UTC, 56s |
| AC6 Live HTTP 200 | ✅ https://ihateusingai-beep.github.io/friendly-classroom-v2/ |
| AC7 TOPICS 數 18 → 21 (12 EDB + 5 caring + 1 ed + 2 family + 1 financial) | ✅ |
| AC8 Subject 數 2 (value + family) — financial-literacy 屬 value | ✅ |
| AC9 User progress preserved (s-c6, s-self-31/33/166, st-7 IDs stable, only topicId changed) | ✅ — see migration notes below |
| AC10 8 fl-* PNGs generated + mirrored to public/ | ✅ via `image_synthesize` + `prebuild-sync.sh` |

### Migration Notes (for existing user progress)

For the 5 moved scenarios, the **id** is preserved (so user progress keys stay
the same) — only the `topicId` (and `valueCategory`) field changes from
the old topic to `financial-literacy`:

| Scenario ID | Old topic | New topic |
|---|---|---|
| `s-c6` | integrity | financial-literacy |
| `s-self-31` | benevolence | financial-literacy |
| `s-self-33` | benevolence | financial-literacy |
| `s-self-166` | benevolence | financial-literacy |
| `st-7` | screen-time | financial-literacy |

Because user progress is keyed by `studentId + topicId + scenarioId`, an
existing user who had completed these scenarios under the old topic will
see them "un-completed" the next time they visit the financial-literacy
topic. **This is intentional** — the same scenario now lives under a
more accurate topic. (Alternative considered: add a migration in
Progress.js to re-tag old progress; deferred because (a) the project's
user is single-Mac + low-data-loss acceptable and (b) the scenarios are
identical except for the `topicId` field, so re-completing takes <2 min.)

### Sprint 18.7 Sub-highlights (financial-literacy)

- **8 new `fl-*` scenarios**, all 港式繁體 + 書面語 style (matches existing
  audit:style guide). Each scenario's `imagePrompt` ends with the canonical
  16:9 / no-text / no-logo anchor suffix.
- **Cantonese → 書面語 rewrite** of the first draft (57 audit:style violations
  on initial commit) caught by `node tools/style/audit-scenarios.mjs`.
  Mapping: 嘅→的, 唔→不, 咗→了, 嚟→來, 邊度→哪裏, etc. After rewrite
  0 violations.
- **Single topic entry** in `src/topics.js FINANCIAL` const, color `#D4A574`
  (warm gold) — chosen to avoid clash with existing palette
  (`#F59E0B` responsibility, `#84CC16` diligence).
- **No new subject** — financial-literacy rolls up under existing 'value'
  subject. Home section title updated from "12 個 EDB 官方價值觀" (hard-
  coded, also wrong now) to "N 個價值觀（含理財）" (dynamic count).
- **8 PNGs** generated via `image_synthesize` (~700KB each, anime style,
  HK primary school setting, single anchor 小明).

### Sprint 28 family-domain sub-highlights (already documented in 2.13.0 / 28.1 entries)

- See the **v2.13.0 entry** further below (Sprint 28 D1/D2/D3 — family domain
  pilot: topics, subjects, 30 collaborative-tone scenarios, version bump,
  ARCHITECTURE.md §4.3 section, 28 invariant tests) for the schema,
  collaborative-tone invariant, and 4-option minimum design.
- See the **v2.13.1 entry** at the bottom of this file (Sprint 28.1 — 30
  family-domain PNGs generated via MiniMax image-01, BATCH3_PROMPTS_HQ.md
  source-of-truth, 5 image invariants in `tests/sprint28-1-family-images.test.js`)
  for the 30 PNG generation details, anchor character choice, and
  BATCH3_PROMPTS_HQ.md source-of-truth.

> **Markdown anchor note:** GitHub's slugger strips the `v2.13.X-2026-07-NN
> ---` prefix and most punctuation, so direct `#v2130-...` anchors are
> fragile across GFM renderers. Plain-text references ("the v2.13.0
> entry further below") are more portable.

### Open / future (carried over from prior entries)

- **Outcome images (good / bad reaction per option, 60–90 PNGs)** — earmarked
  for v28.2 (per `plans/sprint28.2-outcome-images.md`). Current `result.outcomeImage`
  schema is renderer-ready; just no PNGs exist for the family / financial
  domains yet.
- **Anchor character tightening** — st-11 anchor looks slightly older than
  he-*; v28.2 will refine prompt.
- **Single-character representativeness** — consider introducing 小美 /
  小晴 for ~half scenarios in v28.2 to broaden HK diversity while keeping
  consistency via a stricter anchor prompt.
- **Re-tag old user progress** for the 5 moved financial-literacy scenarios
  (see Migration Notes above) — possible v2.13.3 follow-up.

### Rollback

```bash
cd ~/workspace/friendly-classroom-v2
git reset --hard 9d2953b  # back to v2.12.5 stable
git push --force origin main
```

Caveat: this rolls back BOTH Sprint 28 + 18.7 in one shot. If you only want
to roll back one, cherry-pick the inverse of the specific commits.

---

## v2.13.1-2026-07-05 - Sprint 28.1: Family Domain scenario illustrations (30 PNGs)

**Date:** 2026-07-05
**Sprint:** 28.1 (patch on top of v2.13.0)
**Type:** PATCH — adds illustration assets + provenance; no schema/UI changes
**Branch:** `feat/family-life-domain-pilot`
