# Architecture — friendly-classroom-v2

> **Status:** Living document, kept in sync with `src/` source of truth.
> **Last reviewed:** 2026-06-26 (post Sprint 26, v2.10.0)
> **Maintainer:** Mavis + kencheng

## 1. Project Snapshot

| | |
|---|---|
| **Type** | Static SPA + PWA — pure client-side, no runtime backend |
| **Stack** | Vanilla ES modules + Vite 6 + vite-plugin-pwa + Workbox |
| **Storage** | localStorage (offline-first by design); cloud sync configurable per deployment |
| **Deploy** | GitHub Pages via `.github/workflows/deploy.yml` |
| **Live URL** | <https://ihateusingai-beep.github.io/friendly-classroom-v2/> |
| **Audience** | HK primary-school 品德教育 (EDB values), SEN/ASD/MID-friendly |
| **Mode** | Single-user on shared device, multi-student (per-student progress namespace) |

## 2. Top-Level Layout

```
friendly-classroom-v2/
├── .github/workflows/      # CI: ci.yml (test + a11y) + deploy.yml (Pages)
├── audio/                  # Historical MP3 library from pre-Web-Speech era; kept for reference, not used at runtime
│   ├── creeds/
│   └── scenarios/
├── backend/                # Python reference backend (NOT deployed; used for sync server dev)
│   ├── main.py
│   ├── requirements.txt
│   └── start.sh
├── data/
│   └── scenarios/          # 18 per-topic JSON chunks, 299 scenarios total
├── docs/                   # Human-facing docs
│   ├── PRODUCT_PROPOSAL_V1.md
│   ├── STYLE_GUIDE_V3.md
│   ├── assets/
│   └── index.html          # Standalone demo page
├── plans/                  # Internal refactor proposals
│   └── architecture-refactor-phase1.md
├── src/                    # All runtime code (ES modules)
│   ├── actions/            # data-action dispatcher registry + handlers
│   ├── components/         # Reusable UI blocks (chrome, blocks, Onboarding, Toast)
│   ├── constants/          # Static config (Good Deed Bank)
│   ├── domain/             # Pure-domain modules (no DOM)
│   ├── games/              # Game-mode modules (Hub + Good Deed Bank)
│   ├── util/               # HTML escape helpers
│   ├── audio.js            # Web Speech API TTS + emotion prosody
│   ├── creeds.js           # EDB creed registry
│   ├── engine.js           # Renderers for every view (home/topic/play/result/...)
│   ├── i18n.js             # String table
│   ├── main.js             # Entry point + state machine + render dispatcher
│   ├── nav.js              # Universal `navigate(view, arg)` dispatcher
│   ├── storage.js          # Single localStorage registry
│   ├── style.css           # Design tokens + all component CSS (2,531 lines)
│   ├── subjects.js         # Subject (科目) metadata
│   ├── sw-register.js      # PWA service worker registration + update prompt
│   ├── sync.js             # Cloud sync (teacher config + analytics queue)
│   ├── teacher.js          # Teacher mode renderers (lazy-loaded)
│   └── topics.js           # Topic registry + filters
├── tests/                  # Vitest, 17 files / 252 tests
├── tools/                  # Dev tooling
│   ├── a11y/               # Playwright + axe-core audit scripts
│   ├── e2e/                # End-to-end bridges
│   ├── expansion/          # Bulk scenario expansion scripts
│   ├── migrate/            # Data migration tools
│   └── style/              # CSS regression audit
├── public/                 # Vite publicDir (copied verbatim into dist/)
│   ├── assets/             # Mirror of assets/images/ (created by prebuild-sync.sh)
│   ├── icons/              # PWA icons (192/512)
│   └── manifest.json
├── assets/                 # Source-of-truth image library
│   └── images/
│       ├── scenarios/      # 260 main scenario illustrations
│       ├── outcomes/       # 744 per-option outcome images
│       └── emotion-detective/  # 40 (10 scenarios × 1 scenario + 3 face)
├── SPEC.md                 # Product spec (UX requirements, sprint scope)
├── PLAN.md                 # Top-level product plan (architecture overview, originally)
├── BUILD_LOG.md            # Per-version changelog (v2.x.y)
├── package.json            # 2.10.0, vite + vitest + playwright
├── vite.config.js          # PWA manifest + workbox runtime caching
├── vitest.config.js        # Vitest setup
└── prebuild-sync.sh        # Mirror assets/images → public/assets/images
```

