// tests/sprint21-font-sizes.test.js
// Sprint 21 — Verify typography scale tokens are defined and used,
// and that no hardcoded text-scale font-size slipped through.

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(__dirname, '..');
const CSS_PATH = path.join(ROOT, 'src', 'style.css');
const AUDIT_TOOL = path.join(ROOT, 'tools', 'a11y', 'audit-font-sizes.mjs');

function readCSS() { return fs.readFileSync(CSS_PATH, 'utf8'); }

function findRoot(css) {
  // Match :root { ... } block
  const m = css.match(/:root\s*\{([\s\S]+?)\}/);
  return m ? m[1] : null;
}

function getTokenValue(root, tokenName) {
  const re = new RegExp(`${tokenName}\\s*:\\s*([^;]+)`);
  const m = root.match(re);
  return m ? m[1].trim() : null;
}

// Tokens that MUST exist in :root (Sprint 21 typography scale)
const REQUIRED_TOKENS = {
  '--fs-xs':   '0.6667em',
  '--fs-sm':   '0.7778em',
  '--fs-base': '0.8889em',
  '--fs-md':   '1em',
  '--fs-lg':   '1.2222em',
  '--fs-xl':   '1.5556em',
};

describe('Sprint 21 — Typography scale tokens', () => {
  const css = readCSS();
  const root = findRoot(css);

  it(':root block exists', () => {
    expect(root, ':root block must exist in style.css').toBeTruthy();
  });

  for (const [token, expectedValue] of Object.entries(REQUIRED_TOKENS)) {
    it(`${token} defined as ${expectedValue}`, () => {
      expect(root, `:root must define ${token}`).toBeTruthy();
      const v = getTokenValue(root, token);
      expect(v, `${token} value`).toBe(expectedValue);
    });
  }

  it('--fc-font-size (SEN root) preserved', () => {
    expect(root).toBeTruthy();
    const v = getTokenValue(root, '--fc-font-size');
    expect(v, '--fc-font-size SEN root').toBe('18px');
  });
});

describe('Sprint 21 — Typography scale math @ 18px root', () => {
  // Resolve each token against 18px root → confirm semantic mapping
  const EXPECTED_PX = {
    '--fs-xs':   12,
    '--fs-sm':   14,
    '--fs-base': 16,
    '--fs-md':   18,
    '--fs-lg':   22,
    '--fs-xl':   28,
  };

  for (const [token, expectedPx] of Object.entries(EXPECTED_PX)) {
    it(`${token} resolves to ≈${expectedPx}px @ 18px root`, () => {
      const css = readCSS();
      const root = findRoot(css);
      const value = getTokenValue(root, token);
      expect(value, `${token} must exist`).toBeTruthy();
      // value is in em, multiply by 18
      const emMatch = value.match(/([\d.]+)em/);
      expect(emMatch, `${token} must be em-based`).toBeTruthy();
      const px = parseFloat(emMatch[1]) * 18;
      // Allow 0.5px tolerance for rounding
      expect(Math.abs(px - expectedPx), `${token} px resolution`).toBeLessThan(0.5);
    });
  }
});

describe('Sprint 21 — Token usage in CSS', () => {
  it('all 6 tokens are referenced (no orphan definitions)', () => {
    const css = readCSS();
    for (const token of Object.keys(REQUIRED_TOKENS)) {
      // Match var(--fs-*) — escape both parens
      const re = new RegExp(`var\\(${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
      const usages = css.match(re) || [];
      // 1 definition + at least 1 actual usage expected
      expect(usages.length, `${token} should be defined + used at least twice`).toBeGreaterThan(1);
    }
  });

  it('--fs-md is the most-used token (body default)', () => {
    const css = readCSS();
    const usages = (css.match(/var\(--fs-md\)/g) || []).length;
    // Used in body + many text-scale references — expect ≥ 20
    expect(usages, '--fs-md usage count').toBeGreaterThan(20);
  });
});

describe('Sprint 21 — audit:font-sizes (CI guard)', () => {
  it('passes against current src/style.css', () => {
    let output = '';
    let exitCode = 0;
    try {
      output = execSync(`node ${AUDIT_TOOL}`, { encoding: 'utf8' });
    } catch (e) {
      output = (e.stdout || '') + (e.stderr || '');
      exitCode = e.status || 1;
    }
    expect(exitCode, `audit:font-sizes exit code\n${output}`).toBe(0);
    expect(output).toContain('PASS');
  });

  it('flags a hardcoded text-scale value (smoke test the detector)', () => {
    // Write a temp CSS with a forbidden hardcoded value, confirm exit=1
    const tmp = path.join(ROOT, '.tmp-audit-font-sizes-test.css');
    const css = `
      :root { --fc-font-size: 18px; }
      body { font-size: var(--fc-font-size); }
      .bad { font-size: 0.9em; }
    `;
    fs.writeFileSync(tmp, css, 'utf8');
    let output = '';
    let exitCode = 0;
    try {
      output = execSync(`node ${AUDIT_TOOL} ${tmp}`, { encoding: 'utf8' });
    } catch (e) {
      output = (e.stdout || '') + (e.stderr || '');
      exitCode = e.status || 1;
    } finally {
      fs.unlinkSync(tmp);
    }
    expect(exitCode, 'should exit 1 on hardcoded text-scale value').toBe(1);
    expect(output).toContain('FAIL');
    expect(output).toContain('0.9em');
  });

  it('allows display sizes (em ≥ 1.7)', () => {
    // Write a temp CSS with a large em (display territory), confirm pass
    const tmp = path.join(ROOT, '.tmp-audit-font-sizes-test.css');
    const css = `
      :root { --fc-font-size: 18px; }
      body { font-size: var(--fc-font-size); }
      .icon { font-size: 3em; }
      .deco { font-size: 80px; }
    `;
    fs.writeFileSync(tmp, css, 'utf8');
    let output = '';
    let exitCode = 0;
    try {
      output = execSync(`node ${AUDIT_TOOL} ${tmp}`, { encoding: 'utf8' });
    } catch (e) {
      output = (e.stdout || '') + (e.stderr || '');
      exitCode = e.status || 1;
    } finally {
      fs.unlinkSync(tmp);
    }
    expect(exitCode, 'should exit 0 on display-only file').toBe(0);
    expect(output).toContain('PASS');
  });
});

describe('Sprint 21 — Typography integration (smoke)', () => {
  it('global h2 uses --fs-xl token', () => {
    // h1 hero intentionally stays as display (1.8em) — that's allowed.
    // h2/h3 should snap to scale. Match the bare selector rule.
    const css = readCSS();
    const h2 = css.match(/^h2\s*\{([^}]+)\}/m);
    expect(h2, 'global h2 rule should exist').toBeTruthy();
    expect(h2[1]).toMatch(/var\(--fs-xl\)/);
  });

  it('global h3 uses --fs-lg token', () => {
    const css = readCSS();
    const h3 = css.match(/^h3\s*\{([^}]+)\}/m);
    expect(h3, 'global h3 rule should exist').toBeTruthy();
    expect(h3[1]).toMatch(/var\(--fs-lg\)/);
  });

  it('body uses --fc-font-size root (preserves SEN scaling)', () => {
    const css = readCSS();
    const body = css.match(/^body\s*\{([^}]+)\}/m);
    expect(body, 'body rule should exist').toBeTruthy();
    expect(body[1]).toMatch(/font-size:\s*var\(--fc-font-size\)/);
  });
});