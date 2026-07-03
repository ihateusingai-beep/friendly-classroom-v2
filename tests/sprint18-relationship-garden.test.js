// tests/sprint18-relationship-garden.test.js
// Sprint 18 — Verify garden pure-domain logic, schema invariants, and
// bridge module correctness.
//
// Pattern: same as tests/sprint23-emotion-detective.test.js — pure-fn
// focus, no DOM. Bridge module tests use simple module-state inspection.

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Pure domain
import {
  startGardenRun,
  chooseOption,
  advanceStep,
  resolveOutcome,
  getMonologue,
  isCharacterUnlocked,
  mergeBestRun,
  getArcScenarioIds,
} from '../src/domain/GardenArc.js';

// Constants — frozen, verified
import {
  GARDEN_CONFIG,
  GARDEN_ARC,
  CHARACTERS,
  MONOLOGUES,
  GARDEN_OUTCOMES,
} from '../src/constants/garden.js';

// Bridge
import {
  startGardenArc,
  getGardenRun,
  applyOptionChoice,
  finishGardenArc,
  clearGardenRun,
  getCurrentArcScenarioId,
  getArcLabel,
} from '../src/games/RelationshipGarden.js';

// ── Schema invariants (run first, fail-fast) ──────────────

describe('Sprint 18 — Schema invariants', () => {
  it('GARDEN_ARC has exactly 5 steps', () => {
    expect(GARDEN_ARC.length).toBe(5);
  });

  it('GARDEN_ARC steps are sequential 0..4', () => {
    expect(GARDEN_ARC.map(a => a.step)).toEqual([0, 1, 2, 3, 4]);
  });

  it('each character has exactly 5 monologues', () => {
    for (const char of CHARACTERS) {
      expect(MONOLOGUES[char.id], `${char.id} monologues count`).toHaveLength(5);
    }
  });

  it('UNLOCK_THRESHOLD is 7 (locked at v1)', () => {
    expect(GARDEN_CONFIG.UNLOCK_THRESHOLD).toBe(7);
    expect(GARDEN_CONFIG.RESTART_THRESHOLD).toBe(4);
  });

  it('CHARACTERS roster is 3 (小美 / 小晨 / 小輝 — per owner decision)', () => {
    expect(CHARACTERS.length).toBe(3);
    expect(CHARACTERS.map(c => c.id)).toEqual(['小美', '小晨', '小輝']);
  });

  it('each character has a valid avatar path under assets/images/garden/', () => {
    for (const char of CHARACTERS) {
      expect(char.avatar).toMatch(/^assets\/images\/garden\/.+\.png$/);
      const absolute = path.join(
        path.dirname(new URL(import.meta.url).pathname),
        '..',
        char.avatar,
      );
      expect(fs.existsSync(absolute), `${char.id} avatar exists at ${char.avatar}`).toBe(true);
    }
  });

  it('all 5 GARDEN_ARC scenarioIds exist in data/scenarios/*.json', () => {
    const allIds = new Set();
    const dir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'data', 'scenarios');
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.json')) continue;
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      for (const s of data) allIds.add(s.id);
    }
    for (const arc of GARDEN_ARC) {
      expect(allIds.has(arc.scenarioId), `scenario ${arc.scenarioId} exists in data/scenarios/`).toBe(true);
    }
  });
});

// ── Pure domain — startGardenRun ───────────────────────────

describe('GardenArc — startGardenRun', () => {
  it('returns 5-step arc for valid characterId', () => {
    const run = startGardenRun({ characterId: '小美' });
    expect(run.characterId).toBe('小美');
    expect(run.step).toBe(0);
    expect(run.score).toBe(0);
    expect(run.scenarioIds.length).toBe(5);
    expect(run.status).toBe('playing');
    expect(run.history).toEqual([]);
    expect(run.outcome).toBeNull();
  });

  it('throws on missing characterId', () => {
    expect(() => startGardenRun({})).toThrow(/characterId required/);
  });

  it('throws on unknown characterId (fail-fast)', () => {
    expect(() => startGardenRun({ characterId: 'nobody' })).toThrow(/unknown characterId/);
  });

  it('uses default GARDEN_ARC scenarios when none provided', () => {
    const run = startGardenRun({ characterId: '小美' });
    expect(run.scenarioIds).toEqual(GARDEN_ARC.map(a => a.scenarioId));
  });

  it('accepts custom scenarioIds (test isolation)', () => {
    const run = startGardenRun({ characterId: '小美', scenarioIds: ['a', 'b'] });
    expect(run.scenarioIds).toEqual(['a', 'b']);
  });

  it('does not mutate custom scenarioIds (defensive copy)', () => {
    const ids = ['a', 'b'];
    startGardenRun({ characterId: '小美', scenarioIds: ids });
    expect(ids).toEqual(['a', 'b']); // unchanged
  });
});

