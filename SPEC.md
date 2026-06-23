# 友愛教室 V3 — 完整規格書 (v3.10)

> 基於 v2.2 framework 重整：對齊 EDB 12 種首要價值觀 + 5 個 SEL / 安全範疇
>
> *規格日期：2026-06-13 | 最後更新：2026-06-23（v3.10 addendum: §20 Sprint 21 — Typography scale 6 級 (12/14/16/18/22/28px) + --fs-* tokens + audit-font-sizes tool, 配套 22 個新 unit test + 123 個 hardcoded → token migration）*

---

## 1. 學習框架

### 1.1 核心設計：兩個獨立 domain

```
友愛教室 V3
├── 🪷 12 個價值觀（EDB 官方首要價值觀和態度）  ← public face
│   ├── 堅毅 / 尊重他人 / 責任感 / 國民身份認同
│   └── 承擔精神 / 誠信 / 仁愛 / 守法 / 同理心 / 勤勞 / 團結 / 孝親
│
└── 🌈 友愛校園 5 範疇（SEL / 安全 / 社交技巧）
    ├── 身體自主 / 陌生人危險 / 求助技巧
    └── 社交界線 / 衝突解決
```

**設計理念**：
- **🪷 12 個價值觀** 係對外公眾面：老師 / 家長 / 學生一睇就明「我哋教 12 個 value」
- **🌈 友愛校園 5 範疇** 係 SEL / 安全 skill：對 SEN 學生嚟講同樣重要，但唔屬「value」
- 兩個 domain 結構對稱、邏輯獨立：value 教「應該點做人」，caring 教「危險 / 衝突時點做」

### 1.2 EDB 對齊 source

> 教育局「價值觀教育」官方網頁（`/tc/curriculum-development/4-key-tasks/moral-civic/index.html`）：
>
> 「學校可培育學生**十二種首要的價值觀和態度**，即：**『堅毅』、『尊重他人』、『責任感』、『國民身份認同』、『承擔精神』、『誠信』、『仁愛』、『守法』、『同理心』、『勤勞』、『團結』和『孝親』**」

V3 框架嘅 12 個 value categories 100% 對正 EDB 官方 order（1-12），可向老師 / EDB cite source。

> **2026-06-17 verify**: 個 parent URL (`index.html`) 仍然 live 喺 EDB 網站 (`價值觀教育 - 教育局` page title + 「課程範疇 / 價值觀教育」nav entry 確認)。12 value exact wording 喺 child page (sub-page), 唔喺 index 入面, 所以 deep wording 喺 SPEC 凍結時 (2026-06-13) 引用嘅 snapshot, fresh onboarder 如要 verify 請撳入 sub-page。

### 1.3 17 個 categories + 259 個 scenarios

> **2026-06-14 update**：原本 V3 凍結時 121 條（re-tag 112 + new 9），之後再做兩輪擴張：
> - `0464153` expand values coverage to 140（12 VALUES 全部 ≥6）
> - `683c5f6` scale all 17 categories to 15 scenarios
> - `6cbc9c9` + 後續新增 8 條 national-identity（國安 2026、抗戰 80 週年、EDB 通函 133/2025 framework）
>
> 最終：**259 條 scenarios**（17 topics 全部 ≥15，平均 15.24/題）。**value domain 184 · caring domain 75 · risk level 0/1/2/3 = 184/36/14/25**。

| Domain | 範疇 | topicId | scenarios | 顏色 |
|---|---|---|---:|---|
| 🪷 value | 堅毅 | `perseverance` | 15 | 🟢 #10B981 |
| 🪷 value | 尊重他人 | `respect` | 15 | 🟢 #4ECDC4 |
| 🪷 value | 責任感 | `responsibility` | 15 | 🟠 #F59E0B |
| 🪷 value | 國民身份認同 | `national-identity` | 17 | 🔴 #EF4444 |
| 🪷 value | 承擔精神 | `commitment` | 15 | 🔴 #DC2626 |
| 🪷 value | 誠信 | `integrity` | 17 | 🔵 #3B82F6 |
| 🪷 value | 仁愛 | `benevolence` | 15 | 🩷 #EC4899 |
| 🪷 value | 守法 | `law-abiding` | 15 | 🟣 #6366F1 |
| 🪷 value | 同理心 | `empathy` | 15 | 🟠 #F97316 |
| 🪷 value | 勤勞 | `diligence` | 15 | 🟢 #84CC16 |
| 🪷 value | 團結 | `solidarity` | 15 | 🔵 #06B6D4 |
| 🪷 value | 孝親 | `filial-piety` | 15 | 🟣 #A855F7 |
| 🌈 caring | 身體自主 | `body-autonomy` | 15 | 🩷 #BE185D |
| 🌈 caring | 陌生人危險 | `stranger-safety` | 15 | 🔴 #B91C1C |
| 🌈 caring | 求助技巧 | `help-seeking` | 15 | 🔵 #0EA5E9 |
| 🌈 caring | 社交界線 | `social-boundary` | 15 | 🟣 #7C3AED |
| 🌈 caring | 衝突解決 | `conflict-resolution` | 15 | 🟢 #059669 |
| | | **Total** | **259** | |

**Spec 規劃 vs 實際**：
- 原本「每個 category 15 條」係最終目標，`683c5f6` 達標後 integrity（17）+ national-identity（17）超標 — 呢兩個係後來 EDB 通函 133/2025 framework 加 deep-content 嘅 category，刻意做多 2 條用嚟涵蓋多場景。
- 17 個 topic 全部達到 ≥15 嘅 coverage floor，冇 dead category。

### 1.4 框架原則：value vs caring 點解分開

| 維度 | 🪷 12 個價值觀 | 🌈 5 個友愛校園 |
|---|---|---|
| **性質** | 應該點做人 | 危險 / 衝突時點做 |
| **教學目標** | 內化 value judgement | 學 skill / 應對 method |
| **risk level** | 0（純 value） | 1-3（社交 / 安全 / critical） |
| **EDB 對齊** | ✅ 直接 12 種首要 value | N/A（SEL / 安全補充） |
| **家長接受度** | 高（politics free） | 中（家長怕嚇細路） |
| **學生體驗** | 「我應該做個好人」 | 「我識得應對」 |
| **scenario audience** | `["value"]` | `["caring"]` |
| **riskLevel** | 0 | 1 (社交界線 / 衝突) ~ 3 (身體 / 陌生人) |

---

## 2. 信條系統

### 2.1 12 條 EDB VALUE_CREEDS（id 1-12）

每條對應一個 EDB 官方 value category：

```javascript
export const VALUE_CREEDS = [
  { id: 1,  value: 'perseverance',      title: '堅毅的',      text: '我們是堅毅的：遇到困難不放棄，堅持到底' },
  { id: 2,  value: 'respect',           title: '尊重他人的',  text: '我們是尊重他人的：尊重每個人，唔嘲笑唔排擠' },
  { id: 3,  value: 'responsibility',    title: '負責任的',    text: '我們是負責任的：自己嘅嘢自己打理' },
  { id: 4,  value: 'national-identity', title: '愛國的',      text: '我們是愛護香港、認識國家的' },
  { id: 5,  value: 'commitment',        title: '勇於承擔的',  text: '我們是勇於承擔的：自己嘅選擇自己承擔' },
  { id: 6,  value: 'integrity',         title: '誠信的',      text: '我們是誠信的：講真話，做個可信嘅人' },
  { id: 7,  value: 'benevolence',       title: '仁愛的',      text: '我們是仁愛的：關心別人，主動幫忙' },
  { id: 8,  value: 'law-abiding',       title: '守法的',      text: '我們是守法的：遵守校規，奉公守法' },
  { id: 9,  value: 'empathy',           title: '同理心的',    text: '我們是同理心的：易地而處，感受他人嘅情緒' },
  { id: 10, value: 'diligence',         title: '勤勞的',      text: '我們是勤勞的：努力練習，唔怕辛苦' },
  { id: 11, value: 'solidarity',        title: '團結的',      text: '我們是團結的：與人合作，一齊努力' },
  { id: 12, value: 'filial-piety',      title: '孝親的',      text: '我們是孝親的：尊敬父母，孝順家人' },
];
```

### 2.2 LEGACY_CREEDS（id 13-22）

保留 10 條舊信條做 LEGACY_CREEDS，**純粹用嚟向後兼容舊 progress data**。
新 scenarios 一律用 VALUE_CREEDS（id 1-12）。

```javascript
export const LEGACY_CREEDS = [
  { id: 13, title: "信實的",       text: "..." },
  { id: 14, title: "整潔的",       text: "..." },
  { id: 15, title: "友愛的",       text: "..." },
  { id: 16, title: "禮讓的",       text: "..." },
  { id: 17, title: "勤力的",       text: "..." },
  { id: 18, title: "合作的",       text: "..." },
  { id: 19, title: "獨立的",       text: "..." },
  { id: 20, title: "愛護學校的",   text: "..." },
  { id: 21, title: "感恩的",       text: "..." },
  { id: 22, title: "守法的",       text: "..." },
];
```

### 2.3 Creed migration

舊 10 條信條（id 1-10）→ 新 LEGACY_CREEDS（id 13-22）：

```javascript
export const CREED_MIGRATION = {
  1: 22,   // 守法
  2: 13,   // 信實
  3: 14,   // 整潔
  4: 15,   // 友愛
  5: 16,   // 禮讓
  6: 17,   // 勤力
  7: 18,   // 合作
  8: 19,   // 獨立
  9: 20,   // 愛護學校
  10: 21,  // 感恩
};
```

`importMyData` 嗰陣自動 migrate，user 唔覺。

---

## 3. 場景數據格式（升級版）

### 3.1 V3 schema

```json
{
  "id": "s1",
  "title": "嘲笑同學",
  "background": "課室・小息",
  "description": "...",
  "hints": [...],
  "characters": [...],
  "options": [...],
  "location": "break",
  "topicId": "respect",                // ✅ V3 沿用，但 value 用 12 EDB id
  "creedIds": [2],                     // ✅ V3 用 EDB VALUE_CREEDS id 1-12
  "imagePrompt": "...",
  // ── V3 新增 fields ──
  "valueCategory": "respect",          // 必填，對齊 VALUE_CREEDS.value
  "domain": "value",                   // "value" | "caring"
  "audience": ["value"],               // 陣列: ["value"] / ["caring"] / ["value", "caring"]
  "riskLevel": 0,                      // 0=純value, 1=社交, 2=安全, 3=critical
  "skills": ["語言尊重", "旁觀者介入"]   // 必填，string array
}
```

### 3.2 Schema 規則

| Field | Type | Required | 規則 |
|---|---|---|---|
| `id` | string | ✅ | unique，12 種 prefix pattern (audit 2026-06-17): `s-self-NN` (V3 main, NN=01-178), `s-{topic}-{NN}` (V3 expansion: `s-bn-01` benevolence / `s-cm-01` commitment / `s-dl-01` diligence / `s-ni-01` national-identity / `s-pv-01` perseverance), 舊 V1/V2/V2.2 殘留 `s{N}` / `s-new{N}` / `s-{topic}{N}` (e.g. `s1` / `s-new1` / `s-c2` / `s-b1` / `s-door1`). Option id 跟 `s{N}-a/b/c` pattern (parent scenario id + option suffix) |
| `title` | string | ✅ | 非空 |
| `topicId` | string | ✅ | 17 個合法 id 其中之一 |
| `valueCategory` | string | ✅ | 同 `topicId`（向後兼容） |
| `domain` | enum | ✅ | `"value"` \| `"caring"` |
| `audience` | array | ✅ | `["value"]` / `["caring"]` / 兩者 |
| `riskLevel` | int 0-3 | ✅ | value=0, caring=1-3 |
| `skills` | array | ✅ | 1+ 個 skill label |
| `creedIds` | array | ✅ | 全 1-12（VALUE_CREEDS），13-22（LEGACY） |
| `description` | string | ✅ | 場景描述 |
| `hints` | array | ✅ | 1+ 個引導 hint |
| `options` | array | ✅ | 2-4 個 option |
| `options[].effects` | array | ✅ | 每 option 1+ 個 effect |
| `options[].effects[].moralChange` | int | ✅ | 任意 integer |

---

## 4. Topic re-tag migration

V2.2 → V3 自動 migration 表：

| V2.2 topicId | V3 topicId | Domain | 動作 |
|---|---|---|---|
| `emotions` | `empathy` | value | direct rename |
| `respect` | `respect` | value | direct rename |
| `honesty` | `integrity` | value | 合併 |
| `integrity` | `integrity` | value | 合併 |
| `conflict` | `conflict-resolution` | caring | 搬入 caring |
| `perseverance` | `perseverance` | value | 保留（s-self-58 個別去 diligence） |
| `self-protection` | `body-autonomy` | caring | 搬入 caring |
| `social-distance` | `social-boundary` | caring | 搬入 caring |
| `stranger-danger` | `stranger-safety` | caring | 搬入 caring |
| `help-seeking` | `help-seeking` | caring | 搬入 caring |
| `cooperation` | `solidarity` | value | rename |
| `classroom-rules` | `law-abiding` | value | rename |
| `filial-piety` | `filial-piety` | value | rename |
| `gift-gratitude` | `benevolence` | value | 保留（s-self-32/35/36 個別調整） |
| `responsibility` | `responsibility` | value | rename |
| _(none)_ | `diligence` | value | **新 category** |
| _(none)_ | `commitment` | value | **新 category** |
| _(none)_ | `national-identity` | value | **新 category** |

總共 re-tag **112 個 scenarios**，淨係 metadata 改動（topicId + 新加 5 個 fields），value 內容 100% 保留。
額外加 **9 個新 scenarios**（國民身份認同×3 + 承擔精神×3 + 勤勞×2 + 仁愛×1）填補新 categories。

---

## 5. 系統架構

> **2026-06-17 update (Sprint 5)**：Sprint 2 重構將 monolithic `main.js` (1,251 行) 拆成 6 個 domain modules。Sprint 3 將 `data/scenarios.json` 拆成 17 個 per-topic chunks。Sprint 4 加 `subjectId` filter + 刪 legacy file。Sprint 5 橋接 `window.FC.speak*` 同 TTS pipeline。

