// 兩個 subject — 學校價值觀 + 家庭生活 (Sprint 28 pilot)。
// 舊 4 個（數學/中文/英文/常識）係 placeholder，現已收埋 — 專注做 value + family。
export const SUBJECTS = [
  {
    id: 'value',
    title: '價值觀教育',
    emoji: '🎯',
    color: '#7C3AED',     // 紫 — 對齊 NT-D psychoframe theme
    bgColor: '#F3E8FF',
    icon: '品格',
  },
  {
    id: 'family',
    title: '家庭生活',
    emoji: '🏠',
    color: '#F59E0B',     // 琥珀 — 對齊 warm/family theme (Sprint 27 D1)
    bgColor: '#FEF3C7',
    icon: '家庭',
  },
];

export function getSubject(id) {
  return SUBJECTS.find(s => s.id === id);
}

export function getSubjectColor(id) {
  return getSubject(id)?.color || '#7C3AED';
}

export function getSubjectBgColor(id) {
  return getSubject(id)?.bgColor || '#F3E8FF';
}

export function getSubjectName(id) {
  return getSubject(id)?.title || '價值觀教育';
}

export function getSubjectEmoji(id) {
  return getSubject(id)?.emoji || '🎯';
}

export function getAllSubjects() {
  return SUBJECTS;
}
