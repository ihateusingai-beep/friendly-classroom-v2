# Sprint 18 — 關係花園 解鎖 (1.5 sprint)

**目標**：Hub card 解鎖「關係花園 (Relationship Garden)」，新增 longitudinal character-arc game mode。
**日期**：2026-07-02（Plan 落版）／Sprint 18 待批准開工。
**負責**：Mavis + kencheng
**狀態**：Plan v2 — 待 owner 確認 5 個 open decisions 後開 S18.1。

---

## 0. Context

`SPEC.md §17.11` + `docs/PRODUCT_PROPOSAL_V1.md` 將 關係花園 列為 Sprint 18 backlog。Hub page (`src/engine.js:95-106`) 已經 render 「關係花園 🌷」card 但 locked，2 個 sprint 一直係 placeholder。S18 解鎖佢。

**對 project 嘅 win**：
- 4 個 game modes 變 2 個 ship + 1 個 living card，engagement surface 增
- 符合 Sprint 27 engagement overhaul 嘅「更多 longitudinal reward 取代 one-shot completion」方向
- 證明 content-reuse-via-tagging 模式可 scale（S19+ 解鎖 Moral Monopoly 沿用）

---

## 1. Scope

### In (Sprint 18)
- `src/games/RelationshipGarden.js` + `src/domain/GardenArc.js` (split: pure + bridge)
- `src/constants/garden.js` — character roster + monologues + config
- **3 characters ship S18** (小美 / 小晨 / 小輝, all unlocked) — 5 base scenarios shared across chars, 不同 monologue voice
- **3 AI-generated character portraits** via MiniMax image API — `assets/images/garden/{小美,小晨,小輝}.png` (Line/Disney cartoon, primary school age)
- Feature flag `FLAGS.GARDEN_MODE`
- Hub card unlock
- ~25 i18n keys
- 好感度 meter bar + 內心 monologue bubble + 🌷 解鎖動畫
- 持久化 `fc_garden_progress_v1`
- Tests ~18 cases
- SPEC §18 addendum + BUILD_LOG v2.12.0

### Out (post-S18)
- Multi-character single-session reward (S19)
- Teacher-configurable character roster (S19+)
- AI-generated personalized monologue (R2 risk, deferred)
- Moral Monopoly (S20)
- Resume mid-run (Bank 都冇，唔 blocking)
- 性格/語氣 per-character differentiation post-step outcome (S19+ — 15 → 75 monologues)

---

## 2. Approach

### 選擇 (1 of 3)
| | Effort | Narrative fit | Ships content |
|---|---|---|---|
| **A. Tag 5 existing scenarios for 小美** ← 推薦 | 半日 | 中 — manual tag | 立即 |
| B. Fresh 5 scenarios | 1.5 sprint  | 高 | 慢 |
| C. Hybrid (tag 3 + fresh 2) | 1 sprint | 高 | 中 |

**揀 A**：S18 嘅 sprint budget 唔 cover fresh authoring；narrative coherence 留 S19 polish。Manually tag 5 scenarios 係 half-day 已可 ship。

### 架構 split — **OPTIMIZATION vs 原 design**

原 design 將 game logic 放喺 `src/games/RelationshipGarden.js` 1 個 file（mirror GoodDeedBank）。但 codebase pattern (Sprint 23 emotion-detective refactor 嘅 [SPEC §17.5](docs/PRODUCT_PROPOSAL_V1.md:Section-17)) 係 **pure domain + thin UI bridge split**：
- `src/domain/ScenarioEngine.js` (pure) ← `src/games/Hub.js` (bridge)
- `src/domain/Play.js` (pure) ← `src/engine.js` (renderer)

S18 跟呢個 pattern 拆：
```
src/domain/GardenArc.js       (pure, no DOM — start/choose/next/score/monologue)
src/games/RelationshipGarden.js (thin bridge — wireActions deps inject, navigate state)
src/components/GardenMeter.js (presentational)
src/components/GardenBubble.js (monologue bubble presentational)
src/engine.js                 (renderer fns: renderCharacterSelect, renderGardenPlay, renderGardenResult)
src/actions/garden.js         (action handlers: selectGardenCharacter, gardenChoose, gardenNext, ...)
```

**Trade-off**：多咗 1 個 file，但 unit-test `GardenArc.js` 唔需要 main.js，比 Bank-style monolithic 易測。

---

## 3. Architecture

### 3.1 File map

