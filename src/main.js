// 友愛教室 V2 — main.js
import './style.css';
import './sw-register.js';  // PWA install + update prompt
import { setStudent, getStudent, setScenarios, getScenarios, getScenariosByTopic,
         getDisplayProgress, initTopicProgress, initSubjectProgress, renderHome, renderTopicList,
         renderPlay, renderResult, renderProgress, renderSettings,
         playScenario, chooseOption, suggestNext,
         renderRoleSelect, renderModeSelect, renderTeacherAssign, renderGameHub,
         renderBankPlay, renderBankResult, renderBankSummary,
         GAME_MODES } from './engine.js';
import { applyScenarioResult } from './domain/Moral.js';
import { startBankRun, getBankRun, endBankRun, recordBankTransaction, advanceToNextQuestion, BANK_CONFIG } from './games/GoodDeedBank.js';
import { speakScenario, speakCreeds, setEnabled, isEnabled, applyCSS, resetAllSettings, playSFX, initSFX, setTTSLang, getTTSLang, TTS_LANGS } from './audio.js';
import { exportProgress, importProgress, getAllStudents, getProgress, updateSubjectTotal } from './domain/Progress.js';
import { getSubjectColor, getSubjectBgColor, getAllSubjects } from './subjects.js';
import { bus } from './domain/EventBus.js';
import { getMoralBarData } from './domain/Moral.js';
import { initSync, syncNow, getSyncStatus } from './sync.js';
import { logInteraction, markScenarioShown, exportInteractionsCSV, getStats, clearInteractions } from './domain/Analytics.js';
import scenariosData from '../data/scenarios.json';

// ── Vite HMR 破壞 DOM 寫入，強制停用 ──
if (import.meta.hot) { import.meta.hot.decline(); }

// ── 初始化 ──
const app = document.getElementById('app');
applyCSS(); // 套用個人化 CSS 參數
initSFX();  // 初始化遊戲音效

// ── EventBus：道德值 Bar 即時更新 ──
bus.on('moral:updated', (e) => {
  const current = getStudent();
  if (e.studentId !== current) return; // 只更新當前學生
  const bar = document.getElementById('moral-bar');
  if (!bar) return;
  const { percent, color } = getMoralBarData(e.score);
  const fill = bar.querySelector('.moral-fill');
  const num  = bar.querySelector('.moral-num');
  if (fill) fill.style.width = percent + '%', fill.style.background = color;
  if (num)  num.textContent  = e.score;
});

// ── Sync status badge in moral bar ──
bus.on('sync:status', (e) => {
  // Cache for settings page
  window._fcSyncStatus = { ...getSyncStatus(), ...e };

  const badge = document.getElementById('sync-badge');
  if (!badge) return;
  const { status } = e;
  if (status === 'syncing') {
    badge.textContent = '🔄';
    badge.title = '同步中…';
    badge.style.opacity = '1';
  } else if (status === 'ok') {
    badge.textContent = '✅';
    badge.title = '已同步';
    setTimeout(() => { badge.textContent = '☁️'; badge.title = '已連線'; }, 2500);
  } else if (status === 'error') {
    badge.textContent = '⚠️';
    badge.title = '同步失敗 — ' + (e.error || '');
    badge.style.opacity = '1';
  } else if (status === 'offline') {
    badge.textContent = '📴';
    badge.title = '離線模式';
    badge.style.opacity = '1';
  }
});