## 3. Source Module Inventory

**Total: 7,348 lines of JS across 28 files** (excluding `style.css`).

### 3.1 Entry Layer

| File | LoC | Role | Public API |
|---|---:|---|---|
| `src/main.js` | 504 | Entry, state machine, render dispatcher | `VIEWS`, `setView`, `loadScenarios`, `loadScenariosForTopic` |
| `src/nav.js` | 68 | Universal `navigate(view, arg)` | `navigate`, `wireNav` |
| `src/sw-register.js` | 221 | PWA SW lifecycle + update prompt | (side-effecting registration) |

### 3.2 Renderers (DOM → HTML)

| File | LoC | Role | Public API |
|---|---:|---|---|
| `src/engine.js` | 1478 | All view renderers (home/topic/play/result/progress/settings/teacher-assign/bank-*) + scenario shuffle + emotion-detective fork | `renderHome`, `renderTopicList`, `renderPlay`, `renderResult`, `renderProgress`, `renderSettings`, `renderTeacherAssign`, `renderGameHub`, `renderBankPlay`, `renderBankResult`, `renderBankSummary`, `playScenario`, `getCurrentScenario`, `chooseOption`, `suggestNext`, `ensureStudent`, `renderRoleSelect`, `renderModeSelect`, `GAME_MODES`, `getScenariosByTopic`, `getDisplayProgress`, `initTopicProgress`, `initSubjectProgress`, `isEmotionDetectiveEnabled` |
| `src/teacher.js` | 132 | Teacher login + dashboard (lazy chunk) | `renderLogin`, `renderTeacher` |
| `src/components/Onboarding.js` | 166 | First-visit carousel | `renderOnboarding`, `needsOnboarding` |
| `src/components/Toast.js` | 110 | SR announcer + visual toast | `announceToSR`, `announceScenarioLoad` |
| `src/components/blocks.js` | 167 | Reusable UI: option-card, face-option, footer, hint, stop-and-think | `renderOptionCard`, `renderFaceOptionCard`, `renderFaceComparison`, `renderStopAndThink`, `renderHintsPanel` |
| `src/components/chrome.js` | 69 | Page chrome: header, footer, empty state, loading, skeleton | `renderPageHeader`, `renderFooter`, `renderEmptyState`, `renderLoading`, `renderSkeleton` |
| `src/games/Hub.js` | 209 | Game-Hub mode picker | `renderGameHub`, `playGoodDeedBank`, `bankChoose`, `bankNext`, `exitBank`, `confirmExitBank`, `goTopic`, `goTeacher`, `goRandom` |
| `src/games/GoodDeedBank.js` | 128 | Good Deed Bank game engine | `startBankRun`, `getBankRun`, `endBankRun`, `recordBankTransaction`, `advanceToNextQuestion`, `BANK_CONFIG` |

### 3.3 Domain Layer (Pure, no DOM)

| File | LoC | Role | Public API |
|---|---:|---|---|
| `src/domain/ScenarioEngine.js` | 353 | Scenario load (lazy chunks), choose, mark complete, suggest next | `setScenarios`, `setStudent`, `getScenarioById`, `loadScenarios`, `loadScenariosForTopic`, `chooseOption`, `suggestNext`, `ensureStudent`, `getStudent`, `markScenarioShown`, `applyScenarioResult` |
| `src/domain/Play.js` | 229 | Play flow (play/choose/retry), result animations | `wirePlay`, `play`, `choose`, `retry`, `updateResultCtaFab` |
| `src/domain/Progress.js` | 331 | Per-student progress persistence + aggregation | `exportProgress`, `importProgress`, `getAllStudents`, `getProgress`, `updateSubjectTotal`, `getDisplayProgress` |
| `src/domain/Auth.js` | 102 | Login, role select, subject select | `renderStudentSelect` (re-export from Student), `renderSubjectSelect`, `chooseRole`, `selectSubject`, `selectMode` |
| `src/domain/Student.js` | 75 | Student selection, switching | `renderStudentSelect`, `switchStudent`, `selectStudent` |
| `src/domain/Feedback.js` | 290 | Stop-and-Think panel, reflection journal | `shouldRenderStopAndThink`, `formatStopAndThink`, `getStopAndThinkAriaLabel` |
| `src/domain/Moral.js` | 56 | Moral-score bar logic | `applyScenarioResult`, `getMoralBarData` |
| `src/domain/Analytics.js` | 220 | Interaction logging + CSV export | `logInteraction`, `markScenarioShown`, `exportInteractionsCSV`, `getStats`, `clearInteractions` |
| `src/domain/IO.js` | 260 | Import/export, teacher PIN, force sync, teacher config toggles | `handleImport`, `exportAll`, `exportMyData`, `importMyData`, `exportAnalyticsCSV`, `clearAnalytics`, `forceSync`, `toggleTeacherFeature`, `setTeacherTimer`, `setButtonSize`, `setBankMaxRisk`, `toggleAssignedTopic`, `saveTeacherPIN`, `saveTeacherConfig` |
| `src/domain/EventBus.js` | 34 | Module-level pub/sub (3-event: `moral:updated`, `sync:status`, `teacher:config-changed`) | `bus` (default export) |

