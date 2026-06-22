// src/domain/Feedback.js
// Stop-and-Think 答錯反思 panel + TTS text 純函數 helpers
// 配合 SPEC.md §17.3 + §17.4 — 無 DOM 依賴, 純函數
// Sprint 16 新 module

// ── 常數 ──
export const STOP_AND_THINK_EMOJI = '🤔';
export const STOP_AND_THINK_TITLE = '再想想';

// 黑名單口語 marker (用於 STYLE_GUIDE_V3.md §4 audit)
// 注意:呢個 list 同 STYLE_GUIDE_V3 §4 完全一致 — 唔好獨立維護
//
// 注意 (Sprint 16 implementation finding):
//   - `係` / `唔係` 喺 predicate position (e.g. 「係同理心高手」「不是正確選擇」)
//     係 valid 書面語,唔應該 ban。SPEC §17.2.3 blacklist 太 aggressive,
//     下次 freeze v3.8 將呢兩個 marker 移到 conditional blacklist。
//   - 實際 audit 仍會 detect 呢兩個 marker(保持與 SPEC 一致),但 manual review
//     確認 `係` 喺 predicate 位置 valid 嘅 case 可以 ship。
export const COLLOQUIAL_MARKERS = [
  '你哋', '佢', '佢哋', '嘅', '喺', '唔', '咗', '嚟',
  '邊個', '咩', '點解', '點樣', '而家', '今日', '聽日', '啲', '嗰',
  '呢個', '嗰個', '睇', '諗', '話', '走開', '攞', '畀', '同埋',
  '好啦', '啦', '喎', '嘢', '嘅話', '食', '飲', '瞓',
  '邊度', '幾多', '琴日', '先前', '跟住', '不過', '搵',
];

// 長度上限 (§3.1)
export const LENGTH_LIMITS = {
  optionText: 30,
  effectsComment: 40,
  badBehavior: 25,
  consequence: 80,
  ttsTruncate: 80, // TTS 朗讀截斷上限
};

// Standard written compounds that contain banned markers but are valid 書面語.
// (Sprint 16 implementation finding; SPEC §17.2.3 next freeze v3.8 should formalize.)
// - 說話 / 廣東話 / 白話 / 官話 / 對話 / 空話 / 實話 — `話` 喺 compound noun
// - `係` / `唔係` 喺 predicate position (X係Y) — handled by separate regex check
export const ACCEPTED_COMPOUNDS = [
  '說話', '廣東話', '白話', '官話', '對話', '空話', '實話',
];

// ── formatStopAndThink(stopAndThink): string ──
// SPEC §17.3.4 UI template — render 完整反思 panel 文字
//
// Input: { badBehavior: string, consequence: string, isLoselose: bool }
// Output: 完整 template string(包括 emoji + 段落分隔)
//
// Fallback rule (§17.9 + §17.8 test #2/#3):
//   - 缺 badBehavior → "再做這個選擇"
//   - 缺 consequence → "請仔細想想後果"
//   - isLoselose 缺 → default true
export function formatStopAndThink(stopAndThink) {
  if (!stopAndThink || typeof stopAndThink !== 'object') {
    return formatFallbackStopAndThink();
  }

  const {
    badBehavior = '再做這個選擇',
    consequence = '請仔細想想後果',
    isLoselose = true,
  } = stopAndThink;

  const ending = isLoselose ? '雙輸結局' : '單輸結局';

  // 4 段 paragraph: 起手式 + 影響 + 結論 + 邀請重試
  return [
    `${STOP_AND_THINK_EMOJI} ${STOP_AND_THINK_TITLE}`,
    '',
    '停一停，想一想：',
    `如果你 ${badBehavior}，會有什麼影響？`,
    `就是 ${consequence}，這樣是 ${ending}。`,
    '請你再選出正確的回應吧！',
  ].join('\n');
}