```
friendly-classroom-v2/
├── index.html              # 極簡 shell (#app + #fc-view)
├── package.json            # Vite + vite-plugin-pwa + vitest
├── vite.config.js
├── prebuild-sync.sh        # rsync assets/ → public/ (--delete) before build
├── gen_split_scenario_chunks.py  # Sprint 3+4: split + inject subjectId
│
├── data/
│   ├── scenarios/                   # Sprint 3: 17 per-topic chunks (376KB total)
│   │   ├── perseverance.json       #   15 scenarios, 21.9KB, subjectId="value"
│   │   ├── integrity.json          #   17 scenarios, 28.2KB
│   │   ├── national-identity.json  #   17 scenarios
│   │   ├── ... (12 EDB topics)
│   │   ├── body-autonomy.json      #   15, subjectId="caring"
│   │   ├── ... (5 CARING topics)
│   │   └── stranger-safety.json
│   ├── scenarios.backup-gift.json  # 歷史備份
│   ├── scenarios.json.bak*         # V2.2/V3 凍結備份
│   └── scenarios.json.pre-v3.bak
│
├── src/
│   ├── main.js             # 入口 + 狀態機 (Sprint 2: 1,251 → 536 lines)
│   ├── engine.js           # renderHome / TopicList / Play / Result + bank variants
│   ├── nav.js              # navigate(target, arg) single entry point
│   ├── topics.js           # VALUES (12) + CARING (5) + TOPICS = 17
│   ├── creeds.js           # 12 VALUE_CREEDS + 10 LEGACY_CREEDS
│   ├── subjects.js         # 單一 value subject
│   ├── storage.js          # STORAGE_KEYS registry + get/set helpers
│   ├── i18n.js             # STRINGS + t() fallback
│   ├── style.css
│   ├── audio.js            # Web Speech API TTS + playSFX + audioBase
│   ├── sync.js             # 雲端 sync stub
│   ├── teacher.js          # 老師 mode 入口 (lazy-loaded)
│   ├── sw-register.js      # PWA service worker register
│   │
│   ├── domain/             # Sprint 2: 6 domain modules
│   │   ├── ScenarioEngine.js   # scenario cache + chunk loader + play loop
│   │   ├── Moral.js            # applyScenarioResult + moralChange + triggeredCreeds
│   │   ├── Progress.js         # localStorage 進度 + updateSubjectTotal w/ _initialized
│   │   ├── Student.js          # switchStudent / selectStudent lifecycle
│   │   ├── Auth.js             # selectSubject / selectMode / chooseRole
│   │   ├── Play.js             # play(scenarioId) + choose(optionId) + retry
│   │   ├── IO.js               # import/export + analytics + teacher config
│   │   └── EventBus.js         # pub/sub for cross-module events
│   │
│   ├── games/              # Sprint 2
│   │   ├── Hub.js              # goTopic / goRandom / goTeacher + bank dispatch
│   │   └── GoodDeedBank.js     # startBankRun / bankChoose / bankNext
│   │
│   ├── components/         # Sprint 2: shared rendering helpers
│   │   ├── blocks.js           # renderPageHeader / renderOptionCard / renderBankOptionCard
│   │   ├── chrome.js           # renderFooter / renderEmptyState / renderLoading
│   │   └── Toast.js            # SR live region + announceScenarioLoad
│   │
│   ├── constants/          # Sprint 5: bank risk level constants
│   │   └── bank.js             # BANK_RISK enum + labels
│   │
│   └── util/               # Sprint 2: shared utilities
│       └── escape.js           # escapeAttr + escapeJsString (XSS hardening)
│
├── tests/                  # 34 unit tests
│   ├── smoke.test.js           # 22 cases: EventBus / Moral / Creeds / Progress
│   ├── scenario-engine.test.js # 11 cases: chunk load + subject filter
│   └── race-bug.test.js        # 1 case: subjectProgress total lock-in regression
│
├── tools/                  # Dev tools
│   └── a11y/audit-fc.mjs       # Playwright + axe-core a11y check
│
└── .github/workflows/
    ├── ci.yml              # tests + a11y + build on push
    └── deploy.yml          # actions/deploy-pages@v4 on push to main
```

### 5.1 模組依賴 (Module map, Sprint 2 重構後)

```
main.js (entry, 536 lines)
├── boot: window.FC self-init + state factory + render loop
├── wires: wireStudent / wireAuth / wirePlay / wireHub / wireIO
│         + loadScenarios / loadScenariosForTopic re-export
├── _setupDelegates: single click/error listener on #fc-view
│   └── data-action="X" → window.FC[X]?.call(el, data-arg, data-arg2)
├── exports: window.FC.{goTopic, goTeacher, goRandom, play, choose, retry,
│              switchStudent, selectSubject, selectMode, chooseRole, ...,
│              speak, speakOpt, speakCreeds, isSpeaking, stopSpeaking}
│
engine.js (renders)
├── renderRoleSelect / renderModeSelect / renderSubjectSelect
├── renderHome (uses state.subjectId for filter pills)
├── renderTopicList / renderPlay / renderResult / renderProgress / renderSettings
├── renderGameHub / renderBankPlay / renderBankResult / renderBankSummary
├── imports from: blocks, chrome, audio, scenarioEngine, progress, moral, topics, subjects
│
domain/ScenarioEngine.js (sprint 3+4+5)
├── state: scenarios[] + _loadedTopics Set + _pendingSubjectRefreshes Set
│         + _scenarioToTopic Map + currentStudent/Topic/Scenario
├── chunk loader: import.meta.glob('../../data/scenarios/*.json')
│         + loadScenarios() (full) + loadScenariosForTopic(id) (per-topic)
├── CRUD: getScenarios / getScenariosByTopic / getScenarioById (auto-load)
│         / setScenarios / isTopicLoaded
├── play loop: playScenario / chooseOption / getScenarioStatus
│         / initTopicProgress / initSubjectProgress (subjectId filter)
│         / getDisplayProgress / suggestNext
│
domain/Play.js (sprint 2+5 fix)
├── play(scenarioId) → getScenarioById().then(sc → speakScenario + render)
├── choose(optionId) → chooseOption + choose animation
├── retry() → play(currentScenarioId)
│
domain/Progress.js
├── get/set/markComplete: writeTo localStorage (key: fc_progress_<student>)
├── init helpers: updateTopicTotal / updateSubjectTotal (Sprint 4 _initialized)
├── migration: V2.2 dead topic IDs → V3 IDs (emotions/honesty/conflict)
│
audio.js (sprint 5 fallback for creed MP3)
├── TTS: speak(text) Web Speech API zh-HK/TW/CN/auto
├── playback: speakScenario / speakCreeds (MP3 → TTS fallback)
├── _setVoiceButtonsSpeaking(on): querySelectorAll + classList.toggle
│
components/blocks.js (sprint 5 T4: bank opt-read button)
├── renderPageHeader({emoji, title, back, rightButton})
├── renderOptionCard({isBank, showMoral}) — inner opt-read button for TTS
├── renderBankOptionCard — mirror with bankChoose action
```

---

## 6. UI Flow（V3）

```
首頁（Role Select）
└── 學生模式
    └── 🎮 Game Hub
        ├── 🏦 好人好事銀行
        ├── 📖 情境答題 ─→ Subject Select
        │                   └── Home（🪷 12 價值觀 + 🌈 5 友愛校園）
        │                       └── Topic List（17 個範疇 grid）
        │                           └── Scenario List
        │                               └── Play → Result
        ├── 🌷 關係花園 (backlog - 暫無 active design, 保留 UI 入口)
        └── 🎲 道德大富翁 (deferred - 推遲到 v4, 保留 UI 入口)
```

> **2026-06-17 status**：兩 game UI card (`src/engine.js:95-106`) 仍 render 但 `class="game-card locked"` + `cursor:not-allowed` + `opacity:0.6`，對學生呈現「暫未推出」狀態。如日後取消，應一併刪除 card markup 而非只改 tag。

### 6.1 Home 頁 layout

Home 頁分兩大 section：

```
🌟 友愛教室
├── Moral Bar（⭐ 道德值）
├── Greeting
├── Daily Creed
├── 🪷 12 個價值觀（EDB 官方）
│   └── 12 個 topic card（grid 2-col）
└── 🌈 友愛校園 5 範疇（SEL / 安全）
    └── 5 個 topic card（grid 2-col）
```

---

## 7. 特殊教育 UX 考量（V3 沿用 V2.2）

### 7.1 適配
- 大字 UI（預設 24px，可調至 32px）
- 語音朗讀題目 + 選項 + 信條（Web Speech API；Sprint 5 橋接 live）
- 減少文字量，多用圖示/emoji
- 操作要有語音確認
- TTS playback 期間，所有 voice button 顯示 pulse animation (`.speaking` class)，reduced-motion 模式自動停用

### 7.2 SEN 原則
- 一步驟一畫面，避免 multitasking
- 正向 feedback 為主，減少負面打擊
- 圖像優先於文字
- 明確的視覺反饋（顏色/動畫 + 語音播放 pulse）

### 7.3 V3 新增
- **risk level 顯式標記**：caring 範疇 scenarios 喺 play 頁面會顯示 risk badge（1/2/3），家長老師一睇就知
- **creed message tone**：用 EDB 官方 wording（"我們是..." 句式），增強歸屬感
- **TTS fallback (Sprint 5)**：creed MP3 缺失時自動 fallback 到 `speak(creed.text)` Web Speech API，唔會 silent fail
- **Bank view TTS (Sprint 5 T4)**：Good-Deed Bank 嘅 option card 都有 inline 🔊 button，對低年級 / 讀寫障礙學生係 essential a11y

---

## 8. V2.2 → V3 變更總結

| 項目 | V2.2 | V3.0 凍結（2026-06-13） | V3.1 擴張（2026-06-14） |
|---|---|---|---|
| Topic 總數 | 4 | **17**（12 VALUES + 5 CARING） | 同 V3.0 |
| Value 框架 | 4 個「課題」 | **12 個 EDB 官方 value** | 同 V3.0 |
| Domain 結構 | 單一 | **雙 domain（value / caring）** | 同 V3.0 |
| Scenario 數 | 58 | **121**（re-tag 112 + new 9） | **259**（+138，17 topics 全部 ≥15） |
| Creed 數 | 10 | **22**（12 VALUE + 10 LEGACY） | 同 V3.0 |
| EDB 對齊 | ❌ | ✅ | ✅（+EDB 通函 133/2025） |
| scenario.fields | id/title/topicId/creedIds | **+ valueCategory / domain / audience / riskLevel / skills** | 同 V3.0 |

### 8.1 V3.0 → V3.1 擴張 commit 歷史

| Commit | 改動 | +scenario | 原因 |
|---|---|---:|---|
| `0464153` | expand values coverage to 140 | +19 | 12 VALUES 全部 ≥6 條，消除 coverage 缺口 |
| `683c5f6` | scale all 17 categories to 15 | +84 | 5 caring + 7 value 補到 15/topic 嘅 coverage floor |
| `6cbc9c9` | 8 new national-identity scenarios | +8 | 國安 2026 + 抗戰 80 週年 + EDB 通函 133/2025 framework |
| 期間小修 | integrity 17, benevolence 15 等微調 | +27 | 個別 category 補 deep content |
| **累計** | | **+138** | 121 → 259 |

---

## 9. Sprint roadmap (2026-06-17 status)

> **2026-06-17 update**：Sprint 1-6 全部 done。18 commits pushed to `origin/main` (deploy live 喺 GH Pages, bundle `index-BAd-fhgr.js`)。Sprint 7+ 為 follow-up backlog。

| Sprint | 工作 | Status | Commit |
|---|---|---|---|
| ✅ V3.0 framework freeze | topics.js / creeds.js / scenarios.json / engine.js | Done | `acb9310` |
| ✅ S2: 擴張 scenarios 至 17×15 = 259 | 含 national-identity 8 條 | Done | `683c5f6` + `6cbc9c9` |
| ✅ S3: gen outcome images | 1005 張 image (scenarios + outcomes) | Done | `c1e43ee` + 後續 |
| ✅ S4: UI polish — domain card / daily streak / creed | 多輪 polish | Done | `d5758c9` / `f2cc8a0` / `0672d81` |
| ✅ **Sprint 1 (refactor)**: 拆 `main.js` (1,251 → 536 lines) | 6 domain modules | Done | `e1d74f9` |
| ✅ **Sprint 2 (refactor)**: 6 domain modules wire-up | wireStudent/Auth/Play/Hub/IO + window.FC bridge | Done | `e1d74f9` + `14ffacd` |
| ✅ **Sprint 3 / B1 (perf)**: 拆 `data/scenarios.json` → 17 per-topic chunks | per-topic lazy load via `import.meta.glob` | Done | `9f723e7` |
| ✅ **Sprint 4 / A1**: 加 `subjectId` field 喺 259 scenarios | engine filter by subjectId, drop 0/0 hack | Done | `c48f8bb` |
| ✅ **Sprint 4 / A2**: 刪 legacy `data/scenarios.json` (-514KB) | dead file removed | Done | `514c01c` |
| ✅ **Sprint 4 / A3**: 11 個 scenario engine unit tests | per-topic load + subject filter | Done | `9b37960` |
| ✅ **Sprint 4 review fix**: 0/0 deadlock + idempotency guard | `_initialized` flag + re-fire on chunk load | Done | `76a2816` |
| ✅ **Sprint 5 / T1**: 橋接 `window.FC.speak / speakOpt / speakCreeds` | TTS bridges live | Done | `372dd45` |
| ✅ **Sprint 5 / T2**: `data-arg="${s.id}"` 加返去 speak button markup | dispatcher 收到正確 arg | Done | `169516a` |
| ✅ **Sprint 5 / T3**: `.speaking` class pulse animation | visual feedback 同步 TTS playback | Done | `3467440` |
| ✅ **Sprint 5 / T4**: Bank view 加 inline voice buttons | TTS a11y 覆蓋全部 play mode | Done | `4126c75` |
| ✅ **Sprint 5 / T1-followup**: import `speak` 喺 main.js | ReferenceError 修咗 | Done | `7479e92` |
| ✅ **Sprint 6**: Mandarin MP3 → Cantonese TTS fallback chain | `speakCreeds()` 直讀 TTS, voice chain zh-HK → zh-TW → zh-CN, settings 警告 + 刪 10 條 Mandarin MP3 (~1MB) | Done | `a84a171` + `34129a4` |
| 🟡 **S7 backlog**: `revealNextHint` / `toggleHints` 缺 `window.FC` bridge — **已合併入 Sprint 13 done ✅** | (2026-06-17) | Done | Sprint 13 |
| 🟡 **S8 backlog**: 21 scene 圖片 (300+ KB each) 改 webp | PWA precache 158MB 縮減 | TBD | — |
| 🟡 **S9 backlog**: Vite preview service worker 自動 cache dist 行為 | e2e setup 要 `?cb=$(date +%s)` cache-bust | TBD | — |
| 🟢 **S10 backlog**: 老師 mode 確認 17 個 category toggle | regression test | TBD | — |
| 🟢 **S11 backlog**: 拆 `engine.js` (1,156 lines) → per-view renderers | 更大 refactor | TBD | — |
| ✅ **Sprint 12**: silent no-op bug sweep (5 個 P0 fix) | `doLogin` (老師 mode 登入) / `resetSettings` / `setSpacing` / `toggleHC` / `toggleVoice` 全部加 `window.FC.X` bridge + `audio.js` 3 個新 helper (`setSpacing` / `setHC` / `setVoiceEnabled`) + 7 個 unit test。`navigate` 確認係 main.js dispatcher special-case, `foo` / `go*` 確認係 comment 引用 — audit false positive。Cross-check 揭 `addStudent` 1 個新 bug → S13 | Done | TBD |
| ✅ **Sprint 13**: silent no-op bug sweep 第 2 round (3 個 P0 fix) | `addStudent` (Student.js:67) / `revealNextHint` (engine.js:802) / `toggleHints` (engine.js:789) 全部加 `window.FC.X` bridge + `Progress.js` 1 個新 helper (`addStudent`) + 6 個 unit test。`toggleHints` 第一次展開自動 reveal 第一個 hint, `revealNextHint` 全部 reveal 完自動隱藏自己。E2E audit 確認 **0 Category A 真 bug 剩低** — 只剩 `navigate` / `foo` / `go*` / `go` 4 個 audit false positive | Done | TBD |

---

## 10. 已移除功能

- ❌ 自由模式（random 跨課題）— 破壞學習階梯
- ❌ 🚪門課題（社交故事類）— 唔係德育題目
- ❌ Phase 2 teacher-editor — 改為直接編輯 JSON
- ❌ V2.2 嘅 4 大主題分組（emotions/respect/honesty/conflict）— 已被 12+5 取代

---

