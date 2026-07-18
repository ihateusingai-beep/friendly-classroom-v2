// tests/sprint28-family-domain.test.js
// Sprint 28 — 家庭生活 domain (SPEC §28)
//
// Pilot scope (per user 決策):
//   - 2 topics: healthy-eating (15) + screen-time (15) = 30 scenarios
//   - Subject: 'family' (alongside existing 'value')
//   - Login: student only (auth_student_only)
//   - Tone: collaborative (學生 + 家人一起, 而非 teacher-judging)
//
// Schema invariants tested:
//   - TOPICS.length grows from 18 → 20
//   - FAMILY const exported + helpers (getFamilyTopics / isFamilyTopic)
//   - subjectId='family' registered in SUBJECTS
//   - getAllSubjects() returns 2 (value + family)
//   - healthy-eating.json + screen-time.json files valid (15 each, 4-option minimum)
//   - Schema: required moral-choice fields, audience includes 'family', risk ≤ 2
//   - Options: every scenario has ≥1 positive + ≥1 negative option (mixed outcome)
//   - Moral change range: [-18, +18] (avoid extreme single-option swings)
//   - scenarioEngine.setScenarios() accepts family-domain data; chooseOption() applies moralChange
//   - isFamilyEnabled() reads teacher config (default ON)
//   - filter tab 'family' now in allowed filters
//
// iPad / accessibility invariants:
//   - All family topics use ≥44px touch targets via existing button-system
//     (rendered through same topic-list as emotion-detective — no per-topic divergence)
//   - No new scenario images required (uses existing scenario-image lazy-load via
//     `outcomeImage` field; pilot relies on text + emoji rendering)

import { describe, it, expect, beforeEach } from 'vitest';
import { TOPICS, FAMILY, getFamilyTopics, isFamilyTopic, getTopic } from '../src/topics.js';
import { SUBJECTS, getAllSubjects, getSubjectColor } from '../src/subjects.js';
import { isFamilyEnabled } from '../src/engine.js';
import { setScenarios, setStudent, chooseOption, getScenariosByTopic } from '../src/domain/ScenarioEngine.js';
import { invalidateTeacherConfigCache } from '../src/storage.js';
import heScenarios from '../data/scenarios/healthy-eating.json';
import stScenarios from '../data/scenarios/screen-time.json';

// ── localStorage mock (matches sprint23 pattern) ─────────────────────────────

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
  // Sprint 28 / SPEC §28: invalidate module-level teacher-config cache so each
  // test sees fresh state (5s TTL cache would otherwise leak between tests).
  invalidateTeacherConfigCache();
  setScenarios([...heScenarios, ...stScenarios]);
  setStudent('test-student-s28');
});

// ── topics.js — FAMILY export + helpers ─────────────────────────────────────

describe('Sprint 28 — topics.js FAMILY export', () => {
  it('exports FAMILY as 2-element array (healthy-eating, screen-time)', () => {
    expect(FAMILY).toHaveLength(2);
    expect(FAMILY.map(t => t.id)).toEqual(['healthy-eating', 'screen-time']);
  });

  it('all FAMILY entries domain=family + subjectId=family', () => {
    for (const t of FAMILY) {
      expect(t.domain).toBe('family');
      expect(t.subjectId).toBe('family');
    }
  });

  it('getFamilyTopics() returns the same FAMILY array', () => {
    expect(getFamilyTopics()).toBe(FAMILY);
  });

  it('isFamilyTopic() returns true for family ids, false otherwise', () => {
    expect(isFamilyTopic('healthy-eating')).toBe(true);
    expect(isFamilyTopic('screen-time')).toBe(true);
    expect(isFamilyTopic('emotion-detective')).toBe(false);
    expect(isFamilyTopic('perseverance')).toBe(false);
    expect(isFamilyTopic('not-a-real-topic')).toBe(false);
  });

  it('TOPICS contains FAMILY entries (regression — emotion-detective ordering preserved)', () => {
    // Sprint 28: TOPICS = [...VALUES, ...CARING, ...EMOTION_DETECTIVE, ...FAMILY]
    const familyInTop = TOPICS.filter(t => t.domain === 'family');
    expect(familyInTop.map(t => t.id).sort()).toEqual(['healthy-eating', 'screen-time']);

    // emotion-detective 仲喺度 + 仲係 18 (16 + 1 + 1 = wait: 12 + 5 + 1 = 18 pre-sprint28)
    const ed = TOPICS.find(t => t.id === 'emotion-detective');
    expect(ed).toBeDefined();
    expect(ed.domain).toBe('emotion-detective');
  });

  it('TOPICS total count = 21 (12 value + 5 caring + 1 ed + 2 family + 1 financial)', () => {
    // Sprint 18.7: 加 financial-literacy topic
    expect(TOPICS).toHaveLength(21);
  });

  it('family topics have unique colors (avoid clash with existing palette)', () => {
    const valueColors = TOPICS
      .filter(t => t.domain !== 'family')
      .map(t => t.color);
    for (const t of FAMILY) {
      expect(valueColors).not.toContain(t.color);
    }
  });
});