| Path | Lines (est) | Purpose |
|---|---|---|
| `src/domain/GardenArc.js` | ~120 | pure: startRun, chooseOption, advanceStep, getReflection, isUnlocked |
| `src/games/RelationshipGarden.js` | ~80 | bridge: wireArc({ navigate, getState, setView, storage, bus }), expose `playRelationshipGarden` |
| `src/constants/garden.js` | ~80 | CHARACTERS, MONOLOGUES, GARDEN_CONFIG (5 steps, threshold 7) |
| `src/components/GardenMeter.js` | ~50 | meter bar block |
| `src/components/GardenBubble.js` | ~50 | monologue bubble block |
| `src/engine.js` | +~150 | 3 new renderer fns |
| `src/actions/garden.js` | ~80 | 6 actions |
| `src/i18n.js` | +~30 | new keys |
| `src/storage.js` | +~10 | new key |
| `src/main.js` | +~20 | state.gardenArc slot, VIEWS factory |
| `src/games/Hub.js` | +~10 | playRelationshipGarden export |
| `src/constants/feature-flags.js` | +~5 | FLAGS.GARDEN_MODE |
| `src/style.css` | +~120 | play view + meter bubble + bloom keyframes |
| `assets/images/garden/{小美,小晨,小輝}.png` | 3 files | AI-generated portraits (MiniMax image API) |
| `tests/sprint18-relationship-garden.test.js` | ~180 | unit tests (新增 character + portrait 覆蓋) |
| `SPEC.md` | +~50 | §18 addendum |
| `BUILD_LOG.md` | +~25 | v2.12.0 entry |

**Total**: ~1060 lines new + 3 image assets (vs 原 design 800 — pure-split + 25%, +3-char ship + AI image)。合理 trade-off。

### 3.2 Data flow (one scenario step)

```
[Hub] playRelationshipGarden
   ↓
[Domain] startGardenRun(charId, student)
   - shuffle 5 scenario IDs filtered by characterTag
   - state.gardenArc = { charId, step:0, score:0, scenarioIds }
   - persist fc_garden_progress_v1.initial at entry
   ↓
[Renderer] renderCharacterSelect  OR  renderGardenPlay(step)
   ↓
[Action: gardenChoose(optId)]
   ↓
[Domain] chooseOption(scenarioId, optId, state)
   - applyGardenResult (computed from data with relationshipChange field)
   - state.gardenArc.score += relationshipChange
   - bus.emit('garden:score-updated', { delta })
   - getMonologue(charId, step, outcome)
   ↓
[Action: gardenNext]
   ↓
[Domain] advanceStep()
   - if step < 4: step++, renderGardenPlay
   - else: endGardenRun
      - if score ≥ 7: unlockFlower(charId), persist progress
      - renderGardenResult
```

### 3.3 Pure vs impure boundary

**`GardenArc.js` (pure)**：
- Input: `{ characterId, studentId, scenarioIds, choiceHistory, score }` 
- Output: `{ nextState, monologue }`
- No `localStorage`, no `document.*`, no `import` of side-effect modules

**`RelationshipGarden.js` (bridge)**：
- Imports: `GardenArc`, `storage`, `bus`, `actions/index`
- Side effects: `setView`, `navigate`, `localStorage.setItem`, `bus.emit`

**Tests**: `GardenArc.js` testable with plain object fixtures (no jest DOM mocks needed).

---

## 4. Gameplay (closed loop)

### 4.1 Loop diagram

```
   [Hub]
     │
     │ playRelationshipGarden
     ▼
   [Character Select]
     │  selectGardenCharacter(charId)
     ▼
   [Garden Arc Start]
     │ startGardenRun → state.gardenArc = { charId, step:0, score:0 }
     │
     │ ┌── step 0..4 ─────────────────────────┐
     │ │  [Play View]                          │
     │ │   - char header (avatar + name)        │
     │ │   - 好感 meter bar (0-9) + label       │
     │ │   - scenario card (existing renderPlay)│
     │ │   - option cards (3-4 each)             │
     │ │   - gardenChoose(optId) → applyResult  │
     │ │   - monologue bubble (預生成)         │
     │ │   - score bounce animation (±n)         │
     │ │   - gardenNext → advanceStep           │
     │ └─────────────────────────────────────┘
     │
     ▼ step === 5
   [Result]
     │ score ≥ 7 → 🌷 bloom 4-stage keyframe unlock + bestScore persist
     │ score 4-6 → 內心反思 + 「友誼穩定成長」panel
     │ score < 4 → 「友情慢慢建立」+ 鼓勵再玩 (no shame)
     │
     │ playGardenAgain OR exitGarden
     ▼
   [Hub]
```

