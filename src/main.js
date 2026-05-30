// 友愛教室 V2 — main.js
import { setStudent, getStudent, setScenarios, getScenarios, getScenariosByTopic,
         getDisplayProgress, initTopicProgress, renderHome, renderTopicList,
         renderPlay, renderResult, renderProgress, renderSettings,
         playScenario, chooseOption, suggestNext } from './engine.js';
import { speakScenario, speakCreeds, setEnabled, isEnabled } from './audio.js';
import { exportProgress, importProgress, getAllStudents, getProgress } from './progress.js';
import scenariosData from '../data/scenarios.json';

// ── 初始化 ──
const app = document.getElementById('app');

// 狀態機
let state = {
  view: 'home',      // home | topic | play | result | progress | settings | teacher | login | student-select
  student: null,
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
  state = { ...state, view: 'topic', topicId };
  render();
}
window.FC.goTopic = goTopic;

export function play(scenarioId) {
  state = { ...state, view: 'play', scenarioId };
  render();
}
window.FC.play = play;

export function choose(optionId) {
  const data = chooseOption(optionId);
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
  if (!getStudent()) { goStudentSelect(); return; }
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

export function switchStudent() {
  state = { ...state, view: 'student-select' };
  render();
}
window.FC.switchStudent = switchStudent;

// ── 學生選擇 ──
function renderStudentSelect() {
  return `
    <div class="container fade-in" style="max-width:400px">
      <h2 style="text-align:center;margin-bottom:20px">👤 選擇學生</h2>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${['張鈞保', '祝卓鋒', '其他'].map(name => `
          <button class="btn btn-primary" onclick="FC.selectStudent('${name}')">👤 ${name}</button>
        `).join('')}
      </div>
      <div style="margin-top:16px">
        <input id="new-student-name" type="text" placeholder="輸入新學生名字"
          style="width:100%;padding:12px;border:2px solid var(--border);border-radius:10px;font-size:1em;margin-bottom:8px" />
        <button class="btn btn-success" style="width:100%" onclick="FC.addStudent()">➕ 新增學生</button>
      </div>
      <div style="margin-top:12px;text-align:center">
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

// ── 老師Dashboard ──
function renderTeacher() {
  const students = getAllStudents();
  return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goHome()">←</button>
        <h2>📊 老師儀表板</h2>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">👥 學生一覽 (${students.length})</div>
        ${students.length === 0 ? '<p style="color:var(--text-light)">暫無學生數據</p>' : ''}
        <table class="teacher-table">
          <thead>
            <tr><th>學生</th><th>總分</th><th>已完成</th><th>最近遊玩</th></tr>
          </thead>
          <tbody>
            ${students.map(s => `
              <tr>
                <td>👤 ${s.name}</td>
                <td>${s.totalMoralScore || 0}</td>
                <td>${s.completedScenarios?.length || 0}</td>
                <td>${s.lastPlayed || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
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
function render() {
  // 學生未設定 → 強迫選擇
  if (!getStudent() && state.view !== 'student-select' && state.view !== 'login') {
    state = { ...state, view: 'student-select' };
  }

  switch (state.view) {
    case 'student-select':
      app.innerHTML = renderStudentSelect(); break;
    case 'login':
      app.innerHTML = renderLogin(); break;
    case 'teacher':
      app.innerHTML = renderTeacher(); break;
    case 'home':
      app.innerHTML = renderHome(); break;
    case 'topic':
      app.innerHTML = renderTopicList(state.topicId); break;
    case 'play':
      app.innerHTML = renderPlay(state.scenarioId); break;
    case 'result':
      app.innerHTML = renderResult(state.resultData); break;
    case 'progress':
      app.innerHTML = renderProgress(); break;
    case 'settings':
      app.innerHTML = renderSettings(); break;
    default:
      app.innerHTML = '<div class="container"><p>頁面不存在</p><button class="btn btn-primary" onclick="FC.goHome()">回首頁</button></div>';
  }
}

// ── 啟動 ──
setScenarios(scenariosData);
render();