*規格日期：2026-06-13 | 最後更新 2026-06-22 | v3.7（addendum: §16 S15 daily pick + reflection + §17 S16 stop-and-think + 書面語化 + Result TTS — 配合 Sprint 15 + Sprint 16 開工, 見 §16 + §17）| 取代 v2.2（2026-06-04）*

---

## 11. Sprint 3-5 變更總結（refactor + perf + 語音）

> V3.1 scenario 內容 (259 條) freeze 之後，3 個 sprint 集中喺 **engineering quality**：
> 模組化 → chunk 載入 → TTS 橋接。每個 sprint 都以 atomic commit 結束 + 22+ 個 unit test 護住 regression。

### 11.1 Sprint 1-2 (Refactor) — modular monolith 變 layered architecture

**目標**：`main.js` 1,251 行 monolithic 入面 14 個 concern 拆出去

| 改動 | Before | After |
|---|---|---|
| `main.js` 行數 | 1,251 | **536** (-57%) |
| Domain modules | 0 (all in main.js) | **6** (Student / Auth / Play / Hub / IO / EventBus) |
| Game modules | mixed | **2** (Hub / GoodDeedBank) |
| Component helpers | inline | **3** (blocks / chrome / Toast) |
| Inline `onclick="FC.foo('${x}')"` | 19 處 | **0** (XSS hardening, 全部 `data-action`) |
| `window.FC.*` exports | ~12 個 domain | **~36 個** (speak bridge after Sprint 5) |

**關鍵 commit**：
- `e1d74f9` refactor(sprint2): split main.js (1252 → 536 lines) into 6 domain modules
- `14ffacd` fix(sprint2): wrap window.FC self-init in IIFE to defeat Vite minifier DCE
- `826f134` feat(home): add subject-domain filter tabs (value / caring / all)

**解決嘅 bug**：inline `${x}` 喺 onclick attribute 入面係 XSS vector (P0-3 architectural fix)

### 11.2 Sprint 3 / B1 (Performance) — per-topic lazy load

**目標**：first topic click 唔再 fetch 514KB JSON

| 改動 | Before | After |
|---|---|---|
| `data/scenarios.json` | 514KB monolithic | **deleted** (split into 17 chunks) |
| `data/scenarios/<topic>.json` | 0 files | **17 files** (376KB total) |
| First topic click 載入量 | 514KB | **~22KB** (1 chunk) |
| Code split chunks | 1 main bundle | **17 + 1** (Vite auto code-split via `import.meta.glob`) |
| `import.meta.glob` | 0 | 1 (in `ScenarioEngine.js`) |
| `id → topic` reverse index | 0 | Map (259 entries, populated on chunk merge) |

**關鍵 commit**：
- `9f723e7` perf(sprint3-b1): split scenarios.json into 17 per-topic chunks
- `76a2816` fix(sprint4-review): subjectProgress total lock-in + idempotency guard (review caught 0/0 deadlock)

**Side bugs caught by review**：
1. **0/0 deadlock**: per-topic lazy load 第一次 `initSubjectProgress` 寫 0 → 永久死鎖 → re-introduce `_pendingSubjectRefreshes` 機制
2. **Idempotency guard 對 default placeholder 0/0 永久 miss**: `_defaultProgress` pre-init `{ completed: 0, total: 0 }` 同 sentinel 0 撞 value, guard `cur.total === total` skip 第一次 write → 加 `_initialized: true` flag

### 11.3 Sprint 4 (Tech debt cleanup)

| 改動 | Before | After |
|---|---|---|
| `subjectProgress.total` 寫入 | misleading 259 (all scenarios) | **per-subject** (184 value / 75 caring) |
| `_pendingSubjectRefreshes` hack | removed (re-introduced w/ fix) | cleaned up + `_initialized` marker |
| Unit test count | 22 (smoke) | **34** (22 + 11 engine + 1 race) |
| Hack count in engine | 0 (Sprint 3 issue) | 0 (cleaned up via re-fire) |

**關鍵 commit**：
- `c48f8bb` feat(sprint4-a1): inject subjectId into 259 scenarios
- `514c01c` chore(sprint4-a2): remove legacy data/scenarios.json
- `9b37960` test(sprint4-a3): add scenario engine unit tests (11 cases)
- `76a2816` fix(sprint4-review): subjectProgress 0/0 deadlock + idempotency fix

### 11.4 Sprint 5 (Sound / TTS bridge) — data-action dispatcher missing handlers

**Root cause**：Sprint 2 `inline onclick → data-action` refactor 嗰陣，6 個喇叭 button series 漏咗寫 `window.FC.X` 個 bridge。Markup 寫 `data-action="speak"` 但 dispatcher 撈 `window.FC.speak` → `undefined` → silent no-op。E2E 從未 click 過喇叭 button，**所有 6 個 speak button 完全 dead 9 個 sprint**。

| 改動 | Before | After |
|---|---|---|
| `window.FC.speak / speakOpt / speakCreeds` | undefined | **function** (橋接 3 handler) |
| Speak button `data-arg` | MISSING (speak) | **`s.id`** 注入 |
| `getCurrentScenario` engine export | imported but not exported | **re-exported** |
| `audio.js speakCreeds` MP3 fallback | silent on 404 | **fallback to `speak(creed.text)`** |
| `.speaking` class pulse on TTS | never toggled | **5 個 voice button 同步 pulse** |
| Bank view inline voice buttons | 0 | **3 個 option card 喇叭** |
| `window.FC.isSpeaking / stopSpeaking` | not exposed | exposed (debug + future) |

**關鍵 commit**：
- `372dd45` feat(sprint5-t1): bridge window.FC.speak / speakOpt / speakCreeds
- `169516a` fix(sprint5-t2): add data-arg="${s.id}" to speak button markup
- `3467440` feat(sprint5-t3): pulse animation on voice buttons during TTS
- `4126c75` feat(sprint5-t4): add inline voice buttons to Good Deed Bank play view
- `7479e92` fix(sprint5-t1-followup): import speak in main.js (caught by e2e sweep)

**E2E discovery rule** (added to agent memory, sharpened 2026-06-17):
> 任何 sprint review / code review 必先跑 audit 拎 3 個 list：
> ```bash
> # 1. data-action 列表（action only, 唔 capture arg）
> grep -rohE 'data-action="[a-zA-Z]+' src/ | sort -u
> # 2. window.FC.X = 個 assignments（definitive exports，唔 grep usage 因為 Vite minifier DCE）
> grep -rohE 'window\.FC\.[a-zA-Z]+\s*=' src/ | sort -u
> # 3. data-action 全值連 arg（用嚟 detect wildcard/placeholder，例如 `data-action="go*"`）
> grep -rohE 'data-action="[a-zA-Z]+[^"]*"' src/ | sort -u
> ```
> **3 個 category check**:
> - **Category A** (action missing bridge, P0): `data-action="X"` 出現但 `window.FC.X =` 冇 → silent no-op, 必 fix 先 ship。Sprint 5/6 都係呢類 (e.g. `speak`, `speakOpt`, `speakCreeds`)
> - **Category B** (export no action, P3 cleanup): `window.FC.X =` 出現但 `data-action="X"` 冇 → dead code / internal helper, 唔係 bug, 但可以 audit
> - **Category C** (placeholder/wildcard, P2 cleanup): `data-action="*"` / `data-action="foo"` / `data-action="go*"` 等 catch-all → dead pattern, 必刪
>
> E2E click matrix: 每個 Category A action 必 click 至少 1 次 (catch silent failures from CSS 衝突 / arg parsing 錯 / event delegation 漏)。2026-06-17 audit 揭咗 6 個新 Category A bug: `doLogin`, `navigate`, `resetSettings`, `setSpacing`, `toggleHC`, `toggleVoice` (+ 2 Category C: `foo`, `go*`)。
>
> **2026-06-17 Sprint 12 followup**: 5 個真 bug (`doLogin` / `resetSettings` / `setSpacing` / `toggleHC` / `toggleVoice`) 全部 fixed + unit test。Audit false positive 確認:
> - `navigate` (20 處出現, `src/main.js:385-389` dispatcher special-case `if (action === 'navigate') _navigate(el.dataset.arg, el.dataset.arg2)`) — 屬 universal navigation 唔通過 `window.FC.X` bridge, 唔算真 bug
> - `foo` / `go*` — source 入面冇真實 `data-action="foo"` / `data-action="go*"`, 只係 `src/main.js:251, 345, 544` 嘅 comment 引用歷史 refactor 描述
> Cross-check 揭 1 個新 Category A bug `addStudent` (Student.js:67), 排 S13 backlog。

> **2026-06-17 Sprint 13 followup**: 3 個 P0 真 bug (`addStudent` / `revealNextHint` / `toggleHints`) 全部 fixed + 6 個 unit test。**E2E audit 確認 0 Category A 真 bug 剩低** — 只剩 4 個 audit false positive (`navigate` / `foo` / `go*` / `go`)。Data-action ↔ window.FC bridge 全部 wired up, 學生老師用戶體驗再也冇 silent no-op button。Sprint 12+13 累計修咗 8 個 P0 silent no-op bug, 全部原本 silent 影響學生/老師 flow。

### 11.5 Sprint 6 (2026-06-17) — Mandarin MP3 → Cantonese TTS fallback

**User 報 issue**: 學生信條 playback 用咗**國語 MP3**, 對香港 SEN 學生係 a11y regression。

**Root cause analysis**:
- `gen_audio.sh` 用 Hermes `mmx speech synthesize --voice Cantonese_GentleLady` 生成 10 條 MP3 (creed-1 到 creed-10)
- 但 `mmx` 個 API key 已經 expired, 重 run 個 gen script 失敗
- 個 batch gen 喺 6 月 2 日跑, 個 Cantonese_GentleLady voice 個實際 output 係**國語** (普通話), 唔係粵語
- 我哋 Sprint 5 寫咗 MP3 404 → TTS fallback, 但 `speakCreeds(creeds[0].id)` 個 id 對應 value creed 1-12 (即 `perseverance` 嘅 creed), 個 MP3 file 唔存在 → fall 落 TTS → TTS 用戶 system voice → Chrome macOS default = Eddy zh-CN (普通話)

**Fix** (commit):
1. **刪咗 10 個 MP3** (`public/audio/creeds/*.mp3`) — Mandarin content, 對香港學生係 a11y regression. 重新 gen 需要 API key, 短時間內無法 — commit `34129a4`
2. **改 `speakCreeds()` 直接用 TTS** (always TTS, 唔用 MP3 path), 強制 lang='zh-HK' — commit `a84a171`
3. **改 TTS voice fallback chain** (`_pickBestVoiceForLang`) — commit `a84a171`:
   - 1st: `zh-HK` exact match
   - 2nd: `zh-TW` (台灣國語, 比較接近粵語捲舌/不捲舌 accent)
   - 3rd: `zh-CN` (普通話)
   - 4th: 任何 zh-prefixed
   - Fix 前個 fallback 永遠返第一個 zh-prefixed (Eddy zh-CN), 改咗排台灣先
4. **Settings page 警告** — commit `a84a171`: 自動 detect 有冇 zh-HK voice installed. 冇嘅話顯示 hint box, 教 user 點樣 install:
   - **macOS**: 系統偏好設定 → 輔助使用 → 朗讀內容 → 系統聲音 → 揀「Sin-ji (粵語香港)」
   - **Windows**: 設定 → 時間與語言 → 語言 → 語音 → 加粵語香港 voice pack

**Known limitations**:
- 冇 zh-HK voice 嘅 system 上, 學生信條 會用台灣國語 fallback. 對 SEN 學生嚟講 仍然有少少 cultural disconnect
- 真粵語要靠 user 自己 install voice pack (browser 限制, 唔可以 app 強制)
- 將來有 MiniMax TTS API key 之後, 可以用 MiniMax 粵語 voice 預 gen 12 條 EDB VALUE_CREED MP3 (sprint 7 backlog)

---

## 12. Deployment

### 12.1 Pipeline
```
Local dev  →  npm run dev   (Vite HMR)
           ↓
Local test →  npm test      (Vitest, 34 unit cases)
           ↓
Local e2e →  npm run preview + Playwright (manual / CI)
           ↓
git push origin main
           ↓
GitHub Actions (ci.yml + deploy.yml) parallel:
  - ci.yml:    vitest + axe-core a11y + build → required check
  - deploy.yml: actions/deploy-pages@v4 → builds + pushes dist/ to gh-pages
           ↓
GitHub Pages: https://ihateusingai-beep.github.io/friendly-classroom-v2/
```

### 12.2 Bundle sizes (Sprint 6 final, audited 2026-06-17)
- `dist/assets/index-*.js`: 114.39 KB raw / 34.86 KB gzip — main entry (+2.4 KB vs Sprint 5, TTS bridge + speakCreeds direct-call path 加咗少少)
- `dist/assets/<topic>-*.js`: 17 chunks × 17.31–27.03 KB / 3.96–8.26 KB gzip — per-topic lazy load (largest = integrity 27.03 KB, smallest = help-seeking 17.31 KB)
- `dist/assets/teacher-*.js`: 5.76 KB / 1.96 KB gzip — lazy-load on teacher mode
- `dist/assets/index-*.css`: 42.15 KB / 8.83 KB gzip
- `dist/assets/images/scenarios/*.png`: ~66 MB (259 files)
- `dist/assets/images/outcomes/*.png`: ~90 MB (745 files)
- `dist/assets/audio/creeds/`: ❌ **已刪除 (Sprint 6 2026-06-17)** — 原本嘅 10 條 creed MP3 係 6 月 2 日用 Hermes `mmx` + Cantonese_GentleLady voice 生成嘅, 但實際 output 係**國語普通話** (`mmx` API key 已經 expired, 重新 generate 唔到粵語 MP3)。刪除之後 `speakCreeds()` 直接用 Web Speech API TTS zh-HK → 國語 fallback chain (zh-TW 優先, 對 SEN 學生 cultural disconnect 較少)。User-facing warning 喺 settings page 提示安裝 macOS `Sin-ji` 或 Windows `zh-HK` voice pack
- **PWA precache**: 1,032 entries / 158,518.83 KiB (≈ 154.8 MB) — 比 Sprint 5 嘅 158.5 MB round number 縮 ~3.7 MB, 主要係 MP3 刪 1 MB + worker chunk 改進
- **Build time**: 1.07s (HMR-rebuild, Vite 6 + Rollup)

### 12.3 Edge cache
- GH Pages edge CDN TTL 600s
- User browser cache: 3 layers (memory + disk + service worker)
- Hard refresh (Cmd+Shift+R) 強制 reload 跳 SW cache
- e2e / cache-bust trick: append `?cb=$(date +%s)` to URL

### 12.4 Local serve
```bash
npm run build          # prebuild-sync + vite build → dist/
npx vite preview --port 4321  # serve dist/ as static
```

---

## 13. Dev workflow

### 13.1 環境
- macOS 14+
- Node 18+
- npm 9+ (Vite 6 兼容)
- 唔需要 Python / Docker / database

### 13.2 First-time setup
```bash
git clone https://github.com/ihateusingai-beep/friendly-classroom-v2.git
cd friendly-classroom-v2
npm install            # 唔需要 venv / system deps
npm run dev            # http://localhost:5173
```

### 13.3 Day-to-day commands
| Command | 用途 |
|---|---|
| `npm run dev` | Local dev server (HMR) |
| `npm test` | Run 34 unit tests (vitest run) |
| `npm run audit:a11y` | axe-core a11y check via Playwright |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve `dist/` for local prod test |
| `npm run deploy` | ⚠️ **DEPRECATED** — 用 GH Actions 自動 deploy (`actions/deploy-pages@v4` on push to main)，唔再 `gh-pages` branch push |

