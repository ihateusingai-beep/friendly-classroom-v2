# AGENTS.md — friendly-classroom-v2 Project Plan & Handoff

> **Purpose:** Single source of truth for resuming work on this project. Read this
> first when starting a new session. Update as sprints land.
>
> **Last updated:** 2026-08-01 (covers through v2.13.5 / Sprint 18.10)
> **Maintainer:** kencheng + Mavis (assistant)
> **Live URL:** https://ihateusingai-beep.github.io/friendly-classroom-v2/

---

## §0 — TL;DR (30s read)

- **What it is:** SEN-friendly (Special Educational Needs) interactive learning
  PWA for HK primary students, Cantonese 繁體. Focus on **品德 / 自我保護 /
  社交界線 / 家庭生活 / 理財價值觀** scenarios via moral-choice mechanics.
- **Stack:** Vanilla JS + Vite 6 + vite-plugin-pwa + Workbox 7. NO framework.
  All data in `data/scenarios/*.json`. State in `localStorage`.
- **Latest live:** **v2.13.5** (deployed 2026-08-01, commit `a4c7fb9`).
- **State:** 328 scenarios / 21 topics / 2 subjects (value + family).
  299 scenario PNGs + 744 outcome PNGs.
- **Tests:** 408 passed (vitest 2.1.9). Style audit: 0 violations.
- **Default teacher PIN:** `unicornntd` (S18.4, with auto-migration from old `admin`).
- **Hub cards visible to students:** 🏦 好人好事銀行 / 📖 情境答題
  (🌷 關係花園 + 🎲 道德大富翁 hidden via feature flag, S18.5).

---

## §1 — File Map (where to find what)

```
friendly-classroom-v2/
├── AGENTS.md                     # THIS FILE — handoff + plan
├── BUILD_LOG.md                   # Per-version release notes (append at top)
├── PLAN.md                       # Original project plan (legacy)
├── SPEC.md                       # Full product spec (2919 lines, §1-§28)
├── ARCHITECTURE.md               # Code architecture + inventory
│
├── data/scenarios/                # ALL scenario content (21 JSON files)
│   ├── respect.json              # 15 scenarios — 尊重他人
│   ├── empathy.json              # 15 — 同理心
│   ├── integrity.json            # 16 — 誠信 (s-c6 拾金不昧 moved out to financial-literacy)
│   ├── benevolence.json          # 12 — 仁愛 (3 moved out to financial-literacy)
│   ├── law-abiding.json          # 15 — 守法
│   ├── perseverance.json         # 15 — 堅毅
│   ├── responsibility.json       # 15 — 責任感
│   ├── commitment.json           # 15 — 承擔精神
│   ├── diligence.json            # 15 — 勤勞
│   ├── solidarity.json           # 15 — 團結
│   ├── filial-piety.json         # 15 — 孝親
│   ├── national-identity.json    # 17 — 國民身份認同
│   ├── body-autonomy.json        # 31 — 身體自主 (touched S18.8/18.9/18.10)
│   ├── stranger-safety.json      # 15 — 陌生人危險
│   ├── help-seeking.json         # 15 — 求助技巧
│   ├── social-boundary.json      # 20 — 社交界線 (touched S18.10)
│   ├── conflict-resolution.json  # 15 — 衝突解決
│   ├── emotion-detective.json    # 10 — 情緒小偵探
│   ├── healthy-eating.json       # 15 — 飲食習慣 (Sprint 28 family)
│   ├── screen-time.json          # 14 — 屏幕時間 (Sprint 28 family, st-7 moved out)
│   └── financial-literacy.json   # 13 — 理財價值觀 (S18.7 NEW topic)
│
├── src/
│   ├── main.js                   # Boot, render(), VIEWS registry, dispatcher
│   ├── engine.js                 # All render*() functions (largest file, ~1772 lines)
│   ├── topics.js                 # VALUES / CARING / EMOTION_DETECTIVE / FAMILY / FINANCIAL
│   │                             #   + TOPIC_MIGRATION + 21 topics
│   ├── subjects.js               # SUBJECTS = [value, family] (2 subjects)
│   ├── storage.js                # STORAGE_KEYS + get/set wrappers + 5s TTL cache
│   ├── audio.js                  # TTS via Web Speech API (no MP3 fallback)
│   ├── nav.js                    # navigate() / navigateQuiet() — NAV_VIEWS gate
│   ├── teacher.js                # renderLogin + renderTeacher (lazy-loaded chunk)
│   ├── sync.js                   # Backend API client (apiCall)
│   ├── i18n.js                   # Translation function t()
│   ├── creeds.js                 # EDB 信條 (creed text)
│   ├── components/               # chrome.js, blocks.js, Toast.js, Onboarding.js
│   ├── domain/                   # Pure logic: Auth, Student, Play, Resume, Progress, IO, etc.
│   ├── games/                    # Hub.js, GoodDeedBank.js, RelationshipGarden.js
│   ├── actions/                  # index.js (dispatcher registry) + inline.js + garden.js
│   └── constants/                # bank.js, garden.js, feature-flags.js
│
├── assets/images/                 # SOURCE images (mirror to public/ via prebuild-sync.sh)
│   ├── scenarios/                # 299 PNGs — one per scenario id.png
│   └── outcomes/                 # 744 PNGs — {scenario_id}_opt{1,2,3}.png
│
├── public/                        # Mirror of assets/ (synced by prebuild-sync.sh before build)
│
├── tests/                         # 24 test files, 408 tests
│
├── tools/
│   ├── style/audit-scenarios.mjs  # Cantonese → 書面語 audit (catches 嘅/唔/咗 etc.)
│   ├── a11y/                     # axe-core + jsdom a11y audit
│   └── expansion/                # gen_*.py — image generation scripts (legacy)
│
├── .github/workflows/
│   ├── ci.yml                     # Tests + a11y + build on push/PR
│   └── deploy.yml                 # Deploy to GH Pages on push to main / workflow_dispatch
│
└── package.json                   # Version 2.13.5, SemVer
```

