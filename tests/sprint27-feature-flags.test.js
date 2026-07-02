// tests/sprint27-feature-flags.test.js
// Sprint 27 — Unit tests for the feature-flags single source of truth.
// Covers U1 (HOME_REDESIGN), U3 (RESUME_BANNER), D1 (WARM_THEME) toggling,
// localStorage override semantics, and graceful degradation when
// localStorage is unavailable (private mode, SSR).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FLAGS, isFeatureEnabled, setFeatureOverride } from '../src/constants/feature-flags.js';

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

beforeEach(() => {
  for (const k in _memStore) delete _memStore[k];
});

describe('Sprint 27 — FLAGS defaults', () => {
  it('exposes HOME_REDESIGN (U1), RESUME_BANNER (U3), WARM_THEME (D1)', () => {
    expect('HOME_REDESIGN' in FLAGS).toBe(true);
    expect('RESUME_BANNER' in FLAGS).toBe(true);
    expect('WARM_THEME' in FLAGS).toBe(true);
  });

  it('U1 + U3 default to ON (low-risk, additive)', () => {
    expect(FLAGS.HOME_REDESIGN).toBe(true);
    expect(FLAGS.RESUME_BANNER).toBe(true);
  });

  it('D1 defaults to OFF (visual brand change, opt-in)', () => {
    expect(FLAGS.WARM_THEME).toBe(false);
  });

  it('FLAGS is frozen (no accidental mutation at runtime)', () => {
    expect(Object.isFrozen(FLAGS)).toBe(true);
  });
});

describe('Sprint 27 — isFeatureEnabled() default behavior', () => {
  it('returns default when no override set', () => {
    expect(isFeatureEnabled('HOME_REDESIGN')).toBe(true);
    expect(isFeatureEnabled('WARM_THEME')).toBe(false);
  });

  it('returns false for unknown flag name (with warning)', () => {
    const warns = [];
    const orig = console.warn;
    console.warn = (...args) => warns.push(args);
    expect(isFeatureEnabled('NOPE_FLAG')).toBe(false);
    console.warn = orig;
    expect(warns.length).toBeGreaterThan(0);
  });
});

describe('Sprint 27 — localStorage override semantics', () => {
  it('override "1" forces ON regardless of default', () => {
    setFeatureOverride('WARM_THEME', true);
    expect(isFeatureEnabled('WARM_THEME')).toBe(true);
  });

  it('override "0" forces OFF regardless of default', () => {
    setFeatureOverride('HOME_REDESIGN', false);
    expect(isFeatureEnabled('HOME_REDESIGN')).toBe(false);
  });

  it('clearing override (null) reverts to default', () => {
    setFeatureOverride('HOME_REDESIGN', false);
    expect(isFeatureEnabled('HOME_REDESIGN')).toBe(false);
    setFeatureOverride('HOME_REDESIGN', null);
    expect(isFeatureEnabled('HOME_REDESIGN')).toBe(true);
  });

  it('override value persists under fc_flag_<name> key', () => {
    setFeatureOverride('RESUME_BANNER', false);
    expect(_memStore['fc_flag_RESUME_BANNER']).toBe('0');
    setFeatureOverride('RESUME_BANNER', true);
    expect(_memStore['fc_flag_RESUME_BANNER']).toBe('1');
    setFeatureOverride('RESUME_BANNER', null);
    expect(_memStore['fc_flag_RESUME_BANNER']).toBeUndefined();
  });
});

describe('Sprint 27 — graceful degradation', () => {
  it('returns default when localStorage throws (e.g. quota exceeded on set)', () => {
    const origSet = localStorage.setItem;
    localStorage.setItem = () => {
      const e = new Error('quota');
      e.name = 'QuotaExceededError';
      throw e;
    };
    try {
      // setFeatureOverride swallows the error, so the override isn't written.
      // Default should still apply.
      setFeatureOverride('HOME_REDESIGN', false);
      // Override write failed → still default ON
      expect(isFeatureEnabled('HOME_REDESIGN')).toBe(true);
    } finally {
      localStorage.setItem = origSet;
    }
  });
});
