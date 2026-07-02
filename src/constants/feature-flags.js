// src/constants/feature-flags.js
// Sprint 27 — Single source of truth for engagement overhaul feature toggles.
//
// Why this exists: U1 / U3 / D1 each carry independent risk (visual regression,
// stale resume banner, brand color change). A kill-switch per feature lets
// us revert one without touching the others, and lets staging opt-in
// selectively before production rollout.
//
// IMPORTANT: WARM_THEME defaults to false. The D1 color swap changes the
// primary surface; rolling it out behind a teacher opt-in flag prevents
// surprise brand changes for already-trained users.
//
// Usage:
//   import { FLAGS, isFeatureEnabled } from './constants/feature-flags.js';
//   if (isFeatureEnabled('HOME_REDESIGN')) { ... }
//
// Override from browser console for staged rollout:
//   localStorage.setItem('fc_flag_HOME_REDESIGN', '0');  // force off
//   localStorage.setItem('fc_flag_WARM_THEME', '1');     // force on

/** Default flag values. Override via localStorage per-flag. */
export const FLAGS = Object.freeze({
  /** U1: Home page single-column redesign (topics grid collapsed by default) */
  HOME_REDESIGN: true,

  /** U3: Auto-resume banner (home page top, "continue last scenario") */
  RESUME_BANNER: true,

  /** D1: Warm theme (emerald + cream, ASD sensory-friendly). Default OFF — opt-in. */
  WARM_THEME: false,

  /** Sprint 18: 關係花園 (Relationship Garden) hub card + 3 character roster unlock. */
  GARDEN_MODE: true,
});

/** Prefix for per-flag localStorage overrides. */
const FLAG_STORAGE_PREFIX = 'fc_flag_';

/**
 * Check if a feature is enabled. Honors:
 *   1. localStorage override (per-flag, '1' or '0')
 *   2. Default value from FLAGS
 *
 * Returns boolean. Never throws (graceful fallback to default).
 *
 * @param {string} name — one of FLAGS keys
 * @returns {boolean}
 */
export function isFeatureEnabled(name) {
  if (!(name in FLAGS)) {
    console.warn(`[feature-flags] unknown flag: ${name}`);
    return false;
  }
  try {
    const override = typeof localStorage !== 'undefined'
      ? localStorage.getItem(FLAG_STORAGE_PREFIX + name)
      : null;
    if (override === '1') return true;
    if (override === '0') return false;
  } catch {
    // localStorage unavailable (SSR / private mode) — fall through to default
  }
  return FLAGS[name];
}

/**
 * Set a per-flag override (debug / teacher dashboard use).
 * Pass null to clear the override and revert to the default.
 *
 * @param {string} name
 * @param {boolean|null} enabled
 */
export function setFeatureOverride(name, enabled) {
  if (!(name in FLAGS)) {
    console.warn(`[feature-flags] unknown flag: ${name}`);
    return;
  }
  try {
    if (enabled === null) {
      localStorage.removeItem(FLAG_STORAGE_PREFIX + name);
    } else {
      localStorage.setItem(FLAG_STORAGE_PREFIX + name, enabled ? '1' : '0');
    }
  } catch {
    // ignore — feature stays at default
  }
}
