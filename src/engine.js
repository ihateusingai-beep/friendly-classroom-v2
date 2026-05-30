// 遊戲引擎
import { getProgress, markComplete, updateTopicTotal, isCompleted } from './progress.js';
import { getTopic } from './topics.js';
import { getCreedsByIds, formatCreeds } from './creeds.js';
import { speakScenario, speakCreeds, isEnabled } from './audio.js';

let currentStudent = null;
let currentTopic = null;
let currentScenario = null;
let scenarios = [];

export function setStudent(name) { currentStudent = name; }
export function getStudent() { return currentStudent; }

export function setScenarios(arr) { scenarios = arr; }
export function getScenarios() { return scenarios; }

export function getScenariosByTopic(topicId) {
  return scenarios.filter(s => s.topicId === topicId);
}

export function playScenario(scenarioId) {
  currentScenario = scenarios.find(s => s.id === scenarioId) || null;
  return currentScenario;
}

export function chooseOption(optionId) {
  const scenario = currentScenario;
  if (!scenario) return null;

  const option = scenario.options.find(o => o.id === optionId);
  if (!option) return null;

  // 計算道德分
  let moralChange = 0;
  let mainComment = '';
  option.effects.forEach(eff => {
    moralChange += eff.moralChange || 0;
    if (eff.comment) mainComment = eff.comment;
  });

  // 標記完成
  if (currentStudent) {
    markComplete(currentStudent, scenario.id, scenario.topicId, moralChange);
  }

  // 信條
  const creeds = getCreedsByIds(scenario.creedIds || []);

  return {
    option,
    moralChange,
    mainComment,
    creeds,
    creedText: formatCreeds(scenario.creedIds || []),
  };
}

export function getScenarioStatus(scenarioId) {
  if (!currentStudent) return 'locked';
  return isCompleted(currentStudent, scenarioId) ? 'completed' : 'available';
}

export function initTopicProgress(topicId) {
  if (!currentStudent) return;
  const topicScenarios = getScenariosByTopic(topicId);
  updateTopicTotal(currentStudent, topicId, topicScenarios.length);
}

export function getDisplayProgress() {
  if (!currentStudent) return null;
  return getProgress(currentStudent);
}

export function suggestNext(topicId) {
  const topicScenarios = getScenariosByTopic(topicId);
  if (!currentStudent) return topicScenarios[0] || null;
  const p = getProgress(currentStudent);
  return topicScenarios.find(s => !p.completedScenarios.includes(s.id)) || null;
}

export function renderHome() {
  return `
    <div class="container fade-in">
      ${currentStudent ? `
        <div class="student-bar">
          <span>👤 <span class="name">${currentStudent}</span></span>
          <span>🎯 總分：${getProgress(currentStudent).totalMoralScore || 0}</span>
        </div>
      ` : ''}

      <h1>📚 友愛教室</h1>
      <p style="text-align:center;color:var(--text-light);margin-bottom:20px">選擇一個主題開始學習</p>

      <div class="topic-grid">
        ${[
          { id: 'emotions', emoji: '🎭', title: '情緒與規範', sub: '管理情緒、守規矩', color: '#FF6B6B' },
          { id: 'respect',  emoji: '🤝', title: '尊重與關懷', sub: '尊重別人、關心他人', color: '#4ECDC4' },
          { id: 'honesty',  emoji: '⚖️', title: '誠實與責任', sub: '誠實面對、勇於承擔', color: '#45B7D1' },
          { id: 'conflict', emoji: '💪', title: '衝突與求助', sub: '解決衝突、向人求助', color: '#96CEB4' },
        ].map(t => {
          const p = currentStudent ? (getProgress(currentStudent).topicProgress[t.id] || {}) : {};
          const pct = p.total ? Math.round((p.completed / p.total) * 100) : 0;
          return `
            <div class="topic-card" style="background:${t.color}" onclick="FC.goTopic('${t.id}')">
              <span class="emoji">${t.emoji}</span>
              <div class="title">${t.title}</div>
              <div class="sub">${t.sub}</div>
              ${currentStudent ? `
                <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
                <div class="sub">${p.completed || 0}/${p.total || 0} 已完成</div>
              ` : ''}
            </div>
          `;
        })}
      </div>

      <div class="action-row" style="margin-top:20px">
        <button class="btn btn-outline" onclick="FC.goRandom()">🎲 自由模式</button>
        <button class="btn btn-outline" onclick="FC.goProgress()">📊 我的進度</button>
      </div>
      <div class="action-row">
        <button class="btn btn-outline" onclick="FC.goSettings()">⚙️ 設定</button>
        <button class="btn btn-outline" onclick="FC.switchStudent()">🔄 切換學生</button>
      </div>
    </div>
  `;
}

