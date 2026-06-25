// 友愛教室 V3 — 17 個學習範疇
// ============================================================================
// 設計依據：教育局《價值觀教育》官方 12 種首要的價值觀和態度
// 來源：https://www.edb.gov.hk/tc/curriculum-development/4-key-tasks/moral-civic/index.html
// 「學校可培育學生十二種首要的價值觀和態度，即：『堅毅』、『尊重他人』、
//   『責任感』、『國民身份認同』、『承擔精神』、『誠信』、『仁愛』、
//   『守法』、『同理心』、『勤勞』、『團結』和『孝親』」
// ============================================================================
// 結構：兩個獨立 domain
//   🪷 價值觀 12 範疇 (VALUES) — EDB 官方，public face
//   🌈 友愛校園 5 範疇 (CARING) — SEL / 安全 / 社交技巧
// ============================================================================

// 🪷 12 個 EDB 官方首要價值觀（保留官方 order）
export const VALUES = [
  {
    id: 'perseverance',
    title: '堅毅',
    emoji: '🌱',
    domain: 'value',
    description: '遇到困難不放棄，堅持到底',
    creedIds: [1],
    color: '#10B981',
  },
  {
    id: 'respect',
    title: '尊重他人',
    emoji: '🤝',
    domain: 'value',
    description: '尊重每個人，唔嘲笑唔排擠',
    creedIds: [2],
    color: '#4ECDC4',
  },
  {
    id: 'responsibility',
    title: '責任感',
    emoji: '📋',
    domain: 'value',
    description: '自己嘅嘢自己打理（routine 責任）',
    creedIds: [3],
    color: '#F59E0B',
  },
  {
    id: 'national-identity',
    title: '國民身份認同',
    emoji: '🇭🇰',
    domain: 'value',
    description: '愛護香港，認識國家',
    creedIds: [4],
    color: '#EF4444',
  },
  {
    id: 'commitment',
    title: '承擔精神',
    emoji: '🛡️',
    domain: 'value',
    description: '自己嘅選擇自己承擔（consequence 責任）',
    creedIds: [5],
    color: '#DC2626',
  },
  {
    id: 'integrity',
    title: '誠信',
    emoji: '⚖️',
    domain: 'value',
    description: '講真話，做個可信嘅人',
    creedIds: [6],
    color: '#3B82F6',
  },
  {
    id: 'benevolence',
    title: '仁愛',
    emoji: '💗',
    domain: 'value',
    description: '關心別人，主動幫忙',
    creedIds: [7],
    color: '#EC4899',
  },
  {
    id: 'law-abiding',
    title: '守法',
    emoji: '📜',
    domain: 'value',
    description: '遵守規則，奉公守法',
    creedIds: [8],
    color: '#6366F1',
  },
  {
    id: 'empathy',
    title: '同理心',
    emoji: '🫂',
    domain: 'value',
    description: '易地而處，感受他人嘅情緒',
    creedIds: [9],
    color: '#F97316',
  },
  {
    id: 'diligence',
    title: '勤勞',
    emoji: '💪',
    domain: 'value',
    description: '努力練習，唔怕辛苦',
    creedIds: [10],
    color: '#84CC16',
  },
  {
    id: 'solidarity',
    title: '團結',
    emoji: '🤲',
    domain: 'value',
    description: '與人合作，一齊努力',
    creedIds: [11],
    color: '#06B6D4',
  },
  {
    id: 'filial-piety',
    title: '孝親',
    emoji: '🏠',
    domain: 'value',
    description: '尊敬父母，孝順家人',
    creedIds: [12],
    color: '#A855F7',
  },
];

// 🌈 5 個 友愛校園 範疇（SEL / 安全 / 社交技巧）
// 對應原來 self-protection / social-distance / stranger-danger /
// help-seeking / conflict 五組
export const CARING = [
  {
    id: 'body-autonomy',
    title: '身體自主',
    emoji: '🛡️',
    domain: 'caring',
    description: '認識身體界線，保護自己',
    creedIds: [8],   // 守法（身體自主 = 認識 private parts 規矩）
    color: '#BE185D',
  },
  {
    id: 'stranger-safety',
    title: '陌生人危險',
    emoji: '⚠️',
    domain: 'caring',
    description: '應對陌生情境，保護自己',
    creedIds: [8],
    color: '#B91C1C',
  },
  {
    id: 'help-seeking',
    title: '求助技巧',
    emoji: '📞',
    domain: 'caring',
    description: '識得搵人幫手',
    creedIds: [9],   // 同理心 + 守法
    color: '#0EA5E9',
  },
  {
    id: 'social-boundary',
    title: '社交界線',
    emoji: '🚧',
    domain: 'caring',
    description: '同人保持合適嘅距離',
    creedIds: [9],
    color: '#7C3AED',
  },
  {
    id: 'conflict-resolution',
    title: '衝突解決',
    emoji: '💬',
    domain: 'caring',
    description: '化解爭執，搵共識',
    creedIds: [11, 9],   // 團結 + 同理心
    color: '#059669',
  },
];