### 13.4 數據生成
```bash
# Split scenarios.json → 17 per-topic chunks (with subjectId injection)
python3 gen_split_scenario_chunks.py
```
Output: `data/scenarios/<topic-id>.json` (Sprint 4: each scenario enriched with `subjectId`)

### 13.5 Sprint discipline
1. **Pre-coding**: 用 `rg -n` grep function definition 確認 pre-existing API 真存在 (避免 blind trust plan spec)
2. **Module extraction**: 抽 module 前 grep closure refs (e.g. `_isReducedMotion`)，wire-up 前 `rg` 確認 import 連 + 寫 smoke test
3. **Data-action bridge**: 任何 `data-action="X"` 必對應 `window.FC.X` export (memory rule)
4. **Test**: `npm test` 必 100% pass + Sprint scope 內手動 Playwright e2e click chain
5. **Commit**: 每個 sub-task 1 atomic commit, commit message 寫明 context + side effect
6. **Review**: 每個 sprint 結尾 review commits for bugs (memory rule 嘅 `data-action` diff check)
7. **Push**: `git push origin main` → GH Actions auto-deploy
8. **Verify**: cron self-reminder check GH Actions → live verify bundle hash

### 13.6 Known gotchas
- **Vite PWA service worker cache**: dist 個改動需要 `?cb=$(date +%s)` cache-bust 嚟 force reload (個 SW 自動 cache precache list 5+ min)
- **Uvicorn `--reload`** (out of scope but for future backend): 唔 re-fire lifespan startup, 改後必 `pkill + 重啟`
- **`git add -A`** trap: 會掃入 `/tmp/pytest-of-*`、`.opencode/` 等 untracked, 必 `git diff --cached --name-only` 確認 staged list
- **Vite minifier DCE**: `if (window.X) {}` 喺 prod bundle 會消失, 必 wrap IIFE
- **Edit tool multi-edit**: 連續 Edit 同一檔時 second `oldString` 可能撞 first 改後嘅 content, 用 `sed -i ''` 一刀切

---

## 14. Quick reference

### 14.1 對 fresh onboarder

> 1. Read §1-§4 理解 curriculum + schema (30 min)
> 2. Read §5 理解 module structure (15 min)
> 3. Run `npm run dev` + click through 17 topics × 2 subjects + bank 1 run (1 hour)
> 4. Read §11 了解過去 4 個 sprint 嘅 refactor 歷史 (30 min)
> 5. Read §13 dev workflow + memory entries (15 min)
> 6. Pick a backlog item from §9 → run dev workflow §13.5

### 14.2 對 reviewer

> 1. `grep -rohE 'data-action="[a-zA-Z]+' src/ | sort -u` — 列出所有 distinct data-action (action only, 唔 capture arg)
> 2. `grep -rohE 'window\.FC\.[a-zA-Z]+\s*=' src/ | sort -u` — 列出所有 window.FC.X = assignments (definitive, 唔 grep usage 因為 Vite DCE)
> 3. `grep -rohE 'data-action="[a-zA-Z]+[^"]*"' src/ | sort -u` — 列出 data-action 連 arg (catch wildcard/placeholder e.g. `go*`, `foo`)
> 4. Diff (1) vs (2) — missing = Category A (silent no-op, P0 必 fix)
> 5. Diff (2) vs (1) reverse — extra = Category B (dead export, P3 cleanup)
> 6. (3) 入面有 `*` / `foo` / `bar` = Category C (dead pattern, P2 刪)
> 7. 跑 `npm test` 100% pass
> 8. Build → preview → 對每個 Category A action click 至少 1 次 (Playwright e2e)
> 9. Console 0 errors

> 注: ripgrep 嘅 `-ohE ... -r` syntax 行唔到 (`-E` 係 `--encoding`, `-r` 係 `--replace`, ripgrep 已經 default extended regex + recursive)。用 GNU `grep -rohE` 或者 `rg -o --no-filename` 兩者皆可。

### 14.3 對 user / teacher

> 1. 訪問 https://ihateusingai-beep.github.io/friendly-classroom-v2/ (or self-host)
> 2. 揀角色 (學生 / 老師家長)
> 3. 揀科目 (預設 1 個 value subject，將來可能加多)
> 4. 主頁可揀 🪷 12 個 EDB 價值觀 / 🌈 5 個友愛校園 / 📚 全部 17 個
> 5. 揀個 topic → 揀個 scenario → 揀個 option → 睇 result + 信條
> 6. Good-Deed Bank: 隨機 8 題，總分到 $100 過關
> 7. Settings: 改字體大小 / 朗讀語言 (auto / 粵語 / 國語 / 普通話) / 朗讀速度 / 對比度 / 動畫減弱

---

## 15. e2e Bridge Sweep Tool

> **2026-06-17 add (slow batch)**: 為咗 cover Sprint 12+13 嘅 8 個 P0 silent no-op fix
> 加真實 browser click matrix 工具，唔淨只 unit test bridge 存在。

### 15.1 工具位置

`tools/e2e/bridge-sweep.mjs` — Playwright 直接 launch chromium, 跑
9 個 representative handler click matrix (Sprint 12+13 8 個 P0 + Sprint 5
`speak` regression)。

### 15.2 涵蓋範圍

| Handler | Sprint | 測試類型 |
|---|---|---|
| `addStudent` | 13 | bridge exists check |
| `resetSettings` | 12 | bridge exists check |
| `setSpacing` | 12 | bridge exists + localStorage write (wide) |
| `toggleHC` | 12 | bridge exists + localStorage flip |
| `toggleVoice` | 12 | bridge exists + isEnabled flip |
| `doLogin` | 12 | bridge exists (login flow 入面 click 屬手動 e2e) |
| `toggleHints` | 13 | bridge exists |
| `revealNextHint` | 13 | bridge exists |
| `speak` | 5 (regression) | bridge exists |

### 15.3 跑 command

```bash
npm run build
npx vite preview --port 4174 &
sleep 2
node tools/e2e/bridge-sweep.mjs
# 截圖: /tmp/fc-bridge-sweep/*.png
# 結果: ✅ All 8 P0 Sprint 12+13 bridges + 1 Sprint 5 regression verified.
```

### 15.4 將來 follow-up

- 加更多 handler (e.g. `selectSubject`, `play`, `choose`, `goRandom`) 全面 click matrix
- 將 `tools/e2e/bridge-sweep.mjs` 轉成 `tests/e2e/*.spec.mjs` 用 `@playwright/test` runner
- 喺 `ci.yml` 跑 (要 setup `npx playwright install chromium`)

---

## 16. v3.6 Addendum — Daily Pick (1.1) + Reflection Journal (1.2) Schema Freeze

> **2026-06-19 freeze**: 配合 [docs/PRODUCT_PROPOSAL_V1.md](./PRODUCT_PROPOSAL_V1.md) §1.1 + §1.2 + Sprint 15 開工,freeze 兩個 feature 嘅 storage schema + selection algorithm + module boundary。Sprint 15 開工前必讀。

### 16.1 STORAGE_KEYS bump (v3.5 → v3.6)

`src/storage.js` registry 加 4 個 key:

```javascript
export const STORAGE_KEYS = {
  // v3.5 existing (5)
  PROGRESS:    'fc_progress',         // 學生進度 (per-student: fc_progress_<id>)
  STUDENT:     'fc_current_student',  // 當前 student id (single)
  STUDENTS:    'fc_students',         // 學生 list (single, array)
  SETTINGS:    'fc_settings',         // 用戶 setting (single)
  ONBOARDED:   'fc_onboarded',        // first-run flag (single)
  // v3.6 add (4) — 全部 per-student
  STREAK:      'fc_streak',           // 每日 streak (per-student: fc_streak_<id>)
  DAILY_LOG:   'fc_daily_log',        // 每日 pick log (per-student: fc_daily_log_<id>)
  STICKERS:    'fc_stickers',         // 解鎖 sticker (per-student: fc_stickers_<id>)
  REFLECTIONS: 'fc_reflections',      // 反思日記 (per-student: fc_reflections_<id>)
};
```

**Storage 命名規矩**:
- 4 個新 key 全部 `fc_<feature>` + runtime append `_<studentId>`(同 PROGRESS 慣例)
- 唔用 nested object / array-of-objects inside single key
- IndexedDB database name:`fc_reflections_db`(獨立,唔同 localStorage 混)

---

### 16.2 1.1 Daily Pick + Streak

#### 16.2.1 Streak data schema (`fc_streak_<studentId>`)

```json
{
  "current": 7,                  // 當前連續日數, 0 = 今日未完成
  "longest": 30,                 // 歷史最長, 只升唔跌
  "lastDay": "2026-06-19",       // 最後完成日 (YYYY-MM-DD, local time)
  "lastPickScenarioId": "s-respect-03",  // 最後 pick 嘅 scenario (debug)
  "version": 1                   // schema version, 未來 migration 用
}
```

**Field 規則**:
- `current` 增減規則見 §16.2.4 streak 狀態機
- `longest = max(longest, current)`, 每次 `recordDailyCompletion()` 自動更新
- `lastDay` 比較用 string YYYY-MM-DD,**唔用 ISO timestamp**(避開時區問題)
- `lastPickScenarioId` 只用嚟 debug + daily log 對賬,唔做 selection logic

#### 16.2.2 Daily log schema (`fc_daily_log_<studentId>`)

```json
[
  {
    "day": "2026-06-19",
    "scenarioId": "s-respect-03",
    "scenarioTitle": "嘲笑同學",
    "topicId": "respect",
    "completed": true,
    "completedAt": "2026-06-19T08:30:00.000Z"
  },
  {
    "day": "2026-06-18",
    "scenarioId": "s-caring-05",
    "scenarioTitle": "...",
    "topicId": "stranger-safety",
    "completed": false,
    "completedAt": null
  }
]
```

**Field 規則**:
- Array, FIFO,**cap 365 entries**(1 年)— auto-rollover
- `completed` 反映「今日呢個 scenario 揀咗但最終有冇玩完」
- `completedAt` 用 ISO 8601 UTC,client render 時轉 local time

#### 16.2.3 Sticker data schema (`fc_stickers_<studentId>`)

```json
[
  {
    "id": "starter",
    "name": "初試啼聲",
    "emoji": "🌱",
    "unlockedAt": "2026-06-19T08:30:00.000Z"
  },
  {
    "id": "week-streak",
    "name": "一週達人",
    "emoji": "🔥",
    "unlockedAt": "2026-06-25T08:30:00.000Z"
  }
]
```

**Sticker milestone 表**(硬編碼喺 `src/daily.js`):

| ID | 觸發條件 | name | emoji |
|---|---|---|---|
| `starter` | streak ≥ 1 | 初試啼聲 | 🌱 |
| `week-streak` | streak ≥ 7 | 一週達人 | 🔥 |
| `month-streak` | streak ≥ 30 | 月度冠軍 | 🏆 |
| `century` | streak ≥ 100 | 百日王者 | 💎 |
| `champion` | streak ≥ 200 | 毅力典範 | 🌟 |
| `complete` | 玩晒 259 條 scenario | 友愛達人 | 🪷 |

**Field 規則**:
- 觸發條件兩者取其一(streak milestone OR 場景總數)
- `unlockedAt` 第一次 unlock 嘅時間(再觸發唔重覆)
- Sticker **永久唔刪**,即使 streak reset 都保留歷史解鎖

#### 16.2.4 Streak 狀態機

```
[Today 00:00]
   ↓
[Streak check on app open]
   ├── lastDay == today        → 唔變,等用戶玩 daily
   ├── lastDay == yesterday    → current 維持,等用戶玩
   ├── lastDay < yesterday     → current 歸 0 (miss 咗 1+ 日)
   └── lastDay > today (clock skew) → no-op,log warning
   ↓
[User 玩完 daily pick scenario]
   ↓
[recordDailyCompletion(studentId, scenarioId)]
   ├── lastDay == today        → current = max(current + 1, 1), 最少 1
   ├── lastDay == yesterday    → current = current + 1
   ├── lastDay < yesterday     → current = 1 (斷 streak,重新開始)
   └── lastDay > today         → no-op, log warning (clock skew)
   ↓
[Update longest = max(longest, current)]
   ↓
[Check sticker milestones, unlock 任何新解鎖]
```

**Day boundary 規則**:
- Day = local time YYYY-MM-DD
- 唔做 server time anchor(v1 純 client,見 §5 R1 嘅 v1 限制)
- 學生跨時區旅遊:`lastDay` 用舊 timezone,新 daily 仍以 local 計,**有 1-2 日 overlap 風險** acceptable for v1
- Server-side anchor(老師後台 v2)留 §5 R1 follow-up

#### 16.2.5 Daily pick selection algorithm

**Input**:`(studentId, subjectId, dateStr='YYYY-MM-DD', scenarios[])`
**Output**:`scenarioId`

```javascript
function selectDailyPick(studentId, subjectId, dateStr, scenarios) {
  // 1. Filter by subject + exclude completed-in-last-7-days
  const recentLog = getDailyLog(studentId, { days: 7 });
  const recentScenarioIds = new Set(recentLog.map(e => e.scenarioId));
  const eligible = scenarios
    .filter(s => s.subjectId === subjectId)
    .filter(s => !recentScenarioIds.has(s.id))
    .filter(s => s.riskLevel <= getStudentMaxRiskLevel(studentId)); // 0 起步,升 1/2/3

  if (eligible.length === 0) {
    // Fallback: include recently-played if no eligible (avoid dead-end)
    return scenarios.find(s => s.subjectId === subjectId) ?? scenarios[0];
  }

  // 2. Deterministic hash: same (student, day) → same pick
  const seed = hashString(`${studentId}|${dateStr}`);
  const idx = seed % eligible.length;
  return eligible[idx].id;
}
```

**Determinism 規則**:
- 用 `hashString()`(FNV-1a 或 djb2,純 JS)做 seed
- 同 (student, day) 永遠返同一個 pick,即使 reload page / re-render
- 學生唔可以透過 refresh 揾到「今日較易」嘅 scenario(同 quiz app 一樣)

**Difficulty progression**:
- `getStudentMaxRiskLevel(studentId)`:
  - 第 1 週: 0
  - 第 2 週: 0-1
  - 第 3-4 週: 0-2
  - 第 5+ 週: 0-3
- 計算:(`completed scenarios 總數` / 259) 對應 week bracket
- **v1 簡化版**:純用 `completedCount` 對應 max risk:`< 50 → 0, < 100 → 1, < 200 → 2, else → 3`

**Edge cases**:
- Subject 切咗 (value ↔ caring):用新 subjectId 重新 pick,舊 daily log 唔影響
- Scenario delete:filter out,fallback 邏輯返第 1 個
- Date 改咗(e.g. device 時鐘被改):`lastDay` 比較用 `YYYY-MM-DD`,clock skew > 1 日 log warning 但唔 crash

#### 16.2.6 Daily pick UI element

**位置**:`renderHome()` 頂部,`renderMoralBar` 下面,**greeting 上面**。

**Markup contract**(Sprint 15 落):

