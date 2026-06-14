// tests/smoke.test.js
// Phase 2 (S11) — smoke tests for the most critical pure modules.
// Run with `npm test` (vitest). These are NOT exhaustive unit tests; they
// catch regressions in the highest-blast-radius code paths (P0 fixes +
// domain pure logic).

import { describe, it, expect, beforeEach } from 'vitest';
import { bus } from '../src/domain/EventBus.js';
import { applyScenarioResult, getMoralBarData, getMoralLevel, calculateMoralPercent } from '../src/domain/Moral.js';
import { getDailyCreed, getTriggeredCreeds, migrateCreedId } from '../src/creeds.js';
import { getProgress, saveProgress, markComplete } from '../src/domain/Progress.js';
import { escapeAttr, escapeJsString } from '../src/util/escape.js';

// Mock localStorage for Node test env
const _memStore = {};
globalThis.localStorage = {
  getItem: (k) => _memStore[k] ?? null,
  setItem: (k, v) => { _memStore[k] = String(v); },
  removeItem: (k) => { delete _memStore[k]; },
  clear: () => { for (const k in _memStore) delete _memStore[k]; },
  key: (i) => Object.keys(_memStore)[i] ?? null,
  get length() { return Object.keys(_memStore).length; },
};

// ── EventBus ────────────────────────────────────────────────────────────────
describe('EventBus', () => {
  beforeEach(() => { bus._handlers.clear(); });

  it('delivers events to subscribers', () => {
    let received = 0;
    bus.on('test:event', () => { received++; });
    bus.emit('test:event', { a: 1 });
    bus.emit('test:event', { a: 2 });
    expect(received).toBe(2);
  });

  it('unsubscribe stops delivery', () => {
    let received = 0;
    const off = bus.on('test:event', () => { received++; });
    bus.emit('test:event');
    off();
    bus.emit('test:event');
    expect(received).toBe(1);
  });

  it('handler exceptions are logged, not swallowed silently', () => {
    const errors = [];
    const orig = console.error;
    console.error = (...args) => errors.push(args);
    bus.on('test:event', () => { throw new Error('boom'); });
    bus.emit('test:event');
    console.error = orig;
    expect(errors.length).toBeGreaterThan(0);
  });
});

// ── Moral.js (pure) ─────────────────────────────────────────────────────────
describe('Moral domain', () => {
  it('getMoralLevel maps score → bucket', () => {
    expect(getMoralLevel(0)).toBe('danger');
    expect(getMoralLevel(50)).toBe('warning');
    expect(getMoralLevel(120)).toBe('good');
  });

  it('calculateMoralPercent clamps to [0, 100]', () => {
    expect(calculateMoralPercent(50)).toBeGreaterThanOrEqual(0);
    expect(calculateMoralPercent(50)).toBeLessThanOrEqual(100);
  });

  it('getMoralBarData returns the shape the renderer expects', () => {
    const data = getMoralBarData(120);
    expect(data).toHaveProperty('percent');
    expect(data).toHaveProperty('color');
    expect(data).toHaveProperty('level');
  });

  it('applyScenarioResult returns null for missing option', () => {
    const scenario = { id: 's1', options: [{ id: 'o1', effects: [{ moralChange: 1 }] }] };
    const r = applyScenarioResult(scenario, 'o1', null);
    expect(r).toBeTruthy();
    expect(r.moralChange).toBe(1);
  });

  it('applyScenarioResult returns null for missing option (not null scenario)', () => {
    const scenario = { id: 's1', options: [] };
    const r = applyScenarioResult(scenario, 'missing', null);
    expect(r).toBeNull();
  });
});

// ── Creeds (pure) ──────────────────────────────────────────────────────────
describe('Creeds', () => {
  it('getDailyCreed returns a stable pick for a given date', () => {
    const a = getDailyCreed(new Date('2026-06-14'));
    const b = getDailyCreed(new Date('2026-06-14'));
    expect(a.id).toBe(b.id);
  });

  it('getDailyCreed returns a pick for any date', () => {
    const a = getDailyCreed(new Date('2026-06-14'));
    const b = getDailyCreed(new Date('2026-06-15'));
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
  });

  it('getTriggeredCreeds returns array', () => {
    const r = getTriggeredCreeds([1, 2], 2);
    expect(Array.isArray(r)).toBe(true);
  });

  it('migrateCreedId is idempotent', () => {
    const oldId = 1;
    const migrated = migrateCreedId(oldId);
    expect(migrateCreedId(migrated)).toBe(migrated);
  });
});

