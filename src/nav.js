// src/nav.js — Single navigation entry point.
//
// Templates use:
//   <button data-action="navigate" data-arg="home" />
//   <button data-action="navigate" data-arg="topic" data-arg2="${escapeAttr(t.id)}" />
//
// `navigate(target, arg)` resolves target + arg, then calls the
// host-injected `_setView(view, extra)` + `_navRender()` callbacks.
// The host (main.js) wires these once at boot. This avoids a circular
// import between nav.js and the state module.

/** All navigable view names. */
export const NAV_VIEWS = new Set([
  'home', 'topic', 'progress', 'hub', 'settings',
  'subject-select', 'role-select', 'mode-select', 'teacher-assign',
  'login', 'teacher',
  'bank-play', 'bank-result', 'bank-summary',
]);

/** Maps view → the key name used in `extra` for that view's primary arg. */
const VIEW_ARG_KEY = {
  topic: 'topicId',
};

/** Host-injected callbacks. Set once at boot by main.js. */
let _setView = null;
let _navRender = null;
let _render = null;

/** Wire callbacks. Called once at boot by main.js after render functions
 *  are defined. Subsequent calls overwrite (idempotent).
 */
export function wireNav({ setView, navRender, render }) {
  if (setView) _setView = setView;
  if (navRender) _navRender = navRender;
  if (render) _render = render;
}

/** Navigate to a view (with optional primary arg) and trigger the
 *  View Transition animation.
 *
 *  @param {string} target — view name (must be in NAV_VIEWS)
 *  @param {string} [arg]  — primary arg (e.g. topicId)
 */
export function navigate(target, arg) {
  if (!NAV_VIEWS.has(target)) {
    console.warn(`[nav] unknown view: ${target}`);
    return;
  }
  const extra = {};
  const key = VIEW_ARG_KEY[target];
  if (key && arg !== undefined) extra[key] = arg;
  if (_setView) _setView(target, extra);
  if (_navRender) _navRender();
}

/** Navigate without View Transition animation. For in-place updates. */
export function navigateQuiet(target, arg) {
  if (!NAV_VIEWS.has(target)) {
    console.warn(`[nav] unknown view: ${target}`);
    return;
  }
  const extra = {};
  const key = VIEW_ARG_KEY[target];
  if (key && arg !== undefined) extra[key] = arg;
  if (_setView) _setView(target, extra);
  if (_render) _render();
}