export function renderTopicList(topicId) {
  const topic = getTopic(topicId);
  const topicScenarios = getScenariosByTopic(topicId);
  initTopicProgress(topicId);

  return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goHome()">←</button>
        <h2>${topic.emoji} ${topic.title}</h2>
      </div>
      <p style="color:var(--text-light);margin-bottom:16px">${topic.description}</p>

      <ul class="scenario-list">
        ${topicScenarios.map(s => {
          const done = currentStudent && isCompleted(currentStudent, s.id);
          return `
            <li class="scenario-item ${done ? 'completed' : ''}" onclick="FC.play('${s.id}')">
              <div class="check">${done ? '✓' : ''}</div>
              <div class="info">
                <div class="title">${s.title}</div>
                <div class="sub">${s.background || ''}</div>
              </div>
              <span style="font-size:1.2em">→</span>
            </li>
          `;
        })}
      </ul>
    </div>
  `;
}

export function renderPlay(scenarioId) {
  const s = playScenario(scenarioId);
  if (!s) return '<div class="container"><p>場景不存在</p></div>';
  const topic = getTopic(s.topicId);

  return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goTopic('${s.topicId}')">←</button>
        <span class="play-top" style="flex:1;text-align:center">
          <span class="play-top">
            <span class="topic-badge" style="background:${topic?.color || 'var(--primary)'}">${topic?.emoji || ''} ${topic?.title || ''}</span>
          </span>
        </span>
      </div>

      <div class="play-top">
        <div class="scenario-title">${s.title}</div>
        <div class="scenario-bg">📍 ${s.background || ''}</div>
      </div>

      <div class="scenario-desc">${s.description}</div>

      <div class="options">
        ${s.options.map((opt, i) => {
          const labels = ['A', 'B', 'C', 'D'];
          return `
            <button class="option-btn" onclick="FC.choose('${opt.id}')">
              <span class="opt-id">${labels[i] || (i+1)}</span>
              ${opt.text}
            </button>
          `;
        })}
      </div>

      <button class="voice-fab" onclick="FC.speak()" title="朗讀題目">🔊</button>
    </div>
  `;
}

export function renderResult(data) {
  const { option, moralChange, mainComment, creeds, creedText } = data;
  const isGood = moralChange >= 0;

  return `
    <div class="container fade-in">
      <div class="result-card ${isGood ? 'good' : 'bad'}">
        <div class="comment">${mainComment || '你做出了選擇！'}</div>
        <div class="moral">${isGood ? '＋' : ''}${moralChange} 道德分</div>
      </div>

      <div class="creed-show">
        <div class="label">🌟 學校信條</div>
        <div class="items">
          ${(creedText || []).map(c => `<div class="item">${c}</div>`).join('')}
        </div>
      </div>

      <div class="action-row">
        <button class="btn btn-primary" onclick="FC.retry()">🔄 再做一次</button>
        <button class="btn btn-outline" onclick="FC.goTopic('${currentScenario?.topicId}')">← 返回主題</button>
      </div>

      <button class="voice-fab" onclick="FC.speakCreeds()" title="朗讀信條">🔊</button>
    </div>
  `;
}

export function renderProgress() {
  const p = getProgress(currentStudent);
  const total = p.totalMoralScore || 0;
  const completed = p.completedScenarios?.length || 0;

  return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goHome()">←</button>
        <h2>📊 我的進度</h2>
      </div>

      <div class="progress-grid">
        <div class="progress-cell big">
          <div class="num">${total}</div>
          <div class="label">🎯 總道德分</div>
        </div>
        <div class="progress-cell">
          <div class="num">${completed}</div>
          <div class="label">📝 已完成場景</div>
        </div>
        <div class="progress-cell">
          <div class="num">${p.lastPlayed || '—'}</div>
          <div class="label">🗓️ 最近遊玩</div>
        </div>
      </div>

      ${['emotions','respect','honesty','conflict'].map(tid => {
        const tp = p.topicProgress[tid] || {};
        const pct = tp.total ? Math.round((tp.completed / tp.total) * 100) : 0;
        const topic = getTopic(tid);
        return `
          <div class="card" style="margin-bottom:10px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span style="font-size:1.2em">${topic?.emoji || ''}</span>
              <strong>${topic?.title || tid}</strong>
              <span style="margin-left:auto;color:var(--text-light)">${tp.completed || 0}/${tp.total || 0}</span>
            </div>
            <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${topic?.color || 'var(--primary)'};border-radius:4px;transition:width 0.4s"></div>
            </div>
          </div>
        `;
      }).join('')}

      <div class="action-row">
        <button class="btn btn-outline" onclick="FC.exportMyData()">📤 匯出進度</button>
        <button class="btn btn-outline" onclick="FC.goHome()">← 返回首頁</button>
      </div>
    </div>
  `;
}

export function renderSettings() {
  const speechEnabled = typeof speechSynthesis !== 'undefined';
  return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goHome()">←</button>
        <h2>⚙️ 設定</h2>
      </div>

      <div class="card">
        <div class="setting-row">
          <div>
            <strong>🔊 語音朗讀</strong>
            <div style="font-size:0.85em;color:var(--text-light)">自動朗讀題目和信條</div>
          </div>
          <div class="toggle ${isEnabled() ? 'on' : ''}" onclick="FC.toggleVoice(this)"></div>
        </div>
        <div class="setting-row">
          <div>
            <strong>📝 字型大小</strong>
            <div style="font-size:0.85em;color:var(--text-light)">調整文字大小</div>
          </div>
          <select onchange="FC.setFontSize(this.value)" style="padding:6px 12px;border-radius:8px;border:1px solid var(--border)">
            <option value="16">細</option>
            <option value="18" selected>中</option>
            <option value="22">大</option>
            <option value="28">特大</option>
          </select>
        </div>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">👥 資料管理</div>
        <div class="action-row">
          <button class="btn btn-outline" onclick="FC.exportMyData()">📤 匯出我的進度</button>
          <button class="btn btn-outline" onclick="FC.importMyData()">📥 匯入進度</button>
        </div>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">🔐 老師模式</div>
        <button class="btn btn-primary" onclick="FC.goTeacher()">進入老師模式</button>
      </div>
    </div>
  `;
}