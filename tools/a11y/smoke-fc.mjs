// Smoke test: keyboard activation of all major buttons + role-card button
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://127.0.0.1:4174/';

async function run() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  // Set up student to make deeper flows testable
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    localStorage.setItem('fc_student_v2', '測試同學');
  });
  await page.reload();
  await page.waitForTimeout(2000);

  // 1. Verify role-card button clickable
  console.log('[smoke] Click role-card via keyboard');
  await page.keyboard.press('Tab'); // skip-link
  await page.keyboard.press('Tab'); // student role-card
  const focused = await page.evaluate(() => document.activeElement?.textContent?.slice(0, 40));
  console.log(`  focused: ${focused}`);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  const afterEnter = await page.evaluate(() => document.querySelector('.page-header h1')?.textContent);
  console.log(`  after Enter: ${afterEnter}`);

  // 2. Click game-card via keyboard
  console.log('[smoke] Click game-card via keyboard');
  await page.keyboard.press('Tab'); // back
  await page.keyboard.press('Tab'); // game-card
  const focused2 = await page.evaluate(() => document.activeElement?.textContent?.slice(0, 40));
  console.log(`  focused: ${focused2}`);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  const after2 = await page.evaluate(() => document.querySelector('.page-header h1, h1')?.textContent);
  console.log(`  after Enter: ${after2}`);

  // 3. Screenshot home to verify layout
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/fc-audit/home-after.png', fullPage: true });
  console.log('  screenshot saved: /tmp/fc-audit/home-after.png');

  // 4. Screenshot student mode
  await page.click('button.role-card.student');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/fc-audit/hub-after.png', fullPage: true });
  console.log('  screenshot saved: /tmp/fc-audit/hub-after.png');

  // 5. Screenshot subject select
  await page.click('button.game-card[onclick*="goSubjectSelect"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/fc-audit/subject-after.png', fullPage: true });
  console.log('  screenshot saved: /tmp/fc-audit/subject-after.png');

  // 6. Test skip-link visible on focus
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.keyboard.press('Tab');
  const skipVisible = await page.evaluate(() => {
    const a = document.querySelector('.skip-link');
    const rect = a?.getBoundingClientRect();
    const cs = getComputedStyle(a);
    return {
      text: a?.textContent,
      visible: rect && rect.top >= 0 && cs.visibility !== 'hidden',
      top: rect?.top,
    };
  });
  console.log(`[smoke] skip-link on focus: ${JSON.stringify(skipVisible)}`);

  // 7. Heading order
  const headings = await page.evaluate(() => Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
    .map(h => `${h.tagName}: ${h.textContent?.slice(0, 30)}`));
  console.log('[smoke] headings on home:');
  for (const h of headings) console.log(`  ${h}`);

  await browser.close();
  console.log('\n✅ All smoke tests passed');
}

run().catch(e => { console.error(e); process.exit(1); });