// 🕵️ Sprint 23 — 情緒小偵探 (SPEC §23)
// Sprint 24: 從 CARING 抽出嚟做獨立 domain — 適合 SEN / ASD 學生嘅
// emotion decoding 練習,axis 同 value-choice 唔同(認情緒 vs 做判斷),
// 喺 home tab 都係獨立 🕵️ 一個,唔再塞喺 🌈 友愛校園 入面。
// Data schema:faceOptions 取代 options(同人唔同表情,3 個 choices)。
export const EMOTION_DETECTIVE = [
  {
    id: 'emotion-detective',
    title: '情緒小偵探',
    emoji: '🕵️',
    domain: 'emotion-detective',
    description: '睇情境，揾出正確嘅表情',
    creedIds: [9],   // 同理心基礎
    color: '#FB923C',
  },
];

// 🕵️ Sprint 25 — 情緒小偵探 sub-categories (SPEC §25)
// 學生 mode 入到 topic 之後, 將 10 個 ed-* scenarios 分做 sub-tab:
// 🟡 basic = Ekman 6 basic emotions (happiness / sadness / anger /
//            fear / surprise / disgust) — 適合初階 emotion decoding
// 🟠 social = self-evaluative + social emotions (尷尬/攰/困惑/驕傲)
//            — 適合高階 / 校園社交情境辨識
// 📚 all = 全部 10 個, 維持 backward compat
//
// UI 喺 topic view (renderTopicList) 入面用呢個 const 嚟 render sub-tabs。
// 唔影響 home tab 嘅 🕵️ 情緒小偵探 入口, 學生可以喺入到 topic 之後先揀 sub。
export const EMOTION_CATEGORIES = [
  { id: 'basic',  emoji: '🟡', label: '基本情緒 (Ekman 6)', short: '基本情緒', description: '6 種基本情緒：開心 / 嬲 / 喊 / 驚 / 驚訝 / 厭惡' },
  { id: 'social', emoji: '🟠', label: '社交 / 自評情緒',    short: '社交情緒', description: '4 種社交情境情緒：尷尬 / 攰 / 困惑 / 驕傲' },
  { id: 'all',    emoji: '📚', label: '全部 10 個情境',      short: '全部',     description: '基本 + 社交所有情境' },
];

// Helper: filter scenarios by emotionCategory. Returns array (empty if
// category id unknown). 'all' returns the input array unchanged.
export function filterScenariosByEmotionCategory(scenarios, categoryId) {
  if (!categoryId || categoryId === 'all') return scenarios.slice();
  return scenarios.filter(s => s?.emotionCategory === categoryId);
}

// 三個 domain 合併（18 個，EDB 官方 order 在前，Caring 在後，ED 最後）
export const TOPICS = [...VALUES, ...CARING, ...EMOTION_DETECTIVE];

// 舊 topicId → 新 topicId migration map
// 用嚟 scenarios.json re-tag 同 user 舊進度兼容
export const TOPIC_MIGRATION = {
  // 保留直接 rename
  emotions: 'empathy',           // 情緒與規範 → 同理心
  respect: 'respect',            // 尊重與關懷 → 尊重他人
  // honesty / integrity 合併
  honesty: 'integrity',          // 誠實與責任 → 誠信
  integrity: 'integrity',        // 誠信 (新 category)
  // conflict 搬入 caring
  conflict: 'conflict-resolution',  // 衝突與求助 → 衝突解決
  // perseverance 拆
  perseverance: 'perseverance',  // 預設 default（個別會去 diligence）
  // 搬入 caring
  'self-protection': 'body-autonomy',
  'social-distance': 'social-boundary',
  'stranger-danger': 'stranger-safety',
  'help-seeking': 'help-seeking',
  // 直接 rename
  cooperation: 'solidarity',
  'classroom-rules': 'law-abiding',
  'filial-piety': 'filial-piety',
  'gift-gratitude': 'benevolence',  // 預設（個別會去 empathy / filial-piety）
  responsibility: 'responsibility',
  diligence: 'diligence',         // 新 category
  commitment: 'commitment',       // 新 category
  'national-identity': 'national-identity',  // 新 category
};

// 個別 scenario override map（當 default migration 唔啱用）
export const SCENARIO_TOPIC_OVERRIDE = {
  // 堅毅 → 勤勞：s-self-58「做家務唔怕辛苦」本質係勤勞
  's-self-58': 'diligence',
  // 堅毅 → 勤勞：s-self-55「功課難都要試」都可以係勤勞，但保留堅毅 fit 啲
  // gift-gratitude 個別拆分
  's-self-32': 'filial-piety',  // 感恩父母：爸爸返內地唔好要求 → 孝親
  's-self-35': 'empathy',        // 理解朋友：朋友買唔到 → 同理心
  's-self-36': 'empathy',        // 知足不貪：見到貴玩具 → 同理心（理解他人）
  // 衝突解決由 conflict 搬入 conflict-resolution
  // （已由 TOPIC_MIGRATION 處理）
};

export function getTopic(id) {
  return TOPICS.find(t => t.id === id);
}

export function getValueTopics() {
  return VALUES;
}

export function getCaringTopics() {
  return CARING;
}

// Sprint 24 — emotion-detective 獨立 domain helper
export function getEmotionDetectiveTopics() {
  return EMOTION_DETECTIVE;
}

export function isValueTopic(id) {
  return VALUES.some(v => v.id === id);
}

export function isCaringTopic(id) {
  return CARING.some(c => c.id === id);
}

// Sprint 24 — emotion-detective 獨立 helper,filter tab / render 邏輯用
export function isEmotionDetectiveTopic(id) {
  return EMOTION_DETECTIVE.some(e => e.id === id);
}