### 3.4 Action Registry (data-action dispatcher)

| File | LoC | Role | Public API |
|---|---:|---|---|
| `src/actions/index.js` | 110 | Aggregate all action handlers into one `actions` registry; called once from main.js via `wireActions(deps)` | `wireActions`, `actions`, `hasAction` |
| `src/actions/inline.js` | 327 | Most action handlers: speak/speakOpt/speakCreeds, replay, repeatExposure, reload, setHomeFilter, setEmotionCategory, settings (setSpacing, toggleHC, toggleVoice, setTTSLang), student onboarding (addStudent, toggleHints, revealNextHint) | All `getInlineActions` fragment handlers |

### 3.5 Data / Storage / IO

| File | LoC | Role | Public API |
|---|---:|---|---|
| `src/storage.js` | 162 | Single localStorage registry; teacher config in-memory cache + bus invalidation | `STORAGE_KEYS`, `progressKey`, `lastSyncKey`, `get`, `set`, `remove`, `getTeacherConfig`, `setTeacherConfig`, `invalidateTeacherConfigCache` |
| `src/topics.js` | 290 | Topic registry (18 topics), EMOTION_CATEGORIES (Sprint 25), filter helpers | `TOPICS`, `VALUES`, `CARING`, `EMOTION_CATEGORIES`, `getTopic`, `filterScenariosByEmotionCategory` |
| `src/subjects.js` | 36 | Subject metadata (color/emoji) | `getSubjectColor`, `getSubjectBgColor`, `getAllSubjects`, `getSubjectName`, `getSubjectEmoji` |
| `src/creeds.js` | — | EDB creed registry | creed list |
| `src/sync.js` | 282 | Cloud sync (teacher config + analytics queue); exponential backoff | `initSync`, `syncNow`, `getSyncStatus` |
| `src/i18n.js` | 105 | String table (繁中 + light i18n) | `t(key)` |
| `src/constants/bank.js` | 42 | Good Deed Bank constants | (config only) |
| `src/util/escape.js` | 43 | HTML/JS attribute escaping (XSS guard) | `escapeAttr`, `escapeJsString` |

### 3.6 Audio

| File | LoC | Role | Public API |
|---|---:|---|---|
| `src/audio.js` | 618 | Web Speech API wrapper + emotion prosody map (10 emotions) + chained TTS + SFX | `speak`, `speakScenario`, `speakCreeds`, `speakEmotion`, `speakChained`, `stopSpeaking`, `isSpeaking`, `isEnabled`, `applyCSS`, `setSpacing`, `setHC`, `setVoiceEnabled`, `setTTSLang`, `getTTSLang`, `TTS_LANGS`, `initSFX`, `playSFX`, `resetAllSettings`, `_EMOTION_PROSODY`, `getEmotionProsody` |

## 4. Data Layer — Scenarios

### 4.1 Schema

**Two distinct schemas** (Sprint 23 fork):

#### Moral-choice schema (12 EDB value + 5 caring = 17 topics, 289 scenarios)

