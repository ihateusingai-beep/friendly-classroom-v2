// tests/scenario-engine.test.js
// Sprint 4 / A3: unit tests for the scenario chunk loading + filtering.
// These cover the regressions caught during Sprint 3 review (the
// self-assign trap and the 0/0 subject-total dead state) so future
// refactors don't reintroduce them silently.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  setScenarios, getScenarios, getScenariosByTopic,
  getScenarioById, setStudent, initSubjectProgress,
} from '../src/domain/ScenarioEngine.js';

// Mock localStorage for Node test env (matches smoke.test.js)
const _memStore = {};
globalThis.localStorage = {
  getItem: (k) => _memStore[k] ?? null,
  setItem: (k, v) => { _memStore[k] = String(v); },
  removeItem: (k) => { delete _memStore[k]; },
  clear: () => { for (const k in _memStore) delete _memStore[k]; },
  key: (i) => Object.keys(_memStore)[i] ?? null,
  get length() { return Object.keys(_memStore).length; },
};

// Sample fixtures
const PERS = { id: 's-p1', topicId: 'perseverance', subjectId: 'value', title: 'P1', options: [{id:'a'}] };
const RESP = { id: 's-r1', topicId: 'respect',      subjectId: 'value', title: 'R1', options: [{id:'a'}] };
const BODY = { id: 's-b1', topicId: 'body-autonomy', subjectId: 'caring', title: 'B1', options: [{id:'a'}] };

beforeEach(() => {
  _memStore.length = 0;
  for (const k in _memStore) delete _memStore[k];
  setScenarios([PERS, RESP, BODY]);
  setStudent('test-student');
});

// ── setScenarios / getScenarios / getScenariosByTopic ──────────────────────

describe('ScenarioEngine.setScenarios / getScenarios', () => {
  it('round-trips an array', () => {
    setScenarios([PERS, RESP]);
    expect(getScenarios()).toHaveLength(2);
  });
});

describe('ScenarioEngine.getScenariosByTopic', () => {
  it('filters by topicId', () => {
    const out = getScenariosByTopic('perseverance');
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('s-p1');
  });

  it('returns empty array for unknown topic', () => {
    expect(getScenariosByTopic('nope')).toEqual([]);
  });
});

// ── getScenarioById + id→topic reverse index ───────────────────────────────

describe('ScenarioEngine.getScenarioById', () => {
  it('returns the scenario when in cache', async () => {
    const out = await getScenarioById('s-p1');
    expect(out?.id).toBe('s-p1');
  });

  it('returns null for unknown id when id→topic index has no entry', async () => {
    const out = await getScenarioById('s-never-seen');
    expect(out).toBeNull();
  });

  it('populates the id→topic reverse index from setScenarios', async () => {
    // setScenarios was called in beforeEach — index should be ready
    // even before any chunk-load happens.
    const a = await getScenarioById('s-p1');
    const b = await getScenarioById('s-b1');
    expect(a?.topicId).toBe('perseverance');
    expect(b?.topicId).toBe('body-autonomy');
  });
});

// ── initSubjectProgress: per-subject filter (Sprint 4 / A1) ───────────────

describe('ScenarioEngine.initSubjectProgress (subjectId filter)', () => {
  it('writes the count of value-subject scenarios (not all)', () => {
    initSubjectProgress('value');
    const raw = _memStore['fc_progress_test-student'];
    expect(raw).toBeDefined();
    const p = JSON.parse(raw);
    // 2 value scenarios in fixture (perseverance + respect)
    expect(p.subjectProgress.value.total).toBe(2);
    // 0 caring — but caring total should not be set yet (we didn't ask)
    expect(p.subjectProgress.caring).toBeUndefined();
  });

  it('writes the count of caring-subject scenarios when asked', () => {
    initSubjectProgress('caring');
    const raw = _memStore['fc_progress_test-student'];
    const p = JSON.parse(raw);
    expect(p.subjectProgress.caring.total).toBe(1);
    // `value` is pre-initialised by _defaultProgress() with total=0; we
    // didn't ask for it in this test so its total stays at the default
    // (the engine no longer dedupes on first call, but updateSubjectTotal
    // skips the write when total hasn't changed).
    expect(p.subjectProgress.value.total).toBe(0);
  });

  it('writes 0 when the cache has no matching subject', () => {
    setScenarios([PERS, RESP]);  // value only
    initSubjectProgress('caring');
    const p = JSON.parse(_memStore['fc_progress_test-student']);
    expect(p.subjectProgress.caring.total).toBe(0);
  });

  it('S4 idempotency: re-calling with the same total does NOT re-save (no lastPlayed bump)', () => {
    const t0 = '2026-01-01';
    const t1 = '2026-02-01';

    initSubjectProgress('value');
    // Force a lastPlayed to a known value
    let p = JSON.parse(_memStore['fc_progress_test-student']);
    p.lastPlayed = t0;
    _memStore['fc_progress_test-student'] = JSON.stringify(p);

    initSubjectProgress('value');
    p = JSON.parse(_memStore['fc_progress_test-student']);
    // The no-op guard should have skipped the saveProgress() call,
    // so lastPlayed stays at t0 (saveProgress overwrites it with today).
    expect(p.lastPlayed).toBe(t0);
  });

  it('S4 re-call with a different value DOES update + bumps lastPlayed', () => {
    initSubjectProgress('value');
    let p = JSON.parse(_memStore['fc_progress_test-student']);
    p.lastPlayed = '1999-01-01';
    _memStore['fc_progress_test-student'] = JSON.stringify(p);

    // Mutate cache to change the total
    setScenarios([PERS, RESP, BODY]);  // adds 1 caring scenario
    initSubjectProgress('value');      // total still 2 (no new value scenarios)
    p = JSON.parse(_memStore['fc_progress_test-student']);
    // Same total → no-op
    expect(p.lastPlayed).toBe('1999-01-01');

    // Now mutate so a new value scenario lands
    setScenarios([PERS, RESP, BODY, { id: 's-p2', topicId: 'perseverance', subjectId: 'value', title: 'P2', options: [{id:'a'}] }]);
    initSubjectProgress('value');      // total now 3
    p = JSON.parse(_memStore['fc_progress_test-student']);
    expect(p.subjectProgress.value.total).toBe(3);
    expect(p.lastPlayed).not.toBe('1999-01-01');
  });
});
