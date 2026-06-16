// 語音朗讀 — 預生成 MP3 架構
// 所有音頻預生成於 /public/audio/，零依賴、零延遲

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

let enabled = true;
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

  // user explicit 揀咗 lang
  if (currentLang !== 'auto') {
    const exact = voices.find(v => v.lang === currentLang);
    if (exact) return exact;
    // 例如 user 揀 zh-HK 但 OS 冇 → 揀最接近嘅（zh-TW > zh-CN > 第一個 zh）
    const langPrefix = currentLang.split('-')[0];
    const partial = voices.find(v => v.lang.startsWith(langPrefix));
    return partial || null;
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
  currentAudio.onended = () => { speaking = false; currentAudio = null; console.log('[FC Audio] Done'); };
  currentAudio.onerror = (e) => {
    console.error('[FC Audio] Error loading', url, '-', e?.message || e?.type || 'unknown');
    speaking = false;
    currentAudio = null;
    if (typeof onFallback === 'function') {
      console.log('[FC Audio] Falling back to TTS for', src);
      onFallback();
    }
  };
  currentAudio.play().catch(e => {
    console.error('[FC Audio] Play failed:', e.message);
    speaking = false;
    currentAudio = null;
    if (typeof onFallback === 'function') onFallback();
  });
  speaking = true;
}

// 播放場景音頻// 播放場景音頻
export function speakScenario(scenario) {
  console.log('[FC Audio] speakScenario called, enabled:', enabled, 'speaking:', speaking, 'scenario:', scenario);
  if (!enabled) { console.log('[FC Audio] Blocked: voice not enabled'); return; }
  if (speaking) { console.log('[FC Audio] Blocked: already speaking'); return; }
  const id = scenario?.id || scenario;
  const text = scenario?.description || '';
  console.log('[FC Audio] Playing scenario:', id);
  // 直接 Web Speech API TTS（跳過 MP3）
  speak(text);
}

// 播放信條音頻
// Falls back to TTS if the pre-generated MP3 is missing — this lets the
// feature ship even when the audio assets aren't all in place.
export function speakCreeds(creeds) {
  if (!enabled || speaking) return;
  if (!creeds || creeds.length === 0) return;
  // 只播放第一條信條
  const creed = creeds[0];
  const id = creed.id || creed;
  // Try the pre-generated MP3 first; if it 404s, the onerror handler
  // will trigger the TTS fallback using the creed's text.
  playLocal(`creeds/creed-${id}.mp3`, () => {
    const text = creed.text || '';
    if (text) speak(text);
  });
}

// 通用朗讀（使用 Web Speech API — Instant TTS，零延遲）
export async function speak(text) {
  if (!text) return;
  if (speaking) window.speechSynthesis?.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLang === 'auto' ? 'zh-HK' : currentLang;
  utterance.rate = getParams().speed || 0.85;
  utterance.pitch = 1.0;
  const voice = await pickBestVoice();
  if (voice) {
    utterance.voice = voice;
    console.log('[FC TTS] Voice:', voice.name, '(' + voice.lang + ')');
  } else {
    console.warn('[FC TTS] No matching voice found for', currentLang);
  }
  utterance.onstart = () => { speaking = true; console.log('[FC TTS] Speaking:', text.slice(0, 30)); };
  utterance.onend = () => { speaking = false; console.log('[FC TTS] Done'); };
  utterance.onerror = (e) => {
    speaking = false;
    console.error('[FC TTS] Error:', e.error);
    if (e.error === 'not-allowed') {
      console.log('[FC TTS] Autoplay blocked — user must interact first. Suggest enabling TTS in settings.');
    }
  };
  window.speechSynthesis?.speak(utterance);
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

window._fcAudio = {
  speakScenario,
  speakCreeds,
  speak,
  setEnabled,
  isEnabled,
  applyCSS,
  playSFX,
  initSFX,
};

window.addEventListener('beforeunload', () => { stopSpeaking(); });