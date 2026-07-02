// src/constants/garden.js
// Sprint 18 — 關係花園 (Relationship Garden)
//
// 3-character roster × 5-step arc × per-character monologue voice.
// Pure data — no DOM, no imports. Used by GardenArc.js (domain) and engine.js (UI).
//
// Why one file: data shape is small (~5 entities); splitting to per-entity
// files would add noise. Future: if teacher-configurable character roster is
// added (S19+), split CHARACTERS + GARDEN_CONFIG to garden-defaults.js for
// override layering (per ARCHITECTURE.md §3.5 single-source-of-truth pattern).

export const GARDEN_CONFIG = Object.freeze({
  STEPS_PER_RUN: 5,
  UNLOCK_THRESHOLD: 7,    // score >= 7 → 🌷 解鎖
  RESTART_THRESHOLD: 4,    // score < 4 → 「友情慢慢建立」(no shame)
  SCORE_MIN: -9,
  SCORE_MAX: 9,
  RELATIONSHIP_DELTA_MIN: -3,
  RELATIONSHIP_DELTA_MAX: 3,
});

// 5-step closed-loop arc, character-agnostic.
// All 3 chars play this same arc — narrative coherence from step progression
// (認識 → 互相幫忙 → 衝突化解 → 表達關心 → 友誼延續), not from per-char scenarios.
export const GARDEN_ARC = Object.freeze([
  { step: 0, scenarioId: 's-self-07', arcLabel: '認識' },
  { step: 1, scenarioId: 's-self-02', arcLabel: '互相幫忙' },
  { step: 2, scenarioId: 's-self-19', arcLabel: '衝突化解' },
  { step: 3, scenarioId: 's3',         arcLabel: '表達關心' },
  { step: 4, scenarioId: 's-self-13', arcLabel: '友誼延續' },
]);

// 3 character roster (per owner decision 2026-07-02)
// Replaces PROPOSAL_V1's 阿明/阿俊 with smaller-name convention 小晨/小輝
// for primary school age fit.
export const CHARACTERS = Object.freeze([
  Object.freeze({
    id: '小美',
    name: '小美',
    role: '同班好朋友',
    ageLabel: '8 歲小三',
    voice: '觀察型',
    avatar: 'assets/images/garden/小美.png',
  }),
  Object.freeze({
    id: '小晨',
    name: '小晨',
    role: '同班同學',
    ageLabel: '8 歲小三',
    voice: '行動型',
    avatar: 'assets/images/garden/小晨.png',
  }),
  Object.freeze({
    id: '小輝',
    name: '小輝',
    role: '高年級 mentor',
    ageLabel: '10 歲小五',
    voice: 'advisor',
    avatar: 'assets/images/garden/小輝.png',
  }),
]);

// 15 monologues — 5 per character, 1 per arc step (v1: outcome-agnostic).
// Future (S19+): per-character × per-outcome split (15 → 75 strings) to
// reflect choice direction; v1 keeps it simple.
export const MONOLOGUES = Object.freeze({
  '小美': Object.freeze([
    '咦，你真係有留意我...',
    '哈，你明我嘅意思呀',
    '好似... 開始信你多啲喎',
    '同你講嘢真係冇壓力',
    '我希望... 我哋可以繼續咁樣',
  ]),
  '小晨': Object.freeze([
    '嘩，你做嘅嘢幾特別喎',
    '唔錯喎，跟住落嚟點?',
    'OK 啦，我覺得可以咁樣做',
    '同你一齊真係好啲',
    '下次再一齊啦！',
  ]),
  '小輝': Object.freeze([
    '嗯，你呢個諗法幾有心思',
    '我以前都試過類似嘅情況喎',
    '你做得唔錯，不過可以...',
    '呢個我哋可以一齊練習',
    '你學到好多嘢呀，將來一定得',
  ]),
});

// Outcome tiers — single source of truth (mirrored in i18n).
export const GARDEN_OUTCOMES = Object.freeze({
  BLOOM:   'bloom',     // score >= UNLOCK_THRESHOLD
  STABLE:  'stable',    // RESTART_THRESHOLD ≤ score < UNLOCK_THRESHOLD
  RESTART: 'restart',   // score < RESTART_THRESHOLD
});
