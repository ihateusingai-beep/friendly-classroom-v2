// tools/migrate/empathy_v2_overrides.mjs
// Sprint 16 — Manual overrides for remaining 24 colloquial markers after
// automated empathy_v2.mjs migration. Each fix preserves meaning while
// removing banned colloquial markers per STYLE_GUIDE_V3.md.
//
// Categories of fixes:
//   1. `係同理心` → `是同理心` (predicate `係` → `是`, modern written form)
//   2. `唔記得` / `唔洗` etc — `唔` after comma/space (regex limitation)
//   3. `嬲咗` — verb patterns the regex missed
//   4. `廣東話` — compound noun, accepted as standard written form
//      (next SPEC v3.8 freeze should add to blacklist exceptions)
//   5. `啲` standalone in `反正快啲` — measure word
//   6. `做嘢` standalone — `嘢` as noun (not 啲嘢)

import fs from 'node:fs';
import path from 'node:path';

const FILE = path.resolve('data/scenarios/empathy.json');

// Override map: exact string match → replacement
const OVERRIDES = [
  // ── 係 → 是 (predicate position, modern written form) ──
  ['你安慰朋友，係同理心！', '你安慰朋友，是同理心的表現！'],
  ['你深度支持朋友，係同理心高手！', '你深度支持朋友，是同理心高手！'],
  ['你主動幫助，係同理心！', '你主動幫助，是同理心的表現！'],
  ['你全面幫助，係同理心高手！', '你全面幫助，是同理心高手！'],
  ['你安慰+肯定，係同理心！', '你安慰並肯定他，是同理心的表現！'],
  ['你深度支持，係同理心高手！', '你深度支持，是同理心高手！'],
  ['係不負責任既表現', '是不負責任的表現'],
  // ── 唔 after punctuation ──
  ['同學，唔記得帶同未做都是兩件事', '同學，不記得帶和未做是兩件事'],
  ['算，唔洗咁緊張', '算了，不用那麼緊張'],
  // ── 嬲咗 verb pattern ──
  ['小明嬲咗：', '小明生氣地說：'],
  ['大雄嬲咗：', '大雄生氣地說：'],
  // ── 佢 喺 closing dialog ──
  ['扶起佢：「', '扶起他：「'],
  // ── 啲 standalone ──
  ['反正快啲', '反正比較快'],
  // ── 嘢 standalone (verb "做嘢" = "做事") ──
  ['鬧佢：「你做嘢', '責備他：「你做事'],
  ['小琪說：「你做嘢', '小琪說：「你做事'],
  ['你做了啱的嘢', '你做了正確的事'],
  // ── 廣東話 (compound noun, standard written form) ──
  // Keep as-is — note for SPEC v3.8 blacklist exception
  // ['廣東話', '粵語'],  // SKIP: "廣東話" is standard written Chinese
  // ── 走埋 verb pattern ──
  ['老師走埋來', '老師走了過來'],
];

const raw = fs.readFileSync(FILE, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('JSON parse error:', e.message);
  process.exit(1);
}

let totalReplacements = 0;
for (const scenario of data) {
  if (!Array.isArray(scenario.options)) continue;
  for (const option of scenario.options) {
    // Override option text
    if (typeof option.text === 'string') {
      for (const [old, neu] of OVERRIDES) {
        if (option.text === old) {
          option.text = neu;
          totalReplacements++;
        }
      }
    }
    // Override effects comments
    if (Array.isArray(option.effects)) {
      for (const eff of option.effects) {
        if (typeof eff?.comment === 'string') {
          for (const [old, neu] of OVERRIDES) {
            if (eff.comment === old) {
              eff.comment = neu;
              totalReplacements++;
            }
          }
        }
      }
    }
  }
}

console.log(`Overrides applied: ${totalReplacements}`);
fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`Written: ${FILE}`);
