# 友愛教室 V3 — 完整規格書 (v3.1)

> 基於 v2.2 framework 重整：對齊 EDB 12 種首要價值觀 + 5 個 SEL / 安全範疇
>
> *規格日期：2026-06-13 | 最後更新：2026-06-17（Sprint 5 sound buttons live + 語音橋接）*

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
| `id` | string | ✅ | unique，s-self-XX 格式 |
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
        ├── 🌷 關係花園 (coming soon)
        └── 🎲 道德大富翁 (coming soon)
```

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

> **2026-06-17 update**：Sprint 1-5 全部 done。10 commits pushed to `origin/main` (deploy live 喺 GH Pages, bundle `index-D1BE01Kh.js`)。Sprint 6+ 為 follow-up backlog。

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
| 🟡 **S6 backlog**: `revealNextHint` / `toggleHints` 缺 `window.FC` bridge | hints panel button 跟 Sprint 5 T1 同 pattern | TBD | — |
| 🟡 **S7 backlog**: 21 scene 圖片 (300+ KB each) 改 webp | PWA precache 158MB 縮減 | TBD | — |
| 🟡 **S8 backlog**: Vite preview service worker 自動 cache dist 行為 | e2e setup 要 `?cb=$(date +%s)` cache-bust | TBD | — |
| 🟢 **S9 backlog**: 老師 mode 確認 17 個 category toggle | regression test | TBD | — |
| 🟢 **S10 backlog**: 拆 `engine.js` (1,156 lines) → per-view renderers | 更大 refactor | TBD | — |

---

## 10. 已移除功能

- ❌ 自由模式（random 跨課題）— 破壞學習階梯
- ❌ 🚪門課題（社交故事類）— 唔係德育題目
- ❌ Phase 2 teacher-editor — 改為直接編輯 JSON
- ❌ V2.2 嘅 4 大主題分組（emotions/respect/honesty/conflict）— 已被 12+5 取代

---

*規格日期：2026-06-13 | 最後更新 2026-06-17 | v3.1（Sprint 5 sound buttons live + 語音橋接）| 取代 v2.2（2026-06-04）*

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

**E2E discovery rule** (added to agent memory):
> 任何 sprint review / code review 必先跑：
> ```bash
> diff <(rg -ohE 'data-action="([a-zA-Z]+)"' src/ -r | sort -u) \
>      <(rg -ohE 'window\.FC\.([a-zA-Z]+)' src/ | sort -u)
> ```
> Missing = silent no-op bug。E2E 要 cover 每個 distinct `data-action` 至少 click 1 次（唔只 happy path）。

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

### 12.2 Bundle sizes (Sprint 5 final)
- `dist/assets/index-*.js`: 112KB raw (34KB gzip) — main entry
- `dist/assets/<topic>-*.js`: 17 chunks × 17-27KB — per-topic lazy load
- `dist/assets/teacher-*.js`: 6KB — lazy-load on teacher mode
- `dist/assets/index-*.css`: 42KB (9KB gzip)
- `dist/assets/images/scenarios/*.png`: 66MB (259 files, ~250KB each)
- `dist/assets/images/outcomes/*.png`: 90MB (745 files)
- `dist/assets/audio/creeds/`: MP3 fallbacks (speakCreeds TTS fallback to Web Speech API if missing)
- **PWA precache**: 1,032 entries / 158.5MB total

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

> 1. `rg -ohE 'data-action="([a-zA-Z]+)"' src/ -r | sort -u` — 列出所有 distinct data-action
> 2. `rg -ohE 'window\.FC\.([a-zA-Z]+)' src/ | sort -u` — 列出所有 window.FC exports
> 3. `diff <(前者) <(後者)` — 任何 missing = silent no-op bug
> 4. 跑 `npm test` 100% pass
> 5. Build → preview → 對每個 data-action click 至少 1 次 (Playwright e2e)
> 6. Console 0 errors

### 14.3 對 user / teacher

> 1. 訪問 https://ihateusingai-beep.github.io/friendly-classroom-v2/ (or self-host)
> 2. 揀角色 (學生 / 老師家長)
> 3. 揀科目 (預設 1 個 value subject，將來可能加多)
> 4. 主頁可揀 🪷 12 個 EDB 價值觀 / 🌈 5 個友愛校園 / 📚 全部 17 個
> 5. 揀個 topic → 揀個 scenario → 揀個 option → 睇 result + 信條
> 6. Good-Deed Bank: 隨機 8 題，總分到 $100 過關
> 7. Settings: 改字體大小 / 朗讀語言 (auto / 粵語 / 國語 / 普通話) / 朗讀速度 / 對比度 / 動畫減弱
