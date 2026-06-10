// 遊戲邏輯引擎（domain 層）— 無 DOM 依賴
// engine.js 的 render 函數留原位，此模組只處理遊戲狀態和邏輯

import { applyScenarioResult } from './Moral.js';
import { markComplete, getProgress, updateTopicTotal, updateSubjectTotal, isCompleted } from './Progress.js';
import { getCreedsByIds, formatCreeds } from '../creeds.js';

let currentStudent = null;
let currentTopic = null;
let currentScenario = null;
let scenarios = [];

// ── Student ──
export function setStudent(name) { currentStudent = name; }
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
  if (currentStudent) {
    markComplete(currentStudent, scenario.id, scenario.topicId, result.moralChange, subjectId);
  }

  // 回傳完整 result（render layer 使用）
  return {
    option: result.option,
    moralChange: result.moralChange,
    mainComment: result.mainComment,
    creeds: result.triggeredCreeds,
    creedText: formatCreeds(scenario.creedIds || []),
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
  const topicScenarios = getScenariosByTopic(topicId);
  updateTopicTotal(currentStudent, topicId, topicScenarios.length);
}

export function initSubjectProgress(subjectId) {
  if (!currentStudent || !subjectId) return;
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