// src/constants/bank.js
// Phase 3 (S15): single source of truth for bank-game constants + risk labels.
//
// Before: 3 verbatim `{ 0: ..., 1: ..., 2: ..., 3: ... }` objects in engine.js
// + 1 conflicting set in GoodDeedBank.js. All consumers now import from here.

export const BANK_RISK = Object.freeze({
  VALUES_ONLY: 0,
  MILD: 1,
  MEDIUM: 2,
  ALL: 3,
});

/**
 * User-facing label for a risk level. Shown in Game Hub, Bank Play header,
 * and Bank Summary's "本局難度" line.
 */
export const BANK_RISK_LABELS = Object.freeze({
  [BANK_RISK.VALUES_ONLY]: '只 value',
  [BANK_RISK.MILD]:         '≤1（低）',
  [BANK_RISK.MEDIUM]:       '≤2（中）',
  [BANK_RISK.ALL]:          '全開',
});

const VALID_MAX_RISK = new Set([0, 1, 2, 3]);

/**
 * Normalize a user-supplied value to a valid risk level (0..3).
 * Null / undefined / non-number / out-of-range → 1 (default).
 * Note: 0 must be explicitly passed; nullish does NOT default to 0.
 */
export function normalizeBankMaxRisk(val) {
  if (val === null || val === undefined || val === '') return BANK_RISK.MILD;
  const n = Number(val);
  if (!Number.isFinite(n)) return BANK_RISK.MILD;
  return VALID_MAX_RISK.has(n) ? n : BANK_RISK.MILD;
}

/** Get the display label for a risk level. Falls back to MILD label. */
export function bankRiskLabel(level) {
  return BANK_RISK_LABELS[normalizeBankMaxRisk(level)] || BANK_RISK_LABELS[BANK_RISK.MILD];
}
