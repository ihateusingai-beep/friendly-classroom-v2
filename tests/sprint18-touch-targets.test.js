// tests/sprint18-touch-targets.test.js
// Sprint 18 P0 — Verify TTS / voice / read button sizes meet WCAG 2.5.5
// (≥ 44×44 CSS pixels). The audit-touch-targets.mjs tool enforces the
// same rule on the full CSS — this test focuses on the highest-impact
// "user actually taps this" buttons.

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(__dirname, '..');
const CSS_PATH = path.join(ROOT, 'src', 'style.css');
const AUDIT_TOOL = path.join(ROOT, 'tools', 'a11y', 'audit-touch-targets.mjs');

function readCSS() { return fs.readFileSync(CSS_PATH, 'utf8'); }

function extractPx(cssBlock, prop) {
  const re = new RegExp(`${prop}\\s*:\\s*([\\d.]+)px`);
  const m = cssBlock.match(re);
  return m ? parseFloat(m[1]) : null;
}

function findRule(css, selector) {
  // match a single selector rule body. 唔追 comma-separated variants.
  const re = new RegExp(`\\${selector}\\s*\\{([^}]+)\\}`);
  const m = css.match(re);
  return m ? m[1] : null;
}

function findContextRule(css, context, sel) {
  // match "<context> <sel> { ... }"
  const re = new RegExp(`${context.replace(/\./g, '\\.')}\\s+${sel.replace(/\./g, '\\.')}\\s*\\{([^}]+)\\}`);
  const m = css.match(re);
  return m ? m[1] : null;
}

describe('Sprint 18 — Touch target sizes (WCAG 2.5.5 ≥ 44×44)', () => {
  const css = readCSS();

  it('opt-read (option card 朗讀 button) ≥ 44×44', () => {
    const body = findContextRule(css, '.option-card', '.opt-read');
    expect(body, '.option-card .opt-read rule should exist').toBeTruthy();
    const w = extractPx(body, 'width') ?? extractPx(body, 'min-width');
    const h = extractPx(body, 'height') ?? extractPx(body, 'min-height');
    expect(w, 'opt-read width').toBeGreaterThanOrEqual(44);
    expect(h, 'opt-read height').toBeGreaterThanOrEqual(44);
  });

  it('scenario-desc voice button ≥ 44×44', () => {
    const body = findContextRule(css, '.scenario-desc', '.inline-voice-btn');
    expect(body).toBeTruthy();
    const w = extractPx(body, 'width') ?? extractPx(body, 'min-width');
    const h = extractPx(body, 'height') ?? extractPx(body, 'min-height');
    expect(w).toBeGreaterThanOrEqual(44);
    expect(h).toBeGreaterThanOrEqual(44);
  });

  it('voice-btn-row (result screen TTS buttons) ≥ 44px tall', () => {
    const body = findContextRule(css, '.voice-btn-row', '.inline-voice-btn');
    expect(body).toBeTruthy();
    const h = extractPx(body, 'min-height');
    // Result screen buttons rely on padding + min-height (text-based).
    // 44px 觸控目標 minimum.
    expect(h, 'voice-btn-row min-height').toBeGreaterThanOrEqual(44);
  });

  it('voice-fab (floating action button) ≥ 44×44', () => {
    const body = findRule(css, '.voice-fab');
    expect(body).toBeTruthy();
    const w = extractPx(body, 'width') ?? extractPx(body, 'min-width');
    const h = extractPx(body, 'height') ?? extractPx(body, 'min-height');
    expect(w).toBeGreaterThanOrEqual(44);
    expect(h).toBeGreaterThanOrEqual(44);
  });

  it('onboarding-cta (primary CTA) ≥ 44px tall', () => {
    const body = findRule(css, '.onboarding-cta');
    expect(body).toBeTruthy();
    const h = extractPx(body, 'min-height');
    expect(h, 'onboarding-cta min-height').toBeGreaterThanOrEqual(44);
  });

  it('audit:touch-targets passes (CI guard)', () => {
    // If this fails, somebody added a new TTS button or shrank an existing
    // one below 44px. Fix the CSS, do not silence the test.
    let output = '';
    let exitCode = 0;
    try {
      output = execSync(`node ${AUDIT_TOOL}`, { encoding: 'utf8' });
    } catch (e) {
      output = (e.stdout || '') + (e.stderr || '');
      exitCode = e.status || 1;
    }
    expect(exitCode, `audit:touch-targets exit code\n${output}`).toBe(0);
    expect(output).toContain('PASS');
  });
});
