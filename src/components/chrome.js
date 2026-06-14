// src/components/chrome.js
// Shared UI chrome: footer, empty state, loading skeleton.
// Phase 2 (S6 + S7) — collapses 16 verbatim footer copies, 5 inline
// "no record" / "failed" strings, and 2 "載入中..." strings into one helper.

/**
 * App footer with copyright. Used at the bottom of every rendered view.
 * @param {Object} [opts]
 * @param {string} [opts.marginTop='auto'] — CSS margin-top, defaults to flex auto
 * @returns {string} HTML string
 */
export function renderFooter({ marginTop = 'auto' } = {}) {
  return `<div class="footer" style="margin-top:${marginTop}">© Ken Cheng 製作</div>`;
}

/**
 * Generic empty / error state. Replaces the 5 different "X 載入失敗" /
 * "冇紀錄" / "場景不存在" inline strings scattered across engine.js.
 *
 * @param {Object} opts
 * @param {string} [opts.emoji]  — leading emoji, e.g. '⚠️', '📭', '🫥'
 * @param {string} opts.title    — primary message
 * @param {string} [opts.hint]   — secondary line
 * @param {string} [opts.actionLabel] — primary action button label
 * @param {string} [opts.onAction]   — onclick handler string, e.g. "FC.goHome()"
 * @returns {string} HTML string
 */
export function renderEmptyState({
  emoji = '🫥',
  title,
  hint = '',
  actionLabel = '',
  onAction = '',
} = {}) {
  return `
    <div class="container fade-in">
      <div class="card" style="text-align:center;padding:32px 20px">
        <div style="font-size:3em;margin-bottom:12px" aria-hidden="true">${emoji}</div>
        <h2 style="margin-bottom:8px">${title}</h2>
        ${hint ? `<p style="color:var(--text-light);margin-bottom:16px">${hint}</p>` : ''}
        ${actionLabel && onAction
          ? `<button type="button" class="btn btn-primary" onclick="${onAction}">${actionLabel}</button>`
          : ''}
      </div>
    </div>
  `;
}

/**
 * Skeleton loading placeholder. Used for in-page async refresh (sync
 * status badges) — not for full-page loads.
 *
 * @param {Object} [opts]
 * @param {string} [opts.width]  — CSS width, e.g. '80px', '100%'
 * @param {'sm'|'md'|'block'} [opts.size='sm']
 * @returns {string} HTML string
 */
export function renderSkeleton({ width = '100%', size = 'sm' } = {}) {
  const cls = size === 'block' ? 'skeleton skeleton-block' : `skeleton skeleton-text-${size}`;
  return `<span class="${cls}" style="width:${width}"></span>`;
}

/**
 * Inline loading text. Replaces the 2 hard-coded "載入中..." strings in
 * main.js render() dispatcher.
 */
export function renderLoading(label = '載入中…') {
  return `<div class="container"><p>${label}</p></div>`;
}
