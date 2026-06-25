// 遊戲邏輯引擎（domain 層）— 無 DOM 依賴
// engine.js 的 render 函數留原位，此模組只處理遊戲狀態和邏輯

import { applyScenarioResult } from './Moral.js';
import { markComplete, getProgress, updateTopicTotal, updateSubjectTotal, isCompleted } from './Progress.js';
import { getCreedsByIds, formatCreeds } from '../creeds.js';

// Sprint 3 / Track B1: per-topic scenario chunk loading.
//
// data/scenarios/<topic-id>.json — 17 per-topic chunks (~20-28KB each,
// total ~376KB). Bundler-friendly glob gives us a static path map;
// loadScenarios() resolves every chunk in parallel for paths that
// need the full set (Good-Deed Bank random pick), and
// loadScenariosForTopic(id) lazily loads just one chunk on demand.
//
// Sprint 4 / A1: each scenario now carries a `subjectId` field
// (value | caring) so initSubjectProgress() can write a subject-
// specific total instead of falling back to all-scenarios.
//
// The id→topic reverse index is populated during chunk merges, so
// getScenarioById(id) can resolve the owning topic and load that one
// chunk even when called from a code path that doesn't know the topic.

let currentStudent = null;
let currentTopic = null;
let currentScenario = null;
let scenarios = [];

// 追蹤已 init 過嘅 (student, topic) 組合，避免每次 render 重覆寫入 + 觸發 sync.
// Declared at top so setStudent() can clear() it on student switch without
// a forward-reference. Subject-level dedupe is intentionally absent: the
// engine needs to re-call updateSubjectTotal() on every render until the
// first chunk lands, and updateSubjectTotal() itself is idempotent (it
// no-ops when the value hasn't changed).
const initedTopicForStudent = new Set();   // key: `${student}|${topicId}`

// Sprint 4 / A1 review fix: track (student, subjectId) pairs that have
// called initSubjectProgress() but didn't have a real total to report
// at the time (cache empty due to per-topic lazy load). _mergeChunk()
// drains this set as soon as a chunk lands so the home progress bar
// shows a real total instead of 0/X. Cleared by setStudent() on student
// switch.
const _pendingSubjectRefreshes = new Set(); // key: `${student}|${subjectId}`

// Per-topic load state. _loadedTopics tracks which chunks are merged into
// the in-memory cache; _pendingLoads de-dupes concurrent load requests.
const _loadedTopics = new Set();
const _pendingLoads = {};
const _scenarioToTopic = new Map();   // scenarioId → topicId

// `import.meta.glob` with `{eager:false}` returns async-loadable chunk
// loaders keyed by relative path. Vite resolves the glob literal at build
// time → only the chunks actually fetched end up in a runtime request,
// but the bundler still sees a static list for code-splitting.
//
// Path is relative to this file: src/domain/ → ../../data/scenarios/
const _chunkLoaders = import.meta.glob('../../data/scenarios/*.json');

// Resolve a chunk module → array (handles Vite's default export wrapper).
function _arr(mod) { return mod && mod.default ? mod.default : mod; }

// Merge a chunk's array into the in-memory cache. Idempotent (de-dup by id)
// and populates the id→topic reverse index. Each chunk maps cleanly to
// one topicId, so the index is filled as we go.
function _mergeChunk(topicId, arr) {
  if (!Array.isArray(arr)) return;
  const seen = new Set(scenarios.map(s => s.id));
  for (const s of arr) {
    if (!seen.has(s.id)) {
      scenarios.push(s);
      seen.add(s.id);
    }
    _scenarioToTopic.set(s.id, topicId);
  }
  _loadedTopics.add(topicId);
  // Drain any pending subject-total refreshes (see initSubjectProgress).
  _refreshPendingTotals();
}

// Drain the pending-subject-refresh set: for each (student, subjectId)
// that called initSubjectProgress() while the cache was empty, recompute
// the per-subject total now that we have data. No-op when there's nothing
// to refresh or the cache is still empty.
function _refreshPendingTotals() {
  if (_pendingSubjectRefreshes.size === 0) return;
  if (!currentStudent) return;
  if (scenarios.length === 0) return;
  // Snapshot to avoid mutating during iteration
  const keys = Array.from(_pendingSubjectRefreshes);
  for (const key of keys) {
    const [student, subjectId] = key.split('|');
    if (student !== currentStudent) continue;  // student switched mid-flight
    const total = scenarios.filter(s => s.subjectId === subjectId).length;
    updateSubjectTotal(student, subjectId, total);
  }
  // Only clear if the student hasn't changed mid-drain
  if (currentStudent) {
    for (const key of keys) {
      if (key.startsWith(`${currentStudent}|`)) _pendingSubjectRefreshes.delete(key);
    }
  }
}

