// tests/sprint27-resume.test.js
// Sprint 27 U3 — Unit tests for the resume banner pure helpers.
// Covers all 5 hide-banner rules + relative time formatting + persistence.
//
// Mock note: tests/setup-localstorage.js already provides a `localStorage`
// shim. We use `globalThis.localStorage.clear()` to reset between tests
// rather than shadowing it with a fresh object — Resume.js resolves
// `localStorage` at call time against the global object, so the existing
// shim is the source of truth.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordLastPlayed,
  clearResume,
  dismissResume,
  getResumeCandidate,
  formatRelativePlayed,
} from '../src/domain/Resume.js';

const SCENARIOS = [
  { id: 's-1', topicId: 'perseverance', title: '堅毅：功課難都要試' },
  { id: 's-2', topicId: 'perseverance', title: '堅毅：跌倒再起' },
];

beforeEach(() => {
  globalThis.localStorage.clear();
});

describe('Sprint 27 U3 — recordLastPlayed', () => {
  it('writes fc_last_scenario + fc_last_played_at', () => {
    recordLastPlayed('s-1');
    expect(globalThis.localStorage.getItem('fc_last_scenario')).toBe('s-1');
    expect(globalThis.localStorage.getItem('fc_last_played_at')).toBeTruthy();
  });

  it('is idempotent (calling twice updates timestamp)', async () => {
    recordLastPlayed('s-1');
    const t1 = globalThis.localStorage.getItem('fc_last_played_at');
    await new Promise((r) => setTimeout(r, 10));
    recordLastPlayed('s-1');
    const t2 = globalThis.localStorage.getItem('fc_last_played_at');
    expect(t1).not.toBe(t2);
    expect(globalThis.localStorage.getItem('fc_last_scenario')).toBe('s-1');
  });

  it('does nothing for null/empty scenario id', () => {
    recordLastPlayed(null);
    recordLastPlayed('');
    expect(globalThis.localStorage.getItem('fc_last_scenario')).toBeNull();
  });
});

describe('Sprint 27 U3 — getResumeCandidate hide rules', () => {
  it('returns null when fc_last_scenario is empty', () => {
    expect(getResumeCandidate(SCENARIOS, 'student-a')).toBeNull();
  });

  it('returns null when scenario is not in cache (chunk removed)', () => {
    recordLastPlayed('s-removed');
    const r = getResumeCandidate(SCENARIOS, 'student-a');
    expect(r).toBeNull();
    // Stale entry should be cleared so future renders don't loop on it
    expect(globalThis.localStorage.getItem('fc_last_scenario')).toBeNull();
  });

  it('returns the candidate when scenario is in cache', () => {
    recordLastPlayed('s-1');
    const r = getResumeCandidate(SCENARIOS, 'student-a');
    expect(r).toEqual({
      scenarioId: 's-1',
      playedAt: globalThis.localStorage.getItem('fc_last_played_at'),
      isStale: false,
    });
  });

  it('returns null when student already completed the scenario', () => {
    recordLastPlayed('s-1');
    const r = getResumeCandidate(SCENARIOS, 'student-a', {
      isCompleted: () => true,
    });
    expect(r).toBeNull();
  });

  it('does NOT hide banner when student is null (anonymous mode)', () => {
    recordLastPlayed('s-1');
    // getResumeCandidate with studentName=null and no isCompleted callback
    // → shows banner (anonymous mode, can't check completion)
    const r = getResumeCandidate(SCENARIOS, null);
    expect(r).not.toBeNull();
  });

  it('hides banner when dismissed within 24h', () => {
    recordLastPlayed('s-1');
    dismissResume('s-1');
    const r = getResumeCandidate(SCENARIOS, 'student-a');
    expect(r).toBeNull();
  });

  it('shows banner again after 24h dismiss cooldown', () => {
    recordLastPlayed('s-1');
    // Set dismissed 25h ago
    const longAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    globalThis.localStorage.setItem('fc_resume_dismissed', JSON.stringify({ 's-1': longAgo }))
    const r = getResumeCandidate(SCENARIOS, 'student-a');
    expect(r).not.toBeNull();
    expect(r.scenarioId).toBe('s-1');
  });

  it('hides banner when lastPlayedAt > 7d ago', () => {
    globalThis.localStorage.setItem('fc_last_scenario', 's-1');
    globalThis.localStorage.setItem('fc_last_played_at', new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString());
    const r = getResumeCandidate(SCENARIOS, 'student-a');
    expect(r).toBeNull();
    // Stale entry cleared
    expect(globalThis.localStorage.getItem('fc_last_scenario')).toBeNull();
  });

  it('flags isStale=true when lastPlayedAt is 1-7d ago', () => {
    globalThis.localStorage.setItem('fc_last_scenario', 's-1');
    globalThis.localStorage.setItem('fc_last_played_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());
    const r = getResumeCandidate(SCENARIOS, 'student-a');
    expect(r).not.toBeNull();
    expect(r.isStale).toBe(true);
  });
});

describe('Sprint 27 U3 — dismissResume', () => {
  it('writes per-scenario dismiss map', () => {
    dismissResume('s-1');
    const map = JSON.parse(globalThis.localStorage.getItem('fc_resume_dismissed'));
    expect(map['s-1']).toBeTruthy();
    expect(new Date(map['s-1']).toISOString()).toBe(map['s-1']);
  });

  it('dismissResume(null) dismisses current fc_last_scenario', () => {
    recordLastPlayed('s-1');
    dismissResume(null);
    const map = JSON.parse(globalThis.localStorage.getItem('fc_resume_dismissed'));
    expect(map['s-1']).toBeTruthy();
  });

  it('multiple scenarios tracked independently', () => {
    recordLastPlayed('s-1');
    dismissResume('s-1');
    recordLastPlayed('s-2');
    // Check s-2 first (will pass), THEN s-1 (will fail → null + clear).
    // Order matters because the "stale id" cleanup in getResumeCandidate
    // removes fc_last_scenario when the id isn't in the cache.
    expect(getResumeCandidate([SCENARIOS[1]], 'student-a')).not.toBeNull();
    expect(getResumeCandidate([SCENARIOS[0]], 'student-a')).toBeNull();
  });
});

describe('Sprint 27 U3 — clearResume', () => {
  it('removes fc_last_scenario + fc_last_played_at', () => {
    recordLastPlayed('s-1');
    clearResume();
    expect(globalThis.localStorage.getItem('fc_last_scenario')).toBeNull();
    expect(globalThis.localStorage.getItem('fc_last_played_at')).toBeNull();
  });
});

describe('Sprint 27 U3 — formatRelativePlayed', () => {
  it('returns "剛剛" for < 60s ago', () => {
    expect(formatRelativePlayed(new Date().toISOString())).toBe('剛剛');
  });

  it('returns "N 分鐘前" for minutes', () => {
    const t = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativePlayed(t)).toBe('5 分鐘前');
  });

  it('returns "N 小時前" for hours', () => {
    const t = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativePlayed(t)).toBe('3 小時前');
  });

  it('returns "昨日" for 1 day ago', () => {
    const t = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    expect(formatRelativePlayed(t)).toBe('昨日');
  });

  it('returns "N 日前" for 2-6 days', () => {
    const t = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativePlayed(t)).toBe('3 日前');
  });

  it('returns "" for null/undefined/invalid', () => {
    expect(formatRelativePlayed(null)).toBe('');
    expect(formatRelativePlayed(undefined)).toBe('');
    expect(formatRelativePlayed('not-a-date')).toBe('');
  });
});
