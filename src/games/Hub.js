// src/games/Hub.js — Game hub: free-mode topic nav, random pick, teacher entry,
//                    好人好事銀行 (Good Deed Bank) mini-game.
//
// Extracted from main.js (Sprint 2 / Track A2). The "hub" view is the
//   student-facing lobby (Blooket-style). It has 3 entry points:
//     - 情境答題 (free play)  → topic cards
//     - 好人好事銀行           → bank mini-game
//     - 關係花園 (locked)     → future
//
// Public API:
//   wireHub({ setView, navRender, render, _navigate, getState,
//            loadScenarios, _scenariosLoaded,
//            getScenarios, initTopicProgress, applyScenarioResult,
//            getStudent, getBankRun, startBankRun, endBankRun,
//            advanceToNextQuestion, recordBankTransaction,
//            logInteraction, announceScenarioLoad })
//   goTopic(topicId)
//   goRandom()
//   goTeacher()
//   playGoodDeedBank()
//   bankChoose(optionId)
//   bankNext()
//   exitBank()
//   confirmExitBank()

import { announceScenarioLoad } from '../components/Toast.js';

let _setView = null;
let _navRender = null;
let _render = null;
let _navigate = null;
let _getState = null;
let _loadScenarios = null;
let _scenariosLoaded = false;
let _getScenarios = null;
let _initTopicProgress = null;
let _applyScenarioResult = null;
let _getStudent = null;
let _getBankRun = null;
let _startBankRun = null;
let _endBankRun = null;
let _advanceToNextQuestion = null;
let _recordBankTransaction = null;
let _logInteraction = null;

/** Inject main.js dependencies. */
export function wireHub(deps) {
  _setView = deps.setView;
  _navRender = deps.navRender;
  _render = deps.render;
  _navigate = deps._navigate;
  _getState = deps.getState;
  _loadScenarios = deps.loadScenarios;
  _scenariosLoaded = deps._scenariosLoaded;
  _getScenarios = deps.getScenarios;
  _initTopicProgress = deps.initTopicProgress;
  _applyScenarioResult = deps.applyScenarioResult;
  _getStudent = deps.getStudent;
  _getBankRun = deps.getBankRun;
  _startBankRun = deps.startBankRun;
  _endBankRun = deps.endBankRun;
  _advanceToNextQuestion = deps.advanceToNextQuestion;
  _recordBankTransaction = deps.recordBankTransaction;
  _logInteraction = deps.logInteraction;
}

// ── Free-mode topic nav ─────────────────────────────────────────────

/** Navigate to a topic list (data-action="goTopic"). */
export function goTopic(topicId) {
  if (!_scenariosLoaded) {
    return _loadScenarios().then(() => { goTopic(topicId); });
  }
  _initTopicProgress(topicId);
  _setView('topic', { topicId });
  _navRender();
}

/** Pick a random scenario and start playing. */
export async function goRandom() {
  const state = _getState();
  if (!state.subjectId) {
    _navigate('subject-select');
    return;
  }
  if (!_scenariosLoaded) await _loadScenarios();
  const all = _getScenarios();
  if (!all.length) { _navigate('home'); return; }
  const s = all[Math.floor(Math.random() * all.length)];
  // Lazy-import play from Play.js to avoid circular dep at module-load time
  const { play } = await import('../domain/Play.js');
  play(s.id);
}

// ── Teacher entry ───────────────────────────────────────────────────

/** Lazy-load the teacher chunk and navigate to the login view. */
export async function goTeacher(_loadTeacher) {
  await _loadTeacher();
  _setView('login');
  _render();
}

// ── 好人好事銀行 (Good Deed Bank) ──────────────────────────────────

/** Start a new bank run. */
export async function playGoodDeedBank() {
  if (!_scenariosLoaded) await _loadScenarios();
  const run = _startBankRun();
  if (!run || !run.questions?.length) {
    alert('銀行題目載入失敗，請重試。');
    return;
  }
  _setView('bank-play');
  _render();
  // SR: announce the first bank question
  const first = run.questions[run.currentIdx];
  if (first) {
    announceScenarioLoad(first, {
      index: run.currentIdx + 1,
      total: run.questions.length,
      gameName: '好人好事銀行',
    });
  }
}

/** Pick an option in the current bank question. */
export function bankChoose(optionId) {
  const run = _getBankRun();
  if (!run) return;
  const scenario = run.questions[run.currentIdx];
  if (!scenario) return;
  const result = _applyScenarioResult(scenario, optionId, _getStudent());
  if (!result) {
    console.error('[Bank] applyScenarioResult null');
    return;
  }
  // match the outcome image path scheme used by ScenarioEngine.chooseOption
  const optIdx = scenario.options.findIndex(o => o.id === optionId);
  result.outcomeImage = `assets/images/outcomes/${scenario.id}_opt${optIdx + 1}.png`;
  _recordBankTransaction(result.moralChange, scenario.title);
  try {
    _logInteraction({
      scenarioId: scenario.id,
      topicId: scenario.topicId,
      category: scenario.valueCategory || '',
      optionId,
      optionIndex: optIdx >= 0 ? optIdx + 1 : 0,
      moralChange: result.moralChange,
    }, _getStudent(), 'bank');
  } catch (e) {
    console.warn('[Bank] analytics log failed:', e.message);
  }
  // Hand-roll the view patch: bank-play → bank-result with the new fields.
  // We bypass setView's reset-patch factory because bank state needs the
  // bankScenario + bankResult fields preserved together with view change.
  // (For consistency with the original code; in future we could add a
  //  dedicated 'bank-result' factory to the VIEWS registry.)
  // eslint-disable-next-line no-undef
  // Note: 'state' write must be in main.js; here we call setView with
  // explicit extra fields.
  _setView('bank-result', { bankScenario: scenario, bankResult: result });
  _render();
}

/** Advance to the next bank question, or to the summary if the run is
 *  finished / bankrupt.
 */
export function bankNext() {
  const run = _getBankRun();
  if (!run) { exitBank(); return; }
  if (run.status === 'finished' || run.status === 'bankrupt') {
    _setView('bank-summary');
    _render();
    return;
  }
  _advanceToNextQuestion();
  _setView('bank-play');
  _render();
  const next = run.questions[run.currentIdx];
  if (next) {
    announceScenarioLoad(next, {
      index: run.currentIdx + 1,
      total: run.questions.length,
      gameName: '好人好事銀行',
    });
  }
}

/** End the bank run and return to the hub. */
export function exitBank() {
  _endBankRun();
  _setView('hub');
  _render();
}

/** Confirm-with-dialog wrapper around exitBank. */
export function confirmExitBank() {
  if (confirm('中途離開？今次遊戲進度會唔儲。')) {
    exitBank();
  }
}