// ── Student ──
export function setStudent(name) {
  currentStudent = name;
  // 換學生後 init cache 都要清返，避免撈到舊學生嘅 record
  initedTopicForStudent.clear();
  _pendingSubjectRefreshes.clear();
}
export function getStudent() { return currentStudent; }

// ── Scenarios ──
// Backward-compat: replaces the in-memory cache. New code should prefer
// loadScenarios() (eager full-load) or loadScenariosForTopic() (per-chunk
// merge) — but legacy callers and tests can still bulk-set.
export function setScenarios(arr) {
  scenarios = arr;
  // Rebuild the id→topic index for whatever we now have
  for (const s of arr) {
    if (s.topicId) _scenarioToTopic.set(s.id, s.topicId);
  }
  // Drain any pending subject-total refreshes (Sprint 4 / A1 review
  // fix): when tests / legacy callers use setScenarios() instead of
  // loadScenariosForTopic(), we still want a chunk-like data arrival
  // to fire the deferred writes.
  _refreshPendingTotals();
}

export function getScenarios() { return scenarios; }
export function getScenariosByTopic(topicId) {
  return scenarios.filter(s => s.topicId === topicId);
}

// Returns true once a topic's chunk has been loaded into the cache.
export function isTopicLoaded(topicId) {
  return _loadedTopics.has(topicId);
}

// Eager full-load: used by Good-Deed Bank (random pick across topics).
// Cached after first call.
let _allLoadedPromise = null;
export function loadScenarios() {
  if (_allLoadedPromise) return _allLoadedPromise;
  _allLoadedPromise = (async () => {
    const mods = await Promise.all(Object.values(_chunkLoaders).map(fn => fn()));
    const merged = [];
    for (const mod of mods) {
      const arr = _arr(mod);
      if (Array.isArray(arr)) merged.push(...arr);
    }
    setScenarios(merged);
    return merged;
  })();
  return _allLoadedPromise;
}

// Lazy-load a single topic's chunk. Safe to call repeatedly — concurrent
// requests share the same promise. After resolution, getScenariosByTopic
// returns the freshly loaded items.
export function loadScenariosForTopic(topicId) {
  if (_loadedTopics.has(topicId)) return Promise.resolve();
  if (_pendingLoads[topicId]) return _pendingLoads[topicId];
  const loader = _chunkLoaders[`../../data/scenarios/${topicId}.json`];
  if (!loader) {
    // Unknown topic id — fall back to full load. Prevents silent null
    // returns if a stale chunk name slips in (e.g. typo).
    return loadScenarios();
  }
  _pendingLoads[topicId] = loader()
    .then(mod => { _mergeChunk(topicId, _arr(mod)); })
    .finally(() => { delete _pendingLoads[topicId]; });
  return _pendingLoads[topicId];
}

// Look up a scenario by id. Auto-loads the owning chunk if needed.
// Returns the scenario object or null.
export async function getScenarioById(scenarioId) {
  // Fast path: already in cache
  const cached = scenarios.find(s => s.id === scenarioId);
  if (cached) return cached;
  // Slow path: consult the id→topic index
  const topicId = _scenarioToTopic.get(scenarioId);
  if (!topicId) return null;
  await loadScenariosForTopic(topicId);
  return scenarios.find(s => s.id === scenarioId) || null;
}

// ── Play ──
export function playScenario(scenarioId) {
  currentScenario = scenarios.find(s => s.id === scenarioId) || null;
  return currentScenario;
}

export function getCurrentScenario() { return currentScenario; }

export function chooseOption(scenarioId, optionId, subjectId) {
  const scenario = scenarios.find(s => s.id === scenarioId) || currentScenario;
  if (!scenario) return null;

  // Sprint 23 (SPEC §23): 情緒小偵探 fork — face matching has no moral scoring,
  // only correct/incorrect. Returns a result shape compatible with renderResult.
  if (Array.isArray(scenario.faceOptions) && scenario.faceOptions.length > 0) {
    return chooseFaceOption(scenario, optionId, subjectId);
  }

  const result = applyScenarioResult(scenario, optionId, currentStudent);
  if (!result) return null;

  // 寫入進度（會觸發 EventBus）
  if (currentStudent && subjectId) {
    markComplete(currentStudent, scenario.id, scenario.topicId, result.moralChange, subjectId);
  } else if (currentStudent && !subjectId) {
    // Free mode fallback: 只累計 totalMoralScore + topic progress, 唔寫入 subjectProgress
    markComplete(currentStudent, scenario.id, scenario.topicId, result.moralChange, null);
  }

  // 回傳完整 result（render layer 使用）
  return {
    option: result.option,
    moralChange: result.moralChange,
    mainComment: result.mainComment,
    creeds: result.triggeredCreeds,
    creedText: formatCreeds(result.triggeredCreeds.map(c => c.id)),
    scenarioImage: scenario.image || null,
    scenarioTitle: scenario.title || '',
    outcomeImage: `assets/images/outcomes/${scenario.id}_opt${scenario.options.findIndex(o=>o.id===optionId)+1}.png`,
    nextScenario: result.option?.next_scenario || null,
  };
}

