// tools/migrate/scenarios_v2.mjs
// Sprint 17 — Generalized migration tool: convert colloquial Cantonese → 書面語
// across all 17 scenario topics + add stopAndThink field for negative options.
//
// Replaces tools/migrate/empathy_v2.mjs (Sprint 16, hardcoded empathy).
//
// Strategy:
//   1. Multi-char colloquial → 書面語 mappings (safer, applied first)
//   2. Single-char patterns with regex + context (verbs, judgement, location)
//   3. Auto-derive stopAndThink field for negative options from effects comments
//
// Usage:
//   node tools/migrate/scenarios_v2.mjs <topic>          # Migrate single topic
//   node tools/migrate/scenarios_v2.mjs <topic> --dry-run
//   node tools/migrate/scenarios_v2.mjs --all            # Migrate all 17 topics
//   node tools/migrate/scenarios_v2.mjs --all --dry-run
//
// NOTE: This is a one-time batch migration. Future scenarios MUST be written
// in 書面語 from the start (per STYLE_GUIDE_V3.md). Re-running on already-
// migrated content is idempotent (mappings are case-stable).

import fs from 'node:fs';
import path from 'node:path';

const SCENARIOS_DIR = path.resolve('data/scenarios');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const ALL_FLAG = args.includes('--all');
const positional = args.filter(a => !a.startsWith('--'));

if (!ALL_FLAG && positional.length === 0) {
  console.error('Usage:');
  console.error('  node tools/migrate/scenarios_v2.mjs <topic>');
  console.error('  node tools/migrate/scenarios_v2.mjs --all');
  console.error('Add --dry-run to preview changes.');
  process.exit(2);
}

const topics = ALL_FLAG
  ? fs.readdirSync(SCENARIOS_DIR)
      .filter(f => f.endsWith('.json') && !f.includes('.bak'))
      .map(f => f.replace('.json', ''))
  : positional;

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
  ['邊度', '哪裡'],   ['幾多', '多少'], ['琴日', '昨天'], ['聽日', '明天'],
  // Sprint 17 additions
  ['咁寸', '這麼過分'], ['咁曳', '這麼頑皮'], ['咁衰', '這麼壞'],
  ['寸過', '過分'], ['咁多', '這麼多'], ['咁少', '這麼少'],
  ['咁大', '這麼大'], ['咁細', '這麼小'], ['咁好', '這麼好'],
  ['咁快', '這麼快'], ['咁慢', '這麼慢'], ['咁遠', '這麼遠'],
  ['咁近', '這麼近'], ['咁耐', '這麼久'], ['咁高', '這麼高'],
  ['咁低', '這麼低'], ['咁重', '這麼重'], ['咁長', '這麼長'],
  ['咁短', '這麼短'], ['咁新', '這麼新'], ['咁舊', '這麼舊'],
  ['咁難', '這麼難'], ['咁易', '這麼容易'], ['咁叻', '這麼棒'],
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
  // Sprint 17 additions — must be BEFORE generic 唔 → 不 mapping in SINGLE_PATTERNS
  ['唔洗', '不用'], ['唔使', '不必'],
  ['唔單止', '不單止'], ['唔止', '不只'], ['唔過', '不過'],
  // Pre-existing typo (Cantonese-influenced 不洗 for 不用)
  ['不洗', '不用'], ['不使', '不必'],
  ['冇問題', '沒問題'], ['冇所謂', '無所謂'], ['冇錯', '沒錯'],
  ['冇用', '沒用'], ['冇得', '沒得'], ['冇事', '沒事'],
  ['唔好睇', '不要看'], ['唔好笑', '不要笑'], ['唔好喊', '不要哭'],
  ['唔好嘈', '不要吵'], ['唔好走', '不要走'],
  ['咩嚟', '什麼來'], ['咩啊', '什麼啊'], ['咩呀', '什麼呀'],
  ['咩嘢', '什麼東西'], ['咩事', '什麼事'],
  // Dialog attribution 話 → 說
  ['話：「', '說：「'], ['話:「', '說:「'], ['話:"', '說:"'],
];

