// 語音朗讀 — 預生成 MP3 架構
// 所有音頻預生成於 /public/audio/，零依賴、零延遲

// Sprint 16: Result 頁 TTS 擴展 (SPEC §17.4.2) — strip emoji / truncate / formatStopAndThink helpers
import {
  stripEmojiForTTS,
  formatStopAndThinkForTTS,
} from './domain/Feedback.js';
// Sprint 27 D1: warm-theme flag check (default OFF)
import { isFeatureEnabled } from './constants/feature-flags.js';

const audioBase = 'audio/';

// ── Web Audio API 遊戲音效（零延遲，唔需要外部檔案）──
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

export function playSFX(type) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const g = gain.gain;

    switch (type) {
      case 'click':
        // 短促點擊
        osc.frequency.value = 800;
        osc.type = 'sine';
        g.setValueAtTime(0.15, now);
        g.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      case 'hover':
        // 柔和tick
        osc.frequency.value = 600;
        osc.type = 'sine';
        g.setValueAtTime(0.06, now);
        g.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'success':
        // 上行階梯音
        osc.frequency.value = 523; // C5
        osc.type = 'sine';
        g.setValueAtTime(0.18, now);
        osc.start(now);
        osc.frequency.setValueAtTime(659, now + 0.1); // E5
        osc.frequency.setValueAtTime(784, now + 0.2); // G5
        g.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.stop(now + 0.45);
        break;
      case 'fail':
        // 柔和下行音
        osc.frequency.value = 400;
        osc.type = 'sine';
        g.setValueAtTime(0.12, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        g.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'celebrate':
        // 慶祝和弦
        [523, 659, 784].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const gg = ctx.createGain();
          o.connect(gg);
          gg.connect(ctx.destination);
          o.frequency.value = freq;
          o.type = 'sine';
          gg.gain.setValueAtTime(0.12, now + i * 0.08);
          gg.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + i * 0.08);
          o.start(now + i * 0.08);
          o.stop(now + 0.65 + i * 0.08);
        });
        break;
      case 'complete':
        // 完成音 — 三連上行
        [523, 659, 784, 1047].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const gg = ctx.createGain();
          o.connect(gg);
          gg.connect(ctx.destination);
          o.frequency.value = freq;
          o.type = 'triangle';
          gg.gain.setValueAtTime(0.14, now + i * 0.07);
          gg.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + i * 0.07);
          o.start(now + i * 0.07);
          o.stop(now + 0.55 + i * 0.07);
        });
        break;
    }
  } catch (e) {
    console.warn('[FC SFX] Error:', e.message);
  }
}

// 自動為所有 .btn 掛鉤 SFX
export function initSFX() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (btn) playSFX('click');
  });
  document.addEventListener('mouseover', (e) => {
    const btn = e.target.closest('.btn');
    if (btn) playSFX('hover');
  });
}

let enabled = (typeof localStorage === 'undefined')
  ? true
  : localStorage.getItem('fc_voice_seen') !== '0';
let speaking = false;
let currentAudio = null;

// ── TTS 語言設定 ──
// 用戶可自選：auto（auto-detect 跟 OS 預設）/ zh-HK（粵語）/ zh-TW（國語 — 兩岸通用 zh-TW fallback）/ zh-CN（普通話）
export const TTS_LANGS = [
  { id: 'auto',  label: '自動（按系統預設）',  hint: '跟 OS 第一個中文 voice' },
  { id: 'zh-HK', label: '🇭🇰 粵語（香港）',    hint: '需要 OS/browser 裝咗粵語 voice' },
  { id: 'zh-TW', label: '🇹🇼 國語（台灣 / 普通話通用）', hint: 'zh-TW 中文 voice, 兩岸都聽得明' },
  { id: 'zh-CN', label: '🇨🇳 普通話（中國大陸）', hint: 'zh-CN 中文 voice' },
];

// 持久化嘅當前用戶選擇
// 第一次 load 冇 fc_tts_lang 紀錄時：預設 'zh-HK'（target 用戶係香港人）
// 之後 user 揀 'auto' 先用 fallback chain
const _savedLang = localStorage.getItem('fc_tts_lang');
let currentLang = _savedLang || 'zh-HK';
if (!_savedLang) {
  // 寫返 localStorage，等之後 renderSettings 直接讀到
  try { localStorage.setItem('fc_tts_lang', currentLang); } catch {}
}

