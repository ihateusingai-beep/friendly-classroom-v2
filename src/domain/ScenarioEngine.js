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
}

// ── Student ──
export function setStudent(name) {
  currentStudent = name;
  // 換學生後 init cache 都要清返，避免撈到舊學生嘅 record
  initedTopicForStudent.clear();
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
  // 'caring'). Per-topic lazy load means the cache may still be empty
  // on the first call; the next render after a chunk lands will
  // re-enter here with a real value. updateSubjectTotal() skips the
  // storage write when the value hasn't changed, so this is safe to
  // call every render.
  if (!currentStudent || !subjectId) return;
  const total = getScenarios().filter(s => s.subjectId === subjectId).length;
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
