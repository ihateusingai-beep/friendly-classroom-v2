# Build Log - friendly-classroom-v2

## v2.13.1-2026-07-05 - Sprint 28.1: Family Domain scenario illustrations (30 PNGs)

**Date:** 2026-07-05
**Sprint:** 28.1 (patch on top of v2.13.0)
**Type:** PATCH — adds illustration assets + provenance; no schema/UI changes
**Branch:** `feat/family-life-domain-pilot`

### Highlights

- Generated **30 16:9 scenario illustrations** for the Family Domain pilot
  (15 `healthy-eating` + 15 `screen-time`), one PNG per scenario, naming
  `<id>.png` so the existing renderer fallback (src/engine.js:1300)
  ships them with **zero code change**.
- Populated `imagePrompt` field in both `data/scenarios/healthy-eating.json`
  and `data/scenarios/screen-time.json` to lock visual provenance for
  future regen — every prompt ends with the canonical 16:9 / no-text / no-logo
  anchor suffix.
- Anchor character: **小明** (Hong Kong 7-year-old boy) across all 30,
  mirroring emotion-detective's single-anchor pattern. RiskLevel-2 scenes
  (stranger-DM st-11, cyberbullying st-10) lean on **emotional reaction**
  (worried, confused) NOT menacing faces, keeping them SEN-safe.
- Style suffix mirrored from `BATCH2_PROMPTS_HQ.md`: warm soft pastel
  tones, anime cartoon, expressive character art, HK primary-school /
  home setting.

### Files Changed

| File | Delta |
|---|---|
| `data/scenarios/healthy-eating.json` | + `imagePrompt` on 15 entries |
| `data/scenarios/screen-time.json` | + `imagePrompt` on 15 entries |
| `assets/images/scenarios/he-*.png` | 15 new PNGs (JPEG-in-PNG, 1280×720, ~150–340KB each) |
| `assets/images/scenarios/st-*.png` | 15 new PNGs (same dimensions) |
| `public/assets/images/scenarios/{he,st}-*.png` | 30 mirrored by prebuild-sync.sh |
| `tools/expansion/gen_family_images.py` | new — clones gen_new_images.py pattern, MiniMax image-01 pipeline |
| `tests/sprint28-1-family-images.test.js` | new — 5 invariants (PNG presence, size, imagePrompt shape, sync parity) |
| `package.json` | version 2.13.0 → 2.13.1 (PATCH) |

### Acceptance criteria

| AC | Result |
|---|---|
| AC1 `npm test` 全 pass | ✅ 408 passed (24 files, prev 403 / 23), 新 sprint28-1 加 5 invariants |
| AC2 `npm run build` 成功 | ✅ 1.22s build, dist contains 30 family PNGs, precache 1108 entries |
| AC3 Visual QA on 6 PNGs (he-1/3/7, st-1/3/7) | ✅ anchor character consistent, warm tone, no text/logos, SEN-friendly |
| AC4 `git log` shows 28 + 28.1 commits | ⏳ pending — this entry lands before the patch commit |
| AC5 Version 2.13.0 → 2.13.1 | ✅ |
| AC6 BUILD_LOG.md v2.13.1 entry | ✅ this section |
| AC7 ARCHITECTURE.md `Last reviewed:` | ⏳ see commit |
| AC8 No new console warnings at first-paint | ⏳ see commit |

### Open / future

- **outcome images** (good / bad reaction per option, 60-90 PNGs) — earmarked for v28.2
- **anchor character tightening** — st-11 anchor looks slightly older than he-*;
  v28.2 will refine prompt
- **Single-character representativeness** — consider introducing 小美 /
  小晴 for ~half scenarios in v28.2 to broaden HK diversity while keeping
  consistency via a stricter anchor prompt

---

## v2.13.0-2026-07-04 - Sprint 28: 家庭生活 domain pilot (飲食習慣 + 屏幕時間)

**Date:** 2026-07-04
**Sprint:** 28
**Type:** New domain (4th subject — value + caring + emotion-detective + family)
**Branch:** `feat/family-life-domain-pilot`

### Highlights

