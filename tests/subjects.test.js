// tests/subjects.test.js
// Sprint 14.4 — guard test for the subjects single source of truth.
//
// `src/subjects.js` is the single source of truth for all subjects
// (id, title, emoji, color, bgColor). Hardcoded copies used to exist
// in `engine.js` (renderProgress) and `domain/Progress.js`
// (_defaultProgress). Now both read from `getAllSubjects()`. This test
// locks in that contract:
//
//   1. Every subject has the required fields.
//   2. The default progress shape covers every subject (so a new
//      subject added to SUBJECTS[] auto-gets a progress entry — no
//      silent missing-data bugs).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SUBJECTS, getSubject, getSubjectColor, getSubjectBgColor,
         getSubjectName, getSubjectEmoji, getAllSubjects } from '../src/subjects.js';

// `_defaultProgress` is a module-private helper. To test the
// "default-progress subjectProgress covers every subject" contract,
// we call the public `getProgress(name)` — which falls back to
// `_defaultProgress` when there's no stored progress for the student.
let _getProgress;
beforeEach(async () => {
  vi.resetModules();
  // localStorage must exist before domain/Progress.js evaluates its top
  // level (which reads `localStorage.getItem(...)`).
  const _mem = {};
  globalThis.localStorage = {
    getItem: (k) => _mem[k] ?? null,
    setItem: (k, v) => { _mem[k] = String(v); },
    removeItem: (k) => { delete _mem[k]; },
    clear: () => { for (const k in _mem) delete _mem[k]; },
  };
  const mod = await import('../src/domain/Progress.js');
  _getProgress = mod.getProgress;
});

describe('Subjects single source of truth (Sprint 14.4)', () => {
  it('SUBJECTS is a non-empty array', () => {
    expect(Array.isArray(SUBJECTS)).toBe(true);
    expect(SUBJECTS.length).toBeGreaterThan(0);
  });

  it('every subject has required fields', () => {
    for (const s of SUBJECTS) {
      expect(s.id, `subject missing id: ${JSON.stringify(s)}`).toBeTruthy();
      expect(s.title, `subject ${s.id} missing title`).toBeTruthy();
      expect(s.emoji, `subject ${s.id} missing emoji`).toBeTruthy();
      expect(s.color, `subject ${s.id} missing color`).toMatch(/^#[0-9A-F]{6}$/i);
      expect(s.bgColor, `subject ${s.id} missing bgColor`).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('subject ids are unique', () => {
    const ids = SUBJECTS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getSubject returns the matching subject or undefined', () => {
    for (const s of SUBJECTS) {
      expect(getSubject(s.id)).toEqual(s);
    }
    expect(getSubject('__nope__')).toBeUndefined();
  });

  it('getSubjectColor / getSubjectBgColor / getSubjectName / getSubjectEmoji all fall back to the first subject', () => {
    const fallback = SUBJECTS[0];
    expect(getSubjectColor('__nope__')).toBe(fallback.color);
    expect(getSubjectBgColor('__nope__')).toBe(fallback.bgColor);
    expect(getSubjectName('__nope__')).toBe(fallback.title);
    expect(getSubjectEmoji('__nope__')).toBe(fallback.emoji);
  });

  it('default-progress subjectProgress covers every subject', () => {
    // Round-trip: call getProgress for a never-seen student → it falls
    // back to _defaultProgress which now uses getAllSubjects() — every
    // subject in SUBJECTS[] must have a `subjectProgress[id]` entry.
    // This is the contract that engine.js:899 + Progress.js:_defaultProgress
    // now obey — any new subject added to SUBJECTS[] auto-appears here.
    const p = _getProgress('test-student-never-seen');
    expect(p.subjectProgress).toBeDefined();
    for (const s of SUBJECTS) {
      expect(p.subjectProgress[s.id], `default progress missing subject "${s.id}"`)
        .toBeDefined();
      expect(p.subjectProgress[s.id].completed).toBe(0);
      expect(p.subjectProgress[s.id].total).toBe(0);
    }
  });

  it('getAllSubjects() returns the same array reference as SUBJECTS', () => {
    // Subjects are static — no need to copy. Callers must treat as
    // read-only (mutating it would corrupt the single source).
    expect(getAllSubjects()).toBe(SUBJECTS);
  });
});