// ── subjects.js — family subject registration ───────────────────────────────

describe('Sprint 28 — subjects.js family subject', () => {
  it("registers 'family' subject alongside existing 'value'", () => {
    expect(SUBJECTS).toHaveLength(2);
    const ids = SUBJECTS.map(s => s.id);
    expect(ids).toContain('family');
    expect(ids).toContain('value');
  });

  it("family subject has distinct color (used for badge in topic list)", () => {
    // Subject color != topic colors by design — subject badge drives home screen
    // accent (warm amber), topic colors drive topic-card gradients (green / pink).
    const familySubject = SUBJECTS.find(s => s.id === 'family');
    expect(familySubject).toBeDefined();
    expect(getSubjectColor('family')).toBe(familySubject.color);
    // Subject 色必須同 family topic 色區分, 因為視覺層次(subject badge vs topic card)。
    expect(getSubjectColor('family')).not.toBe(FAMILY[0].color);
    expect(getSubjectColor('family')).not.toBe(FAMILY[1].color);
  });

  it('getAllSubjects() includes the family subject', () => {
    const allIds = getAllSubjects().map(s => s.id);
    expect(allIds).toContain('family');
  });
});

// ── Data schema — healthy-eating + screen-time (15 each, 4-opt mixed) ──────

describe('Sprint 28 — healthy-eating.json schema (15 scenarios)', () => {
  it('has exactly 15 scenarios with he-1..he-15 ids', () => {
    expect(heScenarios).toHaveLength(15);
    const ids = heScenarios.map(s => s.id);
    expect(ids).toEqual(
      Array.from({length: 15}, (_, i) => `he-${i + 1}`)
    );
  });

  it('every scenario has the required moral-choice fields', () => {
    const required = ['id', 'title', 'subjectId', 'topicId', 'domain',
                      'valueCategory', 'audience', 'riskLevel',
                      'description', 'options', 'creedIds', 'skills'];
    for (const sc of heScenarios) {
      for (const k of required) {
        expect(sc[k], `scenario ${sc.id} missing field ${k}`).toBeDefined();
      }
      expect(sc.subjectId).toBe('family');
      expect(sc.topicId).toBe('healthy-eating');
      expect(sc.domain).toBe('family');
      expect(sc.valueCategory).toBe('healthy-eating');
      expect(sc.audience).toContain('family');
    }
  });

  it('every scenario has 4 options with at least 1 positive + 1 negative moral-change', () => {
    for (const sc of heScenarios) {
      expect(sc.options.length, `${sc.id} options count`).toBeGreaterThanOrEqual(4);
      const moralChanges = sc.options.map(o => o.effects?.[0]?.moralChange);
      expect(moralChanges.filter(mc => mc > 0).length, `${sc.id} positives`).toBeGreaterThanOrEqual(1);
      expect(moralChanges.filter(mc => mc < 0).length, `${sc.id} negatives`).toBeGreaterThanOrEqual(1);
    }
  });

  it('moral change stays within [-18, +18] (avoid extreme single-option swings)', () => {
    for (const sc of heScenarios) {
      for (const opt of sc.options) {
        const mc = opt.effects?.[0]?.moralChange;
        if (mc === undefined) continue;
        expect(mc).toBeGreaterThanOrEqual(-18);
        expect(mc).toBeLessThanOrEqual(18);
      }
    }
  });

  it('risks kept ≤ 2 (家庭日常 = 低風險; SPEC §28.2)', () => {
    for (const sc of heScenarios) {
      expect(sc.riskLevel).toBeLessThanOrEqual(2);
    }
  });
});

