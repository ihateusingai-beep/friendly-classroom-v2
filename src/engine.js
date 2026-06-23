// 遊戲引擎 — Render Layer
// 遊戲邏輯 delegate 到 domain/ScenarioEngine.js
// 所有 render* 函數保留在此檔案

import { getSubjectColor, getSubjectBgColor, getSubjectName, getSubjectEmoji, getAllSubjects } from './subjects.js';
import { getTopic, TOPICS, VALUES, CARING } from './topics.js';
import { speakScenario, speakCreeds, isEnabled } from './audio.js';
import { getMoralBarData } from './domain/Moral.js';
import { getProgress, isCompleted, getStudentSummary } from './domain/Progress.js';
import { getDailyCreed } from './creeds.js';
import { escapeAttr, escapeJsString } from './util/escape.js';
import { renderFooter, renderEmptyState } from './components/chrome.js';
import { renderPageHeader, renderOptionCard, renderOptions, renderBankOptionCard } from './components/blocks.js';
import { bankRiskLabel, BANK_RISK } from './constants/bank.js';
import { getTeacherConfig } from './storage.js';
// Sprint 16: Stop-and-Think panel + Result 頁 TTS 擴展 (SPEC §17.3.4 + §17.4.1)
import {
  shouldRenderStopAndThink,
  formatStopAndThink,
  getStopAndThinkAriaLabel,
  STOP_AND_THINK_EMOJI,
  STOP_AND_THINK_TITLE,
} from './domain/Feedback.js';

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
         playScenario, getCurrentScenario, chooseOption, getScenarioStatus, initTopicProgress,
         initSubjectProgress, getDisplayProgress, suggestNext };

// ── Role Select (Entry Screen) ──────────────────────────────────────────────
export function renderRoleSelect() {
  return `
    <div class="role-screen">
      <div class="logo" aria-hidden="true">🎓</div>
      <h1>友愛教室</h1>
      <p class="tagline">選擇你的身份，開始學習！</p>

      <div class="role-cards">
        <button type="button" class="role-card student" data-action="chooseRole" data-arg="student" aria-label="選擇學生模式：揀遊戲、學習社交禮貌，自由探索">
          <div class="rc-icon" aria-hidden="true">🧒</div>
          <div class="rc-body">
            <h2>學生模式</h2>
            <p>揀遊戲、學習社交禮貌，自由探索</p>
          </div>
          <div class="rc-arrow" aria-hidden="true">→</div>
        </button>

        <button type="button" class="role-card teacher" data-action="chooseRole" data-arg="teacher" aria-label="選擇老師或家長模式：設定功課範圍、控制功能開關、查看學習報告">
          <div class="rc-icon" aria-hidden="true">👨‍🏫</div>
          <div class="rc-body">
            <h2>老師 / 家長模式</h2>
            <p>設定功課範圍、控制功能開關、查看學習報告</p>
          </div>
          <div class="rc-arrow" aria-hidden="true">→</div>
        </button>
      </div>

      <div style="margin-top:32px;text-align:center">
        <p style="font-size:var(--fs-sm);color:var(--text-light)">© Ken Cheng 製作</p>
      </div>
    </div>
  `;
}

// ── Game Hub (Blooket-style lobby) ───────────────────────────────────────────
// 學生揀「學生模式」後去呢度。4 個 game card：好人好事銀行 / 情境答題 / 仲有 2 個 coming soon
export function renderGameHub() {
  // S11: 讀銀行當前難度設定，喺 bank card 入面 surface
  // Phase 3 (S14+S17): use cached getTeacherConfig() instead of raw LS parse
  const cfg = getTeacherConfig();
  const lvl = cfg.bankMaxRiskLevel ?? BANK_RISK.MILD;
  const bankRiskTag = `<div class="gc-meta" style="font-size:var(--fs-sm);color:var(--text-light);margin-top:6px">🎯 題目難度：${bankRiskLabel(lvl)}</div>`;

  return `
    <div class="hub-screen fade-in">
      ${renderPageHeader({ emoji: '🎮', title: '揀個遊戲開始', back: 'role-select', backLabel: '返回主選單' })}

      <div class="hub-grid">
        <button type="button" class="game-card available" data-action="playGoodDeedBank" style="background:linear-gradient(135deg,#fef9c3,#fde68a);border-color:#eab308" aria-label="好人好事銀行（pilot）：做好事存款，衰嘢扣款，目標存到 $100 變品格富翁">
          <div class="gc-icon" aria-hidden="true">🏦</div>
          <div class="gc-title">好人好事銀行</div>
          <div class="gc-desc">做好事存款，衰嘢扣款，目標存到 $100 變品格富翁！</div>
          ${bankRiskTag}
          <div class="gc-tag" aria-label="pilot 試玩版">pilot</div>
        </button>

        <button type="button" class="game-card available" data-action="navigate" data-arg="subject-select" style="background:linear-gradient(135deg,#f3e8ff,#e9d5ff);border-color:#7C3AED" aria-label="情境答題：17 個品格課題自由探索">
          <div class="gc-icon" aria-hidden="true">📖</div>
          <div class="gc-title">情境答題</div>
          <div class="gc-desc">17 個品格課題自由探索：12 個 EDB 價值觀 + 5 個友愛校園範疇</div>
        </button>

        <div class="game-card locked" style="background:linear-gradient(135deg,#fee2e2,#fecaca);border-color:#ef4444;cursor:not-allowed;opacity:0.6" role="img" aria-label="關係花園（暫未推出）">
          <div class="gc-icon" aria-hidden="true">🌷</div>
          <div class="gc-title">關係花園</div>
          <div class="gc-desc">（即將推出）</div>
          <div class="gc-tag" aria-hidden="true">coming soon</div>
        </div>

        <div class="game-card locked" style="background:linear-gradient(135deg,#f3e8ff,#e9d5ff);border-color:#a855f7;cursor:not-allowed;opacity:0.6" role="img" aria-label="道德大富翁（暫未推出）">
          <div class="gc-icon" aria-hidden="true">🎲</div>
          <div class="gc-title">道德大富翁</div>
          <div class="gc-desc">（即將推出）</div>
          <div class="gc-tag" aria-hidden="true">coming soon</div>
        </div>
      </div>

      <div class="fc-center-20">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="role-select">← 返回</button>
      </div>
      ${renderFooter()}
    </div>
  `;
}

// ── 🏦 好人好事銀行 ─────────────────────────────────────────────────────────
import {
  startBankRun, getBankRun, endBankRun, recordBankTransaction,
  advanceToNextQuestion, BANK_CONFIG,
} from './games/GoodDeedBank.js';