// Regex-based single-char patterns (with context for safety)
const SINGLE_PATTERNS = [
  // 嘅 → 的
  // Sprint 17: extend to closing brackets (e.g. 《基本法》嘅圖書 → 的)
  [/([一-鿿])嘅(?=[一-鿿，。！？\s)\]）」』《》])/g, '$1的'],
  [/([一-鿿])嘅$/g, '$1的'],
  // Closing brackets + 嘅 (when 嘅 wasn't preceded by CJK)
  [/[」』）]嘅/g, '的'],
  [/[《》]嘅/g, '的'],
  // 嘅 → 的 — followed by ASCII (e.g. 係真嘅LEGO → 真的LEGO)
  [/([一-鿿])嘅(?=[a-zA-Z0-9])/g, '$1的'],
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
  // 咗 → 了 (Sprint 17: extend to ASCII boundary for cases like `miss 咗`, `pre-warn 咗`)
  [/([一-鿿])咗([一-鿿])/g, '$1了$2'],
  [/([食飲睇諗話走攞畀做喊笑打聽傾扶化變和錯嬲覺教])咗/g, '$1了'],
  [/([一-鿿])咗嘅/g, '$1了的'],
  [/([一-鿿])咗([，。！？\s)\]）」』])/g, '$1了$2'],
  // ASCII before 咗 (e.g. `miss 咗`, `pre-warn 咗`)
  [/\s咗/g, ' 了'],
  [/[a-zA-Z]咗/g, '$1了'],
  // 嚟 → 來
  [/([返過])嚟/g, '$1來'],
  [/嚟([一-鿿])/g, '來$1'],
  [/嚟([，。！？\s)\]）」』])/g, '來$1'],
  [/嚟$/g, '來'],
  // 佢 → 他 (extend to ASCII/punctuation boundary)
  [/佢([一-鿿])/g, '他$1'],
  [/佢$/g, '他'],
  [/佢([，。！？\s)\]）」』])/g, '他$1'],
  [/佢([「『])/g, '他$1'],
  [/佢([\+\-])/g, '他$1'],
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
  // 話 → 說 (dialog attribution + verb) — SKIP compound nouns like 廣東話, 大話
  // Sprint 17: handle ASCII boundary (e.g. 小傑話sorry → 小傑說sorry)
  // Compound noun whitelist: 說話, 廣東話, 白話, 官話, 對話, 空話, 實話, 大話, 講大話, 講話
  [/([一-鿿])話([「『])/g, '$1說$2'],
  [/話([「『])/g, '說$1'],
  // Skip 話 in 講大話, 大話, 講話, etc. (compound nouns)
  [/([一-鿿])話([一-鿿])/g, (match, p1, p2) => {
    const compounds = ['大話', '講話', '說話', '廣東話', '白話', '官話', '對話', '空話', '實話', '真心話', '心底話', '感謝的話', '電話'];
    if (compounds.some(c => match.includes(c))) return match;
    return p1 + '說' + p2;
  }],
  [/^話([一-鿿])/g, '說$1'],
  [/([一-鿿])話([a-zA-Z])/g, '$1說$2'],
  // 啦 → remove (sentence-final modal particle)
  // Sprint 17: handle ASCII boundary (e.g. +啦其他)
  [/啦([。，！？\s)\]）」』])/g, '$1'],
  [/啦$/g, ''],
  [/([一-鿿])啦([。，！？\s)\]）」』])/g, '$1$2'],
  [/([一-鿿])啦$/g, '$1'],
  [/啦([\+])/g, '$1'],
  // 啦 → remove between CJK chars (e.g. 畫晒啦你們)
  [/([一-鿿])啦([一-鿿])/g, '$1$2'],
  // 啦 → remove before ASCII dots
  [/([一-鿿])啦(?=[.…])/g, '$1'],
  [/啦(?=[.…]+)/g, ''],
  // 衰 → 壞 (Sprint 17: handle mid-sentence ga etc)
  [/衰/g, '壞'],
  // 野 → 東西 (variant of 嘢 used in some scenarios)
  [/野/g, '東西'],
  // 鍾意 → 喜歡
  [/鍾意/g, '喜歡'],
  // ga → remove (Cantonese particle)
  [/ga/g, ''],
  // 嘢 → 東西 (Sprint 17: extend to general verb/noun patterns + 的嘢 fallback)
  [/做嘢/g, '做事'],
  [/唔做嘢/g, '不做事'],
  [/咁嘅嘢/g, '這樣的事情'],
  [/呢啲嘢/g, '這些東西'],
  [/嗰啲嘢/g, '那些東西'],
  [/咩嘢/g, '什麼東西'],
  [/嘅嘢(?=[，。！？\s)\]）」』])/g, '的事情'],
  [/嘅嘢$/g, '的事情'],
  // Already-migrated 的嘢 → 的事情 (fallback after 嘅→的)
  [/的嘢/g, '的事情'],
  // General verb + 嘢
  [/([買送玩學收攞])嘢/g, '$1東西'],
  [/玩自己嘅嘢/g, '玩自己的東西'],
  [/([一-鿿])嘢$/g, '$1東西'],
  [/([一-鿿])嘢([。，！？\s)\]）」』])/g, '$1東西$2'],
  // General 嘢 → 東西 (fallback, after all compound mappings)
  [/([一-鿿])嘢(?=[一-鿿])/g, '$1東西'],
  [/^嘢/g, '東西'],
  // 講嘢 → 說話 (compound verb)
  [/講嘢/g, '說話'],
  // 食 → 吃 (Sprint 17: general verb + end-of-string + punctuation boundary)
  [/([一-鿿])食([一-鿿飯完菜])/g, '$1吃$2'],
  [/([一-鿿])食([。，！？\s)\]）」』])/g, '$1吃$2'],
  [/^食([一-鿿])/g, '吃$1'],
  [/食([一-鿿])/g, '吃$1'],
  [/([一-鿿])食$/g, '$1吃'],
  [/食$/g, '吃'],
  // 飲 → 喝 (Sprint 17: general verb + boundary)
  [/([一-鿿])飲([一-鿿])/g, '$1喝$2'],
  [/([一-鿿])飲([。，！？\s)\]）」』])/g, '$1喝$2'],
  [/飲$/g, '喝'],
  // 睇 → 看 (Sprint 17: general verb + boundary)
  [/([一-鿿])睇([一-鿿])/g, '$1看$2'],
  [/^睇([一-鿿])/g, '看$1'],
  [/([一-鿿])睇([。，！？\s)\]）」』])/g, '$1看$2'],
  [/睇$/g, '看'],
  // 畀 → 給 (Sprint 17: general verb + boundary)
  [/([一-鿿])畀([一-鿿])/g, '$1給$2'],
  [/([，。！？\s「『])畀([一-鿿])/g, '$1給$2'],
  // 攞 → 拿 (Sprint 17: general verb "take")
  [/([一-鿿])攞([一-鿿])/g, '$1拿$2'],
  [/^攞([一-鿿])/g, '拿$1'],
  [/([，。！？\s「『])攞([一-鿿])/g, '$1拿$2'],
  [/攞$/g, '拿'],
  // 瞓 → 睡 (Sprint 17: general verb "sleep")
  [/([一-鿿])瞓([一-鿿])/g, '$1睡$2'],
  [/^瞓/g, '睡'],
  [/([，。！？\s「『])瞓/g, '$1睡'],
  [/瞓$/g, '睡'],
  // 諗 → 想 (Sprint 17: handle 「/』 boundary)
  [/([一-鿿])諗([一-鿿])/g, '$1想$2'],
  [/諗([「『])/g, '想$1'],
  // 諗 → 想 standalone (after + or other non-CJK)
  [/[+]諗/g, '+想'],
  // 諗 → 想 at sentence end / punctuation
  [/諗([，。！？\s])/g, '想$1'],
  [/諗$/g, '想'],
  // 咗 → 了 at end of string
  [/([一-鿿])咗$/g, '$1了'],
  [/([一-鿿])咗([，。！？\s)\]）」』])/g, '$1了$2'],
  // 嚟 → 來 at sentence boundary (not just end)
  [/嚟([，。！？\s)…]+)/g, '來$1'],
  // 嘅 → 的 before 「/space
  [/([一-鿿])嘅(?=[「『\s])/g, '$1的'],
  // 嘅 → 的 followed by CJK (no preceding CJK required, e.g. after space)
  [/嘅(?=[一-鿿])/g, '的'],
  // 啲 → 一些 at boundary (adverb/adjective ending)
  [/([一-鿿])啲([。，！？\s)\]）」』])/g, '$1一些$2'],
  // 啲 → 一些 before ASCII dots
  [/([一-鿿])啲(?=[.…]+)/g, '$1一些'],
  // 話 → 說 at end of string (e.g. 不話)
  [/([一-鿿])話$/g, '$1說'],
  // 話 → 說 after punctuation/space (e.g. 話給媽媽)
  [/([，。！？\s「『\(])話([一-鿿])/g, '$1說$2'],
  // 佢 → 他 followed by . or ... or end
  [/佢(?=[.…]+|$|\s)/g, '他'],
  // 佢 → 他 followed by non-alphanumeric (general fallback)
  [/佢(?=[^a-zA-Z0-9])/g, '他'],
  // 嚟 → 來 before ASCII dots (e.g. 謝謝你嚟......)
  [/嚟(?=[.…]+)/g, '來'],
  // 嚟 → 來 before + ASCII
  [/嚟(?=\+)/g, '來'],
  // 攞 → 拿 after + ASCII
  [/[+]攞/g, '+拿'],
  // 攞 → 拿 before + ASCII
  [/攞(?=\+)/g, '拿'],
  // 睇 → 看 after + ASCII
  [/[+]睇/g, '+看'],
  // 睇 → 看 before + ASCII
  [/睇(?=\+)/g, '看'],
  // 睇 → 看 before digit
  [/睇(?=[0-9])/g, '看'],
  // 瞓 → 睡 (general fallback, after compound mappings)
  [/瞓/g, '睡'],
  // 諗 → 想 (general fallback)
  [/諗/g, '想'],
  // 咗 → 了 before digits or + ASCII
  [/([一-鿿])咗(?=[0-9+])/g, '$1了'],
  // 咗 → 了 before ASCII dots
  [/([一-鿿])咗(?=[.…]+)/g, '$1了'],
  // 嘢 → 東西 before ASCII dots/+ digits
  [/([一-鿿])嘢(?=[.…+0-9])/g, '$1東西'],
  // 嘅 → 的 before ASCII (+ space digits)
  [/嘅(?=[+])/g, '的'],
  // 咁 → 這麼 (general fallback before CJK, e.g. 咁緊張 → 這麼緊張)
  // Note: 咁樣 already mapped to 這樣 in pass 1, so safe
  [/咁(?=[一-鿿])/g, '這麼'],
  [/^咁/g, '這麼'],
  // 係 → 是 at sentence start before punctuation
  [/^係([，。！？\s])/g, '是$1'],
  // 係 → 是 inside 「」 quotes before punctuation (e.g. 「係，」 affirmative)
  [/([「『])係([，。！？\s])/g, '$1是$2'],
  // 諗住 → 想著
  [/諗住/g, '想著'],
  // 咩 → 什麼
  [/憑咩/g, '憑什麼'],
  [/咩/g, '什麼'],
  // 既 → 的 (in [Noun/Adj]既[Noun/Adj] pattern)
  [/既([一-鿿])/g, '的$1'],
  // 唔洗 → 不用 / 唔使 → 不必 (moved to MAPPINGS, see top)
  // (no-op here; MAPPINGS first)
  // 仲 → 還 (e.g. 仲咁寸 → 還這麼過分)
  [/仲([一-鿿])/g, '還$1'],
  // 倒 → 到 (e.g. 找不倒 → 找不到)
  [/不倒/g, '不到'],
  // 走埋 → 走近 (Sprint 17: specific case 老師走埋來)
  [/走埋來/g, '走了過來'],
  // 俾 → 給 (Sprint 17: another colloquial 給 verb)
  [/俾([一-鿿])/g, '給$1'],
  // 喎 → remove (sentence-final exclamation particle)
  [/喎/g, ''],
  // 噉 → so/then (Sprint 17: conversational)
  [/噉/g, '這樣'],
  // 咁樣 → 這樣樣 (avoid double replacement)
  // 咁 → 這/那 (specific context)
  // Skip general 咁 replacement — too many false positives
  // 黐 → 黏 (Sprint 17: not seen, skip)
  // 嚟緊 → 即將 (Sprint 17: not seen, skip)
  // 諗嘢 → 想東西
  [/諗嘢/g, '想東西'],
  // 心諗 → 心裡想
  [/心諗/g, '心裡想'],
  // 唔單止 → 不單止 (already 不單 in written form, can stay)
  // 返學 → 回學校 (specific case)
  // Skip — usually acceptable 書面語
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

  // isLoselose: default 雙輸 per SPEC §17.5.3
  const charSet = new Set(option.effects?.map(e => e?.character).filter(Boolean));
  const isLoselose = charSet.size >= 1;

  return {
    badBehavior,
    consequence,
    isLoselose,
  };
}

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
  // Filter out `係` in predicate position: X係Y where Y is CJK
  const filtered = violations.filter(m => {
    if (m !== '係') return true;
    const isPredicate = /係[一-鿿]/.test(text);
    return !isPredicate;
  });
  // Filter out `話` in compound nouns (standard 書面語詞組)
  const ACCEPTED_COMPOUNDS = [
    '說話', '廣東話', '白話', '官話', '對話', '空話', '實話',
    '大話', '講大話', '講話', '感謝的話', '真心話', '心底話', '電話',
  ];
  return filtered.filter(m => {
    if (m !== '話') return true;
    return !ACCEPTED_COMPOUNDS.some(compound => text.includes(compound));
  });
}

