// a11y/announce-smoke.mjs
// 驗證：scenario 載入後 #sr-announcer 嘅 textContent 有正確更新
// 用 Playwright 直接 navigate + 點擊 scenario 流程
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4174/';

async function run() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Bypass student select by setting localStorage
  await page.evaluate(() => {
    localStorage.setItem('fc_student_v2', '測試同學');
  });
  await page.reload();
  await page.waitForTimeout(1500);

  // ── Test 1: 自由模式 scenario announce ──
  console.log('[test 1] 自由模式 scenario 載入');
  // 揀學生模式
  await page.evaluate(() => FC.chooseRole('student'));
  await page.waitForTimeout(500);
  // 揀 Game Hub 嘅「情境答題」
  await page.evaluate(() => FC.goSubjectSelect());
  await page.waitForTimeout(500);
  // 揀第一個 subject（去 home）
  await page.evaluate(() => {
    const sub = document.querySelector('.subject-btn');
    if (sub) sub.click();
  });
  await page.waitForTimeout(500);
  // 撳第一個 topic card
  await page.evaluate(() => {
    const card = document.querySelector('.topic-card');
    if (card) card.click();
  });
  await page.waitForTimeout(500);
  // 撳第一個 scenario
  await page.evaluate(() => {
    const item = document.querySelector('.scenario-item');
    if (item) item.click();
  });
  await page.waitForTimeout(800);
  const ann1 = await page.evaluate(() => document.getElementById('sr-announcer')?.textContent);
  console.log(`  sr-announcer: "${ann1}"`);
  const test1Pass = ann1 && ann1.includes('題目') && ann1.includes('主題');
  console.log(`  ${test1Pass ? '✅' : '❌'} 自由模式 announce 包含「題目」+「主題」`);

  // ── Test 2: 銀行第一題 announce ──
  console.log('[test 2] 銀行第一題 announce');
  await page.evaluate(() => FC.goGameHub());
  await page.waitForTimeout(500);
  await page.evaluate(() => FC.playGoodDeedBank());
  await page.waitForTimeout(800);
  const ann2 = await page.evaluate(() => document.getElementById('sr-announcer')?.textContent);
  console.log(`  sr-announcer: "${ann2}"`);
  const test2Pass = ann2 && ann2.includes('銀行') && ann2.includes('題目');
  console.log(`  ${test2Pass ? '✅' : '❌'} 銀行 announce 包含「銀行」+「題目」`);

  // ── Test 3: 銀行下一題 announce ──
  console.log('[test 3] 銀行下一題 announce');
  // 揀 A 選項（第一個 option button）
  await page.evaluate(() => {
    const opt = document.querySelector('.option-card');
    if (opt) opt.click();
  });
  await page.waitForTimeout(800);
  // 撳「下一題」
  await page.evaluate(() => FC.bankNext());
  await page.waitForTimeout(800);
  const ann3 = await page.evaluate(() => document.getElementById('sr-announcer')?.textContent);
  console.log(`  sr-announcer: "${ann3}"`);
  const test3Pass = ann3 && ann3.includes('銀行') && ann3.includes('題目 2');
  console.log(`  ${test3Pass ? '✅' : '❌'} 銀行下一題 announce 包含「銀行」+「題目 2」`);

  // ── Test 4: aria-live 屬性正確 ──
  console.log('[test 4] sr-announcer 嘅 ARIA 屬性');
  const aria = await page.evaluate(() => {
    const el = document.getElementById('sr-announcer');
    if (!el) return null;
    return {
      'aria-live': el.getAttribute('aria-live'),
      'aria-atomic': el.getAttribute('aria-atomic'),
      className: el.className,
    };
  });
  console.log(`  ${JSON.stringify(aria)}`);
  const test4Pass = aria && aria['aria-live'] === 'polite' && aria['aria-atomic'] === 'true' && aria.className.includes('sr-only');
  console.log(`  ${test4Pass ? '✅' : '❌'} aria-live=polite, aria-atomic=true, sr-only class 齊全`);

  await browser.close();

  const allPass = test1Pass && test2Pass && test3Pass && test4Pass;
  console.log('');
  console.log(allPass ? '✅ 全部通過' : '❌ 有失敗');
  process.exit(allPass ? 0 : 1);
}

run().catch(e => { console.error(e); process.exit(2); });
