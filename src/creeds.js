// 10條學校信條
export const CREEDS = [
  { id: 1, title: "守法的", text: "我們是守法的：遵守校規，奉公守法" },
  { id: 2, title: "信實的", text: "我們是信實的：誠實負責，不欺騙人" },
  { id: 3, title: "整潔的", text: "我們是整潔的：校服整潔，儀容端正" },
  { id: 4, title: "友愛的", text: "我們是友愛的：關心別人，互相幫助" },
  { id: 5, title: "禮讓的", text: "我們是禮讓的：待人有禮，不易發怒" },
  { id: 6, title: "勤力的", text: "我們是勤力的：上課專心，努力學習" },
  { id: 7, title: "合作的", text: "我們是合作的：遵守規則，積極參與" },
  { id: 8, title: "獨立的", text: "我們是獨立的：自己的事，自己去做" },
  { id: 9, title: "愛護學校的", text: "我們是愛護學校的：愛護公物，保護環境" },
  { id: 10, title: "感恩的", text: "我們是感恩的：尊敬師長，孝順父母" }
];

// 信條分類：正面（應該踐行嚟累積）vs 提醒類（受挫時提醒）
const POSITIVE_CREEDS = [4, 5, 7, 9, 10]; // 友愛/禮讓/合作/愛護/感恩
const REMINDER_CREEDS = [1, 2, 3, 6, 8];  // 守法/信實/整潔/勤力/獨立

export function getCreedsByIds(ids) {
  return CREEDS.filter(c => ids.includes(c.id));
}

export function formatCreeds(ids) {
  return getCreedsByIds(ids).map(c => `${c.title}：${c.text}`);
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
  // scenario 冇對應類別 → 從 scenario 全部 creeds + 1 條提醒類 fallback，
  // 確保壞選擇都見到一條「你應該反思」嘅 creed（唔同正面選擇）
  if (moralChange < 0 && all.length > 0) {
    // 揀一條 scenario 入面冇嘅 reminder
    const reminderFallback = REMINDER_CREEDS.find(id => !all.includes(id)) || REMINDER_CREEDS[0];
    return [...all.slice(0, 1), reminderFallback];
  }
  // 正面 fallback：拎 category 內最 relevant 嘅
  return [targetIds[0]];
}
