// 道德值核心 — 純函數，無 DOM 依賴
// 支援未來 RPG/Blooket 直接呼叫

import { getCreedsByIds, getTriggeredCreeds } from '../creeds.js';

// ── 等級判定 ──
export function getMoralLevel(score) {
  if (score >= 70) return 'good';
  if (score >= 30) return 'warning';
  return 'danger';
}

// ── 計算百分比（-50~100 → 0~100）──
export function calculateMoralPercent(score) {
  return Math.max(0, Math.min(100, Math.round((score + 50) / 1.5)));
}

// ── 純 render helper（只產 data）──
export function getMoralBarData(score) {
  const percent = calculateMoralPercent(score);
  const level = getMoralLevel(score);
  const color = level === 'good' ? '#22c55e' : level === 'warning' ? '#eab308' : '#ef4444';
  return { percent, color, level, score };
}

// ── 套用 scenario 結果（核心 hook）──
export function applyScenarioResult(scenario, optionId, studentId) {
  const option = scenario.options.find(o => o.id === optionId);
  if (!option) return null;

  let moralChange = 0;
  let mainComment = '';
  option.effects.forEach(eff => {
    moralChange += eff.moralChange || 0;
    if (eff.comment) mainComment = eff.comment;
  });

  const triggeredCreeds = getCreedsByIds(getTriggeredCreeds(scenario.creedIds || [], moralChange));
  const isPositive = moralChange >= 0;

  return {
    moralChange,
    newScore: null,           // 由 caller（Progress.js）計算後填入
    triggeredCreeds,
    isPositive,
    mainComment: mainComment || (isPositive ? '你做出了好的選擇！' : '你做出了選擇！'),
    option,
    scenario,
  };
}

// ── 道德分文字描述 ──
export function getMoralLabel(score) {
  const level = getMoralLevel(score);
  const labels = { danger: '需要加油', warning: '還不錯', good: '太棒了' };
  return labels[level] || '';
}