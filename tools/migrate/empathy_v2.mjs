// tools/migrate/empathy_v2.mjs
// Migrate empathy.json scenarios to 書面語 + add stopAndThink field for negative options.
// Sprint 16 — SPEC §17.10 acceptance criteria.
//
// Strategy:
//   1. Multi-char colloquial → 書面語 mappings (safer, applied first)
//   2. Single-char patterns with regex + context (verbs, judgement, location)
//   3. Auto-derive stopAndThink field for negative options from effects comments
//
// Run: node tools/migrate/empathy_v2.mjs [--dry-run]
//
// NOTE: This is a one-time batch migration. Future scenarios MUST be written
// in 書面語 from the start (per STYLE_GUIDE_V3.md). Re-running on already-
// migrated content is idempotent (mappings are case-stable).

import fs from 'node:fs';
import path from 'node:path';

const FILE = path.resolve('data/scenarios/empathy.json');
const DRY_RUN = process.argv.includes('--dry-run');

// Multi-char mappings (order: longer first to avoid partial matches)
const MAPPINGS = [
  ['同埋', '和'], ['唔好意思', '不好意思'], ['唔好啦', '不要了'],
  ['唔好咁', '不要那樣'], ['唔好亂', '不要亂'], ['唔好隨便', '不要隨便'],
  ['點解啊', '為什麼呢'], ['點解嘅', '為什麼的'], ['點樣啊', '怎樣呢'],
  ['邊個啊', '誰呢'], ['邊個嚟', '誰來'], ['幾多個', '多少個'], ['幾多錢', '多少錢'],
  ['而家先', '現在才'], ['而家就', '現在就'], ['而家唔', '現在不'], ['而家有', '現在有'],
  ['跟住就', '然後就'], ['跟住去', '然後去'], ['跟住返', '然後回'],
  ['跟住先', '然後才'], ['跟住嗰', '然後那'],
  ['你哋嘅', '你們的'], ['你哋嚟', '你們來'], ['你哋話', '你們說'],
  ['佢哋嘅', '他們的'], ['佢哋嚟', '他們來'], ['佢哋話', '他們說'],
  ['呢個係', '這個是'], ['呢個都', '這個都'], ['呢個唔', '這個不'],
  ['呢度嘅', '這裡的'], ['嗰個係', '那個是'], ['嗰個都', '那個都'],
  ['嗰度嘅', '那裡的'],
  ['走開啦', '離開吧'], ['走開啊', '離開啊'],
  ['過咗嚟', '過了來'], ['過咗去', '過了去'],
  ['去咗啦', '去了吧'], ['返嚟啦', '回來吧'], ['返嚟啊', '回來啊'],
  ['攞嚟啦', '拿來吧'], ['攞嚟啊', '拿來啊'],
  ['畀我啦', '給我吧'], ['畀我啊', '給我啊'],
  ['唔好', '不要'], ['點解', '為什麼'], ['點樣', '怎樣'], ['邊個', '誰'],
  ['邊度', '哪裡'], ['幾多', '多少'], ['琴日', '昨天'], ['聽日', '明天'],
  ['今日', '今天'], ['而家', '現在'], ['跟住', '然後'],
  ['你哋', '你們'], ['佢哋', '他們'],
  ['呢個', '這個'], ['嗰個', '那個'],
  ['呢度', '這裡'], ['嗰度', '那裡'],
  ['唔係', '不是'], ['走開', '離開'], ['返嚟', '回來'],
  ['攞嚟', '拿來'], ['畀我', '給我'],
  ['睇下', '看下'], ['睇到', '看到'], ['諗下', '想下'], ['諗到', '想到'],
  ['傾下', '談下'], ['傾偈', '聊天'],
  ['食嘢', '吃東西'], ['飲嘢', '喝東西'], ['瞓覺', '睡覺'],
  ['好啦', '好了'], ['好嘢', '好東西'], ['衰嘢', '壞東西'],
  ['咁樣', '這樣'], ['咁多', '這麼多'], ['咁少', '這麼少'],
  ['咁大', '這麼大'], ['咁細', '這麼小'],
  ['唔該', '請'], ['多謝', '謝謝'], ['對唔住', '對不起'],
  ['冇問題', '沒問題'], ['冇所謂', '無所謂'], ['冇錯', '沒錯'],
  ['冇用', '沒用'], ['冇得', '沒得'], ['冇事', '沒事'],
  ['唔好睇', '不要看'], ['唔好笑', '不要笑'], ['唔好喊', '不要哭'],
  ['唔好嘈', '不要吵'], ['唔好走', '不要走'],
  ['咩嚟', '什麼來'], ['咩啊', '什麼啊'], ['咩呀', '什麼呀'],
  ['咩嘢', '什麼東西'], ['咩事', '什麼事'],
  // Dialog attribution 話 → 說
  ['話：「', '說：「'], ['話:「', '說:「'], ['話:"', '說:"'],
  ['話：「', '說：「'], ['話：「', '說：「'],
  // Common dialog patterns
  ['話：「', '說：「'],
  ['話：「', '說：「'],
];

