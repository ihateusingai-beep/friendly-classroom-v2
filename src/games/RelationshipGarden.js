// src/games/RelationshipGarden.js
// Sprint 18 — Bridge module: wire GardenArc (pure-domain) to main.js state.
//
// Mirrors src/games/Hub.js pattern: thin layer, side-effects only here
// (state mutation, navigation), pure logic delegated to GardenArc.

import {
  startGardenRun,
  chooseOption,
  advanceStep,
  resolveOutcome,
  mergeBestRun,
  getGardenRun as _getDomainRun,
} from '../domain/GardenArc.js';
import { GARDEN_CONFIG, GARDEN_ARC } from '../constants/garden.js';

// Module-level run state, mirrors GoodDeedBank pattern.
// Replaced by main.js state slot in S18.2 wiring — for now keep module-local
// to validate GardenArc pure first.
let run = null;

/**
 * Start a new arc for `characterId`. Returns the new run.
 * Caller (action handler) navigates to garden-play view.
 */
export function startGardenArc(characterId) {
  run = startGardenRun({ characterId });
  return run;
}

/**
 * Get the current run (read-only view of module state).
 * Used by renderers for state synchronization.
 */
export function getGardenRun() {
  return run;
}

/**
 * Apply a player's option choice. Returns the new run state.
 * If status flipped to 'finished', caller should call finishGardenArc + navigate.
 */
export function applyOptionChoice(relationshipChange, optionId) {
  if (!run) return null;
  run = chooseOption(run, { relationshipChange, optionId });
  return run;
}

/**
 * Mark the finished run with its outcome tier. Idempotent.
 */
export function finishGardenArc() {
  if (!run || run.status !== 'finished') return run;
  const outcome = resolveOutcome(run);
  run = { ...run, outcome };
  return run;
}

/**
 * Clear module-level run state (called on exit / tab close).
 */
export function clearGardenRun() {
  run = null;
}

/**
 * Advance without choosing (Sprint 19+ skip-scenario support — not yet wired).
 */
export function advanceGardenStep() {
  if (!run) return null;
  run = advanceStep(run);
  return run;
}

/**
 * Get the active scenario ID for `run.step` (the one UI should render).
 * Returns null if state invalid.
 */
export function getCurrentArcScenarioId() {
  if (!run || run.status !== 'playing') return null;
  return run.scenarioIds[run.step] || null;
}

/**
 * Get the arc label for `step` (e.g. "認識" / "衝突化解").
 */
export function getArcLabel(step) {
  return GARDEN_ARC[step]?.arcLabel || '';
}

/**
 * Re-export pure config for views that need threshold display.
 */
export { GARDEN_CONFIG };

/**
 * Re-export pure helper for storage layer.
 */
export { mergeBestRun };
