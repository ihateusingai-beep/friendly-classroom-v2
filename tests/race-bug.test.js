import { describe, it, expect, beforeEach } from 'vitest';
import { setScenarios, getScenarios, setStudent, initSubjectProgress, getScenarioById } from '../src/domain/ScenarioEngine.js';
import { markComplete, getProgress } from '../src/domain/Progress.js';

const _memStore = {};
globalThis.localStorage = {
  getItem: (k) => _memStore[k] ?? null,
  setItem: (k, v) => { _memStore[k] = String(v); },
  removeItem: (k) => { delete _memStore[k]; },
  clear: () => { for (const k in _memStore) delete _memStore[k]; },
  key: (i) => Object.keys(_memStore)[i] ?? null,
  get length() { return Object.keys(_memStore).length; },
};

const REAL_VALUE_SCENARIOS = [
  { id: 'v1', topicId: 'perseverance', subjectId: 'value', title: 'V1', options: [{id:'a'}] },
  { id: 'v2', topicId: 'perseverance', subjectId: 'value', title: 'V2', options: [{id:'a'}] },
  { id: 'v3', topicId: 'respect',      subjectId: 'value', title: 'V3', options: [{id:'a'}] },
];

describe('REGRESSION: subjectProgress total lock-in race (Sprint 4 / A1)', () => {
  beforeEach(() => {
    for (const k in _memStore) delete _memStore[k];
    setStudent('race-student');
  });

  it('A1 review fix: cache empty + initSubjectProgress defers, then chunk load fires real total', () => {
    // Step 1: selectSubject calls initSubjectProgress while cache is empty
    setScenarios([]);  // empty cache (per-topic lazy load)
    initSubjectProgress('value');
    // _pendingSubjectRefreshes holds the breadcrumb — no storage write
    // yet (writing 0 here would lock in the wrong value).
    expect(_memStore['fc_progress_race-student']).toBeUndefined();

    // Step 2: student clicks a topic, chunk loads
    setScenarios(REAL_VALUE_SCENARIOS);

    // Step 3: student plays a scenario, markComplete fires
    markComplete('race-student', 'v1', 'perseverance', 5, 'value');
    const p = JSON.parse(_memStore['fc_progress_race-student']);
    // After chunk load + markComplete, storage should reflect:
    //   completed = 1, total = 3
    expect(p.subjectProgress.value.completed).toBe(1);
    expect(p.subjectProgress.value.total).toBe(3);
  });
});
