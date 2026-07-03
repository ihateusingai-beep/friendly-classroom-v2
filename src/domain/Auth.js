// src/domain/Auth.js — Role, mode, and subject selection.
//
// Extracted from main.js (Sprint 2 / Track A2). Owns the auth/role onboarding
// path: pick subject → pick game mode → enter home (or teacher login).
//
// Public API:
//   wireAuth({ setView, render, _loadTeacher, getAllSubjects, initSubjectProgress })
//   selectSubject(subjectId)   : pick subject, enter home
//   selectMode(modeId)         : pick game mode (writes to state.gameMode)
//   chooseRole(role)           : choose student/teacher role
//   renderSubjectSelect()      : list of subjects
//
// window.FC.selectSubject / window.FC.selectMode / window.FC.chooseRole
// are wired by main.js so they are guaranteed to exist at boot time.

import { escapeAttr } from '../util/escape.js';

let _setView = null;
let _render = null;
let _loadTeacher = null;
let _getAllSubjects = null;
let _initSubjectProgress = null;
let _state = null;
let _setState = null;

/** Inject main.js dependencies. */
export function wireAuth({
  setView, render, _loadTeacher,
  getAllSubjects, initSubjectProgress,
  getState, setState,
}) {
  _setView = setView;
  _render = render;
  _loadTeacher = _loadTeacher;
  _getAllSubjects = getAllSubjects;
  _initSubjectProgress = initSubjectProgress;
  _state = getState;
  _setState = setState;
}

/** Pick a subject and enter the home view (data-action="selectSubject"). */
export function selectSubject(subjectId) {
  _initSubjectProgress(subjectId);
  _setView('home', { subjectId });
  _render();
}

/** Choose student or teacher role. Teacher login view renders via render()
 *  case 'login', which now self-loads the teacher chunk on demand
 *  (Sprint 18.2.1 fix — was brittle _loadTeacher dep injection).
 */
export async function chooseRole(role) {
  const current = _state();
  _setState({ ...current, role, teacherMode: role === 'teacher' });
  if (role === 'teacher') {
    _setView('login');
  } else {
    _setView('hub');
  }
  _render();
}

/** Pick a game mode and persist to localStorage (data-action="selectMode"). */
export function selectMode(modeId) {
  localStorage.setItem('fc_game_mode', modeId);
  const current = _state();
  _setState({ ...current, gameMode: modeId });
  _render();
  // Brief scale-up animation on the selected card for visual feedback.
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

/** Render the subject-select screen. */
export function renderSubjectSelect() {
  return `
    <div class="container fade-in" style="max-width:500px">
      <h1 style="text-align:center;margin-bottom:20px">📚 選擇科目</h1>
      <div class="subject-grid" role="list" aria-label="科目清單">
        ${_getAllSubjects().map(sub => `
          <button type="button" class="subject-btn" style="background:${sub.bgColor};border-color:${sub.color}"
            data-action="selectSubject" data-arg="${escapeAttr(sub.id)}" role="listitem"
            aria-label="選擇科目 ${sub.title}">
            <span style="font-size:2em" aria-hidden="true">${sub.emoji}</span>
            <span style="font-weight:600;color:${sub.color}">${sub.title}</span>
          </button>
        `).join('')}
      </div>
      <div style="margin-top:12px;text-align:center">
        <button type="button" class="btn btn-outline" data-action="navigate" data-arg="home">← 返回</button>
      </div>
    </div>
  `;
}
