// 遊戲邏輯引擎（domain 層）— 無 DOM 依賴
// engine.js 的 render 函數留原位，此模組只處理遊戲狀態和邏輯

import { applyScenarioResult } from './Moral.js';
import { markComplete, getProgress, updateTopicTotal, updateSubjectTotal, isCompleted } from './Progress.js';
import { getCreedsByIds, formatCreeds } from '../creeds.js';

let currentStudent = null;
let currentTopic = null;
let currentScenario = null;
let scenarios = [];

// 追蹤已 init 過嘅 (student, topic) / (student, subject) 組合，避免每次 render 重覆寫入 + 觸發 sync
const initedTopicForStudent = new Set();   // key: `${student}|${topicId}`
const initedSubjectForStudent = new Set();  // key: `${student}|${subjectId}`

// ── Student ──
export function setStudent(name) {
  currentStudent = name;
  // 換學生後 init cache 都要清返，避免撈到舊學生嘅 record
  initedTopicForStudent.clear();
  initedSubjectForStudent.clear();
}
export function getStudent() { return currentStudent; }

// ── Scenarios ──
export function setScenarios(arr) { scenarios = arr; }
export function getScenarios() { return scenarios; }
export function getScenariosByTopic(topicId) {
  return scenarios.filter(s => s.topicId === topicId);
}

// ── Play ──
export function playScenario(scenarioId) {
  currentScenario = scenarios.find(s => s.id === scenarioId) || null;
  return currentScenario;
}

export function getCurrentScenario() { return currentScenario; }

export function chooseOption(scenarioId, optionId, subjectId) {
  const scenario = scenarios.find(s => s.id === scenarioId) || currentScenario;
  if (!scenario) return null;

  const result = applyScenarioResult(scenario, optionId, currentStudent);
  if (!result) return null;

  // 寫入進度（會觸發 EventBus）
  if (currentStudent && subjectId) {
    markComplete(currentStudent, scenario.id, scenario.topicId, result.moralChange, subjectId);
  } else if (currentStudent && !subjectId) {
    // Free mode fallback: 只累計 totalMoralScore + topic progress, 唔寫入 subjectProgress
    markComplete(currentStudent, scenario.id, scenario.topicId, result.moralChange, null);
  }

  // 回傳完整 result（render layer 使用）
  return {
    option: result.option,
    moralChange: result.moralChange,
    mainComment: result.mainComment,
    creeds: result.triggeredCreeds,
    creedText: formatCreeds(result.triggeredCreeds.map(c => c.id)),
    scenarioImage: scenario.image || null,
    scenarioTitle: scenario.title || '',
    outcomeImage: `assets/images/outcomes/${scenario.id}_opt${scenario.options.findIndex(o=>o.id===optionId)+1}.png`,
    nextScenario: result.option?.next_scenario || null,
  };
}

export function getScenarioStatus(scenarioId) {
  if (!currentStudent) return 'locked';
  return isCompleted(currentStudent, scenarioId) ? 'completed' : 'available';
}

export function initTopicProgress(topicId) {
  if (!currentStudent) return;
  const key = `${currentStudent}|${topicId}`;
  if (initedTopicForStudent.has(key)) return;
  initedTopicForStudent.add(key);
  const topicScenarios = getScenariosByTopic(topicId);
  updateTopicTotal(currentStudent, topicId, topicScenarios.length);
}

export function initSubjectProgress(subjectId) {
  // TODO: scenarios.json 而家冇 subjectId field。當 data 加返之後，
  // 喺度 filter 嗰個 subject 嘅 scenarios 先傳 total。
  // 而家 fallback 用全部 scenarios 嘅長度，避免 0 嘅 dead state。
  if (!currentStudent || !subjectId) return;
  const key = `${currentStudent}|${subjectId}`;
  if (initedSubjectForStudent.has(key)) return;
  initedSubjectForStudent.add(key);
  const all = getScenarios();
  updateSubjectTotal(currentStudent, subjectId, all.length);
}

export function getDisplayProgress() {
  if (!currentStudent) return null;
  return getProgress(currentStudent);
}

export function suggestNext(topicId) {
  const topicScenarios = getScenariosByTopic(topicId);
  if (!currentStudent) return topicScenarios[0] || null;
  const p = getProgress(currentStudent);
  return topicScenarios.find(s => !p.completedScenarios.includes(s.id)) || null;
}