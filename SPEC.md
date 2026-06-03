# 友愛教室 V2 — 完整規格書 (v2.2)

> 基於用戶反饋優化：MiniMax 圖像生成 + 精簡架構

---

## 1. 學習框架

### 1.1 四個主題（直接對應學生核心問題）

| 主題 | 聚焦問題 | 信條 |
|------|---------|------|
| 🎭 情緒與規範 | 推撞、爭執、不守規則 | #1守法 #5禮讓 #7合作 |
| 🤝 尊重與關懷 | 言語攻撃、嘲笑、排擠、被孤立 | #4友愛 #5禮讓 |
| ⚖️ 誠實與責任 | 整爛嘢走、呃人、呃老師 | #2信實 #6勤力 |
| 💪 衝突與求助 | 被欺負、被人蝦、點求助 | #2信實 #5禮讓 #7合作 |

### 1.2 場景分組（58個場景）

```
🎭 情緒與規範
├── s6    鬧交（話唔再玩）
├── s-b3  唔小心整親人
├── s-new2  排隊被打尖
├── s-new18 整跌別人道歉
├── s-door1 排隊冲門口
├── s-door4 老師未允許自己開門
├── s-new8  唔記得帶功課
├── s-new22 想走堂
├── s-new15 組員發夢自己暴躁
├── s-h3   電玩被表弟恰
├── s-new23 排隊推人
└── s-new24 課室大叫

🤝 尊重與關懷
├── s1    嘲笑同學
├── s-b4  被排擠（你想join人）
├── s-b1  被言語攻擊
├── s5    整蠱
├── s-c2  杯葛（迫你揀人）
├── s-new16 笑同學作品
├── s7    安慰朋友
├── s-new10 關懷新同學
├── s-new4  雨天借遮
├── s-new1  借廁紙
├── s-new6  飯堂借錢
├── s-c5   考試幫朋友作弊
├── s-new19 見到欺凌
├── s-c7   網絡欺凌旁觀者
└── s-new25 網上笑人

⚖️ 誠實與責任
├── s4    花盆（整跌走唔走）
├── s2    幫人匿贓
├── s-c3  抄橋
├── s-c4  呃老師
├── s-c6  執錢不報
├── s-c8  整爛同學文具
├── s-c9  冒領讚賞
├── s-new9  整爛洗手間鏡
├── s-new11 圖書館逾期
├── s-new13 整爛窗簾
├── s-new5  運動場呃老師
├── s-new26 整親野走
├── s-new27 呃家長
└── s-new28 呃同學

💪 衝突與求助
├── s3    新朋友冷落你
├── s8    一個人坐
├── s-h1  網上被 targeted
├── s-h2  秘密被爆
├── s-h5  家庭group排除
├── s-new12 被冤枉打人
├── s-new20 老師問誠實回答
├── s-new17 聽人但心不在焉
└── s-new29 被人蝦點求助
```

### 1.3 信條系統（10條）

```javascript
export const CREEDS = [
  { id: 1, title: "守法的", text: "遵守校規，奉公守法" },
  { id: 2, title: "信實的", text: "誠實負責，不欺騙人" },
  { id: 3, title: "整潔的", text: "校服整潔，儀容端正" },
  { id: 4, title: "友愛的", text: "關心別人，互相幫助" },
  { id: 5, title: "禮讓的", text: "待人有禮，不易發怒" },
  { id: 6, title: "勤力的", text: "上課專心，努力學習" },
  { id: 7, title: "合作的", text: "遵守規則，積極參與" },
  { id: 8, title: "獨立的", text: "自己的事，自己去做" },
  { id: 9, title: "愛護學校的", text: "愛護公物，保護環境" },
  { id: 10, title: "感恩的", text: "尊敬師長，孝順父母" }
];
```

每個場景配送 1-3 條相關信條，答題後展示。

### 1.4 進度追蹤

```javascript
// localStorage: fc_progress
{
  name: "學生名",
  completedScenarios: ["s1", "s2", ...],
  topicProgress: {
    "emotions": { completed: 8, total: 12 },
    "respect": { completed: 5, total: 15 },
    "honesty": { completed: 3, total: 14 },
    "conflict": { completed: 6, total: 9 }
  },
  totalMoralScore: 75,
  lastPlayed: "2026-06-04"
}
```

---

## 2. 系統架構