// ── Offline banner ──
let offlineBannerEl = null;
bus.on('sync:status', (e) => {
  if (e.status === 'offline') {
    if (offlineBannerEl) return;
    offlineBannerEl = document.createElement('div');
    offlineBannerEl.id = 'offline-banner';
    offlineBannerEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff4d4f;
      color: white;
      text-align: center;
      padding: 10px;
      font-size: 14px;
      z-index: 9998;
      font-weight: 500;
    `;
    offlineBannerEl.textContent = '📴 離線模式 — 進度將在恢復連線後自動同步';
    document.body.appendChild(offlineBannerEl);
  } else if (e.status === 'online' && offlineBannerEl) {
    offlineBannerEl.remove();
    offlineBannerEl = null;
  }
});

// ── Init sync on load ──
const _currentStudent = getStudent();
if (_currentStudent) {
  const p = getProgress(_currentStudent);
  initSync(_currentStudent, p);
}

// ── 科目 helpers（從 subjects.js 統一取） ──
// getSubjectColor / getSubjectBgColor 已從 ./subjects.js import

// ── 全域 FC 初始化（防止 undefined error） ──
window.FC = window.FC || {};

// ── 狀態機 ──
let state = {
  view: 'role-select', // role-select | mode-select | student-select | subject-select | home | topic | play | result | progress | settings | login | teacher | teacher-assign
  student: null,
  subjectId: null,   // 'value' = 價值觀教育（單一 subject；舊 4 個已收埋）
  topicId: null,
  scenarioId: null,
  resultData: null,
  teacherMode: false,
  role: null,        // 'student' | 'teacher'
  gameMode: localStorage.getItem('fc_game_mode') || 'relaxed',
};
let lastPlayedScenarioId = null; // guard: 防 TTS 重複觸發

// ── 懶加載 teacher chunk（學生不會下載此檔案）──
let _teacher = null;  // 動態加載後 cache

async function _loadTeacher() {
  if (!_teacher) {
    const mod = await import('./teacher.js');
    _teacher = { renderLogin: mod.renderLogin, renderTeacher: mod.renderTeacher };
  }
  return _teacher;
}

// ── 路由 ──
export function goHome() {
  state = { ...state, view: 'home' };
  render();
}
window.FC.goHome = goHome;

export function goTopic(topicId) {
  initTopicProgress(topicId);
  state = { ...state, view: 'topic', topicId, subjectId: state.subjectId };
  render();
}
window.FC.goTopic = goTopic;

export function play(scenarioId) {
  localStorage.setItem('fc_last_scenario', scenarioId); // guard: TTS trigger
  markScenarioShown(); // analytics: response time 起點
  state = { ...state, view: 'play', scenarioId };
  render();
}
window.FC.play = play;

export function choose(optionId) {
  const data = chooseOption(state.scenarioId, optionId, state.subjectId);
  if (!data) {
    console.error('[FC] chooseOption returned null, scenarioId=', state.scenarioId, 'optionId=', optionId);
    goHome();
    return;
  }
  // analytics: log this interaction (老師想知邊個 category 答錯率高)
  try {
    const sc = playScenario(state.scenarioId);
    if (sc) {
      const optIdx = sc.options.findIndex(o => o.id === optionId);
      logInteraction({
        scenarioId: sc.id,
        topicId: sc.topicId,
        category: sc.valueCategory || '',
        optionId,
        optionIndex: optIdx >= 0 ? optIdx + 1 : 0,
        moralChange: data.moralChange,
      }, state.student, state.gameMode);
    }
  } catch (e) {
    console.warn('[FC] analytics log failed:', e.message);
  }
  state = { ...state, view: 'result', resultData: data };
  render();
  // 情緒慶祝動畫 + SFX
  setTimeout(() => {
    const isGood = data.moralChange >= 0;
    if (isGood) {
      playSFX('success');
      triggerConfetti();
      triggerStarFloat();
    } else {
      playSFX('fail');
      triggerComfort();
    }
  }, 100);
}
window.FC.choose = choose;

function triggerConfetti() {
  const colors = ['#FFD700','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFE66D'];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 90 + 5 + 'vw';
    el.style.top  = Math.random() * 30 + 10 + 'vh';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = Math.random() * 0.5 + 's';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

function triggerStarFloat() {
  const emojis = ['🌟','✨','💫','⭐'];
  for (let i = 0; i < 6; i++) {
    const el = document.createElement('div');
    el.className = 'star-float';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 80 + 10 + 'vw';
    el.style.top  = 50 + Math.random() * 30 + 'vh';
    el.style.animationDelay = Math.random() * 0.8 + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

function triggerComfort() {
  const el = document.createElement('div');
  el.className = 'star-float';
  el.textContent = '💪';
  el.style.left = '50%';
  el.style.top  = '50%';
  el.style.transform = 'translate(-50%,-50%)';
  el.style.fontSize = '4em';
  el.style.animation = 'bounceIn 0.8s ease-out forwards';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

export function retry() {
  if (state.scenarioId) play(state.scenarioId);
  else goHome();
}
window.FC.retry = retry;

export function goProgress() {
  // 移除 student-select，直接去進度頁
  state = { ...state, view: 'progress' };
  render();
}
window.FC.goProgress = goProgress;

export function goGameHub() {
  state = { ...state, view: 'hub' };
  render();
}
window.FC.goGameHub = goGameHub;

export function goSettings() {
  state = { ...state, view: 'settings' };
  render();
}
window.FC.goSettings = goSettings;

export async function goTeacher() {
  // 懶加載 teacher chunk
  await _loadTeacher();
  state = { ...state, view: 'login' };
  render();
}
window.FC.goTeacher = goTeacher;

export function goRandom() {
  // 自由模式仍需要揀 subjectId，否則 markComplete 會污染 subjectProgress
  if (!state.subjectId) {
    goSubjectSelect();
    return;
  }
  const all = getScenarios();
  if (!all.length) { goHome(); return; }
  const s = all[Math.floor(Math.random() * all.length)];
  play(s.id);
}
window.FC.goRandom = goRandom;

// TTS 測試（讓學生確認發音正常）
window.FC.testTTS = function() {
  const { speak } = window._fcAudio || {};
  if (speak) speak('呢個係發音測試，請確認可以聽到聲音。如果聽到呢段說話，代表語音功能正常運作。');
};

// ── 🏦 好人好事銀行 handlers ──
window.FC.playGoodDeedBank = function() {
  const run = startBankRun();
  if (!run || !run.questions?.length) {
    alert('銀行題目載入失敗，請重試。');
    return;
  }
  state = { ...state, view: 'bank-play' };
  render();
};

window.FC.bankChoose = function(optionId) {
  const run = getBankRun();
  if (!run) return;
  const scenario = run.questions[run.currentIdx];
  if (!scenario) return;
  // 計算 moralChange（重用 domain 邏輯，唔經 markComplete — 呢個係獨立遊戲）
  const result = applyScenarioResult(scenario, optionId, getStudent());
  if (!result) {
    console.error('[Bank] applyScenarioResult null');
    return;
  }
  // 補 outcomeImage（同 ScenarioEngine.chooseOption 一樣嘅 path scheme）
  const optIdx = scenario.options.findIndex(o => o.id === optionId);
  result.outcomeImage = `assets/images/outcomes/${scenario.id}_opt${optIdx + 1}.png`;
  recordBankTransaction(result.moralChange, scenario.title);
  // analytics: 銀行遊戲嘅 interaction 都 log
  try {
    logInteraction({
      scenarioId: scenario.id,
      topicId: scenario.topicId,
      category: scenario.valueCategory || '',
      optionId,
      optionIndex: optIdx >= 0 ? optIdx + 1 : 0,
      moralChange: result.moralChange,
    }, getStudent(), 'bank');
  } catch (e) {
    console.warn('[FC] bank analytics log failed:', e.message);
  }
  state = {
    ...state,
    view: 'bank-result',
    bankScenario: scenario,
    bankResult: result,
  };
  render();
};

window.FC.bankNext = function() {
  const run = getBankRun();
  if (!run) { FC.exitBank(); return; }
  // 局結束（finished / bankrupt）→ 結算
  if (run.status === 'finished' || run.status === 'bankrupt') {
    state = { ...state, view: 'bank-summary' };
    render();
    return;
  }
  advanceToNextQuestion();
  state = { ...state, view: 'bank-play' };
  render();
};

window.FC.exitBank = function() {
  endBankRun();
  state = { ...state, view: 'hub' };
  render();
};

window.FC.confirmExitBank = function() {
  if (confirm('中途離開？今次遊戲進度會唔儲。')) {
    FC.exitBank();
  }
};

// Event helper: 內嵌喺 inline handler 嗰陣用，避免 mobile browser touch 事件漏出去撞到 parent
// 用法：onclick="FC._stopEvt(event); doStuff()"
window.FC._stopEvt = function(e) {
  if (!e) return;
  if (typeof e.stopPropagation === 'function') e.stopPropagation();
  if (typeof e.preventDefault === 'function') e.preventDefault();
};

// TTS 語言切換
window.FC.setTTSLang = function(langId) {
  setTTSLang(langId);
  // 自動播一句 test 畀 user 即時聽到分別
  const { speak } = window._fcAudio || {};
  if (speak) speak('語言切換測試，你聽到嘅係新嘅發音。');
  // 重新 render settings 頁，更新 active 狀態
  if (state.view === 'settings') render();
};
window.FC.getTTSLang = function() { return getTTSLang(); };
window.FC.TTS_LANGS = TTS_LANGS;

export function goSubjectSelect() {
  state = { ...state, view: 'subject-select' };
  render();
}
window.FC.goSubjectSelect = goSubjectSelect;

export function selectSubject(subjectId) {
  initSubjectProgress(subjectId);
  state = { ...state, subjectId, view: 'home' };
  render();
}
window.FC.selectSubject = selectSubject;

// ── Role Select (Entry Point) ──
export function goRoleSelect() {
  state = { ...state, view: 'role-select' };
  render();
}
window.FC.goRoleSelect = goRoleSelect;

export async function chooseRole(role) {
  state = { ...state, role, teacherMode: role === 'teacher' };
  if (role === 'teacher') {
    // 預載 teacher chunk，避免 login 頁「載入中」閃一下
    await _loadTeacher();
    state = { ...state, view: 'login' };
  } else {
    // Student: go to Game Hub (Blooket-style lobby)
    state = { ...state, view: 'hub' };
  }
  render();
}
window.FC.chooseRole = chooseRole;

export function goHub() {
  state = { ...state, view: 'hub' };
  render();
}
window.FC.goHub = goHub;

export function selectMode(modeId) {
  localStorage.setItem('fc_game_mode', modeId);
  state = { ...state, gameMode: modeId };
  render();
  // Show brief confirmation
  setTimeout(() => {
    const cards = document.querySelectorAll('.mode-card');
    cards.forEach(c => c.classList.remove('selected'));
    const selected = document.querySelector(`.mode-card.${modeId}`);
    if (selected) {
      selected.classList.add('selected');
      selected.style.transform = 'scale(1.05)';
      setTimeout(() => { selected.style.transform = ''; }, 300);
    }
  }, 50);
}
window.FC.selectMode = selectMode;

export function goModeSelect() {
  state = { ...state, view: 'mode-select' };
  render();
}
window.FC.goModeSelect = goModeSelect;

export function goTeacherAssign() {
  state = { ...state, view: 'teacher-assign' };
  render();
}
window.FC.goTeacherAssign = goTeacherAssign;

// Teacher config helpers
function getTeacherConfig() {
  try {
    return JSON.parse(localStorage.getItem('fc_teacher_config') || '{}');
  } catch {
    // corrupted value — reset to empty
    console.warn('[FC] teacher_config corrupt, resetting');
    return {};
  }
}
function saveTeacherConfig(cfg) {
  try {
    localStorage.setItem('fc_teacher_config', JSON.stringify(cfg));
  } catch (e) {
    console.error('[FC] saveTeacherConfig failed:', e.message);
  }
}
window.FC.toggleTeacherFeature = function(btn, key) {
  btn.classList.toggle('on');
  const val = btn.classList.contains('on');
  const cfg = getTeacherConfig();
  cfg[key] = val;
  saveTeacherConfig(cfg);
  if (key === 'timerEnabled') render();
};
window.FC.setTeacherTimer = function(val) {
  const cfg = getTeacherConfig();
  cfg.timerSeconds = parseInt(val);
  saveTeacherConfig(cfg);
};
window.FC.setButtonSize = function(size) {
  const cfg = getTeacherConfig();
  cfg.buttonSize = size;
  saveTeacherConfig(cfg);
  render();
};
window.FC.toggleAssignedTopic = function(topicId, checked) {
  const cfg = getTeacherConfig();
  if (!cfg.assignedTopics) cfg.assignedTopics = [];
  if (checked) {
    if (!cfg.assignedTopics.includes(topicId)) cfg.assignedTopics.push(topicId);
  } else {
    cfg.assignedTopics = cfg.assignedTopics.filter(t => t !== topicId);
  }
  saveTeacherConfig(cfg);
};
window.FC.saveTeacherPIN = function() {
  const pin = document.getElementById('teacher-pin-input')?.value?.trim() || 'admin';
  localStorage.setItem('fc_teacher_pin', pin);
  alert('✅ PIN 已更新為：' + pin);
};
window.FC.saveTeacherConfig = function() {
  alert('✅ 老師設定已儲存！');
  goTeacher();
};

export function switchStudent() {
  state = { ...state, view: 'student-select' };
  render();
}
window.FC.switchStudent = switchStudent;

// ── 學生選擇 ──
const STUDENT_EMOJI = {};  // 動態從 localStorage 讀取
function renderStudentSelect() {
  const saved = getAllStudents();  // 從 progress.js 動態讀取
  return `
    <div class="container fade-in" style="max-width:460px;padding-top:40px">
      <h2 style="text-align:center;margin-bottom:24px">👤 選擇學生</h2>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px">
        ${saved.map(student => `
          <div class="student-card" onclick="FC.selectStudent('${student.name}')">
            <div class="avatar">${student.emoji || '👤'}</div>
            <div class="info">
              <div class="name">${student.name}</div>
              <div class="sub">按此開始學習</div>
            </div>
            <div class="arrow">→</div>
          </div>
        `).join('')}
      </div>
      <div style="text-align:center;color:var(--text-light);margin-bottom:16px;font-size:0.9em">— 或新增學生 —</div>
      <div style="background:var(--card);border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <input id="new-student-name" type="text" inputmode="none" autocomplete="off" placeholder="輸入新學生名字"
          style="width:100%;padding:14px;border:2px solid var(--border);border-radius:10px;font-size:1em;margin-bottom:10px;box-sizing:border-box" />
        <button class="btn btn-success" style="width:100%" onclick="FC.addStudent()">➕ 新增學生</button>
      </div>
      <div style="margin-top:16px;text-align:center">
        <button class="btn btn-outline" onclick="FC.goRoleSelect()">← 返回首頁</button>
      </div>
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `;
}
window.FC.selectStudent = function(name) {
  if (name === '其他') return;
  setStudent(name);
  state = { ...state, student: name, view: 'home' };
  render();
};
window.FC.addStudent = function() {
  const input = document.getElementById('new-student-name');
  const name = input?.value?.trim();
  if (!name) return;
  setStudent(name);
  state = { ...state, student: name, view: 'home' };
  render();
};

// doLogin stays in main.js (reads DOM + updates state)
window.FC.doLogin = function() {
  const savedPin = localStorage.getItem('fc_teacher_pin') || 'admin';
  const pw = document.getElementById('teacher-pw')?.value;
  if (pw === savedPin) {
    state = { ...state, view: 'teacher', teacherMode: true };
    render();
  } else {
    const err = document.getElementById('login-error');
    if (err) { err.style.display = 'block'; }
  }
};

// ── 科目選擇 ──
function renderSubjectSelect() {
  return `
    <div class="container fade-in" style="max-width:500px">
      <h2 style="text-align:center;margin-bottom:20px">📚 選擇科目</h2>
      <div class="subject-grid">
        ${getAllSubjects().map(sub => `
          <button class="subject-btn" style="background:${sub.bgColor};border-color:${sub.color}"
            onclick="FC.selectSubject('${sub.id}')">
            <div style="font-size:2em">${sub.emoji}</div>
            <div style="font-weight:600;color:${sub.color}">${sub.title}</div>
          </button>
        `).join('')}
      </div>
      <div style="margin-top:12px;text-align:center">
        <button class="btn btn-outline" onclick="FC.goHome()">← 返回</button>
      </div>
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `;
}

// handleImport / exportAll stay in main.js (teacher專屬操作，但零 circular deps)
window.FC.handleImport = function(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const r = importProgress(ev.target.result);
    if (r.ok) { alert('匯入成功！'); window.FC.goTeacher(); }
    else { alert('匯入失敗：' + r.error); }
  };
  reader.readAsText(file);
};
window.FC.exportAll = function() {
  const students = getAllStudents();
  const blob = new Blob([JSON.stringify(students, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = '全班進度.json';
  a.click(); URL.revokeObjectURL(url);
};

// ── 語音 ──
window.FC.speak = function() {
  const s = playScenario(state.scenarioId);
  if (s) speakScenario(s);
};
window.FC.speakOpt = function(optionId) {
  const s = playScenario(state.scenarioId);
  if (!s) return;
  const opt = s.options.find(o => o.id === optionId);
  if (opt) {
    const { speak } = window._fcAudio || {};
    if (speak) speak(opt.text);
  }
};
window.FC.speakCreeds = function() {
  if (state.resultData?.creeds) speakCreeds(state.resultData.creeds);
};

// ── Hints panel ──
let _hintsRevealed = 0;
window.FC.toggleHints = function() {
  const list = document.getElementById('hints-list');
  const chev = document.getElementById('hints-chev');
  const toggle = document.getElementById('hints-toggle');
  if (!list) return;
  const open = list.hasAttribute('hidden') ? false : true;
  if (open) {
    list.setAttribute('hidden', '');
    if (chev) chev.textContent = '▾';
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  } else {
    list.removeAttribute('hidden');
    if (chev) chev.textContent = '▴';
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    // 第一次打開自動揭第一個
    if (_hintsRevealed === 0) FC.revealNextHint();
  }
};
window.FC.revealNextHint = function() {
  const items = document.querySelectorAll('.hint-item');
  const next = document.getElementById('hint-next');
  if (_hintsRevealed >= items.length) return;
  items[_hintsRevealed].removeAttribute('hidden');
  _hintsRevealed++;
  // 全部揭完 → 隱藏 next 按鈕
  if (_hintsRevealed >= items.length) {
    if (next) next.setAttribute('hidden', '');
  }
};
// 每次 render 完重置 hints 計數
const _origRender = render;
render = function() {
  _hintsRevealed = 0;
  _origRender();
  // 結果頁 floating CTA 邏輯
  requestAnimationFrame(updateResultCtaFab);
};
function updateResultCtaFab() {
  const actions = document.getElementById('result-actions');
  const fab = document.getElementById('result-cta-fab');
  if (!actions || !fab) return;
  const rect = actions.getBoundingClientRect();
  const offScreen = rect.top > window.innerHeight || rect.bottom < 0;
  if (offScreen) fab.removeAttribute('hidden');
  else fab.setAttribute('hidden', '');
}
// scroll / resize 時更新 floating CTA
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => {
    if (document.getElementById('result-cta-fab')) updateResultCtaFab();
  }, { passive: true });
  window.addEventListener('resize', updateResultCtaFab);
}

window.FC.toggleVoice = function(el) {
  const on = !isEnabled();
  setEnabled(on);
  if (el) el.classList.toggle('on', on);
  // Auto-enable voice by default when toggled on for first time
  if (on && !localStorage.getItem('fc_voice_seen')) {
    localStorage.setItem('fc_voice_seen', '1');
  }
};

window.FC.setFontSize = function(v) {
  localStorage.setItem('fc_font_size', v);
  applyCSS();
  const label = document.querySelector('[data-for="fs"]');
  if (label) label.textContent = v <= 18 ? '小' : v <= 22 ? '中' : '大';
};
window.FC.setLineHeight = function(v) {
  localStorage.setItem('fc_line_height', v);
  applyCSS();
  const label = document.querySelector('[data-for="lh"]');
  if (label) label.textContent = parseFloat(v).toFixed(1);
};
window.FC.setSpacing = function(v) {
  localStorage.setItem('fc_spacing', v);
  applyCSS();
  ['narrow','medium','wide'].forEach(s => {
    const btn = document.getElementById('sp-' + s);
    if (btn) btn.className = 'btn ' + (s === v ? 'btn-primary' : 'btn-outline');
  });
};
window.FC.setSpeed = function(v) {
  localStorage.setItem('fc_tts_speed', v);
  const label = document.querySelector('[data-for="speed"]');
  if (label) label.textContent = parseFloat(v).toFixed(2) + 'x';
};
window.FC.resetSettings = function() {
  resetAllSettings();
  render();
};

// ── Analytics export (Phase 1: 純 client-side, 老師攞 CSV 走) ──
window.FC.exportAnalyticsCSV = function() {
  try {
    const result = exportInteractionsCSV();
    if (result.count === 0) {
      alert('📊 仲未有學習記錄\n\n先玩幾個 scenario 先有 log 喺 localStorage。');
      return;
    }
    alert(`✅ 已匯出 ${result.count} 條學習記錄\n\n檔案：${result.filename}\n\n可以分享畀老師 / 拖入 Excel / Google Sheet 開。`);
  } catch (e) {
    console.error('[FC] exportAnalyticsCSV failed:', e.message);
    alert('❌ 匯出失敗：' + e.message);
  }
};

window.FC.clearAnalytics = function() {
  if (!confirm('⚠️ 確定清除所有學習記錄？\n\n清除後將無法復原。')) return;
  clearInteractions();
  render();
};

window.FC.getAnalyticsStats = getStats;

// ── 更新 settings 頁嘅 analytics summary ──
function updateAnalyticsSummary() {
  const el = document.getElementById('analytics-summary');
  if (!el) return;
  try {
    const stats = getStats();
    if (stats.totalRows === 0) {
      el.textContent = '📭 仲未有學習記錄 — 玩幾個 scenario 就會見到。';
      return;
    }
    // 揾 top 3 答錯率最高嘅 categories
    const cats = Object.entries(stats.byCategory)
      .filter(([k]) => k && k !== '(uncategorized)')
      .sort((a, b) => b[1].wrongRate - a[1].wrongRate)
      .slice(0, 3);
    const lines = [
      `📝 總作答：${stats.totalRows} 題 · ✅ 答啱率：${(stats.correctRate * 100).toFixed(0)}%` +
        (stats.avgResponseTimeMs ? ` · ⏱️ 平均 ${(stats.avgResponseTimeMs / 1000).toFixed(1)}s` : ''),
    ];
    if (cats.length) {
      lines.push('📊 答錯率最高：');
      cats.forEach(([name, c], i) => {
        lines.push(`  ${i + 1}. ${name} — ${(c.wrongRate * 100).toFixed(0)}% (${c.wrong}/${c.total})`);
      });
    }
    el.innerHTML = lines.map(l => l.replace(/\n/g, '<br>')).join('<br>')
      .replace(/(答錯率最高：)/g, '<strong>$1</strong>');
  } catch (e) {
    el.textContent = '⚠️ 載入失敗：' + e.message;
  }
}

// ── Force sync ──
window.FC.forceSync = async function() {
  const name = getStudent();
  if (!name) return;
  const p = getProgress(name);
  const result = await syncNow(name, p);
  if (result.ok) {
    const badge = document.getElementById('settings-sync-status');
    const lastSync = document.getElementById('settings-last-sync');
    if (badge) badge.textContent = '✅ 已同步';
    if (lastSync) lastSync.textContent = new Date().toLocaleString('zh-HK', { dateStyle: 'short', timeStyle: 'short' });
  }
};

// ── 匯出入 ──
window.FC.exportMyData = function() {
  const name = getStudent();
  if (!name) return;
  const json = exportProgress(name);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `progress_${name}.json`;
  a.click(); URL.revokeObjectURL(url);
};
window.FC.importMyData = function() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const r = importProgress(ev.target.result);
      alert(r.ok ? '匯入成功！' : '匯入失敗：' + r.error);
      if (r.ok) render();
    };
    reader.readAsText(file);
  };
  input.click();
};

// ── 渲染 ──
function render() {
  let html = '';
  try {
    switch (state.view) {
      case 'role-select':    html = renderRoleSelect(); break;
      case 'hub':            html = renderGameHub(); break;
      case 'mode-select':    html = renderModeSelect(state.gameMode, state.subjectId); break;
      case 'student-select': html = renderStudentSelect(); break;
      case 'subject-select': html = renderSubjectSelect(); break;
      case 'login': html = _teacher ? _teacher.renderLogin() : '<div class="container"><p>載入中...</p></div>'; break;
      case 'teacher': html = _teacher ? _teacher.renderTeacher() : '<div class="container"><p>載入中...</p></div>'; break;
      case 'teacher-assign': html = renderTeacherAssign(); break;
      case 'home': html = renderHome(state.subjectId); break;
      case 'topic': html = renderTopicList(state.topicId, state.subjectId); break;
      case 'play': html = renderPlay(state.scenarioId, state.subjectId); break;
      case 'result': html = renderResult(state.resultData, state.subjectId); break;
      case 'progress': html = renderProgress(state.subjectId); break;
      case 'settings': html = renderSettings(); break;
      // 🏦 好人好事銀行
      case 'bank-play': {
        const run = getBankRun();
        const sc = run?.questions?.[run?.currentIdx] || null;
        html = renderBankPlay(sc, run);
        break;
      }
      case 'bank-result': html = renderBankResult(state.bankScenario, state.bankResult, getBankRun()); break;
      case 'bank-summary': html = renderBankSummary(getBankRun()); break;
      default: html = '<div class="container"><p>頁面不存在</p></div>';
    }
    app.innerHTML = html;
    // Post-render hooks
    if (state.view === 'settings') updateAnalyticsSummary();
  } catch(e) {
    console.error('RENDER ERROR:', e.message, e.stack);
    app.innerHTML = '<pre style="color:red;padding:20px">[FC] Render Error:\n' + e.message + '\n' + (e.stack||'').split('\n').slice(0,5).join('\n') + '</pre>';
  }
}

// ── 啟動 ──
setScenarios(scenariosData);
try {
  render();
} catch(e) {
  console.error('RENDER ERROR:', e.message, e.stack);
  app.innerHTML = '<pre style="color:red;padding:20px">[FC] Render Error:\n' + e.message + '\n' + (e.stack||'').split('\n').slice(0,5).join('\n') + '</pre>';
}