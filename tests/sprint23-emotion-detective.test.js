// tests/sprint23-emotion-detective.test.js
// Sprint 23 — 情緒小偵探 (SPEC §23)
//
// Unit tests for the new emotion-matching mode:
//   - Schema: faceOptions + scenarioImage + question fields
//   - chooseOption: emotion-detective fork (no moral scoring)
//   - chooseFaceOption: correct → isCorrect=true, wrong → isCorrect=false
//   - topics.js: emotion-detective is exposed as 18th topic
//
// Out of scope (Phase 2 follow-up):
//   - TTS speakScenario fallback to question (audio.js — covered manually)
//   - renderFaceOptionCard CSS audit (visual regression not unit-testable)
//   - Pilot → bulk scenario generation (separate workflow)

import { describe, it, expect, beforeEach } from 'vitest';
import { setScenarios, setStudent, chooseOption, getScenariosByTopic } from '../src/domain/ScenarioEngine.js';
import { TOPICS, getTopic } from '../src/topics.js';
import edScenarios from '../data/scenarios/emotion-detective.json';

// ── localStorage mock (matches scenario-engine.test.js) ────────────────────

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
  setStudent('test-student-s23');
});

// ── topics.js: 18th topic exposure ─────────────────────────────────────────

describe('Sprint 23 — topics.js entry', () => {
  it('exposes emotion-detective as a topic', () => {
    const t = getTopic('emotion-detective');
    expect(t).toBeDefined();
    expect(t.title).toBe('情緒小偵探');
    expect(t.domain).toBe('caring');
  });

  it('keeps the canonical 12 EDB value topics untouched', () => {
    // Sanity: ensure we didn't accidentally break the existing 12 EDB topics
    const valueIds = [
      'perseverance', 'respect', 'responsibility', 'national-identity',
      'commitment', 'integrity', 'benevolence', 'law-abiding',
      'empathy', 'diligence', 'solidarity', 'filial-piety',
    ];
    for (const id of valueIds) {
      expect(getTopic(id)).toBeDefined();
    }
  });

  it('total topic count is 18 (12 value + 5 caring + 1 emotion-detective)', () => {
    expect(TOPICS).toHaveLength(18);
  });
});

// ── emotion-detective.json schema ──────────────────────────────────────────

describe('Sprint 23 — emotion-detective.json schema (pilot)', () => {
  it('has 1 pilot scenario', () => {
    expect(edScenarios).toHaveLength(1);
    expect(edScenarios[0].id).toBe('ed-1');
  });

  it('uses faceOptions (not options)', () => {
    const sc = edScenarios[0];
    expect(Array.isArray(sc.faceOptions)).toBe(true);
    expect(sc.options).toBeUndefined();
  });

  it('faceOptions has 3 entries with id + label + image + correct', () => {
    const faces = edScenarios[0].faceOptions;
    expect(faces).toHaveLength(3);
    for (const f of faces) {
      expect(f.id).toBeTruthy();
      expect(f.label).toBeTruthy();
      expect(f.image).toMatch(/^assets\/images\/emotion-detective\//);
      expect(typeof f.correct).toBe('boolean');
    }
    const correctFaces = faces.filter(f => f.correct);
    expect(correctFaces).toHaveLength(1);
  });

  it('scenario has question + scenarioImage fields', () => {
    const sc = edScenarios[0];
    expect(sc.question).toBeTruthy();
    expect(sc.scenarioImage).toMatch(/^assets\/images\/emotion-detective\//);
  });

  it('required SPEC fields are present', () => {
    const sc = edScenarios[0];
    expect(sc.topicId).toBe('emotion-detective');
    expect(sc.valueCategory).toBe('emotion-detective');
    expect(sc.domain).toBe('caring');
    expect(sc.subjectId).toBe('caring');
    expect(sc.audience).toEqual(['caring']);
    expect(typeof sc.riskLevel).toBe('number');
    expect(Array.isArray(sc.skills)).toBe(true);
    expect(sc.skills.length).toBeGreaterThan(0);
    expect(Array.isArray(sc.creedIds)).toBe(true);
  });
});

// ── chooseOption fork: emotion-detective ───────────────────────────────────

describe('Sprint 23 — chooseOption emotion-detective fork', () => {
  it('returns isCorrect=true when the chosen face is the correct one', () => {
    const result = chooseOption('ed-1', 'happy', 'caring');
    expect(result).not.toBeNull();
    expect(result.isCorrect).toBe(true);
    expect(result.option.id).toBe('happy');
    expect(result.mainComment).toMatch(/答啱/);
  });

  it('returns isCorrect=false when the chosen face is wrong', () => {
    const result = chooseOption('ed-1', 'angry', 'caring');
    expect(result).not.toBeNull();
    expect(result.isCorrect).toBe(false);
    expect(result.option.id).toBe('angry');
    expect(result.mainComment).toMatch(/答錯/);
    // The correction comment should reveal the right answer
    expect(result.mainComment).toMatch(/開心/);
  });

  it('does not shift the moral score (moralChange stays 0)', () => {
    const correctResult = chooseOption('ed-1', 'happy', 'caring');
    const wrongResult = chooseOption('ed-1', 'crying', 'caring');
    expect(correctResult.moralChange).toBe(0);
    expect(wrongResult.moralChange).toBe(0);
  });

  it('returns null for an unknown face id', () => {
    const result = chooseOption('ed-1', 'not-a-real-face', 'caring');
    expect(result).toBeNull();
  });

  it('records completion so per-subject progress advances', () => {
    chooseOption('ed-1', 'happy', 'caring');
    const raw = _memStore['fc_progress_test-student-s23'];
    expect(raw).toBeDefined();
    const p = JSON.parse(raw);
    // markComplete writes a completion record: scenarioId 推入
    // top-level `completedScenarios`, topicProgress[topicId].completed++
    expect(p.completedScenarios).toContain('ed-1');
    expect(p.topicProgress?.['emotion-detective']?.completed).toBe(1);
  });

  it('result shape is renderResult-compatible (scenarioImage, scenarioTitle, outcomeImage=null)', () => {
    const result = chooseOption('ed-1', 'happy', 'caring');
    expect(result.scenarioImage).toMatch(/^assets\/images\/emotion-detective\//);
    expect(result.scenarioTitle).toBe('收到禮物');
    expect(result.outcomeImage).toBeNull();
    expect(result.nextScenario).toBeNull();
    expect(Array.isArray(result.creedText)).toBe(true);
  });
});

// ── getScenariosByTopic filter ─────────────────────────────────────────────

describe('Sprint 23 — getScenariosByTopic("emotion-detective")', () => {
  it('returns the emotion-detective scenarios', () => {
    const out = getScenariosByTopic('emotion-detective');
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('ed-1');
  });
});