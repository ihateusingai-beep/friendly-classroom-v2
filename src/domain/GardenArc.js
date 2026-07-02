// src/domain/GardenArc.js
// Sprint 18 — Pure-domain garden arc state machine.
//
// No DOM, no localStorage, no `bus` imports. Testable with plain fixtures
// (no jest DOM mocks). Mirrors SPEC §18 architecture pattern: pure-domain +
// thin UI bridge split.
//
// Why pure:
//   1. Unit testability without main.js boot
//   2. Same shape as ScenarioEngine / Play (Sprint 23 emotion-detective refactor)
//   3. Future: render in non-browser context (Node CLI tutor / story script)

import {
  GARDEN_CONFIG,
  GARDEN_ARC,
  MONOLOGUES,
  CHARACTERS,
  GARDEN_OUTCOMES,
} from '../constants/garden.js';

/**
 * Resolve all canonical IDs once — fail-fast on misconfiguration.
 */
const _VALID_CHAR_IDS = new Set(CHARACTERS.map(c => c.id));
function assertValidCharacter(characterId) {
  if (!_VALID_CHAR_IDS.has(characterId)) {
    throw new Error(`[GardenArc] unknown characterId: ${characterId}`);
  }
}

/**
 * Start a new garden run for a character.
 * Pure: returns initial run state, no side effects.
 *
 * @param {Object} input
 * @param {string} input.characterId — one of CHARACTERS ids
 * @param {string[]} [input.scenarioIds] — overrides for tests
 * @returns {Object} run state { characterId, step, score, scenarioIds, outcome, status, history }
 */
export function startGardenRun({ characterId, scenarioIds } = {}) {
  if (!characterId) throw new Error('[GardenArc] characterId required');
  assertValidCharacter(characterId);
  const ids = scenarioIds || GARDEN_ARC.map(a => a.scenarioId);
  if (!ids.length) throw new Error('[GardenArc] ARC must have ≥1 scenario');
  return {
    characterId,
    step: 0,
    score: 0,
    scenarioIds: ids.slice(),
    outcome: null,
    status: 'playing',  // playing | finished
    history: [],        // [{step, scenarioId, optionId, delta, scoreAfter}]
  };
}

/**
 * Apply an option choice — advance step, update score.
 * Pure: returns a new run state (does not mutate input).
 *
 * @param {Object} run — current run (status='playing')
 * @param {Object} input
 * @param {number} input.relationshipChange — clamped to [-3, +3]
 * @param {string} [input.optionId] — for history (string)
 * @returns {Object} new run { ...run, step, score, status, history }
 */
export function chooseOption(run, { relationshipChange, optionId } = {}) {
  if (!run || run.status !== 'playing') {
    throw new Error('[GardenArc] chooseOption: run not in playing state');
  }
  if (run.step >= run.scenarioIds.length) {
    throw new Error('[GardenArc] chooseOption: no more steps');
  }
  const delta = clampRelationshipChange(relationshipChange);
  const newScore = clampScore(run.score + delta);
  const newHistory = run.history.concat({
    step: run.step,
    scenarioId: run.scenarioIds[run.step],
    optionId: optionId ?? null,
    delta,
    scoreAfter: newScore,
  });
  const isFinal = run.step + 1 >= run.scenarioIds.length;
  return {
    ...run,
    step: run.step + 1,
    score: newScore,
    status: isFinal ? 'finished' : 'playing',
    history: newHistory,
  };
}

/**
 * Advance step without choosing (future feature, e.g. skip-scenario).
 * Pure: returns next-step run state.
 */
export function advanceStep(run) {
  if (!run || run.status !== 'playing') return run;
  const isFinal = run.step + 1 >= run.scenarioIds.length;
  return {
    ...run,
    step: run.step + 1,
    status: isFinal ? 'finished' : 'playing',
  };
}

/**
 * Resolve the final outcome tier for a finished run.
 * Locks: >=UNLOCK_THRESHOLD → BLOOM, >=RESTART_THRESHOLD → STABLE, else RESTART.
 *
 * @param {Object} run — finished run
 * @returns {string} one of GARDEN_OUTCOMES
 */
export function resolveOutcome(run) {
  if (!run || run.status !== 'finished') {
    throw new Error('[GardenArc] resolveOutcome: run not finished');
  }
  if (run.score >= GARDEN_CONFIG.UNLOCK_THRESHOLD) return GARDEN_OUTCOMES.BLOOM;
  if (run.score >= GARDEN_CONFIG.RESTART_THRESHOLD) return GARDEN_OUTCOMES.STABLE;
  return GARDEN_OUTCOMES.RESTART;
}

/**
 * Get the character's monologue for a given arc step (0..4).
 * Pure: returns string ('' for unknown config).
 */
export function getMonologue(characterId, stepIndex) {
  const m = MONOLOGUES[characterId];
  if (!m || !m.length) return '';
  if (stepIndex < 0 || stepIndex >= m.length) return '';
  return m[stepIndex];
}

/**
 * Check if a character has been unlocked at least once.
 * Pure: returns boolean.
 */
export function isCharacterUnlocked(progress, characterId) {
  if (!progress || !progress[characterId]) return false;
  return Boolean(progress[characterId].unlocked);
}

/**
 * Merge a finished run result into per-student progress.
 * Pure: returns updated progress record. Storage layer persists the result.
 *
 * Schema (per studentName):
 *   progress: { [characterId]: { unlocked, bestScore, runCount, lastPlayedAt } }
 */
export function mergeBestRun(progress, characterId, runResult) {
  if (!runResult || typeof runResult.score !== 'number') {
    throw new Error('[GardenArc] mergeBestRun: runResult.score required');
  }
  assertValidCharacter(characterId);
  const prev = (progress && progress[characterId]) || {
    unlocked: false,
    bestScore: 0,
    runCount: 0,
    lastPlayedAt: null,
  };
  const newBest = Math.max(prev.bestScore, runResult.score);
  const unlocked = prev.unlocked || runResult.score >= GARDEN_CONFIG.UNLOCK_THRESHOLD;
  return {
    ...(progress || {}),
    [characterId]: {
      unlocked,
      bestScore: newBest,
      runCount: prev.runCount + 1,
      lastPlayedAt: new Date().toISOString(),
    },
  };
}

/**
 * Convenience: peek what scenario IDs a given character would play.
 * Used by UI to pre-load scenario chunks.
 */
export function getArcScenarioIds() {
  return GARDEN_ARC.map(a => a.scenarioId);
}

// ── Helpers ────────────────────────────────────────────

function clampRelationshipChange(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(
    GARDEN_CONFIG.RELATIONSHIP_DELTA_MIN,
    Math.min(GARDEN_CONFIG.RELATIONSHIP_DELTA_MAX, Math.trunc(n)),
  );
}

function clampScore(score) {
  return Math.max(
    GARDEN_CONFIG.SCORE_MIN,
    Math.min(GARDEN_CONFIG.SCORE_MAX, score),
  );
}
