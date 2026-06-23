// tests/feedback.test.js
// Sprint 16 — Feedback.js unit tests (SPEC §17.8 testing requirements #1-#8)
// Tests:
//   1. formatStopAndThink 完整 template render
//   2. formatStopAndThink 缺 badBehavior fallback
//   3. formatStopAndThink 缺 consequence fallback
//   4. formatStopAndThink isLoselose=false 單輸 wording
//   5. shouldRenderStopAndThink moralChange >= 0 唔 render
//   6. shouldRenderStopAndThink moralChange < 0 render
//   7. stripEmojiForTTS 處理 emoji + 標點 + 多餘空白
//   8. truncateForTTS 80 字上限

import { describe, it, expect } from 'vitest';
import {
  formatStopAndThink,
  shouldRenderStopAndThink,
  calculateOptionMoralChange,
  hasCrossCharacterConflict,
  stripEmojiForTTS,
  truncateForTTS,
  formatStopAndThinkForTTS,
  getStopAndThinkAriaLabel,
  LENGTH_LIMITS,
  STOP_AND_THINK_EMOJI,
  STOP_AND_THINK_TITLE,
} from '../src/domain/Feedback.js';

describe('formatStopAndThink', () => {
  it('Test #1: 完整 template render (badBehavior + consequence + isLoselose=true)', () => {
    const st = {
      badBehavior: '和小明一起排擠小華',
      consequence: '小華會感到被誤會而傷心，其他同學會認為你們不公平',
      isLoselose: true,
    };
    const out = formatStopAndThink(st);
    expect(out).toContain(STOP_AND_THINK_EMOJI);
    expect(out).toContain(STOP_AND_THINK_TITLE);
    expect(out).toContain('停一停，想一想');
    expect(out).toContain('和小明一起排擠小華');
    expect(out).toContain('小華會感到被誤會而傷心');
    expect(out).toContain('雙輸結局');
    expect(out).toContain('請你再選出正確的回應吧');
  });

  it('Test #2: 缺 badBehavior fallback「再做這個選擇」', () => {
    const out = formatStopAndThink({ consequence: '會令其他人受傷' });
    expect(out).toContain('再做這個選擇');
    expect(out).toContain('會令其他人受傷');
  });

  it('Test #3: 缺 consequence fallback「請仔細想想後果」', () => {
    const out = formatStopAndThink({ badBehavior: '忽視朋友的感受' });
    expect(out).toContain('忽視朋友的感受');
    expect(out).toContain('請仔細想想後果');
  });

  it('Test #4: isLoselose=false 單輸 wording', () => {
    const st = {
      badBehavior: '放棄責任',
      consequence: '自己會失去同學的信任',
      isLoselose: false,
    };
    const out = formatStopAndThink(st);
    expect(out).toContain('單輸結局');
    expect(out).not.toContain('雙輸結局');
  });

  it('Test #4b: isLoselose undefined defaults to true (雙輸)', () => {
    const st = {
      badBehavior: '嘲笑同學',
      consequence: '同學會難過',
      // isLoselose omitted
    };
    const out = formatStopAndThink(st);
    expect(out).toContain('雙輸結局');
  });

  it('Test #4c: null/undefined input → fallback', () => {
    const out = formatStopAndThink(null);
    expect(out).toContain(STOP_AND_THINK_EMOJI);
    expect(out).toContain('讓我們再想一想');
    expect(out).toContain('請你再選出正確的回應吧');
  });
});

describe('shouldRenderStopAndThink', () => {
  it('Test #5: moralChange >= 0 唔 render', () => {
    const opt = { stopAndThink: { badBehavior: 'x', consequence: 'y' }, effects: [] };
    expect(shouldRenderStopAndThink(opt, 0)).toBe(false);
    expect(shouldRenderStopAndThink(opt, 10)).toBe(false);
  });

  it('Test #6: moralChange < 0 + 有 stopAndThink → render', () => {
    const opt = {
      stopAndThink: { badBehavior: 'x', consequence: 'y' },
      effects: [{ moralChange: -5 }],
    };
    expect(shouldRenderStopAndThink(opt, -5)).toBe(true);
  });

  it('Test #6b: 冇 stopAndThink field → 唔 render', () => {
    const opt = { effects: [{ moralChange: -5 }] };
    expect(shouldRenderStopAndThink(opt, -5)).toBe(false);
  });

  it('Test #6c: cross-character conflict (positive total 但有 bystander 扣分) → render', () => {
    const opt = {
      stopAndThink: { badBehavior: 'x', consequence: 'y' },
      effects: [
        { character: 'A', moralChange: 10 },
        { character: 'B', moralChange: -5 },
      ],
    };
    // Total moralChange = 5 (positive), but cross-character conflict → render
    expect(shouldRenderStopAndThink(opt, 5)).toBe(true);
  });
});