// Regex-based single-char patterns (with context for safety)
const SINGLE_PATTERNS = [
  // 嘅 → 的
  [/([一-鿿])嘅(?=[一-鿿，。！？\s)\]）」』])/g, '$1的'],
  [/([一-鿿])嘅$/g, '$1的'],
  // 係 → 是 (only as copula between two CJK chars; predicate "係" + noun OK)
  [/([一-鿿])係([一-鿿])/g, '$1是$2'],
  [/([一-鿿])係$/g, '$1是'],
  // 唔 → 不 (after CJK OR after punctuation/space/start)
  [/([一-鿿])唔([一-鿿])/g, '$1不$2'],
  [/([，。！？\s「『\(])唔([一-鿿])/g, '$1不$2'],
  [/^唔([一-鿿])/g, '不$1'],
  // 喺 → 在
  [/喺([一-鿿])/g, '在$1'],
  // 咗 → 了 (extended verb list — include 化/和/變/錯/諗/喊/嬲/做)
  [/([食飲睇諗話走攞畀做喊笑打聽傾扶化變和錯嬲喊覺教])咗/g, '$1了'],
  [/([一-鿿])咗嘅/g, '$1了的'],
  [/([一-鿿])咗([，。！？\s)\]）」』])/g, '$1了$2'],
  // 嚟 → 來
  [/([返過])嚟/g, '$1來'],
  [/嚟([一-鿿])/g, '來$1'],
  [/嚟([，。！？\s)\]）」』])/g, '來$1'],
  [/嚟$/g, '來'],
  // 佢 → 他
  [/佢([一-鿿])/g, '他$1'],
  [/佢$/g, '他'],
  [/佢([，。！？\s)\]）」』])/g, '他$1'],
  // 嗰 → 那
  [/嗰([一-鿿])/g, '那$1'],
  // 啲 → 這些 (general); specific context "快啲" → "比較快"
  [/啲([一-鿿])/g, '這些$1'],
  [/快啲/g, '比較快'],
  [/多啲/g, '多一點'],
  [/少啲/g, '少一點'],
  // 冇 → 沒 / 未
  [/([一-鿿])冇([一-鿿])/g, '$1沒$2'],
  // 搵 → 找
  [/搵唔倒/g, '找不到'],
  [/搵倒/g, '找到'],
  [/搵/g, '找'],
  // 衰 → 壞
  [/太衰/g, '太壞'],
  [/衰人/g, '壞人'],
  [/咁衰/g, '這麼壞'],
  // 話 → 說 (dialog attribution + verb) — SKIP compound nouns like 廣東話
  // Pattern 1: Character + 話 + 「 (dialog attribution)
  [/([一-鿿])話([「『])/g, '$1說$2'],
  // Pattern 2: 話 + 「 (mid-sentence dialog)
  [/話([「『])/g, '說$1'],
  // Pattern 3: 話 + CJK char (verb usage)
  [/([一-鿿])話([一-鿿])/g, '$1說$2'],
  // Pattern 4: 話 + CJK char (sentence start)
  [/^話([一-鿿])/g, '說$1'],
  // 講 → 說 (already covered verb in 講說話)
  // 啦 → remove (sentence-final modal particle)
  [/啦([。，！？\s)\]）」』])/g, '$1'],
  [/啦$/g, ''],
  [/([一-鿿])啦([。，！？\s)\]）」』])/g, '$1$2'],
  [/([一-鿿])啦$/g, '$1'],
  // 嘢 → 東西 (specific compound patterns)
  [/做嘢/g, '做事'],
  [/唔做嘢/g, '不做事'],
  [/咁嘅嘢/g, '這樣的事情'],
  [/呢啲嘢/g, '這些東西'],
  [/嗰啲嘢/g, '那些東西'],
  [/咩嘢/g, '什麼東西'],
  [/嘅嘢(?=[，。！？\s)\]）」』])/g, '的事情'],
  [/嘅嘢$/g, '的事情'],
  // 諗 → 想
  [/([一-鿿])諗([一-鿿])/g, '$1想$2'],
  // 諗下 → 想下 (already in MAPPINGS, ensure)
  // 諗住 → 想著
  [/諗住/g, '想著'],
  // 咩 → 什麼
  [/憑咩/g, '憑什麼'],
  [/咩/g, '什麼'],
  // 既 → 的 (in [Noun/Adj]既[Noun/Adj] pattern)
  [/既([一-鿿])/g, '的$1'],
  // 唔洗 → 不用 / 唔使 → 不必
  [/唔洗/g, '不用'],
  [/唔使/g, '不必'],
  // 仲 → 還 (e.g. 仲咁寸 → 還這麼過分)
  [/仲([一-鿿])/g, '還$1'],
  // 化 → 化解 (specific case 化咗 → 化解了)
  // (already covered by verb list)
  // 倒 → 到 (e.g. 找不倒 → 找不到)
  [/不倒/g, '不到'],
];