### 4.2 Run-end outcome tiers

| Score | Action | UI |
|---|---|---|
| ≥ 7 | 🌷 解鎖 + record bestScore | bloom animation + reflection recap |
| 4-6 | 鼓勵 | 「友誼穩定成長 🌱」+ 再玩 CTA |
| ≤ 3 | 鼓勵 (no shame) | 「友情慢慢建立 — 下次再嚟啦」+ 再玩 CTA |

**No hard fail / lock**. Consistent with Bank's "bankrupt" → friend-zone framing (SPEC §17.3.5 reword locked-in).

### 4.3 SEN/ASD/MID design checklist

| Concern | Mitigation |
|---|---|
| Multi-character context switch | 1 run = 1 char locked; no swap mid-arc |
| Closed-loop predictability | 固定 5 步 + visible 「1/5」counter |
| Failure anxiety | score < 4 → encouragement (no ✗ / no shame) |
| Reading load | monologue ≤ 12 字；option text reuse existing |
| Time pressure | 冇 timer / countdown |
| Voice consistency | 同一 character 全 5 步同一 voice (pre-generated, 唔 AI) |
| Mid-run exit | like Bank — confirm dialog + state reset (no resume v1) |
| Reduced motion | 🌷 animation skip if `prefers-reduced-motion: reduce` |

---

## 5. Content strategy

### 5.0 Scope decision (per user): 3 chars ship S18

Per owner decision 2026-07-02:
- Roster: `小美`, `小晨`, `小輝` (changed from PROPOSAL_V1 阿明/阿俊 — keeping all small-name convention for primary school fit)
- All 3 chars unlocked at S18 ship
- Strategy: **5 base scenarios shared across chars** + per-character monologue voice differentiation
- This avoids 3× content authoring; game-mechanic identical per char, voice/avatar/personalize differs

### 5.1 Scenario selection (Option A — 5 base scenarios, character-agnostic)

```js
// data/scenarios/caring-X.json — no characterTag change needed
// 揀 5 條 caring-domain scenarios + 5 narrative progression:
//   step 1 → 認識 / 自我介紹
//   step 2 → 互相幫忙
//   step 3 → 衝突化解
//   step 4 → 表達關心
//   step 5 → 長期承諾 / 友誼延續
```

**Selection heuristic** (Day 1, 1 hour):
- Filter `data/scenarios/*.json`: domain ∈ {caring}, audience includes primary
- Sort by moral theme (relational vs solo) — pick 5 with relational choices
- The 5 scenarios must form an arc: lighter (step 1) → deeper (step 5)
- characterTag stays absent — all 3 chars play the same 5

**Owner spot-check**: kencheng verify 5 條 narrative progression 合理 (manual 5 mins).

### 5.2 Monologue content (pre-generated 15 — per char voice)

```js
// src/constants/garden.js
MONOLOGUES = {
  小美: [   // 同班好朋友, 7 歲, 觀察型
    '咦，你真係有留意我...',       // step 1 (any outcome)
    '哈，你明我嘅意思呀',           // step 2
    '好似... 開始信你多啲喎',       // step 3
    '同你講嘢真係冇壓力',            // step 4
    '我希望... 我哋可以繼續咁樣',    // step 5
  ],
  小晨: [   // 同班同學, 7 歲, 行動型
    '嘩，你做嘅嘢幾特別喎',         // step 1
    '唔錯喎，跟住落嚟點?',          // step 2
    'OK 啦，我覺得可以咁樣做',         // step 3
    '同你一齊真係好啲',              // step 4
    '下次再一齊啦！',                // step 5
  ],
  小輝: [   // 高年級 mentor, 10 歲, advisor voice
    '嗯，你呢個諗法幾有心思',       // step 1
    '我以前都試過類似嘅情況喎',       // step 2
    '你做得唔錯，不過可以... ',       // step 3
    '呢個我哋可以一齊練習',          // step 4
    '你學到好多嘢呀，將來一定得',     // step 5
  ],
};
```

**Voice design**: 3 distinct personalities — 觀察 (小美) / 行動 (小晨) / advisor (小輝)。各自 5 句成 arc ascending emotional investment。Mature sound 唔 work — keep child voice, all characters 同齡 primary school。