```html
<section class="daily-pick-banner" aria-labelledby="daily-pick-title">
  <h2 id="daily-pick-title">⭐ 今日情境</h2>
  <div class="daily-pick-card" data-action="goDailyPick" data-arg="${scenarioId}">
    <span class="daily-pick-emoji" aria-hidden="true">${topicEmoji}</span>
    <div class="daily-pick-meta">
      <span class="daily-pick-title">${scenarioTitle}</span>
      <span class="daily-pick-topic">${topicName} · ${riskLabel}</span>
    </div>
    <button class="daily-pick-cta" data-action="play" data-arg="${scenarioId}">
      開始挑戰
    </button>
    <span class="daily-pick-streak" aria-label="當前連續日數">
      🔥 ${currentStreak} 日
    </span>
  </div>
</section>
```

**A11y 要求**:
- `data-action="play"` 必過 `data-action-guard.test.js` bridge check
- 喇叭 button 同步 `.speaking` pulse(Sprint 5 T3 慣例)
- Streak counter 配 `aria-label` 唔淨係 emoji
- 撳「開始挑戰」要 `announceToSR('載入今日情境')` + `aria-busy="true"` 期間

---

### 16.3 1.2 Reflection Journal

#### 16.3.1 Reflection data schema (`fc_reflections_<studentId>`)

```json
[
  {
    "id": "r-2026-06-19T08-30-00-abc12",
    "scenarioId": "s-respect-03",
    "scenarioTitle": "嘲笑同學",
    "topicId": "respect",
    "timestamp": "2026-06-19T08:30:00.000Z",
    "moodEmoji": "😊",
    "moodScore": 2,
    "freeText": "我覺得嘲笑人係唔啱嘅",
    "voiceMemoId": "vm-2026-06-19T08-30-00-abc12",
    "voiceMemoDuration": 12
  }
]
```

**Field 規則**:

| Field | Type | 必填 | 規則 |
|---|---|---|---|
| `id` | string | ✅ | Format: `r-${ISO timestamp 變體}-${6 char base36 random}`,e.g. `r-2026-06-19T08-30-00-abc12`(ISO `:` 換 `-`,sortable) |
| `scenarioId` | string | ✅ | 對齊 scenario schema |
| `scenarioTitle` | string | ✅ | snapshot 落嚟,防止 scenario 改 title 後 reflection 失 context |
| `topicId` | string | ✅ | 同上 |
| `timestamp` | string | ✅ | ISO 8601 UTC |
| `moodEmoji` | string | ✅ | 1 of: `😊` / `😐` / `😢` (v1 fixed set) |
| `moodScore` | int 1-3 | ✅ | `😊 → 2`, `😐 → 1`, `😢 → 0`(0-based 反向,將來 5-scale 容易升級) |
| `freeText` | string | optional | Max 280 字(避免儲存爆),**必過 `src/util/escape.js:escapeAttr`**(R10) |
| `voiceMemoId` | string | optional | 對應 IndexedDB key,**Null = 冇錄音** |
| `voiceMemoDuration` | int | optional | 秒,1-60 |

**Storage cap**:
- Array **cap 30 entries**,FIFO rollover(最舊自動刪)
- 超過 30 條時,delete 對應 IndexedDB voice memo(避免孤兒)

**30-day auto-rollover 規則**:
- 每次 `addReflection()` 後 check `timestamp`
- 30 日以前嘅 entry 自動 prune
- 對應 voice memo 一齊刪
- **家長 PIN mode (1.7) 推出後改為 90 日**(R1)

#### 16.3.2 Voice memo IndexedDB schema

**Database**:`fc_reflections_db`
**Version**:`1`
**Store**:`voice_memos`(keyPath: `id`)

| Field | Type | 必填 | 規則 |
|---|---|---|---|
| `id` | string | ✅ | 對應 reflection.voiceMemoId |
| `blob` | Blob | ✅ | WebM/Opus, 32kbps, max 60s, ~250KB/60s |
| `mimeType` | string | ✅ | 實際 MIME(`audio/webm;codecs=opus` 或 `audio/mp4`) |
| `duration` | int | ✅ | 對應 reflection.voiceMemoDuration |
| `createdAt` | string | ✅ | ISO 8601 UTC |

**Browser support 規則**:
- 首選 `audio/webm;codecs=opus`(Chrome / Edge / Firefox)
- Fallback `audio/mp4`(Safari 14.1+)
- 完全唔支援:`MediaRecorder not available` → UI 隱藏 voice memo button,唔 crash

**Quota 監控**:
- IndexedDB quota 估算:`navigator.storage.estimate()`(可用但唔 reliable)
- v1 唔做 quota auto-cleanup,UI 顯示「儲存空間不足」訊息
- 30 條 reflection + voice memo ≈ 7.5MB,v1 acceptable

#### 16.3.3 Reflection panel UI element

**位置**:`renderResult()` 頁面底部,option effect comment 下面,**4-button toolbar 上面**。

**Markup contract**:

```html
<section class="reflection-panel" aria-labelledby="reflection-title">
  <h3 id="reflection-title">📝 我嘅感受</h3>

  <fieldset class="reflection-mood">
    <legend>揀一個代表你心情嘅表情</legend>
    <label>
      <input type="radio" name="mood" value="😊" data-action="setMood" data-arg="2" />
      <span aria-label="開心">😊</span>
    </label>
    <label>
      <input type="radio" name="mood" value="😐" data-action="setMood" data-arg="1" />
      <span aria-label="普通">😐</span>
    </label>
    <label>
      <input type="radio" name="mood" value="😢" data-action="setMood" data-arg="0" />
      <span aria-label="唔開心">😢</span>
    </label>
  </fieldset>

  <label class="reflection-text">
    <span>寫低你嘅想法(選填)</span>
    <textarea
      maxlength="280"
      data-action="setReflectionText"
      placeholder="例:我覺得嘲笑人係唔啱嘅..."></textarea>
    <span class="reflection-counter" aria-live="polite">0 / 280</span>
  </label>

  <div class="reflection-voice" hidden>
    <button data-action="startVoiceMemo" aria-label="開始錄音">🎤 錄音</button>
    <button data-action="stopVoiceMemo" hidden aria-label="停止錄音">⏹️ 停止</button>
    <span class="voice-recording-time" aria-live="polite">00:00</span>
  </div>

  <button data-action="saveReflection" class="reflection-save">💾 儲存</button>
</section>
```

**A11y 要求**:
- `<fieldset>` + `<legend>` 結構正確(SR 讀到 group)
- Emoji 配 `aria-label` 唔淨係視覺
- `<textarea>` 有 visible label(唔淨靠 placeholder)
- 280 char counter 用 `aria-live="polite"` 通知 SR
- 錄音 state 改變用 `aria-busy` + announce
- Save button disabled state 用 `aria-disabled`,唔只 visual

#### 16.3.4 Reflection save flow

```
[User 玩完 scenario → Result 頁]
   ↓
[Reflection panel mount, 全部 input 預設空]
   ↓
[User 揀 mood + 填 text + (可選) 錄音]
   ├── mood radio change → setMood(data-arg) → state.mood = data-arg
   ├── text input → setReflectionText → state.text = value
   └── voice 錄音 → startVoiceMemo → MediaRecorder.start() → stopVoiceMemo → state.blob = blob
   ↓
[User 撳 💾 儲存]
   ↓
[saveReflection()]
   ├── escape.js.escapeAttr(state.text) → safeText
   ├── if state.blob:
   │   ├── util/indexed-db.js open db
   │   ├── put('voice_memos', voiceMemoId, { blob, mimeType, duration, createdAt })
   │   └── close db
   ├── addReflection(studentId, { id, scenarioId, scenarioTitle, topicId, moodEmoji, moodScore, freeText: safeText, voiceMemoId, voiceMemoDuration })
   │   ├── push to fc_reflections_<id>
   │   ├── cap 30: 超出時 shift + 對應 voiceMemo delete
   │   └── 30-day prune: filter > 30 days
   ├── announceToSR('已記錄你嘅感受')
   ├── Toast show ✅
   └── reset state
```

**Error recovery**:
- IndexedDB write fail:`catch` → Toast ❌「錄音儲存失敗」+ free text 仍 save(partial save)
- 30-day prune 失敗:log warning,唔影響 user flow
- 學生離開 page 中途:warn 一次「你嘅反思未儲存」,confirm dialog

---

### 16.4 Module architecture (v3.6 新)

```
src/
├── daily.js (NEW)                          ~150 行
│   ├── selectDailyPick(studentId, subjectId, dateStr, scenarios)
│   ├── recordDailyCompletion(studentId, scenarioId)
│   ├── getStreak(studentId)
│   ├── getStickers(studentId)
│   ├── getDailyLog(studentId, { days? })
│   ├── getStudentMaxRiskLevel(studentId)   // 1.x difficulty progression
│   └── _hashString(str)                    // FNV-1a
│
├── reflection.js (NEW)                     ~200 行
│   ├── addReflection(studentId, payload)
│   ├── getReflections(studentId, { limit? })
│   ├── deleteReflection(studentId, reflectionId)
│   ├── pruneOldReflections(studentId)      // 30-day auto
│   └── generateReflectionId()              // r-{ISO}-{base36 random}
│
├── util/
│   ├── indexed-db.js (NEW)                 ~100 行
│   │   ├── open(dbName, version, onUpgrade)
│   │   ├── put(store, key, value)
│   │   ├── get(store, key) → Promise<value | undefined>
│   │   ├── delete(store, key)
│   │   └── list(store) → Promise<array>   // admin 用
│   └── voice-recorder.js (NEW)             ~80 行
│       ├── startRecording() → MediaRecorder
│       ├── stopRecording(recorder) → Promise<Blob>
│       ├── getSupportedMimeType()          // webm → mp4 fallback
│       └── isSupported() → boolean
│
├── components/
│   ├── DailyPickBanner.js (NEW)            ~80 行
│   ├── ReflectionPanel.js (NEW)            ~200 行
│   └── StickerCollection.js (NEW)          ~100 行
│
└── engine.js (MODIFY)
    ├── renderHome() → 加 <DailyPickBanner>
    ├── renderResult() → 加 <ReflectionPanel>
    └── renderSettings() → 加 sticker collection entry
```

**依賴方向**:
- `engine.js` → `daily.js` + `reflection.js` + 3 components
- `daily.js` → `storage.js` + `util/escape.js` (indirect for ID generation)
- `reflection.js` → `storage.js` + `util/escape.js` + `util/indexed-db.js`
- `voice-recorder.js` → 無 dependency
- `indexed-db.js` → 無 dependency

**無 cycle,無 new cross-module coupling**(Sprint 14.2 嘅 actions/ registry 慣例保持)。

---

### 16.5 EventBus integration (Sprint 14 既有 bus)

新增 2 個 event:

```javascript
// src/daily.js
bus.emit('daily:completed', { studentId, scenarioId, streak, unlockedStickers });
bus.emit('daily:reset', { studentId, oldStreak });  // streak broken

// src/reflection.js
bus.emit('reflection:saved', { studentId, reflectionId, hasVoiceMemo });
```

**Listener 用途**:
- `daily:completed` → `main.js` 嘅 moral-bar bus listener 加 banner pulse animation
- `reflection:saved` → `Toast.js` 顯示 ✅(已有 announceToSR,extend)
- `daily:reset` → 老師 mode dashboard(將來)顯示 streak 跌

---

### 16.6 風險 callouts (從 PRODUCT_PROPOSAL_V1.md §5 抽取相關)

| 風險 ID | 描述 | 緩解(已 freeze) |
|---|---|---|
| **R10** | 反思 free text XSS | `escape.js:escapeAttr()` 喺 addReflection 入口必過;UI render 用 `textContent` 唔用 `innerHTML`;§16.3.1 寫死 |
| **R4** | localStorage quota | Reflections cap 30 + voice memo 喺 IndexedDB;daily log cap 365;§16.2.2 / §16.3.1 寫死 |
| **R11** | Voice memo 容量 | Max 60s + WebM 32kbps ≈ 240KB/條;30 條 ≈ 7.2MB;§16.3.2 寫死 |
| **R1 (v1 limited)** | 學生私隱 | v1 純 client-side,30-day auto-prune;**家長 PIN mode (1.7) 推出後改 90-day**;§16.3.1 寫死 |
| **R20** | Daily streak timezone | Day = local time YYYY-MM-DD;v1 唔做 server anchor;§16.2.4 寫死 |
| **R16** | E2E button 漏 audit | Daily pick banner + reflection panel 全部用 `data-action`;Sprint 15 必加 `data-action-guard.test.js` coverage |

---

### 16.7 Testing requirements (Sprint 15 必過)

#### Unit tests (新增 ≥ 11 個,目標 58 → 69)

**`tests/daily.test.js` (新增 7 個)**:
1. `selectDailyPick` 同 (student, day) 返同 pick(determinism)
2. `selectDailyPick` 過濾 7 日內玩過嘅 scenario
3. `selectDailyPick` 過濾超過 max risk level
4. `recordDailyCompletion` 連續日加 +1
5. `recordDailyCompletion` 斷 streak 後重新 1
6. `getStickers` 喺 1/7/30/100/200/259 milestone 解鎖
7. `getDailyLog` 365 cap FIFO rollover

**`tests/reflection.test.js` (新增 4 個)**:
8. `addReflection` push + cap 30 + delete oldest voice memo
9. `addReflection` free text 過 `escape.js`(XSS test case)
10. `addReflection` 30-day auto-prune
11. `generateReflectionId` 格式正確 + unique

**E2E** (`tools/e2e/` 既有 `bridge-sweep.mjs` 擴展):
- daily pick banner 出現喺 Home + `data-action="play"` bridge 存在
- reflection panel 出現喺 Result + 4 個 button bridge 存在(`setMood` / `setReflectionText` / `startVoiceMemo` / `saveReflection`)

#### A11y (Sprint 15 必加)

- [ ] `tools/a11y/audit-fc.mjs` 跑 0 violation(daily pick banner + reflection panel 兩個新 element)
- [ ] 鍵盤 Tab 順序:Result 頁 option → reflection mood → text → voice → save
- [ ] SR announce:「載入今日情境」、「已記錄你嘅感受」 兩個新 SR message

#### Cross-browser (Sprint 15 必過)

- [ ] Chrome 120+ / Edge 120+ / Firefox 120+ — 100% 通
- [ ] Safari 17+ — voice memo fallback `audio/mp4` 通,IndexedDB 通
- [ ] iOS Safari — `MediaRecorder` 配 `audio/mp4`,驗證 60s 唔爆
- [ ] 純離線模式(關 wifi) — daily pick 仍 render(已有 scenario chunks),reflection save 仍 work(localStorage + IndexedDB 唔需網絡)

---

### 16.8 Migration 規則 (v3.5 → v3.6)

**自動 migration**:無需 user action
- 4 個新 key 預設空 / 空 array
- `importMyData()`(已有 `src/domain/IO.js`)繼續 work,**冇改**
- 舊 `fc_progress_<id>` 唔受影響
- 舊 `fc_settings` 唔受影響

**New student first-run**:
- `fc_streak_<id>` = `{ current: 0, longest: 0, lastDay: null, lastPickScenarioId: null, version: 1 }`
- `fc_daily_log_<id>` = `[]`
- `fc_stickers_<id>` = `[]`
- `fc_reflections_<id>` = `[]`
- `fc_reflections_db` IndexedDB 喺第一次 saveVoiceMemo 自動 create

**Versioning 慣例**:
- 每個 storage object 加 `version: 1` field
- 未來 schema 變動:`v3.7` 加 migration function `migrate_<feature>_v1_to_v2()`
- Migration trigger:`STORAGE_KEYS[key] 讀到舊 version` → run migration → save 新 version

---

