// 語音朗讀 — 雙層架構
// Layer 1: speechSynthesis (即時，無網絡需求)
// Layer 2: MiniMax TTS API (備用，較慢但可靠)

let enabled = false;
let speaking = false;
let mmxCache = {}; // text → audio URL cache

export function setEnabled(v) { enabled = v; }
export function isEnabled() { return enabled; }
export function isSpeaking() { return speaking; }
export function stopSpeaking() {
  speaking = false;
  speechSynthesis?.cancel();
  if (window._fcAudio?._currentAudio) {
    window._fcAudio._currentAudio.pause();
    window._fcAudio._currentAudio = null;
  }
}
export function setSpeaking(v) { speaking = v; }

// ── 個人化參數 ──
function getParams() {
  return {
    speed: parseFloat(localStorage.getItem('fc_tts_speed') || '0.85'),
    fontSize: parseInt(localStorage.getItem('fc_font_size') || '18'),
    lineHeight: parseFloat(localStorage.getItem('fc_line_height') || '1.5'),
    spacing: localStorage.getItem('fc_spacing') || 'medium',
  };
}

export function applyCSS() {
  const p = getParams();
  const spacingMap = { narrow: '8px', medium: '16px', wide: '28px' };
  const root = document.documentElement;
  root.style.setProperty('--fc-font-size', p.fontSize + 'px');
  root.style.setProperty('--fc-line-height', p.lineHeight);
  root.style.setProperty('--fc-spacing', spacingMap[p.spacing] || '16px');
}

// ── Layer 1: Browser Speech Synthesis ──
function pickVoice() {
  if (typeof speechSynthesis === 'undefined') return null;
  const voices = speechSynthesis.getVoices();
  let v = voices.find(vo => vo.lang.startsWith('zh-HK') || vo.lang.startsWith('zh-yue'));
  if (!v) v = voices.find(vo => vo.lang.startsWith('zh'));
  if (!v) v = voices.find(vo => vo.lang.startsWith('en'));
  return v || null;
}

function hasChineseVoice() {
  if (typeof speechSynthesis === 'undefined') return false;
  const voices = speechSynthesis.getVoices();
  return voices.some(v => v.lang.startsWith('zh'));
}

function speakWithBrowser(text, speed) {
  if (typeof speechSynthesis === 'undefined') return false;
  speechSynthesis.cancel();
  speaking = true;
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = pickVoice();
  utter.rate = speed;
  utter.pitch = 1.0;
  utter.onend = () => { speaking = false; };
  utter.onerror = () => {
    speaking = false;
    if (text) speakWithMiniMax(text);
  };
  speechSynthesis.speak(utter);
  return true;
}

// ── Layer 2: MiniMax TTS (需配置 proxy URL) ──
const TTS_PROXY = localStorage.getItem('fc_tts_proxy') || '';
const API_KEY = localStorage.getItem('fc_mmx_key') || '';

function speakWithMiniMax(text) {
  if (!TTS_PROXY || !API_KEY) { speaking = false; return; }

  const cacheKey = text.slice(0, 80);
  if (mmxCache[cacheKey]) {
    playAudioURL(mmxCache[cacheKey]);
    return;
  }

  fetch(TTS_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY },
    body: JSON.stringify({ text, model: 'speech-01-turbo', voice: 'Cantonese_GentleLady' })
  })
  .then(r => r.json())
  .then(data => {
    if (data.data?.audio_url) {
      mmxCache[cacheKey] = data.data.audio_url;
      playAudioURL(data.data.audio_url);
    } else { speaking = false; }
  })
  .catch(() => { speaking = false; });
}

function playAudioURL(url) {
  const audio = new Audio(url);
  window._fcAudio = window._fcAudio || {};
  window._fcAudio._currentAudio = audio;
  audio.onended = () => { speaking = false; };
  audio.onerror = () => { speaking = false; };
  audio.play().catch(() => { speaking = false; });
}

// ── Public API ──
export function speak(text) {
  if (!enabled || speaking || !text) return;

  if (hasChineseVoice()) {
    speakWithBrowser(text, getParams().speed);
  } else if (TTS_PROXY && API_KEY) {
    speakWithMiniMax(text);
  } else {
    speaking = false;
  }
}

export function speakScenario(scenario) {
  if (!enabled || speaking) return;
  const labels = ['A', 'B', 'C', 'D'];
  const optionsText = scenario.options.map((o, i) => `${labels[i]}。${o.text}`).join('。');
  const text = `${scenario.title}。${scenario.description}。選項：${optionsText}`;
  speak(text);
}

export function speakCreeds(creeds) {
  if (!enabled || speaking) return;
  const text = creeds.map(c => `${c.title}：${c.text}`).join('。');
  speak(text);
}

export function resetAllSettings() {
  localStorage.removeItem('fc_tts_speed');
  localStorage.removeItem('fc_font_size');
  localStorage.removeItem('fc_line_height');
  localStorage.removeItem('fc_spacing');
  mmxCache = {};
  applyCSS();
}

// Preload voices
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  setTimeout(() => speechSynthesis.getVoices(), 100);
  setTimeout(() => speechSynthesis.getVoices(), 500);
}

window._fcAudio = { speak, speakScenario, speakCreeds, setEnabled, isEnabled };
window.addEventListener('beforeunload', () => { speaking = false; });