// ── Progress.js (P0 fixes S2 + S4 + S5) ───────────────────────────────────
describe('Progress', () => {
  beforeEach(() => localStorage.clear());

  it('getProgress returns defaults for new student', () => {
    const p = getProgress('test-student');
    expect(p.name).toBe('test-student');
    expect(p.completedScenarios).toEqual([]);
    expect(p.topicProgress).toEqual({});
    // S5: schemaVersion stamped
    expect(p.schemaVersion).toBe(1);
  });

  it('S2: saveProgress returns false on quota error', () => {
    // Simulate QuotaExceededError
    const origSet = localStorage.setItem;
    try {
      localStorage.setItem = () => {
        const e = new Error('quota');
        e.name = 'QuotaExceededError';
        throw e;
      };
      const result = saveProgress({ name: 'quota-test', completedScenarios: [], topicProgress: {}, subjectProgress: {}, totalMoralScore: 0, lastPlayed: null });
      expect(result).toBe(false);
    } finally {
      localStorage.setItem = origSet;
    }
  });

  it('S4: V2.2 dead topic keys are migrated to V3 ids on read', () => {
    // Simulate a legacy V2.2 progress record
    const legacy = {
      name: 'legacy-student',
      completedScenarios: ['s1'],
      topicProgress: {
        emotions: { completed: 5, total: 15 },
        honesty: { completed: 3, total: 10 },
        conflict: { completed: 0, total: 8 },
        empathy: { completed: 2, total: 15 }, // pre-existing V3 entry
      },
      subjectProgress: { value: { completed: 10, total: 0 } },
      totalMoralScore: 100,
      lastPlayed: '2026-06-14',
      streak: { current: 1, longest: 1, lastDay: '2026-06-14' },
    };
    localStorage.setItem('fc_progress_legacy-student', JSON.stringify(legacy));

    const p = getProgress('legacy-student');
    // V2.2 keys pruned
    expect(p.topicProgress).not.toHaveProperty('emotions');
    expect(p.topicProgress).not.toHaveProperty('honesty');
    expect(p.topicProgress).not.toHaveProperty('conflict');
    // V3 keys present, with max() merge
    expect(p.topicProgress.empathy.completed).toBe(5); // max(2, 5)
    expect(p.topicProgress['conflict-resolution']).toBeTruthy();
  });

  it('S4: migration is idempotent — running twice gives same result', () => {
    const legacy = {
      name: 'idem-student',
      completedScenarios: [],
      topicProgress: { emotions: { completed: 1, total: 1 } },
      subjectProgress: {},
      totalMoralScore: 0,
      lastPlayed: null,
      streak: { current: 0, longest: 0, lastDay: null },
    };
    localStorage.setItem('fc_progress_idem-student', JSON.stringify(legacy));
    const a = getProgress('idem-student');
    const b = getProgress('idem-student');
    expect(JSON.stringify(a.topicProgress)).toBe(JSON.stringify(b.topicProgress));
  });

  it('S5: legacy records get schemaVersion stamped on read', () => {
    const legacy = {
      name: 'no-version',
      completedScenarios: [],
      topicProgress: {},
      subjectProgress: {},
      totalMoralScore: 0,
    };
    localStorage.setItem('fc_progress_no-version', JSON.stringify(legacy));
    const p = getProgress('no-version');
    expect(p.schemaVersion).toBe(1);
  });

  it('markComplete is idempotent (no double-count)', () => {
    const p1 = markComplete('student-a', 's1', 'empathy', 1);
    const p2 = markComplete('student-a', 's1', 'empathy', 1);
    expect(p1.completedScenarios.length).toBe(1);
    expect(p2.completedScenarios.length).toBe(1);
    expect(p2.totalMoralScore).toBe(p1.totalMoralScore);
  });
});

// ── escape.js (P0-3 fix) ───────────────────────────────────────────────────
describe('HTML/JS escaping', () => {
  it('escapeAttr neutralizes attribute-breakout attempts', () => {
    const evil = `Bob'); alert(1); ('`;
    const safe = escapeAttr(evil);
    expect(safe).not.toContain(`')`);
    expect(safe).not.toContain(`('`);
    expect(safe).toContain('&');
  });

  it('escapeAttr handles null/undefined', () => {
    expect(escapeAttr(null)).toBe('');
    expect(escapeAttr(undefined)).toBe('');
  });

  it('escapeJsString neutralizes JS-string-breakout attempts', () => {
    const evil = `'; alert(1); '`;
    const safe = escapeJsString(evil);
    expect(safe).not.toMatch(/^[^\\]'/); // no unescaped leading quote
  });

  it('escapeJsString escapes backslashes first', () => {
    const r = escapeJsString('a\\b');
    expect(r).toBe('a\\\\b');
  });
});
