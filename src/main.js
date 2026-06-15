// 友愛教室 V2 — main.js
import './style.css';
import './sw-register.js';  // PWA install + update prompt
import { setStudent, getStudent, setScenarios, getScenarios, getScenariosByTopic,
         getDisplayProgress, initTopicProgress, initSubjectProgress, renderHome, renderTopicList,
         renderPlay, renderResult, renderProgress, renderSettings,
         playScenario, chooseOption, suggestNext,
         renderRoleSelect, renderModeSelect, renderTeacherAssign, renderGameHub,
         renderBankPlay, renderBankResult, renderBankSummary,
         GAME_MODES } from './engine.js';
import { applyScenarioResult } from './domain/Moral.js';
import { startBankRun, getBankRun, endBankRun, recordBankTransaction, advanceToNextQuestion, BANK_CONFIG } from './games/GoodDeedBank.js';
import { speakScenario, speakCreeds, setEnabled, isEnabled, applyCSS, resetAllSettings, playSFX, initSFX, setTTSLang, getTTSLang, TTS_LANGS } from './audio.js';
import { exportProgress, importProgress, getAllStudents, getProgress, updateSubjectTotal } from './domain/Progress.js';
import { getSubjectColor, getSubjectBgColor, getAllSubjects } from './subjects.js';
import { getTopic as getTopicMeta } from './topics.js';
import { bus } from './domain/EventBus.js';
import { getMoralBarData } from './domain/Moral.js';
import { initSync, syncNow, getSyncStatus } from './sync.js';
import { logInteraction, markScenarioShown, exportInteractionsCSV, getStats, clearInteractions } from './domain/Analytics.js';
import { navigate as _navigate, wireNav } from './nav.js';
// Phase 3 (S13): scenarios.json (259 items, 259KB) is now lazy-loaded via
// `loadScenarios()`. Saves 56% of bundle (~110KB gz → ~50KB gz) by deferring
// the JSON.parse of the full scenario tree until the first time the user
// picks a path that needs it (subject-select → topic → play).
let _scenariosLoaded = null;
export async function loadScenarios() {
  if (_scenariosLoaded) return _scenariosLoaded;
  const mod = await import('../data/scenarios.json');
  _scenariosLoaded = mod.default || mod;
  setScenarios(_scenariosLoaded);
  return _scenariosLoaded;
}

// ── Vite HMR 破壞 DOM 寫入，強制停用 ──
if (import.meta.hot) { import.meta.hot.decline(); }

// ── 初始化 ──
// Phase 4 (S25): split into a persistent #app shell + transient #fc-view.
//   #app      — never replaced; holds #fc-view
//   #fc-view  — where the rendered HTML lives; replaced via replaceChildren
//                 so siblings (moral-bar, sync-badge, offline-banner) survive
const app = document.getElementById('app');
const view = document.getElementById('fc-view');
applyCSS(); // 套用個人化 CSS 參數
initSFX();  // 初始化遊戲音效

// SR announce when skip-link jumps to main (move focus to <main> so SR picks it up)
document.querySelector('.skip-link')?.addEventListener('click', () => {
  setTimeout(() => app.focus({ preventScroll: true }), 50);
});

// ── SR announcer ──
// 給 screen reader 用嘅 polite live region。寫 textContent 會自動 announce。
// 用 lazy create，唔一定每頁都 in DOM（speak scenario 用 <h1 class="sr-only" aria-live> 已經有，
// 但用統一 helper 可以由 main.js 主動 announce 例如「題目 3，關於勤勞」）
let _srAnnouncer = null;
function getSrAnnouncer() {
  if (!_srAnnouncer) {
    _srAnnouncer = document.getElementById('sr-announcer');
  }
  return _srAnnouncer;
}

// Visual toast (announce fallback for non-SR users)
// SR live region 對 screen reader 自動 announce，但對視力正常嘅用戶冇視覺提示。
// 呢個 toast 顯示喺底部 2.5s 自動消失 — 唔影響 SR behaviour，
// 只係畀普通用戶都睇到「題目載入咗 / 切咗語言」等關鍵事件。
let _toastEl = null;
let _toastTimer = null;
function getToastEl() {
  if (_toastEl) return _toastEl;
  _toastEl = document.createElement('div');
  _toastEl.id = 'fc-announce-toast';
  _toastEl.setAttribute('role', 'status');     // a11y：本身係 status，唔阻 screen reader 重複 announce
  _toastEl.setAttribute('aria-live', 'polite'); // 對 SR 額外做一次 announce
  _toastEl.setAttribute('aria-atomic', 'true');
  // inline CSS 而唔寫 style.css — 咁唔使煩 style.css 嘅 cascade
  _toastEl.style.cssText = [
    'position: fixed',
    'bottom: 24px',
    'left: 50%',
    'transform: translateX(-50%)',
    'max-width: 90vw',
    'padding: 12px 20px',
    'background: rgba(15, 23, 42, 0.95)',     // slate-900
    'color: #ffffff',
    'border-radius: 12px',
    'box-shadow: 0 8px 24px rgba(0,0,0,0.25)',
    'font-size: 15px',
    'font-weight: 500',
    'line-height: 1.4',
    'text-align: center',
    'z-index: 9999',
    'pointer-events: none',                    // 唔阻 click
    'opacity: 0',                              // 預設隱藏，由 JS 控制 fade
    'transition: opacity 0.25s ease-out, transform 0.25s ease-out',
  ].join(';');
  document.body.appendChild(_toastEl);
  return _toastEl;
}
function showAnnounceToast(text) {
  // 如果 cached node 已經 detached（被測試/手動 remove 走），reset cache 強制 re-create
  if (_toastEl && !_toastEl.isConnected) _toastEl = null;
  // Reduced motion: 即時 show/hide，唔做 fade
  const rm = document.documentElement.hasAttribute('data-rm');
  const el = getToastEl();
  el.textContent = text;
  el.style.opacity = '1';
  el.style.transform = rm ? 'translateX(-50%)' : 'translateX(-50%) translateY(0)';
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = rm ? 'translateX(-50%)' : 'translateX(-50%) translateY(8px)';
    setTimeout(() => {
      if (el.style.opacity === '0') el.textContent = '';
    }, 300);
  }, 2500);
}

