// tests/style.test.js
// Sprint 16 — Style audit unit tests (SPEC §17.8 testing requirements #9-#12)
// Tests:
//   9.  auditScenarioText 對齊 STYLE_GUIDE (白名單 fixture 通過)
//   10. auditScenarioText 口語 marker fixture fail
//   11. auditOptionText length ≤ 30 字 pass
//   12. auditOptionText length > 30 字 fail

import { describe, it, expect } from 'vitest';
import {
  auditScenarioText,
  auditLength,
  auditScenario,
  COLLOQUIAL_MARKERS,
  LENGTH_LIMITS,
} from '../src/domain/Feedback.js';

describe('auditScenarioText', () => {
  it('Test #9: 白名單 fixture (書面語) 通過', () => {
    const clean = [
      '「或者他不是故意的？你有問過他嗎？」',
      '「是啊！小華太過分了！我也不跟他玩了！」',
      '你和小明一起排擠小華。但之後你才知道，小華是不小心弄壞的。',
      '你好勇敢！🌟',
      '你識得尊重朋友的感受，是很好的聆聽者！',
    ];
    for (const text of clean) {
      const result = auditScenarioText(text);
      expect(result.ok, `Should pass: ${text}`).toBe(true);
      expect(result.violations).toEqual([]);
    }
  });

  it('Test #10: 口語 marker fixture fail', () => {
    const colloquial = [
      '你哋一齊去啦',
      '佢係衰人',
      '而家去邊度',
      '唔好咁做啦',
      '睇下咩事',
      '呢個唔係',
    ];
    for (const text of colloquial) {
      const result = auditScenarioText(text);
      expect(result.ok, `Should fail: ${text}`).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    }
  });

  it('returns ok for empty / non-string input', () => {
    expect(auditScenarioText('').ok).toBe(true);
    expect(auditScenarioText(null).ok).toBe(true);
    expect(auditScenarioText(undefined).ok).toBe(true);
    expect(auditScenarioText(123).ok).toBe(true);
  });

  it('predicate 係 同 compound 話 accept (Sprint 16 implementation finding)', () => {
    // These should NOT trigger violations due to special handling:
    // - 係 in predicate position (X係Y where Y is CJK)
    // - 話 in compound nouns (說話, 廣東話, etc.)
    expect(auditScenarioText('你是同理心高手').ok).toBe(true);
    expect(auditScenarioText('你幫他說話').ok).toBe(true);
    expect(auditScenarioText('他廣東話說得不好').ok).toBe(true);
  });
});

describe('auditLength', () => {
  it('Test #11: option text ≤ 30 字 pass', () => {
    const valid = '你和小明一起排擠小華';  // 10 chars
    expect(auditLength(valid, 'optionText').ok).toBe(true);
    expect(auditLength(valid, 'optionText').length).toBe(10);
    expect(auditLength(valid, 'optionText').max).toBe(30);
  });

  it('Test #12: option text > 30 字 fail', () => {
    const tooLong = '一二三四五六七八九一二三四五六七八九一二三四五六七八九一二三四五';  // 41 chars
    const result = auditLength(tooLong, 'optionText');
    expect(result.ok).toBe(false);
    expect(result.length).toBeGreaterThan(LENGTH_LIMITS.optionText);
  });

  it('different fields have different limits', () => {
    const long = 'a'.repeat(35);
    expect(auditLength(long, 'optionText').ok).toBe(false);  // 30 max
    expect(auditLength(long, 'effectsComment').ok).toBe(true); // 40 max
    expect(auditLength('a'.repeat(85), 'consequence').ok).toBe(false); // 80 max
  });
});

describe('auditScenario', () => {
  it('returns ok for fully valid option', () => {
    const opt = {
      text: '你和小明一起排擠小華',
      effects: [
        { character: '小明', moralChange: -10, comment: '小明覺得被誤會，好傷心。' },
      ],
      stopAndThink: {
        badBehavior: '和小明一起排擠小華',
        consequence: '小華會感到被誤會而傷心，其他同學會認為你們不公平',
        isLoselose: true,
      },
    };
    const result = auditScenario(opt);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('flags colloquial markers in option text', () => {
    const opt = {
      text: '你哋一齊去啦',
      effects: [],
    };
    const result = auditScenario(opt);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.startsWith('optionText.colloquial'))).toBe(true);
  });

  it('flags length violations', () => {
    const opt = {
      text: '一二三四五六七八九一二三四五六七八九一二三四五六七八九一二三四五',
      effects: [],
    };
    const result = auditScenario(opt);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.startsWith('optionText.length'))).toBe(true);
  });

  it('flags multiple errors in single option', () => {
    const opt = {
      text: '你哋一齊去啦' + '一二三四五六七八九一二三四五六七八九一二'.repeat(2),
      effects: [
        { character: 'X', moralChange: 0, comment: '佢係衰人' },
      ],
    };
    const result = auditScenario(opt);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('handles missing fields gracefully', () => {
    const result = auditScenario({});
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('optionText.missing');
  });
});

describe('COLLOQUIAL_MARKERS', () => {
  it('does not include predicate-position 係 / 唔係', () => {
    // Sprint 16 implementation: 係 in predicate position is valid 書面語.
    // SPEC §17.2.3 next freeze v3.8 should formalize this exception.
    expect(COLLOQUIAL_MARKERS).not.toContain('係');
    expect(COLLOQUIAL_MARKERS).not.toContain('唔係');
  });
});
