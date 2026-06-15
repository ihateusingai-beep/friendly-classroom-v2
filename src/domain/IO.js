// src/domain/IO.js — Data import/export + analytics + sync + teacher config.
//
// Extracted from main.js (Sprint 2 / Track A2). Owns all the "side-effect"
//   handlers that touch localStorage / network / teacher config:
//     - import/export of progress (per-student + per-class)
//     - analytics CSV export + clear
//     - force sync (PWA + cloud)
//     - teacher feature toggles (PIN, button size, bank risk, assigned topics)
//
// Public API:
//   wireIO({ render, getStudent, getAllStudents,
//           importProgress, exportProgress, syncNow, getProgress,
//           getStats, exportInteractionsCSV, clearInteractions,
//           goTeacher, _navigate })
//   handleImport(e), exportAll(),
//   exportAnalyticsCSV(), clearAnalytics(), forceSync(),
//   setSyncStatusLoading(), updateAnalyticsSummary(),
//   exportMyData(), importMyData(),
//   toggleTeacherFeature, setTeacherTimer, setButtonSize,
//   setBankMaxRisk, toggleAssignedTopic,
//   saveTeacherPIN, saveTeacherConfig

// Self-init window.FC at module-load time. Required because main.js
// `import './domain/IO.js'` evaluates this module's top level before
// main.js has had a chance to run any non-import code. The other
// domain modules do the same. Idempotent and safe.
// Using a top-level side-effect expression in a function wrapper to
// defeat Vite/Rollup's "window is always defined" DCE pass.
(() => {
  if (typeof window === 'undefined') return;
  if (!window.FC) window.FC = {};
})();

let _render = null;
let _getStudent = null;
let _getAllStudents = null;
let _importProgress = null;
let _exportProgress = null;
let _syncNow = null;
let _getProgress = null;
let _getStats = null;
let _exportInteractionsCSV = null;
let _clearInteractions = null;
let _navigate = null;

export function wireIO(deps) {
  _render = deps.render;
  _getStudent = deps.getStudent;
  _getAllStudents = deps.getAllStudents;
  _importProgress = deps.importProgress;
  _exportProgress = deps.exportProgress;
  _syncNow = deps.syncNow;
  _getProgress = deps.getProgress;
  _getStats = deps.getStats;
  _exportInteractionsCSV = deps.exportInteractionsCSV;
  _clearInteractions = deps.clearInteractions;
  _navigate = deps._navigate;
}

// ── Per-class / per-student import-export ───────────────────────────

/** Handle CSV/JSON file upload and import. */
window.FC.handleImport = function (e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const r = _importProgress(ev.target.result);
    if (r.ok) {
      alert('匯入成功！');
      _navigate('teacher');
    } else {
      alert('匯入失敗：' + r.error);
    }
  };
  reader.readAsText(file);
};

