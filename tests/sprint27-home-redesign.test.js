// tests/sprint27-home-redesign.test.js
// Sprint 27 U1 + D1 — Verify home page structural changes (U1) and warm
// theme token swap (D1) without breaking the existing data-action guard
// (data-action="resumeLast" + data-action="dismissResume" must be
// registered in actions/inline.js) or the legacy fallback path.

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

const STYLE_CSS = readFileSync(join(ROOT, 'src', 'style.css'), 'utf8');
const ENGINE_JS = readFileSync(join(ROOT, 'src', 'engine.js'), 'utf8');
const INLINE_ACTIONS_JS = readFileSync(join(ROOT, 'src', 'actions', 'inline.js'), 'utf8');
const ACTIONS_INDEX_JS = readFileSync(join(ROOT, 'src', 'actions', 'index.js'), 'utf8');
const PACKAGE_JSON = readFileSync(join(ROOT, 'package.json'), 'utf8');

// Mock localStorage for the small subset of tests that import from src/.
const _memStore = {};
globalThis.localStorage = {
  getItem: (k) => _memStore[k] ?? null,
  setItem: (k, v) => { _memStore[k] = String(v); },
  removeItem: (k) => { delete _memStore[k]; },
  clear: () => { for (const k in _memStore) delete _memStore[k]; },
  key: (i) => Object.keys(_memStore)[i] ?? null,
  get length() { return Object.keys(_memStore).length; },
};

beforeEach(() => {
  for (const k in _memStore) delete _memStore[k];
});

// =====================================================================
// U1: Home page single-column redesign — structural tests
// =====================================================================