- 引入第 4 個 domain — 🏠 家庭生活（reuse 學校 infra, 純前端、Sprint 27 暖色主題、PWA 雙 domain）。
- **Pilot scope: 2 topics × 15 scenarios = 30 scenarios**, 跟其他 domain 15×n pattern。
  - 🥗 `healthy-eating` (飲食習慣) — 15 scenarios, 綠色 (`#22C55E`)
  - 📱 `screen-time` (屏幕時間) — 15 scenarios, 粉紅 (`#F472B6`)
- **iPad-first** — student-only auth (無 parent/teacher flow), 5 個 home filter tab 加
  `flex-wrap: wrap` + `min-height: 44px` 確保 iPad portrait 唔擠迫。
- **Collaborative tone** — 用戶決策:學生 + 家人一齊 reflect, 而非 teacher-judging。
- **教師 toggle** — `familyEnabled: true` 默認, 對齊 `emotionDetectiveEnabled` pattern。

### Schema Invariants (per scenario)

| 屬性 | 值 |
|---|---|
| `subjectId` | `'family'` |
| `topicId` | `'healthy-eating'` \| `'screen-time'` |
| `domain` | `'family'` |
| `valueCategory` | 同 `topicId` |
| `audience` | `['family', 'value']` |
| `riskLevel` | `1` 或 `2` (≤ 2 per SPEC §28.2) |
| `moralChange` 範圍 | `[-18, +18]` |
| options/場景 | 4-option minimum, ≥1 positive + ≥1 negative |

### Changes Applied (4 areas)

**1. Topics registry** (`src/topics.js`)
- 新增 `FAMILY = [healthy-eating, screen-time]` const
- `TOPICS = [...VALUES, ...CARING, ...EMOTION_DETECTIVE, ...FAMILY]` 由 18 → 20
- 新增 helpers: `getFamilyTopics()`, `isFamilyTopic(id)`

**2. Subject registry** (`src/subjects.js`)
- 新增 `SUBJECTS[1] = { id: 'family', title: '家庭生活', emoji: '🏠', color: '#F59E0B', bgColor: '#FEF3C7', icon: '家庭' }`
- `getAllSubjects()` 自動 return 2 subject

**3. Scenarios** (`data/scenarios/`)
- `healthy-eating.json` — 15 scenarios, he-1..he-15
- `screen-time.json` — 15 scenarios, st-1..st-15

**4. UI / UX** (`src/engine.js`, `src/storage.js`, `src/style.css`, `src/actions/inline.js`)
- `isFamilyEnabled()` helper — 對齊 `isEmotionDetectiveEnabled` pattern
- `storage.js _DEFAULTS.familyEnabled = true`
- `setHomeFilter` 接受 `family` filter
- `renderHome` 加 `🏠 家庭生活` filter tab (5 tabs now, default `'all'`)
- `renderHome` 加 `familyCount` counter
- `renderHome` `sectionTitle` 加 `🏠 N 個家庭生活課題` 分支
- `renderTopicList` 加 deep-link guard 對 disabled family topic
- `renderTeacherAssign` 加 `🏠 家庭生活` toggle switch
- `style.css .home-filter-row` 加 `flex-wrap: wrap` + `.home-filter-tab min-height: 44px`
- Sprint 23 topic-count invariant `TOPICS.length === 18` → `=== 20`

### 關鍵文件

| File | Sprint 28 Diff |
|---|---|
| `src/topics.js` | +`FAMILY` const, +helpers (~50 LoC) |
| `src/subjects.js` | +`family` subject entry (~10 LoC) |
| `src/storage.js` | +`familyEnabled: true` default (~5 LoC) |
| `src/engine.js` | +`isFamilyEnabled()`, +filter tab, +counts (3 hunks) |
| `src/actions/inline.js` | +`'family'` in `_ALLOWED_HOME_FILTERS` (~2 LoC) |
| `src/style.css` | +`.home-filter-row flex-wrap`, +`min-height: 44px` (~5 LoC) |
| `data/scenarios/healthy-eating.json` | +15 scenarios (~330 LoC) |
| `data/scenarios/screen-time.json` | +15 scenarios (~340 LoC) |
| `tests/sprint28-family-domain.test.js` | 新 file (~280 LoC) |

### Acceptance Criteria Status

