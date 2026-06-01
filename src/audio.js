// 語音朗讀（Web Speech API）
let enabled = false;
let speaking = false; // guard: 防止重複trigger

export function setEnabled(v) { enabled = v; }
export function isEnabled() { return enabled; }
export function isSpeaking() { return speaking; }
export function stopSpeaking() { speaking = false; speechSynthesis?.cancel(); }

export function setSpeaking(v) { speaking = v; }

// 個人化參數（從 localStorage 讀取）
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

function pickVoice() {
  if (typeof speechSynthesis === 'undefined') return null;
  const voices = speechSynthesis.getVoices();
  let v = voices.find(vo => vo.lang.startsWith('zh-HK') || vo.lang.startsWith('zh-yue'));
  if (!v) v = voices.find(vo => vo.lang.startsWith('zh'));
  if (!v) v = voices.find(vo => vo.lang.startsWith('en'));
  return v || null;
}

export function speak(text) {
  if (!enabled || speaking) return;
  speechSynthesis.cancel();
  speaking = true;
  const p = getParams();
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = pickVoice();
  utter.rate = p.speed;
  utter.pitch = 1.0;
  utter.onend = () => { speaking = false; };
  utter.onerror = () => { speaking = false; };
  speechSynthesis.speak(utter);
}

export function speakScenario(scenario) {
  if (!enabled || speaking) return;
  speechSynthesis.cancel();
  speaking = true;
  const p = getParams();
  const labels = ['A', 'B', 'C', 'D'];
  const optionsText = scenario.options.map((o, i) => `${labels[i]}。${o.text}`).join('。');
  const text = `${scenario.title}。${scenario.description}。選項：${optionsText}`;
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = pickVoice();
  utter.rate = p.speed;
  utter.onend = () => { speaking = false; };
  utter.onerror = () => { speaking = false; };
  speechSynthesis.speak(utter);
}

export function speakCreeds(creeds) {
  if (!enabled || speaking) return;
  speechSynthesis.cancel();
  speaking = true;
  const p = getParams();
  const text = creeds.map(c => `${c.title}：${c.text}`).join('。');
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = pickVoice();
  utter.rate = p.speed;
  utter.onend = () => { speaking = false; };
  utter.onerror = () => { speaking = false; };
  speechSynthesis.speak(utter);
}

export function resetAllSettings() {
  localStorage.removeItem('fc_tts_speed');
  localStorage.removeItem('fc_font_size');
  localStorage.removeItem('fc_line_height');
  localStorage.removeItem('fc_spacing');
  applyCSS();
}

// 確保 voice 已載入
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}