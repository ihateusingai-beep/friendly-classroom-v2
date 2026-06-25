// vitest.config.js — Vitest configuration for Friendly Classroom v2.
//
// The setupFile mocks `globalThis.localStorage` BEFORE any test file's
// imports run. This is required because src/audio.js reads localStorage at
// module-evaluation time (line 135: `localStorage.getItem('fc_tts_lang')`),
// and tests that import engine.js / audio.js transitively load audio.js.
//
// Without the setupFile, those tests throw `ReferenceError: localStorage
// is not defined` at module load. Per-test mocks (e.g. tests/scenario-engine.test.js
// line 14) still work — they just override the global with their own
// fixture-shaped store.

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup-localstorage.js'],
    include: ['tests/**/*.test.js'],
  },
});