| AC | 結果 |
|---|---|
| AC1: `npm test` 全 pass | ✅ 403 passed (23 files), 包括新 sprint28 28 個 invariant |
| AC2: `npm run build` 成功 | ⏸ Sprint 28 build 仍未跑 (下一步 sprint 28.1) |
| AC3: `audit-touch-targets` 全 ≥ 44×44px | ✅ 8/8 PASS (iPad baseline) |
| AC4: `audit-spacing` 全 tokenized | ✅ 310 declarations all tokenized |
| AC5: `audit-font-sizes` 全 tokenized | ✅ 153 token refs PASS |
| AC6: `audit-scenarios` 0 violations | ✅ All scenarios pass (Style guide V3 §3 + §4) |
| AC7: TOPICS.length 20 (= 12 + 5 + 1 + 2) | ✅ invariant `expect(TOPICS).toHaveLength(20)` |
| AC8: iPad portrait 5 filter tabs wrap OK | ✅ `flex-wrap: wrap` 加咗 |
| AC9: family topic colors avoid clash | ✅ `#22C55E` (green, new) + `#F472B6` (rose, new) |

### Collab Tone Invariants (對齊 SPEC §28.2)

每 scenario:
- ≥ 1 「同家人傾偈」option (升 +12 至 +18) — 學生主動 seek family input
- ≥ 1 「與家人協商」option (升 +15 至 +18) — 唔係 subordination 都唔係 rebellion
- ≥ 1 「隱瞞/偷偷地」option (降 -12 至 -15) — 欺騙雙重 penalty (trust + waste)
- ≥ 1 「乖乖順從無思考」option (降 -10 至 -12) — passive obedience 都唔鼓勵

### Migration Path

- 舊嘅 `subjectId='value'` scenarios **唔受影響** — schema 唔變, 仍可答。
- 新嘅 `subjectId='family'` scenarios auto-loaded via `import.meta.glob`.
- 用戶冇 explicit reset — 默認 home filter 仍係 `value` for value student, 但 family subject
  student 自動 focus 🏠 tab。

### Rollback

`git revert <Sprint 28 HEAD-sha>~3..<Sprint 28 HEAD-sha>` 三 commit 即可。或者從 pre-Sprint28 main:
- `data/scenarios/healthy-eating.json` delete (orphan, no other refs)
- `data/scenarios/screen-time.json` delete
- `src/topics.js` revert
- `src/subjects.js` revert
- `src/storage.js` revert (`familyEnabled: true` 移除)
- `src/engine.js` revert (`isFamilyEnabled` helpers + filter logic)
- `src/actions/inline.js` revert (`'family'` 從 `_ALLOWED_HOME_FILTERS` 移除)
- `src/style.css` revert (`flex-wrap` + `min-height`)
- `tests/sprint28-family-domain.test.js` delete
- `package.json` version: 2.13.0 → 2.12.5

### Known Limitations / Future Work

- **Image gen** — 30 scenarios 全部 text-only (無 scenario illustrations)。
  Sprint 28.1 可以 patch 加 60 張 image (`<topic>_<scenario>-<role>.png` 16:9)。
- **Voice profile** — `speakScenario()` 仍用 generic narrator tone。家庭 scenarios
  tone tuning 留 Sprint 28.2 polish。
- **iPad splash / orientation lock** — PWA unconfigured, iPad 用 browser。Sprint 28.1 可加
  apple-touch-icon + splash screen。
- **Family Voice** — Pilot 預設無 family login (per user 決策 auth_student_only)。
  Sprint 29 可加 parent dashboard (Telegram mirror 或 web-only)。

### Related

- SPEC.md §28 (待補 addendum)
- ARCHITECTURE.md §3 / §4 (updated §4.2 inventory table)
- Sprint 27 (warm theme, single-column home) — Sprint 28.1 build 仍用呢個 theme
## v2.12.1-2026-07-03 - Sprint 18.2.1: Teacher mode entry-point bug fix (production)

**Date:** 2026-07-03
**Git:** (pending — Sprint 18.2.1 commit)
**GitHub Pages:** https://ihateusingai-beep.github.io/friendly-classroom-v2/

### Bug Fixed

User-reported (2026-07-03):「首頁的老師，家長模式按下去無反應」

### Root Cause

