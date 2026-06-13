// Analytics — 純 localStorage interaction logger
// 為咗老師想知道「邊個 category 答錯率最高」而設計
// Schema 已經 commit，UI dashboard 之後先做
//
// Schema (CSV columns):
//   timestamp        — ISO 8601, 學生撳 option 嘅時間
//   studentHash      — 學生名 hash (SHA-256 前 8 chars)，唔好明文
//   scenarioId       — e.g. "s-ni-04"
//   topicId          — e.g. "nurturing-independence"
//   category         — scenario.valueCategory (e.g. "responsibility")
//   optionId         — e.g. "s-ni-04-a"
//   optionIndex      — 1-based (A=1, B=2, C=3)
//   isCorrect        — moralChange >= 0 → true
//   moralChange      — 整數
//   responseTimeMs   — 由 play 渲染到 choose 嘅 ms
//   gameMode         — 'relaxed' | 'focused' | 'teacher'
//   playedAt         — 場景進入時間 (ISO)，方便計算閱讀時間

const STORAGE_KEY = 'fc_interactions_v1';
const PLAYED_AT_KEY = 'fc_current_scenario_played_at';
const MAX_ROWS = 10000; // 防爆 localStorage (~5MB ÷ ~250B/row)

// ── 學生名 hash (browser-native crypto, 唔需要 lib) ──
async function hashStudentName(name) {
  if (!name) return 'anon';
  try {
    const enc = new TextEncoder().encode(name);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    const hex = Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return hex.slice(0, 8);
  } catch {
    // 老舊 browser / 冇 crypto.subtle → fallback
    return 'h_' + simpleHash(name);
  }
}

function simpleHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h).toString(36).slice(0, 8);
}

// ── Load / save ──
function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.warn('[Analytics] load failed:', e.message);
    return [];
  }
}

function saveAll(rows) {
  try {
    // FIFO trim — 超 max 砍頭
    const trimmed = rows.length > MAX_ROWS
      ? rows.slice(rows.length - MAX_ROWS)
      : rows;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    // QuotaExceededError: 砍一半再試
    if (e.name === 'QuotaExceededError' || /quota/i.test(e.message)) {
      const half = rows.slice(Math.floor(rows.length / 2));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(half));
        console.warn('[Analytics] quota hit, trimmed to', half.length);
      } catch (e2) {
        console.error('[Analytics] save failed after trim:', e2.message);
      }
    } else {
      console.error('[Analytics] save failed:', e.message);
    }
  }
}

// ── Mark scenario 開始 (response time 計算用) ──
// 由 main.js.play() 嗰陣 call
export function markScenarioShown() {
  try {
    sessionStorage.setItem(PLAYED_AT_KEY, String(performance.now()));
  } catch {}
}

// ── 主入口：記一條 interaction ──
// data 必須包含: scenarioId, topicId, category, optionId, optionIndex, moralChange
// 自動加: timestamp, studentHash, isCorrect, responseTimeMs
export function logInteraction(data, studentName, gameMode) {
  if (!data || !data.scenarioId || !data.optionId) {
    console.warn('[Analytics] logInteraction missing fields:', data);
    return;
  }
  const now = Date.now();
  const moralChange = Number(data.moralChange) || 0;

  // 計算 response time
  let responseTimeMs = null;
  try {
    const playedPerf = parseFloat(sessionStorage.getItem(PLAYED_AT_KEY) || '0');
    if (playedPerf > 0) {
      responseTimeMs = Math.max(0, Math.round(performance.now() - playedPerf));
    }
  } catch {}

  const row = {
    timestamp: new Date(now).toISOString(),
    studentHash: '', // 異步 hash 完後再 patch
    scenarioId: data.scenarioId,
    topicId: data.topicId || '',
    category: data.category || '',
    optionId: data.optionId,
    optionIndex: data.optionIndex || 0,
    isCorrect: moralChange >= 0,
    moralChange,
    responseTimeMs,
    gameMode: gameMode || 'relaxed',
    playedAt: new Date(now - (responseTimeMs || 0)).toISOString(),
  };

  // 異步 hash student name (不阻擋 UI)
  hashStudentName(studentName).then(h => {
    const all = loadAll();
    // 找最後一條 timestamp 仲未填 hash 嘅, 即係今次嗰條
    for (let i = all.length - 1; i >= 0; i--) {
      if (!all[i].studentHash) {
        all[i].studentHash = h;
        break;
      }
    }
    saveAll(all);
  });

  const all = loadAll();
  all.push(row);
  saveAll(all);
}

// ── 清空 (供「重置」用) ──
export function clearInteractions() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ── 統計 (供 future dashboard 用) ──
export function getStats() {
  const rows = loadAll();
  if (!rows.length) {
    return { totalRows: 0, byCategory: {}, correctRate: null, avgResponseTimeMs: null };
  }
  const byCategory = {};
  for (const r of rows) {
    const cat = r.category || '(uncategorized)';
    if (!byCategory[cat]) byCategory[cat] = { total: 0, correct: 0, wrong: 0 };
    byCategory[cat].total++;
    if (r.isCorrect) byCategory[cat].correct++;
    else byCategory[cat].wrong++;
  }
  // 加 wrong rate 方便 ranking
  for (const cat of Object.keys(byCategory)) {
    const c = byCategory[cat];
    c.wrongRate = c.total > 0 ? +(c.wrong / c.total).toFixed(3) : 0;
  }
  const correct = rows.filter(r => r.isCorrect).length;
  const responseTimes = rows.map(r => r.responseTimeMs).filter(t => typeof t === 'number');
  return {
    totalRows: rows.length,
    byCategory,
    correctRate: +(correct / rows.length).toFixed(3),
    avgResponseTimeMs: responseTimes.length
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : null,
  };
}

// ── CSV export ──
// 老師攞去 Excel / GSheet 直接開
// 加 BOM 令 Excel 識得 UTF-8 中文
export function exportInteractionsCSV() {
  const rows = loadAll();
  const header = [
    'timestamp', 'studentHash', 'scenarioId', 'topicId', 'category',
    'optionId', 'optionIndex', 'isCorrect', 'moralChange',
    'responseTimeMs', 'gameMode', 'playedAt',
  ];
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    // CSV escape: 包含逗號 / 引號 / 換行就 quote 入面
    if (/[",\n\r]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(header.map(h => escape(r[h])).join(','));
  }
  const csv = '\uFEFF' + lines.join('\n'); // BOM for Excel UTF-8
  const filename = `friendly_classroom_log_${new Date().toISOString().slice(0, 10)}.csv`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { count: rows.length, filename };
}

// ── 內部測試用 ──
export function _getAllRows() { return loadAll(); }
export const _STORAGE_KEY = STORAGE_KEY;
