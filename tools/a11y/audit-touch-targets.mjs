#!/usr/bin/env node
// tools/a11y/audit-touch-targets.mjs
//
// Sprint 18 P2: 靜態 CSS audit — flag any TTS / voice / read button
// that's smaller than the WCAG 2.5.5 minimum (44×44 CSS pixels).
//
// Why static: 唔需要 dev server, 跑得快 (sub-second), 入 CI 唔慢。
// Caveat: 唔追 inline `style="..."` 屬性, 唔追 media-query 縮減。
//         對 SEN 學生嚟講, 44px 係 "declared minimum" — 縮 screen
//         嘅 fallback 由 individual component 自行決定。
//
// Exit codes:
//   0  no violations
//   1  one or more buttons < 44px in EITHER width or height
//
// Usage:
//   node tools/a11y/audit-touch-targets.mjs [path/to/style.css]
//   npm run audit:touch-targets  (alias)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const REPO_ROOT  = path.resolve(__dirname, '..', '..');

const CSS_PATH = process.argv[2] || path.join(REPO_ROOT, 'src', 'style.css');
const MIN_TARGET = 44;  // WCAG 2.5.5 (Level AAA, commonly referenced)

// Selectors we audit. Each entry: { class, contexts }.
// `contexts` are extra ancestor selectors (e.g. .voice-btn-row) that we
// also check, because .inline-voice-btn has no base size — its size
// comes from its parent context.
const TARGETS = [
  { class: 'opt-read',             contexts: ['.option-card'] },
  { class: 'inline-voice-btn',     contexts: ['.scenario-desc', '.voice-btn-row'] },
  { class: 'voice-fab',            contexts: [] },
  // Onboarding buttons (P1)
  { class: 'onboarding-cta',       contexts: [] },
  { class: 'mock-voice-btn',       contexts: [] },
  { class: 'mock-voice-pill',      contexts: [] },
];

// ── 1. Parse CSS into rules ────────────────────────────────────────────────
// Strip /* … */ comments first, then split on { … } blocks.
function parseCSS(text) {
  const noComments = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [];
  const re = /([^{}]+)\{([^{}]+)\}/g;
  let m;
  while ((m = re.exec(noComments)) !== null) {
    const selectorRaw = m[1].trim();
    const body = m[2];
    // 拆多 selector (`,` 分隔) — 每個獨立處理
    const selectors = selectorRaw.split(',').map(s => s.trim()).filter(Boolean);
    for (const sel of selectors) {
      rules.push({ selector: sel, body });
    }
  }
  return rules;
}

// ── 2. Extract px sizes from a rule body ───────────────────────────────────
function extractSize(body) {
  // 揀 width / height / min-width / min-height; 取最大嘅
  // (如果 min 冇, 用 explicit; 如果 explicit 冇, 用 min)
  const get = (prop) => {
    const m = body.match(new RegExp(`${prop}\\s*:\\s*([\\d.]+)px`));
    return m ? parseFloat(m[1]) : null;
  };
  const w  = get('width')  ?? get('min-width');
  const h  = get('height') ?? get('min-height');
  // Onboarding mock-voice-pill 用 padding 配 font-size,冇 width 冇 height
  // 用 min-height ≥ 44 + padding-x ≥ 12 替代 detection
  const padding = body.match(/padding\\s*:\\s*[^;]+/)?.[0] || '';
  const paddingY = parseFloat(padding.match(/\\d+px\\s+\\d+px\\s+(\\d+)/)?.[1] ?? '0');
  const minH = get('min-height') ?? 0;
  return { width: w, height: h, minHeight: minH, paddingY };
}

// ── 3. Find selectors matching target classes ────────────────────────────
function audit(rules, className, contexts) {
  const candidates = [
    `.${className}`,                          // bare class
    ...contexts.map(c => `${c} .${className}`), // context + class
  ];
  const found = [];
  for (const rule of rules) {
    for (const cand of candidates) {
      // exact match (no extra selectors after)
      if (rule.selector === cand) {
        const size = extractSize(rule.body);
        found.push({ selector: rule.selector, body: rule.body, ...size });
      }
    }
  }
  return found;
}

// ── 4. Main ────────────────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(CSS_PATH)) {
    console.error(`[audit-touch-targets] CSS not found: ${CSS_PATH}`);
    process.exit(2);
  }
  const css = fs.readFileSync(CSS_PATH, 'utf8');
  const rules = parseCSS(css);

  console.log(`[audit-touch-targets] scanning ${CSS_PATH}`);
  console.log(`[audit-touch-targets] min target: ${MIN_TARGET}×${MIN_TARGET}px (WCAG 2.5.5)\n`);

  const violations = [];
  const passes = [];

  for (const { class: cls, contexts } of TARGETS) {
    const matches = audit(rules, cls, contexts);
    if (matches.length === 0) {
      console.log(`  ⚠️  .${cls} — no matching rules found (check spelling?)`);
      violations.push({ class: cls, reason: 'no-rules' });
      continue;
    }
    for (const m of matches) {
      const w = m.width ?? m.minHeight ?? 0;  // fall back to min-height
      const h = m.height ?? m.minHeight ?? 0;
      const ok = w >= MIN_TARGET && h >= MIN_TARGET;
      if (ok) {
        passes.push({ class: cls, selector: m.selector, w, h });
        console.log(`  ✓ .${cls}  [${m.selector}]  ${w}×${h}px`);
      } else {
        violations.push({ class: cls, selector: m.selector, w, h });
        console.log(`  ✗ .${cls}  [${m.selector}]  ${w}×${h}px  ←  < ${MIN_TARGET}px`);
      }
    }
  }

  console.log();
  if (violations.length > 0) {
    console.error(`[audit-touch-targets] FAIL: ${violations.length} violation(s)`);
    console.error(`  passed: ${passes.length}`);
    console.error(`  failed: ${violations.length}`);
    for (const v of violations) {
      if (v.reason === 'no-rules') {
        console.error(`    - .${v.class}: no rules found in CSS`);
      } else {
        console.error(`    - .${v.class} [${v.selector}]: ${v.w}×${v.h}px (need ≥ ${MIN_TARGET})`);
      }
    }
    process.exit(1);
  } else {
    console.log(`[audit-touch-targets] PASS: ${passes.length} target(s) all ≥ ${MIN_TARGET}×${MIN_TARGET}px`);
    process.exit(0);
  }
}

main();
