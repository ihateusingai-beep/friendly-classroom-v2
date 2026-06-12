# Friendly Classroom V2 — 長期架構優化 Plan（Phase 1）

**目標**：建立 Domain Layer，支援多人遊戲（各玩家 independent moral/progress）+ RPG/Blooket 擴展

**日期**：2026-06-10
**負責**：Unicorn（NT-D）
**狀態**：待批准執行

---

## Phase 1（本週）

### 0. 清理 Subject/Topic 重複（先做，簡單乾淨）

- `engine.js` 刪除 `_SUBJECTS` + `getSubjectColor/BgColor/Name/Emoji`，改 import from `subjects.js`
- `main.js` 刪除重複的 `SUBJECTS` 常數 + helper，直接 import `subjects.js` 的
- `teacher.js`（renderTeacher 函數內）整合到 `subjects.js` helper
- **驗證**：全域搜 `getSubjectColor`，只剩 `subjects.js` 一個定義點

---

### 1. Domain 層 `src/domain/`

#### `Moral.js` — 道德值核心

```js
// 計算 score 對應的 level
export function getMoralLevel(score) // 'danger'|'warning'|'good'

// 計算道德值百分比（-50~100 → 0~100）
export function calculateMoralPercent(score)

// 套用 scenario 結果 → 回傳結構化 result
export function applyScenarioResult(scenario, optionId, studentId) {
  return {
    moralChange: number,
    newScore: number,
    triggeredCreeds: Creed[],
    isPositive: boolean,
    mainComment: string,
  }
}

// 純 render helper（只產 data，不寫 DOM）
export function getMoralBarData(score) // → { percent, color, label }
```

#### `ScenarioEngine.js` — 遊戲邏輯（重構 engine.js）

- 移除所有 render 函數
- 純遊戲狀態：`currentStudent`, `currentScenario`, `scenarios[]`
- `chooseOption(scenarioId, optionId)` → 呼叫 `Moral.applyScenarioResult` + `Progress.markComplete`
- `getScenarioStatus(scenarioId)` / `suggestNext(topicId)` / `initTopicProgress(topicId)`

#### `EventBus.js` — 事件總線

```js
export const bus = { on, off, emit }
// 事件清單：
//   'moral:updated'  { studentId, score, change }
//   'progress:updated' { studentId, scenarioId }
//   'scenario:completed' { studentId, scenarioId, result }
```

#### `Progress.js`（重構）— 進度管理

- 現有 `progress.js` → `domain/Progress.js`
- 每次 `markComplete` → `bus.emit('progress:updated', ...)`
- 新增 `getStudentSummary(studentId)` — 回傳道德、等級、已完成 summary

---

### 2. 重構 engine.js → Render Layer

- 所有 `render*()` 函數留在 `engine.js`
- `renderMoralBar(studentId)` — 接受 studentId 參數，從 `Moral.getMoralBarData()` 取 data
- 廣播監聽：`bus.on('moral:updated', (e) => { updateMoralBarDOM(e.studentId, e.score) })`

---

### 3. 重構 main.js

- state 精簡：只剩 view routing 狀態
- Progress/Moral 操作全走 domain 層
- EventBus 掛鉤：moral 更新時自動 refresh moral bar（不用手動 re-render）

---

### 4. 驗證點

- ✅ `applyScenarioResult` 可被 RPG 戰鬥系統直接呼叫（零 framework 依賴）
- ✅ `renderMoralBar(studentId)` 支援不同 studentId（多人場景基礎）
- ✅ 全域只有一個 Subject 定性點（`subjects.js`）
- ✅ EventBus 觸發 `moral:updated` 時，student 頁 moral bar 即時更新
- ✅ 無 breaking change — 現有 scenario 流程不變

---

## 後續 Phase（參考）

- **Phase 2**：Student 頁整合新 domain + 驗證
- **Phase 3**：Teacher 頁 bundle splitting
- **Phase 4**：PWA + 可選雲端同步層

---

**此 Plan 已包含遊戲框架擴展設計（RPG / Blooket 模式可直接使用同一條 applyScenarioResult 線）**

批准後執行：回覆「順序」