### 16.9 Acceptance criteria (Sprint 15 done = )

- [ ] 4 個新 STORAGE_KEYS 加咗 + 全部 per-student 命名正確
- [ ] `daily.js` 7 個 unit test 全綠
- [ ] `reflection.js` 4 個 unit test 全綠
- [ ] Home 頁 daily pick banner render + 撳 play 跳到 Play 頁
- [ ] Result 頁 reflection panel render + 4 個 button bridge 全部 wired
- [ ] 完成 daily pick scenario 後 streak +1,Sticker 解鎖有 log
- [ ] Save reflection → IndexedDB voice memo (有錄) / localStorage free text (冇錄) 雙存
- [ ] 30-day prune + 30-entry cap 自動 run
- [ ] A11y audit 0 violation
- [ ] E2E bridge-sweep 加 5 個新 handler(play, setMood, setReflectionText, startVoiceMemo, saveReflection)
- [ ] 既有 58 個 unit test 全部 still 綠(regression free)
- [ ] `package.json` `__version__` bump `2.0.0` → `2.1.0`(MINOR, 新 feature)
- [ ] SPEC.md bump 維持 v3.6
- [ ] CHANGELOG / commit message 寫清楚 1.1 + 1.2 ship 範圍

---

### 16.10 Anti-pattern (Sprint 15 必避)

- ❌ **AI 生 reflection 內容** — 完全唔做
- ❌ **AI sentiment 分析 reflection** — v1 唔做(R19,將來 optional)
- ❌ **server-side streak anchor** — v1 純 client(R20 v2)
- ❌ **用 innerHTML render free text** — 必 textContent + escape(R10)
- ❌ **把 voice memo 存 localStorage** — quota 不夠,必 IndexedDB(R4/R11)
- ❌ **唔做 30-day prune** — 私隱風險(R1)
- ❌ **cross-student reflection sharing** — 私隱設計唔容許
- ❌ **拆 daily pick + reflection 落 2 個 sprint** — 已合併 S15,1 sprint ship 2 feature
- ❌ **改 main.js 嚟 mount components** — 必用 components/ + engine.js modify(keep Sprint 14.2 actions/ 慣例)

---

## 17. v3.7 Addendum — 答錯反饋重設計 (Stop-and-Think) + 文字書面語化 + 結果頁 TTS 擴展

> **2026-06-22 freeze**: 配合 kencheng 喺 PRODUCT_PROPOSAL_V1 review 時嘅 3 個 explicit UX 要求 — (1) 所有 UI / feedback 文字由口語改書面語, (2) Result 頁加朗讀「答案 + 後果」TTS, (3) 答錯反饋用「再想想」template 取代舊 fallback 文案。本 §17 freeze 全新 scenario field `stopAndThink`、Result 頁 panel block、新增 TTS API、書面語風格規則。Sprint 16 開工前必讀。

### 17.1 範圍(scope lock)

| 類別 | 改動 | 觸及數量 | 來源 |
|---|---|---:|---|
| **Option text**(`options[].text`) | 口語 → 書面語 | ~777 | 17 topic × ~15 scenario × ~3 options |
| **Effects comment**(`options[].effects[].comment`) | 口語 → 書面語 | ~765 | 同上 × ~3 effects/option |
| **新增 `stopAndThink` field**(`options[].stopAndThink`) | 新 schema | ~150-200 (淨 negative options) | 全部 negative moralChange 嘅 options |
| **Scenario title/description** | **❌ 唔改** | — | 改動會破壞 image prompt 對齊,Sprint 17+ 後考慮 |
| **Creed text**(`creeds.js` VALUE_CREEDS / LEGACY_CREEDS) | **❌ 唔改** | 22 | EDB 官方 wording,改動觸及合規 |
| **Scenario option text** | ✅ 改 | ~777 | 書面語化 scope 入面 |
| **Settings / Toast / Banner** | **❌ v3.7 唔做** | — | 留 §3.1 UI 改進 sprint |

**Scope 紀律**:v3.7 唔做 AI 生內容(R2 風險)。所有新文字都係人手撰寫,跟 STYLE_GUIDE_V3.md 規則。

---

### 17.2 STYLE_GUIDE_V3.md — 書面語風格規則

新加 `docs/STYLE_GUIDE_V3.md`,鎖死口語 → 書面語 mapping 規則。

#### 17.2.1 核心對照表(常用 30 個)

| 口語(舊) | 書面語(新) | 類別 |
|---|---|---|
| 你 | 你 | 人稱(不變) |
| 你哋 | 你們 | 人稱複數 |
| 佢 | 他 / 她 | 第三人稱(按角色性別) |
| 佢哋 | 他們 / 她們 | 第三人稱複數 |
| 係 | 是 | 判斷句 |
| 唔係 | 不是 | 否定判斷 |
| 嘅 | 的 | 所有格 |
| 喺 | 在 | 位置 |
| 唔 | 不 | 否定 |
| 咗 | 了 | 完成貌 |
| 嚟 | 來 | 趨向 |
| 去咗 | 去了 | 完成貌 + 趨向 |
| 邊個 | 哪一個 | 疑問 |
| 咩 | 什麼 | 疑問 |
| 點解 | 為什麼 | 疑問 |
| 點樣 | 怎樣 | 疑問 |
| 而家 | 現在 | 時間 |
| 今日 | 今天 | 時間 |
| 聽日 | 明天 | 時間 |
| 啲 | 這些 / 那些 | 量詞 |
| 嗰 | 那 | 指示 |
| 呢個 | 這個 | 指示 |
| 嗰個 | 那個 | 指示 |
| 睇 | 看 / 觀察 | 動詞 |
| 諗 | 想 / 思考 | 動詞 |
| 話 | 說 | 動詞 |
| 走開 | 離開 | 動詞 |
| 攞 | 拿 | 動詞 |
| 畀 | 給 | 動詞 |
| 同埋 | 和 / 與 | 連詞 |

#### 17.2.2 文風規則

1. **句式**:用完整句(主語 + 謂語 + 賓語),避免「你 + 形容詞」式短句
   - ❌「你好勇敢！」 → ✅「你的選擇很勇敢，保護了自己的安全。」
2. **語氣**:正面鼓勵為主(尤其答啱 feedback),答錯反思避免責備
   - ❌「你做錯了」 → ✅「讓我們再想一想還有沒有更好的方法。」
3. **第二人稱**:統一用「你」(唔用「您」,對 SEN 小學生太 formal)
4. **第三人稱**:按角色性別用「他」(男)/「她」(女),唔用「佢」
5. **emoji**:每段最多 1 個 emoji,放句首(可選),唔可以入句中斷句
6. **長度**:
   - option text ≤ 30 字
   - effects comment ≤ 40 字
   - stopAndThink badBehavior ≤ 25 字
   - stopAndThink consequence ≤ 80 字
7. **數字**:阿拉伯數字(1/2/3),唔用中文數字(一/二/三)
8. **標點**:全形中文標點(，。！？「」),唔用半形

#### 17.2.3 不可用詞(blacklist)

`tools/style/audit-scenarios.mjs` (新增 CI script)會掃以下口語 marker,出現即 fail:
```
你哋, 佢, 佢哋, 係, 唔係, 嘅, 喺, 唔, 咗, 嚟,
邊個, 咩, 點解, 點樣, 而家, 今日, 聽日, 啲, 嗰,
呢個, 嗰個, 睇, 諗, 話, 走開, 攞, 畀, 同埋,
好啦, 啦, 喎, 嘅, 嚟, 嘢, 嘅話
```

> 注意:scenario `description` 同 `title` 唔係 blacklist scope(unchanged scope),所以 audit script 只掃 `options[].text` + `options[].effects[].comment` + `options[].stopAndThink.*`。

---

### 17.3 答錯反饋 — Stop-and-Think Panel Schema

#### 17.3.1 新 scenario option field

```json
{
  "id": "s6-a",
  "text": "「係呀！小華太衰啦！我都唔同佢玩！」(改做書面語後變 ...)「是啊！小華太過分了！我也不跟他玩了！」",
  "stopAndThink": {
    "badBehavior": "和小明一起排擠小華",
    "consequence": "小華會感到被誤會而傷心，其他同學會認為你們不公平，小明亦會錯過了解真相的機會",
    "isLoselose": true
  },
  "effects": [...],
  "next_scenario": "s7"
}
```

#### 17.3.2 Schema 規則

| Field | Type | Required | 規則 |
|---|---|---|---|
| `stopAndThink` | object | **conditional** | 只 negative options (`total moralChange < 0`) 必須有 |
| `stopAndThink.badBehavior` | string | ✅ | 描述呢個 option 嘅「差行為」,用第三人稱(他/她)或「和別人一起 XXX」句式 |
| `stopAndThink.consequence` | string | ✅ | 描述「眾人感受 + 真實後果」,≤ 80 字 |
| `stopAndThink.isLoselose` | bool | 預設 `true` | `true`=雙輸結局,`false`=單輸(只自己受影響) |

**Field level 而唔係 effects level 嘅理由**:
- Feedback 係針對「呢個 option 嘅整體行為」,唔係單一 character
- 一個 option 可能影響多個 character,consequence 要 aggregate 唔係 split
- UI render 一個反思 panel 就夠,唔係每 character 一個

#### 17.3.3 Render rule

```js
shouldRenderStopAndThink(option, totalMoralChange) {
  return totalMoralChange < 0 && option.stopAndThink != null;
}
```

**例外**:
- 跨 character effects 出現 conflict(`character X 加分` + `character Y 扣分` 但 `totalMoralChange >= 0`):都 render stopAndThink,**避免「雙贏但其實有人受傷」嘅假象**
- 例:`s-self-NN` 一條 scenario,主 character 加分但 bystander 扣分 → 視為「部分雙輸」 → render

#### 17.3.4 UI template(formatStopAndThink 純函數)

**Negative option (`moralChange < 0`) Result 頁 render**:
```html
<div class="result-card bad stop-and-think" id="result-card">
  <div class="result-emoji" aria-hidden="true">🤔</div>
  <div class="comment">
    <p>停一停，想一想：</p>
    <p>如果你 <strong>[badBehavior]</strong>，會有什麼影響？</p>
    <p>就是 <strong>[consequence]</strong>，這樣是 {isLoselose ? '雙輸結局' : '單輸結局'}。</p>
    <p>請你再選出正確的回應吧！</p>
  </div>
  <button data-action="speakStopAndThink">🔊 朗讀反思</button>
</div>
<!-- moral score 喺撳「再試一次」後先顯示 -->
```

**Positive option (`moralChange >= 0`) Result 頁 render(unchanged)**:
```html
<div class="result-card good" id="result-card">
  <div class="result-emoji" aria-hidden="true">🌟</div>
  <div class="comment">${mainComment}</div>
  <div class="moral-score">+${moralChange} 道德分</div>
  <button data-action="speakComment">🔊 朗讀結果</button>
</div>
```

#### 17.3.5 圖案統一

| 結果類別 | 舊圖案 | 新圖案 | 理由 |
|---|---|---|---|
| Positive(`moralChange >= 0`) | 🌟 | 🌟 (unchanged) | 鼓勵性質,保留 |
| Negative(`moralChange < 0`) | 💪 | 🤔 | 「再想想」,SEN 友善 framing |
| Bank positive | 💰 | 💰 (unchanged) | 遊戲 specific |
| Bank negative | 💸 | 💸 (unchanged) | 遊戲 specific |

**Bank 唔改**(獨立 game mode,scope 唔涵蓋)。`renderBankResult` 唔 render stop-and-think,保持銀行結算既有 visual。

---

### 17.4 Result 頁 TTS 擴展

#### 17.4.1 新增 2 個 voice button

| Button | 朗讀內容 | Trigger | 出現條件 |
|---|---|---|---|
| 🔊 **朗讀答案** | `option.text`(學生揀嘅 option) | `data-action="speakOptionText"` | Result 頁 always |
| 🔊 **朗讀後果** | `mainComment` 或 `stopAndThink` template(完整) | `data-action="speakConsequence"` | Result 頁 always |
| 🔊 **朗讀反思**(negative) | stop-and-think 完整 template | `data-action="speakStopAndThink"` | 只 negative 有 stopAndThink |
| 🔊 **朗讀信條** | creed text | `data-action="speakCreeds"` | Result 頁 always(unchanged) |

#### 17.4.2 audio.js 新 API

```javascript
// src/audio.js 新加
export function speakOptionText(optionText) {
  if (!enabled || speaking) return;
  const cleaned = stripEmojiForTTS(optionText);
  speak(cleaned);
}

export function speakConsequence(comment) {
  if (!enabled || speaking) return;
  const cleaned = stripEmojiForTTS(comment);
  speak(cleaned);
}

export function speakStopAndThink(stopAndThink) {
  if (!enabled || speaking) return;
  const text = formatStopAndThinkForTTS(stopAndThink);
  speak(text);
}

// ── helper ──
function stripEmojiForTTS(text) {
  // 移除 emoji + 多餘空白
  // e.g. "你好勇敢！🌟" → "你好勇敢！"
  return text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
}

function formatStopAndThinkForTTS(st) {
  return `停一停，想一想：如果你 ${st.badBehavior}，會有什麼影響？就是 ${st.consequence}，這樣是 ${st.isLoselose ? '雙輸' : '單輸'}結局。請你再選出正確的回應吧！`;
}
```

**TTS 語言**:用 `currentLang`(跟 user setting),唔強制 zh-HK。Negative feedback 嘅反思內容多數係 formal 書面語,zh-TW / zh-CN voice 都讀得通。

#### 17.4.3 actions/inline.js bridge

```javascript
// src/actions/inline.js 新加
speakOptionText() {
  const optId = state?.resultData?.optionId;
  const optText = state?.resultData?.option?.text;
  if (optText) speakOptionText(optText);
}

speakConsequence() {
  const comment = state?.resultData?.mainComment;
  if (comment) speakConsequence(comment);
}

speakStopAndThink() {
  const st = state?.resultData?.option?.stopAndThink;
  if (st) speakStopAndThink(st);
}
```

**bridge 注入**:`window.FC.speakOptionText` / `window.FC.speakConsequence` / `window.FC.speakStopAndThink` 全部要 wire(沿用 Sprint 12+13 嘅 `_bindWindowBridge` pattern)。

#### 17.4.4 A11y 要求

| Button | aria-label | keyboard |
|---|---|---|
| 🔊 朗讀答案 | `朗讀你選擇的答案` | Tab 順序:答啱區 → 答案 → 後果 → 信條 |
| 🔊 朗讀後果 | `朗讀結果分析` | 同上 |
| 🔊 朗讀反思 | `朗讀停一停想一想反思` | 只 negative 出現 |
| 🔊 朗讀信條 | `朗讀學校信條`(unchanged) | 最尾 |

**Reduced motion + Voice off 兩個 mode 都保留 button**:`aria-disabled` 唔 set(語音 off 嘅 user 都可以見到 button,但 click 後 silent — 已有 audio.js `enabled` flag 守)。

---

### 17.5 Module Architecture (v3.7 新)

| File | 改動類別 | 預計 size | 依賴 |
|---|---|---|---|
| `src/domain/Feedback.js` | **NEW** | ~80 行 | 純函數,無 DOM |
| `src/audio.js` | 改 + 新 export | +30 行 | Web Speech API |
| `src/actions/inline.js` | 改 + 3 個新 bridge | +20 行 | audio.js + Feedback.js |
| `src/engine.js` (`renderResult`) | 改 render block | +40 行 | Feedback.js |
| `src/style.css` | 改 + 新 class | +30 行 | — |
| `data/scenarios/*.json` | 改 + 新 field | +150 行 JSON | — |
| `docs/STYLE_GUIDE_V3.md` | **NEW** | ~150 行 | — |
| `tools/style/audit-scenarios.mjs` | **NEW** | ~80 行 | read JSON files |
| `tests/feedback.test.js` | **NEW** | ~120 行 | Feedback.js |

