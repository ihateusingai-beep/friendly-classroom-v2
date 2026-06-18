// tests/double-class-guard.test.js
// Sprint 14.1 — guard test for the "double class attribute" typo.
//
// Background: the codebase had 6 elements (across 5 files) where
// `class="foo"` and `class="bar"` were written on the same element as
// TWO SEPARATE attributes. HTML only honors the first `class`, so the
// second class is silently dropped — the visual bug was always there,
// but no test caught it.
//
// This test scans src/**/*.js for the pattern. If anyone re-introduces
// the typo, the test fails. Pure static analysis — no runtime needed.
//
// Pattern: an element with `class="X"` immediately followed by
// ` class="Y"` (whitespace-separated) on the same tag.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SRC_ROOT = join(__dirname, '..', 'src');

const DOUBLE_CLASS_RE = /class="[^"]*"\s+class="[^"]*"/g;

/**
 * Recursively walk a directory and yield absolute file paths for every
 * regular file matching the suffix filter.
 */
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

/**
 * Scan one file: return list of `{ line, snippet }` for each double-class
 * hit. `line` is 1-indexed.
 */
function findDoubleClasses(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const hits = [];
  for (const match of text.matchAll(DOUBLE_CLASS_RE)) {
    const before = text.slice(0, match.index);
    const line = before.split('\n').length;
    hits.push({ line, snippet: match[0] });
  }
  return hits;
}

describe('Sprint 14.1 — no double class attributes in source', () => {
  const offenders = [];
  for (const file of walk(SRC_ROOT)) {
    for (const hit of findDoubleClasses(file)) {
      offenders.push({
        file: relative(SRC_ROOT, file).split(sep).join('/'),
        ...hit,
      });
    }
  }

  it('has zero double-class occurrences across src/**/*.js', () => {
    if (offenders.length) {
      const msg = offenders
        .map((o) => `  - ${o.file}:${o.line}  →  ${o.snippet}`)
        .join('\n');
      throw new Error(
        `Found ${offenders.length} double-class attribute(s):\n${msg}\n` +
          `Merge them into one class="…" attribute.`
      );
    }
    expect(offenders).toEqual([]);
  });

  it('scanned at least the expected number of files (sanity)', () => {
    // We have 25+ source files. If the walker is broken, this catches it.
    let count = 0;
    for (const _ of walk(SRC_ROOT)) count++;
    expect(count).toBeGreaterThan(15);
  });
});
