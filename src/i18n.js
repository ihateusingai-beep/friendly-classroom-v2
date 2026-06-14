// src/i18n.js
// Phase 4 (S24): minimal i18n layer. Single-language (zh-HK) for now, but
// all visible strings that are reused 2+ times across render functions
// live here. Future-proofing: when 簡體中文 / English is needed, add a
// `t('key', locale)` override layer without touching render code.
//
// Usage:
//   import { t } from './i18n.js';
//   const label = t('home.hero.greeting', { name: 'Alice' });
//
// Falls back to the template if the key is missing — so adding a new
// string to a renderer doesn't require adding a translation entry.

const STRINGS = {
  // Footer
  'footer.copyright': '© Ken Cheng 製作',

  // Common actions
  'action.back': '← 返回',
  'action.backHome': '← 返回主頁',
  'action.retry': '🔄 再做一次',
  'action.next': '下一題 →',
  'action.start': '開始',
  'action.save': '💾 儲存',
  'action.cancel': '取消',
  'action.confirm': '確認',
  'action.close': '✕ 關閉',

  // Status / loading
  'status.loading': '載入中…',
  'status.empty': '冇資料',
  'status.error': '出咗問題',

  // Errors (Phase 4 S25)
  'error.fallbackTitle': '哎呀，呢頁載入出咗問題',
  'error.fallbackHint': '我哋已經記錄咗呢個錯誤。你可以返主頁重試，<br>或者重新整理整個瀏覽器。',
  'error.fallbackReload': '🔄 重新整理',

  // Settings
  'settings.title': '設定',
  'settings.voice': '語音朗讀',
  'settings.font': '文字顯示',
  'settings.sync': '雲端同步',
  'settings.data': '資料管理',
  'settings.teacher': '老師模式',

  // Home
  'home.title': '友愛教室',
  'home.greeting': '你好，{name}！',
  'home.subtitle': '揀個品格課題開始',
  'home.flame.cold': '今日開始你嘅 streak！',

  // Game hub
  'hub.bankTitle': '好人好事銀行',
  'hub.bankDesc': '做好事存款，衰嘢扣款，目標存到 $100 變品格富翁！',
  'hub.subjectTitle': '情境答題',
  'hub.subjectDesc': '17 個品格課題自由探索',

  // Bank
  'bank.riskTag': '🎯 題目難度：{label}',
  'bank.summaryFilter': '🎯 難度設定：{label} · 本局 {valueCount} 個 value + {caringCount} 個 caring',
  'bank.empty': '🫥 銀行題目載入失敗，請重試。',
  'bank.exit': '← 返 Game Hub',
  'bank.again': '🔄 再玩一次',
  'bank.settle': '✓ 結算',
  'bank.next': '➡ 下一題',

  // Scenario
  'scenario.empty': '場景不存在',
  'scenario.loadFailed': '題目載入失敗',
  'scenario.resultFailed': '結果載入失敗，請重試。',

  // Teacher
  'teacher.emptyTitle': '暫時沒有學生數據',
  'teacher.emptyHint': '學生完成學習後會自動顯示在這裡',
};

/**
 * Translate a key, with optional {placeholder} interpolation.
 * Falls back to the key itself if missing (logs a warning in dev).
 * @param {string} key
 * @param {Object} [vars] — interpolation values
 * @returns {string}
 */
export function t(key, vars = {}) {
  let s = STRINGS[key];
  if (s == null) {
    if (import.meta.env?.DEV) console.warn(`[i18n] missing key: ${key}`);
    return key;
  }
  for (const [k, v] of Object.entries(vars)) {
    s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return s;
}

/** Get the full string table (for testing / future admin UI). */
export function getStrings() {
  return { ...STRINGS };
}

/** Add or override a string (used by tests or future locale switching). */
export function setString(key, value) {
  STRINGS[key] = value;
}
