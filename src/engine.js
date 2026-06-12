// 遊戲引擎 — Render Layer
// 遊戲邏輯 delegate 到 domain/ScenarioEngine.js
// 所有 render* 函數保留在此檔案

import { getSubjectColor, getSubjectBgColor, getSubjectName, getSubjectEmoji } from './subjects.js';
import { getTopic } from './topics.js';
import { speakScenario, speakCreeds, isEnabled } from './audio.js';
import { getMoralBarData } from './domain/Moral.js';
import { getProgress, isCompleted } from './domain/Progress.js';

// ── 遊戲邏輯 delegate（from domain/ScenarioEngine） ──
import {
  setStudent, getStudent,
  setScenarios, getScenarios, getScenariosByTopic,
  playScenario, getCurrentScenario,
  chooseOption,
  getScenarioStatus,
  initTopicProgress, initSubjectProgress,
  getDisplayProgress, suggestNext,
} from './domain/ScenarioEngine.js';

export { setStudent, getStudent, setScenarios, getScenarios, getScenariosByTopic,
         playScenario, chooseOption, getScenarioStatus, initTopicProgress,
         initSubjectProgress, getDisplayProgress, suggestNext };

// ── Role Select (Entry Screen) ──────────────────────────────────────────────
export function renderRoleSelect() {
  return `
    <div class="role-screen">
      <div class="logo">🎓</div>
      <h1>友愛教室</h1>
      <p class="tagline">選擇你的身份，開始學習！</p>

      <div class="role-cards">
        <div class="role-card student" onclick="FC.chooseRole('student')">
          <div class="rc-icon">🧒</div>
          <div class="rc-body">
            <h3>學生模式</h3>
            <p>自己揀遊戲模式、自己揀課題，自由探索學習</p>
          </div>
          <div class="rc-arrow">→</div>
        </div>

        <div class="role-card teacher" onclick="FC.chooseRole('teacher')">
          <div class="rc-icon">👨‍🏫</div>
          <div class="rc-body">
            <h3>老師 / 家長模式</h3>
            <p>設定功課範圍、控制功能開關、查看學習報告</p>
          </div>
          <div class="rc-arrow">→</div>
        </div>
      </div>

      <div style="margin-top:32px;text-align:center">
        <p style="font-size:0.8em;color:var(--text-light)">© Ken Cheng 製作</p>
      </div>
    </div>
  `;
}

// ── Game Mode Select ────────────────────────────────────────────────────────
export const GAME_MODES = [
  {
    id: 'relaxed',
    icon: '🧘',
    title: '輕鬆學習',
    desc: '無計時、無限提示，慢慢做，慢慢學',
    color: '#eab308',
    bg: 'linear-gradient(135deg, #fef9c3, #fef08a)',
  },
  {
    id: 'timed',
    icon: '⚡',
    title: '計時挑戰',
    desc: '限時答題，計分，訓練答題速度',
    color: '#3b82f6',
    bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
  },
  {
    id: 'combo',
    icon: '🔥',
    title: 'Combo 衝刺',
    desc: '連續答啱分數倍增，挑戰最高 Combo 數',
    color: '#ef4444',
    bg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
  },
  {
    id: 'challenge',
    icon: '🎯',
    title: '挑戰模式',
    desc: '計時 + Combo 混合，最強挑戰',
    color: '#a855f7',
    bg: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
  },
];