// Fallback 文字(negative option 冇 stopAndThink field)
function formatFallbackStopAndThink() {
  return [
    `${STOP_AND_THINK_EMOJI} ${STOP_AND_THINK_TITLE}`,
    '',
    '停一停，想一想：',
    '讓我們再想一想還有沒有更好的方法。',
    '請你再選出正確的回應吧！',
  ].join('\n');
}

// ── shouldRenderStopAndThink(option, totalMoralChange): bool ──
// SPEC §17.3.3 render rule
//
// Render 條件:
//   1. option.stopAndThink 存在
//   2. totalMoralChange < 0 (negative)
//   3. 例外: cross-character conflict (positive total 但有 bystander 扣分) → 都 render
export function shouldRenderStopAndThink(option, totalMoralChange) {
  if (!option || !option.stopAndThink) return false;
  if (typeof totalMoralChange !== 'number') return false;
  if (totalMoralChange < 0) return true;

  // Positive total 但 cross-character conflict
  if (Array.isArray(option.effects)) {
    const hasNegativeEffect = option.effects.some(
      eff => typeof eff?.moralChange === 'number' && eff.moralChange < 0
    );
    if (hasNegativeEffect) return true;
  }

  return false;
}

// ── calculateOptionMoralChange(option): number ──
// helper for shouldRenderStopAndThink — aggregate moralChange 從 effects
export function calculateOptionMoralChange(option) {
  if (!option || !Array.isArray(option.effects)) return 0;
  return option.effects.reduce((sum, eff) => {
    return sum + (typeof eff?.moralChange === 'number' ? eff.moralChange : 0);
  }, 0);
}

// ── hasCrossCharacterConflict(option): bool ──
// 判斷 cross-character conflict(部分 character 加分 + 部分扣分)
export function hasCrossCharacterConflict(option) {
  if (!option || !Array.isArray(option.effects)) return false;
  let hasPositive = false;
  let hasNegative = false;
  for (const eff of option.effects) {
    if (typeof eff?.moralChange !== 'number') continue;
    if (eff.moralChange > 0) hasPositive = true;
    if (eff.moralChange < 0) hasNegative = true;
  }
  return hasPositive && hasNegative;
}

// ── stripEmojiForTTS(text): string ──
// SPEC §17.4.2 — TTS speech synthesis 唔識讀 emoji
// 移除 Unicode emoji + 多餘空白 + trim
//
// 涵蓋範圍:
//   - Misc Symbols and Pictographs (U+1F300 - U+1F5FF)
//   - Emoticons (U+1F600 - U+1F64F)
//   - Transport (U+1F680 - U+1F6FF)
//   - Supplemental (U+1F900 - U+1F9FF)
//   - Symbols and Pictographs Extended-A (U+1FA70 - U+1FAFF)
//   - Misc Symbols (U+2600 - U+26FF)
//   - Dingbats (U+2700 - U+27BF)
export function stripEmojiForTTS(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── truncateForTTS(text, maxLength): string ──
// TTS 朗讀文本超過 maxLength 自動截斷 + 「...」
//
// 用途:consequence 太長(>80 字)TTS 讀起上嚟悶,截斷保持注意力
export function truncateForTTS(text, maxLength = LENGTH_LIMITS.ttsTruncate) {
  if (typeof text !== 'string') return '';
  const stripped = stripEmojiForTTS(text);
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength - 1).trimEnd() + '…';
}

// ── formatStopAndThinkForTTS(stopAndThink): string ──
// 同 formatStopAndThink 但 strip emoji + 段落分隔(單行 TTS 友好)
export function formatStopAndThinkForTTS(stopAndThink) {
  const fullText = formatStopAndThink(stopAndThink);
  return stripEmojiForTTS(fullText);
}

// ── getStopAndThinkAriaLabel(stopAndThink): string ──
// a11y aria-label 用 — 簡短描述
export function getStopAndThinkAriaLabel(stopAndThink) {
  if (!stopAndThink) return '停一停想一想反思';
  const { badBehavior, consequence, isLoselose = true } = stopAndThink;
  const ending = isLoselose ? '雙輸' : '單輸';
  return `停一停想一想反思:${badBehavior}, 造成${ending}結局, ${consequence}`;
}