**Quality check**: kencheng 過 review all 15，唔通過 iterate in-place。

### 5.3 AI image generation (3 portraits)

Per owner decision: NOT emoji, AI-generated卡通 portraits。

```bash
# 3 image prompts (MiniMax image API):
# Style: Line/Disney cartoon, primary school age, school uniform consistent
# Aspect: 1:1 (avatar use)
# Each prompt 唔同 character voice:

1. 小美 (girl, 同班好朋友):
   "8 歲小三女仔，瀏海，眼大大，著小學校服，淺藍色校褸，
    卡通 Line/Disney style, soft pastel, friendly smile, 1:1 square avatar,
    no text, no background"

2. 小晨 (boy, 同班同學):
   "8 歲小三男仔，short hair，著小學校服同上，淺笑，
    卡通 Line/Disney style, soft pastel, energetic, 1:1 square avatar"

3. 小輝 (boy, 高年級 mentor):
   "10 歲小五男仔，glasses，著高年級校服，自信表情，
    卡通 Line/Disney style, soft pastel, calm / mentor vibe, 1:1 square avatar"
```

**Generation flow** (Day 1-2 of S18.1):
1. MiniMax image API call × 3 → get 3 image URLs
2. Download to `assets/images/garden/{小美,小晨,小輝}.png`
3. Quality check (visual character anchor — same style, consistent vibe)
4. Reference: existing `assets/images/emotion-detective/ed-1-scenario.png` (line 53 of ARCHITECTURE.md §8.3) 嘅 character anchor pattern
5. `prebuild-sync.sh` 自動 mirror 到 `public/` 入面，Vite ships via publicDir

**Naming convention**: PNG extension 但 matrix MCP default = JPEG content (matches ARCHITECTURE.md §8.3 standard)。

### 5.4 Canonical 5 條 scenarios list (S18.1 Day 1 populate)

Plan 留 slot, 唔 pre-spec — 揀 5 條時要睇 actual content quality。Selected list 入 git commit message + Link 喺 SPEC §18 addendum。

---

## 6. Feature flag + ship gate

```js
// src/constants/feature-flags.js
export const FLAGS = {
  // Sprint 27
  HOME_REDESIGN: 'fc_flag_HOME_REDESIGN',
  RESUME_BANNER: 'fc_flag_RESUME_BANNER',
  WARM_THEME:    'fc_flag_WARM_THEME',
  // Sprint 18
  GARDEN_MODE:   'fc_flag_GARDEN_MODE',
};
```

**Default**: ON for S18 ship；老師 / 用戶可以 per-user flip (localStorage `fc_flag_GARDEN_MODE=0` 暫時 OFF, 同 Sprint 27 紀律)。

**Ship gate**:
- ✅ All S18.1 + S18.2 tests pass
- ✅ SPEC §18 + BUILD_LOG entry written
- ✅ Hub card visible + clickable
- ✅ 1 run (小美) full loop works (entry → 5 steps → result)
- ✅ Reload preserves `bestScore` (chromium e2e)
- ✅ Reduced-motion verified (`prefers-reduced-motion: reduce` → 🌷 animation skipped)

---

## 7. a11y + reduced-motion

- **Meter announce**: ARIA-live `polite` 嘅 meter value change → 「好感 +1」/ 「好感 -1」
- **Monologue bubble**: `role="complementary"`, `aria-label` 內含 character name
- **Character select**: 3 cards 用 `role="radio"` + `aria-checked`, keyboard tab + arrow nav
- **Reduced motion**: `@media (prefers-reduced-motion: reduce) { .garden-bloom { animation: none; } }` — bloom 變 instant state change

---

## 8. Test plan (~15 cases)

`tests/sprint18-relationship-garden.test.js`

```
describe('GardenArc pure')
  it('startGardenRun returns 5-step arc for 小美')
  it('startGardenRun throws on unknown characterId')
  it('chooseOption advances score by relationshipChange')
  it('advanceStep moves 0→1, 1→2, ... 4→end')
  it('chooseOption on step 4 triggers endGardenRun')
  it('endGardenRun with score ≥ 7 returns unlocked=true')
  it('endGardenRun with score < 4 returns unlocked=false (no shame branch)')
  it('getMonologue(charId, step) returns pre-generated string')
  it('getMonologue throws on out-of-range step')

describe('Garden flow integration')
  it('Hub card unlocks when FLAGS.GARDEN_MODE=true')
  it('playRelationshipGarden navigate to character select')
  it('selectGardenCharacter create fc_garden_progress_v1 entry')
  it('Result screen persists bestScore across sessions')

describe('SEN/ASD/MID guards')
  it('No stop-and-think panel rendered (monologue only)')
  it('< 4 score path shows encouragement, NOT ✗')
  it('prefers-reduced-motion: reduce → bloom animation skipped')
  it('5 fixed steps, no skip / no early exit (except confirm dialog)')

describe('Schema invariant')
  it('5 tagged scenarios exist for 小美 (per dedicated tag script)')
  it('Monologue array length === 5 per character')
  it('GARDEN_CONFIG.THRESHOLD = 7 (constant)')
```

