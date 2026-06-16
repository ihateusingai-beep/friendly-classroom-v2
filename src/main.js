// 友愛教室 V2 — main.js

// MUST come before any import that runs `window.FC.X = ...` at module
// top level. The domain modules (Student/Auth/Play/Hub/IO) register
// their handlers eagerly when imported, so window.FC must already exist
// by the time we import them below.
window.FC = window.FC || {};

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
import { announceToSR, announceScenarioLoad } from './components/Toast.js';

// ── 慶祝 layer 喺 reduced motion 模式下直接 skip（即使 CSS override 都慳返 render）
// 對應 Play.js 嘅 triggerConfetti / triggerStarFloat / triggerComfort
function _isReducedMotion() {
  return document.documentElement.hasAttribute('data-rm');
}

// Sprint 2 / Track A2: split main.js into domain modules. Each module is
// wired with main.js locals (setView / render / scenario engine) to keep
// a single source of truth and avoid circular deps. window.FC.* exports
// are still registered from main.js so they exist at boot time before
// any data-action click fires.
import {
  wireStudent, switchStudent, selectStudent, renderStudentSelect,
} from './domain/Student.js';
import {
  wireAuth, selectSubject, selectMode, chooseRole, renderSubjectSelect,
} from './domain/Auth.js';
import {
  wirePlay, play, choose, retry, updateResultCtaFab,
} from './domain/Play.js';
import {
  wireHub, goTopic, goRandom, goTeacher,
  playGoodDeedBank, bankChoose, bankNext, exitBank, confirmExitBank,
} from './games/Hub.js';
import {
  wireIO, updateAnalyticsSummary, setSyncStatusLoading,
} from './domain/IO.js';
// Sprint 3 / Track B1: per-topic chunk loading lives in ScenarioEngine.
// Re-exports here keep the main.js API surface unchanged for downstream
// modules that wireHub() / wirePlay() / wireIO() with the engine entry
// points. The engine owns the chunk path map (`import.meta.glob`) so it
// stays self-contained; main.js just re-exports.
import { loadScenarios, loadScenariosForTopic, getScenarioById } from './domain/ScenarioEngine.js';
export { loadScenarios, loadScenariosForTopic };

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

// ── SR announcer + visual toast: extracted to src/components/Toast.js ──

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
// (moved to top-of-file so domain modules can register window.FC.* at
//  module-load time without hitting undefined)

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

// goTopic moved to src/games/Hub.js (Sprint 2)

// play / choose / retry / triggerConfetti / triggerStarFloat /
// triggerComfort moved to src/domain/Play.js (Sprint 2)


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


// goTeacher / goRandom / playGoodDeedBank / bankChoose / bankNext /
// exitBank / confirmExitBank moved to src/games/Hub.js (Sprint 2)

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

// All teacher config / settings / sync / analytics / export-import /
// voice / a11y (HC/RM) handlers — moved to src/domain/IO.js (Sprint 2).
// window.FC.* registrations for these are also done in main.js's wire-up
// step so they remain available to data-action clicks.

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

// Sprint 2 (Track A2): wire domain modules. Each module needs a slice of
// main.js locals; passing them in keeps the module-isolation contract.
wireStudent({
  setView, render,
  renderFooter: () => renderFooter(),
});
wireAuth({
  setView, render, _loadTeacher,
  getAllSubjects, initSubjectProgress,
  getState: () => state, setState: (s) => { state = s; },
});
wirePlay({
  setView, render, _navigate,
  getState: () => state,
  loadScenarios, loadScenariosForTopic, getScenarioById,
  playScenario, getScenariosByTopic,
  chooseOption, markScenarioShown, logInteraction,
  playSFX, isReducedMotion: _isReducedMotion,
});
wireHub({
  setView, navRender, render, _navigate,
  getState: () => state,
  loadScenarios, loadScenariosForTopic,
  getScenarios, getScenariosByTopic, initTopicProgress, applyScenarioResult,
  getStudent, getBankRun, startBankRun, endBankRun,
  advanceToNextQuestion, recordBankTransaction, logInteraction,
});
wireIO({
  render, getStudent, getAllStudents,
  importProgress, exportProgress, syncNow, getProgress,
  getStats, exportInteractionsCSV, clearInteractions, _navigate,
});

// Register window.FC exports for the extracted handlers so data-action
// clicks on templates can still dispatch to them.
window.FC.goTopic = goTopic;
window.FC.goTeacher = goTeacher;
window.FC.goRandom = goRandom;
window.FC.playGoodDeedBank = playGoodDeedBank;
window.FC.bankChoose = bankChoose;
window.FC.bankNext = bankNext;
window.FC.exitBank = exitBank;
window.FC.confirmExitBank = confirmExitBank;
window.FC.play = play;
window.FC.choose = choose;
window.FC.retry = retry;
window.FC.switchStudent = switchStudent;
window.FC.selectStudent = selectStudent;
window.FC.selectSubject = selectSubject;
window.FC.selectMode = selectMode;
window.FC.chooseRole = chooseRole;
window.FC.updateResultCtaFab = updateResultCtaFab;
window.FC.updateAnalyticsSummary = updateAnalyticsSummary;
window.FC.setSyncStatusLoading = setSyncStatusLoading;

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