// ── Pure domain — chooseOption ─────────────────────────────

describe('GardenArc — chooseOption', () => {
  it('advances score by relationshipChange and step by 1', () => {
    let run = startGardenRun({ characterId: '小美' });
    run = chooseOption(run, { relationshipChange: 2, optionId: 'opt-1' });
    expect(run.score).toBe(2);
    expect(run.step).toBe(1);
  });

  it('appends to history with delta + scoreAfter', () => {
    let run = startGardenRun({ characterId: '小美' });
    run = chooseOption(run, { relationshipChange: 1, optionId: 'opt-A' });
    expect(run.history).toHaveLength(1);
    expect(run.history[0]).toMatchObject({
      step: 0,
      scenarioId: GARDEN_ARC[0].scenarioId,
      optionId: 'opt-A',
      delta: 1,
      scoreAfter: 1,
    });
  });

  it('clamps relationshipChange to [-3, +3]', () => {
    let run = startGardenRun({ characterId: '小美' });
    run = chooseOption(run, { relationshipChange: 99, optionId: 'o1' });
    expect(run.score).toBe(3);
    run = chooseOption(run, { relationshipChange: -99, optionId: 'o2' });
    expect(run.score).toBe(0); // 3 + (-3) = 0
  });

  it('clamps non-finite relationshipChange to 0', () => {
    let run = startGardenRun({ characterId: '小美' });
    run = chooseOption(run, { relationshipChange: 'NaN', optionId: 'o1' });
    expect(run.score).toBe(0);
  });

  it('clamps score to GARDEN_CONFIG.SCORE_MAX', () => {
    let run = startGardenRun({ characterId: '小美' });
    // 5-step arc → max 5 chooseOption calls before run finishes (step 5 + status=finished)
    for (let i = 0; i < 5; i++) {
      run = chooseOption(run, { relationshipChange: 3, optionId: `o${i}` });
    }
    expect(run.score).toBeLessThanOrEqual(GARDEN_CONFIG.SCORE_MAX);
    expect(run.score).toBe(GARDEN_CONFIG.SCORE_MAX); // 3+3+3+3+3 = 15 → clamp 9
    expect(run.status).toBe('finished');
  });

  it('sets status=finished on final step (step 5 after 5 chooses)', () => {
    let run = startGardenRun({ characterId: '小美' });
    for (let i = 0; i < 5; i++) {
      run = chooseOption(run, { relationshipChange: 1, optionId: `o${i}` });
    }
    expect(run.step).toBe(5);
    expect(run.status).toBe('finished');
  });

  it('throws if run not in playing state', () => {
    const finishedRun = { ...startGardenRun({ characterId: '小美' }), status: 'finished' };
    expect(() => chooseOption(finishedRun, { relationshipChange: 1 })).toThrow(/not in playing/);
  });
});

// ── Pure domain — advanceStep ─────────────────────────────

describe('GardenArc — advanceStep', () => {
  it('moves step 0 → 1, etc.', () => {
    const run = startGardenRun({ characterId: '小美' });
    const next = advanceStep(run);
    expect(next.step).toBe(1);
    expect(next.status).toBe('playing');
  });

  it('returns run untouched if not playing', () => {
    const finishedRun = { ...startGardenRun({ characterId: '小美' }), status: 'finished' };
    expect(advanceStep(finishedRun)).toBe(finishedRun);
  });

  it('flips status to finished on final advance', () => {
    let run = startGardenRun({ characterId: '小美', scenarioIds: ['x'] }); // 1-step run
    run = advanceStep(run);
    expect(run.status).toBe('finished');
  });
});

// ── Pure domain — resolveOutcome ──────────────────────────

