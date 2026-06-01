// 語音朗讀（Web Speech API）
let enabled = false;

export function setEnabled(v) { enabled = v; }
export function isEnabled() { return enabled; }

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
  const voices = speechSynthesis.getVoices();
  let v = voices.find(vo => vo.lang.startsWith('zh-HK') || vo.lang.startsWith('zh-yue'));
  if (!v) v = voices.find(vo => vo.lang.startsWith('zh'));
  if (!v) v = voices.find(vo => vo.lang.startsWith('en'));
  return v || null;
}

export function speak(text) {
  if (!enabled) return;
  speechSynthesis.cancel();
  const p = getParams();
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = pickVoice();
  utter.rate = p.speed;
  utter.pitch = 1.0;
  speechSynthesis.speak(utter);
}

export function speakScenario(scenario) {
  if (!enabled) return;
  speechSynthesis.cancel();
  const p = getParams();
  const labels = ['A', 'B', 'C', 'D'];
  const optionsText = scenario.options.map((o, i) => `${labels[i]}。${o.text}`).join('。');
  const text = `${scenario.title}。${scenario.description}。選項：${optionsText}`;
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = pickVoice();
  utter.rate = p.speed;
  speechSynthesis.speak(utter);
}

export function speakCreeds(creeds) {
  if (!enabled) return;
  speechSynthesis.cancel();
  const p = getParams();
  const text = creeds.map(c => `${c.title}：${c.text}`).join('。');
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = pickVoice();
  utter.rate = p.speed;
  speechSynthesis.speak(utter);
}

// 確保 voice 已載入
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}