// src/state.js — Global app state, view registry, and state transitions.
//
// Moved from main.js (lines 242-289).
// All mutations should go through setView() so the VIEWS reset-patch stays
// the single source of truth for what each view clears.

/** VIEWS[viewName] returns a reset-patch factory.
 *  The factory receives the `extra` argument passed to setView() and returns
 *  the fields that should be reset (cleared) when entering that view.
 *  Any fields in `extra` override the reset (e.g. { subjectId } on 'topic').
 */
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

/** The single mutable state object. Read-only in render functions.
 *  Mutations go through setView() or direct patch (for non-view fields).
 */
export let state = {
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

/** Transition to a view, applying the view's reset patch + any extra fields.
 *
 *  @param {string} view — one of VIEWS keys
 *  @param {Object} [extra] — additional fields merged on top of the reset patch
 */
export function setView(view, extra = {}) {
  const factory = VIEWS[view];
  if (!factory) {
    console.warn(`[state] unknown view: ${view}`);
    return;
  }
  state = { ...state, view, ...factory(extra), ...extra };
}