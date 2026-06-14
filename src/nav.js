// src/nav.js — Single navigation entry point.
//
// Templates migrate to:
//   <button data-action="navigate" data-arg="home" />
//   <button data-action="navigate" data-arg="topic" data-arg2="${escapeAttr(t.id)}" />
//
// While migration is in progress, existing window.FC.goHome etc. are kept as
// backward-compatible aliases. Once all templates use data-action="navigate",
// those aliases can be removed.

import { setView } from './state.js';

/** All navigable view names. Used to validate navigation targets. */
export const NAV_VIEWS = new Set([
  'home', 'topic', 'progress', 'hub', 'settings',
  'subject-select', 'role-select', 'mode-select', 'teacher-assign',
  'login', 'teacher',
  'bank-play', 'bank-result', 'bank-summary',
]);

// Maps view → the key name used in extra for that view's primary arg
const VIEW_ARG_KEY = {
  topic:  'topicId',
  play:   'scenarioId',
  result: 'resultData',
  'bank-result': 'bankResult',
};

/** Single navigation entry point — setView + navRender.
 *
 *  Callable via:
 *    - data-action="navigate" data-arg="home"
 *    - data-action="navigate" data-arg="topic" data-arg2="perseverance"
 *    - navigate('topic', 'perseverance')
 */
export function navigate(target, arg) {
  if (!NAV_VIEWS.has(target)) {
    console.warn(`[nav] unknown view: ${target}`);
    return;
  }
  const extra = {};
  const key = VIEW_ARG_KEY[target];
  if (key && arg !== undefined) extra[key] = arg;
  setView(target, extra);
  // navRender() is defined in main.js — imported after definition to avoid
  // circular dep. We access it as a module-level reference set by main.js.
  if (typeof _navRender === 'function') _navRender();
}

/** Navigate without triggering the View Transition animation.
 *  Use for in-place updates (settings toggles, analytics refresh).
 */
export function navigateQuiet(target, arg) {
  if (!NAV_VIEWS.has(target)) {
    console.warn(`[nav] unknown view: ${target}`);
    return;
  }
  const extra = {};
  const key = VIEW_ARG_KEY[target];
  if (key && arg !== undefined) extra[key] = arg;
  setView(target, extra);
  if (typeof _render === 'function') _render();
}

// ── Set by main.js after render/navRender are defined ───────────────────────────
/** @type {Function|null} */
export let _render = null;
/** @type {Function|null} */
export let _navRender = null;