describe('calculateOptionMoralChange', () => {
  it('aggregates moralChange across effects', () => {
    const opt = { effects: [{ moralChange: -5 }, { moralChange: 3 }, { moralChange: -2 }] };
    expect(calculateOptionMoralChange(opt)).toBe(-4);
  });

  it('returns 0 for missing effects', () => {
    expect(calculateOptionMoralChange({})).toBe(0);
    expect(calculateOptionMoralChange(null)).toBe(0);
  });
});

describe('hasCrossCharacterConflict', () => {
  it('returns true when positive + negative characters mixed', () => {
    const opt = {
      effects: [
        { character: 'A', moralChange: 10 },
        { character: 'B', moralChange: -5 },
      ],
    };
    expect(hasCrossCharacterConflict(opt)).toBe(true);
  });

  it('returns false when all positive', () => {
    const opt = { effects: [{ moralChange: 10 }, { moralChange: 5 }] };
    expect(hasCrossCharacterConflict(opt)).toBe(false);
  });

  it('returns false when all negative', () => {
    const opt = { effects: [{ moralChange: -10 }, { moralChange: -5 }] };
    expect(hasCrossCharacterConflict(opt)).toBe(false);
  });
});

describe('stripEmojiForTTS', () => {
  it('Test #7: 處理 emoji + 標點 + 多餘空白', () => {
    expect(stripEmojiForTTS('你好勇敢！🌟')).toBe('你好勇敢！');
    expect(stripEmojiForTTS('🌟 你好')).toBe('你好');
    expect(stripEmojiForTTS('你好  🌟  朋友')).toBe('你好 朋友');
    expect(stripEmojiForTTS('')).toBe('');
    expect(stripEmojiForTTS(null)).toBe('');
    expect(stripEmojiForTTS(undefined)).toBe('');
  });

  it('handles multiple emojis + transport + dingbats', () => {
    expect(stripEmojiForTTS('⚠️ 警告 ❌')).toBe('警告');
    expect(stripEmojiForTTS('💪🏼 good')).toBe('good');
  });
});

describe('truncateForTTS', () => {
  it('Test #8: 80 字上限 + 「…」suffix', () => {
    const long = '一二三四五六七八九'.repeat(10); // 100 chars
    const out = truncateForTTS(long, 20);
    expect(out.length).toBeLessThanOrEqual(20);
    expect(out.endsWith('…')).toBe(true);
  });

  it('passes through text under limit unchanged', () => {
    expect(truncateForTTS('你好', 80)).toBe('你好');
  });

  it('default maxLength is 80', () => {
    const long = '一'.repeat(100);
    expect(truncateForTTS(long).length).toBe(LENGTH_LIMITS.ttsTruncate);
  });

  it('strips emoji before truncating', () => {
    const text = '你好🌟'.repeat(50); // many emojis
    const out = truncateForTTS(text, 10);
    expect(out).not.toContain('🌟');
    expect(out.length).toBeLessThanOrEqual(10);
  });
});

describe('formatStopAndThinkForTTS', () => {
  it('strips emoji + collapses newlines (single-line TTS-friendly)', () => {
    const st = {
      badBehavior: '欺負同學',
      consequence: '同學會難過',
      isLoselose: true,
    };
    const out = formatStopAndThinkForTTS(st);
    expect(out).not.toContain('🤔');
    expect(out).not.toContain('\n');
    expect(out).toContain('欺負同學');
    expect(out).toContain('同學會難過');
  });
});

describe('getStopAndThinkAriaLabel', () => {
  it('produces concise SR-friendly label', () => {
    const st = {
      badBehavior: '忽視朋友',
      consequence: '朋友會孤單',
      isLoselose: true,
    };
    const out = getStopAndThinkAriaLabel(st);
    expect(out).toContain('停一停想一想反思');
    expect(out).toContain('雙輸');
    expect(out).toContain('朋友會孤單');
  });

  it('falls back to default label when stopAndThink missing', () => {
    expect(getStopAndThinkAriaLabel(null)).toBe('停一停想一想反思');
    expect(getStopAndThinkAriaLabel(undefined)).toBe('停一停想一想反思');
  });
});
