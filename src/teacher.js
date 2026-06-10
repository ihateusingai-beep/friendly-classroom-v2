// 老师模块 — 懒加载 chunk（学生不会下载此文件）
// 仅当用户点击「老師模式」时才触发 dynamic import()

import { getAllStudents, importProgress } from './domain/Progress.js';
import { getAllSubjects } from './subjects.js';

// TEACHER_EMOJI 是老师页专属的学生头像映射
const TEACHER_EMOJI = {};

export function renderLogin() {
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
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `;
}

export function renderTeacher() {
  const students = getAllStudents();

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
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
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
          ${getAllSubjects().map(sub => {
            const totalCompleted = students.reduce((acc, s) => acc + (s.subjectProgress?.[sub.id]?.completed || 0), 0);
            const totalPossible = students.reduce((acc, s) => acc + (s.subjectProgress?.[sub.id]?.total || 0), 0);
            const pct = totalPossible ? Math.round((totalCompleted / totalPossible) * 100) : 0;
            return `
              <div style="background:${sub.color}18;border:2px solid ${sub.color};border-radius:12px;padding:12px;text-align:center">
                <div style="font-size:1.5em;margin-bottom:4px">${sub.emoji}</div>
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
      <div class="footer" style="text-align:center;padding:16px;font-size:14px;color:var(--text-light);border-top:1px solid var(--border);margin-top:auto">© Ken Cheng 製作</div>
    </div>
  `;
}