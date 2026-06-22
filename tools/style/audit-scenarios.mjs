// tools/style/audit-scenarios.mjs
// Sprint 16 — CI audit script for STYLE_GUIDE_V3.md compliance.
// SPEC §17.8 testing requirements (style audit CI):
//   - 掃 17 個 scenario JSON file
//   - 對齊 §4 blacklist (colloquial markers) + §3.1 length rules
//   - 出現 violation → process.exit(1)
//
// Scope (per SPEC §17.1):
//   - options[].text
//   - options[].effects[].comment
//   - options[].stopAndThink.{badBehavior, consequence}
//
// Out of scope:
//   - scenario.description / title (破壞 image prompt 對齊)
//   - creeds.js text (EDB 官方 wording)
//   - settings / toast / banner text
//
// Usage:
//   node tools/style/audit-scenarios.mjs           # Audit all 17 topics
//   node tools/style/audit-scenarios.mjs empathy   # Audit one topic
//   node tools/style/audit-scenarios.mjs --json    # JSON output for CI

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const SCENARIOS_DIR = path.join(ROOT, 'data/scenarios');

const args = process.argv.slice(2);
const JSON_OUTPUT = args.includes('--json');
const targetTopic = args.find(a => !a.startsWith('--'));

// Re-implement audit logic here (avoid coupling to Feedback.js — Node ESM
// import paths would need .js extension which conflicts with project alias).
// Keep in sync with src/domain/Feedback.js:auditScenarioText + auditLength + auditScenario.

const COLLOQUIAL_MARKERS = [
  '你哋', '佢', '佢哋', '嘅', '喺', '唔', '咗', '嚟',
  '邊個', '咩', '點解', '點樣', '而家', '今日', '聽日', '啲', '嗰',
  '呢個', '嗰個', '睇', '諗', '話', '走開', '攞', '畀', '同埋',
  '好啦', '啦', '喎', '嘢', '嘅話', '食', '飲', '瞓',
  '邊度', '幾多', '琴日', '先前', '跟住', '不過', '搵',
];

const ACCEPTED_COMPOUNDS = [
  '說話', '廣東話', '白話', '官話', '對話', '空話', '實話',
  // Sprint 17 additions — standard written compound nouns
  '大話', '講大話', '講話', '感謝的話', '真心話', '心底話', '電話',
];

const LENGTH_LIMITS = {
  optionText: 30,
  effectsComment: 40,
  badBehavior: 25,
  consequence: 80,
};

function auditText(text) {
  if (typeof text !== 'string' || !text) return [];
  const violations = [];
  for (const marker of COLLOQUIAL_MARKERS) {
    if (text.includes(marker)) {
      // Exception: 係 in predicate position (X係Y where Y is CJK)
      if (marker === '係' && /係[一-鿿]/.test(text)) continue;
      // Exception: 話 in standard compound noun
      if (marker === '話' && ACCEPTED_COMPOUNDS.some(c => text.includes(c))) continue;
      violations.push(marker);
    }
  }
  return violations;
}

function auditLen(text, field) {
  const max = LENGTH_LIMITS[field];
  if (typeof max !== 'number') return null;
  const length = typeof text === 'string' ? text.length : 0;
  return length > max ? { length, max } : null;
}

function auditOption(option, scenarioId, optionId, errors) {
  // option.text
  if (typeof option.text === 'string') {
    const v = auditText(option.text);
    if (v.length) errors.push({ scenarioId, optionId, field: 'optionText', kind: 'colloquial', markers: v });
    const len = auditLen(option.text, 'optionText');
    if (len) errors.push({ scenarioId, optionId, field: 'optionText', kind: 'length', length: len.length, max: len.max });
  }

  // option.effects[].comment
  if (Array.isArray(option.effects)) {
    option.effects.forEach((eff, i) => {
      if (typeof eff?.comment === 'string') {
        const v = auditText(eff.comment);
        if (v.length) errors.push({ scenarioId, optionId, field: `effects[${i}].comment`, kind: 'colloquial', markers: v });
        const len = auditLen(eff.comment, 'effectsComment');
        if (len) errors.push({ scenarioId, optionId, field: `effects[${i}].comment`, kind: 'length', length: len.length, max: len.max });
      }
    });
  }

  // option.stopAndThink
  if (option.stopAndThink) {
    for (const field of ['badBehavior', 'consequence']) {
      const val = option.stopAndThink[field];
      if (typeof val === 'string') {
        const v = auditText(val);
        if (v.length) errors.push({ scenarioId, optionId, field: `stopAndThink.${field}`, kind: 'colloquial', markers: v });
        const len = auditLen(val, field);
        if (len) errors.push({ scenarioId, optionId, field: `stopAndThink.${field}`, kind: 'length', length: len.length, max: len.max });
      }
    }
  }
}

// ── Main ──
const files = fs.existsSync(SCENARIOS_DIR)
  ? fs.readdirSync(SCENARIOS_DIR).filter(f => f.endsWith('.json'))
  : [];

let targetFiles;
if (targetTopic) {
  const match = files.find(f => f.replace('.json', '') === targetTopic);
  if (!match) {
    console.error(`Topic "${targetTopic}" not found in ${SCENARIOS_DIR}`);
    process.exit(2);
  }
  targetFiles = [match];
} else {
  targetFiles = files;
}

const errors = [];
let totalOptions = 0;
let totalScenarios = 0;

for (const file of targetFiles) {
  const filePath = path.join(SCENARIOS_DIR, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`JSON parse error in ${file}: ${e.message}`);
    process.exit(2);
  }

  for (const scenario of data) {
    totalScenarios++;
    if (!Array.isArray(scenario.options)) continue;
    for (const option of scenario.options) {
      totalOptions++;
      auditOption(option, scenario.id, option.id, errors);
    }
  }
}

if (JSON_OUTPUT) {
  console.log(JSON.stringify({
    files: targetFiles,
    totalScenarios,
    totalOptions,
    errors,
    ok: errors.length === 0,
  }, null, 2));
} else {
  console.log(`\n=== Style audit ===`);
  console.log(`Files audited:    ${targetFiles.length}`);
  console.log(`Scenarios:        ${totalScenarios}`);
  console.log(`Options audited:  ${totalOptions}`);
  console.log(`Violations:       ${errors.length}`);
  console.log();

  if (errors.length) {
    console.error(`❌ ${errors.length} violation(s) found:\n`);
    for (const e of errors) {
      const detail = e.kind === 'colloquial'
        ? `markers=${JSON.stringify(e.markers)}`
        : `length=${e.length}>${e.max}`;
      console.error(`  ${e.scenarioId}/${e.optionId} ${e.field} (${e.kind}): ${detail}`);
    }
    console.log(`\n見 docs/STYLE_GUIDE_V3.md §4 blacklist + §3.1 length rules`);
    process.exit(1);
  }

  console.log('✅ All scenarios pass style audit.');
}