ESBuild production minifier dropped the `_loadTeacher` entry from `wireActions({...})` call in main.js line 503. Two related issues in the same Sprint 18.1 / Sprint 18.2 area:

**Issue 1 — `_loadTeacher` dep injection was tree-shook**
- `wireAuth({ ..., _loadTeacher: deps._loadTeacher })` (actions/index.js:48)
- `wireHub` 漏 pass `_loadTeacher` dep — `goTeacher(_loadTeacher)` 收到 `undefined` parameter
- Inside `wireAuth`, `_loadTeacher = _loadTeacher` 是 self-assign — ESBuild minifier 視為 noop → drop call site `_loadTeacher: deps._loadTeacher` from `wireActions({...})` object literal
- Result: production bundle `Kr({...wireActions call})` 完全冇 `_loadTeacher` entry → `chooseRole('teacher')` 入面 `await Nr()` (`Nr = _loadTeacher`) throws "Nr is not a function"

**Issue 2 — `updateAnalyticsSummary` missing import**
- main.js line 507: `if (state.view === 'settings') updateAnalyticsSummary();` (post-render hook)
- `updateAnalyticsSummary` 喺 `domain/IO.js` export 但 main.js **冇 import**
- 結果: settings page render throws `ReferenceError: updateAnalyticsSummary is not defined` → falls back to error UI → 「進入老師模式」button 唔 render → user 見「按下去無反應」

### Fix Applied (4 surgical changes)

| File | Change | Why |
|---|---|---|
| `src/main.js` (render() case 'login') | Add `import('./teacher.js').then(...)` + re-render fallback when `_teacher === null` | render() 自己動態加載 teacher chunk，唔再靠 `_loadTeacher` injection |
| `src/main.js` (render() case 'teacher') | Same dynamic-import fallback | Same as above |
| `src/domain/Auth.js` chooseRole | Remove `await _loadTeacher();` call | render() 自己 handle |
| `src/games/Hub.js` goTeacher | Remove `_loadTeacher` parameter (signature 變 `goTeacher()`) | render() 自己 handle |
| `src/main.js` | Add `import { updateAnalyticsSummary } from './domain/IO.js'` | 修第 2 個 bug |

**Decoupling approach**: 之後任何 entry point（chooseRole / goTeacher / future nav）只 setView('login') + render() 就 work，唔再依賴 `_loadTeacher` injection。Production minifier 砍 wireActions entry 唔再影響 teacher-mode flow。

### Teacher chunk caching behaviour

- 第一次 click 老師 mode → render() 見 `_teacher === null` → dynamic import `./teacher.js` → renderLoading → 動態加載 → 設 `_teacher` cache → re-render → 顯示 login modal
- 第二次 click (cached) → `_teacher` 已有 → 直接 render login modal，唔再 import

### Files Touched

| File | Change |
|---|---|
| `src/main.js` | +1 import (updateAnalyticsSummary), render() case 'login'/'teacher' 加 dynamic import fallback (~28 lines net) |
| `src/domain/Auth.js` | chooseRole 刪 1 line (`await _loadTeacher()`) + 更新註解 |
| `src/games/Hub.js` | goTeacher 刪 1 line + signature 改 `goTeacher()` |
| `tests/sprint18-fix-teacher-entry.test.js` | NEW — 7 個 source-level regression guards |
| `package.json` | 2.12.0 → 2.12.1 (PATCH — bug fix only, 唔加 feature) |

### Acceptance Criteria Status

| # | Criterion | Status |
|---|---|---|
| AC1 | `npm test` 全綠 (368 + 7 new) | ✓ 375 tests |
| AC2 | Production build no error fallback on settings view | ✓ (verified via Playwright path D) |
| AC3 | Path A (role-select → chooseRole → login → dashboard) | ✓ PASS |
| AC4 | Path B (home → settings → goTeacher → login → dashboard) | ✓ PASS |
| AC5 | Path C (re-enter teacher — cached chunk reuse) | ✓ PASS |
| AC6 | Path D (settings page render — no ReferenceError) | ✓ PASS |
| AC7 | 0 page errors across all 4 paths | ✓ |
| AC8 | `npm run audit:*` 仍然 PASS | TBD (run before commit) |

### Rollback

```bash
git revert <S18.2.1-commit-sha>
```

---