function migrate(text) {
  if (typeof text !== 'string' || !text) return text;
  let result = text;
  // Pass 1: Multi-char
  for (const [old, neu] of MAPPINGS) {
    if (result.includes(old)) result = result.split(old).join(neu);
  }
  // Pass 2: Single-char regex
  for (const [pattern, replacement] of SINGLE_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ── Auto-derive stopAndThink from option ──
function deriveStopAndThink(option) {
  const totalMoral = option.effects?.reduce(
    (sum, e) => sum + (typeof e?.moralChange === 'number' ? e.moralChange : 0), 0
  ) || 0;
  if (totalMoral >= 0) return null; // positive — skip

  // Aggregate comment (first effect with comment)
  const firstComment = option.effects?.find(e => e?.comment)?.comment || '';
  const targetChar = option.effects?.find(e => e?.character)?.character || '對方';

  // badBehavior: derive from option text
  // Strip 「」 quotes, capitalize first char
  let badBehavior = option.text.replace(/[「」『』]/g, '').trim();
  if (badBehavior.length > 25) {
    badBehavior = badBehavior.slice(0, 24).trimEnd() + '…';
  }

  // consequence: use first comment, trim length
  let consequence = firstComment
    .replace(/[。！？…]+$/, '')
    .trim();
  if (consequence.length > 80) {
    consequence = consequence.slice(0, 79).trimEnd() + '…';
  }

  // isLoselose: if multiple characters affected, likely loselose
  const charSet = new Set(option.effects?.map(e => e?.character).filter(Boolean));
  const isLoselose = charSet.size >= 1; // Default: 雙輸 (matches SPEC §17.5.3 default)

  return {
    badBehavior,
    consequence,
    isLoselose,
  };
}

// ── Main ──
const raw = fs.readFileSync(FILE, 'utf8');
const data = JSON.parse(raw);

let totalOptionsMigrated = 0;
let totalCommentsMigrated = 0;
let totalStopAndThinkAdded = 0;
let totalViolationsAfter = 0;

const COLLOQUIAL_MARKERS = [
  '你哋', '佢', '佢哋', '係', '唔係', '嘅', '喺', '唔', '咗', '嚟',
  '邊個', '咩', '點解', '點樣', '而家', '今日', '聽日', '啲', '嗰',
  '呢個', '嗰個', '睇', '諗', '話', '走開', '攞', '畀', '同埋',
  '好啦', '啦', '喎', '嘢', '嘅話', '食', '飲', '瞓',
  '邊度', '幾多', '琴日', '先前', '跟住', '不過', '搵', '衰',
];

function auditColloquial(text) {
  if (typeof text !== 'string') return [];
  const violations = COLLOQUIAL_MARKERS.filter(m => text.includes(m));
  // Filter out `係` in predicate position: X係Y where X is CJK and Y is CJK
  // (e.g. 「係同理心」「係不負責任的表現」) — valid 書面語 predicate copula
  // Note: Modern trend uses `是`, but `係` in predicate position is acceptable
  // formal written Chinese. SPEC §17.2.3 next freeze v3.8 should formalize.
  const filtered = violations.filter(m => {
    if (m !== '係') return true;
    const isPredicate = /係[一-鿿]/.test(text);
    return !isPredicate;
  });
  // Filter out `話` in compound nouns (standard 書面語詞組).
  // e.g. 「說話」、「廣東話」、「白話」、「官話」 — 全部 standard written form.
  // SPEC §17.2.3 next freeze v3.8 should add these to whitelist.
  const ACCEPTED_COMPOUNDS = ['說話', '廣東話', '白話', '官話', '對話', '空話', '實話'];
  return filtered.filter(m => {
    if (m !== '話') return true;
    return !ACCEPTED_COMPOUNDS.some(compound => text.includes(compound));
  });
}

for (const scenario of data) {
  if (!Array.isArray(scenario.options)) continue;

  for (const option of scenario.options) {
    // Migrate option text (scope: only this field)
    if (typeof option.text === 'string') {
      const newText = migrate(option.text);
      if (newText !== option.text) {
        option.text = newText;
        totalOptionsMigrated++;
      }
      const violations = auditColloquial(option.text);
      if (violations.length) {
        console.warn(`[WARN] ${scenario.id}/${option.id} text still has markers:`, violations, '→', option.text);
        totalViolationsAfter++;
      }
    }

    // Migrate effects comments (scope: only this field)
    if (Array.isArray(option.effects)) {
      for (const eff of option.effects) {
        if (typeof eff?.comment === 'string') {
          const newComment = migrate(eff.comment);
          if (newComment !== eff.comment) {
            eff.comment = newComment;
            totalCommentsMigrated++;
          }
          const violations = auditColloquial(eff.comment);
          if (violations.length) {
            console.warn(`[WARN] ${scenario.id}/${option.id} comment still has markers:`, violations, '→', eff.comment);
            totalViolationsAfter++;
          }
        }
      }
    }

    // Add stopAndThink for negative options
    if (!option.stopAndThink) {
      const st = deriveStopAndThink(option);
      if (st) {
        option.stopAndThink = st;
        totalStopAndThinkAdded++;
      }
    }

    // Audit stopAndThink fields
    if (option.stopAndThink) {
      for (const field of ['badBehavior', 'consequence']) {
        const val = option.stopAndThink[field];
        if (typeof val === 'string') {
          const newVal = migrate(val);
          if (newVal !== val) option.stopAndThink[field] = newVal;
          const violations = auditColloquial(option.stopAndThink[field]);
          if (violations.length) {
            console.warn(`[WARN] ${scenario.id}/${option.id} stopAndThink.${field} still has markers:`, violations, '→', option.stopAndThink[field]);
            totalViolationsAfter++;
          }
        }
      }
    }
  }
}

console.log('\n=== Migration summary ===');
console.log(`Options text migrated:       ${totalOptionsMigrated}`);
console.log(`Effects comments migrated:   ${totalCommentsMigrated}`);
console.log(`stopAndThink fields added:   ${totalStopAndThinkAdded}`);
console.log(`Remaining colloquial markers: ${totalViolationsAfter} (need manual review)`);

if (!DRY_RUN) {
  // Backup original
  const backupPath = FILE + '.pre-v3.7.bak';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(FILE, backupPath);
    console.log(`\nBackup: ${backupPath}`);
  }
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Migrated: ${FILE}`);
} else {
  console.log('\n[DRY RUN] No changes written.');
}