---

## §2 — Sprint history (recent)

| Sprint | Commit | Date | What |
|---|---|---|---|
| **18.3** | `7571192` | 2026-07-03 | Fix 關係花園 button routing (NAV_VIEWS missing 'character-select'); 統一關卡命名 (drop 號碼, drop 道德/特別 prefix) |
| **18.4** | `02f35ee` | 2026-07-03 | Default teacher PIN → `unicornntd` (auto-migration from old `admin` if LS value === 'admin') |
| **18.5** | `3a72d97` | 2026-07-03 | Hide 🌷 關係花園 + 🎲 道德大富翁 Hub cards via `GARDEN_MODE: false` + new `MONOPOLY_MODE: false` flag (conditional render in engine.js renderGameHub) |
| **18.6** | `9d2953b` | 2026-07-03 | **CRITICAL FIX:** `toggleTeacherFeature` dispatcher bug — was reading `btn.classList` (param) instead of `this.classList` (fn.call set `this` to element). Caused silent TypeError on 4 toggle buttons (提示/計時/Combo/情緒小偵探). Tests did NOT catch — caught via Playwright live check. |
| **Sprint 28 D1** | `3858ad5` | 2026-07-04 | 🏠 家庭生活 domain scaffold: FAMILY const, isFamilyEnabled, iPad flex-wrap. Subject 'family' added (amber #F59E0B). |
| **Sprint 28 D2** | `000d3eb` | 2026-07-04 | 30 family scenarios (15 healthy-eating + 15 screen-time) |
| **Sprint 28 D3** | `21438d1` | 2026-07-04 | v2.13.0 + tests + docs |
| **Sprint 28.1** | `ad6bb81` | 2026-07-05 | 30 family PNGs generated (he-1..15, st-1..15), v2.13.1 |
| **18.7** | `2639964` | 2026-07-18 | 💰 理財價值觀 NEW topic: 5 moved (s-c6, s-self-31/33/166, st-7) + 8 new (fl-1..8). `FINANCIAL` const in topics.js, color #D4A574. 8 PNGs. v2.13.2. **Deploy note:** lived on `feat/family-life-domain-pilot` branch 2 weeks before merge — shipped with Sprint 28 in single push. |
| **18.8** | `44ab8cd` | 2026-07-18 | 6 first-person bad-touch scenarios (s-self-85..90) in body-autonomy. **Pedagogical shift:** "你做咗 X, 先發覺唔啱" (first-person realization) instead of "someone did to you" (third-party). Critical for SEN empathy + boundary recognition. v2.13.3 |
| **18.9** | `fe50636` | 2026-07-18 | 6 good-touch positive scenarios (s-self-91..96). **Counter-balance** to 18.8 to avoid ASD extreme "all touch = dangerous". Includes self-care touch (s-self-96 自己沖涼). v2.13.4 |
| **18.10** | `a4c7fb9` | 2026-08-01 | 4 first-person chest/body scenarios (s-self-97..100) + 5 social-distance scenarios (s-self-139..143). Chest scenarios include s-self-100 healthy puberty 認知 (counter-overcorrection). v2.13.5 |

---

## §3 — Domain architecture (high-level)

### 3.1 Render flow

```
main.js: render() (per state.view change)
  → engine.js: renderXxx(state)  (returns HTML string)
  → main.js: _setViewHTML(html) (sets innerHTML, dispatches to DOM)
  → main.js: _setupDelegates(view) (attaches rootEl event listeners for [data-action])
  → User click → dispatcher reads actions[action] (from wireActions registry)
  → Handler mutates state, calls _render() again
```

### 3.2 data-action dispatcher (S18.6 lesson!)

**Location:** `src/main.js:380-403`

**Signature:** `actions[action](arg1, arg2, ...)` where:
- `this` = the element that was clicked (via `fn.call(el, ...)`)
- `arg1` = `el.dataset.arg` (undefined for toggles that only set data-arg2)
- `arg2` = `el.dataset.arg2` (e.g. 'hintEnabled' for toggles)

**Pitfall (S18.6 bug):** Function `toggleTeacherFeature(btn, key)` was reading `btn.classList` (param = undefined for toggles). **Correct:** read `this.classList` since `fn.call(el, ...)` sets `this = el`. See S18.6 commit for full post-mortem.

### 3.3 State persistence

- All state in `localStorage` under `fc_*` keys
- `STORAGE_KEYS` constant in `src/storage.js` (TEACHER_CONFIG, TEACHER_PIN, GARDEN_PROGRESS, etc.)
- 5s TTL cache on teacher config (invalidate on save)
- Per-student progress keyed by `studentHash` in `fc_progress_<hash>`

### 3.4 Feature flags

`src/constants/feature-flags.js`:
- `HOME_REDESIGN: true` (Sprint 27 U1)
- `RESUME_BANNER: true` (Sprint 27 U3)
- `WARM_THEME: false` (Sprint 27 D1, opt-in)
- `GARDEN_MODE: false` (Sprint 18.5) — hides 關係花園 card
- `MONOPOLY_MODE: false` (Sprint 18.5) — hides 道德大富翁 card

Per-flag localStorage override: `fc_flag_<NAME>` = `'0'` or `'1'`.

### 3.5 PWA / offline

`vite-plugin-pwa` + Workbox 7. `prebuild-sync.sh` mirrors `assets/images/**` → `public/assets/images/**` so all PNGs ship. Service worker auto-updates.

---

## §4 — Conventions (read this before editing)

### 4.1 Scenario schema

```json
{
  "id": "s-self-NN",
  "title": "Topic: short description",
  "background": "Location・time",
  "description": "Full scenario description (Cantonese)",
  "hints": ["hint 1", "hint 2", "hint 3"],
  "characters": [{"name": "小明", "emoji": "👦", "initial_relationship": 60}],
  "options": [
    {
      "id": "s-self-NN-a",
      "text": "Best option (Cantonese)",
      "effects": [{"character": "小明", "change": +15, "moralChange": +20, "comment": "..."}],
      "next_scenario": "s-self-MM"  // or null
    },
    {
      "id": "s-self-NN-b",
      "text": "Bad option",
      "effects": [...],
      "next_scenario": null,
      "stopAndThink": {
        "badBehavior": "short description",
        "consequence": "what happens",
        "isLoselose": true   // true = lose-lose, false = only self-punishing
      }
    }
  ],
  "location": "classroom",
  "topicId": "respect",     // 21 topic ids in topics.js
  "creedIds": [1, 2, 3],
  "imagePrompt": "English prompt for image_synthesize, must end with '16:9 aspect ratio'",
  "valueCategory": "respect",
  "domain": "value",         // value / caring / emotion-detective / family
  "audience": ["value"],
  "riskLevel": 0,           // 0-3
  "skills": ["respect", "empathy"],
  "subjectId": "value"       // value / family
}
```

### 4.2 Style guide (audit:style)

**Run:** `node tools/style/audit-scenarios.mjs` (or per-file with topic name)

**Rules** (`tools/style/audit-scenarios.mjs`):
- **Cantonese → 書面語:** NO colloquial markers in `option.text`, `effects[].comment`, `stopAndThink.{badBehavior, consequence}`
- Blacklist: `嘅`, `唔`, `咗`, `嚟`, `嗰`, `啲`, `啦`, `嘢`, `睇`, `搵`, `攞`, `畀`, `同埋`, `喺`, `邊個`, `邊度`, `點解`, `而家`, `今日`, `聽日`, `跟住`, etc. (full list in source)
- **Allowed compounds (exception):** `說話 / 廣東話 / 白話 / 官話 / 對話 / 空話 / 實話 / 大話 / 講大話 / 講話 / 感謝的話 / 真心話 / 心底話 / 電話`
- 替換 mapping: `嘅→的`, `唔→不`, `咗→了`, `嚟→來`, `嗰→那`, `啲→這些`, `啦→吧`, `嘢→東西`, `睇→看`, `搵→找`, `攞→拿`, `畀→給`, `同埋→和`, `喺→在`, `邊個→誰`, `邊度→哪裡`, `點解→為什麼`, `而家→現在`, `今日→今天`, `聽日→明天`, `跟住→然後`, `走開→離場`, `咩→什麼`, `話→說`
- **Length limits:** `optionText: 30`, `effectsComment: 40`, `badBehavior: 25`, `consequence: 80` chars

**Workflow:** Write scenarios → audit → fix violations → re-audit → 0.

### 4.3 Image generation

- `image_synthesize` tool generates one PNG per scenario via `assets/images/scenarios/<id>.png`
- `prebuild-sync.sh` mirrors `assets/` → `public/` before `npm run build`
- PWA precaches all PNGs
- Style suffix (REQUIRED): `"Hong Kong primary school setting, green school polo shirt uniform with white pants, FF XV Nomura anime style, character design, warm tones, clean background, no text, 16:9 aspect ratio"`
- For sensitive content (chest, etc.), retry with abstracted prompts (avoid explicit body parts)

### 4.4 Version bumping (SemVer in package.json)

- **PATCH** (2.12.x → 2.13.x): bug fixes, scenario additions, image additions
- **MINOR** (2.x → 3.x): new topic, breaking schema changes (NOT done in 18.x series)
- **MAJOR**: not applicable (PWA still v2)
- Tests use `>= 'X.Y.Z'` invariant — won't break with patch bumps

### 4.5 Commit message convention

`feat(<topic>): Sprint X.Y — short description (vA.B.C)` + multi-line body

### 4.6 Deploy flow (after every push to main)

1. GitHub Actions `ci.yml` (tests + a11y + build) — ~3-5 min
2. GitHub Actions `deploy.yml` (deploy to Pages) — ~1-2 min
3. **CRITICAL:** Monitor cron `mavis cron self <name>` to verify live + cleanup

**GH Pages deploy flake:** First deploy often fails with "try again later". Always set up retry / monitor cron. Earlier S18.1-S18.2 era needed 2-3 retries; S18.3+ has been stable 1-shot.

---

## §5 — Re-start procedure (next session)

### 5.1 Pre-flight (30s)

```bash
cd /Users/kencheng/workspace/friendly-classroom-v2
git status              # Should be clean
git log --oneline -5    # Confirm latest commit (a4c7fb9 v2.13.5)
git status --short     # Check for untracked
ls -la AGENTS.md        # This file should exist
```

If user is on different machine, clone first:
```bash
git clone https://github.com/ihateusingai-beep/friendly-classroom-v2.git
cd friendly-classroom-v2
```

### 5.2 State verification

```bash
# Verify live site
curl -sI https://ihateusingai-beep.github.io/friendly-classroom-v2/ | head -1

# Run tests + style audit
npm test -- --run
node tools/style/audit-scenarios.mjs

# Count scenarios
python3 -c "import json,os; print(sum(len(json.load(open(f'data/scenarios/{f}'))) for f in os.listdir('data/scenarios') if f.endswith('.json')))"
# Expected: 328

# Count images
ls assets/images/scenarios/ | wc -l  # Expected: 299
```

### 5.3 Start a new sprint

1. Read user request → identify target topic + scenario count
2. Plan with todowrite (5-7 todos usually)
3. Write scenarios in Python script (idempotent: detect collisions)
4. Style audit (round 1 → fix violations → round 2 = 0)
5. Generate images (parallel batch, retry on safety-filter)
6. prebuild-sync.sh + npm test + npm run build
7. Bump version (PATCH unless new topic = MINOR)
8. Commit + push
9. Set deploy monitor cron
10. Report when cron fires

### 5.4 Common gotchas

- **Cantonese → 書面語 is REQUIRED** for new scenarios. 1st draft typically 30-60 violations per file.
- **Sensitive content (chest, private parts)** may trigger image_synthesize safety filter. Retry with abstracted prompts.
- **Git push race:** if `git commit` and `git push` run in parallel, push may say "up-to-date" before commit lands. Solution: serialize, or re-push if you see this.
- **Cron `mavis self` format:** Single positional `cron_name`, not `cron delete mavis <name>`. Use args object.
- **Sprint 28 (D1/D2/D3/28.1) lived on `feat/family-life-domain-pilot` branch** for 2 weeks before merge in S18.7. **Lesson:** never let feature branches live >1 week without merging.
- **Pre-commit token file:** `/tmp/gh-tok/token.txt` — extract via `git credential fill` before any deploy monitoring. Cleanup with `mavis-trash` after.

---

## §6 — Pending work / open issues

### 6.1 Planned (user-requested but not yet executed)

- [ ] 數碼 bad-touch scenarios (e.g. 私處相, inappropriate video, online grooming) — would go to body-autonomy or a new digital-safety topic
- [ ] 家庭身體界線 scenarios (grandma/grandpa/relative hugging, parent bathing) — body-autonomy extension
- [ ] 學校身體界線 scenarios (PE partner, dance class touch) — body-autonomy
- [ ] SEN 朋友之間嘅界線 scenarios (already partial via s-self-130..138) — could expand

### 6.2 Known issues (low priority)

- **v2.13.0 → v2.13.2 release notes gap:** Sprint 28 lived on a branch and was merged with S18.7 in a single deploy. The BUILD_LOG v2.13.0/v2.13.1 entries are accurate but the live site jumped v2.12.5 → v2.13.2 with no v2.13.0/v2.13.1 ever serving. Documented in v2.13.2 entry.
- **moved scenario progress re-tag:** s-c6, s-self-31/33/166, st-7 moved to financial-literacy with same IDs but new topicId. Existing user progress on these scenarios under old topicId will appear "un-completed" — migration deferred to a future sprint if user requests.
- **Image generation edge case:** Some new PNGs may be smaller than 5KB or have safety-filter issues. The `tests/sprint28-1-family-images.test.js` style check catches 5KB issues.
- **Cron cronId format:** Cron `self` returns cronId as UUID (e.g. `957cc671-...`). Need to use this for `cron delete` (not the cronName).

### 6.3 ARCHITECTURE.md / SPEC.md updates needed

- ARCHITECTURE.md §4.2 inventory (was 18 → 21 topics; needs 21 + Sprint 18.7-18.10 entries)
- SPEC.md §X references to scenarios moved to financial-literacy (s-c6 etc.) need new section
- BUILD_LOG.md — v2.13.5 entry not yet appended (this is latest commit)

---

## §7 — Sprint cadence (last 6 months)

| Period | Sprints | Cadence |
|---|---|---|
| 2026-07-03 (3 sprints in 1 day) | 18.3, 18.4, 18.5 | Fast — bug fixes + auth |
| 2026-07-03 evening | 18.6 | Fast — critical bug fix |
| 2026-07-04 / 05 | Sprint 28 D1/D2/D3/28.1 (4 commits) | Family domain pilot + 30 PNGs |
| 2026-07-18 (4 sprints in 1 day) | 18.7, 18.8, 18.9, 18.10 | Fast — financial topic + bad/good touch expansion |
| 2026-08-01 | (this handoff doc) | Planning mode |

**Pattern:** User tends to batch related requests in single sessions. Sprints 18.7-18.10 all done in one ~2-hour session. Sprint 28 was 2-day focused effort.

---

## §8 — Pedigree / handoff chain

This project has had **at least 2 different agent contexts** in the same workspace:

1. **Mavis (this Mavis, agent name = `mavis`)** — built S18.x + Sprint 28, also a parallel `pdf-tool` Mavis session for an unrelated project. Memory file: `/Users/kencheng/.minimax/agents/mavis/memory/MEMORY.md` (1195 lines, 81KB).

2. **Earlier Mavis session (2026-07-05)** — committed `ad6bb81` (Sprint 28.1) and `21438d1` (D3). Branched work from these.

**Note on git author:** Some commits appear as `Ken Cheng <kencheng@github.com>` (user) and some as `Mavis <Mavis@mavis.local>` (agent). Both are intentional.

---

## §9 — Quick reference (commands)

```bash
# Local dev
npm run dev                # Vite dev server (HMR)

# Tests
npm test -- --run          # All 408 tests
node tools/style/audit-scenarios.mjs                          # Style audit (all files)
node tools/style/audit-scenarios.mjs body-autonomy             # Per-file
node tools/style/audit-scenarios.mjs --json                    # JSON output for CI

# Build
bash prebuild-sync.sh       # Mirror assets/ → public/
npm run build               # Vite build → dist/

# Deploy monitor (set after push)
mavis cron self s<name> --every 60s --prompt '...'

# Cron cleanup
mavis cron list mavis       # List
mavis cron delete --agent_name mavis --cron_id <UUID>

# GH token extract (for API)
mkdir -p /tmp/gh-tok && { echo 'protocol=https'; echo 'host=github.com'; } | git -C ~/workspace/friendly-classroom-v2 credential fill | grep '^password=' | sed 's/^password=//' > /tmp/gh-tok/token.txt && chmod 600 /tmp/gh-tok/token.txt

# Live site
curl -sI https://ihateusingai-beep.github.io/friendly-classroom-v2/ | head -1
```

---

## §10 — File-state invariants (must hold across sessions)

1. `package.json` version matches the latest BUILD_LOG.md entry
2. `data/scenarios/*.json` total scenario count = 328 (was 307 before S18.7, 313 after S18.8, 319 after S18.9, 328 after S18.10)
3. `assets/images/scenarios/` PNG count = 299 (was 281 before S18.7, +8 = 289, +6 = 295, +6 = 301, +9 = 310... actually need to recount)

> ⚠️ The PNG count check above is approximate. Use `ls assets/images/scenarios/ | wc -l` for ground truth. Each scenario that should have a PNG will have one (renderer fallback at `engine.js:1300`).

4. `node tools/style/audit-scenarios.mjs` returns 0 violations
5. `npm test -- --run` returns 408 passed (24 test files)
6. Git `main` branch has no uncommitted changes
7. GH Pages URL returns HTTP 200

If any of these fail, do not ship — fix first.

---

*End of AGENTS.md. Next update: after next sprint lands.*