// Cache 已揀嘅 voice object — 避免每次 speak() 都重新 scan 全 list
let cachedVoice = null;

// One-shot check after voices load: if user is on a system without a
// zh-HK voice, surface a hint in the settings page so they can install
// one (macOS Sin-ji / Windows zh-HK speech pack). Idempotent.
let _zhHkWarningInstalled = false;
function _maybeShowZhHkWarning() {
  if (_zhHkWarningInstalled) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  ensureVoicesLoaded().then(voices => {
    if (!voices || !voices.length) return;
    const hasZhHk = voices.some(v => v.lang === 'zh-HK');
    if (hasZhHk) return;
    // Defer so the settings DOM (if present) is in place
    setTimeout(() => {
      const el = document.getElementById('tts-voice-warning');
      if (el) el.style.display = 'block';
    }, 0);
    _zhHkWarningInstalled = true;
  }).catch(() => {});
}

// Visual feedback: when TTS is speaking, add the `.speaking` class to
// every visible voice button (inline + voice-fab) so the user gets a
// pulse animation. Idempotent so onstart/onend don't double-toggle.
function _setVoiceButtonsSpeaking(on) {
  try {
    const btns = document.querySelectorAll(
      '[data-action="speak"], [data-action="speakOpt"], [data-action="speakCreeds"]'
    );
    for (const btn of btns) btn.classList.toggle('speaking', !!on);
  } catch {}
}

// 確保 voices loaded（Web Speech API voices 係 async load，唔可以 assume 同步 ready）
let voicesLoadedPromise = null;
function ensureVoicesLoaded() {
  if (voicesLoadedPromise) return voicesLoadedPromise;
  voicesLoadedPromise = new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth) return resolve([]);
    let voices = synth.getVoices();
    if (voices.length > 0) return resolve(voices);
    // voices 仲未 load 完，bind event handler
    const handler = () => {
      voices = synth.getVoices();
      if (voices.length > 0) {
        synth.removeEventListener('voiceschanged', handler);
        resolve(voices);
      }
    };
    synth.addEventListener('voiceschanged', handler);
    // 5 秒 timeout，避免 user 喺無 voice 嘅環境 hang 住
    setTimeout(() => resolve(synth.getVoices() || []), 5000);
  });
  return voicesLoadedPromise;
}

// 根據 currentLang 同 OS voice list 揀 best match；只喺 lang 變 / voice list 變時先 re-compute
async function pickBestVoice() {
  const voices = await ensureVoicesLoaded();
  if (!voices.length) return null;
  // Side-effect: surface a hint if no zh-HK voice is installed
  _maybeShowZhHkWarning();

  // user explicit 揀咗 lang
  if (currentLang !== 'auto') {
    const exact = voices.find(v => v.lang === currentLang);
    if (exact) return exact;
    // 例如 user 揀 zh-HK 但 OS 冇 → 揀最接近嘅
    return _pickBestVoiceForLang(currentLang);
  }

  // auto mode: 跟原本 fallback chain（zh-HK > zh-TW > zh-CN > zh > voices[0]）
  return voices.find(v => v.lang === 'zh-HK') ||
         voices.find(v => v.lang === 'zh-TW') ||
         voices.find(v => v.lang === 'zh-CN') ||
         voices.find(v => v.lang.includes('zh')) ||
         voices[0] ||
         null;
}

// ── 參數讀取 ──
function getParams() {
  return {
    speed: parseFloat(localStorage.getItem('fc_tts_speed') || '0.85'),
    fontSize: parseInt(localStorage.getItem('fc_font_size') || '18'),
    lineHeight: parseFloat(localStorage.getItem('fc_line_height') || '1.5'),
    spacing: localStorage.getItem('fc_spacing') || 'medium',
    highContrast: localStorage.getItem('fc_hc_mode') === '1',
    reducedMotion: localStorage.getItem('fc_rm_mode') === '1',
  };
}

// Sprint 27 D1: warm-theme attribute setter. Called from applyCSS() below.
// Kept separate so a teacher dashboard (future) could toggle without going
// through audio.js settings.
function _applyWarmThemeAttr(enabled) {
  const root = document.documentElement;
  if (enabled) root.setAttribute('data-warm-theme', 'true');
  else root.removeAttribute('data-warm-theme');
}

function _isWarmThemeOn() {
  try { return isFeatureEnabled('WARM_THEME'); } catch { return false; }
}