```
friendly-classroom-v2/
├── index.html              # 極簡 shell
├── package.json            # Vite + gh-pages
├── vite.config.js
├── src/
│   ├── main.js             # 入口 + 狀態機
│   ├── scenarios.js        # 場景數據（58個）
│   ├── creeds.js           # 10條學校信條
│   ├── topics.js           # 主題定義
│   ├── engine.js           # 遊戲邏輯
│   ├── ui.js               # DOM 渲染
│   ├── audio.js            # 語音朗讀（Web Speech API）
│   ├── progress.js         # localStorage 進度
│   ├── miniMax.js          # MiniMax 圖像生成
│   └── style.css           # 所有樣式
├── data/
│   └── scenarios.json      # 場景數據（可獨立編輯）
└── .github/workflows/
    └── deploy.yml          # 自動部署 GH Pages
```

---

## 3. 場景數據格式

```javascript
{
  id: "s1",
  title: "嘲笑同學",
  topicId: "respect",
  background: "課室・小息",
  description: "小傑指著正在玩既小宇話：「我哋一齊笑佢好唔好？佢著既衫咁樣好搞笑呀！」",
  imagePrompt: "香港學校課室，兩個男仔指著另一個男仔笑，綠色校服，悲伤表情，FF XV Nomura動漫風格，溫暖色調，16:9",
  hints: [
    "語言暴力唔洗血，但一樣可以殺死人心",
    "如果被笑既係你，你會希望旁觀者做啲咩？",
    "善良既選擇係拒絕參與嘲笑"
  ],
  creedIds: [4, 7],
  characters: [
    { name: "小傑", emoji: "👦", initialRelationship: 50 },
    { name: "小宇", emoji: "👦", initialRelationship: 50 }
  ],
  options: [
    {
      id: "s1-a",
      text: "跟住一齊笑",
      effects: [
        { character: "小傑", change: 10, moralChange: -15, comment: "你同小傑笑得好開心！但係小宇低頭就走咗..." }
      ]
    },
    {
      id: "s1-b",
      text: "靜靜地走開",
      effects: [
        { character: "小傑", change: 0, moralChange: -5, comment: "你走開咗，但係成晚在想..." }
      ]
    }
  ]
}
```

---

## 4. MiniMax 圖像生成

### Prompt 模板

```javascript
// 固定風格
const STYLE = "FF XV Nomura anime style, character design, warm tones, clean background, no text, 16:9 aspect ratio, Hong Kong school uniform";

// 模板
const imagePromptTemplate = (scenario) =>
  `${scenario.description}, ${STYLE}`;

// 觸發條件
// - 新場景首次展示時生成
// - 已生成則緩存到 localStorage
```

### 圖像緩存策略

```javascript
// localStorage: fc_images
{
  "s1": "data:image/jpeg;base64,...",
  "s2": "https://...",
  ...
}
```

---

## 5. UI Flow

```
首頁
├── 📚 學習主題 ──→ 主題列表 ──→ 場景列表 ──→ 遊玩
├── 📊 我的進度 ──→ 進度圖（已完成/總數）
├── 📥 匯入匯出
└── ⚙️ 設定
```

---

## 6. 多學生模式 + 數據管理

### 學生模式
- 輸入名字 → 獨立 localStorage key `fc_progress_學生名`
- 學習主題 → 做題目 → 進度自動儲存
- 可 export 自己進度 JSON 備份

### 老師模式（密碼保護）
- 密碼：admin（可改）
- 睇全班學生進度列表
- 📥 匯入學生 JSON → 合併顯示
- 📤 匯出全班數據備份

### JSON 編輯（替代 teacher-editor）
- 老師直接編輯 `data/scenarios.json`
- 格式簡單，唔使特殊工具
- 有問題我幫手改

---

## 7. 特殊教育 UX 考量

### 適配（語音/sound commands）
- 大字 UI（預設 24px，可調至 32px）
- 語音朗讀題目 + 選項（Web Speech API）
- 減少文字量，多用圖示/emoji
- 操作要有語音確認

### 一般特殊教育原則
- 一步驟一畫面，避免 multitasking
- 正向 feedback 為主，減少負面打擊
- 圖像優先於文字
- 明確的視覺反饋（顏色/動畫）

---

## 8. 待確認事項

| 項目 | 狀態 |
|------|------|
| 四個主題分組 | ✅ 確認 |
| 信條關聯 | ✅ 確認 |
| MiniMax prompt 模板 | ✅ 確認 |
| 多學生模式 | ✅ 確認 |
| 老師 Dashboard + JSON 匯入/匯出 | ✅ 確認 |
| Web Speech API 語音朗讀 | ✅ 確認 |
| 校服外觀（MiniMax ref 圖） | ⚠️ 待你提供 |
| 新場景創作 | ⚠️ 按需補充 |

---

## 9. 已刪除功能

- ❌ 自由模式（random跨課題）— 破壞學習階梯
- ❌ 🚪門課題（社交故事類）— 唔係德育題目
- ❌ Phase 2 teacher-editor — 改為直接編輯 JSON

---

*規格日期：2026-06-04 | v2.2*