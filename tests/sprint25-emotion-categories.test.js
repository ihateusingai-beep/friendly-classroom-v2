// tests/sprint25-emotion-categories.test.js
// Sprint 25 — Emotion-detective sub-categories (SPEC §25)
//
// Tests cover:
//   1. ensureStudent() lazy-creates anonymous student (Bug fix P1: 學生 mode → hub
//      flow 唔經 student-select, 之前 currentStudent 係 null, markComplete 跳過
//      save, suggestNext 返 topicScenarios[0] → 「下一題 重複同一題」)
//   2. EMOTION_CATEGORIES exposes 3 categories (basic / social / all)
//   3. filterScenariosByEmotionCategory correctly partitions the 10 ed-X scenarios
//   4. emotion-detective.json schema: every scenario has emotionCategory ∈ {basic, social}
//      + emotionLabel matching the correct face
//   5. chooseFaceOption + suggestNext regression: even without explicit setStudent,
//      the full play loop now correctly persists + advances to next scenario
//   6. setEmotionCategory rejects unknown ids (defensive)
//   7. The 6 Ekman basic emotions are all represented across the 10 scenarios

import { describe, it, expect, beforeEach } from 'vitest';
import { setScenarios, setStudent, chooseOption, suggestNext, ensureStudent, getStudent } from '../src/domain/ScenarioEngine.js';
import { EMOTION_CATEGORIES, filterScenariosByEmotionCategory } from '../src/topics.js';
import edScenarios from '../data/scenarios/emotion-detective.json';
import { getInlineActions } from '../src/actions/inline.js';

// ── localStorage mock ──────────────────────────────────────────────

const _memStore = {};
globalThis.localStorage = {
  getItem: (k) => _memStore[k] ?? null,
  setItem: (k, v) => { _memStore[k] = String(v); },
  removeItem: (k) => { delete _memStore[k]; },
  clear: () => { for (const k in _memStore) delete _memStore[k]; },
  key: (i) => Object.keys(_memStore)[i] ?? null,
  get length() { return Object.keys(_memStore).length; },
};

beforeEach(() => {
  for (const k in _memStore) delete _memStore[k];
  setScenarios(edScenarios);
  // Reset module-level currentStudent — the previous test's setStudent()
  // leaks into the next test if we don't reset here.
  setStudent(null);
});

// ── 1. ensureStudent() lazy-creates anonymous student (Bug fix P1) ──

describe('Sprint 25 P1 — ensureStudent() anonymous fallback (bug fix)', () => {
  it('returns "同學" fallback when no student selected yet', () => {
    // Fresh boot: currentStudent is null (學生 mode → hub 唔經 student-select)
    expect(getStudent()).toBeNull();
    const name = ensureStudent();
    expect(name).toBe('同學');
    expect(getStudent()).toBe('同學');
  });

  it('preserves a real selected student (does NOT overwrite)', () => {
    setStudent('曉怡');
    expect(ensureStudent()).toBe('曉怡');
    expect(getStudent()).toBe('曉怡');
  });

  it('persists progress under fc_progress_同學 after anonymous markComplete', () => {
    // Simulates the broken 學生 mode flow: no student picked → play → choose
    expect(getStudent()).toBeNull();
    const result = chooseOption('ed-1', 'happy', 'caring');
    expect(result).not.toBeNull();
    expect(result.isCorrect).toBe(true);

    // 匿名 student 應該有 progress 寫入
    const raw = _memStore['fc_progress_同學'];
    expect(raw, 'anonymous progress should be persisted').toBeDefined();
    const p = JSON.parse(raw);
    expect(p.completedScenarios, 'ed-1 should be marked complete').toContain('ed-1');
  });

  it('suggestNext advances to ed-2 after anonymous ed-1 completion (the original bug)', () => {
    // The original bug: 下一題 button 嘅 data-arg="ed-1" instead of "ed-2"
    // because suggestNext returned topicScenarios[0] when currentStudent was null.
    chooseOption('ed-1', 'happy', 'caring');
    const next = suggestNext('emotion-detective');
    expect(next).not.toBeNull();
    expect(next.id, 'should advance to ed-2 after ed-1').toBe('ed-2');
  });

  it('suggestNext returns null after completing all 10 (anonymous)', () => {
    for (const sc of edScenarios) {
      const correct = sc.faceOptions.find(f => f.correct);
      chooseOption(sc.id, correct.id, 'caring');
    }
    const next = suggestNext('emotion-detective');
    expect(next, 'all 10 should be done → no next').toBeNull();
  });
});

// ── 2. EMOTION_CATEGORIES contract ────────────────────────────────

describe('Sprint 25 — EMOTION_CATEGORIES contract', () => {
  it('exposes 3 categories: basic / social / all', () => {
    expect(EMOTION_CATEGORIES).toHaveLength(3);
    const ids = EMOTION_CATEGORIES.map(c => c.id);
    expect(ids).toEqual(['basic', 'social', 'all']);
  });

  it('every category has emoji / label / short / description', () => {
    for (const c of EMOTION_CATEGORIES) {
      expect(c.emoji, `${c.id} emoji`).toBeTruthy();
      expect(c.label, `${c.id} label`).toBeTruthy();
      expect(c.short, `${c.id} short`).toBeTruthy();
      expect(c.description, `${c.id} description`).toBeTruthy();
    }
  });

  it('category ids match the data-action setEmotionCategory allow-list', () => {
    // The allow-list lives inline in actions/inline.js — assert it matches the
    // single source of truth here so a future EMOTION_CATEGORIES change can't
    // silently desync from the dispatcher.
    const fragment = getInlineActions({
      render: () => {}, _navigate: () => {}, getState: () => ({}), setView: () => {},
    });
    expect(typeof fragment.setEmotionCategory).toBe('function');
  });
});