## v2.12.0-2026-07-03 - Sprint 18.2: Relationship Garden polish (monologue bubble + a11y SR)

**Date:** 2026-07-03
**Git:** (pending — S18.2 polish commit)
**GitHub Pages:** https://ihateusingai-beep.github.io/friendly-classroom-v2/

### Changes Applied

兩個 polish 改動喺 Sprint 18.1 (§23 / v3.13) garden monologue bubble ship 之後發現嘅兩個 gap:

**Pol-1 — Monologue bubble avatar visual polish**

`.garden-monologue` 由 vertical stack 改成 flex row layout,加 40×40 character avatar mini-thumb 喺 bubble 左邊:

- 新增 `.garden-monologue-avatar` (40px circle, white border + soft shadow)
- 新增 `.garden-monologue-body` (`flex: 1; min-width: 0`)
- `.garden-monologue` 加 `display: flex; align-items: flex-start; gap: var(--space-3)`
- Avatar 來源重用 `character.avatar` (即 `assets/images/garden/{小美|小晨|小輝}.png`),**0 new image asset, 0 PWA precache growth**
- Avatar `<img alt="" aria-hidden="true">` — 純視覺裝飾, visible prefix 已標明 character name

**Before (S18.1)**: 
```
┌──────────────────────────────────────────┐
│ 小美 諗緊:                              │
│ 咦, 你真係有留意我...                  │
└──────────────────────────────────────────┘
```

**After (S18.2)**:
```
┌──────────────────────────────────────────┐
│ ┌────┐                                  │
│ │IMG │  小美 諗緊:                      │
│ │40px│  咦, 你真係有留意我...          │
│ └────┘                                  │
└──────────────────────────────────────────┘
```

**Pol-2 — a11y SR tweak**

ARIA + semantic HTML 重構:

| Before (S18.1) | After (S18.2) |
|---|---|
| `role="complementary"` | `role="note"` |
| `aria-label="小美嘅內心話"` (hidden label, double-read) | *(移除 — semantic HTML 取代)* |
| `<div>` prefix (generic) | `<h3>` prefix (semantic heading) |
| `<div>` text (generic) | `<p>` text (semantic paragraph) |

**SR announce 順序**: 之前 `互補內容 / 小美嘅內心話 / 小美 諗緊: / 咦, 你真係有留意我...` (character name 雙讀), 之後 `note / 小美 諗緊：咦，你真係有留意我...` (character name 單讀)。

**唔用 `aria-live="polite"` auto-announce** — 理由同 §22.16.1 一致, monologue 屬 scene context, user-driven navigate 先讀, 避免 SR noise。

### 關鍵文件

| File | Change |
|---|---|
| `src/engine.js` | `renderGardenPlay()` monologue block: `role="note"` + avatar `<img>` + `<h3>`/`<p>` semantic restructure |
| `src/style.css` | `.garden-monologue` 加 `display:flex` + new `.garden-monologue-avatar` (40px) + new `.garden-monologue-body` (flex:1) + reset `<h3>`/`<p>` margin |
| `tests/sprint18-garden.test.js` | +4 個 semantic-a11y test (role=note / h3+p semantic / img alt empty / aria-label 移除) |
| `SPEC.md` | v3.13 → v3.14 + 加 §24 (Addendum) |
| `package.json` | version 2.11.0 → 2.12.0 |

### Acceptance Criteria Status

| # | Criterion | Status |
|---|---|---|
| AC1 | `npx vitest run` 全綠 (363 + 4 new) PASS | TBD (run before commit) |
| AC2 | `npx vite build` 過, PWA precache 唔變 | TBD |
| AC3 | `npm run audit:style` PASS | TBD |
| AC4 | `npm run audit:a11y` PASS | TBD |
| AC5 | `npm run audit:touch-targets` PASS | TBD |
| AC6 | `npm run audit:font-sizes` PASS | TBD |
| AC7 | `npm run audit:spacing` PASS | TBD |
| AC8 | data-action-guard PASS (monologue 冇新 data-action, 既有 test cover) | TBD |
| AC9 | All new HTML escaped via escapeAttr | ✓ (character.avatar + monologue escaped) |

### Rollback

```bash
git revert <S18.2-commit-sha>     # revert both Pol-1 + Pol-2 in one revert
```

