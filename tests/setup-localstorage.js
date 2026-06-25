// tests/setup-localstorage.js
// Vitest setup file — mocks `globalThis.localStorage` BEFORE any test file
// imports run. Required for tests that load modules (audio.js, engine.js)
// which read localStorage at module-evaluation time (e.g. audio.js line
// 135 reads `localStorage.getItem('fc_tts_lang')` to seed `currentLang`).
//
// Without this, vitest would throw `ReferenceError: localStorage is not
// defined` at module load. We export a minimal in-memory shim that mirrors
// the Web Storage API surface used in the codebase.

const _memStore = {};
globalThis.localStorage = {
  getItem: (k) => (k in _memStore ? _memStore[k] : null),
  setItem: (k, v) => { _memStore[k] = String(v); },
  removeItem: (k) => { delete _memStore[k]; },
  clear: () => { for (const k in _memStore) delete _memStore[k]; },
  key: (i) => Object.keys(_memStore)[i] ?? null,
  get length() { return Object.keys(_memStore).length; },
};

// Mock `window` for src/audio.js — line 604 assigns `window._fcAudio = ...`
// at module bottom for browser devtools. In Node we need a stub object.
// SpeechSynthesis API surface used by audio.js speakChained + speak().
globalThis.window = globalThis.window || {
  speechSynthesis: {
    cancel: () => {},
    speak: () => {},
    getVoices: () => [],
  },
  SpeechSynthesisUtterance: class {
    constructor(text) { this.text = text; }
  },
  addEventListener: () => {},
  removeEventListener: () => {},
};
globalThis.SpeechSynthesisUtterance = globalThis.window.SpeechSynthesisUtterance;
