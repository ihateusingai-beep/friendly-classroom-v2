// 友愛教室 V3 — 學校信條系統
// ============================================================================
// 結構：
//   1. VALUE_CREEDS (id 1-12) — 12 條 EDB 官方首要價值觀信條
//   2. LEGACY_CREEDS (id 13+) — 10 條舊信條保留（兼容舊 progress data）
//   3. CREEDS = VALUE_CREEDS + LEGACY_CREEDS（合併 array，順序穩定）
// ============================================================================
// 設計理念：
//   - 12 條 EDB 信條同 12 個 value categories 一一對應
//   - 用 stable id 1-12 對齊 topics.js 嘅 creedIds 引用
//   - 舊 10 條信條保留做 LEGACY_CREEDS，避免舊用戶 progress data 失效
// ============================================================================

// 12 條 EDB 首要價值觀信條（順序：對應 EDB 官方 12 種）
export const VALUE_CREEDS = [
  { id: 1,  value: 'perseverance',      title: '堅毅的',      text: '我們是堅毅的：遇到困難不放棄，堅持到底' },
  { id: 2,  value: 'respect',           title: '尊重他人的',  text: '我們是尊重他人的：尊重每個人，唔嘲笑唔排擠' },
  { id: 3,  value: 'responsibility',    title: '負責任的',    text: '我們是負責任的：自己嘅嘢自己打理' },
  { id: 4,  value: 'national-identity', title: '愛國的',      text: '我們是愛護香港、認識國家的' },
  { id: 5,  value: 'commitment',        title: '勇於承擔的',  text: '我們是勇於承擔的：自己嘅選擇自己承擔' },
  { id: 6,  value: 'integrity',         title: '誠信的',      text: '我們是誠信的：講真話，做個可信嘅人' },
  { id: 7,  value: 'benevolence',       title: '仁愛的',      text: '我們是仁愛的：關心別人，主動幫忙' },
  { id: 8,  value: 'law-abiding',       title: '守法的',      text: '我們是守法的：遵守校規，奉公守法' },
  { id: 9,  value: 'empathy',           title: '同理心的',    text: '我們是同理心的：易地而處，感受他人嘅情緒' },
  { id: 10, value: 'diligence',         title: '勤勞的',      text: '我們是勤勞的：努力練習，唔怕辛苦' },
  { id: 11, value: 'solidarity',        title: '團結的',      text: '我們是團結的：與人合作，一齊努力' },
  { id: 12, value: 'filial-piety',      title: '孝親的',      text: '我們是孝親的：尊敬父母，孝順家人' },
];

// 保留 10 條舊信條做 LEGACY_CREEDS（id 13-22，兼容舊 progress data）
export const LEGACY_CREEDS = [
  { id: 13, title: "信實的",       text: "我們是信實的：誠實負責，不欺騙人" },
  { id: 14, title: "整潔的",       text: "我們是整潔的：校服整潔，儀容端正" },
  { id: 15, title: "友愛的",       text: "我們是友愛的：關心別人，互相幫助" },
  { id: 16, title: "禮讓的",       text: "我們是禮讓的：待人有禮，不易發怒" },
  { id: 17, title: "勤力的",       text: "我們是勤力的：上課專心，努力學習" },
  { id: 18, title: "合作的",       text: "我們是合作的：遵守規則，積極參與" },
  { id: 19, title: "獨立的",       text: "我們是獨立的：自己的事，自己去做" },
  { id: 20, title: "愛護學校的",   text: "我們是愛護學校的：愛護公物，保護環境" },
  { id: 21, title: "感恩的",       text: "我們是感恩的：尊敬師長，孝順父母" },
  { id: 22, title: "守法的",       text: "我們是守法的：遵守校規，奉公守法" },  // 從原 #1 拆出
];

// 合併 array（順序：VALUE_CREEDS → LEGACY_CREEDS）
export const CREEDS = [...VALUE_CREEDS, ...LEGACY_CREEDS];

// 舊 creed id → 新 creed id migration map
// 用嚟 progress data upgrade
export const CREED_MIGRATION = {
  // 舊 10 條（id 1-10）對應去 LEGACY_CREEDS（id 13-22）
  1: 22,   // 守法
  2: 13,   // 信實
  3: 14,   // 整潔
  4: 15,   // 友愛
  5: 16,   // 禮讓
  6: 17,   // 勤力
  7: 18,   // 合作
  8: 19,   // 獨立
  9: 20,   // 愛護學校
  10: 21,  // 感恩
};

// 信條分類：正面（應該踐行嚟累積）vs 提醒類（受挫時提醒）
// 用 EDB 信條 id（1-12）
const POSITIVE_VALUE_CREEDS = [2, 4, 7, 9, 11, 12];   // 尊重 / 愛國 / 仁愛 / 同理心 / 團結 / 孝親
const REMINDER_VALUE_CREEDS = [1, 3, 5, 6, 8, 10];     // 堅毅 / 責任 / 承擔 / 誠信 / 守法 / 勤勞

// 兼容舊 logic：POSITIVE_CREEDS / REMINDER_CREEDS 改去 value ids
const POSITIVE_CREEDS = POSITIVE_VALUE_CREEDS;
const REMINDER_CREEDS = REMINDER_VALUE_CREEDS;

export function getCreedsByIds(ids) {
  return CREEDS.filter(c => ids.includes(c.id));
}

export function formatCreeds(ids) {
  return getCreedsByIds(ids).map(c => `${c.title}：${c.text}`);
}

/**
 * 將舊 creed id migrate 去新 id
 * 用嚟 import 舊 progress data 時做 upgrade
 */
export function migrateCreedId(oldId) {
  return CREED_MIGRATION[oldId] || oldId;
}

export function migrateCreedIds(oldIds) {
  if (!oldIds) return [];
  return oldIds.map(migrateCreedId);
}

/**
 * 每日信條 — 根據 yyyy-mm-dd 揀一條 EDB value creed
 * 順序循環 VALUE_CREEDS，同一日 stable，第二日變。
 * 用 djb2 hash 攞穩定 index（避免 random 喺 rerender 跳嚟跳去）。
 */
export function getDailyCreed() {
  const today = new Date().toISOString().split('T')[0];
  const idx = _dateHash(today) % VALUE_CREEDS.length;
  return VALUE_CREEDS[idx];
}

function _dateHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * 根據選擇嘅 moral change 動態挑選 creeds subset：
 * - 正面選擇（moralChange > 0）：強調呢個情境下要實踐嘅正面信條
 * - 負面選擇（moralChange < 0）：用提醒類信條反思自己需要改善
 * - 中性（=0）：保留全部
 */
export function getTriggeredCreeds(scenarioCreedIds, moralChange) {
  if (moralChange === 0) return scenarioCreedIds || [];
  const all = scenarioCreedIds || [];
  const targetIds = moralChange > 0 ? POSITIVE_CREEDS : REMINDER_CREEDS;
  // 從 scenario 嘅 creeds 入面揀最貼近嘅 1-2 條
  const matched = all.filter(id => targetIds.includes(id));
  if (matched.length > 0) return matched;
  // scenario 冇對應類別 → 從 scenario 全部 creeds + 1 條提醒類 fallback
  if (moralChange < 0 && all.length > 0) {
    const reminderFallback = REMINDER_CREEDS.find(id => !all.includes(id)) || REMINDER_CREEDS[0];
    return [...all.slice(0, 1), reminderFallback];
  }
  // 正面 fallback：拎 category 內最 relevant 嘅
  return [targetIds[0]];
}
