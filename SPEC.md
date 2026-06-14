# 友愛教室 V3 — 完整規格書 (v3.0)

> 基於 v2.2 framework 重整：對齊 EDB 12 種首要價值觀 + 5 個 SEL / 安全範疇
>
> *規格日期：2026-06-13 | v3.0 | 最後更新：2026-06-14（scenario 數 sync 至 259）*

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

```
friendly-classroom-v2/
├── index.html              # 極簡 shell
├── package.json            # Vite + gh-pages
├── vite.config.js
├── data/
│   ├── scenarios.json              # V3.1: 259 scenarios (17 topics ≥15)
│   ├── scenarios.json.bak          # V3 凍結備份
│   ├── scenarios.backup-gift.json  # benevolence 加 scenario 前 snapshot
│   └── scenarios.json.pre-v3.bak   # V2.2 原始備份
├── src/
│   ├── main.js             # 入口 + 狀態機
│   ├── engine.js           # 渲染邏輯（renderHome/group-by-domain）
│   ├── topics.js           # V3: 12 VALUES + 5 CARING
│   ├── creeds.js           # V3: 12 VALUE_CREEDS + 10 LEGACY_CREEDS
│   ├── subjects.js         # 單一 value subject
│   ├── style.css
│   ├── audio.js            # Web Speech API
│   ├── progress.js         # localStorage 進度
│   ├── miniMax.js          # MiniMax 圖像生成
│   ├── sync.js
│   ├── teacher.js
│   ├── sw-register.js
│   ├── domain/
│   │   ├── ScenarioEngine.js
│   │   ├── Moral.js
│   │   ├── Progress.js
│   │   └── EventBus.js
│   └── games/
│       └── GoodDeedBank.js
├── migrate_scenarios.py    # V3 migration script（一次性）
└── .github/workflows/
    └── deploy.yml
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
- 語音朗讀題目 + 選項（Web Speech API）
- 減少文字量，多用圖示/emoji
- 操作要有語音確認

### 7.2 SEN 原則
- 一步驟一畫面，避免 multitasking
- 正向 feedback 為主，減少負面打擊
- 圖像優先於文字
- 明確的視覺反饋（顏色/動畫）

### 7.3 V3 新增
- **risk level 顯式標記**：caring 範疇 scenarios 喺 play 頁面會顯示 risk badge（1/2/3），家長老師一睇就知
- **creed message tone**：用 EDB 官方 wording（"我們是..." 句式），增強歸屬感

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

## 9. 待辦 sprint

> **2026-06-14 update**：S2 / S3 / S4 已 done（commit `683c5f6` 達 259 條，outcome images 186 張齊）。餘下係 production-readiness + 質量。

| Sprint | 工作 | 估時 | Status |
|---|---|---|---|
| ✅ V3.0 framework freeze | topics.js / creeds.js / scenarios.json / engine.js | Done | `acb9310` |
| ✅ S2: 擴張 scenarios 至 17×15 = 259 | 含 national-identity 8 條（EDB 133/2025）| Done | `683c5f6` + `6cbc9c9` |
| ✅ S3: gen outcome images | 186 張 outcome images（部分 scenario 共享）| Done | `c1e43ee` |
| ✅ S4: UI polish — domain card / daily streak / creed | 多輪 polish | Done | `d5758c9` / `f2cc8a0` / `0672d81` |
| 🟡 S5: E2E test — 每個 category 做齊至少 1 條 | 17 topic × ≥1 = 17 條 test | ~1.5 hr | Pending |
| 🟡 S6: 老師 mode 確認 17 個 category toggle | regression test | ~30 min | Pending |
| 🟡 S7: 清 `_defaultProgress()` V2.2 死 topic IDs | `emotions/honesty/conflict` 4 個 dead entry | Done | this commit（2026-06-14）|
| 🟡 S8: SPEC 121 → 259 sync | §1.3 / §5 / §8 / §9 | Done | this commit（2026-06-14）|
| 🔴 S9: Backend deploy | FastAPI 上 Render / Fly，sync endpoint 真正 wire-up | ~2 hr | Pending |
| 🔴 S10: `/api/teacher/import` 真正 implement | multipart + JSON merge | ~1 hr | Done |
| 🟡 S11: GoodDeedBank risk filter | default `riskLevel ≤ 1`，老師可 toggle「全難度」| ~30 min | Pending |
| 🟢 S12: 拆 `engine.js` 1147 行 + `main.js` 1049 行 | `render/home.js` / `render/play.js` etc. | ~半天 | Backlog |

---

## 10. 已移除功能

- ❌ 自由模式（random 跨課題）— 破壞學習階梯
- ❌ 🚪門課題（社交故事類）— 唔係德育題目
- ❌ Phase 2 teacher-editor — 改為直接編輯 JSON
- ❌ V2.2 嘅 4 大主題分組（emotions/respect/honesty/conflict）— 已被 12+5 取代

---

*規格日期：2026-06-13 | 最後更新 2026-06-14 | v3.1（scenario 數 121 → 259）| 取代 v2.2（2026-06-04）*