export function renderBankPlay(scenario, run) {
  if (!scenario) {
    return renderEmptyState({ emoji: '⚠️', title: '題目載入失敗', actionLabel: '← 返 Game Hub', onAction: 'FC.exitBank()' });
  }
  const total = BANK_CONFIG.QUESTIONS_PER_RUN;
  const idx = run.currentIdx + 1; // 1-based for display
  const labels = ['A', 'B', 'C', 'D'];
  const balance = run.balance;
  const target = BANK_CONFIG.TARGET_BALANCE;
  const pct = Math.min(100, Math.max(0, (balance / target) * 100));
  const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';
  // S11: 顯示當局 risk ceiling
  const riskLvl = run.maxRisk ?? BANK_RISK.MILD;
  const riskTag = `<div class="bank-risk-tag" style="font-size:var(--fs-sm);color:var(--text-light);text-align:center;margin-top:4px" aria-label="本局題目難度上限 ${bankRiskLabel(riskLvl)}">🎯 題目難度：${bankRiskLabel(riskLvl)}</div>`;

  return `
    <div class="container fade-in" style="max-width:560px">
      <div class="page-header">
        <button class="back-btn" data-action="confirmExitBank">←</button>
        <h2>🏦 好人好事銀行</h2>
        ${riskTag}
      </div>

      <div class="bank-ledger">
        <div class="bl-row">
          <span class="bl-label">題目</span>
          <span class="bl-val">${idx} / ${total}</span>
        </div>
        <div class="bl-row">
          <span class="bl-label">💰 結餘</span>
          <span class="bl-val ${balanceClass}">$${balance}</span>
        </div>
        <div class="bank-progress" title="目標 $${target}">
          <div class="bank-fill" style="width:${pct}%"></div>
          <span class="bank-target">目標 $${target}</span>
        </div>
      </div>

      <div class="scenario-desc fc-mt-16">
        <strong>${scenario.title}</strong>
        <div style="color:var(--text-light);font-size:var(--fs-base);margin-top:6px">📍 ${scenario.background || ''}</div>
        <div class="fc-mt-8">${scenario.description}</div>
      </div>

      <div class="scenario-image-wrap">
        <img src="assets/images/scenarios/${scenario.id}.png" alt="${scenario.title}" class="scenario-image"
             loading="eager" fetchpriority="high"
 />
      </div>

      <div class="options" style="margin-top:14px" role="radiogroup" aria-label="銀行題目選項">
        ${scenario.options.map((opt, i) => renderBankOptionCard({ scenarioId: scenario.id, opt, index: i })).join('')}
      </div>
    </div>
  `;
}

export function renderBankResult(scenario, result, run) {
  if (!result) {
    return renderEmptyState({ emoji: '⚠️', title: '結果載入失敗', actionLabel: '← 返 Game Hub', onAction: 'FC.exitBank()' });
  }
  const delta = result.moralChange || 0;
  const isPositive = delta > 0;
  const isNeutral = delta === 0;
  const balance = run.balance;
  const isWon = run.status === 'finished' && balance >= BANK_CONFIG.TARGET_BALANCE;
  const isBankrupt = run.status === 'bankrupt';
  const isFinished = run.status === 'finished';
  const target = BANK_CONFIG.TARGET_BALANCE;
  const announceText = isPositive ? `存款 ${delta} 元，目前結餘 ${balance} 元`
    : isNeutral ? '無變化'
    : `扣款 ${Math.abs(delta)} 元，目前結餘 ${balance} 元`;

  return `
    <div class="container fade-in" style="max-width:560px">
      ${renderPageHeader({ emoji: '🏦', title: '銀行結算' })}
      <h2 class="sr-only" aria-live="polite" aria-atomic="true">${announceText}</h2>

      <div class="bank-stamp ${isPositive ? 'green' : isNeutral ? 'gray' : 'red'}" id="bank-stamp" role="status" aria-label="${announceText}">
        <div class="stamp-emoji" aria-hidden="true">${isPositive ? '💰' : isNeutral ? '➖' : '💸'}</div>
        <div class="stamp-delta">${isPositive ? '+' : ''}${delta} 元</div>
        <div class="stamp-label">${isPositive ? '存款' : isNeutral ? '無變化' : '扣款'}</div>
      </div>

      ${result.outcomeImage ? `
        <div class="outcome-image-wrap" style="margin:14px auto;max-width:340px;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
          <img src="${result.outcomeImage}" alt="結果插圖" style="width:100%;display:block"
               loading="lazy" decoding="async"
 />
        </div>
      ` : ''}

      <div class="result-card ${isPositive ? 'good' : 'bad'}" id="result-card">
        <div class="result-emoji" aria-hidden="true">${isPositive ? '🌟' : '💪'}</div>
        <div class="comment">${result.mainComment || ''}</div>
      </div>

      <div class="bank-balance-big" style="text-align:center;margin:18px 0">
        <div style="font-size:var(--fs-base);color:var(--text-light)">目前結餘</div>
        <div class="${delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral'}" style="font-size:2.4em;font-weight:800" aria-label="目前結餘 ${balance} 元">$${balance}</div>
        <div class="fc-muted-sm">目標 $${target}</div>
      </div>

      ${isWon ? `
        <div class="bank-end-banner win" role="status">
          🎉 恭喜！你已經存到 $${balance}，係個「品格富翁」！
        </div>
      ` : isBankrupt ? `
        <div class="bank-end-banner lose" role="status">
          💔 結餘太低，破產喇。今次再嚟過！
        </div>
      ` : isFinished ? `
        <div class="bank-end-banner end" role="status">
          🏁 全部 ${BANK_CONFIG.QUESTIONS_PER_RUN} 題做完喇！結餘：$${balance}
        </div>
      ` : ''}

      <div class="action-row" style="margin-top:18px">
        <button type="button" class="btn btn-primary" data-action="bankNext">${isFinished || isBankrupt ? '✓ 結算' : '➡ 下一題'}</button>
        <button type="button" class="btn btn-outline" data-action="exitBank">← 返 Game Hub</button>
      </div>
    </div>
  `;
}

