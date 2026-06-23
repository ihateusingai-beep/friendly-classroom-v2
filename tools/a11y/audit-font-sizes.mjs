#!/usr/bin/env node
// tools/a11y/audit-font-sizes.mjs
//
// Sprint 21: 靜態 CSS audit — flag any text-scale font-size that's hardcoded
// instead of using the --fs-* typography tokens. Display sizes (emoji/icon
// >2em, decorative 80px, etc.) intentionally stay inline.
//
// Why static: 唔需要 dev server, 跑得快 (sub-second), 入 CI 唔慢。
// Caveat: 唔追 inline `style="..."` 喺 JS templates, 唔追 <style> block 入面
//         嘅 dynamic value. Text scale 集中喺 src/style.css 就夠覆蓋。
//
// Scale (resolved @ 18px root):
//   --fs-xs   ≈12px  --fs-sm   ≈14px  --fs-base ≈16px
//   --fs-md   =18px  --fs-lg   ≈22px  --fs-xl   ≈28px
//
// Display allowlist (intentional, not text scale):
//   em values ≥ 1.7em (emoji/icon, h1 hero, decorative)
//   px values other than 14/15/16/18px
//
// Exit codes:
//   0  no violations
//   1  one or more text-scale font-size values not using --fs-* tokens
//
// Usage:
//   node tools/a11y/audit-font-sizes.mjs [path/to/style.css]
//   npm run audit:font-sizes  (alias)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const REPO_ROOT  = path.resolve(__dirname, '..', '..');

const CSS_PATH = process.argv[2] || path.join(REPO_ROOT, 'src', 'style.css');

// Token allowlist
const TEXT_TOKENS = new Set([
  'var(--fs-xs)',
  'var(--fs-sm)',
  'var(--fs-base)',
  'var(--fs-md)',
  'var(--fs-lg)',
  'var(--fs-xl)',
]);

// Root font-size (driven by SEN font-size slider) — also acceptable
const ROOT_TOKENS = new Set([
  'var(--fc-font-size)',
  'inherit',
  'unset',
  'initial',
]);

// Display sizes allowed inline (em values for emoji/icon + rare px)
// em ≥ 1.7em = display territory (h1 hero, emoji icons, decorative)
// px: any non-text-scale px is display (80px star, 18px root var def)
function isDisplaySize(value) {
  const trimmed = value.trim();
  // em-based display
  const emMatch = trimmed.match(/^([\d.]+)em$/);
  if (emMatch) {
    const em = parseFloat(emMatch[1]);
    return em >= 1.7;
  }
  // px-based display (only 18px is text-scale — but that's only the
  // --fc-font-size root var def itself; px text values like 14/15/16 are
  // not allowed since they should snap to fs-sm / fs-base)
  const pxMatch = trimmed.match(/^([\d.]+)px$/);
  if (pxMatch) {
    const px = parseFloat(pxMatch[1]);
    // 18px = --fc-font-size root (intentional, single definition)
    // anything else = display (80px decorative star, etc.)
    return px !== 14 && px !== 15 && px !== 16;
  }
  return false;
}

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

// crude line-number lookup: count newlines up to char offset
function lineOf(text, charOffset) {
  let line = 1;
  for (let i = 0; i < charOffset && i < text.length; i++) {
    if (text[i] === '\n') line++;
  }
  return line;
}

// ── 2. Extract font-size declarations ──────────────────────────────────────
// Skip CSS variable definitions like `--fc-font-size: 18px`
function extractFontSizes(body) {
  const decls = [];
  // Match `font-size: <value>;` where the property is NOT preceded by `--`
  // Negative lookbehind via: ensure match isn't `--font-size`
  const re = /(?<![-\w])font-size\s*:\s*([^;}]+)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const value = m[1].trim();
    decls.push({ value, offset: m.index });
  }
  return decls;
}

// ── 3. Classify a value ────────────────────────────────────────────────────
function classify(value) {
  if (TEXT_TOKENS.has(value)) return 'token';
  if (ROOT_TOKENS.has(value)) return 'root';
  if (isDisplaySize(value))   return 'display';
  return 'violation';
}

// ── 4. Main ────────────────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(CSS_PATH)) {
    console.error(`[audit-font-sizes] CSS not found: ${CSS_PATH}`);
    process.exit(2);
  }
  const css = fs.readFileSync(CSS_PATH, 'utf8');
  const rules = parseCSS(css);

  console.log(`[audit-font-sizes] scanning ${CSS_PATH}`);
  console.log(`[audit-font-sizes] text tokens: ${TEXT_TOKENS.size} | display allowlist: em ≥ 1.7, px non-14/15/16\n`);

  const violations = [];
  let tokenCount = 0, rootCount = 0, displayCount = 0;

  for (const rule of rules) {
    const decls = extractFontSizes(rule.body);
    for (const { value } of decls) {
      const kind = classify(value);
      if (kind === 'token')      tokenCount++;
      else if (kind === 'root')  rootCount++;
      else if (kind === 'display') displayCount++;
      else {
        violations.push({
          selector: rule.selector,
          line:     rule.line,
          value,
        });
      }
    }
  }

  console.log(`  tokens:   ${tokenCount} (--fs-* references)`);
  console.log(`  root:     ${rootCount} (--fc-font-size, inherit)`);
  console.log(`  display:  ${displayCount} (emoji/icon, intentional)`);
  console.log();

  if (violations.length > 0) {
    console.error(`[audit-font-sizes] FAIL: ${violations.length} hardcoded text-scale value(s)`);
    for (const v of violations) {
      console.error(`    - [line ${v.line}] ${v.selector} → font-size: ${v.value}`);
      console.error(`        ↳ should be one of: ${[...TEXT_TOKENS].join(', ')}`);
    }
    console.error(`\n  If this is intentional display, use em ≥ 1.7 or a non-14/15/16 px value.`);
    process.exit(1);
  } else {
    console.log(`[audit-font-sizes] PASS: ${tokenCount} token reference(s), ${displayCount} display allowlist(s)`);
    process.exit(0);
  }
}

main();