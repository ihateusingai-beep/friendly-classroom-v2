// 語音朗讀 — 預生成 MP3 架構
// 所有音頻預生成於 /public/audio/，零依賴、零延遲

const audioBase = 'audio/';

let enabled = false;
let speaking = false;
let currentAudio = null;

// ── 參數讀取 ──
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
function playLocal(src) {
  stopSpeaking();
  const url = audioBase + src;
  console.log('[FC Audio] Playing:', url);
  currentAudio = new Audio(url);
  currentAudio.onended = () => { speaking = false; currentAudio = null; console.log('[FC Audio] Done'); };
  currentAudio.onerror = (e) => { console.error('[FC Audio] Error:', e); speaking = false; currentAudio = null; };
  currentAudio.play().catch(e => { console.error('[FC Audio] Play failed:', e.message); speaking = false; currentAudio = null; });
  speaking = true;
}

// 播放場景音頻
export function speakScenario(scenario) {
  console.log('[FC Audio] speakScenario called, enabled:', enabled, 'speaking:', speaking, 'scenario:', scenario);
  if (!enabled) { console.log('[FC Audio] Blocked: voice not enabled'); return; }
  if (speaking) { console.log('[FC Audio] Blocked: already speaking'); return; }
  const id = scenario?.id || scenario;
  console.log('[FC Audio] Playing scenario:', id);
  playLocal(`scenarios/${id}.mp3`);
}

// 播放信條音頻
export function speakCreeds(creeds) {
  if (!enabled || speaking) return;
  if (!creeds || creeds.length === 0) return;
  // 只播放第一條信條
  const id = creeds[0].id || creeds[0];
  playLocal(`creeds/creed-${id}.mp3`);
}

// 通用朗讀（使用 Web Speech API — Instant TTS，零延遲）
export function speak(text) {
  if (!text) return;
  // 停止之前嘅朗讀
  if (speaking) {
    window.speechSynthesis?.cancel();
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-HK';    // 粵語優先
  utterance.rate = getParams().speed || 0.85;
  utterance.pitch = 1.0;
  // 尝试选择女声
  const voices = window.speechSynthesis?.getVoices() || [];
  const preferred = voices.find(v => v.lang.includes('zh') && v.name.includes('female')) ||
                    voices.find(v => v.lang.includes('zh')) ||
                    voices[0];
  if (preferred) utterance.voice = preferred;
  utterance.onstart = () => { speaking = true; console.log('[FC TTS] Speaking:', text.slice(0, 20)); };
  utterance.onend = () => { speaking = false; console.log('[FC TTS] Done'); };
  utterance.onerror = (e) => { speaking = false; console.error('[FC TTS] Error:', e.error); };
  window.speechSynthesis?.speak(utterance);
}

// 重置設定
export function resetAllSettings() {
  localStorage.removeItem('fc_tts_speed');
  localStorage.removeItem('fc_font_size');
  localStorage.removeItem('fc_line_height');
  localStorage.removeItem('fc_spacing');
  applyCSS();
}

// 預加載（可選）
export function preloadAudio(ids) {
  ids.forEach(id => {
    const audio = new Audio(audioBase + 'scenarios/' + id + '.mp3');
    audio.preload = 'auto';
  });
}

// 初始化
applyCSS();

window._fcAudio = {
  speakScenario,
  speakCreeds,
  speak,
  setEnabled,
  isEnabled,
  preloadAudio,
  applyCSS
};

window.addEventListener('beforeunload', () => { stopSpeaking(); });