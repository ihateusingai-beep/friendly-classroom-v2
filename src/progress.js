// localStorage 進度管理
const PREFIX = 'fc_progress_';

export function getProgress(studentName) {
  try {
    const raw = localStorage.getItem(PREFIX + studentName);
    return raw ? JSON.parse(raw) : {
      name: studentName,
      completedScenarios: [],
      topicProgress: {
        emotions: { completed: 0, total: 0 },
        respect:    { completed: 0, total: 0 },
        honesty:    { completed: 0, total: 0 },
        conflict:   { completed: 0, total: 0 },
      },
      subjectProgress: {
        math:    { completed: 0, total: 0 },
        chinese: { completed: 0, total: 0 },
        english: { completed: 0, total: 0 },
        science: { completed: 0, total: 0 },
      },
      totalMoralScore: 0,
      lastPlayed: null,
    };
  } catch {
    return { name: studentName, completedScenarios: [], topicProgress: {}, subjectProgress: {}, totalMoralScore: 0, lastPlayed: null };
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
    if (!p.subjectProgress[subjectId]) p.subjectProgress[subjectId] = { completed: 0, total: 0 };
    p.subjectProgress[subjectId].completed++;
    saveProgress(p);
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
    // merge
    data.completedScenarios.forEach(id => {
      if (!p.completedScenarios.includes(id)) p.completedScenarios.push(id);
    });
    p.totalMoralScore = Math.max(p.totalMoralScore || 0, data.totalMoralScore || 0);
    // merge topic progress
    if (data.topicProgress) {
      Object.keys(data.topicProgress).forEach(tid => {
        if (!p.topicProgress[tid]) p.topicProgress[tid] = { completed: 0, total: 0 };
        p.topicProgress[tid].completed = Math.max(p.topicProgress[tid].completed || 0, data.topicProgress[tid].completed || 0);
        if (data.topicProgress[tid].total) p.topicProgress[tid].total = Math.max(p.topicProgress[tid].total || 0, data.topicProgress[tid].total);
      });
    }
    // merge subject progress
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