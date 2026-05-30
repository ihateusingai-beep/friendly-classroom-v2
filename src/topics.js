// 四個學習主題
export const TOPICS = [
  {
    id: 'emotions',
    title: '情緒與規範',
    emoji: '🎭',
    description: '學習管理情緒、守規矩、尊重他人',
    creedIds: [1, 5, 7],
    color: '#FF6B6B',
  },
  {
    id: 'respect',
    title: '尊重與關懷',
    emoji: '🤝',
    description: '學習尊重別人、關心他人、不嘲笑',
    creedIds: [4, 5],
    color: '#4ECDC4',
  },
  {
    id: 'honesty',
    title: '誠實與責任',
    emoji: '⚖️',
    description: '學習誠實面對、勇於承擔責任',
    creedIds: [2, 6],
    color: '#45B7D1',
  },
  {
    id: 'conflict',
    title: '衝突與求助',
    emoji: '💪',
    description: '學習解決衝突、向人求助',
    creedIds: [2, 5, 7],
    color: '#96CEB4',
  }
];

export function getTopic(id) {
  return TOPICS.find(t => t.id === id);
}