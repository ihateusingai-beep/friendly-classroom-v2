// 🏦 好人好事銀行 — Good Deed Bank
//
// Mechanic: 學生揀 option，moralChange > 0 → 存款 (+💰 + 印章)
//                          moralChange < 0 → 扣款 (-💸 + 紅印)
//                          moralChange === 0 → noop
//
// Win: 存款達到目標 (TARGET_BALANCE)。Loss: 結餘 ≤ 0 (bankrupt)
//
// 重用 ScenarioEngine.playScenario + applyScenarioResult 嘅 output
// 完全唔使改 scenarios.json
//
// Difficulty filter（2026-06-14 S11）：老師可以限制題目嘅 max risk level
// - 0 = 只 value（0 risk 嘅 scenario 最多）
// - 1 = value + 輕 caring（小一生 default）
// - 2 = value + caring 1-2（中至高年級）
// - 3 = 全開（pool 全部）
// 預設 1（bankMaxRiskLevel 讀 localStorage；冇 set = default 1）

import { getScenarios } from '../domain/ScenarioEngine.js';

const TARGET_BALANCE = 100;     // 達到呢個數 = 品格富翁
const BANKRUPT_THRESHOLD = -50; // 結餘跌穿呢個 = 破產 end state
const QUESTIONS_PER_RUN = 8;    // 每局 N 題

// 合法 risk ceiling 0..3，4 = sentinel "全開"（內部用 Number.POSITIVE_INFINITY）
const VALID_MAX_RISK = new Set([0, 1, 2, 3]);

// 將 user-facing 數字（0/1/2/3）normalize，唔合法 fallback 1
// 注意：null / undefined / 非數字 → 1（default），但 0 要明確傳先接受
export function normalizeBankMaxRisk(val) {
  if (val === null || val === undefined || val === '') return 1;
  const n = Number(val);
  if (!Number.isFinite(n)) return 1;
  return VALID_MAX_RISK.has(n) ? n : 1;
}

// Filter scenarios by max risk level。scenario.riskLevel missing = 當 0 對待
function filterByRisk(scenarios, maxRisk) {
  if (maxRisk >= 3) return scenarios; // 3 = 全開 shortcut
  return scenarios.filter(s => Number(s.riskLevel ?? 0) <= maxRisk);
}

// 隨機抽 N 個唔同 topic 嘅 scenarios 做呢局題目
// maxRisk: 0/1/2/3 (預設 1)。filtered pool 細過 N → fallback 用全部 pool（防呆）
function pickQuestionsForRun(n, maxRisk = 1) {
  const all = getScenarios();
  if (!all.length) return [];
  const filtered = filterByRisk(all, maxRisk);
  const pool = filtered.length >= n ? filtered : all;
  // Fisher-Yates partial shuffle
  const arr = pool.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

// 讀老師 config 嘅 bankMaxRiskLevel，唔存在 / 壞 = 1
function readBankMaxRiskFromConfig() {
  try {
    const cfg = JSON.parse(localStorage.getItem('fc_teacher_config') || '{}');
    return normalizeBankMaxRisk(cfg.bankMaxRiskLevel);
  } catch {
    return 1;
  }
}

// ── Game state ──
let run = null; // { balance, stamps, history, questions, currentIdx, status, maxRisk }

export function startBankRun(options = {}) {
  // options.maxRisk 優先；fallback 老師 config；再 fallback default 1
  const maxRisk = options.maxRisk !== undefined
    ? normalizeBankMaxRisk(options.maxRisk)
    : readBankMaxRiskFromConfig();
  run = {
    balance: 0,
    stamps: [],        // array of { delta, label, ts } for ledger
    history: [],       // 每題揀咗咩
    questions: pickQuestionsForRun(QUESTIONS_PER_RUN, maxRisk),
    currentIdx: 0,
    status: 'playing', // playing | won | bankrupt | finished
    maxRisk,           // 記低用嚟 end-summary 同 SR announce
  };
  return run;
}

export function getBankRun() {
  return run;
}

export function endBankRun() {
  run = null;
}

// 學生答咗一題 — 入 moralChange (applyScenarioResult 已經回傳咗)
export function recordBankTransaction(moralChange, scenarioTitle) {
  if (!run) return;
  const delta = moralChange || 0;
  const oldBalance = run.balance;
  run.balance += delta;
  run.stamps.push({
    delta,
    label: scenarioTitle || '',
    ts: Date.now(),
  });
  // 落落 history
  run.history.push({ moralChange: delta, scenarioTitle });
  // 最後一題 → finished
  if (run.currentIdx >= run.questions.length - 1) {
    run.status = 'finished';
  }
  // 結餘超標
  if (run.balance >= TARGET_BALANCE && run.status === 'playing') {
    run.status = 'finished';
  }
  // 破產
  if (run.balance <= BANKRUPT_THRESHOLD) {
    run.status = 'bankrupt';
  }
  return { oldBalance, newBalance: run.balance, status: run.status };
}

export function advanceToNextQuestion() {
  if (!run) return null;
  run.currentIdx = Math.min(run.currentIdx + 1, run.questions.length);
  return run;
}

export const BANK_CONFIG = {
  TARGET_BALANCE,
  BANKRUPT_THRESHOLD,
  QUESTIONS_PER_RUN,
  DEFAULT_MAX_RISK: 1,  // S11 default：低 caring 都唔包（適合小一）
};

// user-facing label，用喺 Game Hub 提示 / SR announce
export const BANK_RISK_LABELS = {
  0: '只價值觀（無 caring）',
  1: '輕 caring（default）',
  2: '中 caring',
  3: '全難度',
};
export function bankRiskLabel(level) {
  return BANK_RISK_LABELS[normalizeBankMaxRisk(level)] || BANK_RISK_LABELS[1];
}