```jsonc
{
  "id": "benevolence-1",
  "title": "...",
  "subjectId": "value",       // 'value' | 'caring'
  "topicId": "benevolence",
  "domain": "benevolence",
  "valueCategory": "benevolence",
  "audience": ["value"],
  "riskLevel": 1,             // 1-3, affects moral score magnitude
  "background": "...",
  "description": "...",       // question text (legacy field)
  "options": [                 // 3-4 options
    {
      "id": "...",
      "text": "...",
      "moralChange": 5,        // -10 to +10
      "isCorrect": true,       // for stop-and-think
      "stopAndThink": "..."    // reflection prompt when wrong
    }
  ],
  "outcomeImage": "...",       // optional, generated per-option
  "creedIds": [9, 12],         // cross-reference to EDB creeds
  "skills": ["..."]
}
```

#### Emotion-detective schema (1 topic, 10 scenarios — Sprint 23)

```jsonc
{
  "id": "ed-1",
  "title": "收到禮物",
  "question": "...",                // not `description`
  "scenarioImage": "assets/...",     // context illustration
  "scenarioImageAlt": "...",
  "faceOptions": [                   // 3 faces (replaces `options`)
    { "id": "happy", "label": "開心", "image": "...", "correct": true },
    { "id": "angry", "label": "嬲",   "image": "...", "correct": false },
    { "id": "crying", "label": "喊", "image": "...", "correct": false }
  ],
  "topicId": "emotion-detective",
  "valueCategory": "emotion-detective",
  "domain": "caring",
  "subjectId": "caring",
  "audience": ["caring"],
  "riskLevel": 1,
  "creedIds": [9],
  "skills": ["情緒辨識", "表情識別"],
  "emotionCategory": "basic",        // Sprint 25: 'basic' | 'social'
  "emotionLabel": "開心"             // Sprint 25: matches correct face label
}
```

### 4.2 Inventory (post Sprint 26)

| Topic | File | Count | Domain |
|---|---|---:|---|
| 關愛 | `benevolence.json` | 15 | value |
| 堅毅 | `perseverance.json` | 15 | value |
| 尊重 | `respect.json` | 15 | value |
| 責任 | `responsibility.json` | 15 | value |
| 勤勞 | `diligence.json` | 15 | value |
| 承擔 | `commitment.json` | 15 | value |
| 誠信 | `integrity.json` | 17 | value |
| 國民身份 | `national-identity.json` | 17 | value |
| 守規 | `law-abiding.json` | 15 | value |
| 仁愛 → empathy | `empathy.json` | 15 | value |
| 團結 | `solidarity.json` | 15 | value |
| 衝突解決 | `conflict-resolution.json` | 15 | value |
| 身體自主 | `body-autonomy.json` | 15 | caring |
| 求助 | `help-seeking.json` | 15 | caring |
| 社距 | `social-boundary.json` | 15 | caring |
| 陌生人安全 | `stranger-safety.json` | 15 | caring |
| 孝親 | `filial-piety.json` | 15 | caring |
| 🕵️ 情緒小偵探 | `emotion-detective.json` | 10 | emotion-detective |
| **Total** | | **299** | |

> Note: per-topic backup files `*.pre-v3.7.bak` are kept for migration history only; production reads only the canonical `<topic>.json`.

### 4.3 Loading

`ScenarioEngine.js` uses `import.meta.glob('./data/scenarios/*.json', { eager: true })` to map all chunks at module-load time, then `getScenarioById(id)` resolves topic from a reverse index — no need to preload all 299 scenarios upfront. First scenario click triggers chunk lazy-load.

## 5. State & Persistence

### 5.1 Runtime State (in-memory)

`src/main.js` module-level `state` object:

```js
state = {
  view: 'role-select',         // routing enum (see VIEWS factory)
  student: null,               // current student name (string)
  subjectId: null,             // 'value' | 'caring'
  topicId: null,               // current topic id
  scenarioId: null,            // current scenario id
  resultData: null,            // result page payload
  teacherMode: false,
  role: null,                  // 'student' | 'teacher'
  gameMode: 'relaxed',         // 'free' | 'relaxed' | 'challenge'
  bankScenario: null,
  bankResult: null,
}
```

Transitions go through `setView(view, extra)` which calls the per-view factory from `VIEWS` map and merges `extra`.

### 5.2 Persistence (localStorage)

Single registry in `src/storage.js` (`STORAGE_KEYS`):

