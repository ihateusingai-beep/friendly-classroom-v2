// 四個科目
export const SUBJECTS = [
  {
    id: 'math',
    title: '數學',
    emoji: '🎯',
    color: '#4285F4',   // 藍
    bgColor: '#E8F0FE',
    icon: '＋－×÷',
  },
  {
    id: 'chinese',
    title: '中文',
    emoji: '📐',
    color: '#EA4335',   // 紅
    bgColor: '#FCE8E6',
    icon: '語文',
  },
  {
    id: 'english',
    title: '英文',
    emoji: '🔤',
    color: '#34A853',   // 綠
    bgColor: '#E6F4EA',
    icon: 'ABC',
  },
  {
    id: 'science',
    title: '常識',
    emoji: '🔬',
    color: '#9C27B0',   // 紫
    bgColor: '#F3E5F5',
    icon: '探究',
  },
];

export function getSubject(id) {
  return SUBJECTS.find(s => s.id === id);
}

export function getSubjectColor(id) {
  return getSubject(id)?.color || '#666';
}

export function getSubjectBgColor(id) {
  return getSubject(id)?.bgColor || '#f5f5f5';
}

export function getSubjectName(id) {
  return getSubject(id)?.title || '';
}

export function getSubjectEmoji(id) {
  return getSubject(id)?.emoji || '';
}

export function getAllSubjects() {
  return SUBJECTS;
}