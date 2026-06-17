// tests/settings-bridge.test.js
// Sprint 12 — unit tests for the 5 data-action ↔ window.FC bridges fixed
// 2026-06-17. Before the fix, these settings buttons were silently no-op
// (Category A bug from the E2E audit): doLogin (P0), resetSettings,
// setSpacing, toggleHC, toggleVoice.
//
// We test the pure helpers in audio.js (setSpacing / setHC /
// setVoiceEnabled / resetAllSettings) directly. The window.FC.* wrapper
// functions in main.js just call these + render(), so behavior coverage
// here is equivalent. doLogin + window.FC bridge existence are e2e scope
// (Playwright), not unit — main.js module init triggers DOM render() that
// requires a real browser env.

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Hoist localStorage / document mock to BEFORE audio.js module top-level
// evaluates (which reads localStorage at line 129). vi.hoisted runs the
// callback before any import statement in this file is resolved.
vi.hoisted(() => {
  const _memStore = {};
  globalThis.localStorage = {
    getItem: (k) => _memStore[k] ?? null,
    setItem: (k, v) => { _memStore[k] = String(v); },
    removeItem: (k) => { delete _memStore[k]; },
    clear: () => { for (const k in _memStore) delete _memStore[k]; },
    key: (i) => Object.keys(_memStore)[i] ?? null,
    get length() { return Object.keys(_memStore).length; },
  };
  globalThis.document = globalThis.document || {};
  globalThis.document.documentElement = {
    style: { setProperty: () => {} },
    setAttribute: () => {},
    removeAttribute: () => {},
    hasAttribute: () => false,
  };
  // audio.js top level writes `window._fcAudio = {...}` (line 438) +
  // `window.addEventListener('beforeunload', ...)` (line 449). Provide
  // a minimal window shim that satisfies both.
  if (!globalThis.window || !globalThis.window.addEventListener) {
    const w = { addEventListener: () => {}, removeEventListener: () => {} };
    w._fcAudio = {};
    globalThis.window = w;
  }
  if (!globalThis.window._fcAudio) globalThis.window._fcAudio = {};
});

// Import AFTER the hoisted mock is in place.
const { setSpacing, setHC, setVoiceEnabled, resetAllSettings,
        isEnabled, applyCSS } = await import('../src/audio.js');

beforeEach(() => {
  for (const k in Object.keys(globalThis.localStorage)) {} // no-op
  globalThis.localStorage.clear();
});

describe('Sprint 12 — settings data-action bridges', () => {
  describe('setSpacing', () => {
    it('writes narrow/medium/wide to localStorage', () => {
      setSpacing('wide');
      expect(localStorage.getItem('fc_spacing')).toBe('wide');
      setSpacing('narrow');
      expect(localStorage.getItem('fc_spacing')).toBe('narrow');
      setSpacing('medium');
      expect(localStorage.getItem('fc_spacing')).toBe('medium');
    });

    it('rejects invalid values without writing', () => {
      setSpacing('huge'); // not in [narrow, medium, wide]
      expect(localStorage.getItem('fc_spacing')).toBeNull();
    });
  });

  describe('setHC (high contrast)', () => {
    it('writes "1" when true, "0" when false', () => {
      setHC(true);
      expect(localStorage.getItem('fc_hc_mode')).toBe('1');
      setHC(false);
      expect(localStorage.getItem('fc_hc_mode')).toBe('0');
    });
  });

  describe('setVoiceEnabled', () => {
    it('persists to fc_voice_seen and reflects in isEnabled()', () => {
      setVoiceEnabled(false);
      expect(localStorage.getItem('fc_voice_seen')).toBe('0');
      expect(isEnabled()).toBe(false);

      setVoiceEnabled(true);
      expect(localStorage.getItem('fc_voice_seen')).toBe('1');
      expect(isEnabled()).toBe(true);
    });

    it('coerces non-boolean to boolean (truthy/falsy)', () => {
      setVoiceEnabled(0);
      expect(isEnabled()).toBe(false);
      setVoiceEnabled(1);
      expect(isEnabled()).toBe(true);
    });
  });

  describe('resetAllSettings', () => {
    it('clears all 6 user setting keys', () => {
      // Seed all 6 settings
      localStorage.setItem('fc_tts_speed', '1.2');
      localStorage.setItem('fc_font_size', '24');
      localStorage.setItem('fc_line_height', '1.8');
      localStorage.setItem('fc_spacing', 'wide');
      localStorage.setItem('fc_hc_mode', '1');
      localStorage.setItem('fc_rm_mode', '1');

      resetAllSettings();

      expect(localStorage.getItem('fc_tts_speed')).toBeNull();
      expect(localStorage.getItem('fc_font_size')).toBeNull();
      expect(localStorage.getItem('fc_line_height')).toBeNull();
      expect(localStorage.getItem('fc_spacing')).toBeNull();
      expect(localStorage.getItem('fc_hc_mode')).toBeNull();
      expect(localStorage.getItem('fc_rm_mode')).toBeNull();
    });

    it('does NOT clear fc_voice_seen (voice toggle is separate concern)', () => {
      // resetAllSettings only handles 6 a11y settings, voice needs its
      // own reset path (Sprint 12 main.js resetSettings handler chains
      // setVoiceEnabled(true) to also reset voice).
      localStorage.setItem('fc_voice_seen', '0');
      resetAllSettings();
      expect(localStorage.getItem('fc_voice_seen')).toBe('0');
    });
  });
});