describe('Sprint 27 U1 — renderHome() structural changes', () => {
  it('uses isFeatureEnabled("HOME_REDESIGN") to gate the redesign branch', () => {
    expect(ENGINE_JS).toMatch(/isFeatureEnabled\(['"]HOME_REDESIGN['"]\)/);
  });

  it('wraps the topic grid in a <details> element when redesign is on', () => {
    expect(ENGINE_JS).toContain('<details class="home-topics-disclosure"');
  });

  it('uses <summary> with chevron + emoji for the disclosure header', () => {
    expect(ENGINE_JS).toContain('<summary class="home-topics-summary">');
    expect(ENGINE_JS).toContain('home-topics-summary-chev');
    expect(ENGINE_JS).toContain('home-topics-summary-emoji');
  });

  it('keeps the legacy topic-section block as fallback', () => {
    // When flag is OFF, the original `<div class="topic-section">` is still used
    expect(ENGINE_JS).toMatch(/<div class="topic-section">/);
  });

  it('keeps the 4-tab filter row (just at narrower prominence)', () => {
    expect(ENGINE_JS).toContain('home-filter-row');
    expect(ENGINE_JS).toContain('setHomeFilter');
  });

  it('reduces footer to 3 quick actions when redesign is on', () => {
    // Footer must mention 'progress', 'settings', 'hub' but NOT 'switchStudent'
    // inside the redesign branch
    const footerRedesignMatch = ENGINE_JS.match(/useRedesign \? `[\s\S]*?home-footer-grid[\s\S]*?` : `[\s\S]*?`;/);
    expect(footerRedesignMatch).toBeTruthy();
    if (footerRedesignMatch) {
      const redesignBranch = footerRedesignMatch[0];
      expect(redesignBranch).toContain('progress');
      expect(redesignBranch).toContain('settings');
      expect(redesignBranch).toContain('hub');
      // Note: the legacy branch below should still have switchStudent
    }
  });

  it('keeps switchStudent in the page header right button', () => {
    // The header rightButton always renders switchStudent (it moves from
    // footer to header in U1, never disappears)
    expect(ENGINE_JS).toMatch(/headerRightButtonHtml[\s\S]*?switchStudent/);
  });

  it('preserves teacher hint text "💡 老師可撳" for accessibility', () => {
    expect(ENGINE_JS).toContain('💡 老師可撳');
  });
});

// =====================================================================
// U1: <details> ARIA + accessibility
// =====================================================================

describe('Sprint 27 U1 — <details> ARIA semantics', () => {
  it('uses <summary> which natively handles aria-expanded + keyboard', () => {
    // <details>/<summary> is a native disclosure widget; no extra ARIA needed.
    // Verify the HTML uses semantic markup (not <div role="button"> etc.)
    const disclosureHtml = ENGINE_JS.match(/<details class="home-topics-disclosure"[\s\S]*?<\/details>/);
    expect(disclosureHtml).toBeTruthy();
    expect(disclosureHtml[0]).toContain('<summary');
    expect(disclosureHtml[0]).toContain('role="list"'); // topic-grid is a list
  });

  it('CSS handles chevron rotation on [open]', () => {
    expect(STYLE_CSS).toContain('.home-topics-disclosure[open] .home-topics-summary-chev');
    expect(STYLE_CSS).toContain('rotate(180deg)');
  });

  it('summary uses 48px min-height (WCAG 2.5.5 touch target)', () => {
    expect(STYLE_CSS).toMatch(/\.home-topics-summary\s*\{[^}]*min-height:\s*48px/);
  });
});

// =====================================================================
// U1: data-action-guard compatibility (resumeLast + dismissResume registered)
// =====================================================================

describe('Sprint 27 U1 — data-action-guard compatibility', () => {
  it('resumeLast is wired in actions/inline.js', () => {
    expect(INLINE_ACTIONS_JS).toContain('resumeLast()');
  });

  it('dismissResume is wired in actions/inline.js', () => {
    expect(INLINE_ACTIONS_JS).toContain('dismissResume()');
  });

  it('renderHome uses data-action="resumeLast" + data-action="dismissResume"', () => {
    expect(ENGINE_JS).toContain('data-action="resumeLast"');
    expect(ENGINE_JS).toContain('data-action="dismissResume"');
  });

  it('data-action="resumeLast" is reachable through getInlineActions factory', () => {
    // Sanity: the inline-actions fragment is the only registry for these
    // new actions (no double-registration in actions/index.js)
    expect(ACTIONS_INDEX_JS).toContain('getInlineActions');
    // resumeLast + dismissResume should NOT be hardcoded in actions/index.js
    // (they're inside the inline.js return object only)
    const indexJsBody = ACTIONS_INDEX_JS.match(/Object\.assign\(actions,\s*\{([\s\S]*?)\}\);/);
    expect(indexJsBody).toBeTruthy();
    if (indexJsBody) {
      expect(indexJsBody[1]).not.toMatch(/resumeLast/);
      expect(indexJsBody[1]).not.toMatch(/dismissResume/);
    }
  });
});

// =====================================================================
// U3: Resume banner is in renderHome but gated by flag
// =====================================================================

describe('Sprint 27 U3 — resume banner in renderHome', () => {
  it('gates banner render on isFeatureEnabled("RESUME_BANNER")', () => {
    expect(ENGINE_JS).toMatch(/isFeatureEnabled\(['"]RESUME_BANNER['"]\)/);
  });

  it('imports getResumeCandidate + formatRelativePlayed from domain/Resume.js', () => {
    expect(ENGINE_JS).toContain("from './domain/Resume.js'");
    expect(ENGINE_JS).toContain('getResumeCandidate');
    expect(ENGINE_JS).toContain('formatRelativePlayed');
  });

  it('uses class="home-resume-banner" + aria-label for accessibility', () => {
    expect(ENGINE_JS).toContain('class="home-resume-banner"');
    expect(ENGINE_JS).toMatch(/home-resume-banner[\s\S]*?aria-label/);
  });

  it('uses escapeAttr() on all user-controlled strings in banner', () => {
    // title (scenario.title) + relative (formatRelativePlayed) must both be escaped
    const bannerMatch = ENGINE_JS.match(/home-resume-banner[\s\S]*?<\/div>/);
    expect(bannerMatch).toBeTruthy();
    const bannerHtml = bannerMatch[0];
    // We expect at least 2 escapeAttr() calls inside the banner (title + aria-label + maybe relative)
    const escapeCalls = bannerHtml.match(/escapeAttr\(/g) || [];
    expect(escapeCalls.length).toBeGreaterThanOrEqual(2);
  });
});

// =====================================================================
// D1: Warm theme token swap
// =====================================================================

describe('Sprint 27 D1 — warm theme tokens', () => {
  it('defines :root[data-warm-theme="true"] override block', () => {
    expect(STYLE_CSS).toMatch(/:root\[data-warm-theme="true"\]\s*\{/);
  });

  it('overrides --color-primary to emerald (#10B981)', () => {
    const block = STYLE_CSS.match(/:root\[data-warm-theme="true"\]\s*\{([\s\S]*?)\n\}/);
    expect(block).toBeTruthy();
    expect(block[1]).toContain('--color-primary:        #10B981');
  });

  it('overrides background to warm cream (#FAF7F2)', () => {
    const block = STYLE_CSS.match(/:root\[data-warm-theme="true"\]\s*\{([\s\S]*?)\n\}/);
    expect(block[1]).toContain('--bg:                   #FAF7F2');
  });

  it('overrides --color-success / --color-danger / --color-warning', () => {
    const block = STYLE_CSS.match(/:root\[data-warm-theme="true"\]\s*\{([\s\S]*?)\n\}/);
    expect(block[1]).toContain('--color-success:        #059669');
    expect(block[1]).toContain('--color-danger:         #F87171');
    expect(block[1]).toContain('--color-warning:        #D97706');
  });

  it('audio.js applyCSS() toggles data-warm-theme attribute on <html>', () => {
    const audioSrc = readFileSync(join(ROOT, 'src', 'audio.js'), 'utf8');
    expect(audioSrc).toContain("setAttribute('data-warm-theme'");
    expect(audioSrc).toContain("removeAttribute('data-warm-theme'");
  });

  it('audio.js applyCSS() honors FLAGS.WARM_THEME (default OFF)', () => {
    const audioSrc = readFileSync(join(ROOT, 'src', 'audio.js'), 'utf8');
    expect(audioSrc).toContain("isFeatureEnabled('WARM_THEME')");
  });

  it('preserves NT-D purple in default :root (no override when flag OFF)', () => {
    // The default :root still has the original NT-D purple
    expect(STYLE_CSS).toContain('--color-primary:        #7C3AED;');
  });
});

// =====================================================================
// Cross-cutting: package.json version bump
// =====================================================================

describe('Sprint 27 — package.json version bump', () => {
  it('version is 2.11.0', () => {
    const pkg = JSON.parse(PACKAGE_JSON);
    expect(pkg.version).toBe('2.11.0');
  });
});