describe('GardenArc — resolveOutcome', () => {
  it('returns BLOOM when score >= UNLOCK_THRESHOLD', () => {
    const run = { status: 'finished', score: GARDEN_CONFIG.UNLOCK_THRESHOLD };
    expect(resolveOutcome(run)).toBe(GARDEN_OUTCOMES.BLOOM);
  });

  it('returns BLOOM for score above threshold', () => {
    expect(resolveOutcome({ status: 'finished', score: 9 })).toBe(GARDEN_OUTCOMES.BLOOM);
  });

  it('returns STABLE for score 4-6 (mid range)', () => {
    expect(resolveOutcome({ status: 'finished', score: 4 })).toBe(GARDEN_OUTCOMES.STABLE);
    expect(resolveOutcome({ status: 'finished', score: 5 })).toBe(GARDEN_OUTCOMES.STABLE);
    expect(resolveOutcome({ status: 'finished', score: 6 })).toBe(GARDEN_OUTCOMES.STABLE);
  });

  it('returns RESTART for score < 4 (no shame branch)', () => {
    expect(resolveOutcome({ status: 'finished', score: 3 })).toBe(GARDEN_OUTCOMES.RESTART);
    expect(resolveOutcome({ status: 'finished', score: -3 })).toBe(GARDEN_OUTCOMES.RESTART);
  });

  it('throws if run not finished', () => {
    const run = { status: 'playing', score: 0 };
    expect(() => resolveOutcome(run)).toThrow(/not finished/);
  });
});

// ── Pure domain — getMonologue ────────────────────────────

describe('GardenArc — getMonologue', () => {
  it('returns string for valid characterId + stepIndex', () => {
    expect(getMonologue('小美', 0)).toBe(MONOLOGUES['小美'][0]);
    expect(getMonologue('小晨', 4)).toBe(MONOLOGUES['小晨'][4]);
    expect(getMonologue('小輝', 2)).toBe(MONOLOGUES['小輝'][2]);
  });

  it('returns empty string for unknown character', () => {
    expect(getMonologue('nobody', 0)).toBe('');
  });

  it('returns empty string for out-of-range step', () => {
    expect(getMonologue('小美', 99)).toBe('');
    expect(getMonologue('小美', -1)).toBe('');
  });
});

// ── Pure domain — isCharacterUnlocked / mergeBestRun ───────

describe('GardenArc — isCharacterUnlocked', () => {
  it('returns false for empty progress', () => {
    expect(isCharacterUnlocked({}, '小美')).toBe(false);
  });

  it('returns false for null progress', () => {
    expect(isCharacterUnlocked(null, '小美')).toBe(false);
  });

  it('returns true if character was previously unlocked', () => {
    const progress = { '小美': { unlocked: true, bestScore: 8, runCount: 1 } };
    expect(isCharacterUnlocked(progress, '小美')).toBe(true);
  });

  it('returns false if character exists but unlocked=false', () => {
    const progress = { '小美': { unlocked: false, bestScore: 3, runCount: 1 } };
    expect(isCharacterUnlocked(progress, '小美')).toBe(false);
  });
});

