// tests/sprint22-spacing.test.js
// Sprint 22 — Verify spacing scale + semantic color tokens are defined
// and that no hardcoded scale px values remain in CSS spacing contexts.

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(__dirname, '..');
const CSS_PATH = path.join(ROOT, 'src', 'style.css');
const AUDIT_TOOL = path.join(ROOT, 'tools', 'a11y', 'audit-spacing.mjs');

function readCSS() { return fs.readFileSync(CSS_PATH, 'utf8'); }

function findRoot(css) {
  const m = css.match(/:root\s*\{([\s\S]+?)\}/);
  return m ? m[1] : null;
}

function getTokenValue(root, tokenName) {
  const re = new RegExp(`${tokenName}\\s*:\\s*([^;]+)`);
  const m = root.match(re);
  return m ? m[1].trim() : null;
}

// Required spacing tokens (Sprint 22 §21)
const REQUIRED_SPACING = {
  '--space-1': '4px',
  '--space-2': '8px',
  '--space-3': '12px',
  '--space-4': '16px',
  '--space-5': '20px',
  '--space-6': '24px',
  '--space-7': '32px',
};

// Required semantic color tokens (Sprint 22 §21)
const REQUIRED_COLORS = {
  '--color-primary':       '#7C3AED',
  '--color-primary-bg':    '#F3E8FF',
  '--color-secondary':     '#4A90D9',
  '--color-secondary-bg':  '#DBEAFE',
  '--color-success':       '#16A34A',
  '--color-success-bg':    '#DCFCE7',
  '--color-warning':       '#F59E0B',
  '--color-warning-bg':    '#FEF3C7',
  '--color-danger':        '#DC2626',
  '--color-danger-bg':     '#FEE2E2',
  '--color-info':          '#0EA5E9',
  '--color-focus':         '#FFFF00',
};

describe('Sprint 22 — Spacing scale tokens', () => {
  const css = readCSS();
  const root = findRoot(css);

  it(':root block exists', () => {
    expect(root, ':root must exist').toBeTruthy();
  });

  for (const [token, expectedValue] of Object.entries(REQUIRED_SPACING)) {
    it(`${token} defined as ${expectedValue}`, () => {
      expect(root, `:root must define ${token}`).toBeTruthy();
      const v = getTokenValue(root, token);
      expect(v, `${token} value`).toBe(expectedValue);
    });
  }
});

describe('Sprint 22 — Semantic color tokens', () => {
  const css = readCSS();
  const root = findRoot(css);

  for (const [token, expectedValue] of Object.entries(REQUIRED_COLORS)) {
    it(`${token} defined as ${expectedValue}`, () => {
      expect(root, `:root must define ${token}`).toBeTruthy();
      const v = getTokenValue(root, token);
      expect(v, `${token} value`).toBe(expectedValue);
    });
  }

  it('--fc-font-size (SEN root) preserved across sprints', () => {
    expect(root).toBeTruthy();
    expect(getTokenValue(root, '--fc-font-size')).toBe('18px');
  });
});

describe('Sprint 22 — Token usage in CSS', () => {
  it('all 7 spacing tokens are referenced', () => {
    const css = readCSS();
    for (const token of Object.keys(REQUIRED_SPACING)) {
      const re = new RegExp(`var\\(${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
      const usages = css.match(re) || [];
      expect(usages.length, `${token} defined + used at least twice`).toBeGreaterThan(1);
    }
  });

  it('--space-4 (16px standard) is heavily used', () => {
    const css = readCSS();
    const usages = (css.match(/var\(--space-4\)/g) || []).length;
    // 16px is the most common padding value
    expect(usages, '--space-4 usage count').toBeGreaterThan(20);
  });

  it('all 13 color tokens are referenced', () => {
    const css = readCSS();
    for (const token of Object.keys(REQUIRED_COLORS)) {
      const re = new RegExp(`var\\(${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
      const usages = css.match(re) || [];
      expect(usages.length, `${token} defined + used at least twice`).toBeGreaterThan(1);
    }
  });

  it('--color-primary is the most-used color (NT-D brand)', () => {
    const css = readCSS();
    const usages = (css.match(/var\(--color-primary\)/g) || []).length;
    expect(usages, '--color-primary usage count').toBeGreaterThan(10);
  });
});

describe('Sprint 22 — audit:spacing (CI guard)', () => {
  it('passes against current src/style.css', () => {
    let output = '';
    let exitCode = 0;
    try {
      output = execSync(`node ${AUDIT_TOOL}`, { encoding: 'utf8' });
    } catch (e) {
      output = (e.stdout || '') + (e.stderr || '');
      exitCode = e.status || 1;
    }
    expect(exitCode, `audit:spacing exit code\n${output}`).toBe(0);
    expect(output).toContain('PASS');
  });

  it('flags a raw px spacing value (smoke test the detector)', () => {
    const tmp = path.join(ROOT, '.tmp-audit-spacing-test.css');
    const css = `
      :root { --fc-font-size: 18px; --space-4: 16px; }
      .bad { padding: 12px; }
      .ok  { padding: var(--space-3); }
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
    expect(exitCode, 'should exit 1 on raw px spacing').toBe(1);
    expect(output).toContain('FAIL');
    expect(output).toContain('12px');
  });

  it('allows display px values outside the spacing scale', () => {
    const tmp = path.join(ROOT, '.tmp-audit-spacing-test.css');
    const css = `
      :root { --fc-font-size: 18px; }
      .hero { padding: 60px; margin: 80px 0; }
      .border { border: 1px solid; }
      .gap-40 { gap: 40px; }
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

describe('Sprint 22 — Sprint 21 typography tokens intact', () => {
  it('--fs-xs/sm/base/md/lg/xl all still defined (no regression)', () => {
    const css = readCSS();
    const root = findRoot(css);
    expect(getTokenValue(root, '--fs-xs')).toBe('0.6667em');
    expect(getTokenValue(root, '--fs-sm')).toBe('0.7778em');
    expect(getTokenValue(root, '--fs-base')).toBe('0.8889em');
    expect(getTokenValue(root, '--fs-md')).toBe('1em');
    expect(getTokenValue(root, '--fs-lg')).toBe('1.2222em');
    expect(getTokenValue(root, '--fs-xl')).toBe('1.5556em');
  });
});