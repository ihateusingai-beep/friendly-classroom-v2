# ⚠️ 已過時 — 參考 [SPEC.md (v3.4)](./SPEC.md)

> **2026-06-17 deprecation notice**: 呢份 PLAN.md 係 **V1 → V2 嘅技術計劃書 (2026-05-29)**,
> 已經被 [SPEC.md v3.4](./SPEC.md) 全面 supersede。
>
> V3.1 (2026-06-13 framework freeze) + V3.2-3.4 (Sprint 6-13 fix batches) 嘅
> 範疇、scenario 數、creed 系統、模組架構、Sprint history 全部喺 SPEC.md。
>
> 保留 PLAN.md 純粹做 git archaeology 參考, **唔好再 reference 呢度嘅 scope / 數字 / module 設計**。
>
> 對 fresh onboarder: 跳過 PLAN.md, 直接睇 [SPEC.md](./SPEC.md) §1-§5 然後 §11 嘅 sprint history。

---

# 友愛教室 V2 — 技術計劃書 (legacy, 2026-05-29)

## 1. 現況分析

| 項目 | 現有 V1 | 目標 V2 |
|------|---------|---------|
| 檔案結構 | 單一 224KB HTML | 模組化 (Vite 打包) |
| Scenarios | 53 個內嵌 JS | 獨立 JSON/JS 模組 |
| CSS | inline style block | 獨立 styles/main.css |
| 音效 | 無 | audio.js 系統 |
| 匯入匯出 | String hack | Native JSON |
| 快取 | 零 | Vite hash bundle |
| GitHub Pages | 支援 | 支援 |

## 2. 目標功能

### 2.1 核心遊戲
- [ ] 3 個場景：課室、小息、家中
- [ ] 53+ moral scenarios (從 V1 移植)
- [ ] 關係值 (心仔) + 道德值系統
- [ ] 3-Tier hints 提示系統
- [ ] 語音朗讀 (Web Speech API)
- [ ] 設定：字體大小、語速、音效開關

### 2.2 數據管理
- [ ] 匯入 questions.json (V1 格式兼容)
- [ ] 匯出 questions.json
- [ ] 從 JSON 載入 scenarios
- [ ] 玩家進度 localStorage 儲存

### 2.3 架構
- [ ] Vite 打包 + HMR 開發伺服器
- [ ] ES Module 模組
- [ ] GH Pages 自動部署 (GitHub Actions)

## 3. 模組設計

```
src/
├── main.js           # 入口、初始化、遊戲狀態機
├── scenarios.js      # 53 scenarios 數據 + 工廠函數
├── engine.js         # 遊戲邏輯：選項結算、關係值計算、場景切換
├── ui.js             # DOM 渲染：場景卡、選項、結算彈窗
├── audio.js          # 音效播放、語音朗讀
├── settings.js       # 設定面板 localStorage 持久化
└── storage.js        # 玩家進度讀寫

data/
└── scenarios.json    # 可匯入匯出的 scenario 數據

styles/
└── main.css          # 所有樣式 (由 Vite 處理 CSS @import)
```

## 4. Scenario 數據格式

```javascript
{
  id: "s-classroom-1",
  title: "關卡：唔借筆比同學",
  location: "classroom",       // "classroom" | "break" | "home"
  background: "課室・上堂",
  description: "小美問你：「借支筆比我好唔好？」",
  hints: [
    "一支筆可以建立一段友誼 —— 點解唔試下？",
    "先試下從其他人既感受想一想？",
    "善良既選擇係分享文具，你會發掘身邊既友誼。"
  ],
  characters: [
    { name: "小美", emoji: "👩‍🎓", initialRelationship: 50 }
  ],
  options: [
    {
      id: "s-classroom-1-a",
      text: "話你自己問人啦",
      effects: [
        { character: "小美", change: -10, comment: "..." }
      ]
    },
    {
      id: "s-classroom-1-b",
      text: "借俾佢",
      effects: [
        { character: "小美", change: 15, moralChange: 5, comment: "..." }
      ]
    }
  ]
}
```

## 5. 遊戲狀態機

```
[Home] → [Location Select] → [Scenario] → [Result]
                                         ↓
                                   [Guidance Tip]
                                         ↓
                                   [Next Scenario] → [Home/End]
```

## 6. 技術棧

| 層 | 選擇 | 原因 |
|----|------|------|
| 構建 | Vite | 極速 HMR、ESM、GH Pages 插件 |
| 語言 | Vanilla JS (ES6+) | 無框架依赖，適合單一頁面遊戲 |
| 樣式 | CSS (Vite 處理) | 原生 CSS 足夠 |
| 數據 | JSON/JS 模組 | 可直接 import，熱更新 |
| 部署 | GitHub Actions | 自動 build + deploy |

## 7. 開發流程

```
Day 1:  Project scaffold + Vite + GH Actions
        ↓
Day 2:  搬遷 scenarios.js (53 個 from V1)
        ↓
Day 3:  engine.js 邏輯移植
        ↓
Day 4:  ui.js 渲染 + settings/storage
        ↓
Day 5:  audio.js 音效系統
        ↓
Day 6:  匯入匯出 JSON 功能
        ↓
Day 7:  測試 + bug fix + deploy
```

## 8. 驗收標準

- [ ] `npm run dev` 起 development server
- [ ] `npm run build` 產出 dist/ (GH Pages 可部署)
- [ ] 53 個 scenarios 全部可遊玩
- [ ] 關係值 + 道德值計算正確
- [ ] 3-tier hints 正常顯示
- [ ] 匯入匯出 questions.json 工作
- [ ] GitHub Pages URL 可訪問

---

*計劃日期：2026-05-29*