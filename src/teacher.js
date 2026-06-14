// 老師模塊 — 懶加載 chunk（學生不會下載此文件）
// 僅當用戶點擊「老師模式」時才觸發 dynamic import()

import { getAllStudents, importProgress, getStudentSummary, getAllStudentsCached } from './domain/Progress.js';
import { getAllSubjects } from './subjects.js';
import { escapeAttr } from './util/escape.js';
import { renderFooter, renderEmptyState } from './components/chrome.js';

// TEACHER_EMOJI 是老師頁專屬的學生頭像映射
const TEACHER_EMOJI = {};

export function renderLogin() {
  return `
    <div class="container fade-in">
      <div class="login-form">
        <h1 style="text-align:center;margin-bottom:20px">🔐 老師登入</h1>
        <label for="teacher-pw" class="sr-only">老師密碼</label>
        <input id="teacher-pw" type="password" autocomplete="current-password" placeholder="輸入密碼" />
        <button type="button" class="btn btn-primary" class="fc-w-100" data-action="doLogin">登入</button>
        <p id="login-error" role="alert" style="color:var(--danger);text-align:center;margin-top:8px;display:none">密碼錯誤</p>
        <div style="margin-top:12px;text-align:center">
          <button type="button" class="btn btn-outline" data-action="goRoleSelect">← 返回</button>
        </div>
      </div>
      ${renderFooter()}
    </div>
  `;
}

export function renderTeacher() {
  const students = getAllStudents();

  if (!students.length) {
    return `
    <div class="container fade-in">
      <div class="page-header">
        <button type="button" class="back-btn" data-action="goRoleSelect" aria-label="返回主選單">←</button>
        <h1>📊 老師儀表板</h1>
      </div>
      <div class="teacher-panel">
        <h2 class="sr-only">📊 老師儀表板</h2>
        <div class="subtitle">暫無學生數據</div>
      </div>
      ${renderEmptyState({ emoji: '📭', title: '暫時沒有學生數據', hint: '學生完成學習後會自動顯示在這裡' })}
      <div class="fc-mt-16">
        <button type="button" class="btn btn-outline" data-action="goRoleSelect">← 返回首頁</button>
      </div>
      ${renderFooter()}
    </div>`;
  }

  return `
    <div class="container fade-in">
      <div class="page-header">
        <button type="button" class="back-btn" data-action="goRoleSelect" aria-label="返回主選單">←</button>
        <h1>📊 老師儀表板</h1>
      </div>

      <div class="teacher-panel">
        <h2>👥 學生總覽</h2>
        <div class="subtitle">共 ${students.length} 位學生</div>
      </div>

      <div class="fc-flex-col-gap" role="list" aria-label="學生清單">
        ${students.map(s => {
          // Phase 3 (S19): use the canonical summary shape
          const sum = getStudentSummary(s.name);
          const total = sum.score;
          const completed = sum.completedCount;
          const emoji = TEACHER_EMOJI[s.name] || '👤';
          const grade = total >= 200 ? '🌟' : total >= 100 ? '⭐' : total >= 50 ? '✨' : '💫';
          return `
          <div class="student-row" role="listitem" aria-label="學生 ${escapeAttr(s.name)}，完成 ${completed} 個場景，最近 ${s.lastPlayed || '—'}，道德分 ${total}，等級 ${grade}">
            <span class="avatar" aria-hidden="true">${emoji}</span>
            <span class="info">
              <span class="name">${escapeAttr(s.name)}</span>
              <span class="meta">完成 ${completed} 個場景 · 最近 ${s.lastPlayed || '—'}</span>
            </span>
            <span class="stat-badge">
              <span class="num" style="color:${total >= 100 ? '#15803d' : 'var(--text)'}">${total}</span>
              <span class="label">道德分</span>
            </span>
            <span style="font-size:1.2em" aria-hidden="true">${grade}</span>
          </div>`;
        }).join('')}
      </div>

      <div class="card" class="fc-mt-16">
        <div style="font-weight:600;margin-bottom:10px">📚 科目總覽</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px" role="list" aria-label="科目總覽" class="subject-grid">
          ${getAllSubjects().map(sub => {
            const totalCompleted = students.reduce((acc, s) => acc + (s.subjectProgress?.[sub.id]?.completed || 0), 0);
            const totalPossible = students.reduce((acc, s) => acc + (s.subjectProgress?.[sub.id]?.total || 0), 0);
            const pct = totalPossible ? Math.round((totalCompleted / totalPossible) * 100) : 0;
            return `
              <div style="background:${sub.color}18;border:2px solid ${sub.color};border-radius:12px;padding:12px;text-align:center" role="listitem"
                aria-label="${sub.title}，全班完成 ${totalCompleted}/${totalPossible} 題，${pct}%">
                <div style="font-size:1.5em;margin-bottom:4px" aria-hidden="true">${sub.emoji}</div>
                <div style="font-weight:700;font-size:1.1em;color:${sub.color}">${totalCompleted}/${totalPossible}</div>
                <div style="height:6px;background:#eee;border-radius:3px;margin-top:6px;overflow:hidden" role="progressbar"
                  aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${sub.title} 全班進度">
                  <div style="height:100%;width:${pct}%;background:${sub.color};border-radius:3px"></div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">📥 匯入學生數據</div>
        <p style="font-size:0.85em;color:var(--text-light);margin-bottom:8px">選擇學生之前匯出的 .json 檔案</p>
        <label for="teacher-import-file" class="sr-only">匯入學生資料檔案</label>
        <input id="teacher-import-file" type="file" accept=".json" onchange="FC.handleImport(event)" style="margin-bottom:10px" />
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">📤 匯出全班數據</div>
        <button type="button" class="btn btn-success" data-action="exportAll">📤 匯出全班</button>
      </div>

      <div class="card">
        <div style="font-weight:600;margin-bottom:10px">⚙️ 老師設定</div>
        <p style="font-size:0.85em;color:var(--text-light);margin-bottom:8px">控制學生的功能開關、課題範圍、PIN</p>
        <button type="button" class="btn btn-primary" data-action="goTeacherAssign">⚙️ 功能設定</button>
      </div>

      <div class="fc-mt-16">
        <button type="button" class="btn btn-outline" data-action="goRoleSelect">← 返回首頁</button>
      </div>
      ${renderFooter()}
    </div>
  `;
}