// domain/Progress.js — 進度管理 + EventBus 整合
// 現有 progress.js 全部重命名為 domain/Progress.js
// main.js / engine.js 的 import path 更新即可，API 完全不變

import { bus } from './EventBus.js';

const PREFIX = 'fc_progress_';
const SCHEMA_VERSION = 1;

// ── 現有 API（完全向後相容）──
export function getProgress(studentName) {
  try {
    const raw = localStorage.getItem(PREFIX + studentName);
    if (!raw) return _defaultProgress(studentName);
    const parsed = JSON.parse(raw);
    // Phase 1 (S4+S5): apply topic migration + schema version on read
    const migrated = _migrateOnRead(parsed);
    return migrated;
  } catch {
    return _defaultProgress(studentName);
  }
}

export function saveProgress(progress) {
  progress.lastPlayed = _todayHKT();
  progress.schemaVersion = SCHEMA_VERSION;
  const key = PREFIX + progress.name;
  const payload = JSON.stringify(progress);
  try {
    localStorage.setItem(key, payload);
    return true;
  } catch (e) {
    // Phase 1 (S2): quota + serialization guard
    if (e && e.name === 'QuotaExceededError') {
      bus.emit('progress:save-failed', { name: progress.name, error: 'quota' });
      console.warn('[Progress] quota exceeded for', progress.name);
    } else {
      bus.emit('progress:save-failed', { name: progress.name, error: e?.message || 'unknown' });
      console.warn('[Progress] save failed:', e);
    }
    return false;
  }
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
    // ── Streak 累積 ──
    p.streak = _bumpStreak(p.streak);
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
    streak: p.streak?.current || 0,
    streakLongest: p.streak?.longest || 0,
  };
}

// ── V2.2 dead topic IDs (no longer in scenarios.json / topics.js TOPICS) ──────
// 喺 V3 重整時，emotions/honesty/conflict 已經 migrate 去 V3 id：
//   emotions      → empathy
//   honesty       → integrity (合併)
//   conflict      → conflict-resolution
// 呢啲 key 只係 legacy progress data 殘留 — _defaultProgress 同 migrate helper
// 都唔再 init 佢哋。舊 user 嘅 localStorage 仲有嘅，喺 getProgress 嗰陣 lazy-prune。
// ─────────────────────────────────────────────────────────────────────────────
export const V22_DEAD_TOPIC_IDS = ['emotions', 'honesty', 'conflict'];

// V2.2 → V3 topic key migration. Phase 1 (S4): applied at read time so user
// data with old keys still maps to the right topic in the UI.
const TOPIC_KEY_MIGRATION = {
  emotions: 'empathy',
  honesty: 'integrity',
  conflict: 'conflict-resolution',
};

// ── Internal ──
function _defaultProgress(name) {
  return {
    schemaVersion: SCHEMA_VERSION,
    name,
    completedScenarios: [],
    // V3: topicProgress 唔再 pre-init。`updateTopicTotal()` 喺學生第一次入個
    // topic 嗰陣 lazy-init 對應 entry。Pre-init V2.2 keys (emotions/honesty/
    // conflict) 只會喺舊 user 嘅 localStorage 殘留，呢度保持空 object 即可。
    topicProgress: {},
    subjectProgress: {
      value:   { completed: 0, total: 0 },
    },
    totalMoralScore: 0,
    lastPlayed: null,
    streak: { current: 0, longest: 0, lastDay: null },
  };
}

// Phase 1 (S4 + S5): read-time migration. Idempotent — safe to run on every read.
function _migrateOnRead(p) {
  if (!p || typeof p !== 'object') return p;

  // S5: stamp schemaVersion on legacy records
  if (p.schemaVersion == null) p.schemaVersion = SCHEMA_VERSION;

  // S4: rename V2.2 dead topic keys to V3 ids; preserve max(completed, total)
  if (p.topicProgress && typeof p.topicProgress === 'object') {
    for (const oldKey of V22_DEAD_TOPIC_IDS) {
      if (p.topicProgress[oldKey]) {
        const newKey = TOPIC_KEY_MIGRATION[oldKey];
        const oldEntry = p.topicProgress[oldKey];
        const newEntry = p.topicProgress[newKey] || { completed: 0, total: 0 };
        newEntry.completed = Math.max(newEntry.completed || 0, oldEntry.completed || 0);
        newEntry.total     = Math.max(newEntry.total     || 0, oldEntry.total     || 0);
        p.topicProgress[newKey] = newEntry;
        delete p.topicProgress[oldKey];
      }
    }
  }

  return p;
}

// Phase 1 (S5b): HKT-correct day for streak/lastPlayed.
// en-CA gives ISO-style YYYY-MM-DD; `timeZone` keeps the result anchored to HKT
// regardless of the user's local clock. This fixes the 00:00-08:00 HKT bug
// where plays were attributed to the previous UTC day.
function _todayHKT() {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Hong_Kong',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date()); // "2026-06-14"
  } catch {
    // Intl unavailable — fall back to UTC (Safari < 10, very old browsers)
    return new Date().toISOString().split('T')[0];
  }
}

function _yesterdayHKT() {
  const today = _todayHKT();
  const [y, m, d] = today.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().split('T')[0];
}

/**
 * Streak 規則：
 * - 同日重複 markComplete：idempotent（lastDay 對齊今日就唔加）
 * - 連續下一日（lastDay === 昨日）：current + 1
 * - 隔咗 ≥ 2 日：current reset 做 1
 * - 由 0 開始（首次玩）：current = 1
 */
function _bumpStreak(streak) {
  const s = streak || { current: 0, longest: 0, lastDay: null };
  const today = _todayHKT();
  if (s.lastDay === today) return s;                    // 同日 idempotent
  const yest = _yesterdayHKT();
  if (s.lastDay === yest) s.current += 1;               // 連續
  else s.current = 1;                                    // 首次 / 斷咗
  if (s.current > (s.longest || 0)) s.longest = s.current;
  s.lastDay = today;
  return s;
}