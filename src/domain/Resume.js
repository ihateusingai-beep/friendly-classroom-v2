// src/domain/Resume.js
// Sprint 27 U3 — Auto-resume banner logic.
//
// Pure helpers (no DOM, no Vue/React). The home page reads these to decide
// whether to render the "📍 繼續上次" banner, and the action handlers
// (resumeLast / dismissResume in actions/inline.js) call them too.
//
// Storage layout:
//   fc_last_scenario      — string | null  (written by Play.play() line 85)
//   fc_last_played_at     — ISO timestamp | null  (written by Play.play())
//   fc_resume_dismissed   — JSON { [scenarioId]: ISO dismiss-timestamp } | null
//
// Dismiss semantics:
//   - Dismiss is per-scenario, time-bounded: 24h after dismiss the banner
//     re-appears for the same scenario (student may have genuinely changed
//     their mind overnight).
//   - Stale scenario id (chunk no longer contains it) → silently drop the
//     fc_last_scenario entry so the banner disappears.
//
// Why a separate module (not inlined in engine.js):
//   - unit-testable without DOM
//   - action handlers (actions/inline.js) import same helpers, so a single
//     source of truth for "should this banner show"

const LAST_SCENARIO_KEY = 'fc_last_scenario';
const LAST_PLAYED_AT_KEY = 'fc_last_played_at';
const DISMISS_KEY = 'fc_resume_dismissed';
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const STALE_SCENARIO_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7d — banner auto-expires

/**
 * Read raw localStorage values without throwing. Returns nulls on any failure.
 */
function _readRaw() {
  try {
    if (typeof localStorage === 'undefined') return { scenarioId: null, playedAt: null, dismissMap: {} };
    const scenarioId = localStorage.getItem(LAST_SCENARIO_KEY) || null;
    const playedAt = localStorage.getItem(LAST_PLAYED_AT_KEY) || null;
    let dismissMap = {};
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (raw) dismissMap = JSON.parse(raw) || {};
      if (typeof dismissMap !== 'object' || Array.isArray(dismissMap)) dismissMap = {};
    } catch {
      dismissMap = {};
    }
    return { scenarioId, playedAt, dismissMap };
  } catch {
    return { scenarioId: null, playedAt: null, dismissMap: {} };
  }
}

/**
 * Record that the student just started playing `scenarioId`. Called from
 * Play.play() right after the deep-link guard, before render.
 *
 * Idempotent — calling twice with the same id just updates the timestamp.
 */
export function recordLastPlayed(scenarioId) {
  if (!scenarioId) return;
  try {
    localStorage.setItem(LAST_SCENARIO_KEY, scenarioId);
    localStorage.setItem(LAST_PLAYED_AT_KEY, new Date().toISOString());
  } catch {
    // localStorage unavailable — silently skip (private mode / quota)
  }
}

/**
 * Clear the resume state. Called when:
 *   - The scenario no longer exists (teacher un-assigned, chunk removed)
 *   - The student explicitly completed the scenario
 *   - The student dismissed the banner (handled separately via dismissResume)
 */
export function clearResume() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LAST_SCENARIO_KEY);
      localStorage.removeItem(LAST_PLAYED_AT_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Mark the resume banner as dismissed for a specific scenario. The banner
 * will not re-appear for this scenario until DISMISS_TTL_MS passes (24h).
 *
 * If scenarioId is null, dismisses the current fc_last_scenario.
 */
export function dismissResume(scenarioId = null) {
  try {
    if (typeof localStorage === 'undefined') return;
    const target = scenarioId || localStorage.getItem(LAST_SCENARIO_KEY);
    if (!target) return;
    const raw = localStorage.getItem(DISMISS_KEY);
    let map = {};
    try { map = raw ? (JSON.parse(raw) || {}) : {}; } catch { map = {}; }
    map[target] = new Date().toISOString();
    localStorage.setItem(DISMISS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * Pure candidate resolver. Given the currently loaded scenarios cache and
 * the current student name, decide whether the resume banner should render.
 *
 * Returns null when banner should NOT show. Otherwise returns:
 *   { scenarioId, playedAt, isStale }
 *
 * Banner is hidden when:
 *   1. No fc_last_scenario recorded
 *   2. Scenario not in scenarios cache (chunk removed / teacher disabled)
 *   3. Student already completed this scenario
 *   4. Student dismissed within the last 24h
 *   5. lastPlayedAt > 7d ago (too stale — student moved on)
 *
 * @param {Array<{id: string}>} scenariosCache — what getScenarios() returns
 * @param {string|null} studentName — current student (for completion lookup)
 * @param {{ isCompleted?: (studentName: string, scenarioId: string) => boolean }} [opts]
 * @returns {{ scenarioId: string, playedAt: string, isStale: boolean }|null}
 */
export function getResumeCandidate(scenariosCache, studentName, opts = {}) {
  const { scenarioId, playedAt, dismissMap } = _readRaw();
  if (!scenarioId) return null;

  // Validate the scenario still exists in any loaded chunk.
  const sc = (scenariosCache || []).find((s) => s && s.id === scenarioId);
  if (!sc) {
    // Stale id — clean it up so future renders don't loop on it
    clearResume();
    return null;
  }

  // Already-completed scenarios don't need a resume banner (suggestNext moves on)
  if (studentName && opts.isCompleted && opts.isCompleted(studentName, scenarioId)) {
    return null;
  }

  // 24h dismiss cooldown
  const dismissedAt = dismissMap[scenarioId];
  if (dismissedAt) {
    const dismissedTime = Date.parse(dismissedAt);
    if (!Number.isNaN(dismissedTime) && (Date.now() - dismissedTime) < DISMISS_TTL_MS) {
      return null;
    }
  }

  // 7d staleness cutoff
  let isStale = false;
  if (playedAt) {
    const playedTime = Date.parse(playedAt);
    if (!Number.isNaN(playedTime) && (Date.now() - playedTime) > STALE_SCENARIO_TTL_MS) {
      // Too old — clear and hide
      clearResume();
      return null;
    }
    // 'isStale' hint for UI (e.g. "上次 3 日前玩過")
    isStale = (Date.now() - playedTime) > 24 * 60 * 60 * 1000;
  }

  return { scenarioId, playedAt: playedAt || new Date().toISOString(), isStale };
}

/**
 * Format "last played" relative timestamp for display.
 * Pure (no DOM) — returns string suitable for `aria-label` or visible text.
 *
 * @param {string|null} isoTimestamp
 * @returns {string} e.g. "剛剛", "5 分鐘前", "2 小時前", "昨日", "3 日前"
 */
export function formatRelativePlayed(isoTimestamp) {
  if (!isoTimestamp) return '';
  const t = Date.parse(isoTimestamp);
  if (Number.isNaN(t)) return '';
  const diffMs = Date.now() - t;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return '剛剛';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} 分鐘前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小時前`;
  const day = Math.floor(hr / 24);
  if (day === 1) return '昨日';
  if (day < 7) return `${day} 日前`;
  return new Date(t).toLocaleDateString('zh-HK', { month: 'short', day: 'numeric' });
}