Total: ~18 cases. Locked invariant: 5 scenarios per character (test updates if tag changes).

---

## 9. Definition of Done

### S18.1 (主實作, ships `GardenArc.js` + 3 characters playable)
- [ ] `src/domain/GardenArc.js` 純函數 + tests pass
- [ ] `src/constants/garden.js` × 3 characters (`小美/小晨/小輝`) + 15 monologues
- [ ] `src/storage.js` 加 `fc_garden_progress_v1`
- [ ] `src/i18n.js` 加 ~25 keys
- [ ] `tests/sprint18-relationship-garden.test.js` ≥ 12 cases pass
- [ ] `src/engine.js` 3 renderers (basic, no bloom animation yet)
- [ ] `src/main.js` state.gardenArc slot + VIEWS 接駁
- [ ] Hub card visible (locked → available) + 3-char avatar ready
- [ ] 5 base scenarios selected (owner spot-check by kencheng)
- [ ] **3 AI portraits generated** (`assets/images/garden/{小美,小晨,小輝}.png`, MiniMax image API)
- [ ] CI 全綠 (252 + ≥ 12 new = ≥ 264 tests passing)

### S18.2 (polish, ship)
- [ ] 🌷 bloom CSS keyframe (4 stages, 2 sec) + reduced-motion guard
- [ ] Per-character monologues differentiated (15 strings: 小美 觀察型 / 小晨 行動型 / 小輝 advisor)
- [ ] Monologue bubble (animated fade-in + avatar)
- [ ] Mid-run exit confirm dialog (mirror `confirmExitBank`)
- [ ] SR announces score change + monologue
- [ ] Per-character best-score persistence verified (3 distinct runs per student)
- [ ] Feature flag ship with default ON
- [ ] SPEC §18 addendum committed
- [ ] BUILD_LOG v2.12.0 entry
- [ ] Browser spot-check (chromium screenshot × 3 cards: select, play, result)
- [ ] AI image quality check (visual consistency with ed-1 anchor)
- [ ] 0 TS / 0 lint errors
- [ ] Deploy to gh-pages green

---

## 10. Sprint breakdown

| Week | Days | Tasks | Owner |
|---|---|---|---|
| **S18.1** | | | |
| 1 | Mon | **Generate 3 AI portraits** via MiniMax image API + select 5 base scenarios (owner spot-check) | Mavis |
| 1 | Tue | `src/constants/garden.js` (3 chars + 15 monologues) + `GardenArc.js` pure + start tests | Mavis |
| 1 | Wed | `i18n.js` + `storage.js` + feature flag + `src/main.js` state slot | Mavis |
| 1 | Thu | `engine.js` 3 renderers + Hub unlock + `RelationshipGarden.js` bridge + action registry | Mavis |
| 1 | Fri | Tests (15 cases) + 1st character portrait integration + visual quality verify | Mavis |
| 2 | Mon-Tue | All 3 chars integrated + remaining tests + CI integration | Mavis |
| 2 | Wed | Mid-sprint demo (內部走流程, 3 chars pickable) | Mavis + kencheng |
| **S18.2** | | | |
| 2 | Thu | 🌷 bloom keyframe + monologue bubble polish + reduced-motion | Mavis |
| 2 | Fri | a11y passes (SR + reduced-motion + character-switch test) | Mavis |
| 3 | Mon-Tue | SPEC §18 + BUILD_LOG + AI image quality check (3 vs anchor) | Mavis |
| 3 | Wed | Deploy gh-pages + post-deploy 30-min smoke (verify all 3 portraits live) | Mavis |

**Total**: 18 working days = ~3 calendar weeks（假 1 sprint = 2 calendar weeks → 1.5 sprint = 3 weeks）

---

## 11. Risks + mitigations