export function renderBankSummary(run) {
  if (!run) return renderEmptyState({ emoji: '🫥', title: '冇紀錄' });
  const isWon = run.status === 'finished' && run.balance >= BANK_CONFIG.TARGET_BALANCE;
  const isBankrupt = run.status === 'bankrupt';
  const totalGain = run.stamps.filter(s => s.delta > 0).reduce((a, b) => a + b.delta, 0);
  const totalLoss = run.stamps.filter(s => s.delta < 0).reduce((a, b) => a + b.delta, 0);
  const goodCount = run.stamps.filter(s => s.delta > 0).length;
  const badCount = run.stamps.filter(s => s.delta < 0).length;
  // S11: count caring / risk-2+ 喺 ledger 上面 surface，俾老師 / 學生知道呢局難度分佈
  const caringCount = run.questions.filter(s => s.domain === 'caring' || (s.riskLevel != null && s.riskLevel > 0)).length;
  const valueCount = run.questions.length - caringCount;
  const filterLine = `<div class="bank-summary-filter" style="font-size:var(--fs-base);color:var(--text-light);text-align:center;margin:8px 0 14px 0">
    🎯 難度設定：${bankRiskLabel(run.maxRisk)} · 本局 ${valueCount} 個 value + ${caringCount} 個 caring
  </div>`;

  return `
    <div class="container fade-in" style="max-width:560px">
      ${renderPageHeader({ emoji: '🏦', title: '結算單' })}
      ${filterLine}

      <div class="bank-end-banner ${isWon ? 'win' : isBankrupt ? 'lose' : 'end'}" style="font-size:var(--fs-lg)" role="status">
        ${isWon ? '🎉 品格富翁達陣！' : isBankrupt ? '💔 今次破產喇' : '🏁 旅程結束'}
      </div>

      <div class="progress-grid" style="margin:18px 0" role="list" aria-label="銀行結算統計">
        <div class="progress-cell" role="listitem">
          <div class="num" style="color:${run.balance >= 0 ? '#22c55e' : '#ef4444'}" aria-label="最終結餘 ${run.balance} 元">$${run.balance}</div>
          <div class="label">最終結餘</div>
        </div>
        <div class="progress-cell" role="listitem">
          <div class="num" aria-label="總存款 ${totalGain} 元">+${totalGain}</div>
          <div class="label">總存款</div>
        </div>
        <div class="progress-cell" role="listitem">
          <div class="num" aria-label="總扣款 ${totalLoss} 元">${totalLoss}</div>
          <div class="label">總扣款</div>
        </div>
        <div class="progress-cell" role="listitem">
          <div class="num" aria-label="好事 ${goodCount} 個，衰事 ${badCount} 個">${goodCount}✓ ${badCount}✗</div>
          <div class="label">好事 / 衰事</div>
        </div>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:10px">📒 存摺紀錄</div>
        ${run.stamps.length === 0 ? '<div style="color:var(--text-light);font-size:var(--fs-base);text-align:center;padding:12px">冇交易紀錄</div>' : `
          <div class="ledger-scroll" role="list" aria-label="存摺交易紀錄">
            ${run.stamps.map((s, i) => `
              <div class="ledger-row" role="listitem">
                <span class="ledger-num" aria-hidden="true">#${i+1}</span>
                <span class="ledger-label">${s.label || '—'}</span>
                <span class="ledger-delta ${s.delta > 0 ? 'positive' : s.delta < 0 ? 'negative' : 'neutral'}" aria-label="${s.delta > 0 ? '存款' : s.delta < 0 ? '扣款' : '無變化'} ${Math.abs(s.delta)} 元">${s.delta > 0 ? '+' : ''}${s.delta} 元</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div class="action-row">
        <button type="button" class="btn btn-primary" data-action="playGoodDeedBank">🔄 再玩一次</button>
        <button type="button" class="btn btn-outline" data-action="exitBank">← 返 Game Hub</button>
      </div>
      ${renderFooter()}
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

export function renderModeSelect(currentMode, subjectId) {
  const savedMode = currentMode || localStorage.getItem('fc_game_mode') || 'relaxed';

  return `
    <div class="mode-screen fade-in">
      ${renderPageHeader({ emoji: '🎮', title: '選擇遊戲模式', back: 'role-select', backLabel: '返回主選單' })}

      <div class="mode-header">
        <p>你鍾意點玩？揀一個模式開始！</p>
      </div>

      <div class="mode-grid" role="radiogroup" aria-label="遊戲模式">
        ${GAME_MODES.map(m => `
          <button type="button" class="mode-card ${m.id} ${savedMode === m.id ? 'selected' : ''}"
               style="background:${m.bg};border-color:${m.color}"
               data-action="selectMode" data-arg="${escapeAttr(m.id)}"
               role="radio" aria-checked="${savedMode === m.id}"
               aria-label="${m.title}：${m.desc}${savedMode === m.id ? '（已選）' : ''}">
            <div class="mc-icon" aria-hidden="true">${m.icon}</div>
            <div class="mc-title">${m.title}</div>
            <div class="mc-desc">${m.desc}</div>
          </button>
        `).join('')}
      </div>

      <div class="fc-center-20 fc-mb-20">
        <p class="fc-muted-sm">
          💡 模式可以在設定頁隨時更改
        </p>
      </div>

      ${subjectId ? `
        <div class="fc-center">
          <button type="button" class="btn btn-primary" style="min-width:220px;font-size:var(--fs-lg)"
            data-action="navigate" data-arg="home">
            ✅ 確定，開始學習 →
          </button>
        </div>
      ` : `
        <div class="fc-center">
          <button type="button" class="btn btn-primary" style="min-width:220px;font-size:var(--fs-lg)"
            data-action="navigate" data-arg="subject-select">
            📚 選擇課題 →
          </button>
        </div>
      `}

      <div class="fc-center-top">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="role-select">← 返回</button>
      </div>

      ${renderFooter()}
    </div>
  `;
}

// ── Teacher Assignment Config ──────────────────────────────────────────────
export function renderTeacherAssign() {
  const topics = TOPICS.map(t => ({
    ...t,
    sub: t.description?.split(/[，。,。]/)[0] || '',
  }));

  // Sprint 14.4: read teacher config via the canonical cached reader in
  // storage.js — single source of truth (cache + bus event + defaults).
  // Previously this was a raw `JSON.parse(localStorage.getItem(...))`
  // duplicate of the same logic that lived in domain/IO.js.
  const config = getTeacherConfig();

  return `
    <div class="container fade-in">
      ${renderPageHeader({ emoji: '⚙️', title: '功能設定', back: 'teacher', backLabel: '返回老師主控台' })}

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:700;font-size:var(--fs-md);margin-bottom:14px">🔘 功能開關</div>

        <div class="feature-toggle">
          <div>
            <div class="ft-label">💡 提示功能</div>
            <div class="ft-desc">學生可以睇提示</div>
          </div>
          <button type="button" class="toggle-switch ${config.hintEnabled ? 'on' : ''}"
            data-action="toggleTeacherFeature" data-arg2="hintEnabled"
            role="switch" aria-checked="${config.hintEnabled}" aria-label="提示功能開關"></button>
        </div>

        <div class="feature-toggle">
          <div>
            <div class="ft-label">⏱️ 計時功能</div>
            <div class="ft-desc">開啟後每題限時答題</div>
          </div>
          <button type="button" class="toggle-switch ${config.timerEnabled ? 'on' : ''}"
            data-action="toggleTeacherFeature" data-arg2="timerEnabled"
            role="switch" aria-checked="${config.timerEnabled}" aria-label="計時功能開關"></button>
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
          <div style="display:flex;justify-content:space-between;font-size:var(--fs-sm);color:var(--text-light)">
            <span>10秒</span><span>30秒</span><span>60秒</span>
          </div>
        </div>
        ` : ''}

        <div class="feature-toggle">
          <div>
            <div class="ft-label">🔥 Combo 系統</div>
            <div class="ft-desc">開啟連續答啱加分</div>
          </div>
          <button type="button" class="toggle-switch ${config.comboEnabled ? 'on' : ''}"
            data-action="toggleTeacherFeature" data-arg2="comboEnabled"
            role="switch" aria-checked="${config.comboEnabled}" aria-label="Combo 系統開關"></button>
        </div>

        <div class="feature-toggle">
          <div>
            <div class="ft-label">🏦 銀行題目難度</div>
            <div class="ft-desc">限制好人好事銀行抽題嘅 risk level 上限</div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap" role="radiogroup" aria-label="銀行題目難度">
            ${[
              { v: 0, label: '只 value' },
              { v: 1, label: '≤1（低）' },
              { v: 2, label: '≤2（中）' },
              { v: 3, label: '全開' },
            ].map(opt => `
              <button type="button"
                class="btn ${config.bankMaxRiskLevel===opt.v ? 'btn-primary' : 'btn-outline'}"
                style="padding:6px 10px;font-size:var(--fs-sm);min-height:36px"
                data-action="setBankMaxRisk" data-arg="${opt.v}"
                role="radio" aria-checked="${config.bankMaxRiskLevel===opt.v}">${opt.label}</button>
            `).join('')}
          </div>
        </div>

        <div class="feature-toggle">
          <div>
            <div class="ft-label">👆 按鈕大小</div>
            <div class="ft-desc">控制答題按鈕尺寸</div>
          </div>
          <div style="display:flex;gap:6px" role="radiogroup" aria-label="按鈕大小">
            <button type="button" class="btn ${config.buttonSize==='large'?'btn-primary':'btn-outline'}"
              style="padding:6px 12px;font-size:var(--fs-base);min-height:36px"
              data-action="setButtonSize" data-arg="large"
              role="radio" aria-checked="${config.buttonSize==='large'}">大</button>
            <button type="button" class="btn ${config.buttonSize==='normal'?'btn-primary':'btn-outline'}"
              style="padding:6px 12px;font-size:var(--fs-base);min-height:36px"
              data-action="setButtonSize" data-arg="normal"
              role="radio" aria-checked="${config.buttonSize==='normal'}">中</button>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:700;font-size:var(--fs-md);margin-bottom:12px">📋 課題範圍</div>
        <p style="font-size:var(--fs-base);color:var(--text-light);margin-bottom:12px">
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
            <span style="margin-left:auto;font-size:var(--fs-sm);color:var(--text-light)">${t.sub}</span>
          </label>
        `).join('')}
      </div>

      <div class="card">
        <div style="font-weight:700;font-size:var(--fs-md);margin-bottom:10px">🔐 PIN 安全</div>
        <p style="font-size:var(--fs-base);color:var(--text-light);margin-bottom:12px">
          老師模式 PIN（預設：admin）
        </p>
        <label for="teacher-pin-input" style="position:absolute;left:-9999px">老師模式 PIN</label>
        <input type="password" id="teacher-pin-input" value="admin" maxlength="6" autocomplete="current-password"
          placeholder="輸入新 PIN"
          style="width:100%;padding:14px;border:2px solid var(--border);border-radius:12px;font-size:var(--fs-md);box-sizing:border-box;margin-bottom:10px" />
        <button type="button" class="btn btn-outline" style="width:100%;font-size:var(--fs-md)"
          data-action="saveTeacherPIN">💾 儲存 PIN</button>
      </div>

      <div class="fc-mt-16">
        <button type="button" class="btn btn-primary fc-w-100"
          data-action="saveTeacherConfig">✅ 儲存所有設定</button>
      </div>

      ${renderFooter({ marginTop: '24px' })}
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
        <span id="sync-badge" title="已連線" style="font-size:var(--fs-md);opacity:0.85">☁️</span>
      </div>
    </div>
  `;
}

// Phase 2 (S8): pure helper that renders one topic card given the topic +
// the pre-fetched progress entry. No localStorage reads inside the loop.
function _renderTopicCard(t, tp) {
  const total = tp.total || 0;
  const done = tp.completed || 0;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const sub = t.description?.split(/[，。,。]/)[0] || t.description || '';
  let statusBadge = '';
  let statusClass = '';
  let statusText = '';
  if (total === 0) {
    statusClass = 'topic-status--new';
    statusBadge = '<div class="topic-status" aria-hidden="true">未開始</div>';
    statusText = '未開始';
  } else if (pct >= 100) {
    statusClass = 'topic-status--done';
    statusBadge = '<div class="topic-status" aria-hidden="true">🏆 已精通</div>';
    statusText = '已精通';
  } else {
    statusClass = 'topic-status--progress';
    statusBadge = `<div class="topic-status" aria-hidden="true">${done}/${total} · ${pct}%</div>`;
    statusText = `完成 ${done} 題，共 ${total} 題，${pct}%`;
  }
  return `
              <button type="button" class="topic-card ${statusClass}" style="background:${t.color}" data-action="goTopic" data-arg="${escapeAttr(t.id)}"
      aria-label="${t.title}，${sub}，${statusText}">
      <span class="emoji" aria-hidden="true">${t.emoji}</span>
      <div class="title">${t.title}</div>
      <div class="sub">${sub}</div>
      ${total > 0 ? `
        <div class="progress-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${t.title} 進度">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
      ` : ''}
      ${statusBadge}
    </button>
  `;
}

export function renderHome(subjectId) {
  // Phase 2 (S8): hoist the progress read so we hit localStorage ONCE per
  // render, not 17 times. Saves ~14 reads + 14 JSON.parse per home nav.
  const studentName = getStudent() || '同學';
  const progress = getStudent() ? getProgress(getStudent()) : null;
  const streak = progress?.streak?.current || 0;
  const longest = progress?.streak?.longest || 0;
  const topicProgress = progress?.topicProgress || {};
  const dailyCreed = getDailyCreed();
  const flameEmoji = streak >= 7 ? '🔥' : streak >= 3 ? '✨' : streak >= 1 ? '🌱' : '💤';
  const flameClass = streak >= 7 ? 'flame--hot' : streak >= 1 ? 'flame--warm' : 'flame--cold';

  // Phase 6: subject-domain filter — split the 17 topics into
  // 🪷 價值觀 (12) / 🌈 友愛校園 (5) / 全部 (17) tabs to declutter the home
  // grid. Default tracks the student's subject choice (selectsubject already
  // narrows by domain); 全部 is an explicit escape hatch.
  const allowedFilters = ['value', 'caring', 'all'];
  const stored = (typeof localStorage !== 'undefined'
    && localStorage.getItem('fc_home_filter')) || '';
  let filter = allowedFilters.includes(stored) ? stored : '';
  if (!filter) {
    // No saved preference — derive from current subjectId.
    // subjectId semantics in this app: 'value' (EDB 12 values) / 'caring'
    // (友愛校園 5) / anything else (uncategorized) → 'all'.
    if (subjectId === 'value') filter = 'value';
    else if (subjectId === 'caring') filter = 'caring';
    else filter = 'all';
  }
  const visibleTopics = filter === 'all'
    ? TOPICS
    : TOPICS.filter(t => t.domain === filter);
  const filterTab = (key, label, count) => {
    const isActive = filter === key;
    return `<button type="button" class="home-filter-tab ${isActive ? 'active' : ''}"
        data-action="setHomeFilter" data-arg="${key}"
        aria-pressed="${isActive}" aria-label="顯示${label}，共 ${count} 個">${label} <span class="home-filter-count">${count}</span></button>`;
  };
  const valuesCount = TOPICS.filter(t => t.domain === 'value').length;
  const caringCount = TOPICS.filter(t => t.domain === 'caring').length;
  const sectionTitle = filter === 'all'
    ? '🪷🌈 全部 17 個品格課題'
    : (filter === 'value'
        ? '🪷 12 個 EDB 官方價值觀'
        : '🌈 5 個友愛校園範疇（SEL / 安全）');

  return `
    <div class="container fade-in">
      ${renderPageHeader({
        emoji: '🌟', title: '友愛教室', back: 'hub', backLabel: '返回 Game Hub',
        rightButton: `<button type="button" class="back-btn" data-action="switchStudent" title="切換學生" aria-label="切換學生">🔄</button>`
      })}

      ${getStudent() ? renderMoralBar(getStudent()) : ''}

      <div class="home-hero">
        <div class="hero-greeting">
          <div class="hero-emoji" aria-hidden="true">👋</div>
          <div class="hero-text">
            <div class="hero-line">你好，<span class="hero-name">${studentName}</span>！</div>
            <div class="hero-sub">揀個品格課題開始 🎯</div>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat streak-stat ${flameClass}" title="${longest > 0 ? `最長紀錄 ${longest} 日` : '今日開始你嘅 streak！'}" role="status" aria-label="連續學習 ${streak} 日${longest > 0 ? `，最長紀錄 ${longest} 日` : ''}">
            <span class="flame" aria-hidden="true">${flameEmoji}</span>
            <span class="stat-num">${streak}</span>
            <span class="stat-label">日 streak</span>
          </div>
        </div>
      </div>

      <div class="daily-creed" role="region" aria-label="今日信條">
        <span class="creed-badge">🌟 今日信條</span>
        <div class="creed-body">
          <div class="creed-title">${dailyCreed.title}</div>
          <div class="creed-text">${dailyCreed.text}</div>
        </div>
      </div>

      <div class="home-filter-row" role="tablist" aria-label="課題分類過濾">
        ${filterTab('value', '🪷 價值觀', valuesCount)}
        ${filterTab('caring', '🌈 友愛校園', caringCount)}
        ${filterTab('all', '📚 全部', TOPICS.length)}
      </div>

      <div class="topic-section">
        <h2 class="section-title">${sectionTitle}</h2>
        <div class="topic-grid" role="list" aria-label="${sectionTitle}">
          ${visibleTopics.map(t => _renderTopicCard(t, topicProgress[t.id] || {})).join('')}
        </div>
      </div>

      <div class="home-footer-grid">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="progress">📊 我的進度</button>
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="settings">⚙️ 設定</button>
        <button type="button" class="btn btn-outline" data-action="switchStudent">🔄 切換學生</button>
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="hub">🎮 返回 Game Hub</button>
      </div>
      ${renderFooter()}
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
      ${renderPageHeader({ title: `${topic.emoji} ${topic.title}`, back: 'home', backLabel: '返回主頁', backArg: undefined,
        rightButton: subjectId ? `<span class="topic-badge" style="background:${subColor}">${getSubjectEmoji(subjectId)} ${getSubjectName(subjectId)}</span>` : ''
      })}
      <p style="color:var(--text-light);margin-bottom:16px">${topic.description}</p>

      <ul class="scenario-list" role="list" aria-label="${topic.title} 嘅 ${topicScenarios.length} 個情境">
        ${topicScenarios.map(s => {
          const done = getStudent() && isCompleted(getStudent(), s.id);
          return `
            <li role="listitem">
              <button type="button" class="scenario-item ${done ? 'completed' : ''}" data-action="play" data-arg="${escapeAttr(s.id)}"
                aria-label="${s.title}，${s.background || ''}${done ? '，已完成' : ''}">
                <span class="check" aria-hidden="true">${done ? '✓' : ''}</span>
                <span class="info">
                  <span class="title">${s.title}</span>
                  <span class="sub">${s.background || ''}</span>
                </span>
                <span aria-hidden="true" style="font-size:1.2em">→</span>
              </button>
            </li>
          `;
        }).join('')}
      </ul>
      ${renderFooter()}
    </div>
  `;
}

export function renderPlay(scenarioId, subjectId) {
  const s = playScenario(scenarioId);
  if (!s) return renderEmptyState({ emoji: '🫥', title: '場景不存在', actionLabel: '← 返首頁', onAction: 'FC.goHome()' });
  const topic = getTopic(s.topicId);
  const subColor = getSubjectColor(subjectId);

  // 題目進度：topic 內第幾題 / 共幾題
  const topicScenarios = getScenariosByTopic(s.topicId);
  const idxInTopic = topicScenarios.findIndex(x => x.id === s.id) + 1;
  const totalInTopic = topicScenarios.length;

  return `
    <div class="container fade-in">
      ${renderPageHeader({
        titleHTML: `<h1 style="flex:1;text-align:center">${escapeAttr(topic?.emoji || '')} ${escapeAttr(topic?.title || '')}</h1>`,
        back: 'topic', backLabel: `返回 ${topic?.title || '主題'}`, backArg: s.topicId,
        rightButton: `<span class="play-progress" aria-label="第 ${idxInTopic} 題，共 ${totalInTopic} 題">第 ${idxInTopic} / ${totalInTopic} 題</span>`
      })}

      <div class="play-top">
        <div class="scenario-title">${s.title}</div>
        <div class="scenario-bg">📍 ${s.background || ''}</div>
      </div>

      <div class="scenario-desc">
        <button type="button" class="inline-voice-btn" data-action="speak" data-arg="${escapeAttr(s.id)}" title="朗讀題目" aria-label="朗讀題目">🔊</button>
        ${s.description}
      </div>

      ${(s.hints && s.hints.length) ? `
      <div class="hints-panel" id="hints-panel">
        <button type="button" class="hints-toggle" data-action="toggleHints" aria-expanded="false" aria-controls="hints-list" id="hints-toggle">
          <span class="hints-icon" aria-hidden="true">💡</span>
          <span>提示</span>
          <span class="hints-count" aria-label="${s.hints.length} 個提示">${s.hints.length}</span>
          <span class="hints-chev" id="hints-chev" aria-hidden="true">▾</span>
        </button>
        <div class="hints-list" id="hints-list" hidden>
          ${s.hints.map((h, i) => `
            <div class="hint-item" data-hint-idx="${i}" hidden>
              <span class="hint-num" aria-hidden="true">${i + 1}</span>
              <span class="hint-text">${h}</span>
            </div>
          `).join('')}
          <button type="button" class="hint-next" id="hint-next" data-action="revealNextHint">
            睇下一個提示 →
          </button>
        </div>
      </div>` : ''}

      <div class="scenario-image-wrap">
        <img src="assets/images/scenarios/${s.id}.png" alt="${s.title}" class="scenario-image"
             loading="eager" fetchpriority="high"
 />
      </div>

      <div class="options-divider" aria-hidden="true">— 揀你嘅選擇 —</div>

      <div class="options" role="radiogroup" aria-label="${s.title} 嘅選擇題">
        ${s.options.map((opt, i) => renderOptionCard({ scenarioId: s.id, opt, index: i, isBank: false, showMoral: true })).join('')}
      </div>

      <button type="button" class="voice-fab" data-action="speak" data-arg="${escapeAttr(s.id)}" title="朗讀題目" aria-label="朗讀題目">🔊</button>
      ${renderFooter()}
    </div>
  `;
}

export function renderResult(data, subjectId) {
  if (!data) {
    return renderEmptyState({ emoji: '⚠️', title: '結果載入失敗，請重試。', actionLabel: '← 返首頁', onAction: 'FC.goHome()' });
  }
  const { option, moralChange, mainComment, creeds, creedText, scenarioImage, scenarioTitle } = data;
  const isGood = moralChange >= 0;
  const subColor = getSubjectColor(subjectId);
  const scoreText = `${isGood ? '加咗 ' : '減咗 '}${Math.abs(moralChange)} 道德分${isGood ? '，做得好好！' : '，下次再努力。'}`;

  // Sprint 16 (SPEC §17.3.3): 答錯反思 panel conditional render
  const showStopAndThink = shouldRenderStopAndThink(option, moralChange);
  const stopAndThinkText = showStopAndThink ? formatStopAndThink(option.stopAndThink) : '';
  const stopAndThinkAria = showStopAndThink ? getStopAndThinkAriaLabel(option.stopAndThink) : '';

  // Escape all user-data fields (R10 + §17.11 anti-pattern: never innerHTML on user-written text)
  const escapedOptionText = escapeAttr(option?.text || '');
  const escapedMainComment = escapeAttr(mainComment || '');
  const escapedScoreText = escapeAttr(scoreText);

  return `
    <div class="container fade-in" id="result-root">
      <h1 class="sr-only" aria-live="polite" aria-atomic="true">${scenarioTitle}嘅結果：${scoreText}</h1>
      ${subjectId ? `<div style="text-align:center;margin-bottom:8px">
        <span class="topic-badge" style="background:${subColor}">${getSubjectEmoji(subjectId)} ${getSubjectName(subjectId)}</span>
      </div>` : ''}
      ${scenarioImage ? `
      <div class="scenario-image-wrap" style="max-height:180px;margin-bottom:16px;border-radius:16px;overflow:hidden">
        <img src="${scenarioImage}" alt="${scenarioTitle}" style="width:100%;max-height:180px;object-fit:cover"
             loading="lazy" decoding="async" />
      </div>` : ''}

      ${showStopAndThink ? `
      <!-- Stop-and-Think panel (SPEC §17.3.4) — 答錯反思, 🤔 取代舊 💪 -->
      <div class="result-card bad stop-and-think" id="result-card" role="status" aria-label="${escapeAttr(stopAndThinkAria)}">
        <div class="result-emoji" aria-hidden="true">${STOP_AND_THINK_EMOJI}</div>
        <div class="stop-and-think-title">${STOP_AND_THINK_TITLE}</div>
        <div class="comment">
          ${stopAndThinkText.split('\n').filter(Boolean).map((line, i) => {
            // 跳過第一行(emoji + title 已經 render)
            if (i === 0) return '';
            return `<p>${escapeAttr(line)}</p>`;
          }).join('')}
        </div>
        <div class="voice-btn-row">
          <button type="button" class="inline-voice-btn" data-action="speakOptionText" title="朗讀你嘅答案" aria-label="朗讀你選擇的答案">🔊 答案</button>
          <button type="button" class="inline-voice-btn" data-action="speakStopAndThink" title="朗讀反思" aria-label="朗讀停一停想一想反思">🔊 反思</button>
        </div>
      </div>
      <!-- moral score 答錯唔即時顯示, 撳「再做一次」後先 render (SPEC §17.3.4) -->
      ` : `
      <!-- Positive feedback (existing result-card good) -->
      <div class="result-card good" id="result-card" role="status" aria-label="${escapedScoreText}">
        <div class="result-emoji" aria-hidden="true">🌟</div>
        <div class="comment">${escapedMainComment || '你做出了選擇！'}</div>
        <div class="moral-score" aria-label="${escapedScoreText}">${isGood ? '＋' : ''}${moralChange} 道德分</div>
        <div class="voice-btn-row">
          <button type="button" class="inline-voice-btn" data-action="speakOptionText" title="朗讀你嘅答案" aria-label="朗讀你選擇的答案">🔊 答案</button>
          <button type="button" class="inline-voice-btn" data-action="speakConsequence" title="朗讀後果" aria-label="朗讀結果分析">🔊 後果</button>
        </div>
      </div>
      `}

      <div class="creed-show" role="region" aria-label="學校信條">
        <div class="creed-header">
          <div class="label">🌟 學校信條</div>
          <button type="button" class="inline-voice-btn" data-action="speakCreeds" title="朗讀信條" aria-label="朗讀信條">🔊</button>
        </div>
        <div class="items">
          ${(creedText || []).map(c => `<div class="item">${c}</div>`).join('')}
        </div>
      </div>

      ${data.outcomeImage ? `
      <div class="outcome-image-wrap" style="margin-top:16px;border-radius:16px;overflow:hidden">
        <img src="${data.outcomeImage}" alt="結果圖" style="width:100%;border-radius:16px"
             loading="lazy" decoding="async"
 />
      </div>` : ''}

      <div class="action-row" id="result-actions">
        <button type="button" class="btn btn-primary" data-action="retry">🔄 再做一次</button>
        ${(function() {
          const next = suggestNext(getCurrentScenario()?.topicId);
          return next ? `<button type="button" class="btn btn-primary" data-action="play" data-arg="${escapeAttr(next.id)}">下一題 →</button>` : '';
        })()}
        <button type="button" class="btn btn-outline" data-action="goTopic" data-arg="${escapeAttr(getCurrentScenario()?.topicId || '')}">← 返回主題</button>
      </div>

      <div class="action-cta-fab" id="result-cta-fab" hidden>
        <button type="button" class="btn btn-primary" data-action="retry">🔄 再做一次</button>
        ${(function() {
          const next = suggestNext(getCurrentScenario()?.topicId);
          return next ? `<button type="button" class="btn btn-primary" data-action="play" data-arg="${escapeAttr(next.id)}">下一題 →</button>` : '';
        })()}
        <button type="button" class="btn btn-outline" data-action="goTopic" data-arg="${escapeAttr(getCurrentScenario()?.topicId || '')}">← 返回主題</button>
      </div>

      <button type="button" class="voice-fab" data-action="speakCreeds" title="朗讀信條" aria-label="朗讀信條">🔊</button>
      ${renderFooter()}
    </div>
  `;
}

export function renderProgress(subjectId) {
  // Phase 3 (S19): use the canonical summary instead of hand-rolled reads.
  const summary = getStudentSummary(getStudent());
  const total = summary.score;
  const completed = summary.completedCount;
  const subColor = getSubjectColor(subjectId);
  // Sprint 14.4: derive `subjects` from the single source in subjects.js
  // (was a hardcoded `[value]` copy). Combines emoji + title so the
  // existing template can render `'🎯 價值觀教育'` without changing call
  // sites.
  const subjects = getAllSubjects().map((s) => ({ ...s, title: `${s.emoji} ${s.title}` }));

  return `
    <div class="container fade-in">
${renderPageHeader({
        emoji: '📊', title: '我的進度', back: 'home', backLabel: '返回主頁',
        rightButton: subjectId ? `<span class="topic-badge" style="background:${subColor}">${getSubjectEmoji(subjectId)} ${getSubjectName(subjectId)}</span>` : ''
      })}

      <div class="progress-grid" role="list" aria-label="學習統計">
        <div class="progress-cell big" role="listitem">
          <div class="num" aria-label="總道德分 ${total}">${total}</div>
          <div class="label">🎯 總道德分</div>
        </div>
        <div class="progress-cell" role="listitem">
          <div class="num" aria-label="已完成 ${completed} 個場景">${completed}</div>
          <div class="label">📝 已完成場景</div>
        </div>
        <div class="progress-cell" role="listitem">
          <div class="num" aria-label="最近遊玩 ${p.lastPlayed || '從未'}">${p.lastPlayed ? new Date(p.lastPlayed).toLocaleDateString('zh-HK', { month: 'short', day: 'numeric' }) : '—'}</div>
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

      ${TOPICS.map(tid => {
        const tp = p.topicProgress[tid.id] || {};
        const pct = tp.total ? Math.round((tp.completed / tp.total) * 100) : 0;
        return `
          <div class="card" style="margin-bottom:10px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span style="font-size:1.2em">${tid.emoji}</span>
              <strong>${tid.title}</strong>
              <span style="margin-left:auto;color:var(--text-light)">${tp.completed || 0}/${tp.total || 0}</span>
            </div>
            <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${tid.color};border-radius:4px;transition:width 0.4s"></div>
            </div>
          </div>
        `;
      }).join('')}

      <div class="action-row">
        <button type="button" class="btn btn-outline" data-action="exportMyData">📤 匯出進度</button>
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="home">← 返回首頁</button>
      </div>
      ${renderFooter()}
    </div>
  `;
}

export function renderSettings() {
  const speed = localStorage.getItem('fc_tts_speed') || '0.85';
  const fontSize = localStorage.getItem('fc_font_size') || '18';
  const lineHeight = localStorage.getItem('fc_line_height') || '1.5';
  const spacing = localStorage.getItem('fc_spacing') || 'medium';
  const currentLang = localStorage.getItem('fc_tts_lang') || 'auto';
  const hcMode = localStorage.getItem('fc_hc_mode') === '1';
  const rmMode = localStorage.getItem('fc_rm_mode') === '1';
  // 系統 prefers-reduced-motion 偵測（only 當用戶未手動揀過）
  let osRMPref = false;
  try { osRMPref = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false; } catch {}

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
${renderPageHeader({ emoji: '⚙️', title: '個人化設定', back: 'role-select', backLabel: '返回主選單' })}

      <div class="card" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <div style="font-weight:600;margin-bottom:4px">📖 教學</div>
          <div style="font-size:var(--fs-base);color:var(--text-light)">想再睇一次首次使用教學？</div>
        </div>
        <button type="button" class="btn btn-outline" data-action="replayOnboarding"
          style="font-size:var(--fs-base);padding:10px 16px;min-height:44px">
          重看教學
        </button>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:8px">📊 學習記錄</div>
        <div style="font-size:var(--fs-base);color:var(--text-light);margin-bottom:10px">
          揀過嘅每個選項都會記低喺本地，包括 category 同答得啱唔啱。
          匯出 CSV 畀老師，就可以分析邊個 category 答錯率最高。
        </div>
        <div id="analytics-summary" style="font-size:var(--fs-base);color:var(--text-light);margin-bottom:10px;padding:8px 10px;background:var(--bg-soft, #f7f7fa);border-radius:8px" aria-live="polite" aria-atomic="true">
          載入中…
        </div>
        <div class="action-row">
          <button type="button" class="btn btn-primary" data-action="exportAnalyticsCSV" style="flex:1">📤 匯出學習記錄 (CSV)</button>
          <button type="button" class="btn btn-outline" data-action="clearAnalytics" style="font-size:var(--fs-base)">🗑️ 清除</button>
        </div>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:14px">🔊 語音朗讀</div>
        <div class="setting-row" style="margin-bottom:12px">
          <div>
            <strong id="voice-toggle-label">開 / 關</strong>
            <div class="fc-muted-sm">自動朗讀題目和信條</div>
          </div>
          <button type="button" class="toggle ${enabled ? 'on' : ''}" data-key="voice" data-action="toggleVoice"
            role="switch" aria-checked="${enabled}" aria-labelledby="voice-toggle-label"
            aria-label="語音朗讀開關"></button>
        </div>
        <div style="margin-bottom:12px">
          <div style="margin-bottom:6px">
            <strong>發音語言</strong>
            <div style="font-size:var(--fs-sm);color:var(--text-light);margin-top:2px">揀錯會 load 國語而唔係粵語</div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px" role="radiogroup" aria-label="發音語言">
            ${(window.FC?.TTS_LANGS || []).map(l => `
              <button type="button" class="btn"
                data-active="${currentLang === l.id}"
                style="flex:1;min-width:0;font-size:var(--fs-base);padding:8px 6px;${currentLang === l.id ? 'background:var(--primary);color:#fff;border:3px solid var(--primary);' : 'background:transparent;border:3px solid var(--primary);color:var(--primary);'}"
                data-action="setTTSLang" data-arg="${escapeAttr(l.id)}"
                title="${l.hint}"
                role="radio" aria-checked="${currentLang === l.id}">${l.label}</button>
            `).join('')}
          </div>
          <div id="tts-voice-warning" style="display:none;margin-top:8px;padding:8px 10px;background:#FFF8E1;border-left:3px solid #F59E0B;border-radius:4px;font-size:var(--fs-base);color:#92400E" role="status" aria-live="polite">
            ⚠️ 你個 browser / OS 冇裝粵語 voice, TTS 會用 國語 (zh-TW / zh-CN) fallback 朗讀。
            想聽真粵語：<strong>macOS</strong> → 系統偏好設定 → 輔助使用 → 朗讀內容 → 系統聲音 → 揀「Sin-ji (粵語香港)」；
            <strong>Windows</strong> → 設定 → 時間與語言 → 語言 → 語音 → 加粵語香港 voice pack。
          </div>
        </div>
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <label for="speed-range"><strong>朗讀速度</strong></label>
            <span class="val-label" style="color:var(--primary);font-weight:600" data-for="speed">${parseFloat(speed).toFixed(2)}x</span>
          </div>
          <input id="speed-range" type="range" min="0.5" max="1.5" step="0.05" value="${speed}"
            oninput="FC.setSpeed(this.value)"
            aria-label="朗讀速度，目前 ${parseFloat(speed).toFixed(2)}x"
            style="width:100%;accent-color:var(--primary)" />
          <div style="display:flex;justify-content:space-between;font-size:var(--fs-sm);color:var(--text-light)" aria-hidden="true">
            <span>慢</span><span>正常</span><span>快</span>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:14px">🌓 顯示模式</div>
        <div class="setting-row">
          <div>
            <strong id="hc-toggle-label">高對比模式</strong>
            <div class="fc-muted-sm">純黑/白、3px 強制 border、無漸變，適合光線不足或在戶外使用</div>
          </div>
          <button type="button" class="toggle ${hcMode ? 'on' : ''}" data-key="hc" data-action="toggleHC"
            role="switch" aria-checked="${hcMode}" aria-labelledby="hc-toggle-label"
            aria-label="高對比模式開關"></button>
        </div>
        <div class="setting-row fc-mt-12">
          <div>
            <strong id="rm-toggle-label">減少動畫</strong>
            <div class="fc-muted-sm">停掉過場動畫同慶祝效果${osRMPref && !rmMode ? '（系統已偵測到偏好）' : ''}</div>
          </div>
          <button type="button" class="toggle ${rmMode ? 'on' : ''}" data-key="rm" data-action="toggleReducedMotion"
            role="switch" aria-checked="${rmMode}" aria-labelledby="rm-toggle-label"
            aria-label="減少動畫開關"></button>
        </div>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:14px">📝 文字顯示</div>
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <label for="fs-range"><strong>字體大小</strong></label>
            <span class="val-label" style="color:var(--primary);font-weight:600" data-for="fs">${fsLabel}</span>
          </div>
          <input id="fs-range" type="range" min="16" max="32" step="2" value="${fontSize}"
            oninput="FC.setFontSize(this.value)"
            aria-label="字體大小，目前 ${fontSize} 像素（${fsLabel}）"
            style="width:100%;accent-color:var(--primary)" />
          <div style="display:flex;justify-content:space-between;font-size:var(--fs-sm);color:var(--text-light)" aria-hidden="true">
            <span>Aa</span><span style="font-size:1.2em">Aa</span><span style="font-size:1.5em">Aa</span>
          </div>
        </div>
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <label for="lh-range"><strong>行距</strong></label>
            <span class="val-label" style="color:var(--primary);font-weight:600" data-for="lh">${lineHeight}</span>
          </div>
          <input id="lh-range" type="range" min="1.2" max="2.2" step="0.1" value="${lineHeight}"
            oninput="FC.setLineHeight(this.value)"
            aria-label="行距，目前 ${lineHeight}"
            style="width:100%;accent-color:var(--primary)" />
        </div>
        <div>
          <div style="margin-bottom:6px"><strong>間格</strong></div>
          <div style="display:flex;gap:8px" role="radiogroup" aria-label="間距">
            <button type="button" class="btn ${spacing==='narrow'?'btn-primary':'btn-outline'}" data-action="setSpacing" data-arg="narrow" id="sp-narrow" role="radio" aria-checked="${spacing==='narrow'}" style="flex:1;padding:8px;font-size:var(--fs-base)">窄</button>
            <button type="button" class="btn ${spacing==='medium'?'btn-primary':'btn-outline'}" data-action="setSpacing" data-arg="medium" id="sp-medium" role="radio" aria-checked="${spacing==='medium'}" style="flex:1;padding:8px;font-size:var(--fs-base)">中</button>
            <button type="button" class="btn ${spacing==='wide'?'btn-primary':'btn-outline'}" data-action="setSpacing" data-arg="wide" id="sp-wide" role="radio" aria-checked="${spacing==='wide'}" style="flex:1;padding:8px;font-size:var(--fs-base)">闊</button>
          </div>
        </div>
        <div style="margin-top:12px;text-align:center">
          <button type="button" class="btn btn-outline" data-action="resetSettings" style="color:var(--text-light);font-size:var(--fs-base)">🔄 重置所有設定</button>
        </div>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">☁️ 雲端同步</div>
        <div style="font-size:var(--fs-base);color:var(--text-light);margin-bottom:10px">
          連線狀態：<span id="settings-sync-status">${syncStatus.isOnline ? '在線' : '📴 離線'}</span>
          &nbsp;·&nbsp;上次同步：<span id="settings-last-sync">${lastSync}</span>
        </div>
        <div class="action-row">
          <button type="button" class="btn btn-outline" data-action="forceSync">🔄 立即同步</button>
          <button type="button" class="btn btn-outline" data-action="exportMyData">📤 匯出</button>
          <button type="button" class="btn btn-outline" data-action="importMyData">📥 匯入</button>
        </div>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">👥 資料管理</div>
        <div class="action-row">
          <button type="button" class="btn btn-outline" data-action="exportMyData">📤 匯出我的進度</button>
          <button type="button" class="btn btn-outline" data-action="importMyData">📥 匯入進度</button>
        </div>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">🔐 老師模式</div>
        <button type="button" class="btn btn-primary" data-action="goTeacher">進入老師模式</button>
      </div>

      <div class="privacy-notice" role="region" aria-label="資料收集說明" style="background:#fffbe6;border:1px solid #faad14;border-radius:12px;padding:16px;margin-top:24px;font-size:var(--fs-sm);color:#8a6d3b">
        <h2 style="margin-bottom:8px;font-size:var(--fs-md)">🔒 資料收集說明</h2>
        <p>本應用使用瀏覽器本地儲存（localStorage）保存以下資料：</p>
        <ul style="margin:8px 0 0 20px">
          <li>個人化設定（字體大小、行距、朗讀速度）</li>
          <li>學習進度及題目記錄</li>
          <li>每題作答記錄（category、選項、答得啱唔啱、用咗幾耐）</li>
        </ul>
        <p class="fc-mt-8">📌 學生名字會以 hash 儲存，唔會明文。離線使用時，進度仍保存在本地。恢復連線後自動同步。</p>
        <p style="margin-top:4px">🚫 <strong>唔會上傳去任何 server</strong>，純本地儲存。可隨時喺「📊 學習記錄」清除。</p>
      </div>

      ${renderFooter()}
    </div>
  `;
}