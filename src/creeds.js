// 10條學校信條
export const CREEDS = [
  { id: 1, title: "守法的", text: "遵守校規，奉公守法" },
  { id: 2, title: "信實的", text: "誠實負責，不欺騙人" },
  { id: 3, title: "整潔的", text: "校服整潔，儀容端正" },
  { id: 4, title: "友愛的", text: "關心別人，互相幫助" },
  { id: 5, title: "禮讓的", text: "待人有禮，不易發怒" },
  { id: 6, title: "勤力的", text: "上課專心，努力學習" },
  { id: 7, title: "合作的", text: "遵守規則，積極參與" },
  { id: 8, title: "獨立的", text: "自己的事，自己去做" },
  { id: 9, title: "愛護學校的", text: "愛護公物，保護環境" },
  { id: 10, title: "感恩的", text: "尊敬師長，孝順父母" }
];

export function getCreedsByIds(ids) {
  return CREEDS.filter(c => ids.includes(c.id));
}

export function formatCreeds(ids) {
  return getCreedsByIds(ids).map(c => `${c.title}：${c.text}`);
}