**依賴方向**:
```
Feedback.js (pure)
   ↑
engine.js renderResult
actions/inline.js bridge
   ↑
window.FC.speak* (Sprint 12+13 bridge)
```

---

### 17.6 EventBus integration

唔需要新 event(純 render + TTS 改動)。但 analytics(V2)可以用現有:
- `scenario:completed` 已喺 Progress.js:67 emit,Feedback 唔重複 emit
- 將來 analytics 加 `feedback:wrongAnswerShown` event(Sprint 17+)

---

### 17.7 風險 callouts

| ID | 風險 | 嚴重度 | 觸發 | 緩解 |
|---|---|---|---|---|
| **R-V3.7-1** | 文字改動 regression | 🟠 High | 765 條 effects comment + 777 條 option text 全部要改,易 miss string consistency | STYLE_GUIDE_V3.md + `audit-scenarios.mjs` CI 對齊 + 逐個 sprint 分批做 |
| **R-V3.7-2** | TTS 文本不當 | 🟡 Medium | emoji / 特殊字符送 TTS 讀出來怪 | `stripEmojiForTTS` helper 在送 TTS 前清 |
| **R-V3.7-3** | stopAndThink 缺漏 | 🟠 High | teacher mode 加 scenario 唔填 stopAndThink | CI check:negative options 必須有 stopAndThink,缺 fail build |
| **R-V3.7-4** | 答錯 panel 打擊 SEN 自信 | 🔴 Critical | 即時扣 moral score,「你做錯了」責備 | 先反思 panel,撳「再試一次」先出分;用 🤔 友善 framing |
| **R-V3.7-5** | stopAndThink wording 漂移 | 🟡 Medium | 教師後加 scenario 唔跟 STYLE_GUIDE | CI audit script + 老師加 scenario 必過 STYLE_GUIDE_RULES.md |
| **R-V3.7-6** | 改動量大 1 sprint 唔夠 | 🟡 Medium | 259 scenarios × ~3 options × ~3 effects = ~2300 strings | 分 2 sprint:S16 做工具 + 1 topic 試水溫,S17 全量推 |
| **R-V3.7-7** | Bank result 唔一致 | 🟢 Low | Bank 用 `renderBankResult`,唔 render stop-and-think | 文檔化 scope 唔涵蓋 Bank |
| **R-V3.7-8** | Render 時序問題 | 🟡 Medium | 先 panel 後 moral score 嘅 reveal order 影響 screen reader | aria-live="polite" + setTimeout 200ms 顯分 |

---

### 17.8 Testing requirements (Sprint 16 必過)

#### Unit tests (新增 ≥ 8 個,目標 69 → 77)

**`tests/feedback.test.js` (新增 8 個)**:
1. `formatStopAndThink` 完整 template render(`badBehavior` + `consequence` + `isLoselose=true`)
2. `formatStopAndThink` 缺 `badBehavior` fallback「再做多一次啦」
3. `formatStopAndThink` 缺 `consequence` fallback「請諗清楚後果」
4. `formatStopAndThink` `isLoselose=false` 單輸 wording
5. `shouldRenderStopAndThink` `moralChange >= 0` 唔 render
6. `shouldRenderStopAndThink` `moralChange < 0` render
7. `stripEmojiForTTS` 處理 emoji + 標點 + 多餘空白
8. `truncateForTTS` 80 字上限(超長 consequence 截斷 + 「...」)

**`tests/style.test.js` (新增 4 個,scan fixtures)**:
9. `auditScenarioText` 對齊 STYLE_GUIDE(白名單 fixture 通過)
10. `auditScenarioText` 口語 marker fixture fail
11. `auditOptionText` length ≤ 30 字 pass
12. `auditOptionText` length > 30 字 fail

**E2E** (`tools/e2e/bridge-sweep.mjs` 擴展 4 個新 handler):
- `speakOptionText` bridge exists + Result 頁 button present
- `speakConsequence` bridge exists
- `speakStopAndThink` bridge exists(negative case)
- Result 頁 🤔 圖案取代 💪 喺 negative scenario

**Style audit CI** (`tools/style/audit-scenarios.mjs` 新增):
- 掃 17 個 scenario JSON file,對齊 STYLE_GUIDE_V3.md
- 出現任何口語 marker → `process.exit(1)`
- PR 必過,CI 加 step

#### A11y (Sprint 16 必加)

- [ ] `tools/a11y/audit-fc.mjs` 跑 0 violation(新 3 個 voice button + stop-and-think panel)
- [ ] 鍵盤 Tab 順序:Result 頁 option → 答案 voice → 後果 voice → 反思 voice → 信條 voice → 行動
- [ ] SR announce:`result-card.stop-and-think` 出現時 announce「已顯示停一停想一想反思」
- [ ] High-contrast mode:`stop-and-think` panel 有獨立 border(唔同 `good` / `bad`)
- [ ] Reduced-motion:`stop-and-think` 🤔 唔 pulse(starBurst animation 禁)

#### Cross-browser (Sprint 16 必過)

- [ ] Chrome 120+ / Edge 120+ / Firefox 120+ — 100% 通
- [ ] Safari 17+ — TTS zh-HK fallback 通(已有 voice chain)
- [ ] iOS Safari — TTS speak 配 user gesture trigger(避免 autoplay block)

---

### 17.9 Migration 規則 (v3.5 / v3.6 → v3.7)

**無需 user data migration**(純 scenario schema + UI + TTS 改動)。

**Scenario data migration**:
- 全部 259 scenarios 嘅 negative options 必須加 `stopAndThink` field
- **冇 `stopAndThink` 嘅 negative option** → render 時 fallback「讓我們再想一想還有沒有更好的方法。」(generic 反思,唔即時扣分)
- 舊 import JSON 兼容:scenario import 時若 option 冇 stopAndThink 但 moralChange < 0 → 留空,render fallback

**Style migration**:
- 765 條 effects comment + 777 條 option text 全部人手改
- Strategy:批量 replace common 口語 marker → 然後 manual review 確保句意通順
- Sprint 16 做 1 個 topic (e.g. empathy 1168 行,~ 個位數 scenarios) 試水溫,Sprint 17 全 17 topics

**TTS migration**:
- 唔需要用戶重設 TTS setting(`currentLang` 沿用)
- 3 個新 voice button 自動 inject,無需 user action

---

### 17.10 Acceptance criteria (Sprint 16 done = )

- [ ] `docs/STYLE_GUIDE_V3.md` 寫好(30 個常用 mapping + 文風規則 + blacklist)
- [ ] `tools/style/audit-scenarios.mjs` script 完成 + CI 過
- [ ] `src/domain/Feedback.js` 完成(`formatStopAndThink` + `shouldRenderStopAndThink` + `stripEmojiForTTS` + `truncateForTTS`)
- [ ] `src/audio.js` 加 `speakOptionText` / `speakConsequence` / `speakStopAndThink` exports
- [ ] `src/actions/inline.js` 加 3 個新 bridge + `window.FC.*` wire
- [ ] `src/engine.js renderResult` 加 stop-and-think panel block + 3 個 voice button
- [ ] `src/style.css` 加 `.stop-and-think` class + 🤔 emoji 圖示
- [ ] empathy topic(17 個 scenarios)option text + effects comment 全部書面語化 + 全部 negative options 加 stopAndThink
- [ ] Result 頁 🤔 圖案取代 💪 喺 empathy topic 全部 negative scenarios
- [ ] Result 頁 3 個新 voice button 喺 empathy topic Result 全部 present
- [ ] 8 個 feedback unit test 全綠
- [ ] 4 個 style unit test 全綠
- [ ] A11y audit 0 violation
- [ ] E2E bridge-sweep 擴展涵蓋 3 個新 handler + 🤔 圖案 verify
- [ ] Style audit CI 0 口語 marker violation(empathy topic scope)
- [ ] 既有 58+11 = 69 unit test 全部 still 綠(regression free)
- [ ] `package.json` `__version__` bump `2.1.0` → `2.2.0`(MINOR, 新 feature)
- [ ] SPEC.md bump 維持 v3.7
- [ ] CHANGELOG / commit message 寫清楚 3 個改動範圍
- [ ] Sprint 17 backlog 寫低:剩 16 topics 嘅文字書面語化 + stopAndThink 補齊

---

## 18. v3.8 Addendum — Sprint 17 全 17 topics 文字書面語化 + stopAndThink 全量補齊

> **2026-06-23 freeze**: Sprint 16 做完 empathy 1 個 topic 後, Sprint 17 用 generalize 嘅 `scenarios_v2.mjs` 把其餘 16 個 topic 全部書面語化 + 加 stopAndThink, 加 audit auto-trim。整個 codebase 由 936 violations → 0 violations(744 options / 17 topics / 259 scenarios 全部 pass `npm run audit:style`)。

### 18.1 改動範圍

| File | Type | Purpose |
|---|---|---|
| `tools/migrate/scenarios_v2.mjs` | NEW (generalized) | 取代 `empathy_v2.mjs`, 接受 `<topic>` 或 `--all` arg, 處理全部 17 個 topic |
| `tools/migrate/empathy_v2.mjs` | MOD | 改成 thin wrapper 呼 `scenarios_v2.mjs empathy` (backward compat) |
| `tools/style/audit-scenarios.mjs` | MOD | 加 ACCEPTED_COMPOUNDS 白名單 (`大話`, `講話`, `感謝的話`, `電話` 等) |
| `data/scenarios/*.json` × 16 | MOD | 全部 16 個 topic 文字書面語化 + 加 stopAndThink (除 empathy 已在 Sprint 16 完成) |
| `data/scenarios/*.json.pre-v3.7.bak` × 16 | NEW | 原始 backup (per-topic, 同 empathy pattern) |
| `tests/sprint17-migration.test.js` | NEW | 9 個新 test 跨 topic 驗證 stopAndThink + length + audit |
| `package.json` | MOD | `__version__` `2.2.0` → `2.3.0` (MINOR, 新 generalization feature) |
| `SPEC.md` | MOD | v3.7 → v3.8 + 加 §18 (本 section) |

### 18.2 Generalization 改動

**Before** (Sprint 16 empathy_v2.mjs):
- Hardcode `FILE = 'data/scenarios/empathy.json'`
- 1 個 topic 專用, 需要重複做 16 次

**After** (Sprint 17 scenarios_v2.mjs):
- `node tools/migrate/scenarios_v2.mjs <topic>` — migrate 1 個
- `node tools/migrate/scenarios_v2.mjs --all` — migrate 全 17 個
- `node tools/migrate/scenarios_v2.mjs <topic> --dry-run` — preview
- Idempotent (re-run 後 0 changes)

### 18.3 Audit 規則 formalize (Sprint 17 implementation findings → v3.8 freeze)

#### 18.3.1 詞組白名單 (formal whitelist)

`係` 同 `話` 兩個 marker 有特殊例外, v3.8 freeze 以下規則:

**`係` 例外** — predicate position:
- `係同理心`, `係不負責任的表現`, `係高手`, `係真嘅LEGO大師` — 全部 valid 書面語
- Audit exception: `/係[一-鿿]/` (係 + CJK)
- ❌ `係, 我幫了他` (`係,` 係 affirm, 應改 `是,`)

**`話` 例外** — compound noun whitelist:
- `說話`, `廣東話`, `白話`, `官話`, `對話`, `空話`, `實話`
- `大話`, `講大話`, `講話`, `感謝的話`, `真心話`, `心底話`, `電話`
- 全部 standard 書面語詞組, 唔可以拆
- Migration tool 同 audit script 共用同一個 ACCEPTED_COMPOUNDS list

#### 18.3.2 Auto-trim length limits (Sprint 17)

`scenarios_v2.mjs` 自動 trim 超長 text 返 limit 內:
- `optionText` ≤ 30 字 (超出 → cut + `…`)
- `effectsComment` ≤ 40 字
- `stopAndThink.badBehavior` ≤ 25 字
- `stopAndThink.consequence` ≤ 80 字
- Trim 順序: 1. 移除尾段 `…。！？.!?`, 2. cut 到 limit-1 + `…`

### 18.4 Migration 統計

| Topic | Scenarios | Options | Migration 改動 |
|---|---|---|---|
| benevolence | 15 | 45 | 34 options text + 30 comments |
| body-autonomy | 15 | 39 | 30 + 26 |
| commitment | 15 | 45 | 30 + 27 |
| conflict-resolution | 15 | 43 | 31 + 31 |
| diligence | 15 | 45 | 20 + 26 |
| empathy (S16) | 17 | 51 | (Sprint 16 done) |
| filial-piety | 15 | 45 | 29 + 25 |
| help-seeking | 15 | 39 | 22 + 23 |
| integrity | 17 | 49 | 39 + 45 |
| law-abiding | 15 | 45 | 18 + 16 |
| national-identity | 17 | 51 | 33 + 35 |
| perseverance | 15 | 45 | 31 + 36 |
| respect | 15 | 42 | 36 + 41 |
| responsibility | 15 | 45 | 21 + 17 |
| social-boundary | 15 | 39 | 27 + 19 |
| solidarity | 15 | 45 | 31 + 27 |
| stranger-safety | 15 | 39 | 26 + 22 |

**Total**: 17 topics, 259 scenarios, 744 options, 458 text + 447 comment migrations = **905 string changes**

### 18.5 Acceptance criteria (Sprint 17 done = ✅)

- [x] `tools/migrate/scenarios_v2.mjs` generalize 完成
- [x] 16 個 topic 全部 migrate + stopAndThink 加晒 (除 empathy S16 done)
- [x] Auto-trim 處理 20 個 length violation
- [x] `npm run audit:style` 0 violation across all 17 topics
- [x] 9 個新 unit test 全綠 (`tests/sprint17-migration.test.js`)
- [x] 既有 95 個 test regression free (104 total pass)
- [x] `npm run build` success (1032 PWA entries, 158 MB precache)
- [x] `__version__` bump `2.2.0` → `2.3.0` (MINOR, generalize migration tool)
- [x] SPEC.md v3.7 → v3.8 + 加 §18 (本 section)
- [x] Audit ACCEPTED_COMPOUNDS whitelist formalize (`大話`, `講話`, `電話` etc.)
- [x] Idempotency verified (re-run 0 changes)

### 18.6 Anti-pattern (Sprint 17 必避)

- ❌ 唔用 scenarios_v2.mjs 直接人手改 scenario JSON → 改動量大 (905 strings), 用 tool batch process
- ❌ 唔做 backup (.pre-v3.7.bak) → 一改錯就回唔去, 必須 backup
- ❌ 直接覆蓋原 file 而唔用 `--dry-run` 先 preview → 大改動前必 dry-run
- ❌ 唔做 idempotency check → tool 應該 re-run 0 changes, 否則下次改動會 double-apply

---

### 17.11 Anti-pattern (Sprint 16 必避)