Or selective revert if commit 拆 sub-commit:
```bash
git revert <Pol-1-commit-sha>     # revert avatar polish only
git revert <Pol-2-commit-sha>     # revert a11y SR tweak only
```

### Related

- Sprint 18.1 §23 (v3.13) — original garden monologue ship (`feat(garden): Sprint 18.1 UI ship`)
- SPEC §24 v3.14 — this addendum
- SPEC §22.16.1 — reasoning why monologue 唔用 `aria-live` auto-announce

---

## v2.11.0-2026-06-27 - Sprint 27: Engagement Overhaul

**Date:** 2026-06-27
**Git:** (pending — sprint 27 commit)
**GitHub Pages:** https://ihateusingai-beep.github.io/friendly-classroom-v2/

### Changes Applied

Three engagement-overhaul features shipped behind per-feature kill-switches:

**U1 — Home page single-column redesign**
- Hero + creed stay top (Tier 1, 2)
- 4-tab filter row preserved (so students can narrow before expanding)
- Topic grid wrapped in `<details>` default-collapsed → 18 topic cards no longer all demand vertical attention on first paint
- Footer reduced from 4 buttons to 3 quick actions; `switchStudent` collapsed into header right button (1-tap access)
- Gated by `FLAGS.HOME_REDESIGN` (default ON; revert per-user with `localStorage.setItem('fc_flag_HOME_REDESIGN','0')`)
- Why: SEN/MID students exhibit "choice paralysis" with 18 simultaneous topic cards. Single-column hierarchy reduces first-paint cognitive load.

**U3 — Auto-resume last scenario**
- New `src/domain/Resume.js` pure helpers (recordLastPlayed, dismissResume, getResumeCandidate, formatRelativePlayed)
- Top-of-home "📍 繼續上次" banner with relative timestamp ("3 分鐘前", "昨日", "3 日前")
- 5 hide-rules: no fc_last_scenario / scenario not in cache / already completed / dismissed within 24h / > 7d stale
- Per-scenario dismiss with 24h cooldown (multi-scenario students see fresh scenarios immediately, stale ones silently suppressed)
- Play view writes both `fc_last_scenario` (existing) + `fc_last_played_at` (new) on entry
- New `actions/resumeLast` / `dismissResume` (registered in `actions/inline.js`)
- Gated by `FLAGS.RESUME_BANNER` (default ON)
- Why: drop-off after reload / accidental nav was a known engagement tax; auto-resume keeps working memory warm.

**D1 — Color theme shift (warm green / cream)**
- New `src/constants/feature-flags.js` single source of truth (FLAGS + isFeatureEnabled + setFeatureOverride)
- Default OFF (visual brand change, opt-in only — existing users see no surprise)
- When ON: primary `#7C3AED` (NT-D purple) → `#10B981` (emerald, 堅毅 🌱 growth metaphor); bg `#FFFFFF` → `#FAF7F2` (warm cream, paper feel); softened success/danger/warning hues
- NT-D purple preserved as accent (welcome screen + logo)
- Contrast ratios verified: body text 14.1:1 (AAA), primary 4.62:1 (AA), danger 4.51:1 (AA)
- `<html data-warm-theme="true">` set by `applyCSS()` based on flag; CSS override block in `src/style.css :root[data-warm-theme="true"]`
- Why: ASD sensory research shows high-saturation cool colors trigger avoidance; emerald + cream supports sustained attention for SEN/MID learners

### 關鍵文件

| File | Change |
|---|---|
| `src/constants/feature-flags.js` | NEW (FLAGS + isFeatureEnabled + setFeatureOverride) |
| `src/domain/Resume.js` | NEW (recordLastPlayed / dismissResume / getResumeCandidate / formatRelativePlayed) |
| `src/engine.js` | `renderHome()` restructure (3-tier + `<details>` collapse + resume banner integration) |
| `src/actions/inline.js` | +resumeLast() +dismissResume() handlers |
| `src/domain/Play.js` | recordLastPlayed() call on scenario entry (timestamp alongside fc_last_scenario) |
| `src/audio.js` | applyCSS() now toggles `data-warm-theme` attribute per FLAGS.WARM_THEME |
| `src/style.css` | +home-topics-disclosure + home-resume-banner CSS; +:root[data-warm-theme="true"] token override block |
| `tests/sprint27-feature-flags.test.js` | NEW (12 tests) |
| `tests/sprint27-resume.test.js` | NEW (22 tests) |
| `tests/sprint27-home-redesign.test.js` | NEW (~38 tests, includes U1/U3/D1 integration) |
| `package.json` | version 2.10.0 → 2.11.0 |

