// src/actions/garden.js
// Sprint 18 — Action handlers for 關係花園 (Relationship Garden).
//
// Pattern: handler receives injected deps from main.js via wireGarden(deps),
// exposes individual handler functions for the actions registry.

import {
  startGardenArc, getGardenRun, applyOptionChoice, finishGardenArc,
  clearGardenRun, getCurrentArcScenarioId, getArcLabel,
} from '../games/RelationshipGarden.js';
import { CHARACTERS, GARDEN_CONFIG, GARDEN_ARC } from '../constants/garden.js';
import { isCharacterUnlocked, mergeBestRun } from '../domain/GardenArc.js';
import { STORAGE_KEYS, get, set } from '../storage.js';
import { getStudent } from '../domain/ScenarioEngine.js';

let _setView = null, _render = null, _navigate = null, _getState = null,
    _loadScenarios = null, _applyScenarioResult = null, _logInteraction = null,
    _getStudent = null, _announceScenarioLoad = null, _announceToSR = null;

export function wireGarden(deps) {
  _setView = deps.setView;
  _render = deps.render;
  _navigate = deps._navigate;
  _getState = deps.getState;
  _loadScenarios = deps.loadScenarios;
  _applyScenarioResult = deps.applyScenarioResult;
  _logInteraction = deps.logInteraction;
  _getStudent = deps.getStudent;
  _announceScenarioLoad = deps.announceScenarioLoad;
  _announceToSR = deps.announceToSR;
}

// ── Action handlers ────────────────────────────────────────────

/**
 * Hub card click → navigate to character-select view.
 */
export function playRelationshipGarden() {
  _navigate('character-select');
}

/**
 * Character card click → start arc + navigate to garden-play.
 * data-arg = characterId.
 */
export function selectGardenCharacter(characterId) {
  const char = CHARACTERS.find(c => c.id === characterId);
  if (!char) return;
  startGardenArc(characterId);
  // Eager-load scenarios for SR announce on first scenario (S18.2 enhancement)
  if (_loadScenarios) _loadScenarios().catch(() => {});
  _setView('garden-play');
  _render();
}

/**
 * Option click in garden-play → apply choice + advance or finish.
 * data-arg = optionId, data-arg2 = relationshipChange (number string).
 */
export function gardenChoose(optionId, relationshipChangeStr) {
  const delta = Number(relationshipChangeStr) || 0;
  const runBefore = getGardenRun();
  if (!runBefore) return;
  const scenario = currentArcScenario(); // best-effort, may be null
  const next = applyOptionChoice(delta, optionId);
  if (!next) return;

  // analytics + SR announce
  if (scenario && _logInteraction && _getStudent) {
    try {
      _logInteraction({
        scenarioId: scenario.id,
        topicId: scenario.topicId || 'caring',
        category: 'garden',
        optionId,
        optionIndex: 1,
        moralChange: delta,
      }, _getStudent(), 'garden');
    } catch {}
  }
  if (_announceToSR) {
    _announceToSR(delta >= 0 ? `好感 +${delta}` : `好感 ${delta}`, 'polite');
  }

  if (next.status === 'finished') {
    finishGardenArc();
    _persistGardenProgress(next);
    _setView('garden-result');
    _render();
  } else {
    // Same view (re-render with new step)
    _setView('garden-play');
    _render();
  }
}

/**
 * Advance to next step (explicit user-initiated, post-choice).
 * Currently same as bankNext pattern; kept for forward-compat.
 */
export function gardenNext() {
  const run = getGardenRun();
  if (!run) return _navigate('hub');
  _setView('garden-play');
  _render();
}

/**
 * End run + return to hub. With confirm if mid-run.
 * data-arg2 = 'force' to skip confirm.
 */
export function exitGarden(_arg1, force) {
  const run = getGardenRun();
  if (!run || run.status === 'finished' || force === 'force') {
    clearGardenRun();
    _setView('hub');
    _render();
    return;
  }
  if (confirm('確認離開？離開後下次要從頭開始。')) {
    clearGardenRun();
    _setView('hub');
    _render();
  }
}

/**
 * Result screen "再玩一次" → restart same character.
 * data-arg = characterId.
 */
export function playGardenAgain(characterId) {
  const id = characterId || getGardenRun()?.characterId;
  if (!id) return _navigate('character-select');
  startGardenArc(id);
  _setView('garden-play');
  _render();
}

// ── Helpers ──────────────────────────────────────────────────────

function currentArcScenario() {
  // Lazy: lookup via run-state scenarioIds.
  const sid = getCurrentArcScenarioId();
  if (!sid) return null;
  // Inline scenario retrieval — actual fetch happens via scenario engine
  // (kept light here; engine render uses full scenario data).
  return { id: sid, topicId: 'caring' };
}

function _persistGardenProgress(run) {
  try {
    const student = _getStudent ? _getStudent() : getStudent();
    if (!student) return;
    const cur = get(STORAGE_KEYS.GARDEN_PROGRESS, {}) || {};
    const result = mergeBestRun(cur[student] || {}, run.characterId, run);
    set(STORAGE_KEYS.GARDEN_PROGRESS, { ...cur, [student]: result });
  } catch (e) {
    console.warn('[Garden] persist failed:', e.message);
  }
}
