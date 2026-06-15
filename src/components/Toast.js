// src/components/Toast.js — A11y announcement utilities.
//
// Two parallel surfaces:
//   - SR (screen reader) live region: `<div id="sr-announcer">` already in
//     DOM, written via getSrAnnouncer(). Screen reader auto-announces on
//     textContent change.
//   - Visual toast: 2.5s bottom-of-screen notice for non-SR users, so
//     "scenario loaded", "language switched" etc are still visible.
//
// announceScenarioLoad() composes the title announcement for scenario
// transitions (used by play() and the bank game start).

// Cached reference to getTopic from topics.js (lazy-resolved on first call)
let _getTopic = null;

// SR live region
let _srAnnouncer = null;
function getSrAnnouncer() {
  if (!_srAnnouncer) {
    _srAnnouncer = document.getElementById('sr-announcer');
  }
  return _srAnnouncer;
}

// Visual toast
let _toastEl = null;
let _toastTimer = null;
function getToastEl() {
  if (_toastEl) return _toastEl;
  _toastEl = document.createElement('div');
  _toastEl.id = 'fc-announce-toast';
  _toastEl.setAttribute('role', 'status');
  _toastEl.setAttribute('aria-live', 'polite');
  _toastEl.setAttribute('aria-atomic', 'true');
  // inline CSS — no style.css cascade dependency
  _toastEl.style.cssText = [
    'position: fixed',
    'bottom: 24px',
    'left: 50%',
    'transform: translateX(-50%)',
    'max-width: 90vw',
    'padding: 12px 20px',
    'background: rgba(15, 23, 42, 0.95)',
    'color: #ffffff',
    'border-radius: 12px',
    'box-shadow: 0 8px 24px rgba(0,0,0,0.25)',
    'font-size: 15px',
    'font-weight: 500',
    'line-height: 1.4',
    'text-align: center',
    'z-index: 9999',
    'pointer-events: none',
    'opacity: 0',
    'transition: opacity 0.25s ease-out, transform 0.25s ease-out',
  ].join(';');
  document.body.appendChild(_toastEl);
  return _toastEl;
}

function showAnnounceToast(text) {
  // If cached node detached (e.g. tests removed it), reset cache to re-create
  if (_toastEl && !_toastEl.isConnected) _toastEl = null;
  const rm = document.documentElement.hasAttribute('data-rm');
  const el = getToastEl();
  el.textContent = text;
  el.style.opacity = '1';
  el.style.transform = rm ? 'translateX(-50%)' : 'translateX(-50%) translateY(0)';
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = rm ? 'translateX(-50%)' : 'translateX(-50%) translateY(8px)';
    setTimeout(() => {
      if (el.style.opacity === '0') el.textContent = '';
    }, 300);
  }, 2500);
}

/** Write to SR live region + show visual toast. */
export function announceToSR(text) {
  const live = getSrAnnouncer();
  if (live) {
    // Clear then re-set to trigger re-announce (same value won't re-trigger)
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = text; });
  }
  showAnnounceToast(text);
}

/** Announce a scenario transition (used by play() and bank start).
 *  Async because of lazy topics.js import; callers can fire-and-forget
 *  (the announce sequence is self-contained — late binding is fine).
 */
export async function announceScenarioLoad(scenario, opts = {}) {
  if (!scenario) return;
  if (!_getTopic) {
    const m = await import('../topics.js');
    _getTopic = m.getTopic;
  }
  const topic = scenario.topicId ? _getTopic(scenario.topicId) : null;
  const topicName = topic?.title || '';
  const idx = opts.index;
  const total = opts.total;
  const gameName = opts.gameName || '';
  const parts = [];
  if (idx && total) parts.push(`題目 ${idx}，共 ${total} 題`);
  if (gameName) parts.push(gameName);
  if (topicName) parts.push(`主題：${topicName}`);
  parts.push(`題目：${scenario.title}`);
  announceToSR(parts.join('，'));
}