function announceToSR(text) {
  // 1) 寫入 SR live region（SR 自動 announce）
  const live = getSrAnnouncer();
  if (live) {
    // 先清空再寫返，trigger SR 重讀（textContent set 相同 value 唔會 re-announce）
    live.textContent = '';
    // 用 rAF 確保清空先生效，再 set 新 value
    requestAnimationFrame(() => { live.textContent = text; });
  }
  // 2) Visual fallback — 底部 toast 畀非 SR 用戶都睇得到
  showAnnounceToast(text);
}

// 場景題目載入時用 — 喺 <main> 換 scenario 內容後 trigger SR
// 文字：題目 3 嘅「勤勞」 — 用 quote 包住，幫 SR 讀
function announceScenarioLoad(scenario, opts = {}) {
  if (!scenario) return;
  const topic = scenario.topicId ? getTopicMeta(scenario.topicId) : null;
  const topicName = topic?.title || '';
  const idx = opts.index;
  const total = opts.total;
  const gameName = opts.gameName || ''; // '銀行' / '自由探索' etc
  const parts = [];
  if (idx && total) parts.push(`題目 ${idx}，共 ${total} 題`);
  if (gameName) parts.push(gameName);
  if (topicName) parts.push(`主題：${topicName}`);
  parts.push(`題目：${scenario.title}`);
  announceToSR(parts.join('，'));
}

// ── EventBus：道德值 Bar 即時更新 ──
bus.on('moral:updated', (e) => {
  const current = getStudent();
  if (e.studentId !== current) return; // 只更新當前學生
  const bar = document.getElementById('moral-bar');
  if (!bar) return;
  const { percent, color } = getMoralBarData(e.score);
  const fill = bar.querySelector('.moral-fill');
  const num  = bar.querySelector('.moral-num');
  if (fill) fill.style.width = percent + '%', fill.style.background = color;
  if (num)  num.textContent  = e.score;
});

// ── Sync status badge in moral bar ──
bus.on('sync:status', (e) => {
  // Cache for settings page
  window._fcSyncStatus = { ...getSyncStatus(), ...e };

  const badge = document.getElementById('sync-badge');
  if (!badge) return;
  const { status } = e;
  if (status === 'syncing') {
    badge.textContent = '🔄';
    badge.title = '同步中…';
    badge.style.opacity = '1';
  } else if (status === 'ok') {
    badge.textContent = '✅';
    badge.title = '已同步';
    setTimeout(() => { badge.textContent = '☁️'; badge.title = '已連線'; }, 2500);
  } else if (status === 'error') {
    badge.textContent = '⚠️';
    badge.title = '同步失敗 — ' + (e.error || '');
    badge.style.opacity = '1';
  } else if (status === 'offline') {
    badge.textContent = '📴';
    badge.title = '離線模式';
    badge.style.opacity = '1';
  }
});