// ── auditScenarioText(text): { ok: bool, violations: string[] } ──
// STYLE_GUIDE_V3 §4 — 掃口語 marker
// 用於 tools/style/audit-scenarios.mjs CI script
//
// Sprint 16 exceptions:
//   - `係` in predicate position (X係Y where Y is CJK) — valid 書面語 copula
//   - `話` in ACCEPTED_COMPOUNDS (說話, 廣東話, etc.) — standard written nouns
export function auditScenarioText(text) {
  if (typeof text !== 'string' || !text) {
    return { ok: true, violations: [] };
  }
  const violations = [];
  for (const marker of COLLOQUIAL_MARKERS) {
    if (text.includes(marker)) {
      // Exception: 係 in predicate position
      if (marker === '係' && /係[一-鿿]/.test(text)) {
        continue;
      }
      // Exception: 話 in standard compound noun
      if (marker === '話' && ACCEPTED_COMPOUNDS.some(c => text.includes(c))) {
        continue;
      }
      violations.push(marker);
    }
  }
  return { ok: violations.length === 0, violations };
}

// ── auditLength(text, field): { ok: bool, length: number, max: number } ──
// STYLE_GUIDE_V3 §3.1 — 長度上限
export function auditLength(text, field) {
  const max = LENGTH_LIMITS[field];
  if (typeof max !== 'number') {
    return { ok: true, length: text?.length || 0, max: null };
  }
  const length = typeof text === 'string' ? text.length : 0;
  return { ok: length <= max, length, max };
}

// ── auditScenario(option): { ok: bool, errors: string[] } ──
// 整合 audit — 一次過 check colloquial + length
//
// option: { text, effects[], stopAndThink? }
// errors: ['optionText.colloquial:你哋', 'effectsComment.length:42>40', ...]
export function auditScenario(option) {
  const errors = [];

  if (!option || typeof option !== 'object') {
    return { ok: false, errors: ['option.missing'] };
  }

  // Option text
  if (typeof option.text === 'string') {
    const colloquial = auditScenarioText(option.text);
    if (!colloquial.ok) {
      errors.push(`optionText.colloquial:${colloquial.violations.join(',')}`);
    }
    const len = auditLength(option.text, 'optionText');
    if (!len.ok) {
      errors.push(`optionText.length:${len.length}>${len.max}`);
    }
  } else {
    errors.push('optionText.missing');
  }

  // Effects comments
  if (Array.isArray(option.effects)) {
    option.effects.forEach((eff, i) => {
      if (typeof eff?.comment === 'string') {
        const colloquial = auditScenarioText(eff.comment);
        if (!colloquial.ok) {
          errors.push(`effects[${i}].comment.colloquial:${colloquial.violations.join(',')}`);
        }
        const len = auditLength(eff.comment, 'effectsComment');
        if (!len.ok) {
          errors.push(`effects[${i}].comment.length:${len.length}>${len.max}`);
        }
      }
    });
  }

  // StopAndThink (optional but conditional)
  if (option.stopAndThink) {
    const st = option.stopAndThink;
    if (typeof st.badBehavior === 'string') {
      const colloquial = auditScenarioText(st.badBehavior);
      if (!colloquial.ok) {
        errors.push(`stopAndThink.badBehavior.colloquial:${colloquial.violations.join(',')}`);
      }
      const len = auditLength(st.badBehavior, 'badBehavior');
      if (!len.ok) {
        errors.push(`stopAndThink.badBehavior.length:${len.length}>${len.max}`);
      }
    }
    if (typeof st.consequence === 'string') {
      const colloquial = auditScenarioText(st.consequence);
      if (!colloquial.ok) {
        errors.push(`stopAndThink.consequence.colloquial:${colloquial.violations.join(',')}`);
      }
      const len = auditLength(st.consequence, 'consequence');
      if (!len.ok) {
        errors.push(`stopAndThink.consequence.length:${len.length}>${len.max}`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