| Risk | L | I | Mitigation |
|---|---|---|---|
| Tag scenarios narrative 唔 coherent | Med | Med | Day 1 owner review 5 條 tag，唔 fit 即換；S19 polish |
| Monologue awkward (manual, generic) | Med | Low | 5 句 string only，iterate 1 round 容易 |
| Mid-run exit 失去 progress | Low | Low | Mirror Bank: 冇 resume v1，restart from step 0 (acceptable MVP) |
| Tag script 改 JSON 格式 break 其他 tests | Low | Med | 用 `characterTag` opt-in field；other readers 唔影響 |
| Reduced-motion users miss 🌷 reward | Low | Low | 即時 state change + 「+1 🌷 解鎖」文字 announcement |
| Concurrency with Sprint 27 auto-resume banner | Med | Low | 如果 mid-run 仍有 active，banner 顯「繼續關係花園 step N」；out of scope v1 |
| 252 existing tests regression | Low | High | Sprint 17-migration pattern: pure domain + UI 分離，回歸風險低 |
| Bundle size 增加 | Low | Low | New code ~1030 lines, gzip impact ~3-5 KB, well within budget |

---

## 12. Decisions resolved (2026-07-02)

| # | Decision | Resolution |
|---|---|---|
| 1 | Character roster | ✅ `小美 / 小晨 / 小輝` (changed from PROPOSAL_V1) |
| 2 | Ship 1 vs 3 chars S18 | ✅ **3 chars** (full roster ship S18) |
| 3 | Monologue | ✅ 預生成 (15 strings, 5 per char × 3 chars) |
| 4 | Avatar | ✅ **AI image** (3 MiniMax-generated cartoon portraits) |
| 5 | Score threshold | ✅ 鎖定 (`≥7` unlock, `<4` no unlock, 4-6 中段) |

**Open nuance (1)**: 5 base scenarios shared across chars vs 5 distinct per char (15 total)?
- **Current plan**: shared (lean, 5 scenarios × 3 monologue voices = 18 entry surface but only 5 content items)
- Alternative: distinct (15 scenarios = 3× content authoring, 1.5 → 2.5 sprints)
- Owner 確認走 shared 就 plan final; 否則 re-estimate

---

## 13. Next step

1. Owner 確認「shared vs distinct scenarios」追問 (§12 open nuance)
2. 確認 sprint 開工日期
3. Sprint 18.1 Day 1: 
   - Generate 3 AI portraits via MiniMax image API (`assets/images/garden/{小美,小晨,小輝}.png`)
   - Select 5 base scenarios + owner spot-check
   - 寫 `src/constants/garden.js` roster + 15 monologues
4. 開 S18.1 weekly standup first Mon

**Out of scope 嘅 dependency 清單**：
- 需要 owner review SPEC §18 draft 文 (跟 SPEC 17.11 嘅 voice)
- 需要 5 條 tag scenarios 嘅 narrative coherence spot-check by kencheng
- 需要 owner confirm scenarios reuse strategy (shared vs distinct) — final sprint budget depends

---

## 附錄 A — 對原 design 嘅 optimization list

| 變動 | 原因 |
|---|---|
| Split `RelationshipGarden.js` → `GardenArc.js` (pure) + `RelationshipGarden.js` (bridge) | 跟 Sprint 23 emotion-detective 嘅 SPEC §17.5 pattern；unit-test pure 唔需要 DOM |
| 新加 `src/actions/garden.js` 分離 | 跟 Sprint 27 feature-flag pattern；inline.js 唔再 monolithic |
| Add `FLAG.GARDEN_MODE` feature flag (default ON) | consistent with Sprint 27 release gate；user can flip OFF |
| Storage key rename `fc_garden_progress_v1` | 預留 versioning，方便 future schema change |
| Test plan 升級 12 → 18 cases (加 SEN/ASD/MID guards + schema invariants) | 同 Sprint 27-test-rigor 嘅 vibe |
| 開放 5 決策明確做 plan default | 避免 plan 中途 serendipity insert 改架構 |
| Reduced-motion @ media guard 寫入 plan | 跟 ARCHITECTURE.md §6.4 嘅 reduced-motion discipline |

---

*Plan v2.1 — 2026-07-02 by Mavis. Owner decisions applied: roster 小美/小晨/小輝, 3 chars ship S18, AI image avatars, threshold locked. Awaiting scenarios reuse confirmation (shared vs distinct) → S18.1 kickoff.*