describe('Sprint 28 — screen-time.json schema (14 scenarios after Sprint 18.7 moved st-7 to financial-literacy)', () => {
  it('has exactly 14 scenarios with st-1..st-6, st-8..st-15 ids (st-7 moved to financial-literacy)', () => {
    expect(stScenarios).toHaveLength(14);
    const ids = stScenarios.map(s => s.id);
    expect(ids).toEqual(
      ['st-1', 'st-2', 'st-3', 'st-4', 'st-5', 'st-6', 'st-8', 'st-9', 'st-10', 'st-11', 'st-12', 'st-13', 'st-14', 'st-15']
    );
  });

  it('every scenario has the required moral-choice fields + screen-time audience', () => {
    const required = ['id', 'title', 'subjectId', 'topicId', 'domain',
                      'valueCategory', 'audience', 'riskLevel',
                      'description', 'options', 'creedIds', 'skills'];
    for (const sc of stScenarios) {
      for (const k of required) {
        expect(sc[k], `scenario ${sc.id} missing field ${k}`).toBeDefined();
      }
      expect(sc.subjectId).toBe('family');
      expect(sc.topicId).toBe('screen-time');
      expect(sc.domain).toBe('family');
      expect(sc.valueCategory).toBe('screen-time');
      expect(sc.audience).toContain('family');
    }
  });

  it('every scenario has 4 options with mixed outcome (≥1 positive + ≥1 negative)', () => {
    for (const sc of stScenarios) {
      expect(sc.options.length).toBeGreaterThanOrEqual(4);
      const moralChanges = sc.options.map(o => o.effects?.[0]?.moralChange);
      expect(moralChanges.filter(mc => mc > 0).length).toBeGreaterThanOrEqual(1);
      expect(moralChanges.filter(mc => mc < 0).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('moral change stays within [-18, +18] (avoid extreme single-option swings)', () => {
    for (const sc of stScenarios) {
      for (const opt of sc.options) {
        const mc = opt.effects?.[0]?.moralChange;
        if (mc === undefined) continue;
        expect(mc).toBeGreaterThanOrEqual(-18);
        expect(mc).toBeLessThanOrEqual(18);
      }
    }
  });

  it('risks kept ≤ 2 (家庭日常 = 低風險; SPEC §28.2)', () => {
    for (const sc of stScenarios) {
      expect(sc.riskLevel).toBeLessThanOrEqual(2);
    }
  });

  it('at least 1 scenario covers stranger-danger / online predator (high-risk family safety)', () => {
    // SPEC §28.2 / Sprint 11 caring-pattern: family scope MUST include
    // stranger-safety when device-online scenarios are present. Confirm
    // ≥1 scenario with risk=2 covers online-safety (陌生 message / predator).
    const highRisk = stScenarios.filter(sc => sc.riskLevel === 2);
    expect(highRisk.length).toBeGreaterThanOrEqual(1);
    const hasOnlineSafety = highRisk.some(sc =>
      /陌生|message|Message|WhatsApp|Instagram|TikTok/i.test(sc.description + sc.title),
    );
    expect(hasOnlineSafety, 'at least 1 risk=2 scenario should cover online safety').toBe(true);
  });
});

// ── ScenarioEngine — chooseOption applies moralChange (regression coverage) ──

describe('Sprint 28 — ScenarioEngine integration with family scenarios', () => {
  it('chooseOption() applies positive moralChange + records completion', async () => {
    // chooseOption(scenarioId, optionId, subjectId)
    // he-1-a: positive (+15)
    const result = await chooseOption('he-1', 'he-1-a', 'family');
    expect(result).not.toBeNull();
    expect(result.moralChange).toBe(15);
  });

  it('chooseOption() applies negative moralChange (regression)', async () => {
    // he-1-b: negative (-15)
    const result = await chooseOption('he-1', 'he-1-b', 'family');
    expect(result).not.toBeNull();
    expect(result.moralChange).toBe(-15);
  });

  it('getScenariosByTopic() resolves family topics correctly', () => {
    const he = getScenariosByTopic('healthy-eating');
    expect(he).toHaveLength(15);
    // Sprint 18.7: st-7 moved to financial-literacy.json — screen-time now 14
    const st = getScenariosByTopic('screen-time');
    expect(st).toHaveLength(14);
  });
});

// ── isFamilyEnabled() — teacher toggle behavior ──────────────────────────────

describe('Sprint 28 — isFamilyEnabled() teacher toggle', () => {
  it('defaults to enabled (true) when no teacher config set', () => {
    // _memStore is empty in beforeEach — getTeacherConfig() falls back to defaults
    expect(isFamilyEnabled()).toBe(true);
  });

  it('returns false when teacher toggled familyEnabled=false', () => {
    _memStore['fc_teacher_config'] = JSON.stringify({ familyEnabled: false });
    expect(isFamilyEnabled()).toBe(false);
  });

  it('returns true when teacher toggled familyEnabled=true (explicit on)', () => {
    _memStore['fc_teacher_config'] = JSON.stringify({ familyEnabled: true });
    expect(isFamilyEnabled()).toBe(true);
  });
});

// ── iPad / accessibility invariants ────────────────────────────────────────
//
// Family topics reuse the existing topic-grid + topic-card + scenario-item
// UI surface (same renderers as emotion-detective). iPad-44px and
// flex-wrap behaviour are inherited + style.css got a new `flex-wrap:wrap`
// on `.home-filter-row` + `min-height: 44px` on `.home-filter-tab` to
// accommodate the 5th tab.
//
// This block documents the inheritance contract rather than re-testing
// CSS (covered by sprint18-touch-targets + sprint22-spacing audits).
describe('Sprint 28 — iPad / a11y contract (inheritance)', () => {
  it('family topic cards use the same _renderTopicCard path as other topics', () => {
    // Structural sanity: every family topic id IS findable via getTopic
    for (const t of FAMILY) {
      const resolved = getTopic(t.id);
      expect(resolved).toBeDefined();
      expect(resolved.domain).toBe('family');
    }
  });
});