### Acceptance Criteria Status

| # | Criterion | Status |
|---|---|---|
| AC1 | `npx vitest run` 全綠 (252 + 60+ new) PASS | ✓ 348 tests |
| AC2 | `npx vite build` 過, bundle size change < ±5% | TBD (run after commit) |
| AC3-AC6 | All 4 audits PASS | TBD |
| AC7 | data-action-guard.test.js PASS (resumeLast/dismissResume registered) | ✓ |
| AC8 | double-class-guard.test.js PASS | ✓ |
| AC9 | All new HTML escaped | ✓ (escapeAttr on title + aria-label) |
| AC11 | Manual smoke: resume banner shows on reload with fc_last_scenario | TBD |

### Rollback

Each commit is independently revert-able:
```bash
git revert <U1-commit-sha>     # revert redesign only
git revert <U3-commit-sha>     # revert resume banner only
git revert <D1-commit-sha>     # revert warm theme only
```

Per-user override (without reverting code):
```js
localStorage.setItem('fc_flag_HOME_REDESIGN', '0');   // kill U1
localStorage.setItem('fc_flag_RESUME_BANNER', '0');  // kill U3
localStorage.setItem('fc_flag_WARM_THEME', '1');     // opt-in D1
```

---

## v2.10.0-2026-06-26 - Emotion-Detective Pedagogy MID Adaptation

**Date:** 2026-06-26
**Git:** (pending — sprint 26 commit)
**GitHub Pages:** https://ihateusingai-beep.github.io/friendly-classroom-v2/

### Changes Applied
- **5 個 emotion-detective scenarios 重寫 correct answer + wording** for MID (moderate intellectual disability) 學生 pedagogy:
  - ed-3 比人搶玩具: correct 嬲 → **喊** (first reaction), wording 加「小明好傷心，眼淚都流晒出嚟」
  - ed-5 朋友大叫: wording 由「嘩！」中性 → **「生日快樂！仲送咗一份禮物」** (positive surprise cue)
  - ed-7 全班望住: correct 尷尬 → **驚** (怯場 concrete emotion)
  - ed-9 唔識答老師問題: correct 困惑 → **驚** (wording 加「小明好驚畀老師鬧」)
  - ed-10 考試攞第一: correct 驕傲 → **開心** (concrete observable emotion)
- **Test invariant 改動** (`tests/sprint25-emotion-categories.test.js` §4):
  - Ekman 6 distinct correct → at-least-once pool exposure (容許重複, 配合 spaced repetition pedagogy)
  - Social category covers 4 distinct self-evaluative → covers 4 scenarios (emotion 可為 basic Ekman)
- **Face image reuse**: 30 張 face PNG 全部沿用 (同角色風格一致), 唔使 regen
- **Scenario image regen pending**: `ed-5-scenario.png` 待 AI gen positive surprise context

### 關鍵文件
- data/scenarios/emotion-detective.json: 5 scenarios edit (faceOptions correct swap + wording + emotionLabel)
- tests/sprint25-emotion-categories.test.js §4: invariant 由 strict distinct → at-least-once exposure
- SPEC.md §22.17: Sprint 26 addendum
- package.json: version 2.9.0 → 2.10.0
- assets/images/emotion-detective/ed-5-scenario.png: pending regen

### Rollback
```bash
cd ~/workspace/friendly-classroom-v2
git reset --hard <sprint-26-commit-prev>  # 回滾到 v2.9.0 stable
git push --force origin main
```

---

## v2.2.0-2026-06-04 - Outcome Images + Web Speech TTS

**Date:** 2026-06-04
**Git:** c25898d
**GitHub Pages:** https://ihateusingai-beep.github.io/friendly-classroom-v2/