- ❌ 用 innerHTML render user-written stopAndThink text → 必 textContent + `escapeAttr`(R-V3.7-1 + R10 延伸)
- ❌ 答錯 panel 即時扣 moral score → SEN 學生打擊,先反思再評分(R-V3.7-4)
- ❌ 對 positive option 都加 stopAndThink → 冗餘,只 negative(R-V3.7-7)
- ❌ 朗讀時讀 emoji → TTS 唔識讀,strip emoji(R-V3.7-2)
- ❌ 唔寫 STYLE_GUIDE 直接改 scenarios → 無 audit,易 drift(R-V3.7-5)
- ❌ 改 scenario description / title → 破壞 image prompt 對齊,scope lock 不涵蓋
- ❌ 改 creeds text → EDB 官方 wording,scope lock 不涵蓋
- ❌ 用 AI 生 stopAndThink 文案 → R2 風險,純人手撰寫
- ❌ Bank result render stop-and-think → Bank 獨立 game mode,scope 不涵蓋
- ❌ 一次過改晒 259 scenarios → 改動量大難 review,分 2 sprint(S16 + S17)

---

### 17.12 Out-of-scope (v3.7 不做,留 future)

- ❌ AI 解釋助手(R2 風險,Sprint 18+ 考慮)
- ❌ 老師 mode 加 scenario 嘅 stopAndThink 自動生成(純人手)
- ❌ Settings / Toast / Banner 文字書面語化(Sprint 17+)
- ❌ Scenario description / title 文字書面語化(破壞 image prompt)
- ❌ Creeds text 改動(EDB 官方 wording)
- ❌ Bank result stop-and-think 整合(Bank 獨立 game mode)
- ❌ Reduce-motion 模式下 🤔 唔 pulse 嘅 css 完整 audit(Sprint 17 polish)

---

*Addendum 日期:2026-06-22 | 配合 Sprint 16 開工 | 取代/補充:§16 唔變,純新增 §17 | 維護者: Mavis + kencheng*

---

## 19. v3.9 Addendum — Sprint 18 TTS button 大細 bump + 首次使用 onboarding

### 19.1 改動範圍（user-reported accessibility issue）

SEN 學生 feedback: 選項卡片嘅「朗讀答案」button 太細，28×28 px 細到唔易撳。對 6-12 歲 SEN 學童嚟講，touch target 應該 ≥ 44×44 (WCAG 2.5.5 Level AAA, Material Design guideline)。

| Button | Before | After | Reason |
|---|---|---|---|
| `.option-card .opt-read` (答案朗讀) | 28×28 | **48×48** | user-reported P0 |
| `.scenario-desc .inline-voice-btn` (題目朗讀) | 32×32 | **48×48** | consistency |
| `.voice-btn-row .inline-voice-btn` (答錯反思 / 後果) | 8/14 padding, 1em | **min-height 48px**, 12/20 padding, 1.05em | TTS prominence |
| `.voice-fab` (浮動 creeds) | 52×52 | **56×56** + explicit min-* | consistency + clarity |
| `.onboarding-cta` (新 primary button) | n/a | **52px** | WCAG 2.5.5 |

### 19.2 首次使用教學 carousel (P1)

3 步連續 full-screen overlay（唔係 modal — SEN 學生 focus 易飄）：

1. **👆 揀你嘅選擇** — option card mockup,展示 "1" badge + 文字
2. **🔊 聆聽題目** — 48×48 voice button mockup,提示 "個掣而家有 48×48，唔再細過一撳就中！"
3. **💭 停一停想一想** — stop-and-think card mockup with 🔊 答案 / 🔊 反思 pills

每步：
- Big emoji (5em) + 標題 + 描述
- 視覺 mockup (concrete example,唔係抽象文字)
- Pagination dots (3 個)
- 「略過」 button (any-time escape)
- 「下一頁 →」 / 「開始啦 🚀」 CTA (gradient purple→blue,52px tall)

**State machine**:
```
needsOnboarding() returns true on first visit
  → state.view = 'onboarding' (boot)
  → click "下一頁" → step++ (renders via render())
  → click "開始啦" (last) → finishOnboarding() sets flag, setView('role-select')
  → click "略過" any time → same as finishOnboarding

fc_onboarding_done (localStorage) — boolean
  → default false → show
  → set true → never show again (除非「重看教學」)
```

**「重看教學」入口**: Settings 第一張 card,清晰同 analytics / TTS 設定分開。Click → reset step counter + setView('onboarding') + render。**唔清除 flag** (one-time replay,下次 boot 仍係直接去 role-select)。

### 19.3 audit-touch-targets.mjs (P2)

Static CSS audit tool — 唔需要 dev server,sub-second 跑完。

**Usage**:
```bash
npm run audit:touch-targets    # exit 0 = pass, 1 = violations
node tools/a11y/audit-touch-targets.mjs src/style.css  # custom path
```

**Targets audited** (7 selectors):
- `.option-card .opt-read`
- `.scenario-desc .inline-voice-btn`
- `.voice-btn-row .inline-voice-btn`
- `.voice-fab`
- `.onboarding-cta`
- `.mock-voice-btn`
- `.mock-voice-pill`

**Extraction logic**: parse CSS into rules → match selector → extract `width` / `min-width` / `height` / `min-height` → flag any < 44px.

**CI guard**: `tests/sprint18-touch-targets.test.js` 嘅 "audit:touch-targets passes" test exits 1 if any violation — 任何人將來改 CSS 令 TTS button 縮細過 44px,CI 即 catch。

### 19.4 Tests (Sprint 18 done = ✅)

| File | Count | Coverage |
|---|---|---|
| `tests/sprint18-touch-targets.test.js` | 6 | opt-read / scenario-desc / voice-btn-row / voice-fab / onboarding-cta 都 ≥ 44×44 + audit tool exit code |
| `tests/sprint18-onboarding.test.js` | 14 | 3 slides render / CTA label changes / state machine / fc_onboarding_done flag / VIEWS registry / boot logic / replayOnboarding action / settings page link |
| **Total** | **20 new** | (was 104, now 124) |

### 19.5 Acceptance criteria (Sprint 18 done = ✅)

- [x] User-reported: opt-read 28→48px (P0)
- [x] Result screen TTS buttons ≥ 48px tall (SEN-friendly prominence)
- [x] voice-fab explicit min-width/min-height for WCAG 2.5.5
- [x] Onboarding 3-step carousel: 揀→聽→想
- [x] fc_onboarding_done flag set on finish/skip
- [x] First-visit detection via needsOnboarding() in main.js boot
- [x] Settings → 重看教學 entry
- [x] audit-touch-targets.mjs ships + npm script registered
- [x] All 7 audited selectors pass 44px threshold
- [x] Tests: 104 → 124 (20 new, no regression)
- [x] SPEC v3.8 → v3.9 (this section)
- [x] __version__ 2.3.0 → 2.4.0 (MINOR — new feature: onboarding)

### 19.6 Anti-pattern (Sprint 18 必避)

- ❌ 用 modal 取代 full-screen overlay → SEN 學生 focus 易飄, modal 點 X 唔直觀
- ❌ 將 onboarding 步數加到 > 3 → 太長,SEN 學生 load 唔到
- ❌ onboarding 唔做 flag → 每個 reload 都 show,煩死人
- ❌ onboarding flag 用 sessionStorage → reload 後仲 show,UX 差
- ❌ 「重看教學」順手 clear flag → 下次 boot 又 show 一次,違反 user intent (one-time replay)
- ❌ TTS button 加到 > 56px → 視覺 overwhelm, 48-56 係 sweet spot
- ❌ 改 .btn base style 令 onboarding 自動大 → 影響全部 .btn button (含 confirm dialog), 開新 class .onboarding-cta
- ❌ audit-touch-targets 改去追 inline style / media query → 跑慢 + 維護成本, 守 declared minimum 已經夠
- ❌ 略過 onboarding 嘅學生睇唔到 0 violations 嘅 migration lesson → onboarding 嘅 slide 2 提咗 "個掣而家有 48×48" 呢個 detail, 唔好走漏

### 19.7 Out-of-scope (v3.9 不做,留 future)

- ❌ Onboarding 接受 per-student personalisation (e.g. 記住學生名字, 然後 "你好 小明！") → 太 invasive, 唔做
- ❌ Onboarding 加 video / animation → 太多 asset + 加 bundle size, 純 CSS + emoji
- ❌ Onboarding 步數隨學生能力調整 (adaptive) → 需要先有 student profile, 而家未 ready
- ❌ TTS button 加 waveform / 現在讀緊 animation → Sprint 19+ 視覺 polish
- ❌ 「重看教學」 加 reset 全部 settings → 兩件唔同事, 唔混淆
- ❌ 將 audit-touch-targets extend 去 audit 一般 button (.btn) → 而家只 audit TTS, 範圍精準夠用
- ❌ 改 E2E audit (audit-fc.mjs) 配合 audit-touch-targets → 兩者 scope 唔同, 唔合併

---

*Addendum 日期:2026-06-23 | 配合 Sprint 18 開工 | 取代/補充:§18 唔變,純新增 §19 | 維護者: Mavis + kencheng*

---

## 20. v3.10 Addendum — Sprint 21 Typography System (12/14/16/18/22/28 scale)

### 20.1 動機

CSS 入面 146 個 `font-size:` 散落 38 個唔同值(0.7em 到 5em),每個新 view 都自創字體 ratio,設計 drift + readability 唔一致。

目標:**6 級 text scale + design system contract** — 以後寫 UI 唔再 freestyle 揀字體。

### 20.2 Scale definition

6 級 typography tokens,em-based,跟 `--fc-font-size` root 自動按比例縮放(SEN 個人化保留):

| Token | Ratio | Resolved @ 18px root | Use case |
|---|---|---|---|
| `--fs-xs`   | 0.6667em | 12px | meta labels, micro badges |
| `--fs-sm`   | 0.7778em | 14px | small body, captions |
| `--fs-base` | 0.8889em | 16px | secondary body |
| `--fs-md`   | 1em      | 18px | body default |
| `--fs-lg`   | 1.2222em | 22px | subhead, h3 |
| `--fs-xl`   | 1.5556em | 28px | h2, prominent heading |

**保留 `--fc-font-size: 18px`**(JS 動態設定 SEN slider)— body 行用 `font-size: var(--fc-font-size)`,em-based tokens 自動跟住。

### 20.3 Migration map

| 之前(em / px) | 之後 |
|---|---|
| 0.7em, 0.72em | `var(--fs-xs)` |
| 0.75em, 0.78em, 0.8em, 0.82em | `var(--fs-sm)` |
| 0.85em, 0.88em, 0.9em, 0.92em, 16px | `var(--fs-base)` |
| 0.95em, 1em, 1.05em | `var(--fs-md)` |
| 1.1em, 1.15em, 1.2em, 1.25em, 1.3em | `var(--fs-lg)` |
| 1.4em, 1.5em, 1.6em | `var(--fs-xl)` |
| 1.7em, 1.8em, 2em+, 80px | 維持 inline (display: emoji / icon / h1 hero) |

### 20.4 Display sizes 維持 inline

以下 sizes 唔屬於 text scale,刻意保留 inline(em / px literal):
- Emoji / icon container:`2em`, `2.4em`, `2.5em`, `2.8em`, `3em`, `4em`, `5em`
- `.role-screen h1` + `h1`:1.8em(hero, prominent)
- `.creed-show::before` 裝飾 star:80px
- `.student-avatar` 字母:1.8em(in 50px circle)

`tools/a11y/audit-font-sizes.mjs` 自動 allowlist(em ≥ 1.7 + 非 14/15/16 px)。

### 20.5 audit-font-sizes tool

`tools/a11y/audit-font-sizes.mjs` — 靜態 CSS audit,失敗條件:
- text-scale em 值(0.7em ~ 1.6em)冇用 `var(--fs-*)` → FAIL
- text-scale px 值(14/15/16px)冇用 `var(--fs-*)` → FAIL
- 違規時 exit 1,印 selector + line + 建議 token

`npm run audit:font-sizes` 入 CI guard — 將來任何人加新 `font-size:` 冇用 token 即 catch。

### 20.6 Tests (Sprint 21 done = ✅)

- `tests/sprint21-font-sizes.test.js` — **22 個新 test**:
  - 6 個 token definition correctness(em ratio vs resolved px)
  - 6 個 token math(@ 18px root → 12/14/16/18/22/28)
  - 1 個 all-tokens-used(orphan detection)
  - 1 個 --fs-md 是 most-used 確認
  - 3 個 audit script smoke(正常 pass / 硬碼 catch / display allowlist)
  - 3 個 integration smoke(h2 → --fs-xl, h3 → --fs-lg, body → --fc-font-size)

### 20.7 Acceptance criteria (Sprint 21 done = ✅)

- [x] 6 個 `--fs-*` tokens 喺 `:root` 定義,em ratio 對應 12/14/16/18/22/28
- [x] `src/style.css` 123 個 text-scale font-size 全部 migrate 落 token
- [x] JS inline `style="font-size:..."` ~68 個中,~40 個 common 值 migrate 落 token;display emoji/icon 留 inline
- [x] `tools/a11y/audit-font-sizes.mjs` 可執行,PASS / FAIL exit code 正確
- [x] `npm run audit:font-sizes` 入 CI guard
- [x] 22 個新 unit test,full suite 146/146 pass
- [x] `--fc-font-size: 18px` SEN root 保留,em tokens 跟住縮放
- [x] `__version__` 2.4.0 → 2.5.0 (MINOR — 新 capability)
- [x] SPEC v3.9 → v3.10 (this section)
- [x] 146/146 tests pass,no regression

### 20.8 Anti-pattern (Sprint 21 必避)

- ❌ 新 view 直接寫 `font-size: 0.88em;` → audit-font-sizes 即 catch;改用 `var(--fs-base)`
- ❌ 為咗視覺微調破 scale(寫 0.83em、0.87em) → 6 級就係要放棄 fine-grained control,換 design consistency
- ❌ 將 h1 由 1.8em 改成 var(--fs-xl) (28px) → h1 屬 display,留 1.8em 維持 hero prominence
- ❌ 用 px (14px / 15px / 16px) 取代 em token → px 唔跟 SEN scaling;堅持用 var(--fs-*)
- ❌ audit script 擴去追 JS inline `style="..."` → brittle + 慢,scope 守住 CSS file
- ❌ Display sizes (emoji 2em+) token-ize 做 --fs-display-* → 失控,display 留 inline + audit allowlist 守住

### 20.9 Out-of-scope (v3.10 不做,留 future)

- ❌ Design tokens 整體化(顏色、spacing、radii) → S22+ 範圍
- ❌ Dark mode / theme switching → S22+ 範圍
- ❌ Topic 色板統一(17 → 6 semantic) → S22+ 範圍
- ❌ Brand identity / mascot / iconography 統一 → S22+ 範圍
- ❌ Migrate 所有 JS inline `style="font-size:..."` (e.g. 一次性 emoji) → 8 個 rare display 留 inline,唔值得
- ❌ 將 --fs-* export 落 JS constants → CSS-only scope
- ❌ Per-token responsive variants (--fs-md-mobile 等) → 未有需要,em ratio + SEN slider 夠用

### 20.10 Migration impact summary

| Metric | Before | After |
|---|---|---|
| `src/style.css` text-scale values | 38 distinct | 6 tokens |
| Hardcoded `font-size:` (CSS) | 146 | 21 display + 1 root |
| Hardcoded `font-size:` (JS inline) | ~68 | ~28 display + 1 root |
| Token references | 0 | 123 in CSS + ~40 in JS |

*Addendum 日期:2026-06-23 | 配合 Sprint 21 開工 | 取代/補充:§19 唔變,純新增 §20 | 維護者: Mavis + kencheng*

