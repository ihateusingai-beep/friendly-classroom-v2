# 友愛教室 V3 — 產品設計與優化提案 V1.1

> **Status**: 🟢 Active — V1.1 adds Sprint 15/16/17 ship status (2026-06-23)
> **作者**: Mavis (per user request)
> **基於**: `SPEC.md v3.5` (2026-06-17) + Sprint 14 code-quality branch (2026-06-19, +835/-381)
> **更新**: `SPEC.md v3.8` (2026-06-23) + Sprint 17 ship (2026-06-23)
> **取代**: 無(純 planning doc,Sprint 15-17 ship status 加落 §8 + §9)
> **下游**: 揀選優先項 → 起新 sprint branch(`sprint-15-*` / `sprint-16-*` / `sprint-17-*`)落地

---

## 目錄 (TOC)

- [0. 背景與現況](#0-背景與現況)
- [1. 新功能開發](#1-新功能開發)
- [2. 使用者體驗 (UX) 優化](#2-使用者體驗-ux-優化)
- [3. 使用者介面 (UI) 設計](#3-使用者介面-ui-設計)
- [4. 自動化功能導入](#4-自動化功能導入)
- [5. 技術風險評估](#5-技術風險評估)
- [6. Debug 與系統穩定性測試項目](#6-debug-與系統穩定性測試項目)
- [7. 推薦落地優先序](#7-推薦落地優先序)
- [8. 變更記錄](#8-變更記錄)
- [9. Ship Status Snapshot (2026-06-23, post-Sprint 17)](#9-ship-status-snapshot2026-06-23-post-sprint-17)

---

## 0. 背景與現況

### 0.1 產品定位

香港小學品德教育 PWA,對齊 EDB 12 種首要價值觀 + 5 個友愛校園 SEL/安全範疇。
SEN 學生優先 — 大字 24-32px / TTS 朗讀 / 減少動畫 / 顏色編碼。

### 0.2 規模量級(2026-06-23, Sprint 17 ship 後)

| 項目 | 數量 | 改動 |
|---|---:|---|
| Topic | 17 (12 value + 5 caring) | — |
| Scenario | 259 (全部 ≥15/topic) | — |
| Creed | 22 (12 VALUE + 10 LEGACY) | — |
| **Unit test** | **104**(11 個 file,S17 加 +9 個) | ⬆️ +79% from S14 |
| **stopAndThink fields** | **264**(S16 加 17,S17 加 247) | ⬆️ new in S16-S17 |
| **書面語化 coverage** | **744 / 744 options**(100%) | ⬆️ S16 empathy,S17 其餘 16 topic |
| 圖片 | 1005 張(scenario + outcome,Sprint 3 gen) | — |
| 模組 | 9 domain + 2 game + 3 component + 2 action + 4 util + 3 new(S17: `Feedback.js`, `scenarios_v2.mjs`, `sprint17-migration.test.js`) | ⬆️ |
| 主 bundle | Vite hashed,GH Pages 部署,1032 PWA entries,158 MB precache | — |
| **Sprint history** | **1-17 全部 done**,S7-S11 backlog 仍然 hold | ⬆️ +3 sprints |
| **SPEC version** | **v3.8**(S16 加 §17,S17 加 §18) | ⬆️ from v3.5 |

### 0.3 已知痛點(由 codebase 推斷 + SPEC §9 backlog)

> V1.1 狀態註:Sprint 15-17 後嘅解決情況。✅ = done,🟡 = partial,❌ = still open

1. **「道德大富翁」+「關係花園」兩個 game card 永遠 locked**(SPEC §6,8 個 sprint) — ❌ still open(SPEC §6 game card 解鎖需 1.5 Social Story Mode,S18-S20 backlog)
2. **學生完成 scenario 後冇沉澱機制**(直接跳下一條) — ✅ **Sprint 15 done**(Reflection Journal,SPEC §16,3 選項 emoji + free text + voice memo,IndexedDB 30-day auto-prune)
3. **老師編輯 scenario 只能改 JSON**(SPEC §10 確認移除 web editor) — ❌ still open(SPEC §10 決定唔做 web editor,直接 edit JSON)
4. **進度只有 localStorage,無雲端 / 無法分享畀家長** — ❌ still open(1.7 Family Link S22,backend sync R13 高風險留最後)
5. **TTS 語音切換入口唔顯眼**(`audio.js` 已 expose `setTTSLang`,但 settings 未接) — 🟡 **partial S17**(audio.js 加 3 個新 export:speakOptionText / speakConsequence / speakStopAndThink,但 settings UI 仲未做,留 S17+)
6. **Scenario list 冇 filter**(17 topic 2-col grid,259 scenario 冇 sort) — ❌ still open(2.3 Filter Bar,S17+ backlog)
7. **12+5 個 topic 各自 1 色,配色 rainbow**(可能 overstimulation SEN) — 🟡 **partial S16**(Sprint 16 確認 HC / RM mode 隔離,但統一色板未做,留 S21)
8. **Brand identity 弱**(utility 風格,無 mascot,系統字體) — ❌ still open(S21 Brand + 配色 + dark mode)

---

## 1. 新功能開發

### Tier 1 — 直接解決已有痛點(高 ROI)

#### 1.1 「今日情境」Daily Pick + Streak 🎲

| 項目 | 內容 |
|---|---|
| 痛點 | `Good Deed Bank` 玩完、Home 太多 choice,學生唔知從何開始 |
| 做法 | 每日 0 點 refresh 1 條「情境之星」scenario(基於 student 嘅 progress + risk level 平衡) |
| 激勵 | 完成 +1 streak,7 日獎 1 個 sticker |
| 觸及檔案 | `src/main.js`、`src/engine.js:renderHome`、`src/storage.js`、`src/components/chrome.js`、`src/domain/Play.js` |
| 新檔案 | `src/daily.js`(新 module) |
| 數據 | `fc_streak_<student>`、`fc_daily_log_<student>`、`fc_stickers_<student>` |
| 邊界 | streak 跨時區用 server-side anchor(見 §5 R1)/ fallback localStorage 0 點 local time |
| 預估工時 | 1 sprint(3-4 日) |

#### 1.2 反思日記(Reflection Journal)📝

| 項目 | 內容 |
|---|---|
| 痛點 | 玩完 scenario 即去下一條,冇沉澱 |
| 做法 | Result 頁加「📝 我嘅感受」tab → 3 選項 emoji (😊/😐/😢) + 1 句 free text(可 TTS 朗讀) + 可選 🎤 voice memo |
| 觸及檔案 | `src/engine.js:renderResult`、`src/components/blocks.js`、`src/audio.js` |
| 新檔案 | `src/reflection.js`(新 module) |
| 數據 | `fc_reflections_<student>`(每學生最多 30 條,auto-rollover) |
| 邊界 | free text 必過 `escape.js:escapeAttr`(防 XSS,見 §5 R10) |
| 預估工時 | 1 sprint(3-4 日) — **可同 1.1 合併 1 個 sprint** |

#### 1.3 老師情境編輯器(Scenario Authoring Web UI)✍️

| 項目 | 內容 |
|---|---|
| 痛點 | SPEC §10 講「Phase 2 teacher-editor — 改為直接編輯 JSON」,但老師唔識 JSON |
| 做法 | Web form → 17 topic dropdown + risk slider + options builder + AI auto-fill(見 §4.1) |
| 觸及檔案 | `src/teacher.js`(已 lazy load)、`src/domain/IO.js` |
| 新檔案 | `src/teacher/editor.html` + `src/teacher/editor.js` |
| 數據 | `data/scenarios/_custom/<id>.json`(隔離 subdir) |
| 邊界 | schema 校驗 + dry-run preview + 老師 confirm 先 save,絕對唔由 AI 寫內容 |
| 預估工時 | 2 sprint(6-8 日,UX 重) |

#### 1.4 進度報告匯出 PDF / 可列印版 📄

| 項目 | 內容 |
|---|---|
| 痛點 | 家長會 / 班主任要 report,但得 localStorage 過 export JSON 一份 |
| 做法 | `exportProgressReport(studentId) → PDF`(用 print CSS + 瀏覽器原生,免 jsPDF CJK 麻煩) |
| 觸及檔案 | `src/domain/IO.js`、`src/style.css`(加 `@media print`) |
| 內容 | 12 雷達圖(純 SVG,無外部 dep) + streak 圖表 + 反思摘要 + 強弱 topic |
| 預估工時 | 0.5 sprint(1-2 日) |

### Tier 2 — 市場差異化

#### 1.5 跨場景 Social Story Mode — 解鎖 SPEC §6 locked games 🌷🎲

**兩個 game card 從 v1 寫「暫未推出」到依家**,呢度係 v4 嘅主打 differentiation。

| Game | 玩法 | 觸及檔案 | 預估工時 |
|---|---|---|---|
| **關係花園** 🌷 | 連續 5 條 scenario 玩同一個 character(小美/阿明/阿俊),睇 relationship value 演變 | 新 `src/games/RelationshipGarden.js`、re-use `GoodDeedBank.js` 嘅 start/end/next pattern | 1.5 sprint |
| **道德大富翁** 🎲 | 棋盤式,30 格,擲骰仔決定 topic(隨機但 seed 保證公平),過終點完成一個學期 | 新 `src/games/MoralMonopoly.js`、SVG 棋盤 | 2 sprint |

**邊界**:嚴守「1 sprint 1 game」,先 RelationshipGarden,後 MoralMonopoly。SPEC §6 已留 UI 入口,唔使改 routing。

#### 1.6 AI 個案解釋助手「點解咁揀」💡

| 項目 | 內容 |
|---|---|
| 痛點 | option 揀完只顯示 effect comment,低年級 / SEN 學生未必明 |
| 做法 | Result 頁加 💡 button → MiniMax API 生成 1-2 句粵語解釋(用學生 level 詞彙) |
| 新檔案 | `src/ai/explainer.js` |
| 觸及 | `src/components/blocks.js`、Result renderer |
| 邊界 | **絕對唔用 AI 生成 scenario 內容**,只解釋 pre-existing 嘅 option。**response cache 24h,fallback static text 必出** |
| MiniMax rate limit | ~3 並發(已知,2026-06-15 memory) |
| 預估工時 | 1 sprint(2-3 日) — PoC 先 |

#### 1.7 家長 / 監護人閱覽模式(Read-only Family Link)👨‍👩‍👧

| 項目 | 內容 |
|---|---|
| 痛點 | 家長唔識用 app,但想睇仔女 progress |
| 做法 | Setting 加「產生家庭連結」→ 6 位 PIN + read-only URL → 家長用手機開睇 progress dashboard,**學生資料遮名字只顯示花名** |
| 新檔案 | `src/family.js`、`src/family.html` |
| 數據 | `fc_family_links_<teacher>`(token, hashed PIN, expire 30 日) |
| 邊界 | 5 次 PIN 試錯鎖 5 分鐘(防暴力)/ GDPR-K 同意(見 §5 R1) |
| 預估工時 | 1.5 sprint |

#### 1.8 多語言 scenario(EN / 普通话)🌐

| 項目 | 內容 |
|---|---|
| 痛點 | 少數族裔 / 內地新移民學童需要 |
| 做法 | scenario JSON 加 `i18n.en.title` / `i18n.en.description`,UI 加語言切換 |
| 邊界 | **TTS 唔變**(繼續 zh-HK default),只翻 scenario 文本 |
| 數據 | scenario schema 加 `i18n?: { en?: {...}, zh-CN?: {...} }`(optional,向後兼容) |
| 觸及 | `data/scenarios/*.json` 259 條可後台 batch 翻譯 |
| 預估工時 | 1 sprint(內容翻譯 + UI 切換) |

---

## 2. 使用者體驗 (UX) 優化

### P0(阻擋學習)

#### 2.1 Onboarding Flow(首次使用)🪷

**現況**:第一次入 app 即撞 Role Select,但冇人解釋「呢個係乜」。

**做法**:3 步 wizard

1. 揀角色(學生/老師/家長),**有 mascot 公仔 + 1 句「我係...」**
2. 學生填花名 + 揀 1 個 avator(emoji 12 個 value × 2 風格)
3. 試玩 1 條引導 scenario,離場前可加為「最鍾意」

**新檔案**:`src/components/Onboarding.js`
**觸及**:`src/main.js`(加 first-run check `!localStorage.fc_onboarded`)
**a11y**:每步 focus 自動跳 + SR announce step 1/3, 2/3, 3/3
**預估工時**:1 sprint(3 日)

#### 2.2 TTS 語音選擇(已有 infrastructure,欠 UI)🔊

**現況**:`TTS_LANGS` 喺 `audio.js` 已有,但 settings 唔知邊度揀。

**做法**:Settings 加「語音:🇭🇰 阿女 / 🇭🇰 阿仔 / 普通話 / English」radio + 試聽 button

**觸及**:`src/engine.js:renderSettings`、`src/audio.js` 已 expose `setTTSLang`/`getTTSLang`
**邊界**:SpeechSynthesis API 唔同 browser voice list 唔同,UI 要有 fallback(用 browser default)
**預估工時**:0.5 sprint(1 日)

#### 2.3 Scenario List 加 Filter/Sort 🔍

**現況**:Topic 頁 grid 2-col,17 個 topic card 排晒出嚟,scenario list 冇 filter。

**做法**:Scenario List 上方加 filter bar —
- 「✅ 已完成 / ⬜ 未玩 / ❓ 玩過但錯 / 🔄 重溫」
- 排序(建議 / 最新 / 難度)

**新檔案**:無,extend `src/components/blocks.js:renderFilterBar`
**觸及**:`src/engine.js:renderPlay`(scenario list 嗰部分)
**a11y**:filter button 全部 keyboard reachable,當前 filter 有 `aria-pressed`
**預估工時**:0.5 sprint(1 日)

#### 2.4 Hint UX 改進(已有 backend,欠 UI)💭

**現況**:`revealNextHint` / `toggleHints` 已 fix(SPEC §9 S13 done),但 hint 顯示模式 simple。

**做法**:hint 收埋做 👁️ 折疊,逐個撳開
- 每個 hint 配 icon(💭 想法 / 👀 觀察 / 🌱 行動)
- 撳開有 TTS 朗讀(已有 `speak` bridge)
- 全部 reveal 完隱藏自己(已有邏輯)

**預估工時**:0.5 sprint(1 日)

### P1(摩擦點)

#### 2.5 設定頁入口發現 ⚙️

**現況**:Home 右上角 `⚙️` 細細粒,SEN 學生搵唔到。

**做法**:
- 加 📌「釘選設定」功能(常用 setting 提到 Home 頂)
- 「上次設定過乜」快選
- 「重設全部」confirm 對話框(避免誤觸)

**預估工時**:0.5 sprint

#### 2.6 Loading 狀態 ⏳

**現況**:scenario chunk 17 個 lazy-load,撳 topic 時可能 200-500ms 黑屏。

**做法**:
- `src/components/chrome.js:renderLoading` 已有,confirm 撳 topic 嗰陣有 trigger
- 加 skeleton card(避免 layout shift)
- 加 `aria-busy="true"` 喺 loading 期間(已 partially 喺 Toast.js)

**預估工時**:0.3 sprint

#### 2.7 離線 / 同步狀態可見 📡

**現況**:`sync.js` 有 stub,但 user 唔知啱啱有冇 sync。

**做法**:`window._fcSyncStatus` 已有,加 UI badge
- 🟢 綠點 = 已 sync
- ⚪ 灰 = 離線
- 🔴 紅 = 失敗(hover 顯示原因)

**觸及**:`src/components/chrome.js:renderSyncBadge`、`src/sync.js`
**預估工時**:0.3 sprint

#### 2.8 Result → Next 動線(已完成咗部分,UX 加強)➡️

**現況**:玩完即跳下一條,SEN 學生可能想停。

**做法**:加「🔁 重玩 / ⏭️ 下一條 / 🏠 回主頁 / 💭 反思」4-button 工具列
- 反思掣 → 跳 1.2
- 重玩掣 → 保留 student score 唔 reset,但 scenario 重新玩

**預估工時**:0.3 sprint

### P2(細節 polish)

- **2.9 鍵盤導航審計** — axe-core 已有,但要手動 verify Tab order,寫 `tools/a11y/keyboard-flow.test.mjs`
- **2.10 錯誤狀態文案統一** — 現有 toast 繁簡混,做 string table 統一喺 `src/i18n.js`
- **2.11 「上次玩到邊」sticky banner** — 進入 app 即見,`fc_last_session_<student>` storage
- **2.12 Subject switch 確認** — 撳切 value/caring subject 嗰陣 confirm dialog 防止誤觸
- **2.13 Recent activity quick resume** — Home 頂加「續玩上次」掣

---

## 3. 使用者介面 (UI) 設計

### 3.1 品牌建立 🎨

**現況**:Utility-style,紫色 theme-color `#7B2FBE`、emoji 散落。

**建議**:

| 元素 | 現況 | 建議 |
|---|---|---|
| Mascot | 無 | 揀「友愛小熊 🐻‍❄️」或「小蓮花 🪷」(配 12 value 嘅 🪷 標誌) |
| Logo | 無,只有 title text | 加 custom wordmark「友愛教室」+ mascot 組合 |
| Sticker 集郵 | 無 | 完成 16/64/200/259 個 scenario 解鎖 sticker(配 mascot 風) |
| Brand color | `#7B2BE` 紫色 | 加 secondary 暖色 / 冷色,domain 區分 |

**預估工時**:1 sprint(design 重,implementation 0.5 sprint)

### 3.2 排版與字體 🅰️

- 升級 `Noto Sans TC` variable font(目前 system font,跨 device 唔一致)
- 行高 1.7-1.8(現時可能 1.5)、letter-spacing 微調
- 加入 `OpenDyslexic` toggle(閱讀障礙學生用)
- `prefers-reduced-motion` 尊重已有 ✅

**預估工時**:0.5 sprint(替字體 + a11y toggle)

### 3.3 配色系統 🌈

**現況**:17 個 topic 各自 1 個顏色,彩虹,可能 overstimulation SEN。

**建議**:
- **Domain 級主色**
  - value(12 個)= 暖色系(#F59E0B 橙 / #EC4899 粉 / #EF4444 紅 等)
  - caring(5 個)= 冷色系(#0EA5E9 藍 / #7C3AED 紫 等)
- **Topic 級 accent** — 細 icon + label 用 topic 專色
- **Dark Mode** — `prefers-color-scheme` + manual toggle(SEN 學生怕光)

**觸及**:`src/style.css`、`src/subjects.js`
**預估工時**:1 sprint(配色 + dark mode)

### 3.4 Illustration 升級 🖼️

已有 1005 張 outcome image(Sprint 3 `c1e43ee`),但係 stable diffusion 生成,風格唔統一。

**建議**:
- 統一 prompt 加 "studio ghibli children's book illustration, soft palette, character-focused" prefix
- 角色跨 scenario 復用(小美/阿明/阿俊嘅 reference sheet),建立 character bible
- 場景插圖(非 outcome)用低多邊形(loading 友善)

**預估工時**:0.5 sprint(prompt 統一 + character sheet)

### 3.5 互動細節 ✨

| 元素 | 改善 |
|---|---|
| 按鈕 hover | scale(1.02) + shadow 升級 |
| 完成 scenario | confetti 升級為「花瓣飄落」(配 🪷 mascot) |
| Reduce-motion | 全部 disable,現有 ✅ |
| Haptic feedback | 觸控裝置(平板)答啱震動一下(SEN 學生 tactile reinforcement,`navigator.vibrate(50)`) |
| 進度條 | moral bar 已有,改用 spring animation 滑順啲 |

**預估工時**:0.5 sprint

### 3.6 Layout 改進 📐

- **Home 頁** 從 grid 2-col 改為 **masonry**(高低 card 自然排列,17 個 topic 唔同長度)
- **Scenario 頁** 加 **breadcrumbs**(Home > 尊重他人 > s-respect-03)
- **設定頁** 分 tab(顯示 / 語音 / 進度 / 關於)
- **Result 頁** 加 sticky action bar(play 完即見 4-button 唔使 scroll)

**預估工時**:0.5 sprint

---

## 4. 自動化功能導入

### 4.1 AI 增強(慎選,只讀不寫)

| 項目 | 讀/寫 | 風險 | 推薦 |
|---|---|---|---|
| **AI 解釋 option** (1.6) | 讀 | 中 | ✅ **做**(已有 MiniMax API key,成本接近零) |
| **AI 自動 tag 自訂 scenario** | 讀 + 寫 metadata(老師 confirm) | 中 | ✅ 做(老師 override 機制) |
| **AI 翻譯 scenario 為 EN / 普通話** (1.8) | 讀 + 寫翻譯 | 中 | ✅ 做(pre-existing 內容,**唔由 AI 生新內容**) |
| **AI 個案變體** — 同一個 scenario 生成 3 個深淺變體 | 寫 | 🟠 高 | 🟡 研究 PoC,**預設關閉**,老師 opt-in |
| **AI 生成 scenario 內容** | 寫 | 🔴 Critical | ❌ **唔做**(對 SEN 學生 + 教師審核唔切實際) |

**統一規範**:
- 全部 AI call 經 `src/ai/safe-call.js`(rate limit + cache + fallback static text)
- System prompt 嚴格限定 source scenario
- Response cache 24h(key = hash(prompt + scenarioId))
- Fallback static text 必出(graceful degradation)
- MiniMax rate limit ~3 並發(已知,2026-06-15 memory)
- M2/M3 cluster 不共享 key,小心配對

### 4.2 老師後台自動化

| 功能 | 觸及 | 預估工時 |
|---|---|---|
| **Auto-analytics dashboard** — `Analytics.js` 已有 `getStats`/`logInteraction`,加 view 顯示班級平均 / 強弱 topic / 異常學生 | `src/teacher.js`、`src/domain/Analytics.js` | 1 sprint |
| **Auto-export 週報** — 班主任 email 自動每週一收到 CSV(用 Tailscale + sendmail 之類) | `src/teacher.js`、backend stub | 0.5 sprint |
| **Auto-backup 雲端** — `sync.js` stub 變真實 backend | `src/sync.js`、新 backend | 2 sprint(取決於 backend 揀) |

### 4.3 學習體驗自動化

| 功能 | 做法 | 觸及 |
|---|---|---|
| **Spaced Repetition** | 7 日 / 30 日 / 90 日後自動將玩過嘅 scenario 推送返出嚟「重溫」 | `src/daily.js`(同 1.1 共用) |
| **Adaptive Hints** | 學生答錯 2 次,下一條自動 reveal 第 1 個 hint | `src/domain/Play.js` |
| **Smart Next-Scenario Suggestion** | `ScenarioEngine.js:suggestNext` 已有,加入「答啱率高 → 推 riskLevel+1、答錯率高 → 推 riskLevel-1」邏輯 | `src/domain/ScenarioEngine.js` |
| **Auto-TTS voice selection** | 學生第一次用時偵測 browser `speechSynthesis.getVoices()`,推薦最似樣嘅粵語女聲 | `src/audio.js` |
| **Auto-difficulty adjustment** | 答啱率 < 30% 自動降 riskLevel,> 80% 自動升 | `src/domain/Play.js` |

**預估工時**:1 sprint 全部

### 4.4 內容運維自動化

| 功能 | 做法 | 觸及 |
|---|---|---|
| **Auto-image gen pipeline** | 已有 `gen_*.py` 14 個 script,加 GitHub Action 自動補缺失 image | `.github/workflows/auto-images.yml` |
| **Auto-quality check** | 每次 build 前 audit scenario 完整性(description > 50 字 / options 2-4 個 / hints 1+ 個 / riskLevel 0-3 / topicId 合法) | `tools/qa/scenario-audit.mjs` |
| **Auto-i18n sync** | 新加 EN 文本時自動 stub zh-Hant fallback(防止漏翻) | `tools/qa/i18n-check.mjs` |
| **Auto-test scenarios in browser** | Playwright 跑 259 條 scenario,確保全部可 render(防止 schema 漂移) | `tests/e2e/scenario-render.spec.mjs` |

**預估工時**:0.5 sprint(GitHub Action + 3 個 QA script)

### 4.5 教師友善自動化

- **Scenario 模板一鍵生成** — 老師填「我想教誠信 + 涉及欺騙 + 對象小三」→ AI 生成 3 個 scenario 草稿(老師 edit 後 save)
- **批量匯入 CSV** — 老師用 Excel 填 scenario 然後 upload,系統 parse + 校驗
- **同班學生 cohort 比較** — 自動生成班級 vs 全校平均比較表(匿名)

**預估工時**:1 sprint(1.3 編輯器 + 4.5 batch 同做)

---

## 5. 技術風險評估

### 5.1 風險矩陣(嚴重度 × 機率)

| ID | 風險 | 嚴重度 | 機率 | 觸發條件 | 緩解策略 |
|---|---|:---:|:---:|---|---|
| **R1** | 學生私隱(PIPA / GDPR-K) | 🔴 Critical | 中 | 收集 student name / progress / 反思日記 → < 18 歲 | 學校同意書 + 資料最少化(只存 first name + emoji 頭像) + 不存 IP + 反思日記 30 日 auto-delete + 家長 PIN 模式 read-only + COPPA-style consent flow |
| **R2** | AI 內容 hallucination | 🟠 High | 高 | 1.6 解釋 / 1.8 翻譯 / 4.1 tag 推薦 | 全部 pre-existing 內容,AI 只 paraphrase;system prompt 嚴格限定 source;response cache 24h + 老師 override 機制;**never 用 AI 生 scenario 內容** |
| **R3** | TTS browser 不一致 | 🟡 Medium | 中 | Safari / iOS Web Speech API voices 唔同 | 已有 voice chain `zh-HK → zh-TW → zh-CN`,加 TTS availability check + UI 警告「此瀏覽器不支援廣東話,將使用國語」 |
| **R4** | localStorage 5-10MB 上限 | 🟡 Medium | 中 | 259 個反思日記 + 5 個 student progress + voice memo URL | 反思日記最多留 30 條 + voice memo 用 IndexedDB 而非 blob URL;定期 vacuum `fc_*` keys |
| **R5** | PWA 緩存 stale | 🟠 High | 中 | 已有 `?cb=$(date +%s)` cache-bust(S9 backlog)| Sprint 14 已經 handle,但新加 module 要小心,workbox-precache 自動 hash;新加 `?v=hash` query |
| **R6** | 大量 scenario 加載性能 | 🟡 Medium | 中 | 未來擴到 1000+ 條 | 已有 17 chunk lazy load OK,加 virtual scroll(scenario list);`import.meta.glob` 自動 code split |
| **R7** | Creed migration 失誤 | 🟠 High | 低 | 加新 LEGACY_CREED 影響舊 progress | 既有 `CREED_MIGRATION` 機制 OK,新加要 review SPEC §2.3,加 e2e test:加新 id 後 import 舊 data 唔失 |
| **R8** | 12 value alignment 漂移 | 🟠 High | 中 | EDB 改版 / 教師自加 scenario | 老師加 scenario 強制填 `valueCategory`,CI check 對齊 VALUE_CREEDS;EDB 官網 URL 定期 verify(2026-06-17 已做) |
| **R9** | A11y regression | 🟠 High | 中 | 新功能無 SR announce / 無 keyboard nav | CI 跑 `tools/a11y/audit-fc.mjs`(已 5 個 sprint 穩定),新 PR 必加 a11y test;axe-core CI gate 0 violation |
| **R10** | 反思日記 free text XSS | 🔴 Critical | 中 | 學生輸入 HTML / script | 已有 `src/util/escape.js:escapeAttr` / `escapeJsString`,reflect display 必過 escape;老師/家長 dashboard 用 textContent 而非 innerHTML;CSP `script-src 'self'` |
| **R11** | Voice memo 容量 | 🟡 Medium | 高 | MediaRecorder 5 分鐘 WAV ~ 30MB | 強制 WebM + max 60s + bitrate 32kbps;超限提示;IndexedDB 容量監控 |
| **R12** | PDF export 中文亂碼 | 🟠 High | 高 | jsPDF 預設唔識 CJK | 用 print CSS + 瀏覽器原生 print(免 jsPDF CJK 麻煩),或 `html2pdf.js` + 內嵌 Noto Sans TC web font |
| **R13** | Backend sync 單點故障 | 🟡 Medium | 中 | sync.js 變真實 backend,server down | localStorage 為 single source of truth,server 只 mirror;conflict 用 last-write-wins + 30 日 history;離線優先 |
| **R14** | Game unlock scope creep | 🟡 Medium | 高 | 1.5 解鎖大富翁 + 花園要小心 scope | 嚴守「1 sprint 1 game」,先 RelationshipGarden,後 MoralMonopoly;每個 game 獨立 ship flag |
| **R15** | 老師 PIN 暴力破解 | 🟠 High | 中 | 6 位 PIN = 100 萬組合,理論 1 日可破 | 5 次試錯鎖 5 分鐘 + IP rate limit + 過期 30 日 + audit log |
| **R16** | E2E button 漏 audit(Category A bug) | 🟠 High | 中 | 已知問題(SPEC §11.4 Sprint 5 揭 6 個 Sprint 12 揭 5 個 Sprint 13 揭 3 個) | 每次 sprint review 跑 e2e click matrix 3 個 grep(SPEC §11.4 rule),新功能必加 `data-action-guard.test.js` coverage |
| **R17** | 17 topic 配色 overstimulation | 🟡 Medium | 中 | SEN 學生對 color overload 敏感 | §3.3 domain 級主色重構;可加「減少顏色」setting toggle |
| **R18** | Cross-student 進度混 | 🟠 High | 低 | multi-student 切換(已有 8 個 sprint 護住) | 已有 `data-action-guard.test.js` 3 student 切換場景;新功能要 preserve student-scoped storage 慣例 |
| **R19** | 反思日記 sentiment 標籤 bias | 🟡 Medium | 低 | 3 emoji (😊/😐/😢) 對 ASD 學生可能 oversimplify | 加 5-point scale toggle;老師後台看 raw data;**唔用 sentiment 做 high-stake 決策** |
| **R20** | Daily streak timezone bug | 🟡 Medium | 高 | 跨時區同學同日同 scenario | server-side anchor(同 1.1),fallback localStorage 0 點 local time;e2e test 涵蓋 4 個時區 |

### 5.2 風險緩解 checklist(每個新 feature 必過)

- [ ] 學生私隱 impact 評估(R1)
- [ ] AI 內容 source 限定(R2)
- [ ] XSS escape(R10) — display 任何 user input 必過 `escape.js`
- [ ] A11y SR announce + keyboard nav(R9)
- [ ] e2e click matrix — `data-action` ↔ `window.FC` bridge 一致(R16)
- [ ] Student-scoped storage 命名 `fc_<feature>_<studentId>`(R18)
- [ ] 唔破壞現有 58 個 unit test + 17 chunk 載入

---

## 6. Debug 與系統穩定性測試項目

### A. 功能回歸(regression)

- [ ] 259 條 scenario 全部可 play 到 Result(Playwright loop + 截圖,`tests/e2e/scenario-render.spec.mjs`)
- [ ] 17 個 topic 切換冇 race condition(已有 `race-bug.test.js`,要再加 subjectProgress total lock-in 場景)
- [ ] TTS zh-HK / zh-TW / zh-CN 三 chain 全部 fallback 通(Sprint 6 已有,新 browser 要重跑)
- [ ] Creed MP3 → TTS fallback 100% 通
- [ ] 匯入/匯出 JSON 老 data 唔失(creed migration 自動)
- [ ] 老師 mode 17 個 category toggle 全部生效(S10 backlog 已有)

### B. A11y(SEN 核心)

- [ ] `tools/a11y/audit-fc.mjs` axe-core 全頁 0 violation(CI gate)
- [ ] 鍵盤 Tab 順序合理:Home → Topic → Scenario → Result → Home
- [ ] SR announce scenario load / option choice / result outcome 全部通(已有 `Toast.js:announceScenarioLoad`)
- [ ] 高對比模式 / 減少動畫模式 / 大字模式 3 個 setting toggle 即時生效
- [ ] Voice button `.speaking` class pulse 同步 TTS 開始/結束(Sprint 5 T3 已有)
- [ ] **新功能 a11y test** — 每個新 component 必加 `data-action` / `aria-*` / focus trap test

### C. 性能(已有 baseline)

- [ ] First Contentful Paint < 1.5s(3G)
- [ ] 撳 topic 到 scenario 顯示 < 500ms(per-chunk lazy load)
- [ ] 連續玩 50 條 scenario 冇 memory leak(監聽 `performance.memory.usedJSHeapSize`)
- [ ] WebP 化 21 張 scene 圖(SPEC §9 S8 backlog,PWA precache 縮減)

### D. 安全

- [ ] 反思日記 free text render 必 escape(`escapeAttr`/`escapeJsString`)(R10)
- [ ] Scenario import JSON 校驗 schema(已有,但新 field 要 update)
- [ ] 老師 PIN / 家長 PIN 暴力破解阻擋(5 次鎖 5 分鐘)(R15)
- [ ] CSP header 加 `script-src 'self'`,防止 inline script XSS
- [ ] **新功能 input** 全部過 `escape.js`

### E. 兼容性

- [ ] iOS Safari 17+ / Chrome 120+ / Edge 120+ / Firefox 120+ 全部 100% 通
- [ ] 平板(iPad)橫向 / 直向切換 layout 唔爆
- [ ] 純離線模式全部 259 條 scenario 可玩(PWA precache)
- [ ] 多 student 切換 progress 唔混(已有 `data-action-guard.test.js`,加 3 student 切換場景)

### F. 新功能 specific

| Feature | 必測項目 |
|---|---|
| **1.1 Daily Pick** | 跨時區同學同日同 scenario? server-side anchor;streak 用 server time;e2e 涵蓋 4 個時區 |
| **1.2 反思日記** | MediaRecorder API Safari 14.1+ 支援;voice memo 大小超限 graceful fail;free text XSS;30 條 rollover 唔失舊 data |
| **1.3 編輯器** | schema 校驗 + dry-run preview + 校對流程 + 自訂 scenario 同 default 隔離 |
| **1.4 PDF export** | 中文唔亂碼(用 print CSS);多 page 正確分頁;圖片 load 完先 export |
| **1.5 兩個 locked game** | board state 持久化 + 棋盤公平性(隨機但有 seed);undo / redo 唔爆 |
| **1.6 AI 解釋** | rate limit(已有 MiniMax ~3 並發);response cache 24h;fallback static text;**敏感 topic 過濾** |
| **1.7 家長連結** | 6 位 PIN 加密 + 5 次鎖 + read-only token expire 30 日;**完全 read-only 無寫入 API** |
| **1.8 多語言** | EN/普通話 scenario 數據正確;UI 切換唔失 progress;TTS 唔變(繼續 zh-HK) |
| **2.1 Onboarding** | 3 步 wizard 中途離開下次 resume 唔失;localStorage `fc_onboarded` flag |
| **4.2 Auto-analytics** | CSV 匯出 row > 10k 自動 split;學生姓名 hash;老師資料匯出 opt-in |
| **4.3 Spaced Repetition** | 7/30/90 日推算正確(用 student local time);唔推已刪除 scenario |

### G. 數據遷移 / 兼容

- [ ] 舊 V2.2 user import V3 自動 migrate(已有)
- [ ] 加新 LEGACY_CREED id 23+ 唔影響舊 user
- [ ] `subjects.js` 改 value subject 設定,舊 progress 自動 remap
- [ ] 反思日記 schema 變動(如有)向後兼容舊 data

### H. 監控 / 觀察性

- [ ] 學生 silent error 收集(用 `window.addEventListener('error')` 上報,純 client 端,無 PII)
- [ ] TTS fail rate 追蹤(已有 `isSpeaking` expose,可加 metric)
- [ ] PWA install / uninstall 率(已有 `sw-register.js`)

---

## 7. 推薦落地優先序

### 7.1 整體判斷

**如果只可以揀一個 sprint 開始**,推薦 **1.1 Daily Pick + 1.2 反思日記(合併 1 個 sprint)**:

| 理由 | 詳情 |
|---|---|
| **解決 2 個 core 痛點** | 「唔知玩咩」+「玩完冇沉澱」→ 直接 hit engagement metric |
| **Reuse 現有 module** | 全部用 `EventBus` / `Toast` / `audio.js` / `storage.js`,唔使新 architecture |
| **已有 58 unit test 守** | 新功能有 baseline 守,風險低 |
| **唔觸及 legacy migration / backend** | 純 client-side 改動,加 spec 過 SPEC.md 即可 |
| **AI / PIN / PDF 全部唔涉** | 唔觸發 R1/R2/R12/R15 高風險,容易 ship |

### 7.2 Sprint 推薦(由 cheap 到 heavy)

> V1.1 ship status(2026-06-23):✅ = 已 ship,🟡 = 部分 ship,❌ = 仍 backlog,🔄 = scope 改咗

| Sprint | 工作 | 工時 | 風險 | 預期 impact | 狀態 |
|---|---|---|---|---|---|
| **S15** | **1.1 Daily Pick + 1.2 反思日記** | 1 sprint(3-4 日) | 🟢 Low | 🟠 High(engagement) | ✅ **Done**(SPEC §16,043fc45) |
| **S16** | **1.6 AI 解釋助手 PoC** | 1 sprint(2-3 日) | 🟡 Medium(R2) | 🟠 High(理解深度) | 🔄 **Scope 改**:**S16 改做 Stop-and-Think / 書面語化 / Result TTS**(SPEC §17,7a8519d)。AI 解釋助手留 S17+ |
| **S17** | **2.1 Onboarding + 2.2 TTS 語音選擇** | 1 sprint(3 日) | 🟢 Low | 🟡 Medium(retention) | 🔄 **Scope 改**:**S17 改做全 17 topic 書面語化 + stopAndThink 補齊**(SPEC §18,e512d18)。Onboarding + TTS UI 留 S18+ |
| **S18** | **1.5 關係花園 game 解鎖** | 1.5 sprint | 🟡 Medium | 🟠 High(差異化) | ❌ backlog |
| **S19** | **1.3 老師編輯器** | 2 sprint | 🟡 Medium | 🟠 High(老師 empowerment) | ❌ backlog(SPEC §10 已決定唔做 web editor) |
| **S20** | **1.5 道德大富翁 game 解鎖** | 2 sprint | 🟡 Medium | 🟡 Medium | ❌ backlog |
| **S21** | **3.1-3.3 品牌 + 配色 + dark mode** | 1 sprint | 🟢 Low | 🟡 Medium(品牌) | ❌ backlog(但 S16 嘅 HC / RM mode 已經開始 accessibility 準備) |
| **S22** | **1.7 家長連結 + 4.2 Auto-analytics** | 1.5 sprint | 🟠 High(R1/R15) | 🟠 High(家庭 engagement) | ❌ backlog |
| **S23** | **1.4 PDF export + 1.8 多語言** | 1 sprint | 🟡 Medium(R12) | 🟡 Medium | ❌ backlog |
| **S24** | **4.3 學習體驗自動化群** | 1 sprint | 🟢 Low | 🟡 Medium(adaptivity) | ❌ backlog |
| **S25** | **4.4 內容運維自動化** | 0.5 sprint | 🟢 Low | 🟡 Medium(運維) | ❌ backlog(但 S17 嘅 scenarios_v2.mjs generalize 已部分達到) |

### 7.2.1 Sprint 15-17 實際 ship scope(2026-06-23)

**Sprint 15**(SPEC §16 — Daily Pick + Reflection Journal):
- `src/daily.js` 新 module — 每日情境之星 + streak
- `src/reflection.js` 新 module — 3 emoji + free text + voice memo
- IndexedDB 30-day auto-prune + 30 entry cap
- SPEC §16 freeze

**Sprint 16**(SPEC §17 — Stop-and-Think + 書面語化 + Result TTS):
- `src/domain/Feedback.js` 新 — 11 個 pure function(formatStopAndThink / shouldRenderStopAndThink / stripEmojiForTTS)
- `docs/STYLE_GUIDE_V3.md` 新 — 30 mapping + 文風規則 + blacklist
- `tools/style/audit-scenarios.mjs` 新 — CI script
- `tools/migrate/empathy_v2.mjs` 新 — empathy topic 書面語化
- `src/audio.js` + 3 export — speakOptionText / speakConsequence / speakStopAndThink
- empathy topic:43 options 書面語 + 21 negative options 加 stopAndThink
- `package.json` 2.0.0 → 2.2.0

**Sprint 17**(SPEC §18 — generalize 書面語化 + 全 17 topics):
- `tools/migrate/scenarios_v2.mjs` 新 — generalize migration tool(取代 empathy_v2.mjs)
- `tests/sprint17-migration.test.js` 新 — 9 個 cross-topic 驗證 test
- 16 個 topic 全 migrate + stopAndThink 補齊
- Auto-trim length limits(optionText ≤30 / effectsComment ≤40)
- Audit ACCEPTED_COMPOUNDS whitelist formalize(`大話`/`電話`/`講話` etc.)
- SPEC v3.7 → v3.8 + §18 freeze
- `package.json` 2.2.0 → 2.3.0

### 7.3 Anti-pattern(避免)

- ❌ **AI 生成 scenario 內容**(R2/R19,太危險,對 SEN 學生)
- ❌ **一次過 3 個 game 解鎖**(scope creep,R14)
- ❌ **backend sync 變真實 server 第 1 個 sprint 做**(R13,風險高,應最後)
- ❌ **1 個 sprint 同時做 3+ 個 feature**(失去 focus,測試覆蓋率跌)
- ❌ **TTS 換成 server-side TTS**(成本 + latency,Web Speech API 夠用)

### 7.4 開工前確認

揀咗 sprint 之後,先答以下問題再開工:

1. **呢個 sprint 解決咗邊個痛點**?(參考 §0.3 8 個痛點)
2. **預期 metric 升幾多**?(engagement +X% / completion +Y% / teacher adoption +Z%)
3. **觸及邊個現有 module**?(確認 import graph 唔爆)
4. **新 unit test 預計加幾多個**?(目標:每個 feature +3~5 個)
5. **R1-R20 邊個風險 triggered**?(必填,確認緩解策略)

---

## 8. 變更記錄

| 日期 | 版本 | 改動 | 作者 |
|---|---|---|---|
| 2026-06-19 | V1 | 初始 proposal,4 維度 + 風險 + 測試 + 優先序 | Mavis(per user request) |
| 2026-06-23 | **V1.1** | **Sprint 15/16/17 ship status** — §0.2 規模更新、§0.3 痛點加解決狀態、§7.2 sprint 表加 ✅/🔄 狀態、加 §7.2.1 實際 ship scope、加 §9 Ship Status Snapshot | Mavis(per user request) |

---

## 9. Ship Status Snapshot(2026-06-23, post-Sprint 17)

### 9.1 已 ship(Sprint 15-17,3 sprints 內)

| Feature | Proposal § | Sprint | SPEC § | Status |
|---|---|---|---|---|
| **Daily Pick + Streak** | 1.1 | S15 | §16 | ✅ Shipped |
| **Reflection Journal**(3 emoji + text + voice memo) | 1.2 | S15 | §16 | ✅ Shipped |
| **Stop-and-Think Panel** | (out-of-proposal,user feedback) | S16 | §17 | ✅ Shipped |
| **書面語化**(empathy topic + 全 17 topics) | (out-of-proposal,user feedback) | S16-S17 | §17 + §18 | ✅ Shipped(100%) |
| **Result TTS 擴展**(speakOptionText/Consequence/StopAndThink) | (out-of-proposal,user feedback) | S16 | §17 | ✅ Shipped |
| **Auto-trim length limits** | (out-of-proposal,SPEC freeze) | S17 | §18 | ✅ Shipped |
| **Audit CI**(`npm run audit:style`) | 6.1 testing | S16-S17 | §17 + §18 | ✅ Shipped(0 violations) |
| **Generalize migration tool** | (out-of-proposal,S17 retrospective) | S17 | §18 | ✅ Shipped(`scenarios_v2.mjs` idempotent) |

### 9.2 Scope 改咗(proposal 預測 vs 實際)

| Proposal 預測 | 實際做 | 原因 |
|---|---|---|
| S16 = AI 解釋助手 PoC(§1.6) | S16 = Stop-and-Think + 書面語化 + Result TTS | User feedback(PRODUCT_PROPOSAL_V1 review 時嘅 3 個 explicit UX 要求),優先過 AI(避免 R2 風險) |
| S17 = Onboarding + TTS UI(§2.1+2.2) | S17 = 全 17 topics 書面語化 generalize | S16 empathy 試水溫效果好,S17 推 generalize;Onboarding / TTS UI 留 S18+ |
| 1.3 老師編輯器(S19) | 唔做 web editor | SPEC §10 已確認移除 web editor(proposal 寫嘅 `痛點 3` 跟住決定 skip) |

### 9.3 Backlog 仍然 hold(S18+)

| Feature | Proposal § | Status | 預估 sprint |
|---|---|---|---|
| 1.5 關係花園 game 解鎖 | 1.5 | ❌ backlog | S18 |
| 1.5 道德大富翁 game 解鎖 | 1.5 | ❌ backlog | S20 |
| 3.x 品牌 + 配色 + dark mode | 3.1-3.6 | ❌ backlog(S16 HC/RM mode 已 partial) | S21 |
| 1.7 Family Link + backend | 1.7 | ❌ backlog(R1/R15 高風險) | S22 |
| 1.4 PDF export + 1.8 多語言 | 1.4 + 1.8 | ❌ backlog | S23 |
| 4.3 / 4.4 自動化 | 4.3 + 4.4 | ❌ backlog(S17 scenarios_v2 部分達到) | S24-S25 |
| 2.1 Onboarding | 2.1 | ❌ backlog(S17 改咗 scope) | S18+ |
| 2.2 TTS 語音選擇 UI | 2.2 | 🟡 partial(S17 加 audio export,UI 仲未接) | S18+ |
| 2.3 Scenario List Filter | 2.3 | ❌ backlog | S18+ |
| 2.4 Hint UX 改進 | 2.4 | 🟡 partial(S13 fix revealNextHint backend,S16+ Result UX 加強) | S19+ |

### 9.4 推薦 next sprint(S18)

根據 V1.1 review,推薦 S18 集中做 **onboarding + TTS UI**(原本 S17 scope):
- ✅ 全部 reuse S17 嘅 infrastructure(audio.js 已有 setTTSLang / getTTSLang,只欠 UI 線)
- ✅ 解決 2 個 partial 痛點(#5 TTS 入口 + #2 onboarding first-run)
- 🟢 Low risk(冇 backend / 冇 AI)
- 🟡 Medium impact(retention + first-impression)

S19 之後 keep proposal 原 roadmap(1.5 關係花園 S18→S19,1.5 道德大富翁 S20)。

### 9.5 S17 retrospective(S17 學到嘅嘢)

| 發現 | 對未來 sprint 嘅 implication |
|---|---|
| Migration tool generalize 應該 S15 一早做(Sprint 16 已經寫咗 empathy 專用,後尾要 retrofit) | 下次新 infrastructure 工具一開始就 parameterize,避免 retrofit |
| Audit exception 規則(`係` predicate / `話` compound noun)要一開始 formalize,唔好留到 S17 先加 | 新規則第一次引入時,inline 寫 SPEC freeze comment,唔好 defer |
| Idempotency 應該每個 batch tool 第一個 acceptance criteria | `re-run 0 changes` 必過,避免 double-apply |
| Length auto-trim 應該喺 tool 入面做,唔好 audit fail 之後先 manual override | Tool 應該 self-correct 而唔係 throw error |

---

## Appendix A: 觸及檔案總覽(待 sprint 啟動時展開)

### A.1 現有 module map(SPEC §5.1)

```
main.js (entry)
├── engine.js (renders)
├── domain/ (9 modules: ScenarioEngine / Moral / Progress / Student / Auth / Play / IO / EventBus / Analytics)
├── games/ (2: Hub / GoodDeedBank)
├── components/ (3: blocks / chrome / Toast)
├── actions/ (2: index / inline — Sprint 14.2 新 single registry)
├── constants/ (1: bank)
├── util/ (1: escape)
├── audio.js (TTS + SFX)
├── storage.js (STORAGE_KEYS + helpers)
├── subjects.js (single value subject)
├── topics.js (VALUES + CARING = 17)
├── creeds.js (12 VALUE + 10 LEGACY)
├── teacher.js (lazy-loaded)
├── sync.js (stub)
├── nav.js (navigate)
├── i18n.js (STRINGS + t())
└── sw-register.js (PWA)
```

### A.2 新 module 預計(sprint 啟動時建立)

| Module | 對應 feature | 估計 size |
|---|---|---|
| `src/daily.js` | 1.1 | ~150 行 |
| `src/reflection.js` | 1.2 | ~200 行 |
| `src/teacher/editor.html` + `.js` | 1.3 | ~500 行 |
| `src/family.js` + `src/family.html` | 1.7 | ~300 行 |
| `src/ai/explainer.js` | 1.6 | ~200 行 |
| `src/ai/safe-call.js` | 4.1 通用 | ~100 行 |
| `src/games/RelationshipGarden.js` | 1.5 | ~400 行 |
| `src/games/MoralMonopoly.js` | 1.5 | ~600 行 |
| `src/components/Onboarding.js` | 2.1 | ~250 行 |
| `src/util/print.css` | 1.4 | ~150 行 |
| `src/components/FilterBar.js` | 2.3 | ~100 行 |

### A.3 跨 sprint 共享基礎(sprint 啟動前做)

| 基礎 | 對應功能 | 預估 |
|---|---|---|
| `src/ai/safe-call.js` | 1.6 / 1.8 / 4.1 | 0.2 sprint |
| `src/util/voice-recorder.js`(MediaRecorder wrapper) | 1.2 | 0.3 sprint |
| `src/util/indexed-db.js`(反思日記 + voice memo 儲存) | 1.2 | 0.3 sprint |
| `src/components/Skeleton.js` | 2.6 | 0.2 sprint |
| `src/util/print-export.js` | 1.4 | 0.2 sprint |

> **建議**:Sprint 15 開工前,先用 0.5 sprint 起 `src/ai/safe-call.js` + `src/util/voice-recorder.js` + `src/util/indexed-db.js` 3 個共享基礎,後面 sprint 全部受惠。

---

## Appendix B: 與 Gundam Halo / Hermes 嘅 cross-reference

呢個 product 同 Gundam Halo 嘅 Mavis / Hermes infrastructure 有幾個 sharing 機會:

| 共享 | 描述 |
|---|---|
| **MiniMax API** | 1.6 / 1.8 / 4.1 AI 功能可直接用(已有 M2/M3 cluster,不共享 key,小心配對) |
| **Tailscale** | 1.7 家長連結 + 4.2 backend 可用 Tailscale 內網(無 public 暴露) |
| **Mavis 監控** | 老師 mode backend 異常可由 Mavis 統一監控 |
| **Hermes 提示詞 template** | AI 解釋 prompt 可參考 Hermes 嘅 tone-of-voice guideline |

> **唔共享**:Scenario 內容 / 學生資料 / 反思日記 — 純 client-side + 學校自家 backend。

---

*End of PRODUCT_PROPOSAL_V1.md — 2026-06-19*
