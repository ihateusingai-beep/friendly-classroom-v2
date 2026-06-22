// tests/sprint17-migration.test.js
// Sprint 17 — Verify migration tool + cross-topic coverage.
//
// Tests:
//   1. All 17 topics have stopAndThink for negative options (≥ 1 each)
//   2. All 17 topics pass audit:style (no colloquial, no length violations)
//   3. Scenarios_v2 migration patterns handle edge cases
//   4. Auto-trim respects length limits

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(__dirname, '..');
const SCENARIOS_DIR = path.join(ROOT, 'data/scenarios');

const ALL_TOPICS = [
  'empathy', 'benevolence', 'body-autonomy', 'commitment',
  'conflict-resolution', 'diligence', 'filial-piety', 'help-seeking',
  'integrity', 'law-abiding', 'national-identity', 'perseverance',
  'respect', 'responsibility', 'social-boundary', 'solidarity',
  'stranger-safety',
];

describe('Sprint 17 — Cross-topic coverage', () => {
  it('all 17 scenario files exist', () => {
    for (const topic of ALL_TOPICS) {
      const filePath = path.join(SCENARIOS_DIR, `${topic}.json`);
      expect(fs.existsSync(filePath), `${topic}.json should exist`).toBe(true);
    }
  });

  it('each topic has ≥ 1 negative option with stopAndThink', () => {
    for (const topic of ALL_TOPICS) {
      const data = JSON.parse(fs.readFileSync(path.join(SCENARIOS_DIR, `${topic}.json`), 'utf8'));
      const negativeWithST = data.flatMap(s => s.options || [])
        .filter(o => {
          const totalMoral = (o.effects || []).reduce(
            (sum, e) => sum + (typeof e?.moralChange === 'number' ? e.moralChange : 0), 0
          );
          return totalMoral < 0 && o.stopAndThink;
        });
      expect(
        negativeWithST.length,
        `${topic} should have ≥ 1 negative option with stopAndThink`
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('stopAndThink has all 3 fields (badBehavior, consequence, isLoselose)', () => {
    for (const topic of ALL_TOPICS) {
      const data = JSON.parse(fs.readFileSync(path.join(SCENARIOS_DIR, `${topic}.json`), 'utf8'));
      for (const s of data) {
        for (const o of (s.options || [])) {
          if (!o.stopAndThink) continue;
          expect(o.stopAndThink.badBehavior, `${topic}/${s.id}/${o.id} missing badBehavior`).toBeTruthy();
          expect(o.stopAndThink.consequence, `${topic}/${s.id}/${o.id} missing consequence`).toBeTruthy();
          expect(typeof o.stopAndThink.isLoselose, `${topic}/${s.id}/${o.id} isLoselose not boolean`).toBe('boolean');
        }
      }
    }
  });

  it('audit:style passes for all 17 topics (0 violations)', () => {
    // Run audit:style and check exit code
    let output, error;
    try {
      output = execSync('node tools/style/audit-scenarios.mjs', {
        cwd: ROOT,
        encoding: 'utf8',
      });
    } catch (e) {
      output = e.stdout?.toString() || '';
    }
    // Last few lines should have "All scenarios pass" or "Violations: 0"
    expect(output, `audit should pass. Output: ${output}`).toContain('Violations:       0');
  });
});

describe('Sprint 17 — Auto-trim respects length limits', () => {
  it('optionText ≤ 30 chars after migration', () => {
    for (const topic of ALL_TOPICS) {
      const data = JSON.parse(fs.readFileSync(path.join(SCENARIOS_DIR, `${topic}.json`), 'utf8'));
      for (const s of data) {
        for (const o of (s.options || [])) {
          if (typeof o.text === 'string') {
            expect(o.text.length, `${topic}/${s.id}/${o.id} optionText too long`).toBeLessThanOrEqual(30);
          }
        }
      }
    }
  });

  it('effectsComment ≤ 40 chars after migration', () => {
    for (const topic of ALL_TOPICS) {
      const data = JSON.parse(fs.readFileSync(path.join(SCENARIOS_DIR, `${topic}.json`), 'utf8'));
      for (const s of data) {
        for (const o of (s.options || [])) {
          for (const e of (o.effects || [])) {
            if (typeof e?.comment === 'string') {
              expect(e.comment.length, `${topic}/${s.id}/${o.id} comment too long`).toBeLessThanOrEqual(40);
            }
          }
        }
      }
    }
  });

  it('stopAndThink badBehavior ≤ 25 chars after migration', () => {
    for (const topic of ALL_TOPICS) {
      const data = JSON.parse(fs.readFileSync(path.join(SCENARIOS_DIR, `${topic}.json`), 'utf8'));
      for (const s of data) {
        for (const o of (s.options || [])) {
          if (o.stopAndThink?.badBehavior) {
            expect(
              o.stopAndThink.badBehavior.length,
              `${topic}/${s.id}/${o.id} badBehavior too long: ${o.stopAndThink.badBehavior}`
            ).toBeLessThanOrEqual(25);
          }
        }
      }
    }
  });

  it('stopAndThink consequence ≤ 80 chars after migration', () => {
    for (const topic of ALL_TOPICS) {
      const data = JSON.parse(fs.readFileSync(path.join(SCENARIOS_DIR, `${topic}.json`), 'utf8'));
      for (const s of data) {
        for (const o of (s.options || [])) {
          if (o.stopAndThink?.consequence) {
            expect(
              o.stopAndThink.consequence.length,
              `${topic}/${s.id}/${o.id} consequence too long: ${o.stopAndThink.consequence}`
            ).toBeLessThanOrEqual(80);
          }
        }
      }
    }
  });
});

describe('Sprint 17 — Audit script per-topic', () => {
  it('audit per-topic works for each topic', () => {
    for (const topic of ALL_TOPICS) {
      const output = execSync(`node tools/style/audit-scenarios.mjs ${topic}`, {
        cwd: ROOT,
        encoding: 'utf8',
      });
      expect(output, `${topic} should pass audit`).toContain('Violations:       0');
    }
  });
});
