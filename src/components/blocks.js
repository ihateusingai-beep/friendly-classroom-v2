// src/components/blocks.js — Reusable render helpers for common UI patterns.
//
// Reduces template duplication:
//   - renderPageHeader  : replaces 10× <div class="page-header">...</div>
//   - renderOptionCard  : replaces inline option rendering in renderPlay + renderBankPlay
//   - renderEmptyState  : already in chrome.js — re-exported here for convenience

import { escapeAttr } from '../util/escape.js';
import { renderFooter, renderEmptyState, renderLoading, renderSkeleton } from './chrome.js';

export { renderFooter, renderEmptyState, renderLoading, renderSkeleton };

// ── Page Header ────────────────────────────────────────────────────────────────

/** Standard page header with optional back button.
 *
 *  @param {{
 *    emoji?:      string,   // emoji before title, e.g. '🎮'
 *    title:       string,   // main heading text
 *    back?:       string,   // navigate target for back button (e.g. 'home')
 *    backLabel?:  string,   // aria-label for back button (default: '返回')
 *    backArg?:    string,   // data-arg2 for back button (e.g. topicId)
 *    rightButton?: string,  // extra HTML to render on the right (e.g. switch button)
 *    noHeader?:   boolean,  // skip wrapping div.page-header, just return content
 *  }} cfg
 */
export function renderPageHeader({ emoji, title, titleHTML, back, backLabel = '返回', backArg, rightButton, noHeader = false }) {
  let content = '';
  if (back) {
    const extra = backArg !== undefined ? ` data-arg2="${escapeAttr(backArg)}"` : '';
    content += `<button type="button" class="back-btn" data-action="navigate" data-arg="${escapeAttr(back)}"${extra} aria-label="${escapeAttr(backLabel)}">←</button>`;
  }
  content += titleHTML !== undefined
    ? titleHTML
    : `<h1>${emoji ? emoji + ' ' : ''}${title}</h1>`;
  if (rightButton) content += rightButton;
  if (noHeader) return content;
  return `<div class="page-header">${content}</div>`;
}
  // ── Option Card ──────────────────────────────────────────────────────────────

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

/** One option card button for a scenario.
 *
 *  @param {{
 *    scenarioId:    string,
 *    opt:          { id: string, text: string, moralChange?: number },
 *    index:        number,   // 0-based option index
 *    isBank?:      boolean, // bank game: use bank-choose action
 *    showMoral?:   boolean, // show moral value badge (normal play only)
 *  }} cfg
 */
export function renderOptionCard({ scenarioId, opt, index, isBank = false, showMoral = false }) {
  const label = OPTION_LABELS[index] || String(index + 1);
  const action = isBank ? 'bankChoose' : 'choose';
  const imgSrc = `assets/images/outcomes/${scenarioId}_opt${index + 1}.png`;

  // Derive moral change: prefer opt.moralChange; fall back to effects[0].moralChange
  // (original renderPlay extracted from effects[] for the play scenarios).
  const firstEffect = (opt.effects || [])[0];
  const mc = opt.moralChange !== undefined
    ? Number(opt.moralChange)
    : (firstEffect ? Number(firstEffect.moralChange || 0) : 0);

  let moralHtml = '';
  if (showMoral) {
    const valueLabel = mc > 0 ? `＋${mc} 道德` : mc < 0 ? `${mc} 道德` : '中性';
    const valueClass = mc > 0 ? 'good' : mc < 0 ? 'bad' : 'neutral';
    moralHtml = `<span class="opt-value opt-value-${valueClass}" aria-hidden="true">${valueLabel}</span>`;
  }

  return `
    <button type="button" class="option-card" data-action="${action}" data-arg="${escapeAttr(opt.id)}"
      aria-label="選項 ${label}：${escapeAttr(opt.text)}">
      <img src="${imgSrc}" alt="" class="opt-thumb" loading="lazy" decoding="async" aria-hidden="true" />
      <span class="opt-badge" aria-hidden="true">${label}</span>
      <span class="opt-text">${opt.text}</span>
      ${moralHtml}
      <button type="button" class="opt-read"
        data-action="speakOpt" data-arg="${escapeAttr(opt.id)}"
        title="朗讀呢個選項"
        aria-label="朗讀選項 ${label}">🔊</button>
    </button>
  `;
}

/** Options list for a scenario (renders all option cards).
 *
 *  @param {{
 *    scenarioId:   string,
 *    options:      Array<{ id: string, text: string, moralChange?: number }>,
 *    isBank?:      boolean,
 *    showMoral?:   boolean,
 *    scenarioTitle?: string,
 *  }} cfg
 */
export function renderOptions({ scenarioId, options, isBank = false, showMoral = false, scenarioTitle = '' }) {
  const cards = options.map((opt, i) =>
    renderOptionCard({ scenarioId, opt, index: i, isBank, showMoral })
  ).join('');
  return `
    <div class="options-divider" aria-hidden="true">— 揀你嘅選擇 —</div>
    <div class="options" role="radiogroup" aria-label="${escapeAttr(scenarioTitle)} 嘅選擇題">
      ${cards}
    </div>
  `;
}

// ── Bank-Specific Option Card ───────────────────────────────────────────────

/** One option card for the bank game (uses bankChoose action, no moral badge).
 */
export function renderBankOptionCard({ scenarioId, opt, index }) {
  const label = OPTION_LABELS[index] || String(index + 1);
  const imgSrc = `assets/images/outcomes/${scenarioId}_opt${index + 1}.png`;
  return `
    <button type="button" class="option-card" data-action="bankChoose" data-arg="${escapeAttr(opt.id)}"
      aria-label="選項 ${label}：${escapeAttr(opt.text)}">
      <img src="${imgSrc}" alt="" class="opt-thumb" loading="lazy" decoding="async" aria-hidden="true" />
      <span class="opt-badge" aria-hidden="true">${label}</span>
      <span class="opt-text">${opt.text}</span>
      <button type="button" class="opt-read"
        data-action="speakOpt" data-arg="${escapeAttr(opt.id)}"
        title="朗讀呢個選項"
        aria-label="朗讀選項 ${label}">🔊</button>
    </button>
  `;
}

// ── Face Option Card (Sprint 23 / SPEC §23 — 情緒小偵探) ──────────────────

/** One face option card for emotion-detective scenarios.
 *  Reuses data-action="choose" so the existing Play.choose() handler
 *  + ScenarioEngine.chooseOption() face branch handle it the same way
 *  as a text option — the only difference is the visual: full-bleed
 *  face image + emotion label (no moral badge).
 *
 *  @param {{
 *    scenarioId: string,
 *    face:      { id: string, label: string, image: string, correct: boolean },
 *    index:     number,
 *  }} cfg
 */
export function renderFaceOptionCard({ scenarioId, face, index }) {
  const label = OPTION_LABELS[index] || String(index + 1);
  return `
    <button type="button" class="face-option" data-action="choose" data-arg="${escapeAttr(face.id)}"
      aria-label="表情 ${label}：${escapeAttr(face.label)}">
      <img src="${escapeAttr(face.image)}" alt="" class="face-thumb" loading="lazy" decoding="async" aria-hidden="true" />
      <span class="face-badge" aria-hidden="true">${label}</span>
      <span class="face-label">${escapeAttr(face.label)}</span>
      <button type="button" class="opt-read"
        data-action="speakOpt" data-arg="${escapeAttr(face.id)}"
        title="朗讀「${escapeAttr(face.label)}」"
        aria-label="朗讀表情 ${label}：${escapeAttr(face.label)}">🔊</button>
    </button>
  `;
}