export function renderModeSelect(subjectId) {
  const savedMode = localStorage.getItem('fc_game_mode') || 'relaxed';

  return `
    <div class="mode-screen fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goRoleSelect()">←</button>
        <h2>🎮 選擇遊戲模式</h2>
      </div>

      <div class="mode-header">
        <h2>🎮 選擇遊戲模式</h2>
        <p>你鍾意點玩？揀一個模式開始！</p>
      </div>

      <div class="mode-grid">
        ${GAME_MODES.map(m => `
          <div class="mode-card ${m.id} ${savedMode === m.id ? 'selected' : ''}"
               style="background:${m.bg};border-color:${m.color}"
               onclick="FC.selectMode('${m.id}')">
            <div class="mc-icon">${m.icon}</div>
            <div class="mc-title">${m.title}</div>
            <div class="mc-desc">${m.desc}</div>
          </div>
        `).join('')}
      </div>

      <div style="text-align:center;margin-top:8px;margin-bottom:20px">
        <p style="font-size:0.85em;color:var(--text-light)">
          💡 模式可以在設定頁隨時更改
        </p>
      </div>

      ${subjectId ? `
        <div style="text-align:center">
          <button class="btn btn-primary" style="min-width:220px;font-size:1.1em"
            onclick="FC.goHome()">
            ✅ 確定，開始學習 →
          </button>
        </div>
      ` : `
        <div style="text-align:center">
          <button class="btn btn-primary" style="min-width:220px;font-size:1.1em"
            onclick="FC.goSubjectSelect()">
            📚 選擇課題 →
          </button>
        </div>
      `}

      <div style="text-align:center;margin-top:16px">
        <button class="btn btn-outline" onclick="FC.goRoleSelect()">← 返回</button>
      </div>

      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `;
}

