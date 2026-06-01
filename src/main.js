// 友愛教室 V2 — main.js
import { setStudent, getStudent, setScenarios, getScenarios, getScenariosByTopic,
         getDisplayProgress, initTopicProgress, renderHome, renderTopicList,
         renderPlay, renderResult, renderProgress, renderSettings,
         playScenario, chooseOption, suggestNext } from './engine.js';
import { speakScenario, speakCreeds, setEnabled, isEnabled } from './audio.js';
import { exportProgress, importProgress, getAllStudents, getProgress, updateSubjectTotal } from './progress.js';
import scenariosData from '../data/scenarios.json';

// ── Vite HMR 破壞 DOM 寫入，强制停用 ──
if (import.meta.hot) { import.meta.hot.decline(); }

// ── 初始化 ──
const app = document.getElementById('app');
console.log('[FC] app element:', app);
console.log('[FC] scenariosData length:', scenariosData?.length);

// ── 科目定義 ──
const SUBJECTS = [
  { id: 'math',    title: '數學', emoji: '🎯', color: '#4285F4', bgColor: '#E8F0FE' },
  { id: 'chinese', title: '中文', emoji: '📐', color: '#EA4335', bgColor: '#FCE8E6' },
  { id: 'english', title: '英文', emoji: '🔤', color: '#34A853', bgColor: '#E6F4EA' },
  { id: 'science', title: '常識', emoji: '🔬', color: '#9C27B0', bgColor: '#F3E5F5' },
];

function getSubjectColor(id)  { return SUBJECTS.find(s => s.id === id)?.color || '#666'; }
function getSubjectBgColor(id){ return SUBJECTS.find(s => s.id === id)?.bgColor || '#f5f5f5'; }

// ── 狀態機 ──
let state = {
  view: 'home',      // home | topic | play | result | progress | settings | teacher | login | student-select | subject-select
  student: null,
  subjectId: null,   // 🎯📐🔤🔬
  topicId: null,
  scenarioId: null,
  resultData: null,
  teacherMode: false,
};

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
  state = { ...state, view: 'play', scenarioId };
  render();
}
window.FC.play = play;

export function choose(optionId) {
  const data = chooseOption(optionId, state.subjectId);
  state = { ...state, view: 'result', resultData: data };
  render();
}
window.FC.choose = choose;

export function retry() {
  if (state.scenarioId) play(state.scenarioId);
  else goHome();
}
window.FC.retry = retry;

export function goProgress() {
  if (!getStudent()) { switchStudent(); return; }
  state = { ...state, view: 'progress' };
  render();
}
window.FC.goProgress = goProgress;

export function goSettings() {
  state = { ...state, view: 'settings' };
  render();
}
window.FC.goSettings = goSettings;

export function goTeacher() {
  state = { ...state, view: 'login' };
  render();
}
window.FC.goTeacher = goTeacher;

export function goRandom() {
  const all = getScenarios();
  if (!all.length) { goHome(); return; }
  const s = all[Math.floor(Math.random() * all.length)];
  play(s.id);
}
window.FC.goRandom = goRandom;

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

export function switchStudent() {
  state = { ...state, view: 'student-select' };
  render();
}
window.FC.switchStudent = switchStudent;

