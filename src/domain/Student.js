// src/domain/Student.js — Student lifecycle: list, select, switch.
//
// Extracted from main.js (Sprint 2 / Track A2).
// Public API:
//   wireStudent({ setView, render, renderFooter }) : inject main.js locals
//   switchStudent()        : navigate to student-select
//   selectStudent(name)    : pick a saved student and enter home
//   renderStudentSelect()  : list of saved students + new-student input
//
// Note: window.FC.selectStudent / window.FC.switchStudent are registered
// by main.js (wiring step) so they are guaranteed to be available at
// boot time, before any data-action click can fire.

import { getAllStudents } from '../domain/Progress.js';
import { setStudent } from '../domain/ScenarioEngine.js';
import { escapeAttr } from '../util/escape.js';

let _setView = null;
let _render = null;
let _renderFooter = null;

/** Wire dependencies from main.js after module load. */
export function wireStudent({ setView, render, renderFooter }) {
  _setView = setView;
  _render = render;
  _renderFooter = renderFooter;
}

/** Navigate to the student-select view (data-action="switchStudent"). */
export function switchStudent() {
  _setView('student-select');
  _render();
}

/** Pick a saved student and enter home (data-action="selectStudent"). */
export function selectStudent(name) {
  if (name === '其他') return;
  setStudent(name);
  _setView('home', { student: name });
  _render();
}

/** Render the student-select screen. */
export function renderStudentSelect() {
  const saved = getAllStudents();
  return `
    <div class="container fade-in" style="max-width:460px;padding-top:40px">
      <h1 style="text-align:center;margin-bottom:24px">👤 選擇學生</h1>
      <div class="fc-flex-col-gap fc-mb-20" role="list" aria-label="已登記嘅學生">
        ${saved.map(student => `
          <button type="button" class="student-card" data-action="selectStudent" data-arg="${escapeAttr(student.name)}" role="listitem"
            aria-label="選擇學生 ${escapeAttr(student.name)}，按此開始學習">
            <span class="avatar" aria-hidden="true">${student.emoji || '👤'}</span>
            <span class="info">
              <span class="name">${student.name}</span>
              <span class="sub">按此開始學習</span>
            </span>
            <span class="arrow" aria-hidden="true">→</span>
          </button>
        `).join('')}
      </div>
      <div style="text-align:center;color:var(--text-light);margin-bottom:16px;font-size:var(--fs-base)">— 或新增學生 —</div>
      <div style="background:var(--card);border-radius:14px;padding: var(--space-4);box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <label for="new-student-name" class="sr-only">新學生名字</label>
        <input id="new-student-name" type="text" inputmode="none" autocomplete="off" placeholder="輸入新學生名字"
          style="width:100%;padding: var(--space-3);border:2px solid var(--border);border-radius:10px;font-size:var(--fs-md);margin-bottom:10px;box-sizing:border-box" />
        <button type="button" class="btn btn-success fc-w-100" data-action="addStudent">➕ 新增學生</button>
      </div>
      <div style="margin-top:16px;text-align:center">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="role-select">← 返回首頁</button>
      </div>
      ${_renderFooter ? _renderFooter() : ''}
    </div>
  `;
}