export function applyCSS() {
  const p = getParams();
  const spacingMap = { narrow: '8px', medium: '16px', wide: '28px' };
  const root = document.documentElement;
  root.style.setProperty('--fc-font-size', p.fontSize + 'px');
  root.style.setProperty('--fc-line-height', p.lineHeight);
  root.style.setProperty('--fc-spacing', spacingMap[p.spacing] || '16px');
  // HC mode: toggle data-hc attribute on <html>，CSS 跟住做 override
  if (p.highContrast) root.setAttribute('data-hc', 'true');
  else root.removeAttribute('data-hc');
  // Reduced motion mode: toggle data-rm attribute on <html>，CSS 跟住做 override
  if (p.reducedMotion) root.setAttribute('data-rm', 'true');
  else root.removeAttribute('data-rm');
  // Sprint 27 D1: warm theme (emerald + cream) — default OFF, opt-in via
  // FLAGS.WARM_THEME. CSS overrides come from :root[data-warm-theme="true"]
  // block in style.css so the rest of the design tokens cascade naturally.
  try {
    _applyWarmThemeAttr(Boolean(_isWarmThemeOn()));
  } catch {
    _applyWarmThemeAttr(false);
  }
}

/** Toggle reduced-motion mode (Sprint 14.2 — guards against
 *  the settings page's `data-action="toggleReducedMotion"` button
 *  that was previously a silent no-op). Reads current state from
 *  localStorage, flips, writes back, re-applies CSS. */
export function setReducedMotion(value) {
  localStorage.setItem('fc_rm_mode', value ? '1' : '0');
  applyCSS();
}

// ── 音頻播放 ──
export function setEnabled(v) { enabled = v; }
export function isEnabled() { return enabled; }
export function isSpeaking() { return speaking; }