describe('GardenArc — mergeBestRun', () => {
  it('initializes progress entry for fresh character', () => {
    const result = mergeBestRun({}, '小美', { score: 8 });
    expect(result['小美'].unlocked).toBe(true);
    expect(result['小美'].bestScore).toBe(8);
    expect(result['小美'].runCount).toBe(1);
    expect(result['小美'].lastPlayedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('keeps highest score across runs', () => {
    const prev = { '小美': { unlocked: true, bestScore: 9, runCount: 1, lastPlayedAt: 'x' } };
    const result = mergeBestRun(prev, '小美', { score: 7 });
    expect(result['小美'].bestScore).toBe(9);
    expect(result['小美'].runCount).toBe(2);
  });

  it('unlocks when reaching threshold even if was locked', () => {
    const prev = { '小美': { unlocked: false, bestScore: 4, runCount: 1, lastPlayedAt: 'x' } };
    const result = mergeBestRun(prev, '小美', { score: 8 });
    expect(result['小美'].unlocked).toBe(true);
  });

  it('throws on invalid runResult.score', () => {
    expect(() => mergeBestRun({}, '小美', {})).toThrow(/runResult.score/);
  });

  it('throws on unknown characterId', () => {
    expect(() => mergeBestRun({}, 'nobody', { score: 5 })).toThrow(/unknown characterId/);
  });
});

describe('GardenArc — getArcScenarioIds', () => {
  it('returns the 5 canonical arc scenario IDs', () => {
    expect(getArcScenarioIds()).toEqual(GARDEN_ARC.map(a => a.scenarioId));
  });
});

// ── Bridge module — RelationshipGarden.js ────────────────

describe('RelationshipGarden bridge', () => {
  beforeEach(() => {
    clearGardenRun();
  });

  it('startGardenArc creates and stores a run', () => {
    const run = startGardenArc('小美');
    expect(run.characterId).toBe('小美');
    expect(getGardenRun()).toBe(run);
  });

  it('applyOptionChoice updates score + step', () => {
    startGardenArc('小美');
    const next = applyOptionChoice(2, 'opt-1');
    expect(next.score).toBe(2);
    expect(next.step).toBe(1);
  });

  it('applyOptionChoice returns null if no active run', () => {
    expect(applyOptionChoice(1, 'o1')).toBeNull();
  });

  it('finishGardenArc adds outcome field on finished run', () => {
    let run = startGardenArc('小美');
    for (let i = 0; i < 5; i++) {
      run = applyOptionChoice(2, `o${i}`);
    }
    expect(run.status).toBe('finished');
    finishGardenArc();
    expect(getGardenRun().outcome).toBeDefined();
    expect(getGardenRun().outcome).toBe(GARDEN_OUTCOMES.BLOOM); // score = 10 → clamped 9 → BLOOM
  });

  it('finishGardenArc is no-op if run not finished', () => {
    startGardenArc('小美');
    const before = getGardenRun();
    finishGardenArc();
    expect(getGardenRun()).toBe(before);
    expect(getGardenRun().outcome).toBeNull();
  });

  it('clearGardenRun resets state', () => {
    startGardenArc('小美');
    clearGardenRun();
    expect(getGardenRun()).toBeNull();
  });

  it('getCurrentArcScenarioId returns the active step scenario', () => {
    startGardenArc('小美');
    expect(getCurrentArcScenarioId()).toBe(GARDEN_ARC[0].scenarioId);
  });

  it('getCurrentArcScenarioId returns null after finish', () => {
    startGardenArc('小美');
    for (let i = 0; i < 5; i++) applyOptionChoice(1, `o${i}`);
    expect(getCurrentArcScenarioId()).toBeNull();
  });

  it('getArcLabel returns arc label for step', () => {
    expect(getArcLabel(0)).toBe(GARDEN_ARC[0].arcLabel);
    expect(getArcLabel(4)).toBe(GARDEN_ARC[4].arcLabel);
  });

  it('getArcLabel returns empty string for out-of-range', () => {
    expect(getArcLabel(99)).toBe('');
    expect(getArcLabel(-1)).toBe('');
  });
});

// ── Sprint 18.2 — Monologue bubble semantic-a11y invariants ─────────
//
// §24 v3.14 / Sprint 18.2 polish — verify source-level invariants of the
// renderGardenPlay monologue block. We assert on the source string rather
// than executing the renderer because renderGardenPlay transitively loads
// audio.js / storage.js / etc. with non-trivial browser-state expectations
// that would need deep mocking — but the invariants we care about (§24.3
// ARIA restructure) are pure structural changes captured in the source.

describe('Sprint 18.2 — Monologue bubble semantic-a11y', () => {
  const engineSrc = fs.readFileSync(
    path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'src', 'engine.js'),
    'utf8',
  );
  const styleSrc = fs.readFileSync(
    path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'src', 'style.css'),
    'utf8',
  );

  it('§24.3 monologue div uses role="note" (not role="complementary")', () => {
    expect(engineSrc).toMatch(/class="garden-monologue"\s+role="note"/);
    expect(engineSrc).not.toMatch(/class="garden-monologue"\s+role="complementary"/);
  });

  it('§24.3 monologue prefix uses semantic <h3> and text uses semantic <p>', () => {
    expect(engineSrc).toMatch(/<h3 class="garden-monologue-prefix">/);
    expect(engineSrc).toMatch(/<p class="garden-monologue-text">/);
  });

  it('§24.2 monologue avatar img has empty alt + aria-hidden', () => {
    expect(engineSrc).toMatch(/<img class="garden-monologue-avatar"[^>]*alt=""[^>]*aria-hidden="true"/);
  });

  it('§24.3 monologue 唔再帶 aria-label="...嘅內心話" (avoid SR double-read)', () => {
    // The old S18.1 pattern was aria-label="${character.name}嘅內心話".
    // S18.2 §24.3 removes it because the visible <h3> prefix already
    // announces the character name — double-read avoidance invariant.
    expect(engineSrc).not.toMatch(/aria-label="\$\{escapeAttr\(character[^}]*\}\}嘅內心話"/);
  });

  it('§24.2 style.css adds .garden-monologue-avatar + .garden-monologue-body flex layout', () => {
    expect(styleSrc).toMatch(/\.garden-monologue-avatar\s*\{[^}]*width:\s*40px/);
    expect(styleSrc).toMatch(/\.garden-monologue-avatar\s*\{[^}]*height:\s*40px/);
    expect(styleSrc).toMatch(/\.garden-monologue-body\s*\{[^}]*flex:\s*1/);
    expect(styleSrc).toMatch(/\.garden-monologue\s*\{[^}]*display:\s*flex/);
  });
});
