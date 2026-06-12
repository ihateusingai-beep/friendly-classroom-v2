// domain/Progress.js — 進度管理 + EventBus 整合
// 現有 progress.js 全部重命名為 domain/Progress.js
// main.js / engine.js 的 import path 更新即可，API 完全不變

import { bus } from './EventBus.js';

const PREFIX = 'fc_progress_';

// ── 現有 API（完全向後相容）──
export function getProgress(studentName) {
  try {
    const raw = localStorage.getItem(PREFIX + studentName);
    return raw ? JSON.parse(raw) : _defaultProgress(studentName);
  } catch {
    return _defaultProgress(studentName);
  }
}

export function saveProgress(progress) {
  progress.lastPlayed = new Date().toISOString().split('T')[0];
  localStorage.setItem(PREFIX + progress.name, JSON.stringify(progress));
}

export function markComplete(studentName, scenarioId, topicId, moralChange, subjectId) {
  const p = getProgress(studentName);
  if (!p.completedScenarios.includes(scenarioId)) {
    p.completedScenarios.push(scenarioId);
    p.totalMoralScore = Math.max(0, (p.totalMoralScore || 0) + moralChange);
    if (!p.topicProgress[topicId]) p.topicProgress[topicId] = { completed: 0, total: 0 };
    p.topicProgress[topicId].completed++;
    // subjectProgress 暫時停用：scenarios.json 冇 subjectId field，
    // 等將來 data 有 subjectId 之後先 re-enable。留個 null guard 避免污染。
    if (subjectId) {
      if (!p.subjectProgress[subjectId]) p.subjectProgress[subjectId] = { completed: 0, total: 0 };
      p.subjectProgress[subjectId].completed++;
    }
    saveProgress(p);

    // 廣播事件
    bus.emit('progress:updated', { studentId: studentName, scenarioId, topicId, moralChange });
    bus.emit('moral:updated',   { studentId: studentName, score: p.totalMoralScore, change: moralChange });
    bus.emit('scenario:completed', { studentId: studentName, scenarioId, result: { moralChange, newScore: p.totalMoralScore } });
  }
  return p;
}

export function updateTopicTotal(studentName, topicId, total) {
  const p = getProgress(studentName);
  if (!p.topicProgress[topicId]) {
    p.topicProgress[topicId] = { completed: 0, total };
  } else {
    p.topicProgress[topicId].total = total;
  }
  saveProgress(p);
}

export function updateSubjectTotal(studentName, subjectId, total) {
  const p = getProgress(studentName);
  if (!p.subjectProgress[subjectId]) {
    p.subjectProgress[subjectId] = { completed: 0, total };
  } else {
    p.subjectProgress[subjectId].total = total;
  }
  saveProgress(p);
}

export function getAllStudents() {
  const students = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(PREFIX)) {
      try {
        students.push(JSON.parse(localStorage.getItem(key)));
      } catch {}
    }
  }
  return students;
}

export function importProgress(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    const p = getProgress(data.name);
    data.completedScenarios.forEach(id => {
      if (!p.completedScenarios.includes(id)) p.completedScenarios.push(id);
    });
    p.totalMoralScore = Math.max(p.totalMoralScore || 0, data.totalMoralScore || 0);
    if (data.topicProgress) {
      Object.keys(data.topicProgress).forEach(tid => {
        if (!p.topicProgress[tid]) p.topicProgress[tid] = { completed: 0, total: 0 };
        p.topicProgress[tid].completed = Math.max(p.topicProgress[tid].completed || 0, data.topicProgress[tid].completed || 0);
        if (data.topicProgress[tid].total) p.topicProgress[tid].total = Math.max(p.topicProgress[tid].total || 0, data.topicProgress[tid].total);
      });
    }
    if (data.subjectProgress) {
      Object.keys(data.subjectProgress).forEach(sid => {
        if (!p.subjectProgress[sid]) p.subjectProgress[sid] = { completed: 0, total: 0 };
        p.subjectProgress[sid].completed = Math.max(p.subjectProgress[sid].completed || 0, data.subjectProgress[sid].completed || 0);
        if (data.subjectProgress[sid].total) p.subjectProgress[sid].total = Math.max(p.subjectProgress[sid].total || 0, data.subjectProgress[sid].total);
      });
    }
    saveProgress(p);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export function exportProgress(studentName) {
  const p = getProgress(studentName);
  return JSON.stringify(p, null, 2);
}

export function isCompleted(studentName, scenarioId) {
  return getProgress(studentName).completedScenarios.includes(scenarioId);
}

// ── 新增：Summary（domain 層額外產出）──
export function getStudentSummary(studentId) {
  const p = getProgress(studentId);
  return {
    name: studentId,
    score: p.totalMoralScore || 0,
    completedCount: p.completedScenarios?.length || 0,
    topicCount: Object.keys(p.topicProgress || {}).length,
    lastPlayed: p.lastPlayed || null,
  };
}

// ── Internal ──
function _defaultProgress(name) {
  return {
    name,
    completedScenarios: [],
    topicProgress: {
      emotions: { completed: 0, total: 0 },
      respect:    { completed: 0, total: 0 },
      honesty:    { completed: 0, total: 0 },
      conflict:   { completed: 0, total: 0 },
    },
    subjectProgress: {
      value:   { completed: 0, total: 0 },
    },
    totalMoralScore: 0,
    lastPlayed: null,
  };
}