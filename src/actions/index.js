// src/actions/index.js — Single source of truth for data-action handlers.
//
// Sprint 14.2: replaces the 100+ line `window.FC.X = function...` scatter
// across main.js + domain/IO.js with a single registry. The dispatcher
// in main.js reads `actions[action]` on click. Anyone adding a new
// data-action only edits this file (or adds a new export to the relevant
// domain module + registers it here).
//
// Architecture:
//   - `actions` is a mutable object populated by `wireActions(deps)`.
//   - Each domain module (Student/Auth/Play/Hub/IO) exports its handler
//     functions as named exports (instead of `window.FC.X = function...`).
//   - Inline handlers that lived in main.js (Sprint 12/13/14 bridge work)
//     are now in `./inline.js` — also named exports, no global.
//   - `wireActions(deps)` collects all of them into `actions` and
//     publishes the same object as `window.FC` for any external code
//     that may still reference it (PWA, tests, browser console, etc.).
//   - `hasAction(name)` lets tests + linter validate that markup
//     declaring `data-action="X"` has a registered handler.

import { wireStudent, switchStudent, selectStudent } from '../domain/Student.js';
import { wireAuth, selectSubject, selectMode, chooseRole } from '../domain/Auth.js';
import { wirePlay, play, choose, retry, updateResultCtaFab } from '../domain/Play.js';
import { wireHub, goTopic, goRandom, goTeacher,
         playGoodDeedBank, bankChoose, bankNext, exitBank, confirmExitBank } from '../games/Hub.js';
import { wireIO, updateAnalyticsSummary, setSyncStatusLoading,
         handleImport, exportAll, exportMyData, importMyData,
         exportAnalyticsCSV, clearAnalytics, forceSync,
         toggleTeacherFeature, setTeacherTimer, setButtonSize,
         setBankMaxRisk, toggleAssignedTopic, saveTeacherPIN, saveTeacherConfig } from '../domain/IO.js';
import { isSpeaking, stopSpeaking, getTTSLang, TTS_LANGS } from '../audio.js';
import { addStudent as _addStudentFromProgress } from '../domain/Progress.js';
import { getInlineActions } from './inline.js';

/** The single dispatch table. main.js reads `actions[action]` on click. */
export const actions = {};

/** Wire all domain modules and populate the actions table.
 *  Call exactly once at boot, after main.js locals (setView, render,
 *  _navigate, getState, etc.) are defined.
 */
export function wireActions(deps) {
  // 1. Wire domain modules so their module-level _deps vars are populated
  wireStudent({ setView: deps.setView, render: deps.render });
  wireAuth({
    setView: deps.setView, render: deps.render, _loadTeacher: deps._loadTeacher,
    getAllSubjects: deps.getAllSubjects, initSubjectProgress: deps.initSubjectProgress,
    getState: deps.getState, setState: deps.setState,
  });
  wirePlay({
    setView: deps.setView, render: deps.render, _navigate: deps._navigate, getState: deps.getState,
    loadScenarios: deps.loadScenarios, loadScenariosForTopic: deps.loadScenariosForTopic,
    getScenarioById: deps.getScenarioById, playScenario: deps.playScenario,
    getScenariosByTopic: deps.getScenariosByTopic, chooseOption: deps.chooseOption,
    markScenarioShown: deps.markScenarioShown, logInteraction: deps.logInteraction,
    playSFX: deps.playSFX, isReducedMotion: deps.isReducedMotion,
  });
  wireHub({
    setView: deps.setView, navRender: deps.navRender, render: deps.render, _navigate: deps._navigate,
    getState: deps.getState, loadScenarios: deps.loadScenarios,
    loadScenariosForTopic: deps.loadScenariosForTopic, getScenarios: deps.getScenarios,
    getScenariosByTopic: deps.getScenariosByTopic, initTopicProgress: deps.initTopicProgress,
    applyScenarioResult: deps.applyScenarioResult, getStudent: deps.getStudent,
    getBankRun: deps.getBankRun, startBankRun: deps.startBankRun, endBankRun: deps.endBankRun,
    advanceToNextQuestion: deps.advanceToNextQuestion, recordBankTransaction: deps.recordBankTransaction,
    logInteraction: deps.logInteraction,
  });
  wireIO({
    render: deps.render, getStudent: deps.getStudent, getAllStudents: deps.getAllStudents,
    importProgress: deps.importProgress, exportProgress: deps.exportProgress,
    syncNow: deps.syncNow, getProgress: deps.getProgress, getStats: deps.getStats,
    exportInteractionsCSV: deps.exportInteractionsCSV, clearInteractions: deps.clearInteractions,
    _navigate: deps._navigate,
  });

  // 2. Collect every action into the table. The list below is the SINGLE
  //    place that defines which data-action names are valid. If you add
  //    a new data-action in markup, you MUST add it here — otherwise the
  //    dispatcher will log `[FC] no handler for X`.
  Object.assign(actions, {
    // Student
    switchStudent, selectStudent,
    // Auth
    selectSubject, selectMode, chooseRole,
    // Play
    play, choose, retry, updateResultCtaFab,
    // Hub
    goTopic, goRandom, goTeacher, playGoodDeedBank, bankChoose, bankNext, exitBank, confirmExitBank,
    // IO
    handleImport, exportAll, exportMyData, importMyData,
    exportAnalyticsCSV, clearAnalytics, forceSync, setSyncStatusLoading, updateAnalyticsSummary,
    toggleTeacherFeature, setTeacherTimer, setButtonSize, setBankMaxRisk,
    toggleAssignedTopic, saveTeacherPIN, saveTeacherConfig,
    // Audio control surface (read-only refs)
    isSpeaking, stopSpeaking, getTTSLang, TTS_LANGS,
  });
  // Inline handlers (Sprint 12/13/14 bridges + home/TTS/hint helpers)
  // close over render/state/_navigate from main.js — factory takes deps.
  Object.assign(actions, getInlineActions(deps));

  // 3. Publish for any external code (PWA, tests, console debugging).
  if (typeof window !== 'undefined') {
    window.FC = actions;
  }
}

/** True iff `name` is a registered action handler. Used by tests + guard. */
export function hasAction(name) {
  return typeof actions[name] === 'function';
}