// ── Teacher Assignment Config ──────────────────────────────────────────────
export function renderTeacherAssign() {
  const topics = [
    { id: 'emotions', emoji: '🎭', title: '情緒與規範', sub: '管理情緒、守規矩', color: '#FF6B6B' },
    { id: 'respect',  emoji: '🤝', title: '尊重與關懷', sub: '尊重別人、關心他人', color: '#4ECDC4' },
    { id: 'honesty',  emoji: '⚖️', title: '誠實與責任', sub: '誠實面對、勇於承擔', color: '#45B7D1' },
    { id: 'conflict', emoji: '💪', title: '衝突與求助', sub: '解決衝突、向人求助', color: '#96CEB4' },
  ];

  const saved = JSON.parse(localStorage.getItem('fc_teacher_config') || '{}');
  const config = {
    hintEnabled: saved.hintEnabled !== false,
    timerEnabled: saved.timerEnabled ?? false,
    timerSeconds: saved.timerSeconds || 30,
    comboEnabled: saved.comboEnabled ?? false,
    buttonSize: saved.buttonSize || 'normal',
    assignedTopics: saved.assignedTopics || [],
  };

  return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goTeacher()">←</button>
        <h2>⚙️ 功能設定</h2>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:700;font-size:1.05em;margin-bottom:14px">🔘 功能開關</div>

        <div class="feature-toggle">
          <div>
            <div class="ft-label">💡 提示功能</div>
            <div class="ft-desc">學生可以睇提示</div>
          </div>
          <button class="toggle-switch ${config.hintEnabled ? 'on' : ''}"
            onclick="FC.toggleTeacherFeature(this, 'hintEnabled')"></button>
        </div>

        <div class="feature-toggle">
          <div>
            <div class="ft-label">⏱️ 計時功能</div>
            <div class="ft-desc">開啟後每題限時答題</div>
          </div>
          <button class="toggle-switch ${config.timerEnabled ? 'on' : ''}"
            onclick="FC.toggleTeacherFeature(this, 'timerEnabled')"></button>
        </div>

        ${config.timerEnabled ? `
        <div style="padding:10px 0 14px 0">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <strong>答題時限</strong>
            <span style="color:var(--primary);font-weight:600">${config.timerSeconds} 秒</span>
          </div>
          <input type="range" min="10" max="60" step="5" value="${config.timerSeconds}"
            oninput="FC.setTeacherTimer(this.value)"
            style="width:100%;accent-color:var(--primary)" />
          <div style="display:flex;justify-content:space-between;font-size:0.8em;color:var(--text-light)">
            <span>10秒</span><span>30秒</span><span>60秒</span>
          </div>
        </div>
        ` : ''}

        <div class="feature-toggle">
          <div>
            <div class="ft-label">🔥 Combo 系統</div>
            <div class="ft-desc">開啟連續答啱加分</div>
          </div>
          <button class="toggle-switch ${config.comboEnabled ? 'on' : ''}"
            onclick="FC.toggleTeacherFeature(this, 'comboEnabled')"></button>
        </div>

        <div class="feature-toggle">
          <div>
            <div class="ft-label">👆 按鈕大小</div>
            <div class="ft-desc">控制答題按鈕尺寸</div>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn ${config.buttonSize==='large'?'btn-primary':'btn-outline'}"
              style="padding:6px 12px;font-size:0.85em;min-height:36px"
              onclick="FC.setButtonSize('large')">大</button>
            <button class="btn ${config.buttonSize==='normal'?'btn-primary':'btn-outline'}"
              style="padding:6px 12px;font-size:0.85em;min-height:36px"
              onclick="FC.setButtonSize('normal')">中</button>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:700;font-size:1.05em;margin-bottom:12px">📋 課題範圍</div>
        <p style="font-size:0.88em;color:var(--text-light);margin-bottom:12px">
          勾選要考核的主題，留空 = 全部開放
        </p>
        ${topics.map(t => `
          <label style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer">
            <input type="checkbox" value="${t.id}"
              ${config.assignedTopics.includes(t.id) || config.assignedTopics.length === 0 ? 'checked' : ''}
              onchange="FC.toggleAssignedTopic('${t.id}', this.checked)"
              style="width:22px;height:22px;accent-color:var(--primary)" />
            <span style="font-size:1.2em">${t.emoji}</span>
            <span style="font-weight:600">${t.title}</span>
            <span style="margin-left:auto;font-size:0.82em;color:var(--text-light)">${t.sub}</span>
          </label>
        `).join('')}
      </div>

      <div class="card">
        <div style="font-weight:700;font-size:1.05em;margin-bottom:10px">🔐 PIN 安全</div>
        <p style="font-size:0.88em;color:var(--text-light);margin-bottom:12px">
          老師模式 PIN（預設：admin）
        </p>
        <input type="password" id="teacher-pin-input" value="admin" maxlength="6"
          placeholder="輸入新 PIN"
          style="width:100%;padding:14px;border:2px solid var(--border);border-radius:12px;font-size:1em;box-sizing:border-box;margin-bottom:10px" />
        <button class="btn btn-outline" style="width:100%;font-size:0.95em"
          onclick="FC.saveTeacherPIN()">💾 儲存 PIN</button>
      </div>

      <div style="margin-top:16px">
        <button class="btn btn-primary" style="width:100%"
          onclick="FC.saveTeacherConfig()">✅ 儲存所有設定</button>
      </div>

      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:24px">© Ken Cheng 製作</div>
    </div>
  `;
}

// === 道德值 Bar（接受 studentId，pure function）===
export function renderMoralBar(studentId) {
  if (!studentId) return '';
  const p = getProgress(studentId);
  const score = p.totalMoralScore || 0;
  const { percent, color } = getMoralBarData(score);
  return `
    <div class="moral-bar-fixed" id="moral-bar">
      <div class="moral-bar-inner">
        <span class="moral-emoji">⭐</span>
        <span class="moral-label">道德值</span>
        <div class="moral-track">
          <div class="moral-fill" style="width:${percent}%;background:${color}"></div>
        </div>
        <span class="moral-num">${score}</span>
        <span id="sync-badge" title="已連線" style="font-size:0.95em;opacity:0.85">☁️</span>
      </div>
    </div>
  `;
}

export function renderHome(subjectId) {
  const subjectColor = getSubjectColor(subjectId);
  const subjectBg = getSubjectBgColor(subjectId);
  const gameMode = localStorage.getItem('fc_game_mode') || 'relaxed';
  const modeInfo = GAME_MODES.find(m => m.id === gameMode) || GAME_MODES[0];

  // TTS 測試（方便學生確認聲音正常）
  const ttsTestHtml = isEnabled() ? `<button class="btn btn-outline" style="margin-bottom:12px;font-size:0.9em" onclick="FC.testTTS()">🔊 測試發音</button>` : '';

  return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goRoleSelect()">🏠</button>
        <h2>🌟 友愛教室</h2>
        <button class="back-btn" style="background:${subjectBg};color:${subjectColor};border:2px solid ${subjectColor}"
          onclick="FC.goSubjectSelect()">
          ${getSubjectEmoji(subjectId) || '📚'}
        </button>
      </div>

      ${getStudent() ? renderMoralBar(getStudent()) : ''}

      <!-- Mode badge + change button -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
        <span class="mode-badge ${gameMode}" style="font-size:0.88em">
          ${modeInfo.icon} ${modeInfo.title}
        </span>
        <button onclick="FC.goModeSelect()"
          style="background:none;border:none;cursor:pointer;font-size:0.8em;color:var(--text-light);text-decoration:underline;padding:0">
          更改模式
        </button>
      </div>

      ${subjectId ? `
      <div class="subject-banner" style="background:${subjectBg};border:2px solid ${subjectColor}">
        <span style="font-size:1.5em">${getSubjectEmoji(subjectId)}</span>
        <div>
          <div style="font-weight:600;color:${subjectColor}">${getSubjectName(subjectId)}學模擬練習</div>
          <div style="font-size:0.85em;color:var(--text-light)">按主題學習 → 智能漸進解鎖</div>
        </div>
        <button class="btn btn-sm" style="margin-left:auto;background:${subjectColor};color:white"
          onclick="FC.goSubjectSelect()">切換科目</button>
      </div>
      ` : `
      <div class="subject-banner" style="background:#f5f5f5;border:2px dashed #ccc;text-align:center;padding:16px">
        <div style="margin-bottom:8px">📚 請先選擇科目</div>
        <button class="btn btn-primary" onclick="FC.goSubjectSelect()">選擇科目</button>
      </div>
      `}

      <div class="topic-grid">
        ${[
          { id: 'emotions', emoji: '🎭', title: '情緒與規範', sub: '管理情緒、守規矩', color: '#FF6B6B' },
          { id: 'respect',  emoji: '🤝', title: '尊重與關懷', sub: '尊重別人、關心他人', color: '#4ECDC4' },
          { id: 'honesty',  emoji: '⚖️', title: '誠實與責任', sub: '誠實面對、勇於承擔', color: '#45B7D1' },
          { id: 'conflict',  emoji: '💪', title: '衝突與求助', sub: '解決衝突、向人求助', color: '#96CEB4' },
        ].map(t => {
          const p = getStudent() ? (getProgress(getStudent()).topicProgress[t.id] || {}) : {};
          const pct = p.total ? Math.round((p.completed / p.total) * 100) : 0;
          return `
            <div class="topic-card" style="background:${t.color}" onclick="FC.goTopic('${t.id}')">
              <span class="emoji">${t.emoji}</span>
              <div class="title">${t.title}</div>
              <div class="sub">${t.sub}</div>
              ${getStudent() ? `
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
      ${ttsTestHtml}
      <div class="action-row">
        <button class="btn btn-outline" onclick="FC.goSettings()">⚙️ 設定</button>
        <button class="btn btn-outline" onclick="FC.switchStudent()">🔄 切換學生</button>
      </div>
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `;
}

export function renderTopicList(topicId, subjectId) {
  const topic = getTopic(topicId);
  const topicScenarios = getScenariosByTopic(topicId);
  const subColor = getSubjectColor(subjectId);
  initTopicProgress(topicId);

  return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goHome()">←</button>
        <h2>${topic.emoji} ${topic.title}</h2>
        ${subjectId ? `<span class="topic-badge" style="background:${subColor}">${getSubjectEmoji(subjectId)} ${getSubjectName(subjectId)}</span>` : ''}
      </div>
      <p style="color:var(--text-light);margin-bottom:16px">${topic.description}</p>

      <ul class="scenario-list">
        ${topicScenarios.map(s => {
          const done = getStudent() && isCompleted(getStudent(), s.id);
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
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `;
}

export function renderPlay(scenarioId, subjectId) {
  const s = playScenario(scenarioId);
  if (!s) return '<div class="container"><p>場景不存在</p></div>';
  const topic = getTopic(s.topicId);
  const subColor = getSubjectColor(subjectId);

  return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goTopic('${s.topicId}')">←</button>
        ${subjectId ? `<span class="topic-badge" style="background:${subColor}">${getSubjectEmoji(subjectId)} ${getSubjectName(subjectId)}</span>` : ''}
        <span class="play-top" style="flex:1;text-align:center">
          <span class="topic-badge" style="background:${topic?.color || 'var(--primary)'}">${topic?.emoji || ''} ${topic?.title || ''}</span>
        </span>
      </div>

      <div class="play-top">
        <div class="scenario-title">${s.title}</div>
        <div class="scenario-bg">📍 ${s.background || ''}</div>
      </div>

      <div class="scenario-image-wrap">
        <img src="assets/images/scenarios/${s.id}.png" alt="${s.title}" class="scenario-image"
             onerror="this.style.display='none'" />
      </div>

      <div class="scenario-desc">
        <button class="inline-voice-btn" onclick="FC.speak()" title="朗讀題目">🔊</button>
        ${s.description}
      </div>
      <div class="options">
        ${s.options.map((opt, i) => {
          const labels = ['A', 'B', 'C', 'D'];
          return `
            <div class="option-card" onclick="FC.choose('${opt.id}')">
              <img src="assets/images/outcomes/${s.id}_opt${i+1}.png" alt=""
                   class="opt-thumb" onerror="this.style.display='none'" />
              <span class="opt-badge">${labels[i] || (i+1)}</span>
              <span class="opt-text">${opt.text}</span>
              <button class="opt-read" onclick="event.stopPropagation();FC.speakOpt('${opt.id}')" title="朗讀">🔊</button>
            </div>
          `;
        })}
      </div>

      <button class="voice-fab" onclick="FC.speak()" title="朗讀題目">🔊</button>
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `;
}

export function renderResult(data, subjectId) {
  if (!data) {
    return '<div class="container fade-in"><p>⚠️ 結果載入失敗，請重試。</p><button class="btn btn-primary" onclick="FC.goHome()">← 返首頁</button></div>';
  }
  const { option, moralChange, mainComment, creeds, creedText, scenarioImage, scenarioTitle } = data;
  const isGood = moralChange >= 0;
  const subColor = getSubjectColor(subjectId);

  return `
    <div class="container fade-in" id="result-root">
      ${subjectId ? `<div style="text-align:center;margin-bottom:8px">
        <span class="topic-badge" style="background:${subColor}">${getSubjectEmoji(subjectId)} ${getSubjectName(subjectId)}</span>
      </div>` : ''}
      ${scenarioImage ? `
      <div class="scenario-image-wrap" style="max-height:180px;margin-bottom:16px;border-radius:16px;overflow:hidden">
        <img src="${scenarioImage}" alt="${scenarioTitle}" style="width:100%;max-height:180px;object-fit:cover" />
      </div>` : ''}
      <div class="result-card ${isGood ? 'good' : 'bad'}" id="result-card">
        <div class="result-emoji">${isGood ? '🌟' : '💪'}</div>
        <div class="comment">${mainComment || '你做出了選擇！'}</div>
        <div class="moral-score">${isGood ? '＋' : ''}${moralChange} 道德分</div>
      </div>

      <div class="creed-show">
        <div class="creed-header">
          <div class="label">🌟 學校信條</div>
          <button class="inline-voice-btn" onclick="FC.speakCreeds()" title="朗讀信條">🔊</button>
        </div>
        <div class="items">
          ${(creedText || []).map(c => `<div class="item">${c}</div>`).join('')}
        </div>
      </div>

      ${data.outcomeImage ? `
      <div class="outcome-image-wrap" style="margin-top:16px;border-radius:16px;overflow:hidden">
        <img src="${data.outcomeImage}" alt="結果圖" style="width:100%;border-radius:16px"
             onerror="this.style.display='none'" />
      </div>` : ''}

      <div class="action-row">
        <button class="btn btn-primary" onclick="FC.retry()">🔄 再做一次</button>
        <button class="btn btn-outline" onclick="FC.goTopic('${getCurrentScenario()?.topicId}')">← 返回主題</button>
      </div>

      <button class="voice-fab" onclick="FC.speakCreeds()" title="朗讀信條">🔊</button>
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `;
}

export function renderProgress(subjectId) {
  const p = getProgress(getStudent());
  const total = p.totalMoralScore || 0;
  const completed = p.completedScenarios?.length || 0;
  const subColor = getSubjectColor(subjectId);
  const subjects = [
    { id: 'math',    title: '🎯 數學',    color: '#4285F4' },
    { id: 'chinese', title: '📐 中文',    color: '#EA4335' },
    { id: 'english', title: '🔤 英文',    color: '#34A853' },
    { id: 'science', title: '🔬 常識',    color: '#9C27B0' },
  ];

  return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goHome()">←</button>
        <h2>📊 我的進度</h2>
        ${subjectId ? `<span class="topic-badge" style="background:${subColor}">${getSubjectEmoji(subjectId)} ${getSubjectName(subjectId)}</span>` : ''}
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

      ${subjectId ? `<div class="card" style="margin-bottom:12px">
        <div style="font-weight:600;margin-bottom:10px">📚 科目進度</div>
        ${subjects.map(sub => {
          const sp = p.subjectProgress?.[sub.id] || {};
          const pct = sp.total ? Math.round((sp.completed / sp.total) * 100) : 0;
          return `
            <div style="margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="color:${sub.color};font-weight:600">${sub.title}</span>
                <span style="color:var(--text-light)">${sp.completed || 0}/${sp.total || 0}</span>
              </div>
              <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:${sub.color};border-radius:4px;transition:width 0.4s"></div>
              </div>
            </div>`;
        }).join('')}
      </div>` : ''}

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
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `;
}

export function renderSettings() {
  const speed = localStorage.getItem('fc_tts_speed') || '0.85';
  const fontSize = localStorage.getItem('fc_font_size') || '18';
  const lineHeight = localStorage.getItem('fc_line_height') || '1.5';
  const spacing = localStorage.getItem('fc_spacing') || 'medium';

  const fsLabel = fontSize <= 18 ? '小' : fontSize <= 22 ? '中' : '大';
  const enabled = isEnabled();

  // Sync status for display
  const syncStatus = (() => {
    try {
      return window._fcSyncStatus || { status: 'idle', isOnline: navigator.onLine, lastSyncTime: null };
    } catch { return { status: 'idle', isOnline: true }; }
  })();
  const lastSync = syncStatus.lastSyncTime
    ? new Date(syncStatus.lastSyncTime).toLocaleString('zh-HK', { dateStyle: 'short', timeStyle: 'short' })
    : '從未同步';

  return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goRoleSelect()">←</button>
        <h2>⚙️ 個人化設定</h2>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:14px">🔊 語音朗讀</div>
        <div class="setting-row" style="margin-bottom:12px">
          <div>
            <strong>開 / 關</strong>
            <div style="font-size:0.85em;color:var(--text-light)">自動朗讀題目和信條</div>
          </div>
          <div class="toggle ${enabled ? 'on' : ''}" data-key="voice" onclick="FC.toggleVoice(this)"></div>
        </div>
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <strong>朗讀速度</strong>
            <span class="val-label" style="color:var(--primary);font-weight:600" data-for="speed">${parseFloat(speed).toFixed(2)}x</span>
          </div>
          <input type="range" min="0.5" max="1.5" step="0.05" value="${speed}"
            oninput="FC.setSpeed(this.value)"
            style="width:100%;accent-color:var(--primary)" />
          <div style="display:flex;justify-content:space-between;font-size:0.8em;color:var(--text-light)">
            <span>慢</span><span>正常</span><span>快</span>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:14px">📝 文字顯示</div>
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <strong>字體大小</strong>
            <span class="val-label" style="color:var(--primary);font-weight:600" data-for="fs">${fsLabel}</span>
          </div>
          <input type="range" min="16" max="32" step="2" value="${fontSize}"
            oninput="FC.setFontSize(this.value)"
            style="width:100%;accent-color:var(--primary)" />
          <div style="display:flex;justify-content:space-between;font-size:0.8em;color:var(--text-light)">
            <span>Aa</span><span style="font-size:1.2em">Aa</span><span style="font-size:1.5em">Aa</span>
          </div>
        </div>
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <strong>行距</strong>
            <span class="val-label" style="color:var(--primary);font-weight:600" data-for="lh">${lineHeight}</span>
          </div>
          <input type="range" min="1.2" max="2.2" step="0.1" value="${lineHeight}"
            oninput="FC.setLineHeight(this.value)"
            style="width:100%;accent-color:var(--primary)" />
        </div>
        <div>
          <div style="margin-bottom:6px"><strong>間格</strong></div>
          <div style="display:flex;gap:8px">
            <button class="btn ${spacing==='narrow'?'btn-primary':'btn-outline'}" onclick="FC.setSpacing('narrow')" id="sp-narrow" style="flex:1;padding:8px;font-size:0.9em">窄</button>
            <button class="btn ${spacing==='medium'?'btn-primary':'btn-outline'}" onclick="FC.setSpacing('medium')" id="sp-medium" style="flex:1;padding:8px;font-size:0.9em">中</button>
            <button class="btn ${spacing==='wide'?'btn-primary':'btn-outline'}" onclick="FC.setSpacing('wide')" id="sp-wide" style="flex:1;padding:8px;font-size:0.9em">闊</button>
          </div>
        </div>
        <div style="margin-top:12px;text-align:center">
          <button class="btn btn-outline" onclick="FC.resetSettings()" style="color:var(--text-light);font-size:0.85em">🔄 重置所有設定</button>
        </div>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">☁️ 雲端同步</div>
        <div style="font-size:0.9em;color:var(--text-light);margin-bottom:10px">
          連線狀態：<span id="settings-sync-status">${syncStatus.isOnline ? '在線' : '📴 離線'}</span>
          &nbsp;·&nbsp;上次同步：<span id="settings-last-sync">${lastSync}</span>
        </div>
        <div class="action-row">
          <button class="btn btn-outline" onclick="FC.forceSync()">🔄 立即同步</button>
          <button class="btn btn-outline" onclick="FC.exportMyData()">📤 匯出</button>
          <button class="btn btn-outline" onclick="FC.importMyData()">📥 匯入</button>
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

      <div class="privacy-notice" style="background:#fffbe6;border:1px solid #faad14;border-radius:12px;padding:16px;margin-top:24px;font-size:14px;color:#8a6d3b">
        <h4 style="margin-bottom:8px">🔒 資料收集說明</h4>
        <p>本應用使用瀏覽器本地儲存（localStorage）保存以下資料：</p>
        <ul style="margin:8px 0 0 20px">
          <li>個人化設定（字體大小、行距、朗讀速度）</li>
          <li>學習進度及題目記錄</li>
        </ul>
        <p style="margin-top:8px">📌 離線使用時，進度仍保存在本地。恢復連線後自動同步。</p>
      </div>

      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `;
}