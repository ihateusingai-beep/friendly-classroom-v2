// src/storage.js
// Phase 3 (S14): central localStorage registry + safe getters/setters.
//
// All `fc_*` key names live in `STORAGE_KEYS`. Use `get(key, fallback)` and
// `set(key, value)` instead of raw `localStorage.getItem('fc_*')` to get:
//   - automatic JSON.parse / JSON.stringify
//   - parse-failure warning + fallback
//   - QuotaExceededError handling (Phase 1 S2 path)
//   - per-student progress key derivation (`PROGRESS_PREFIX(name)`)
//
// Existing call sites that still use raw `localStorage.getItem('fc_*')` are
// NOT yet migrated (Phase 4 work). This module is the single registry so
// future migrations can lint-detect raw `fc_*` strings.

export const STORAGE_KEYS = Object.freeze({
  // Per-student progress (key is dynamic — use `progressKey(name)`)
  PROGRESS_PREFIX: 'fc_progress_',

  // Teacher config (JSON blob)
  TEACHER_CONFIG: 'fc_teacher_config',
  TEACHER_PIN: 'fc_teacher_pin',

  // Sync / device
  TEACHER_TOKEN: 'fc_teacher_token',
  TEACHER_EXPIRY: 'fc_teacher_expiry',
  DEVICE_ID: 'fc_device_id',
  LAST_SYNC_PREFIX: 'fc_last_sync_',
  SYNC_QUEUE: 'fc_sync_queue',

  // Settings
  TTS_SPEED: 'fc_tts_speed',
  TTS_LANG: 'fc_tts_lang',
  FONT_SIZE: 'fc_font_size',
  LINE_HEIGHT: 'fc_line_height',
  SPACING: 'fc_spacing',
  HC_MODE: 'fc_hc_mode',
  RM_MODE: 'fc_rm_mode',
  VOICE_SEEN: 'fc_voice_seen',

  // Game mode (free / relaxed / challenge — per student)
  GAME_MODE: 'fc_game_mode',

  // Home view filter ('value' | 'caring' | 'all') — which topic-domain
  // section(s) to show on the home page. Defaults to 'value' when student
  // picked 價值觀教育; 'caring' for 友愛校園; 'all' if no subject yet.
  HOME_FILTER: 'fc_home_filter',

  // Sprint 25 (SPEC §25): 情緒小偵探 topic sub-tab filter
  // ('basic' | 'social' | 'all') — 入到 ED topic 之後嘅 sub-tab state,
  // 獨立於 home filter。學生返去 topic 嗰陣會 keep 返上一個 sub-tab。
  ED_FILTER: 'fc_ed_filter',

  // Sprint 18 P1: first-visit onboarding completion flag.
  // 首次進入 app 嗰陣 show 教學 carousel,完成後 set true。
  // 「重看教學」喺 settings 入面,reset flag 後 re-show。
  ONBOARDING_DONE: 'fc_onboarding_done',

  // Sprint 18: 關係花園 progress, per-student per-character best score.
  // Schema: { [studentName]: { [characterId]: { unlocked, bestScore, runCount, lastPlayedAt } } }
  GARDEN_PROGRESS: 'fc_garden_progress_v1',

  // Analytics
  INTERACTIONS: 'fc_interactions_v1',

  // Ephemeral (use sessionStorage, listed here for documentation only)
  // CURRENT_SCENARIO_PLAYED_AT: 'fc_current_scenario_played_at',
  // INSTALL_DISMISSED: 'fc_install_dismissed',
});

export const progressKey = (name) => `${STORAGE_KEYS.PROGRESS_PREFIX}${name}`;
export const lastSyncKey = (name) => `${STORAGE_KEYS.LAST_SYNC_PREFIX}${name}`;

/**
 * Get a JSON-parsed value. On parse failure, warn and return `fallback`.
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
export function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[storage] corrupt key ${key}:`, e);
    return fallback;
  }
}

/**
 * Set a JSON-stringified value. Returns `true` on success, `false` on
 * QuotaExceededError or other failure. Emits no events — caller decides.
 * @param {string} key
 * @param {*} value
 * @returns {boolean}
 */
export function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e && e.name === 'QuotaExceededError') {
      console.warn(`[storage] quota exceeded for ${key}`);
    } else {
      console.warn(`[storage] set failed for ${key}:`, e);
    }
    return false;
  }
}

/**
 * Remove a key. Returns true if removed, false otherwise.
 */
export function remove(key) {
  try { localStorage.removeItem(key); return true; }
  catch (e) { console.warn(`[storage] remove failed for ${key}:`, e); return false; }
}

// ── Teacher config (most-accessed JSON blob) ──────────────────────────────
// Phase 3 (S17): module-level cache invalidated via bus on save.
import { bus } from './domain/EventBus.js';
const _DEFAULTS = {
  hintEnabled: true,
  timerEnabled: false,
  timerSeconds: 30,
  comboEnabled: false,
  bankMaxRiskLevel: 1,
  buttonSize: 'normal',
  assignedTopics: [],
  // Sprint 23 / SPEC §22.16.4 — Teacher toggle for emotion-detective topic.
  // Default ON (backwards-compatible — Phase 2 ship 咗 10 scenarios, 預設開)
  // 老師可以喺 ⚙️ 功能設定 關閉, 關閉後 home page / topic list 隱藏, deep-link
  // 入 emotion-detective scenario 會 redirect 去 home + Toast 提示。
  emotionDetectiveEnabled: true,
};
let _cached = null;
let _cachedAt = 0;
const CACHE_TTL_MS = 5_000; // 5s safety net in case bus event is missed

export function getTeacherConfig() {
  if (_cached && (Date.now() - _cachedAt) < CACHE_TTL_MS) return _cached;
  const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_CONFIG);
  let parsed = {};
  try { parsed = raw ? JSON.parse(raw) : {}; } catch (e) {
    console.warn('[storage] corrupt fc_teacher_config:', e);
  }
  _cached = { ..._DEFAULTS, ...parsed };
  _cachedAt = Date.now();
  return _cached;
}

export function setTeacherConfig(cfg) {
  const merged = { ...getTeacherConfig(), ...cfg };
  const ok = set(STORAGE_KEYS.TEACHER_CONFIG, merged);
  if (ok) {
    _cached = merged;
    _cachedAt = Date.now();
    bus.emit('teacher:config-changed', { config: merged });
  }
  return ok;
}

export function invalidateTeacherConfigCache() {
  _cached = null;
  _cachedAt = 0;
}