| Key pattern | Purpose |
|---|---|
| `fc_progress_<studentName>` | Per-student progress JSON (scenarios completed, moral score, topic totals) |
| `fc_teacher_config` | Teacher config (hints on/off, timer, button size, assigned topics, ED toggle) |
| `fc_teacher_pin` | Teacher login PIN (hashed) |
| `fc_teacher_token` / `fc_teacher_expiry` | Cloud auth (sync server) |
| `fc_device_id` | Per-install UUID for sync |
| `fc_last_sync_<studentName>` | Last sync timestamp |
| `fc_sync_queue` | Pending sync operations |
| `fc_tts_speed` / `fc_tts_lang` | TTS settings |
| `fc_font_size` / `fc_line_height` / `fc_spacing` | Typography (Sprint 21/22 design tokens) |
| `fc_hc_mode` / `fc_rm_mode` | High-contrast / reduced-motion |
| `fc_voice_seen` | First-use onboarding flag for TTS |
| `fc_game_mode` | Game mode (free/relaxed/challenge) |
| `fc_home_filter` | Home view filter ('value' \| 'caring' \| 'all') |
| `fc_ed_filter` | Sprint 25: ED sub-tab filter ('basic' \| 'social' \| 'all') |
| `fc_onboarding_done` | Sprint 18: first-visit carousel completion |
| `fc_interactions_v1` | Analytics: per-interaction log |

`getTeacherConfig()` has a 5-second in-memory cache invalidated by `bus.emit('teacher:config-changed')` to avoid repeated JSON.parse.

### 5.3 Cross-module pub/sub (`domain/EventBus.js`)

3 events:
- `moral:updated` — emitted after `applyScenarioResult`; main.js listener updates the moral bar in-place without re-render
- `sync:status` — emitted by `sync.js`; main.js listener updates sync badge + offline banner
- `teacher:config-changed` — emitted by `setTeacherConfig`; `storage.js` invalidates its cache

## 6. Render Pipeline

### 6.1 View Routing (Phase 4 S25)

```
data-action="navigate" data-arg="<view>" data-arg2="<primary-arg>"
   ↓
nav.js: navigate(arg, arg2)  →  setView(view, extra)  →  render()
   ↓
main.js: render() switch on state.view
   ↓
engine.js: renderXxx() returns HTML string
   ↓
main.js: _setViewHTML(html) — <template> parsing → view.replaceChildren()
   ↓
main.js: _setupDelegates(view) — wire `data-action` delegation
```

### 6.2 Event Delegation (Phase 3 S16)

One listener on `#fc-view` for `click` + `keydown` + `error`. Walks up from `event.target` looking for `[data-action]`, then dispatches to `actions[action]` registry populated by `wireActions()`.

This defends against XSS from interpolated `onclick="FC.foo('${x}')"` strings, and avoids re-binding listeners after every `app.innerHTML = html` wipe.

Multi-arg handlers use `data-arg` (primary) + `data-arg2` (secondary).

`data-action="navigate"` is the universal navigation action; everything else goes through `actions[action]`.

### 6.3 XSS Discipline

All dynamic strings pass through `escapeAttr()` (HTML attribute) or `escapeJsString()` (JS string literal in inline script). Template authors should use `escapeAttr(value)` rather than raw interpolation. Linting: `tests/data-action-guard.test.js` enforces no `data-action="...${x}..."` interpolation.

### 6.4 Visual Flow

- **Page-level transitions**: `renderWithTransition()` wraps render in `document.startViewTransition()` if browser supports it (Chrome 111+ / Edge 111+), with fallback to direct render. Reduced-motion users skip the animation entirely.
- **In-place updates** (settings toggle, moral bar refresh, sync badge): bypass `render()`, mutate DOM directly via `bus` listener handlers.

## 7. Audio Pipeline (TTS)

### 7.1 Zero Dependency

`src/audio.js` uses the browser's Web Speech API directly. All TTS is generated live; Sprint 11 retired the `audio/` MP3 library.

### 7.2 Emotion Prosody Map (`_EMOTION_PROSODY`)

10 Cantonese emotion labels × `{ pitch, rate }`:

| Label | pitch | rate | use |
|---|---:|---:|---|
| 開心 | 1.20 | 0.95 | upbeat |
| 喊 | 0.85 | 0.70 | slow, low |
| 嬲 | 0.90 | 0.95 | intense |
| 驚 | 1.25 | 1.00 | high arousal |
| 驚訝 | 1.35 | 1.05 | peak, fast |
| 厭惡 | 0.95 | 0.80 | mid-low, slow |
| 尷尬 | 1.05 | 0.85 | nervous |
| 攰 | 0.85 | 0.70 | low, slow |
| 困惑 | 1.05 | 0.85 | uncertain |
| 驕傲 | 1.10 | 0.90 | confident |

