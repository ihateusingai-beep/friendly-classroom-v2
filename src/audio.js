// 語音朗讀（Web Speech API）
let enabled = false;

export function setEnabled(v) { enabled = v; }
export function isEnabled() { return enabled; }

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  // 優先廣東話
  let v = voices.find(vo => vo.lang.startsWith('zh-HK') || vo.lang.startsWith('zh-yue'));
  if (!v) v = voices.find(vo => vo.lang.startsWith('zh'));
  if (!v) v = voices.find(vo => vo.lang.startsWith('en'));
  return v || null;
}

export function speak(text) {
  if (!enabled) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = pickVoice();
  utter.rate = 0.9;
  utter.pitch = 1.0;
  speechSynthesis.speak(utter);
}

export function speakScenario(scenario) {
  if (!enabled) return;
  speechSynthesis.cancel();
  const labels = ['A', 'B', 'C', 'D'];
  const optionsText = scenario.options.map((o, i) => `${labels[i]}。${o.text}`).join('。');
  const text = `${scenario.title}。${scenario.description}。選項：${optionsText}`;
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = pickVoice();
  utter.rate = 0.85;
  speechSynthesis.speak(utter);
}

export function speakCreeds(creeds) {
  if (!enabled) return;
  speechSynthesis.cancel();
  const text = creeds.map(c => `${c.title}：${c.text}`).join('。');
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = pickVoice();
  utter.rate = 0.85;
  speechSynthesis.speak(utter);
}

// 確保 voice 已載入
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}