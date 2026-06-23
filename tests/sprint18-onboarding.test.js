// tests/sprint18-onboarding.test.js
// Sprint 18 P1 — Verify Onboarding component:
//   1. Renders 3 slides with required structure
//   2. Carousel state machine (next / skip / finish)
//   3. fc_onboarding_done flag set/cleared correctly
//   4. Re-trigger from settings
//   5. needsOnboarding() correctly reads localStorage

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');

// Mock localStorage for Node test env (smoke.test.js does the same —
// tests run in node, no DOM). Using in-memory store.
const _memStore = {};
globalThis.localStorage = {
  getItem: (k) => Object.prototype.hasOwnProperty.call(_memStore, k) ? _memStore[k] : null,
  setItem: (k, v) => { _memStore[k] = String(v); },
  removeItem: (k) => { delete _memStore[k]; },
  clear: () => { for (const k in _memStore) delete _memStore[k]; },
  key: (i) => Object.keys(_memStore)[i] ?? null,
  get length() { return Object.keys(_memStore).length; },
};

beforeEach(() => {
  // Clean localStorage between tests
  try { localStorage.clear(); } catch {}
});

afterEach(() => {
  vi.resetModules();
});

describe('Sprint 18 — Onboarding (P1)', () => {
  it('exports renderOnboarding + 3 slide count', async () => {
    const mod = await import('../src/components/Onboarding.js');
    expect(typeof mod.renderOnboarding).toBe('function');
    expect(mod.ONBOARDING_SLIDE_COUNT).toBe(3);
  });

  it('renderOnboarding returns valid HTML with required regions', async () => {
    const mod = await import('../src/components/Onboarding.js');
    const html = mod.renderOnboarding();
    // 必要 region
    expect(html).toContain('onboarding-wrap');
    expect(html).toContain('onboarding-step');
    expect(html).toContain('onboarding-dots');
    expect(html).toContain('onboarding-actions');
    // 3 個 dot
    const dotCount = (html.match(/class="dot[^"]*"/g) || []).length;
    expect(dotCount).toBe(3);
    // CTA / skip button
    expect(html).toContain('onboardingNext');
    expect(html).toContain('onboardingSkip');
  });

  it('CTA label changes on last slide', async () => {
    const mod = await import('../src/components/Onboarding.js');
    const html1 = mod.renderOnboarding();
    expect(html1).toContain('下一頁');
    // 推 2 步 (slides 0→1→2)
    mod.onboardingNext();  // 0→1
    mod.onboardingNext();  // 1→2 (last)
    const htmlLast = mod.renderOnboarding();
    expect(htmlLast).toContain('開始啦');
  });

  it('onboardingNext advances step OR returns -1 on last', async () => {
    const mod = await import('../src/components/Onboarding.js');
    const r0 = mod.onboardingNext();
    expect(r0).toBe(1);  // 0→1
    const r1 = mod.onboardingNext();
    expect(r1).toBe(2);  // 1→2
    const r2 = mod.onboardingNext();
    expect(r2).toBe(-1); // finishOnboarding + return -1
  });

  it('onboardingSkip immediately marks done (returns -1)', async () => {
    const mod = await import('../src/components/Onboarding.js');
    const r = mod.onboardingSkip();
    expect(r).toBe(-1);
    expect(mod.needsOnboarding()).toBe(false);
  });

  it('needsOnboarding() returns true when no flag, false when set', async () => {
    const mod = await import('../src/components/Onboarding.js');
    expect(mod.needsOnboarding()).toBe(true);
    mod.finishOnboarding();
    expect(mod.needsOnboarding()).toBe(false);
  });

  it('resetOnboarding() resets step counter but does NOT clear done flag', async () => {
    const mod = await import('../src/components/Onboarding.js');
    mod.finishOnboarding();
    mod.resetOnboarding();
    // 仍係 done (reset 唔改 flag — caller 要 clear flag 自行 remove)
    expect(mod.needsOnboarding()).toBe(false);
  });

  it('_renderSlideForTest exposes individual slide HTML for inline use', async () => {
    const mod = await import('../src/components/Onboarding.js');
    const slide1 = mod._renderSlideForTest(0);
    expect(slide1).toContain('揀你嘅選擇');
    const slide2 = mod._renderSlideForTest(1);
    expect(slide2).toContain('聆聽題目');
    const slide3 = mod._renderSlideForTest(2);
    expect(slide3).toContain('停一停');
    // Out of bounds → empty
    expect(mod._renderSlideForTest(99)).toBe('');
    expect(mod._renderSlideForTest(-1)).toBe('');
  });

  it('fc_onboarding_done storage key registered', () => {
    const storageSrc = fs.readFileSync(
      path.join(ROOT, 'src', 'storage.js'), 'utf8'
    );
    expect(storageSrc).toContain('ONBOARDING_DONE');
    expect(storageSrc).toContain('fc_onboarding_done');
  });

  it('main.js boot logic uses needsOnboarding() to pick initial view', () => {
    const mainSrc = fs.readFileSync(
      path.join(ROOT, 'src', 'main.js'), 'utf8'
    );
    expect(mainSrc).toMatch(/view:\s*\(.*needsOnboarding\(\).*\?.*'onboarding'.*'role-select'.*\)/s);
  });

  it('VIEWS registry includes onboarding factory', () => {
    const mainSrc = fs.readFileSync(
      path.join(ROOT, 'src', 'main.js'), 'utf8'
    );
    expect(mainSrc).toMatch(/'onboarding':\s*\(\)\s*=>/);
  });

  it('render() switch has onboarding case', () => {
    const mainSrc = fs.readFileSync(
      path.join(ROOT, 'src', 'main.js'), 'utf8'
    );
    expect(mainSrc).toMatch(/case\s+'onboarding':\s+html\s*=\s*renderOnboarding\(\)/);
  });

  it('replayOnboarding action registered in actions table', () => {
    const inlineSrc = fs.readFileSync(
      path.join(ROOT, 'src', 'actions', 'inline.js'), 'utf8'
    );
    expect(inlineSrc).toContain('replayOnboarding');
    expect(inlineSrc).toContain('_resetOnboarding');
  });

  it('settings page exposes 重看教學 button', () => {
    const engineSrc = fs.readFileSync(
      path.join(ROOT, 'src', 'engine.js'), 'utf8'
    );
    expect(engineSrc).toContain('重看教學');
    expect(engineSrc).toContain('replayOnboarding');
  });
});
