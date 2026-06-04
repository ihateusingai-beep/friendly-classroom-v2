// 遊戲引擎
import { getProgress, markComplete, updateTopicTotal, updateSubjectTotal, isCompleted } from './progress.js';
import { getTopic } from './topics.js';
import { getCreedsByIds, formatCreeds } from './creeds.js';
import { speakScenario, speakCreeds, isEnabled } from './audio.js';

// ── 科目 helpers ──
const _SUBJECTS = [
  { id: 'math',    title: '數學', emoji: '🎯', color: '#4285F4', bgColor: '#E8F0FE' },
  { id: 'chinese', title: '中文', emoji: '📐', color: '#EA4335', bgColor: '#FCE8E6' },
  { id: 'english', title: '英文', emoji: '🔤', color: '#34A853', bgColor: '#E6F4EA' },
  { id: 'science', title: '常識', emoji: '🔬', color: '#9C27B0', bgColor: '#F3E5F5' },
];
function getSubjectColor(id)  { return _SUBJECTS.find(s => s.id === id)?.color || '#666'; }
function getSubjectBgColor(id){ return _SUBJECTS.find(s => s.id === id)?.bgColor || '#f5f5f5'; }
function getSubjectName(id)   { return _SUBJECTS.find(s => s.id === id)?.title || ''; }
function getSubjectEmoji(id)  { return _SUBJECTS.find(s => s.id === id)?.emoji || ''; }

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

export function chooseOption(optionId, subjectId) {
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
    markComplete(currentStudent, scenario.id, scenario.topicId, moralChange, subjectId);
  }

  // 信條
  const creeds = getCreedsByIds(scenario.creedIds || []);

  return {
    option,
    moralChange,
    mainComment,
    creeds,
    creedText: formatCreeds(scenario.creedIds || []),
    scenarioImage: scenario.image || null,
    scenarioTitle: scenario.title || '',
    outcomeImage: `assets/images/outcomes/${scenario.id}_opt${scenario.options.findIndex(o=>o.id===optionId)+1}.png`,
    nextScenario: option.next_scenario || null,
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

export function initSubjectProgress(subjectId) {
  if (!currentStudent || !subjectId) return;
  // Count total scenarios (for now all scenarios belong to all subjects)
  const all = getScenarios();
  updateSubjectTotal(currentStudent, subjectId, all.length);
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

export function renderHome(subjectId) {
  const subjectColor = getSubjectColor(subjectId);
  const subjectBg = getSubjectBgColor(subjectId);

  // TTS 測試（方便學生確認聲音正常）
  const ttsTestHtml = isEnabled() ? `<button class="btn btn-outline" style="margin-bottom:12px;font-size:0.9em" onclick="FC.testTTS()">🔊 測試發音</button>` : '';

  return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.switchStudent()">👤</button>
        <h2>🌟 友愛教室</h2>
        <button class="back-btn" style="background:${subjectBg};color:${subjectColor};border:2px solid ${subjectColor}"
          onclick="FC.goSubjectSelect()">
          ${getSubjectEmoji(subjectId) || '📚'}
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
        <button class="btn btn-outline" onclick="FC.goTopic('${currentScenario?.topicId}')">← 返回主題</button>
      </div>

      <button class="voice-fab" onclick="FC.speakCreeds()" title="朗讀信條">🔊</button>
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `;
}

export function renderProgress(subjectId) {
  const p = getProgress(currentStudent);
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

  return `
    <div class="container fade-in">
      <div class="page-header">
        <button class="back-btn" onclick="FC.goHome()">←</button>
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
        <p style="margin-top:8px">📌 資料僅存放於本設備，不會傳送至任何伺服器。</p>
      </div>

      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `;
}