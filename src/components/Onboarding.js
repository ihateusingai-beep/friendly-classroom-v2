// src/components/Onboarding.js
// Sprint 18 P1: First-visit 教學 carousel (3 步) + 「重看教學」入口
//
// 設計原則：
//   - 3 步連續頁面，唔 modal（modal 對 SEN 學生嚟講 focus 容易飄）
//   - 每步有 emoji + 標題 + 描述 + 視覺 mockup
//   - 大掣 (≥48px) 配合 Sprint 18 P0 TTS button bump
//   - 「略過」任何一步都會 end onboarding
//   - 完成時 set fc_onboarding_done = true → 唔再 show
//   - 「重看教學」喺 settings 入面,清 flag + re-show

import { STORAGE_KEYS, get, set } from '../storage.js';
import { escapeAttr } from '../util/escape.js';
import { renderPageHeader } from './blocks.js';

/** 3 steps. Keep content 短 — 對 SEN 學生嚟講長 description 會 split focus. */
const SLIDES = [
  {
    emoji: '👆',
    title: '揀你嘅選擇',
    desc: '每個情境都有幾個選項。睇完題目之後，撳你想做嘅嗰個。',
    mock: () => `
      <div class="onboarding-mock-option">
        <div class="mock-option-card">
          <span class="mock-badge">1</span>
          <span class="mock-text">範例選項</span>
        </div>
        <div class="mock-option-card">
          <span class="mock-badge">2</span>
          <span class="mock-text">另一個選項</span>
        </div>
      </div>
    `,
  },
  {
    emoji: '🔊',
    title: '聆聽題目',
    desc: '撳大聲公圖示就可以聽題目讀出嚟。細路啱啱學字，呢個功能好有用。',
    mock: () => `
      <div class="onboarding-mock-voice">
        <div class="mock-scenario">
          <span class="mock-text">題目：陌生人話買嘢…</span>
          <button type="button" class="mock-voice-btn" aria-label="朗讀題目" tabindex="-1">🔊</button>
        </div>
        <div class="onboarding-hint">個掣而家有 48×48，唔再細過一撳就中！</div>
      </div>
    `,
  },
  {
    emoji: '💭',
    title: '停一停想一想',
    desc: '答錯咗會見到一個反思卡。唔好急住做，慢慢諗點解咁做唔啱。',
    mock: () => `
      <div class="onboarding-mock-think">
        <div class="mock-think-card">
          <div class="mock-emoji">🤔</div>
          <div class="mock-title">停一停想一想</div>
          <div class="mock-text">下次可以點做？</div>
          <div class="mock-voice-row">
            <button type="button" class="mock-voice-pill" tabindex="-1">🔊 答案</button>
            <button type="button" class="mock-voice-pill" tabindex="-1">🔊 反思</button>
          </div>
        </div>
      </div>
    `,
  },
];

// ── Step state（module-level, 因為 onboarding 流程 short-lived）──
// reset to 0 every time onboarding is freshly opened (boot OR 重看教學).
let _currentStep = 0;

function _setStep(n) {
  _currentStep = Math.max(0, Math.min(SLIDES.length - 1, n));
}

function _slideHTML(slide, index) {
  return `
    <div class="onboarding-step" role="group" aria-label="第 ${index + 1} 步，共 ${SLIDES.length} 步">
      <div class="onboarding-emoji" aria-hidden="true">${slide.emoji}</div>
      <h2 class="onboarding-title">${escapeAttr(slide.title)}</h2>
      <p class="onboarding-desc">${escapeAttr(slide.desc)}</p>
      <div class="onboarding-mock">${slide.mock()}</div>
    </div>
  `;
}

function _dotsHTML(active) {
  return `
    <div class="onboarding-dots" aria-hidden="true">
      ${SLIDES.map((_, i) => `<span class="dot${i === active ? ' active' : ''}"></span>`).join('')}
    </div>
  `;
}

/** Main render. Returns full HTML string for the onboarding view. */
export function renderOnboarding() {
  const slide = SLIDES[_currentStep];
  const isLast = _currentStep === SLIDES.length - 1;
  const ctaLabel = isLast ? '開始啦 🚀' : '下一頁 →';

  return `
    <div class="container fade-in onboarding-container">
      ${renderPageHeader({ emoji: slide.emoji, title: '教學', back: null })}

      <div class="onboarding-wrap" role="region" aria-label="首次使用教學">
        ${_slideHTML(slide, _currentStep)}
        ${_dotsHTML(_currentStep)}

        <div class="onboarding-actions">
          <button type="button" class="btn btn-outline" data-action="onboardingSkip"
            aria-label="略過教學，直接開始">略過</button>
          <button type="button" class="btn btn-primary onboarding-cta" data-action="onboardingNext"
            autofocus aria-label="${escapeAttr(ctaLabel)}">${ctaLabel}</button>
        </div>
      </div>
    </div>
  `;
}

// ── Handler helpers (callable from main.js / actions) ──

/** Advance to next slide OR finish if on last.
 *  @returns {number} new step index (0..SLIDES.length-1), or -1 if we
 *   just finished (caller should navigate away). */
export function onboardingNext() {
  if (_currentStep >= SLIDES.length - 1) {
    finishOnboarding();
    return -1;  // signal: caller should transition to role-select
  }
  _setStep(_currentStep + 1);
  return _currentStep;
}

/** Skip to end + mark done. */
export function onboardingSkip() {
  finishOnboarding();
  return -1;  // signal: caller should transition to role-select
}

/** Mark done, reset step, caller should setView('role-select'). */
export function finishOnboarding() {
  set(STORAGE_KEYS.ONBOARDING_DONE, true);
  _currentStep = 0;
}

/** Reset step to 0 (called by 「重看教學」 before re-rendering).
 *  Note: does NOT clear the done flag — caller should clear it first
 *  via `remove(STORAGE_KEYS.ONBOARDING_DONE)` if they want a re-show. */
export function resetOnboarding() {
  _currentStep = 0;
}

/** True if first-visit (no fc_onboarding_done flag yet). */
export function needsOnboarding() {
  return get(STORAGE_KEYS.ONBOARDING_DONE, false) !== true;
}

/** Total number of slides — exported for tests. */
export const ONBOARDING_SLIDE_COUNT = SLIDES.length;

/** Pure helper for tests: render the i-th slide HTML in isolation. */
export function _renderSlideForTest(i) {
  if (i < 0 || i >= SLIDES.length) return '';
  return _slideHTML(SLIDES[i], i);
}