export function getScenarioStatus(scenarioId) {
  if (!currentStudent) return 'locked';
  return isCompleted(currentStudent, scenarioId) ? 'completed' : 'available';
}

// ── Emotion Detective (Sprint 23 / SPEC §23) ────────────────────────────────

/** Pick a face option for an emotion-detective scenario.
 *  No moral scoring: we just track completion with a 0 moral-change
 *  (markComplete writes a completion record but doesn't shift the
 *  moral bar, since emotion matching isn't a moral judgment).
 *
 *  Returns a renderResult-compatible shape:
 *  - option.text = emotion label (e.g. "開心")
 *  - moralChange = 0 (completion-only)
 *  - mainComment = correct/incorrect feedback with the right answer
 *  - outcomeImage = null (no per-option outcome image)
 *  - nextScenario = null (no chained scenarios yet)
 */
function chooseFaceOption(scenario, faceId, subjectId) {
  const face = (scenario.faceOptions || []).find(f => f.id === faceId);
  if (!face) return null;

  const isCorrect = face.correct === true;
  const correctFace = (scenario.faceOptions || []).find(f => f.correct === true);
  const correctLabel = correctFace ? correctFace.label : '';

  const mainComment = isCorrect
    ? `答啱喇！${face.label}就係正確嘅表情。`
    : `答錯咗。${correctLabel ? `正確嘅表情係「${correctLabel}」。` : '再試多次啦！'}`;

  if (currentStudent) {
    // 0 moral-change: completion-only, doesn't shift the moral bar.
    // Still passes subjectId so per-subject progress totals advance.
    markComplete(currentStudent, scenario.id, scenario.topicId, 0, subjectId ?? null);
  }

  return {
    option: { text: face.label, id: face.id },
    moralChange: 0,
    mainComment,
    isCorrect,
    creeds: [],
    creedText: [],
    scenarioImage: scenario.scenarioImage || null,
    scenarioTitle: scenario.title || '',
    outcomeImage: null,
    nextScenario: null,
  };
}

// (initedTopicForStudent is declared at the top of this module so
// setStudent() can clear() it without a forward reference.)

export function initTopicProgress(topicId) {
  if (!currentStudent) return;
  const key = `${currentStudent}|${topicId}`;
  if (initedTopicForStudent.has(key)) return;
  initedTopicForStudent.add(key);
  const topicScenarios = getScenariosByTopic(topicId);
  updateTopicTotal(currentStudent, topicId, topicScenarios.length);
}

export function initSubjectProgress(subjectId) {
  // Sprint 4 / A1: scenarios now carry `subjectId` so we can filter
  // the total to the chosen subject instead of writing all-scenarios
  // (which was misleading — 184 of 259 belong to 'value', 75 to
  // 'caring').
  //
  // Sprint 4 / A1 review fix: the per-topic lazy-load race means the
  // cache may be empty on the first call. We can't write a real total
  // yet, but we MUST leave a breadcrumb so _mergeChunk can re-fire
  // the write when a chunk eventually lands. The setStudent() clear
  // makes the breadcrumb per-student.
  if (!currentStudent || !subjectId) return;
  const key = `${currentStudent}|${subjectId}`;
  const total = getScenarios().filter(s => s.subjectId === subjectId).length;
  if (total === 0 && getScenarios().length === 0) {
    // Cache is empty — defer the write to _mergeChunk. updateSubjectTotal
    // would lock in 0 here (which the default-progress placeholder can't
    // distinguish from "real 0") and then _mergeChunk would skip the
    // update because the value matches.
    _pendingSubjectRefreshes.add(key);
    return;
  }
  updateSubjectTotal(currentStudent, subjectId, total);
}

export function getDisplayProgress() {
  if (!currentStudent) return null;
  return getProgress(currentStudent);
}

export function suggestNext(topicId) {
  const topicScenarios = getScenariosByTopic(topicId);
  if (!currentStudent) return topicScenarios[0] || null;
  const p = getProgress(currentStudent);
  return topicScenarios.find(s => !p.completedScenarios.includes(s.id)) || null;
}