/** Export all students + their progress as a single JSON file. */
window.FC.exportAll = function () {
  const students = _getAllStudents();
  const blob = new Blob([JSON.stringify(students, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = '全班進度.json';
  a.click();
  URL.revokeObjectURL(url);
};

/** Export just the current student's progress. */
window.FC.exportMyData = function () {
  const name = _getStudent();
  if (!name) return;
  const json = _exportProgress(name);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${name}-進度.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/** Import a per-student progress file. */
window.FC.importMyData = function (e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const r = _importProgress(ev.target.result);
    if (r.ok) {
      alert('匯入成功！');
      _render();
    } else {
      alert('匯入失敗：' + r.error);
    }
  };
  reader.readAsText(file);
};

// ── Analytics ───────────────────────────────────────────────────────

/** Export interaction analytics (per-category) as CSV. */
window.FC.exportAnalyticsCSV = function () {
  const stats = _getStats();
  if (!stats || !stats.totalRows) {
    alert('暫時未有學習記錄可以匯出。');
    return;
  }
  const csv = _exportInteractionsCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = '學習記錄.csv';
  a.click();
  URL.revokeObjectURL(url);
};

/** Clear all interaction analytics. */
window.FC.clearAnalytics = function () {
  if (confirm('確定清除所有學習記錄？此操作無法復原。')) {
    _clearInteractions();
    _render();
  }
};

/** Refresh the on-page analytics summary (called by render()). */
export function updateAnalyticsSummary() {
  const el = document.getElementById('analytics-summary');
  if (!el) return;
  try {
    const stats = _getStats();
    if (!stats || !stats.totalRows) {
      el.textContent = '📊 暫未有學習記錄 — 玩幾個 scenario 就會見到。';
      return;
    }
    const cats = stats.wrongRateByCategory || [];
    const lines = [
      `📝 總作答：${stats.totalRows} 題 · ✅ 答啱率：${(stats.correctRate * 100).toFixed(0)}%` +
        (stats.avgResponseTimeMs ? ` · ⏱️ 平均 ${(stats.avgResponseTimeMs / 1000).toFixed(1)}s` : ''),
    ];
    if (cats.length) {
      lines.push('📊 答錯率最高：');
      cats.forEach(([name, c], i) => {
        lines.push(`  ${i + 1}. ${name} — ${(c.wrongRate * 100).toFixed(0)}% (${c.wrong}/${c.total})`);
      });
    }
    el.innerHTML = lines.map(l => l.replace(/\n/g, '<br>')).join('<br>')
      .replace(/(答錯率最高：)/g, '<strong>$1</strong>');
  } catch (e) {
    el.textContent = '⚠️ 載入失敗：' + e.message;
  }
}

// ── Sync ─────────────────────────────────────────────────────────────

/** Loading skeleton state for the sync badge. */
export function setSyncStatusLoading() {
  const badge = document.getElementById('settings-sync-status');
  const lastSync = document.getElementById('settings-last-sync');
  if (badge) badge.innerHTML = '<span class="skeleton skeleton-text-sm" style="width:80px"></span>';
  if (lastSync) lastSync.innerHTML = '<span class="skeleton skeleton-text-sm" style="width:120px"></span>';
}

/** Force a fresh sync of the current student's progress. */
window.FC.forceSync = async function () {
  const name = _getStudent();
  if (!name) return;
  const p = _getProgress(name);
  setSyncStatusLoading();
  const result = await _syncNow(name, p);
  if (result.ok) {
    const badge = document.getElementById('settings-sync-status');
    const lastSync = document.getElementById('settings-last-sync');
    if (badge) badge.textContent = '✅ 已同步';
    if (lastSync) lastSync.textContent = new Date().toLocaleString('zh-HK', { dateStyle: 'short', timeStyle: 'short' });
  } else {
    const badge = document.getElementById('settings-sync-status');
    if (badge) badge.textContent = '❌ 同步失敗';
  }
};

// ── Teacher config (live in localStorage; small helpers) ───────────

function getTeacherConfig() {
  try {
    return JSON.parse(localStorage.getItem('fc_teacher_config') || '{}');
  } catch {
    console.warn('[IO] teacher_config corrupt, resetting');
    return {};
  }
}
function saveTeacherConfig(cfg) {
  try {
    localStorage.setItem('fc_teacher_config', JSON.stringify(cfg));
  } catch (e) {
    console.error('[IO] saveTeacherConfig failed:', e.message);
  }
}

/** Toggle a feature flag in teacher config (e.g. hintEnabled, timerEnabled). */
window.FC.toggleTeacherFeature = function (btn, key) {
  btn.classList.toggle('on');
  const val = btn.classList.contains('on');
  const cfg = getTeacherConfig();
  cfg[key] = val;
  saveTeacherConfig(cfg);
  if (key === 'timerEnabled') _render();
};

/** Set the per-question timer duration (seconds). */
window.FC.setTeacherTimer = function (val) {
  const cfg = getTeacherConfig();
  cfg.timerSeconds = parseInt(val);
  saveTeacherConfig(cfg);
};

/** Set teacher-side button size (small/normal/large). */
window.FC.setButtonSize = function (size) {
  const cfg = getTeacherConfig();
  cfg.buttonSize = size;
  saveTeacherConfig(cfg);
  _render();
};

/** Set the bank-game risk ceiling. 0=value only / 1=default / 2=mid / 3=all. */
window.FC.setBankMaxRisk = function (level) {
  const cfg = getTeacherConfig();
  cfg.bankMaxRiskLevel = level;
  saveTeacherConfig(cfg);
  _render();
};

/** Toggle a topic in the teacher's assigned-topics list. */
window.FC.toggleAssignedTopic = function (topicId, checked) {
  const cfg = getTeacherConfig();
  if (!cfg.assignedTopics) cfg.assignedTopics = [];
  if (checked) {
    if (!cfg.assignedTopics.includes(topicId)) cfg.assignedTopics.push(topicId);
  } else {
    cfg.assignedTopics = cfg.assignedTopics.filter(t => t !== topicId);
  }
  saveTeacherConfig(cfg);
};

/** Save the teacher PIN. */
window.FC.saveTeacherPIN = function () {
  const pin = document.getElementById('teacher-pin-input')?.value?.trim() || 'admin';
  localStorage.setItem('fc_teacher_pin', pin);
  alert('✅ PIN 已更新為：' + pin);
};

/** Save all teacher settings and navigate to the teacher dashboard. */
window.FC.saveTeacherConfig = function () {
  alert('✅ 老師設定已儲存！');
  _navigate('teacher');
};
