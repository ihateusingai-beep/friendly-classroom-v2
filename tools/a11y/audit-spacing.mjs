#!/usr/bin/env node
// tools/a11y/audit-spacing.mjs
//
// Sprint 22: 靜態 CSS audit — flag raw px spacing values in
// padding/margin/gap/inset declarations that should use --space-* tokens.
//
// Why static: 唔需要 dev server, 跑得快 (sub-second), 入 CI 唔慢。
// Caveat: 唔追 inline `style="..."` 喺 JS templates, 唔追 min/max-width 嘅 px 值。
//
// Spacing scale (Sprint 22):
//   --space-1: 4px    --space-2: 8px    --space-3: 12px   --space-4: 16px
//   --space-5: 20px   --space-6: 24px   --space-7: 32px   --space-8: 48px
//
// Spacing allowlist (not in scale, intentional):
//   px values other than 4/6/8/10/12/14/16/18/20/24/28/32/48
//   (e.g. 40px, 60px, 80px — display / large hero / decorative)
//
// Exit codes:
//   0  no violations
//   1  one or more raw px spacing values not using --space-* tokens
//
// Usage:
//   node tools/a11y/audit-spacing.mjs [path/to/style.css]
//   npm run audit:spacing  (alias)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const REPO_ROOT  = path.resolve(__dirname, '..', '..');

const CSS_PATH = process.argv[2] || path.join(REPO_ROOT, 'src', 'style.css');

// Spacing scale (px values that should be tokenized)
const SCALE_PX = new Set(['4px', '6px', '8px', '10px', '12px', '14px', '16px',
                          '18px', '20px', '24px', '28px', '32px', '48px']);

// CSS properties that hold spacing values
const SPACING_PROPS = [
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin',  'margin-top',  'margin-right',  'margin-bottom',  'margin-left',
  'gap',     'row-gap',     'column-gap',
  'top',     'right',       'bottom',       'left',           'inset',
];

// ── 1. Parse CSS into rules ────────────────────────────────────────────────
function parseCSS(text) {
  const noComments = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [];
  const re = /([^{}]+)\{([^{}]+)\}/g;
  let m;
  while ((m = re.exec(noComments)) !== null) {
    const selectorRaw = m[1].trim();
    const body = m[2];
    const selectors = selectorRaw.split(',').map(s => s.trim()).filter(Boolean);
    for (const sel of selectors) {
      rules.push({ selector: sel, body, line: lineOf(text, m.index) });
    }
  }
  return rules;
}

function lineOf(text, charOffset) {
  let line = 1;
  for (let i = 0; i < charOffset && i < text.length; i++) {
    if (text[i] === '\n') line++;
  }
  return line;
}

// ── 2. Extract spacing declarations ────────────────────────────────────────
function extractSpacingDecls(body) {
  const decls = [];
  // Match `prop: value;` where prop is a spacing property
  const re = new RegExp(
    `^(\\s*)(${SPACING_PROPS.join('|')})\\s*:\\s*([^;]+);`,
    'gm'
  );
  let m;
  while ((m = re.exec(body)) !== null) {
    decls.push({ prop: m[2].trim(), value: m[3].trim() });
  }
  return decls;
}

// ── 3. Find raw px values that should be tokens ───────────────────────────
function findViolations(decls) {
  const violations = [];
  for (const { prop, value } of decls) {
    // Skip if entire value is `var(...)` (e.g. `padding: var(--space-3)`)
    if (/^var\(/.test(value)) continue;

    // Check each px token in the value
    const tokens = value.split(/\s+/);
    for (const tok of tokens) {
      if (SCALE_PX.has(tok)) {
        violations.push({ prop, value, raw: tok });
      }
    }
  }
  return violations;
}

// ── 4. Main ────────────────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(CSS_PATH)) {
    console.error(`[audit-spacing] CSS not found: ${CSS_PATH}`);
    process.exit(2);
  }
  const css = fs.readFileSync(CSS_PATH, 'utf8');
  const rules = parseCSS(css);

  console.log(`[audit-spacing] scanning ${CSS_PATH}`);
  console.log(`[audit-spacing] scale: 4/6/8/10/12/14/16/18/20/24/28/32/48 px → 8 --space-* tokens`);
  console.log(`[audit-spacing] allowlist: px values outside scale (display / hero)\n`);

  let declarationsScanned = 0;
  const violations = [];

  for (const rule of rules) {
    const decls = extractSpacingDecls(rule.body);
    declarationsScanned += decls.length;
    const v = findViolations(decls);
    for (const vi of v) {
      violations.push({
        selector: rule.selector,
        line:     rule.line,
        prop:     vi.prop,
        value:    vi.value,
        raw:      vi.raw,
      });
    }
  }

  console.log(`  declarations scanned: ${declarationsScanned}`);
  console.log();

  if (violations.length > 0) {
    console.error(`[audit-spacing] FAIL: ${violations.length} raw px spacing value(s)`);
    for (const v of violations) {
      console.error(`    - [line ${v.line}] ${v.selector} → ${v.prop}: ${v.value}`);
      console.error(`        ↳ "${v.raw}" should use var(--space-*) token`);
    }
    console.error(`\n  If this is intentional display, use a px value outside the 4-48 scale.`);
    process.exit(1);
  } else {
    console.log(`[audit-spacing] PASS: ${declarationsScanned} spacing declaration(s), all tokenized`);
    process.exit(0);
  }
}

main();