Range conservative (`[0.7, 1.4] × [0.7, 1.1]`) — Web Speech API artifacts above ~1.4.

### 7.3 Chained TTS (`speakChained(parts)`)

For emotion-detective 「🔁 再聽一次」 repeat exposure: queue `[question, face1, face2, face3]` and play sequentially with a short pause between. `speak()` cancels any in-flight utterance on each call (single-shot semantics); for chained UX, `speakChained` walks the parts list, with each utterance's `onend` enqueueing the next.

### 7.4 SFX

`initSFX()` + `playSFX(name)` — Web Audio API short beeps for correct/wrong/star-float/confetti/comfort. Skipped entirely in `prefers-reduced-motion: reduce`.

## 8. Image Pipeline

### 8.1 Asset Inventory

| Path | Count | Source | Use |
|---|---:|---|---|
| `assets/images/scenarios/` | 260 | `gen_images.py` (MiniMax API) | Main scenario illustration per EDB scenario |
| `assets/images/outcomes/` | 744 | `gen_outcomes.py` (per-option) | Result-page outcome (good/neutral/bad) |
| `assets/images/emotion-detective/` | 40 | `gen_*_ai.py` (Sprint 23) | 10 ED scenarios × 4 (1 scenario + 3 faces) |
| `public/icons/` | 3 (192, 512, favicon) | manual | PWA icons |

### 8.2 Build Sync

`prebuild-sync.sh` (runs on `npm run build` via `prebuild` hook):
- Mirrors `assets/images/**` → `public/assets/images/**` via `rsync -a --update --delete -m` (preserves mtimes, deletes stale files)
- Excludes `*.md`, `*.txt`, `*.json`, `*.log` so design docs and gen scripts don't ship to gh-pages
- Falls back to `cp -ru` if `rsync` missing (rare)
- Warns on src/dst count mismatch (interrupted gen_*.py)

Without this, vite's `publicDir` only ships whatever was manually copied, and the site can regress on the next deploy (see commit c1e43ee).

### 8.3 Image Convention

All `emotion-detective/*.png` files are 1376×768 (16:9 baseline, ~500 KB each). The JPEG-with-`.png`-extension naming reflects the matrix MCP default; browsers resolve format by content magic bytes, so delivery works as intended. Standardizing the extension is a future cleanup tracked in §14.

## 9. Build Pipeline

### 9.1 Toolchain

| Tool | Version | Role |
|---|---|---|
| Vite | ^6.0.0 | Bundler, dev server, asset hashing |
| vite-plugin-pwa | ^1.3.0 | Service worker generation + manifest |
| workbox-window | ^7.4.1 | Client-side SW lifecycle |
| Vitest | ^2.1.9 | Test runner |
| Playwright | ^1.60.0 | E2E + a11y audits |
| axe-core | ^4.12.1 | Accessibility rules |

### 9.2 PWA Configuration (`vite.config.js`)

- **Strategy**: `registerType: 'autoUpdate'` — new SW takes over on next page load
- **Precache**: `globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}']` — 1073 entries (185 MB) post Sprint 26
- **Runtime cache**: Google Fonts (`fonts.googleapis.com` + `fonts.gstatic.com`) — `CacheFirst`, 1-year TTL, 10-entry cap
- **Manifest**: zh-Hant, portrait-primary, theme `#7B2FBE`, background `#1a0a2e` (psychoframe purple)
- **Icons**: 192×192 + 512×512 (maskable)

### 9.3 Build Commands

| Command | Effect |
|---|---|
| `npm run dev` | Vite dev server with HMR (HMR disabled on root element to preserve listeners) |
| `npm run build` | `prebuild-sync.sh` → `vite build` → `dist/` |
| `npm run preview` | Local preview of `dist/` |
| `npm run deploy` | `build` + `gh-pages -d dist` (manual) |
| `npm test` | Vitest single run (CI mode) |
| `npm run test:watch` | Vitest watch |
| `npm run audit:a11y` | `tools/a11y/audit-fc.mjs` (Playwright + axe-core) |
| `npm run audit:touch-targets` | Sprint 18 touch target audit |
| `npm run audit:font-sizes` | Sprint 21 typography audit |
| `npm run audit:spacing` | Sprint 22 spacing token audit |
| `npm run audit:style` | `tools/style/audit-scenarios.mjs` (CSS regression) |

