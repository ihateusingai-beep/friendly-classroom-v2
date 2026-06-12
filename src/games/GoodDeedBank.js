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

import { getScenarios } from '../domain/ScenarioEngine.js';

const TARGET_BALANCE = 100;     // 達到呢個數 = 品格富翁
const BANKRUPT_THRESHOLD = -50; // 結餘跌穿呢個 = 破產 end state
const QUESTIONS_PER_RUN = 8;    // 每局 N 題

// 隨機抽 N 個唔同 topic 嘅 scenarios 做呢局題目
function pickQuestionsForRun(n) {
  const all = getScenarios();
  if (!all.length) return [];
  // Fisher-Yates partial shuffle
  const arr = all.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

// ── Game state ──
let run = null; // { balance, stamps, history, questions, currentIdx, status }

export function startBankRun() {
  run = {
    balance: 0,
    stamps: [],        // array of { delta, label, ts } for ledger
    history: [],       // 每題揀咗咩
    questions: pickQuestionsForRun(QUESTIONS_PER_RUN),
    currentIdx: 0,
    status: 'playing', // playing | won | bankrupt | finished
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
};