export function stopSpeaking() {
  speaking = false;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

export function setSpeaking(v) { speaking = v; }

// 播放本地 MP3（預生成）
function playLocal(src, onFallback) {
  stopSpeaking();
  const url = audioBase + src;
  console.log('[FC Audio] Playing:', url);
  currentAudio = new Audio(url);
  currentAudio.onended = () => { speaking = false; currentAudio = null; _setVoiceButtonsSpeaking(false); console.log('[FC Audio] Done'); };
  currentAudio.onerror = (e) => {
    console.error('[FC Audio] Error loading', url, '-', e?.message || e?.type || 'unknown');
    speaking = false;
    currentAudio = null;
    _setVoiceButtonsSpeaking(false);
    if (typeof onFallback === 'function') {
      console.log('[FC Audio] Falling back to TTS for', src);
      onFallback();
    }
  };
  currentAudio.play().then(() => { _setVoiceButtonsSpeaking(true); }).catch(e => {
    console.error('[FC Audio] Play failed:', e.message);
    speaking = false;
    currentAudio = null;
    if (typeof onFallback === 'function') onFallback();
  });
  speaking = true;
  _setVoiceButtonsSpeaking(true);
}

// 播放場景音頻// 播放場景音頻
export function speakScenario(scenario) {
  console.log('[FC Audio] speakScenario called, enabled:', enabled, 'speaking:', speaking, 'scenario:', scenario);
  if (!enabled) { console.log('[FC Audio] Blocked: voice not enabled'); return; }
  if (speaking) { console.log('[FC Audio] Blocked: already speaking'); return; }
  const id = scenario?.id || scenario;
  // Sprint 23 (SPEC §23): emotion-detective scenarios use `question` instead of `description`.
  // Fall back to `question` so the same data-action="speak" handler works for both.
  const text = scenario?.description || scenario?.question || '';
  console.log('[FC Audio] Playing scenario:', id);
  // 直接 Web Speech API TTS（跳過 MP3）
  speak(text);
}

// 播放信條音頻
// Sprint 5/6 fix: 學生信條永遠用 TTS 粵語 (zh-HK) 直讀, 唔用 MP3 fallback。
// 原因：原本嘅 10 條 creed-*.mp3 係 6 月 2 日用 Hermes mmx + Cantonese_GentleLady
// voice 生成嘅, 但 mmx API key 已經 expired, 重新 generate 唔到粵語 MP3。
// 而家嘅 MP3 係國語, 對香港 SEN 學生係 a11y regression。TTS Web Speech API 直接用
// 系統 zh-HK voice 朗讀, 唔需要預先生成 MP3, 唔 overwrite user 嘅 lang setting。
export function speakCreeds(creeds) {
  if (!enabled || speaking) return;
  if (!creeds || creeds.length === 0) return;
  // 只播放第一條信條
  const creed = creeds[0];
  const text = creed.text || '';
  if (!text) return;
  // langOverride='zh-HK' 強制用粵語 voice, 不影響 user 嘅 settings 偏好
  // (currentLang / cachedVoice 唔被改)。`_pickBestVoiceForLang` 即時
  // resolve 一個 zh-HK voice 唔 cache 落 module state。
  speak(text, 'zh-HK');
}

// 通用朗讀（使用 Web Speech API — Instant TTS，零延遲）
// Optional `langOverride` 強制用特定 lang（e.g. speakCreeds() 強制 zh-HK），
// 唔影響 user 嘅 settings 偏好。
// Optional `opts` = { pitch?, rate? } overrides per-utterance prosody
// (Sprint 23 / SPEC §22.16.2 — Cantonese emotion prosody map for emotion-detective).
// pitch/rate 唔傳 = 用 default (pitch 1.0, rate = user settings.speed)。
export async function speak(text, langOverride = null, opts = null) {
  if (!text) return;
  // Don't interrupt an in-flight chained speak (SPEC §22.16.3) — the chain
  // is a deliberate sequence (e.g. question + 3 face labels for repeat
  // exposure). Interrupting it would orphan the remaining parts.
  if (speaking && !_chainActive) window.speechSynthesis?.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const effectiveLang = langOverride
    || (currentLang === 'auto' ? 'zh-HK' : currentLang);
  utterance.lang = effectiveLang;
  utterance.rate = (opts && typeof opts.rate === 'number')
    ? opts.rate
    : (getParams().speed || 0.85);
  utterance.pitch = (opts && typeof opts.pitch === 'number')
    ? opts.pitch
    : 1.0;
  // 揾 voice：override 嘅 lang 唔影響 user cache (cachedVoice), 用
  // 獨立 lang code 即時 re-resolve。
  const voice = langOverride
    ? await _pickBestVoiceForLang(langOverride)
    : await pickBestVoice();
  if (voice) {
    utterance.voice = voice;
    console.log('[FC TTS] Voice:', voice.name, '(' + voice.lang + ')');
  } else {
    console.warn('[FC TTS] No matching voice found for', effectiveLang);
  }
  utterance.onstart = () => { speaking = true; _setVoiceButtonsSpeaking(true); console.log('[FC TTS] Speaking:', text.slice(0, 30)); };
  utterance.onend = () => { speaking = false; _setVoiceButtonsSpeaking(false); console.log('[FC TTS] Done'); };
  utterance.onerror = (e) => {
    speaking = false; _setVoiceButtonsSpeaking(false);
    console.error('[FC TTS] Error:', e.error);
    if (e.error === 'not-allowed') {
      console.log('[FC TTS] Autoplay blocked — user must interact first. Suggest enabling TTS in settings.');
    }
  };
  window.speechSynthesis?.speak(utterance);
}

// ── Sprint 23 / SPEC §22.16.2 — Cantonese emotion prosody map ────────────────
//
// For emotion-detective scenarios, we modulate TTS pitch + rate per emotion
// label so the audio cue reinforces the visual face cue (key for ASD learners
// who struggle with cross-modal generalization). Range is conservative —
// Web Speech API artifacts show up above ~1.4 pitch / 1.2 rate, so we stay
// in [0.7, 1.35] × [0.7, 1.05].
//
// Map keys MUST match the `face.label` strings in emotion-detective.json.
// Tested in tests/sprint23-emotion-detective.test.js (Phase 3 — Emotion
// prosody coverage).
export const _EMOTION_PROSODY = {
  '開心':   { pitch: 1.20, rate: 0.95 },  // happy: higher pitch, upbeat rate
  '喊':     { pitch: 0.85, rate: 0.70 },  // crying: lower pitch, slow
  '嬲':     { pitch: 0.90, rate: 0.95 },  // angry: slightly lower, intense
  '驚':     { pitch: 1.25, rate: 1.00 },  // scared: high pitch, arousal
  '驚訝':   { pitch: 1.35, rate: 1.05 },  // surprised: peak pitch, fast
  '厭惡':   { pitch: 0.95, rate: 0.80 },  // disgust: mid-low, slow
  '尷尬':   { pitch: 1.05, rate: 0.85 },  // embarrassed: mid, nervous
  '攰':     { pitch: 0.85, rate: 0.70 },  // tired: low, slow
  '困惑':   { pitch: 1.05, rate: 0.85 },  // confused: mid-high, uncertain
  '驕傲':   { pitch: 1.10, rate: 0.90 },  // proud: mid-high, confident
};

/** Look up the prosody override for an emotion label.
 *  Returns `null` if the label is not in the map — caller should pass
 *  null to `speak()` to keep the neutral prosody.
 *  @param {string|null|undefined} label
 *  @returns {{pitch: number, rate: number}|null}
 */
export function getEmotionProsody(label) {
  if (!label || typeof label !== 'string') return null;
  return _EMOTION_PROSODY[label] || null;
}

/** Speak a piece of text with emotion-tuned prosody.
 *  Convenience wrapper around `speak()` that looks up the emotion label
 *  in `_EMOTION_PROSODY` and applies `{pitch, rate}` override.
 *  No-op if `emotionLabel` is missing/null/unknown — falls back to the
 *  neutral prosody.
 *
 *  @param {string} text         — what to say
 *  @param {string|null} emotionLabel — Cantonese emotion word (e.g. "開心")
 *  @param {string|null} langOverride — optional lang override (e.g. 'zh-HK')
 */
export async function speakEmotion(text, emotionLabel, langOverride = null) {
  if (!text) return;
  const prosody = getEmotionProsody(emotionLabel);
  return speak(text, langOverride, prosody);
}

// ── Sprint 23 / SPEC §22.16.3 — Chained TTS for repeat exposure ─────────────
//
// `speak()` cancels any in-flight utterance on each call, which is wrong
// for the emotion-detective "再聽一次" repeat exposure flow: we want to
// queue [question, face1, face2, face3] and have them play sequentially
// with a short pause between.
//
// `speakChained(parts)` walks the parts list and uses each utterance's
// `onend` to fire the next. The module-level `_chainActive` flag is checked
// by `speak()` so a stray single-shot speak call doesn't kill the chain.
//
// Each part: { text: string, emotion?: string|null }
//   - `text` is required; empty parts are skipped
//   - `emotion` is a Cantonese emotion label looked up in `_EMOTION_PROSODY`
//     to apply per-utterance pitch/rate overrides
let _chainActive = false;

export function isChainedSpeaking() {
  return _chainActive;
}

export async function speakChained(parts) {
  if (!Array.isArray(parts) || parts.length === 0) return;
  // Filter empty parts
  const queue = parts.filter((p) => p && typeof p.text === 'string' && p.text.trim());
  if (queue.length === 0) return;
  // If a single-shot speak() is in flight, cancel it first so we own the synth
  if (speaking) window.speechSynthesis?.cancel();
  _chainActive = true;
  _setVoiceButtonsSpeaking(true);

  let idx = 0;
  const playNext = async () => {
    if (idx >= queue.length) {
      _chainActive = false;
      speaking = false;
      _setVoiceButtonsSpeaking(false);
      return;
    }
    const part = queue[idx++];
    const prosody = getEmotionProsody(part.emotion);
    const utterance = new SpeechSynthesisUtterance(part.text);
    utterance.lang = (currentLang === 'auto' ? 'zh-HK' : currentLang);
    utterance.rate = (prosody && typeof prosody.rate === 'number')
      ? prosody.rate
      : (getParams().speed || 0.85);
    utterance.pitch = (prosody && typeof prosody.pitch === 'number')
      ? prosody.pitch
      : 1.0;
    const voice = await pickBestVoice();
    if (voice) utterance.voice = voice;
    utterance.onstart = () => { speaking = true; };
    utterance.onend = () => { speaking = false; playNext(); };
    utterance.onerror = () => {
      speaking = false;
      _chainActive = false;
      _setVoiceButtonsSpeaking(false);
      console.error('[FC TTS Chained] Error on part', idx, '— chain aborted');
    };
    window.speechSynthesis?.speak(utterance);
  };
  await playNext();
}

// One-shot voice resolver for a specific lang code. Doesn't touch the
// module-level cachedVoice (user preference).
//
// Cantonese-first fallback order: zh-HK → zh-TW (台灣國語) → zh-CN (普通話)
// → 任何 zh-prefixed voice. macOS 預設冇 zh-HK voice 但通常有 zh-TW
// (Mei-Jia) + zh-CN (Tingting), 所以台灣國語 排前面比 普通話 接近粵語嘅
// 發音位置 (捲舌/不捲舌), 對 SEN 學生嚟講 比較少 cultural disconnect。
async function _pickBestVoiceForLang(lang) {
  const voices = await ensureVoicesLoaded();
  if (!voices.length) return null;
  // Try exact match first
  const exact = voices.find(v => v.lang === lang);
  if (exact) return exact;
  // For zh-HK, walk a culturally-similar fallback chain before generic zh
  if (lang === 'zh-HK') {
    return voices.find(v => v.lang === 'zh-TW')
        || voices.find(v => v.lang === 'zh-CN')
        || voices.find(v => v.lang.startsWith('zh'))
        || null;
  }
  // Other langs: prefix match
  const langPrefix = lang.split('-')[0];
  return voices.find(v => v.lang.startsWith(langPrefix)) || null;
}

export function setTTSLang(langId) {
  if (!TTS_LANGS.find(l => l.id === langId)) {
    console.warn('[FC TTS] Unknown lang:', langId);
    return;
  }
  currentLang = langId;
  cachedVoice = null; // 強制 pickBestVoice 重新 scan
  voicesLoadedPromise = null; // 強制 re-detect
  localStorage.setItem('fc_tts_lang', langId);
  console.log('[FC TTS] Lang set to', langId);
}

export function getTTSLang() {
  return currentLang;
}

// ── Settings persistence helpers (Sprint 12) ──────────────────────────────
// 對應 settings 頁 data-action 嘅 3 個 settings: setSpacing / toggleHC /
// toggleVoice. 之前嗰 3 個 button 完全 dead 因為冇 window.FC bridge, 屬
// Category A silent no-op。Implementation 一致 pattern: 寫 localStorage
// (single source of truth) + 叫 applyCSS() 立即生效 + return 方便 unit test。

/** 設定 UI 間距 (narrow/medium/wide)。立即 applyCSS 唔需要 render。*/
export function setSpacing(value) {
  if (!['narrow', 'medium', 'wide'].includes(value)) {
    console.warn('[FC] setSpacing: invalid value', value);
    return;
  }
  try { localStorage.setItem('fc_spacing', value); } catch {}
  applyCSS();
}

/** 切換高對比模式 (HC)。true = 開, false = 關。立即 applyCSS。*/
export function setHC(value) {
  try { localStorage.setItem('fc_hc_mode', value ? '1' : '0'); } catch {}
  applyCSS();
}

/** 切換語音朗讀 enabled state + 持久化。立即生效 (下次 speak() 會 read enabled)。*/
export function setVoiceEnabled(value) {
  enabled = !!value;
  try { localStorage.setItem('fc_voice_seen', value ? '1' : '0'); } catch {}
}

// 重置設定
export function resetAllSettings() {
  localStorage.removeItem('fc_tts_speed');
  localStorage.removeItem('fc_font_size');
  localStorage.removeItem('fc_line_height');
  localStorage.removeItem('fc_spacing');
  localStorage.removeItem('fc_hc_mode');
  localStorage.removeItem('fc_rm_mode');
  applyCSS();
}

// 預加載（可選）— Phase 2 (S10): 刪除 scenarios/ audio 後 preloadAudio 已經
// 指住不存在嘅路徑。保留 playLocal 因為 creeds/ 仲用緊。
// export function preloadAudio(ids) { ... } — DEAD

// ── Sprint 16: Result 頁 TTS 擴展 (SPEC §17.4.2) ──
export function speakOptionText(optionText) {
  if (!enabled || speaking) return;
  const cleaned = stripEmojiForTTS(optionText);
  if (!cleaned) return;
  speak(cleaned);
}

// 朗讀 effects[].comment (後果分析 / Result 結果)
export function speakConsequence(comment) {
  if (!enabled || speaking) return;
  const cleaned = stripEmojiForTTS(comment);
  if (!cleaned) return;
  speak(cleaned);
}

// 朗讀 stop-and-think 反思 template
export function speakStopAndThink(stopAndThink) {
  if (!enabled || speaking) return;
  const text = formatStopAndThinkForTTS(stopAndThink);
  if (!text) return;
  speak(text);
}

window._fcAudio = {
  speakScenario,
  speakCreeds,
  speakOptionText,
  speakConsequence,
  speakStopAndThink,
  speak,
  setEnabled,
  isEnabled,
  applyCSS,
  playSFX,
  initSFX,
};

window.addEventListener('beforeunload', () => { stopSpeaking(); });