## 10. CI / Deploy Pipeline

### 10.1 `ci.yml`

Triggers: `push` to `main`, `pull_request`, `workflow_dispatch`.

Jobs:
1. **test** — `npm test` (Vitest) on Node 20 + Playwright Chromium install
2. **build** — `npm run build` on push to main only (slow + needs preview server)

### 10.2 `deploy.yml`

Triggers: `push` to `main`, `workflow_dispatch`.

Pipeline:
1. Checkout → Node 20 → `npm install` → `npm run build`
2. `actions/upload-pages-artifact@v3` uploads `dist/`
3. `actions/deploy-pages@v4` deploys to GitHub Pages

Concurrency: `group: pages, cancel-in-progress: true` — only one deploy at a time.

Live URL: <https://ihateusingai-beep.github.io/friendly-classroom-v2/>

### 10.3 Versioning

`package.json: "version"` is the single source of truth. Bumped per sprint (SemVer):
- **MAJOR** = breaking UX
- **MINOR** = new feature
- **PATCH** = bug fix

Sync surface: SPEC.md §22 addenda, BUILD_LOG.md prepend, tests, code. **Heads-up**: bump then commit + push (CI uses the version baked into `dist/`; local builds use the new version but CI won't trigger until the change is pushed).

## 11. Test Architecture

### 11.1 Layout

17 test files, **252 tests passing** (post Sprint 26). Pattern: `tests/sprint<N>-<topic>.test.js` + category tests (`settings-bridge`, `subjects`, `feedback`, etc.).

| File | Tests | Sprint |
|---|---:|---|
| `smoke.test.js` | 1 | — |
| `feedback.test.js` | 6 | — |
| `subjects.test.js` | 7 | — |
| `scenario-engine.test.js` | 14 | — |
| `race-bug.test.js` | 1 | regression |
| `data-action-guard.test.js` | 1 | XSS discipline |
| `double-class-guard.test.js` | 2 | CSS regression |
| `style.test.js` | 13 | CSS regression |
| `setup-localstorage.js` | — | test setup |
| `settings-bridge.test.js` | 7 | Sprint 12 |
| `sprint13-bridge.test.js` | 6 | Sprint 13 |
| `sprint17-migration.test.js` | 9 | Sprint 17 |
| `sprint18-onboarding.test.js` | 14 | Sprint 18 |
| `sprint18-touch-targets.test.js` | 6 | Sprint 18 |
| `sprint21-font-sizes.test.js` | 22 | Sprint 21 |
| `sprint22-spacing.test.js` | 29 | Sprint 22 |
| `sprint23-emotion-detective.test.js` | 37 | Sprint 23 |
| `sprint25-emotion-categories.test.js` | 23 | Sprint 25 |

### 11.2 Test Patterns

- **localStorage mock**: in-memory `_memStore` dict; tests reset in `beforeEach`
- **ESM mocks**: `getInlineActions({ render, _navigate, getState, setView })` — pass a stub deps bag to extract the action registry fragment for unit testing without booting main.js
- **Scenario fixtures**: `import edScenarios from '../data/scenarios/emotion-detective.json'` — tests consume production data directly, no fixture copies
- **State isolation**: `setStudent(null)` in `beforeEach` to reset module-level `currentStudent` between tests
- **Invariant tests** (e.g. Ekman 6 mandate, scenario counts): encoded as `expect(arr).toHaveLength(N)` or `expect(new Set(arr).size).toBeGreaterThanOrEqual(N)` — change requires updating the test in lockstep with the data

### 11.3 Audits (slow, requires Playwright + preview server)

`tools/a11y/audit-fc.mjs` — axe-core scan, fails CI on violation
`tools/a11y/audit-touch-targets.mjs` — minimum 48×48 touch target check
`tools/a11y/audit-font-sizes.mjs` — font-size scale discipline
`tools/a11y/audit-spacing.mjs` — 4-48 px scale discipline
`tools/style/audit-scenarios.mjs` — CSS regression for scenarios (emotion-detective skipped — uses `faceOptions` instead of legacy `options`)

## 12. Recent Sprint History

| Sprint | Version | Date | Highlight |
|---|---|---|---|
| 23 | v2.7.0 | 2026-06-23 | emotion-detective topic + 1 pilot scenario + 4 images |
| 23.x | — | 2026-06-24 | Phase 2 bulk: 9 more ED scenarios + 36 images (total 10 ED scenarios) |
| 23 polish | — | 2026-06-25 | Phase 3: emotion prosody map + chained TTS + repeat exposure + teacher toggle |
| 24 | v2.8.0 | 2026-06-26 | emotion-detective layout bug fix + split into own home tab |
| 25 | v2.9.0 | 2026-06-26 | ED sub-tabs (基本/社交) + 下一題 bug fix + ensureStudent lazy-create |
| **26** | **v2.10.0** | **2026-06-26** | **ED pedagogy 適配中度智障學生 — 5 scenarios 改 wording + correct, test invariant update to at-least-once exposure** |

## 13. Conventions

### 13.1 Code Style

- ES modules only (`"type": "module"` in `package.json`)
- JSDoc on every public API; module-level header comment with sprint refs
- Naming: `_underscore` for module-private vars; `camelCase` for functions; `PascalCase` for constants/enums (`VIEWS`, `GAME_MODES`, `BANK_CONFIG`, `STORAGE_KEYS`)
- HTML attribute always escaped via `escapeAttr()`; never raw interpolation in `data-*` or `onclick`
- HMR disabled on root element (`import.meta.hot.decline()`) — full reload required, preserves delegated listeners

### 13.2 Test Discipline

- Test invariant changes must be deliberate (Sprint 26 changed Ekman 6 strict → at-least-once exposure with full spec rationale in §22.17)
- Test count growth = feature growth (Sprint 26 didn't add new tests but updated 2 invariants in 2 existing files)
- New scenario schemas require 4 new tests minimum: schema, count, subset count, prosody coverage

### 13.3 Bump Discipline

Per standing instruction: every build / significant feature change must bump `package.json: version` BEFORE commit. Sync surface: `package.json`, `BUILD_LOG.md` entry, `SPEC.md` addendum.

### 13.4 Gen Image Discipline

- Always match character anchor of `ed-1-scenario.png` (Line/Disney cartoon, primary school age, school uniform)
- Aspect ratio: 16:9 (1376×768), 1K resolution
- Prompt pattern: `"Boy + action + setting, anime cartoon style, no text, 16:9"` (follow `social-boundary.json` convention)
- Post-process: rename to `<topic>_<scenario>-<role>.png`; replace existing file (no separate versioned files)

### 13.5 Cron Self-Reminder Discipline

Per memory: every async handoff (CI deploy, MR auto-merge, batch jobs) MUST set a cron self-reminder. Cron prompt MUST contain:
1. Explicit `mavis cron delete <agent> <name>` step in success AND failure paths
2. Verify cron dead step (`mavis cron list | grep -c <name>` must = 0)
3. TTL = expected duration + buffer (deploy: 30-60 min typical)

See `memory/MEMORY.md` for full discipline.

## 14. Trade-offs & Open Items

- **No automated test for full render pipeline** — render functions are HTML string templates, tested via visual smoke + audit scripts, not unit tests
- **`window.FC` global kept for back-compat** — Sprint 14.2 moved handlers to `actions/index.js` registry but the global is still updated for any code reading `FC.foo` at module load time
- **localStorage-only persistence** — no IndexedDB, no SQLite; QuotaExceededError handling only logs warning
- **Cloud sync optional** — `sync.js` requires server URL configured (defaults to disabled); analytics queue + teacher config can sync but no auto-retry beyond exponential backoff
- **Backend `backend/main.py` is reference only** — not deployed; local FastAPI for dev sync server
- **Image filename / content mismatch** — `.png` extension but JPEG content (matrix MCP default); browsers resolve by content magic bytes, delivery works. Extension standardization tracked as future cleanup.
- **No code-split beyond teacher.js** — main bundle is ~140 KB (gzip 42 KB); only teacher chunk is lazy
- **Single-character scenario images** — emotion-detective uses one anchor character; future expansion requires maintaining visual consistency
- **No i18n beyond zh-Hant** — `i18n.js` table exists but English/JP strings are placeholders