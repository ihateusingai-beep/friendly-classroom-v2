// src/domain/Play.js — Scenario play flow: load, choose, retry, animations.
//
// Extracted from main.js (Sprint 2 / Track A2). Handles the "free-mode"
// question/answer cycle: pick a scenario, render the question, log the
// choice, render the result with celebration/comfort animations.
//
// Public API:
//   wirePlay({ setView, render, _navigate, getState,
//             loadScenarios, loadScenariosForTopic, getScenarioById,
//             playScenario, getScenariosByTopic,
//             chooseOption, markScenarioShown, logInteraction,
//             playSFX, _isReducedMotion,
//             announceScenarioLoad })
//   play(scenarioId)      : enter the scenario question view
//   choose(optionId)      : pick an option, enter result view
//   retry()               : restart current scenario
//   updateResultCtaFab()  : show FAB on result page when action row is off-screen
//
// The animation helpers (triggerConfetti / triggerStarFloat / triggerComfort)
// are module-private since they have no external callers.

import { announceScenarioLoad, announceToSR } from '../components/Toast.js';
import { isEmotionDetectiveEnabled } from '../engine.js';
// Sprint 27 U3: track last-played timestamp so the resume banner on home
// can show "上次 N 分鐘前玩過". Replaces the bare `fc_last_scenario` write
// so Resume.js can do its candidate check with both id + timestamp.
import { recordLastPlayed } from './Resume.js';

let _setView = null;
let _render = null;
let _navigate = null;
let _getState = null;
let _loadScenarios = null;
let _loadScenariosForTopic = null;
let _getScenarioById = null;
let _playScenario = null;
let _getScenariosByTopic = null;
let _chooseOption = null;
let _markScenarioShown = null;
let _logInteraction = null;
let _playSFX = null;
let _isReducedMotion = null;

/** Inject main.js dependencies. */
export function wirePlay({
  setView, render, _navigate, getState,
  loadScenarios, loadScenariosForTopic, getScenarioById,
  playScenario, getScenariosByTopic,
  chooseOption, markScenarioShown, logInteraction,
  playSFX, isReducedMotion,
}) {
  _setView = setView;
  _render = render;
  _navigate = _navigate;
  _getState = getState;
  _loadScenarios = loadScenarios;
  _loadScenariosForTopic = loadScenariosForTopic;
  _getScenarioById = getScenarioById;
  _playScenario = playScenario;
  _getScenariosByTopic = getScenariosByTopic;
  _chooseOption = chooseOption;
  _markScenarioShown = markScenarioShown;
  _logInteraction = logInteraction;
  _playSFX = playSFX;
  _isReducedMotion = isReducedMotion;
}

/** Start a scenario (data-action="play").
 *  Sprint 3 / B1: load the owning chunk via getScenarioById() (which
 *  resolves the topic from the id→topic reverse index) — no need to
 *  preload the full set. */
export function play(scenarioId) {
  return _getScenarioById(scenarioId).then(sc => {
    // If the scenario truly doesn't exist in any chunk, bail back to home.
    if (!sc) {
      _navigate('home');
      return;
    }
    // Sprint 23 / SPEC §22.16.4 — deep-link guard: if scenario belongs to
    // the emotion-detective topic AND teacher has disabled it, redirect
    // home + Toast. Avoids stale `fc_last_scenario` pointing at a hidden
    // topic (e.g. student reopens app after teacher toggles off).
    if (sc.topicId === 'emotion-detective' && !isEmotionDetectiveEnabled()) {
      try { localStorage.removeItem('fc_last_scenario'); } catch {}
      _navigate('home');
      announceToSR('老師已關閉情緒小偵探課題, 已返回主頁');
      return;
    }
    localStorage.setItem('fc_last_scenario', scenarioId);
    recordLastPlayed(scenarioId);
    _markScenarioShown();
    _setView('play', { scenarioId });
    _render();
    // SR announce for the new question
    const loaded = _playScenario(scenarioId);
    if (loaded) {
      const topicScenarios = _getScenariosByTopic(loaded.topicId);
      const idx = topicScenarios.findIndex(s => s.id === scenarioId) + 1;
      announceScenarioLoad(loaded, {
        index: idx,
        total: topicScenarios.length,
        gameName: '自由探索',
      });
    }
  });
}

/** Pick an option (data-action="choose"). Logs analytics, transitions
 *  to result view, triggers celebration/confetti animation based on
 *  moralChange sign.
 */
export function choose(optionId) {
  const state = _getState();
  const data = _chooseOption(state.scenarioId, optionId, state.subjectId);
  if (!data) {
    console.error('[Play] chooseOption returned null, scenarioId=',
      state.scenarioId, 'optionId=', optionId);
    _navigate('home');
    return;
  }
  // analytics: log this interaction
  try {
    const sc = _playScenario(state.scenarioId);
    if (sc) {
      // Sprint 23 (SPEC §23): emotion-detective scenarios use faceOptions
      // instead of options; check both for analytics continuity.
      const optIdx = Array.isArray(sc.options)
        ? sc.options.findIndex(o => o.id === optionId)
        : (Array.isArray(sc.faceOptions)
            ? sc.faceOptions.findIndex(f => f.id === optionId)
            : -1);
      _logInteraction({
        scenarioId: sc.id,
        topicId: sc.topicId,
        category: sc.valueCategory || '',
        optionId,
        optionIndex: optIdx >= 0 ? optIdx + 1 : 0,
        moralChange: data.moralChange,
      }, state.student, state.gameMode);
    }
  } catch (e) {
    console.warn('[Play] analytics log failed:', e.message);
  }
  _setView('result', { resultData: data });
  _render();
  // Celebration / comfort animations after the result page renders
  setTimeout(() => {
    const isGood = data.moralChange >= 0;
    if (isGood) {
      _playSFX('success');
      if (!_isReducedMotion()) {
        triggerConfetti();
        triggerStarFloat();
      }
    } else {
      _playSFX('fail');
      if (!_isReducedMotion()) triggerComfort();
    }
  }, 100);
}

/** Restart the current scenario (data-action="retry"). */
export function retry() {
  const state = _getState();
  if (state.scenarioId) play(state.scenarioId);
  else _navigate('home');
}

// ── Result-page floating CTA visibility ─────────────────────────────

/** Show a floating CTA when the result-page action row is off-screen
 *  (mobile/tablet). Hides it again when the actions come into view.
 */
export function updateResultCtaFab() {
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

// ── Private: celebration animations ────────────────────────────────

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