// ── Offline banner ──
let offlineBannerEl = null;
bus.on('sync:status', (e) => {
  if (e.status === 'offline') {
    if (offlineBannerEl) return;
    offlineBannerEl = document.createElement('div');
    offlineBannerEl.id = 'offline-banner';
    offlineBannerEl.setAttribute('role', 'status');
    offlineBannerEl.setAttribute('aria-live', 'polite');
    offlineBannerEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #b91c1c;
      color: #ffffff;
      text-align: center;
      padding: 10px;
      font-size: 14px;
      z-index: 9998;
      font-weight: 600;
    `;
    offlineBannerEl.textContent = '📴 離線模式 — 進度將在恢復連線後自動同步';
    document.body.appendChild(offlineBannerEl);
  } else if (e.status === 'online' && offlineBannerEl) {
    offlineBannerEl.remove();
    offlineBannerEl = null;
  }
});

// ── Init sync on load ──
const _currentStudent = getStudent();
if (_currentStudent) {
  const p = getProgress(_currentStudent);
  initSync(_currentStudent, p);
}

// ── 科目 helpers（從 subjects.js 統一取） ──
// getSubjectColor / getSubjectBgColor 已從 ./subjects.js import

// ── 全域 FC 初始化（防止 undefined error） ──
window.FC = window.FC || {};

// ── 狀態機 (Phase 4 S20: factory + setView) ──
//
// `state.view` is the routing enum. Each view has a `VIEWS[view]` factory
// that returns a fresh sub-state for that view (with view-specific fields
// nulled out). Use `setView(view, extraPatch)` to transition cleanly; the
// 26 hand-rolled `state = { ...state, view: 'X' }` sites have been migrated
// to this helper. `state = { ...state, ... }` is still allowed for non-
// view-changing patches (e.g. student swap) but is centralized via setState.

export const VIEWS = Object.freeze({
  'role-select':    () => ({ subjectId: null, topicId: null, scenarioId: null, resultData: null }),
  'mode-select':    (p) => ({ subjectId: null, topicId: null, scenarioId: null, resultData: null, gameMode: p?.gameMode }),
  'student-select': () => ({ subjectId: null, topicId: null, scenarioId: null, resultData: null }),
  'subject-select': () => ({ topicId: null, scenarioId: null, resultData: null }),
  'home':           (p) => ({ topicId: null, scenarioId: null, resultData: null, subjectId: p?.subjectId ?? state.subjectId }),
  'topic':          (p) => ({ topicId: p?.topicId, scenarioId: null, resultData: null, subjectId: p?.subjectId ?? state.subjectId }),
  'play':           (p) => ({ topicId: null, scenarioId: p?.scenarioId, resultData: null }),
  'result':         (p) => ({ resultData: p?.resultData, subjectId: p?.subjectId ?? state.subjectId }),
  'progress':       (p) => ({ topicId: null, scenarioId: null, resultData: null, subjectId: p?.subjectId ?? state.subjectId }),
  'settings':       () => ({}),
  'login':          () => ({}),
  'teacher':        () => ({ topicId: null, scenarioId: null, resultData: null }),
  'teacher-assign': () => ({}),
  'hub':            () => ({}),
  'bank-play':      () => ({}),
  'bank-result':    (p) => ({ bankScenario: p?.bankScenario, bankResult: p?.bankResult }),
  'bank-summary':   () => ({}),
});

let state = {
  view: 'role-select',
  student: null,
  subjectId: null,
  topicId: null,
  scenarioId: null,
  resultData: null,
  teacherMode: false,
  role: null,
  gameMode: localStorage.getItem('fc_game_mode') || 'relaxed',
  bankScenario: null,
  bankResult: null,
};

/**
 * Transition to a view, applying the view's reset patch + any extra fields.
 * Use this instead of `state = { ...state, view: 'X' }` for view changes.
 * @param {string} view — one of VIEWS keys
 * @param {Object} [extra] — additional fields (e.g. { topicId, subjectId })
 */
export function setView(view, extra = {}) {
  const factory = VIEWS[view];
  if (!factory) {
    console.warn(`[state] unknown view: ${view}`);
    return;
  }
  state = { ...state, view, ...factory(extra), ...extra };
}

let lastPlayedScenarioId = null; // guard: 防 TTS 重複觸發

// ── 懶加載 teacher chunk（學生不會下載此檔案）──
let _teacher = null;  // 動態加載後 cache

async function _loadTeacher() {
  if (!_teacher) {
    const mod = await import('./teacher.js');
    _teacher = { renderLogin: mod.renderLogin, renderTeacher: mod.renderTeacher };
  }
  return _teacher;
}

// ── 路由 ──
//
// Sprint 1 (Track A1): retired pure navigation stubs (goHome, goProgress,
// goGameHub, goSettings, goSubjectSelect, goRoleSelect, goHub, goModeSelect,
// goTeacherAssign). They were one-line wrappers around setView + render, and
// all of their inline `data-action="go*"` call sites have been migrated to
// `data-action="navigate" data-arg="..."` (which routes through nav.js).
// The remaining 3 navigation-style handlers below — goTopic, goTeacher,
// goRandom — have real side effects (load scenarios, load teacher chunk,
// random pick) and are kept.

/** Reload the page (used by error fallback). */
window.FC.reload = function() { location.reload(); };

/**
 * Navigate to a topic list. Awaits scenarios.json load if not yet loaded.
 * @param {string} topicId
 * @returns {void|Promise<void>}
 */
export function goTopic(topicId) {
  // Phase 3 (S13): ensure scenarios are loaded before we enter topic view
  // (which calls getScenariosByTopic via initTopicProgress).
  if (!_scenariosLoaded) {
    return loadScenarios().then(() => { goTopic(topicId); });
  }
  initTopicProgress(topicId);
  setView('topic', { topicId });
  navRender();
}
window.FC.goTopic = goTopic;

/**
 * Start a scenario. Awaits scenarios.json load if not yet loaded.
 * @param {string} scenarioId
 * @returns {void|Promise<void>}
 */
export function play(scenarioId) {
  if (!_scenariosLoaded) {
    return loadScenarios().then(() => play(scenarioId));
  }
  localStorage.setItem('fc_last_scenario', scenarioId); // guard: TTS trigger
  markScenarioShown(); // analytics: response time 起點
  setView('play', { scenarioId });
  render();
  // SR: announce 載入新題目（題目編號 + 主題 + 題目名）
  const sc = playScenario(scenarioId);
  if (sc) {
    const topicScenarios = getScenariosByTopic(sc.topicId);
    const idx = topicScenarios.findIndex(s => s.id === scenarioId) + 1;
    announceScenarioLoad(sc, {
      index: idx,
      total: topicScenarios.length,
      gameName: '自由探索',
    });
  }
}
window.FC.play = play;

export function choose(optionId) {
  const data = chooseOption(state.scenarioId, optionId, state.subjectId);
  if (!data) {
    console.error('[FC] chooseOption returned null, scenarioId=', state.scenarioId, 'optionId=', optionId);
    goHome();
    return;
  }
  // analytics: log this interaction (老師想知邊個 category 答錯率高)
  try {
    const sc = playScenario(state.scenarioId);
    if (sc) {
      const optIdx = sc.options.findIndex(o => o.id === optionId);
      logInteraction({
        scenarioId: sc.id,
        topicId: sc.topicId,
        category: sc.valueCategory || '',
        optionId,
        optionIndex: optIdx >= 0 ? optIdx + 1 : 0,
        moralChange: data.moralChange,
      }, state.student, state.gameMode);
    }
  } catch (e) {
    console.warn('[FC] analytics log failed:', e.message);
  }
  setView('result', { resultData: data });
  render();
  // 情緒慶祝動畫 + SFX
  setTimeout(() => {
    const isGood = data.moralChange >= 0;
    // 減少動畫模式下 skip 視覺慶祝 layer（confetti / star / comfort）
    // SFX 仍然播（聲音唔會 trigger 前庭障礙）
    if (isGood) {
      playSFX('success');
      if (!_isReducedMotion()) {
        triggerConfetti();
        triggerStarFloat();
      }
    } else {
      playSFX('fail');
      if (!_isReducedMotion()) triggerComfort();
    }
  }, 100);
}
window.FC.choose = choose;

function triggerConfetti() {
  const colors = ['#FFD700','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFE66D'];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 90 + 5 + 'vw';
    el.style.top  = Math.random() * 30 + 10 + 'vh';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = Math.random() * 0.5 + 's';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

function triggerStarFloat() {
  const emojis = ['🌟','✨','💫','⭐'];
  for (let i = 0; i < 6; i++) {
    const el = document.createElement('div');
    el.className = 'star-float';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 80 + 10 + 'vw';
    el.style.top  = 50 + Math.random() * 30 + 'vh';
    el.style.animationDelay = Math.random() * 0.8 + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

function triggerComfort() {
  const el = document.createElement('div');
  el.className = 'star-float';
  el.textContent = '💪';
  el.style.left = '50%';
  el.style.top  = '50%';
  el.style.transform = 'translate(-50%,-50%)';
  el.style.fontSize = '4em';
  el.style.animation = 'bounceIn 0.8s ease-out forwards';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

export function retry() {
  if (state.scenarioId) play(state.scenarioId);
  else goHome();
}
window.FC.retry = retry;


/**
 * Phase 6 (home page declutter): set the topic-domain filter
 * (value / caring / all) and re-render home.
 * Triggers from the filter-tab buttons rendered by renderHome().
 */
export function setHomeFilter(filter) {
  if (!['value', 'caring', 'all'].includes(filter)) {
    console.warn('[FC] setHomeFilter: invalid filter', filter);
    return;
  }
  localStorage.setItem('fc_home_filter', filter);
  render();
}
window.FC.setHomeFilter = setHomeFilter;


export async function goTeacher() {
  // 懶加載 teacher chunk
  await _loadTeacher();
  setView('login');
  render();
}
window.FC.goTeacher = goTeacher;

export async function goRandom() {
  // 自由模式仍需要揀 subjectId，否則 markComplete 會污染 subjectProgress
  if (!state.subjectId) {
    _navigate('subject-select');
    return;
  }
  // Phase 3 (S13): ensure scenarios are loaded before random pick
  if (!_scenariosLoaded) await loadScenarios();
  const all = getScenarios();
  if (!all.length) { _navigate('home'); return; }
  const s = all[Math.floor(Math.random() * all.length)];
  play(s.id);
}
window.FC.goRandom = goRandom;

// TTS 測試（讓學生確認發音正常）
window.FC.testTTS = function() {
  const { speak } = window._fcAudio || {};
  if (speak) speak('呢個係發音測試，請確認可以聽到聲音。如果聽到呢段說話，代表語音功能正常運作。');
};

// ── 🏦 好人好事銀行 handlers ──
window.FC.playGoodDeedBank = async function() {
  // Phase 3 (S13): ensure scenarios are loaded before starting a bank run
  if (!_scenariosLoaded) await loadScenarios();
  const run = startBankRun();
  if (!run || !run.questions?.length) {
    alert('銀行題目載入失敗，請重試。');
    return;
  }
  setView('bank-play');
  render();
  // SR: announce 銀行第一題
  const first = run.questions[run.currentIdx];
  if (first) {
    announceScenarioLoad(first, {
      index: run.currentIdx + 1,
      total: run.questions.length,
      gameName: '好人好事銀行',
    });
  }
};

window.FC.bankChoose = function(optionId) {
  const run = getBankRun();
  if (!run) return;
  const scenario = run.questions[run.currentIdx];
  if (!scenario) return;
  // 計算 moralChange（重用 domain 邏輯，唔經 markComplete — 呢個係獨立遊戲）
  const result = applyScenarioResult(scenario, optionId, getStudent());
  if (!result) {
    console.error('[Bank] applyScenarioResult null');
    return;
  }
  // 補 outcomeImage（同 ScenarioEngine.chooseOption 一樣嘅 path scheme）
  const optIdx = scenario.options.findIndex(o => o.id === optionId);
  result.outcomeImage = `assets/images/outcomes/${scenario.id}_opt${optIdx + 1}.png`;
  recordBankTransaction(result.moralChange, scenario.title);
  // analytics: 銀行遊戲嘅 interaction 都 log
  try {
    logInteraction({
      scenarioId: scenario.id,
      topicId: scenario.topicId,
      category: scenario.valueCategory || '',
      optionId,
      optionIndex: optIdx >= 0 ? optIdx + 1 : 0,
      moralChange: result.moralChange,
    }, getStudent(), 'bank');
  } catch (e) {
    console.warn('[FC] bank analytics log failed:', e.message);
  }
  state = {
    ...state,
    view: 'bank-result',
    bankScenario: scenario,
    bankResult: result,
  };
  render();
};

window.FC.bankNext = function() {
  const run = getBankRun();
  if (!run) { FC.exitBank(); return; }
  // 局結束（finished / bankrupt）→ 結算
  if (run.status === 'finished' || run.status === 'bankrupt') {
  setView('bank-summary');
    render();
    return;
  }
  advanceToNextQuestion();
  setView('bank-play');
  render();
  // SR: announce 下一題
  const next = run.questions[run.currentIdx];
  if (next) {
    announceScenarioLoad(next, {
      index: run.currentIdx + 1,
      total: run.questions.length,
      gameName: '好人好事銀行',
    });
  }
};

window.FC.exitBank = function() {
  endBankRun();
  setView('hub');
  render();
};

window.FC.confirmExitBank = function() {
  if (confirm('中途離開？今次遊戲進度會唔儲。')) {
    FC.exitBank();
  }
};

// Event helper: 內嵌喺 inline handler 嗰陣用，避免 mobile browser touch 事件漏出去撞到 parent
// 用法：onclick="FC._stopEvt(event); doStuff()"
window.FC._stopEvt = function(e) {
  if (!e) return;
  if (typeof e.stopPropagation === 'function') e.stopPropagation();
  if (typeof e.preventDefault === 'function') e.preventDefault();
};

// TTS 語言切換
window.FC.setTTSLang = function(langId) {
  setTTSLang(langId);
  // 自動播一句 test 畀 user 即時聽到分別
  const { speak } = window._fcAudio || {};
  if (speak) speak('語言切換測試，你聽到嘅係新嘅發音。');
  // 重新 render settings 頁，更新 active 狀態
  if (state.view === 'settings') render();
};
window.FC.getTTSLang = function() { return getTTSLang(); };
window.FC.TTS_LANGS = TTS_LANGS;


export function selectSubject(subjectId) {
  initSubjectProgress(subjectId);
  setView('home', { subjectId });
  render();
}
window.FC.selectSubject = selectSubject;

// ── Role Select (Entry Point) ──

export async function chooseRole(role) {
  state = { ...state, role, teacherMode: role === 'teacher' };
  // not a view change — keep the spread (S20 allows non-view patches)
  if (role === 'teacher') {
    // 預載 teacher chunk，避免 login 頁「載入中」閃一下
    await _loadTeacher();
  setView('login');
  } else {
    // Student: go to Game Hub (Blooket-style lobby)
  setView('hub');
  }
  render();
}
window.FC.chooseRole = chooseRole;


export function selectMode(modeId) {
  localStorage.setItem('fc_game_mode', modeId);
  state = { ...state, gameMode: modeId };
  // not a view change — keep the spread
  render();
  // Show brief confirmation
  setTimeout(() => {
    const cards = document.querySelectorAll('.mode-card');
    cards.forEach(c => c.classList.remove('selected'));
    const selected = document.querySelector(`.mode-card.${modeId}`);
    if (selected) {
      selected.classList.add('selected');
      selected.style.transform = 'scale(1.05)';
      setTimeout(() => { selected.style.transform = ''; }, 300);
    }
  }, 50);
}


// Teacher config helpers
function getTeacherConfig() {
  try {
    return JSON.parse(localStorage.getItem('fc_teacher_config') || '{}');
  } catch {
    // corrupted value — reset to empty
    console.warn('[FC] teacher_config corrupt, resetting');
    return {};
  }
}
function saveTeacherConfig(cfg) {
  try {
    localStorage.setItem('fc_teacher_config', JSON.stringify(cfg));
  } catch (e) {
    console.error('[FC] saveTeacherConfig failed:', e.message);
  }
}
window.FC.toggleTeacherFeature = function(btn, key) {
  btn.classList.toggle('on');
  const val = btn.classList.contains('on');
  const cfg = getTeacherConfig();
  cfg[key] = val;
  saveTeacherConfig(cfg);
  if (key === 'timerEnabled') render();
};
window.FC.setTeacherTimer = function(val) {
  const cfg = getTeacherConfig();
  cfg.timerSeconds = parseInt(val);
  saveTeacherConfig(cfg);
};
window.FC.setButtonSize = function(size) {
  const cfg = getTeacherConfig();
  cfg.buttonSize = size;
  saveTeacherConfig(cfg);
  render();
};
// S11: 銀行題目風險 ceiling。0=value only / 1=default / 2=mid / 3=all
window.FC.setBankMaxRisk = function(level) {
  const cfg = getTeacherConfig();
  cfg.bankMaxRiskLevel = level;
  saveTeacherConfig(cfg);
  render();
};
window.FC.toggleAssignedTopic = function(topicId, checked) {
  const cfg = getTeacherConfig();
  if (!cfg.assignedTopics) cfg.assignedTopics = [];
  if (checked) {
    if (!cfg.assignedTopics.includes(topicId)) cfg.assignedTopics.push(topicId);
  } else {
    cfg.assignedTopics = cfg.assignedTopics.filter(t => t !== topicId);
  }
  saveTeacherConfig(cfg);
};
window.FC.saveTeacherPIN = function() {
  const pin = document.getElementById('teacher-pin-input')?.value?.trim() || 'admin';
  localStorage.setItem('fc_teacher_pin', pin);
  alert('✅ PIN 已更新為：' + pin);
};
window.FC.saveTeacherConfig = function() {
  alert('✅ 老師設定已儲存！');
  goTeacher();
};

export function switchStudent() {
  setView('student-select');
  render();
}
window.FC.switchStudent = switchStudent;

// ── 學生選擇 ──
const STUDENT_EMOJI = {};  // 動態從 localStorage 讀取
function renderStudentSelect() {
  const saved = getAllStudents();  // 從 progress.js 動態讀取
  return `
    <div class="container fade-in" style="max-width:460px;padding-top:40px">
      <h1 style="text-align:center;margin-bottom:24px">👤 選擇學生</h1>
      <div class="fc-flex-col-gap fc-mb-20" role="list" aria-label="已登記嘅學生">
        ${saved.map(student => `
          <button type="button" class="student-card" data-action="selectStudent" data-arg="${escapeAttr(student.name)}" role="listitem"
            aria-label="選擇學生 ${escapeAttr(student.name)}，按此開始學習">
            <span class="avatar" aria-hidden="true">${student.emoji || '👤'}</span>
            <span class="info">
              <span class="name">${student.name}</span>
              <span class="sub">按此開始學習</span>
            </span>
            <span class="arrow" aria-hidden="true">→</span>
          </button>
        `).join('')}
      </div>
      <div style="text-align:center;color:var(--text-light);margin-bottom:16px;font-size:0.9em">— 或新增學生 —</div>
      <div style="background:var(--card);border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <label for="new-student-name" class="sr-only">新學生名字</label>
        <input id="new-student-name" type="text" inputmode="none" autocomplete="off" placeholder="輸入新學生名字"
          style="width:100%;padding:14px;border:2px solid var(--border);border-radius:10px;font-size:1em;margin-bottom:10px;box-sizing:border-box" />
        <button type="button" class="btn btn-success" class="fc-w-100" data-action="addStudent">➕ 新增學生</button>
      </div>
      <div style="margin-top:16px;text-align:center">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="role-select">← 返回首頁</button>
      </div>
      ${renderFooter()}
    </div>
  `;
}
window.FC.selectStudent = function(name) {
  if (name === '其他') return;
  setStudent(name);
  setView('home', { student: name });
  render();
};

// ── 科目選擇 ──
function renderSubjectSelect() {
  return `
    <div class="container fade-in" style="max-width:500px">
      <h1 style="text-align:center;margin-bottom:20px">📚 選擇科目</h1>
      <div class="subject-grid" role="list" aria-label="科目清單">
        ${getAllSubjects().map(sub => `
          <button type="button" class="subject-btn" style="background:${sub.bgColor};border-color:${sub.color}"
            data-action="selectSubject" data-arg="${escapeAttr(sub.id)}" role="listitem"
            aria-label="選擇科目 ${sub.title}">
            <span style="font-size:2em" aria-hidden="true">${sub.emoji}</span>
            <span style="font-weight:600;color:${sub.color}">${sub.title}</span>
          </button>
        `).join('')}
      </div>
      <div style="margin-top:12px;text-align:center">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="home">← 返回</button>
      </div>
      ${renderFooter()}
    </div>
  `;
}

// handleImport / exportAll stay in main.js (teacher專屬操作，但零 circular deps)
window.FC.handleImport = function(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const r = importProgress(ev.target.result);
    if (r.ok) { alert('匯入成功！'); window.FC.goTeacher(); }
    else { alert('匯入失敗：' + r.error); }
  };
  reader.readAsText(file);
};
window.FC.exportAll = function() {
  const students = getAllStudents();
  const blob = new Blob([JSON.stringify(students, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = '全班進度.json';
  a.click(); URL.revokeObjectURL(url);
};

// ── 語音 ──
window.FC.speak = function() {
  const s = playScenario(state.scenarioId);
  if (s) speakScenario(s);
};
window.FC.speakOpt = function(optionId) {
  const s = playScenario(state.scenarioId);
  if (!s) return;
  const opt = s.options.find(o => o.id === optionId);
  if (opt) {
    const { speak } = window._fcAudio || {};
    if (speak) speak(opt.text);
  }
};
window.FC.speakCreeds = function() {
  if (state.resultData?.creeds) speakCreeds(state.resultData.creeds);
};

// ── Hints panel ──
let _hintsRevealed = 0;
window.FC.toggleHints = function() {
  const list = document.getElementById('hints-list');
  const chev = document.getElementById('hints-chev');
  const toggle = document.getElementById('hints-toggle');
  if (!list) return;
  const open = list.hasAttribute('hidden') ? false : true;
  if (open) {
    list.setAttribute('hidden', '');
    if (chev) chev.textContent = '▾';
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  } else {
    list.removeAttribute('hidden');
    if (chev) chev.textContent = '▴';
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    // 第一次打開自動揭第一個
    if (_hintsRevealed === 0) FC.revealNextHint();
  }
};
window.FC.revealNextHint = function() {
  const items = document.querySelectorAll('.hint-item');
  const next = document.getElementById('hint-next');
  if (_hintsRevealed >= items.length) return;
  items[_hintsRevealed].removeAttribute('hidden');
  _hintsRevealed++;
  // 全部揭完 → 隱藏 next 按鈕
  if (_hintsRevealed >= items.length) {
    if (next) next.setAttribute('hidden', '');
  }
};
// 每次 render 完重置 hints 計數
const _origRender = render;
render = function() {
  _hintsRevealed = 0;
  _origRender();
  // 結果頁 floating CTA 邏輯
  requestAnimationFrame(updateResultCtaFab);
};
function updateResultCtaFab() {
  const actions = document.getElementById('result-actions');
  const fab = document.getElementById('result-cta-fab');
  if (!actions || !fab) return;
  const rect = actions.getBoundingClientRect();
  const offScreen = rect.top > window.innerHeight || rect.bottom < 0;
  if (offScreen) fab.removeAttribute('hidden');
  else fab.setAttribute('hidden', '');
}
// scroll / resize 時更新 floating CTA
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => {
    if (document.getElementById('result-cta-fab')) updateResultCtaFab();
  }, { passive: true });
  window.addEventListener('resize', updateResultCtaFab);
}

window.FC.toggleVoice = function(el) {
  const on = !isEnabled();
  setEnabled(on);
  if (el) el.classList.toggle('on', on);
  // Auto-enable voice by default when toggled on for first time
  if (on && !localStorage.getItem('fc_voice_seen')) {
    localStorage.setItem('fc_voice_seen', '1');
  }
};

window.FC.setFontSize = function(v) {
  localStorage.setItem('fc_font_size', v);
  applyCSS();
  const label = document.querySelector('[data-for="fs"]');
  if (label) label.textContent = v <= 18 ? '小' : v <= 22 ? '中' : '大';
};
window.FC.setLineHeight = function(v) {
  localStorage.setItem('fc_line_height', v);
  applyCSS();
  const label = document.querySelector('[data-for="lh"]');
  if (label) label.textContent = parseFloat(v).toFixed(1);
};
window.FC.setSpacing = function(v) {
  localStorage.setItem('fc_spacing', v);
  applyCSS();
  ['narrow','medium','wide'].forEach(s => {
    const btn = document.getElementById('sp-' + s);
    if (btn) btn.className = 'btn ' + (s === v ? 'btn-primary' : 'btn-outline');
  });
};

// 🌓 高對比模式 — toggle data-hc attribute + 持久化
window.FC.toggleHC = function(el) {
  const next = !(localStorage.getItem('fc_hc_mode') === '1');
  localStorage.setItem('fc_hc_mode', next ? '1' : '0');
  if (el) el.classList.toggle('on', next);
  // 立即套用（唔使 re-render 整頁）
  applyCSS();
  // SR: announce 切換咗咩
  announceToSR(next ? '高對比模式開咗' : '高對比模式關咗');
};

// 🎬 減少動畫模式 — toggle data-rm attribute + 持久化
// 對稱 HC 嘅 pattern：data-rm on <html> → CSS 停掉 transition/animation
// 唔 auto-hook prefers-reduced-motion（同 HC 一樣 manual 為主，避免覆蓋用戶自選）
window.FC.toggleReducedMotion = function(el) {
  const next = !(localStorage.getItem('fc_rm_mode') === '1');
  localStorage.setItem('fc_rm_mode', next ? '1' : '0');
  if (el) el.classList.toggle('on', next);
  applyCSS();
  announceToSR(next ? '減少動畫開咗' : '減少動畫關咗');
};

// 慶祝 layer 喺 reduced motion 模式下直接 skip（即使 CSS override 都慳返 render）
// 對應 main.js 嘅 triggerConfetti / triggerStarFloat / triggerComfort
function _isReducedMotion() {
  return document.documentElement.hasAttribute('data-rm');
}
window.FC.setSpeed = function(v) {
  localStorage.setItem('fc_tts_speed', v);
  const label = document.querySelector('[data-for="speed"]');
  if (label) label.textContent = parseFloat(v).toFixed(2) + 'x';
};
window.FC.resetSettings = function() {
  resetAllSettings();
  render();
};

// ── Analytics export (Phase 1: 純 client-side, 老師攞 CSV 走) ──
window.FC.exportAnalyticsCSV = function() {
  try {
    const result = exportInteractionsCSV();
    if (result.count === 0) {
      alert('📊 仲未有學習記錄\n\n先玩幾個 scenario 先有 log 喺 localStorage。');
      return;
    }
    alert(`✅ 已匯出 ${result.count} 條學習記錄\n\n檔案：${result.filename}\n\n可以分享畀老師 / 拖入 Excel / Google Sheet 開。`);
  } catch (e) {
    console.error('[FC] exportAnalyticsCSV failed:', e.message);
    alert('❌ 匯出失敗：' + e.message);
  }
};

window.FC.clearAnalytics = function() {
  if (!confirm('⚠️ 確定清除所有學習記錄？\n\n清除後將無法復原。')) return;
  clearInteractions();
  render();
};

window.FC.getAnalyticsStats = getStats;

// ── 更新 settings 頁嘅 analytics summary ──
function updateAnalyticsSummary() {
  const el = document.getElementById('analytics-summary');
  if (!el) return;
  try {
    const stats = getStats();
    if (stats.totalRows === 0) {
      el.textContent = '📭 仲未有學習記錄 — 玩幾個 scenario 就會見到。';
      return;
    }
    // 揾 top 3 答錯率最高嘅 categories
    const cats = Object.entries(stats.byCategory)
      .filter(([k]) => k && k !== '(uncategorized)')
      .sort((a, b) => b[1].wrongRate - a[1].wrongRate)
      .slice(0, 3);
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

// ── Loading skeleton helpers (settings badges) ──
function setSyncStatusLoading() {
  const badge = document.getElementById('settings-sync-status');
  const lastSync = document.getElementById('settings-last-sync');
  if (badge) badge.innerHTML = '<span class="skeleton skeleton-text-sm" style="width:80px"></span>';
  if (lastSync) lastSync.innerHTML = '<span class="skeleton skeleton-text-sm" style="width:120px"></span>';
}

// ── Force sync ──
window.FC.forceSync = async function() {
  const name = getStudent();
  if (!name) return;
  const p = getProgress(name);
  setSyncStatusLoading();
  const result = await syncNow(name, p);
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

// ── 匯出入 ──
window.FC.exportMyData = function() {
  const name = getStudent();
  if (!name) return;
  const json = exportProgress(name);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `progress_${name}.json`;
  a.click(); URL.revokeObjectURL(url);
};
window.FC.importMyData = function() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const r = importProgress(ev.target.result);
      alert(r.ok ? '匯入成功！' : '匯入失敗：' + r.error);
      if (r.ok) render();
    };
    reader.readAsText(file);
  };
  input.click();
};

// ── View Transitions wrapper (page-level animation when browser supports it) ──
// 支援度：Chrome 111+ / Edge 111+。Safari/Firefox 自動 fallback 直接 render。
const supportsViewTransitions = typeof document !== 'undefined'
  && 'startViewTransition' in document;

function renderWithTransition(updateFn) {
  // Reduced motion user 跳過動畫
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    updateFn();
    return;
  }
  if (supportsViewTransitions) {
    document.startViewTransition(updateFn);
  } else {
    updateFn();
  }
}

// ── 統一導航：包住 render() 觸發 View Transition ──
// 任何 page-level 切換（唔係 in-place update）應該用呢個。
// 例外：in-place update 例如 settings toggle、analytics refresh 用 render() 直接。
function navRender() {
  renderWithTransition(render);
}

/** Phase 4 (S25): parse an HTML string into nodes and patch #fc-view. */
function _setViewHTML(html) {
  // Use <template> to parse without injecting into the live document first.
  // This preserves any live event listeners on sibling nodes of #fc-view.
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  view.replaceChildren(t.content);
}

// ── Event delegation (Phase 3 S16) ──────────────────────────────────────────
// Replaces inline `onclick="FC.foo('${x}')"` strings with `data-action="foo"`
// attributes. The single listener below dispatches by data-action + data-arg.
//
// This kills two birds:
//   1. XSS via interpolated user-controlled strings (P0-3 architectural fix)
//   2. Need to re-bind listeners after every `app.innerHTML = html` wipe
//
// Templates should use:
//   <button data-action="play" data-arg="${escapeAttr(s.id)}">...
//
// Multi-arg handlers (e.g. `FC.toggleTeacherFeature(btn, 'hintEnabled')`)
// pass the second arg via data-arg2. The dispatcher reads window.FC[name]
// dynamically so it auto-picks up new handlers.

const _DELEGATE_EVENTS = ['click', 'error'];

function _setupDelegates(rootEl) {
  if (!rootEl || rootEl.__fcDelegated) return;
  rootEl.__fcDelegated = true;
  // Phase 4 (S21): delegated `error` listener for <img> fallback.
  // Listens on capture phase because image errors don't bubble reliably
  // (Safari/old browsers). Sets opacity + alt in one place instead of
  // 7 inline `onerror` strings.
  rootEl.addEventListener('error', (e) => {
    const t = e.target;
    if (t && t.tagName === 'IMG') {
      t.style.opacity = '0.3';
      t.alt = '（插圖暫不可用）';
    }
  }, true);
  for (const ev of _DELEGATE_EVENTS.filter(x => x !== 'error')) {
    rootEl.addEventListener(ev, (e) => {
      // walk up to the closest [data-action]
      let el = e.target;
      while (el && el !== rootEl) {
        const action = el.dataset && el.dataset.action;
        if (action) {
          // Phase 5: data-action="navigate" — universal navigation action.
          // data-arg = view name, data-arg2 = primary arg (e.g. topicId).
          // Falls through to window.FC[action] if not "navigate".
          if (action === 'navigate') {
            e.preventDefault();
            _navigate(el.dataset.arg, el.dataset.arg2);
            return;
          }
          const fn = window.FC?.[action];
          if (typeof fn === 'function') {
            e.preventDefault();
            const arg1 = el.dataset.arg;
            const arg2 = el.dataset.arg2;
            // Preserve `this` = the element for handlers that need it
            // (e.g. FC.toggleTeacherFeature reads btn.classList)
            if (arg2 !== undefined) fn.call(el, arg1, arg2);
            else if (arg1 !== undefined) fn.call(el, arg1);
            else fn.call(el, e);
            return;
          }
        }
        el = el.parentElement;
      }
    });
  }
}

// ── HTML attribute escaping (Phase 1 S3: XSS guard) ──
import { escapeAttr, escapeJsString } from './util/escape.js';
import { renderFooter, renderEmptyState, renderLoading, renderSkeleton } from './components/chrome.js';
import { t } from './i18n.js';

// ── 渲染 ──
function renderErrorFallback(e) {
  return `
    <div class="container fade-in" role="alert" aria-live="assertive">
      <div class="card fc-center" style="padding:32px 20px">
        <div style="font-size:3em;margin-bottom:12px" aria-hidden="true">⚠️</div>
        <h2 style="margin-bottom:8px">${t('error.fallbackTitle')}</h2>
        <p class="fc-muted fc-mb-16">
          ${t('error.fallbackHint')}
        </p>
        <details style="text-align:left;background:var(--bg);border-radius:8px;padding:12px;margin-bottom:16px;font-size:0.85em">
          <summary style="cursor:pointer;font-weight:600">🔍 技術細節</summary>
          <pre style="white-space:pre-wrap;margin-top:8px;color:var(--danger)">${e.message}</pre>
        </details>
        <div class="action-row" style="justify-content:center">
          <button type="button" class="btn btn-primary" data-action="navigate" data-arg="home">← 返主頁</button>
          <button type="button" class="btn btn-outline" data-action="reload">${t('error.fallbackReload')}</button>
        </div>
      </div>
    </div>
  `;
}

function render() {
  let html = '';
  try {
    switch (state.view) {
      case 'role-select':    html = renderRoleSelect(); break;
      case 'hub':            html = renderGameHub(); break;
      case 'mode-select':    html = renderModeSelect(state.gameMode, state.subjectId); break;
      case 'student-select': html = renderStudentSelect(); break;
      case 'subject-select': html = renderSubjectSelect(); break;
      case 'login': html = _teacher ? _teacher.renderLogin() : renderLoading('載入中...'); break;
      case 'teacher': html = _teacher ? _teacher.renderTeacher() : renderLoading('載入中...'); break;
      case 'teacher-assign': html = renderTeacherAssign(); break;
      case 'home': html = renderHome(state.subjectId); break;
      case 'topic': html = renderTopicList(state.topicId, state.subjectId); break;
      case 'play': html = renderPlay(state.scenarioId, state.subjectId); break;
      case 'result': html = renderResult(state.resultData, state.subjectId); break;
      case 'progress': html = renderProgress(state.subjectId); break;
      case 'settings': html = renderSettings(); break;
      // 🏦 好人好事銀行
      case 'bank-play': {
        const run = getBankRun();
        const sc = run?.questions?.[run?.currentIdx] || null;
        html = renderBankPlay(sc, run);
        break;
      }
      case 'bank-result': html = renderBankResult(state.bankScenario, state.bankResult, getBankRun()); break;
      case 'bank-summary': html = renderBankSummary(getBankRun()); break;
      default: html = '<div class="container"><p>頁面不存在</p></div>';
    }
    _setViewHTML(html);
    // Phase 3 (S16): wire event delegation for data-action handlers
    _setupDelegates(view);
    // Post-render hooks
    if (state.view === 'settings') updateAnalyticsSummary();
  } catch(e) {
    console.error('[FC] RENDER ERROR:', e.message, e.stack);
    _setViewHTML(renderErrorFallback(e));
    _setupDelegates(view);
  }
}

// ── 啟動 ──
// Phase 3 (S13): scenarios.json no longer loaded at boot. The first render

// Wire nav.js callbacks. `navigate()` resolves the view + arg and calls
// these locally-defined functions. Done after render/navRender/setView are
// defined above so nav.js never has to know about main.js internals.
wireNav({ setView, navRender, render });
// path that needs it (subject-select → play). For the very first render, scenarios=[] is fine — renderRoleSelect
// and renderStudentSelect don't need them.
// path that needs it (subject-select → play) awaits loadScenarios() before
// continuing. For the very first render, scenarios=[] is fine — renderRoleSelect
// and renderStudentSelect don't need them.
try {
  render();
} catch(e) {
  console.error('[FC] RENDER ERROR:', e.message, e.stack);
  _setViewHTML(renderErrorFallback(e));
  _setupDelegates(view);
}