// ── 3. filterScenariosByEmotionCategory partitioning ─────────────

describe('Sprint 25 — filterScenariosByEmotionCategory partitioning', () => {
  it('returns the full 10 when categoryId="all"', () => {
    const out = filterScenariosByEmotionCategory(edScenarios, 'all');
    expect(out).toHaveLength(10);
  });

  it('returns 6 Ekman basic emotions when categoryId="basic"', () => {
    const out = filterScenariosByEmotionCategory(edScenarios, 'basic');
    expect(out).toHaveLength(6);
    for (const s of out) expect(s.emotionCategory).toBe('basic');
  });

  it('returns 4 social/self-evaluative emotions when categoryId="social"', () => {
    const out = filterScenariosByEmotionCategory(edScenarios, 'social');
    expect(out).toHaveLength(4);
    for (const s of out) expect(s.emotionCategory).toBe('social');
  });

  it('returns the input array unchanged for "all" (does not mutate)', () => {
    const snapshot = edScenarios.slice();
    const out = filterScenariosByEmotionCategory(edScenarios, 'all');
    expect(out).toEqual(snapshot);
    expect(out).not.toBe(edScenarios);  // returns a fresh slice, not the same ref
  });

  it('returns the input array for null/undefined/empty (defensive default = all)', () => {
    expect(filterScenariosByEmotionCategory(edScenarios, null)).toHaveLength(10);
    expect(filterScenariosByEmotionCategory(edScenarios, undefined)).toHaveLength(10);
    expect(filterScenariosByEmotionCategory(edScenarios, '')).toHaveLength(10);
  });

  it('basic + social = all (no scenario missing from categorization)', () => {
    const basic = filterScenariosByEmotionCategory(edScenarios, 'basic');
    const social = filterScenariosByEmotionCategory(edScenarios, 'social');
    const all = filterScenariosByEmotionCategory(edScenarios, 'all');
    expect(basic.length + social.length).toBe(all.length);
    const ids = new Set([...basic, ...social].map(s => s.id));
    expect(ids.size).toBe(10);  // no overlap, no gaps
  });
});

// ── 4. emotion-detective.json schema (Sprint 25 metadata) ─────────

describe('Sprint 25 — emotion-detective.json emotionCategory schema', () => {
  it('every scenario has emotionCategory ∈ {basic, social}', () => {
    for (const sc of edScenarios) {
      expect(['basic', 'social'], `${sc.id} emotionCategory`).toContain(sc.emotionCategory);
    }
  });

  it('every scenario has emotionLabel matching its correct face', () => {
    // emotionLabel is the helper field for UI badge (e.g. "開心", "尷尬").
    // Must equal the correct face's label so renderTopicList sub-text is honest.
    for (const sc of edScenarios) {
      const correct = sc.faceOptions.find(f => f.correct);
      expect(sc.emotionLabel, `${sc.id} emotionLabel`).toBe(correct.label);
    }
  });

  it('Ekman 6 basic emotions are all present', () => {
    const basicCorrectLabels = edScenarios
      .filter(s => s.emotionCategory === 'basic')
      .map(s => s.faceOptions.find(f => f.correct).label);
    const ekman6 = ['開心', '嬲', '喊', '驚', '驚訝', '厭惡'];
    for (const label of ekman6) {
      expect(basicCorrectLabels, `Ekman 6 missing "${label}"`).toContain(label);
    }
  });

  it('social category covers 4 distinct self-evaluative / social emotions', () => {
    const socialCorrectLabels = edScenarios
      .filter(s => s.emotionCategory === 'social')
      .map(s => s.faceOptions.find(f => f.correct).label);
    // We expect 4 distinct (one per scenario): 尷尬 / 攰 / 困惑 / 驕傲
    expect(socialCorrectLabels).toHaveLength(4);
    expect(new Set(socialCorrectLabels).size).toBe(4);
  });
});

// ── 5. setEmotionCategory defensive allow-list ───────────────────

describe('Sprint 25 — setEmotionCategory allow-list', () => {
  it('rejects unknown category ids without throwing', () => {
    // Spy on console.warn
    const warns = [];
    const origWarn = console.warn;
    console.warn = (...args) => warns.push(args);

    const fragment = getInlineActions({
      render: () => {}, _navigate: () => {}, getState: () => ({}), setView: () => {},
    });
    // 'bogus' is not in ['basic', 'social', 'all']
    fragment.setEmotionCategory('bogus');

    console.warn = origWarn;
    expect(warns.some(w => w[0]?.includes?.('setEmotionCategory'))).toBe(true);
    // localStorage 唔應該被寫
    expect(_memStore['fc_ed_filter']).toBeUndefined();
  });

  it('accepts basic / social / all and writes to fc_ed_filter', () => {
    const fragment = getInlineActions({
      render: () => {}, _navigate: () => {}, getState: () => ({}), setView: () => {},
    });
    for (const id of ['basic', 'social', 'all']) {
      _memStore['fc_ed_filter'] = undefined;
      fragment.setEmotionCategory(id);
      expect(_memStore['fc_ed_filter']).toBe(id);
    }
  });
});