// ── 學生選擇 ──
const STUDENT_EMOJI = { '張鈞保': '👦', '祝卓鋒': '🚪' };
function renderStudentSelect() {
  const saved = ['張鈞保', '祝卓鋒'];
  return `
    <div class="container fade-in" style="max-width:460px;padding-top:40px">
      <h2 style="text-align:center;margin-bottom:24px">👤 選擇學生</h2>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px">
        ${['張鈞保', '祝卓鋒'].map(name => `
          <div class="student-card" onclick="FC.selectStudent('${name}')">
            <div class="avatar">${STUDENT_EMOJI[name] || '👤'}</div>
            <div class="info">
              <div class="name">${name}</div>
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
        <button class="btn btn-outline" onclick="FC.goHome()">← 返回</button>
      </div>
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

// ── 老師登入 ──
function renderLogin() {
  return `
    <div class="container fade-in">
      <div class="login-form">
        <h2 style="text-align:center;margin-bottom:20px">🔐 老師登入</h2>
        <input id="teacher-pw" type="password" placeholder="輸入密碼" />
        <button class="btn btn-primary" style="width:100%" onclick="FC.doLogin()">登入</button>
        <p id="login-error" style="color:var(--danger);text-align:center;margin-top:8px;display:none">密碼錯誤</p>
        <div style="margin-top:12px;text-align:center">
          <button class="btn btn-outline" onclick="FC.goHome()">← 返回</button>
        </div>
      </div>
    </div>
  `;
}
window.FC.doLogin = function() {
  const pw = document.getElementById('teacher-pw')?.value;
  if (pw === 'admin') {
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
        ${SUBJECTS.map(sub => `
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
    </div>
  `;
}

// ── 老師Dashboard ──
const _TEACHER_SUBJECTS = [
  { id: 'math',    label: '🎯', color: '#4285F4' },
  { id: 'chinese', label: '📐', color: '#EA4335' },
  { id: 'english', label: '🔤', color: '#34A853' },
  { id: 'science', label: '🔬', color: '#9C27B0' },
];

// ── 老師儀表板 ──
function renderTeacher() {
  const students = getAllStudents();
  const TEACHER_EMOJI = { '張鈞保': '👦', '祝卓鋒': '🚪' };

  if (!students.length) {
    return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goHome()">←</button>
        <h2>📊 老師儀表板</h2>
      </div>
      <div class="teacher-panel">
        <h2>📊 老師儀表板</h2>
        <div class="subtitle">暂无学生数据</div>
      </div>
      <div style="text-align:center;padding:40px;color:var(--text-light)">
        <div style="font-size:3em;margin-bottom:12px">📭</div>
        <p>暫時沒有學生數據</p>
        <p style="font-size:0.85em;margin-top:8px">學生完成學習後會自動顯示在這裡</p>
      </div>
      <div style="margin-top:16px">
        <button class="btn btn-outline" onclick="FC.goHome()">← 返回首頁</button>
      </div>
    </div>`;
  }

  return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goHome()">←</button>
        <h2>📊 老師儀表板</h2>
      </div>

      <div class="teacher-panel">
        <h2>👥 學生總覽</h2>
        <div class="subtitle">共 ${students.length} 位學生</div>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px">
        ${students.map(s => {
          const total = s.totalMoralScore || 0;
          const completed = s.completedScenarios?.length || 0;
          const emoji = TEACHER_EMOJI[s.name] || '👤';
          const grade = total >= 200 ? '🌟' : total >= 100 ? '⭐' : total >= 50 ? '✨' : '💫';
          return `
          <div class="student-row">
            <div class="avatar">${emoji}</div>
            <div class="info">
              <div class="name">${s.name}</div>
              <div class="meta">完成 ${completed} 個場景 · 最近 ${s.lastPlayed || '—'}</div>
            </div>
            <div class="stat-badge">
              <div class="num" style="color:${total >= 100 ? '#52c41a' : 'var(--text)'}">${total}</div>
              <div class="label">道德分</div>
            </div>
            <div style="font-size:1.2em">${grade}</div>
          </div>`;
        }).join('')}
      </div>

      <div class="card" style="margin-top:16px">
        <div style="font-weight:600;margin-bottom:10px">📚 科目總覽</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
          ${[{id:'math',label:'🎯',color:'#4285F4'},{id:'chinese',label:'📐',color:'#EA4335'},{id:'english',label:'🔤',color:'#34A853'},{id:'science',label:'🔬',color:'#9C27B0'}].map(sub => {
            const totalCompleted = students.reduce((acc, s) => acc + (s.subjectProgress?.[sub.id]?.completed || 0), 0);
            const totalPossible = students.reduce((acc, s) => acc + (s.subjectProgress?.[sub.id]?.total || 0), 0);
            const pct = totalPossible ? Math.round((totalCompleted / totalPossible) * 100) : 0;
            return `
              <div style="background:${sub.color}18;border:2px solid ${sub.color};border-radius:12px;padding:12px;text-align:center">
                <div style="font-size:1.5em;margin-bottom:4px">${sub.label}</div>
                <div style="font-weight:700;font-size:1.1em;color:${sub.color}">${totalCompleted}/${totalPossible}</div>
                <div style="height:6px;background:#eee;border-radius:3px;margin-top:6px;overflow:hidden">
                  <div style="height:100%;width:${pct}%;background:${sub.color};border-radius:3px"></div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">📥 匯入學生數據</div>
        <p style="font-size:0.85em;color:var(--text-light);margin-bottom:8px">選擇學生之前匯出的 .json 檔案</p>
        <input type="file" accept=".json" onchange="FC.handleImport(event)" style="margin-bottom:10px" />
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">📤 匯出全班數據</div>
        <button class="btn btn-success" onclick="FC.exportAll()">📤 匯出全班</button>
      </div>

      <div style="margin-top:16px">
        <button class="btn btn-outline" onclick="FC.goHome()">← 返回首頁</button>
      </div>
    </div>
  `;
}
window.FC.handleImport = function(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const r = importProgress(ev.target.result);
    if (r.ok) { alert('匯入成功！'); goTeacher(); }
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
window.FC.speakCreeds = function() {
  if (state.resultData?.creeds) speakCreeds(state.resultData.creeds);
};

window.FC.toggleVoice = function(el) {
  const on = !isEnabled();
  setEnabled(on);
  el.classList.toggle('on', on);
};

window.FC.setFontSize = function(v) {
  document.documentElement.style.setProperty('--font-size', v + 'px');
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
function safeSetNames() {
  document.querySelectorAll('.student-name').forEach((el, i) => {
    const students = getAllStudents();
    if (students[i]) el.textContent = students[i].name;
  });
}

function render() {
  // 學生未設定 → 強迫選擇
  if (!getStudent() && state.view !== 'student-select' && state.view !== 'login') {
    state = { ...state, view: 'student-select' };
  }

  console.log('[FC] render, view:', state.view);
  let html = '';
  try {
    switch (state.view) {
      case 'student-select': html = renderStudentSelect(); break;
      case 'subject-select': html = renderSubjectSelect(); break;
      case 'login': html = renderLogin(); break;
      case 'teacher': html = renderTeacher(); safeSetNames(); break;
      case 'home': html = renderHome(state.subjectId); break;
      case 'topic': html = renderTopicList(state.topicId, state.subjectId); break;
      case 'play': html = renderPlay(state.scenarioId, state.subjectId); break;
      case 'result': html = renderResult(state.resultData, state.subjectId); break;
      case 'progress': html = renderProgress(state.subjectId); break;
      case 'settings': html = renderSettings(); break;
      default: html = '<div class="container"><p>頁面不存在</p></div>';
    }
    console.log('[FC] html length:', html.length);
    app.innerHTML = html;
  } catch(e) {
    console.error('[FC] RENDER ERROR:', e.message, e.stack);
    app.innerHTML = '<pre style="color:red;padding:20px">[FC] Render Error:\n' + e.message + '\n' + (e.stack||'').split('\n').slice(0,5).join('\n') + '</pre>';
  }
}

// ── 啟動 ──
setScenarios(scenariosData);
try {
  render();
  console.log('[FC] render complete, app innerHTML length:', app.innerHTML.length);
} catch(e) {
  console.error('[FC] RENDER ERROR:', e.message, e.stack);
  app.innerHTML = '<pre style="color:red;padding:20px">[FC] Render Error:\n' + e.message + '\n' + (e.stack||'').split('\n').slice(0,5).join('\n') + '</pre>';
}