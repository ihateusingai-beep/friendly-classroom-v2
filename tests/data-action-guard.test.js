// tests/data-action-guard.test.js
// Sprint 14.2 — guard test for the data-action ↔ handler registry.
//
// Every `data-action="X"` in template strings (rendered by any function
// in src/) must have a registered handler in the `actions` table
// (src/actions/index.js). If markup declares an action but the registry
// doesn't know about it, the click silently no-ops. This test makes that
// silent failure impossible.
//
// We do this as static analysis (no module loading — actions/index.js
// touches DOM at import time). Two passes:
//
//   1. Collect every `data-action="X"` literal from src/**/*.js.
//   2. Collect every action name registered in actions/index.js's
//      `Object.assign(actions, { ... })` block (and the inline.js table).
//
// If any data-action from (1) is missing from (2), the test fails with
// the offending file/line so the dev can wire it up.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const ACTIONS_INDEX = join(SRC, 'actions', 'index.js');
const ACTIONS_INLINE = join(SRC, 'actions', 'inline.js');

const DATA_ACTION_RE = /\bdata-action="([^"]+)"/g;
// Match `name,` or `name\n` inside an Object.assign({...}) block.
// We extract every identifier from actions/index.js's aggregate call +
// the inline.js table to build the registry set.
const KEY_RE = /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[,}]/gm;

function* walk(dir, suffix = '.js') {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      yield* walk(p, suffix);
    } else if (p.endsWith(suffix)) {
      yield p;
    }
  }
}

function readText(p) { return readFileSync(p, 'utf8'); }

/** Strip block + line comments so we don't match identifiers in jsdoc. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')   // /* ... */
    .replace(/^\s*\/\/.*$/gm, '');      // // ...
}

/** Extract every data-action="X" literal from every .js file under src/. */
function collectDataActions() {
  const hits = new Map();   // name → [{ file, line }]
  for (const file of walk(SRC)) {
    const raw = readText(file);
    // Strip block + line comments so we don't pick up jsdoc examples
    // (e.g. /** data-action="toggleHints" — ... */ in actions/inline.js).
    const text = stripComments(raw);
    for (const match of text.matchAll(DATA_ACTION_RE)) {
      const name = match[1];
      if (name === 'navigate') continue;   // handled by nav.js
      // Skip template-literal placeholders like data-action="${action}"
      if (name.startsWith('${') || name.includes('$')) continue;
      const before = text.slice(0, match.index);
      const line = before.split('\n').length;
      if (!hits.has(name)) hits.set(name, []);
      hits.get(name).push({
        file: relative(ROOT, file).split(sep).join('/'),
        line,
      });
    }
  }
  return hits;
}

/** Extract the action-name registry from actions/index.js + actions/inline.js.
 *  Strategy: inside `Object.assign(actions, { ... })` and
 *  `getInlineActions({...}) { return { ... } }`, every top-level key
 *  is an action name. We extract those keys.
 *
 *  More robust: we parse the `return { ... }` block in inline.js and
 *  the `Object.assign(actions, { ... })` block in index.js by scanning
 *  for top-level `key,` or `key:` patterns inside the matching braces.
 */
function collectRegisteredActions() {
  const registered = new Set();
  // Helper: extract every identifier from a `{ ... }` body.
  // Two flavors of the registry exist:
  //   1. Object.assign(actions, { key1, key2, key3 }) — pure key list,
  //      each key followed by `,` or `}`. Multiple keys per line OK.
  //   2. return { method1() {...}, method2() {...} } — method decls,
  //      each key at start of line, followed by `(`.
  //
  // We support both with two passes.
  function extractKeys(body, methodStyle) {
    const cleaned = stripComments(body);
    const keys = new Set();
    if (methodStyle) {
      // Method declarations: KEY at start of line, followed by `(`.
      // Anchored to start-of-line (with leading whitespace) so we don't
      // pick up identifiers inside method bodies.
      const re = /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/gm;
      for (const m of cleaned.matchAll(re)) keys.add(m[1]);
    } else {
      // Pure key list: KEY followed by `,` or `}` or newline.
      // No `^` anchor because multiple keys appear on the same line.
      const re = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[,}\n]/g;
      for (const m of cleaned.matchAll(re)) keys.add(m[1]);
    }
    return keys;
  }

  // index.js: extract keys from `Object.assign(actions, { ... })` calls
  for (const file of [ACTIONS_INDEX]) {
    const src = readText(file);
    const objAssignRe = /Object\.assign\s*\(\s*actions\s*,\s*\{/g;
    for (const m of src.matchAll(objAssignRe)) {
      const start = m.index + m[0].length;
      let depth = 1;
      let i = start;
      while (i < src.length && depth > 0) {
        const ch = src[i];
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
        i++;
      }
      const body = src.slice(start, i - 1);
      for (const k of extractKeys(body, false)) registered.add(k);
    }
  }
  // inline.js: extract keys from `return { ... }` inside getInlineActions
  {
    const src = readText(ACTIONS_INLINE);
    const fnRe = /getInlineActions\s*\([^)]*\)\s*\{/g;
    const fnMatch = fnRe.exec(src);
    if (fnMatch) {
      const start = fnMatch.index + fnMatch[0].length;
      const returnIdx = src.indexOf('return {', start);
      if (returnIdx === -1) throw new Error('inline.js: getInlineActions has no return block');
      const bodyStart = returnIdx + 'return {'.length;
      let depth = 1;
      let i = bodyStart;
      while (i < src.length && depth > 0) {
        const ch = src[i];
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
        i++;
      }
      const body = src.slice(bodyStart, i - 1);
      for (const k of extractKeys(body, true)) registered.add(k);
    }
  }
  return registered;
}

describe('Sprint 14.2 — every data-action has a registered handler', () => {
  const used = collectDataActions();
  const registered = collectRegisteredActions();

  it('registry is non-empty (sanity)', () => {
    expect(registered.size).toBeGreaterThan(20);
  });

  it('every data-action="X" in src/ exists in actions registry', () => {
    const missing = [];
    for (const [name, sites] of used) {
      if (!registered.has(name)) {
        for (const site of sites) {
          missing.push({ name, ...site });
        }
      }
    }
    if (missing.length) {
      const lines = missing
        .map((m) => `  - data-action="${m.name}" at ${m.file}:${m.line}`)
        .join('\n');
      throw new Error(
        `${missing.length} data-action(s) have no registered handler:\n${lines}\n` +
          `Add them to src/actions/index.js's Object.assign(actions, {...}) ` +
          `block or src/actions/inline.js.`
      );
    }
    expect(missing).toEqual([]);
  });
});