// ── Length limits + auto-trim (Sprint 17) ──
const LENGTH_LIMITS = {
  optionText: 30,
  effectsComment: 40,
  badBehavior: 25,
  consequence: 80,
};

function trimToLimit(text, max) {
  if (typeof text !== 'string' || text.length <= max) return text;
  // Strip trailing punctuation/ellipsis first
  let trimmed = text.replace(/[…\.。！!？\?]+$/g, '').trimEnd();
  if (trimmed.length > max) {
    return trimmed.slice(0, max - 1).trimEnd() + '…';
  }
  return trimmed;
}

function migrateTopic(topic) {
  const filePath = path.join(SCENARIOS_DIR, `${topic}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Topic file not found: ${filePath}`);
    return null;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  let totalOptionsMigrated = 0;
  let totalCommentsMigrated = 0;
  let totalStopAndThinkAdded = 0;
  let totalViolationsAfter = 0;
  const remainingViolations = [];

  for (const scenario of data) {
    if (!Array.isArray(scenario.options)) continue;

    for (const option of scenario.options) {
      // Migrate option text
      if (typeof option.text === 'string') {
        const newText = migrate(option.text);
        if (newText !== option.text) {
          option.text = newText;
          totalOptionsMigrated++;
        }
        // Sprint 17: auto-trim over-length option text
        const trimmedText = trimToLimit(option.text, LENGTH_LIMITS.optionText);
        if (trimmedText !== option.text) {
          option.text = trimmedText;
          totalOptionsMigrated++;
        }
        const violations = auditColloquial(option.text);
        if (violations.length) {
          remainingViolations.push({ scenarioId: scenario.id, optionId: option.id, field: 'text', violations, sample: option.text });
          totalViolationsAfter++;
        }
      }

      // Migrate effects comments
      if (Array.isArray(option.effects)) {
        for (const eff of option.effects) {
          if (typeof eff?.comment === 'string') {
            const newComment = migrate(eff.comment);
            if (newComment !== eff.comment) {
              eff.comment = newComment;
              totalCommentsMigrated++;
            }
            // Sprint 17: auto-trim over-length comment
            const trimmedComment = trimToLimit(eff.comment, LENGTH_LIMITS.effectsComment);
            if (trimmedComment !== eff.comment) {
              eff.comment = trimmedComment;
              totalCommentsMigrated++;
            }
            const violations = auditColloquial(eff.comment);
            if (violations.length) {
              remainingViolations.push({ scenarioId: scenario.id, optionId: option.id, field: 'comment', violations, sample: eff.comment });
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
            // Sprint 17: auto-trim stopAndThink fields
            const trimmedVal = trimToLimit(option.stopAndThink[field], LENGTH_LIMITS[field]);
            if (trimmedVal !== option.stopAndThink[field]) {
              option.stopAndThink[field] = trimmedVal;
            }
            const violations = auditColloquial(option.stopAndThink[field]);
            if (violations.length) {
              remainingViolations.push({ scenarioId: scenario.id, optionId: option.id, field: `stopAndThink.${field}`, violations, sample: val });
              totalViolationsAfter++;
            }
          }
        }
      }
    }
  }

  console.log(`\n[${topic}]`);
  console.log(`  Options text migrated:       ${totalOptionsMigrated}`);
  console.log(`  Effects comments migrated:   ${totalCommentsMigrated}`);
  console.log(`  stopAndThink fields added:   ${totalStopAndThinkAdded}`);
  console.log(`  Remaining colloquial markers: ${totalViolationsAfter}`);

  if (!DRY_RUN) {
    // Backup original
    const backupPath = filePath + '.pre-v3.7.bak';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
      console.log(`  Backup: ${path.basename(backupPath)}`);
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`  Written: ${path.basename(filePath)}`);
  } else {
    console.log(`  [DRY RUN] No changes written.`);
  }

  return { topic, totalViolationsAfter, remainingViolations };
}

// ── Main ──
console.log(`Mode: ${ALL_FLAG ? 'all topics' : topics.join(', ')}`);
console.log(`Dry run: ${DRY_RUN}`);

const allResults = [];
for (const topic of topics) {
  const result = migrateTopic(topic);
  if (result) allResults.push(result);
}

console.log('\n=== Overall summary ===');
const totalRemaining = allResults.reduce((s, r) => s + r.totalViolationsAfter, 0);
console.log(`Topics migrated:    ${allResults.length}`);
console.log(`Total violations remaining: ${totalRemaining}`);

if (totalRemaining > 0) {
  console.log('\n=== Violations per topic (need manual review) ===');
  for (const r of allResults.filter(x => x.totalViolationsAfter > 0)) {
    console.log(`\n[${r.topic}] ${r.totalViolationsAfter} violations:`);
    // Print first 10 violations per topic for quick scanning
    for (const v of r.remainingViolations.slice(0, 10)) {
      console.log(`  ${v.scenarioId}/${v.optionId} ${v.field}: ${JSON.stringify(v.violations)} → "${v.sample}"`);
    }
    if (r.remainingViolations.length > 10) {
      console.log(`  ... and ${r.remainingViolations.length - 10} more`);
    }
  }
}