### Changes Applied
- **46 張 Ghibli 風格場景圖**: assets/images/scenarios/ s1-s-new22 (16:9)
- **129 張 Outcome 結果圖**: assets/images/outcomes/ `{scenario}_opt{N}.png`
  - 好結果 (moral ≥ 5): 温暖友誼場面
  - 中性結果 (-4 to 4): 平静離開場面
  - 壞結果 (< -4): 悲傷衝突場面
- **結果頁顯示 Outcome Image**: engine.js chooseOption() → outcomeImage path
- **Web Speech API TTS**: audio.js speakScenario() 直接用 speak()，移除 MP3 fallback
- **語音零依賴**: 全部改用瀏覽器 Web Speech API

### 關鍵文件
- src/engine.js: chooseOption() 回傳 outcomeImage
- src/audio.js: speakScenario() → speak() 直接 TTS
- assets/images/scenarios/: 46 張場景圖
- assets/images/outcomes/: 129 張結果圖

### Rollback
```bash
cd ~/workspace/friendly-classroom-v2
git reset --hard e9f68ca  # 回滾到 v2.1.0 stable
git push --force origin main
```

---

## v2.0.0-2026-06-03 - Special Ed UX Upgrade

**Date:** 2026-06-03
**Release:** https://github.com/ihateusingai-beep/friendly-classroom-v2/releases/tag/v2.0.0-2026-06-03
**Git:** f51968e

### GitHub Pages
https://ihateusingai-beep.github.io/friendly-classroom-v2/

### Changes Applied
- **巨型按鈕**: .btn min-height 64px, font 1.25em, hover lift效果, box-shadow
- **巨型選項卡**: .option-card min-height 72px, font 1.25em, border 3px
- **結果畫面**: 4em emoji, 漸層背景, bounceIn動畫, pulse效果(good only)
- **情緒動畫**: confetti彩色碎片(20個) + 星星上浮(6個) + 安慰💪bounce
- **Web Audio API SFX**: click/hover/success/fail/celebrate/complete (零外部依賴)
- **Result screen顯示場景圖**: scenario.image 傳入renderResult展示
- **場景圖片修復**: data/scenarios.json空檔案→從git f44a12e恢復(103KB, 46 scenarios)
- **initSFX()**: 全域按鈕自動音效

### 关键文件
- src/style.css: 按鈕/選項卡/結果卡/動畫keyframes
- src/main.js: choose() → triggerConfetti/StarFloat/Comfort + playSFX
- src/audio.js: playSFX() Web Audio API, initSFX()
- src/engine.js: chooseOption() → 回傳scenarioImage+scenarioTitle
- data/scenarios.json: 從git恢復，46 scenarios完整

### 部署狀態
- git push → GitHub Actions → GitHub Pages
- 最新: 09aadd9 committed 2026-06-03 03:46 UTC
- Actions: completed/success 28s

### 額外修正 v2.1.0 (2026-06-03)
8個不合理道德分數修正：
- s-new2 大聲喝止: +10→-10 | s-new2 默默忍受: -5→-15
- s-new5 扮事不關己: -5→-20 | s-new19 行開扮睇唔到: -5→-20
- s-c7 公開指責: +20→-10 | s-c5 立即告知老師: +20→+10
- s-new1 拒絕借: 0→-5 | s-new4 把遮借俾自己跑: +5→+15

### Rollback
```bash
cd ~/FC
git reset --hard f44a12e  # 回滾到上一個stable
git push --force origin main
```

---

## v1.0.0-2026-06-02 - Stable Build

**Date:** 2026-06-02
**Release:** https://github.com/ihateusingai-beep/friendly-classroom-v2/releases/tag/v1.0.0-2026-02

### GitHub Pages
https://ihateusingai-beep.github.io/friendly-classroom-v2/

### Fixes Applied
- CSS import fix (style.css bundled)
- TTS enabled=true default
- MP3 404 → Web Speech API fallback
- Voice selection priority: 粵語→國語→其他

### Audit Results
- 46/46 images: HTTP 200
- 46/46 scenarios: audio available
  - 8 MP3 (s1-s8)
  - 38 TTS fallback (s-c2, s-b1, s-h1-h5, s-b3-b4, s-c3-c9, s-door1-door6, s-new1-new22)
- 0 JS errors

### Rollback Command
gh release view v1.0.0-2026-02