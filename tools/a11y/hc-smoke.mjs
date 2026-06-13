// a11y/hc-smoke.mjs
// 驗證：HC mode toggle 後 <html data-hc> 正確切換，視覺上變黑白/純色 + 對比提升
// 對應：3 個 case
//   1. 默認 <html> 冇 data-hc，body bg = #f5f7fa（default）
//   2. toggle on → <html data-hc="true">，body bg = #ffffff，文字 = #000000
//   3. toggle off → <html> 冇 data-hc，body bg 還原 default
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://127.0.0.1:4174/';

async function run() {
  fs.mkdirSync('/tmp/fc-audit', { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Bypass student select
  await page.evaluate(() => {
    localStorage.setItem('fc_student_v2', '測試同學');
    localStorage.setItem('fc_hc_mode', '0');
  });
  await page.reload();
  await page.waitForTimeout(1500);

  // ── Test 1: 默認無 HC mode ──
  console.log('[test 1] 默認 state');
  const t1 = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    return {
      hasDataHc: html.hasAttribute('data-hc'),
      bodyBg: getComputedStyle(body).backgroundColor,
      bodyColor: getComputedStyle(body).color,
    };
  });
  console.log(`  ${JSON.stringify(t1)}`);
  const t1Pass = !t1.hasDataHc;
  console.log(`  ${t1Pass ? '✅' : '❌'} 默認冇 data-hc attribute`);
  await page.screenshot({ path: '/tmp/fc-audit/hc-default.png', fullPage: true });

  // ── Test 2: 去 settings 開 HC ──
  console.log('[test 2] 開 HC mode');
  await page.evaluate(() => FC.chooseRole('student'));
  await page.waitForTimeout(500);
  await page.evaluate(() => FC.goSettings());
  await page.waitForTimeout(800);
  // 撳 HC toggle
  const hcBtn = await page.$('button.toggle[data-key="hc"]');
  if (!hcBtn) {
    console.error('  ❌ 揾唔到 HC toggle button');
    process.exit(2);
  }
  await hcBtn.click();
  await page.waitForTimeout(500);
  const t2 = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    const card = document.querySelector('.card');
    const cs = card ? getComputedStyle(card) : null;
    return {
      hasDataHc: html.hasAttribute('data-hc'),
      dataHcVal: html.getAttribute('data-hc'),
      bodyBg: getComputedStyle(body).backgroundColor,
      bodyColor: getComputedStyle(body).color,
      cardBorder: cs?.border,
      cardBg: cs?.backgroundColor,
      storage: localStorage.getItem('fc_hc_mode'),
    };
  });
  console.log(`  ${JSON.stringify(t2)}`);
  const t2Pass = t2.hasDataHc && t2.dataHcVal === 'true' &&
    t2.storage === '1' &&
    t2.bodyBg.includes('255, 255, 255') &&  // 純白
    t2.bodyColor === 'rgb(0, 0, 0)' &&         // 純黑
    t2.cardBorder?.includes('3px');
  console.log(`  ${t2Pass ? '✅' : '❌'} data-hc=true, body 純白/純黑, card border 3px`);
  await page.screenshot({ path: '/tmp/fc-audit/hc-on.png', fullPage: true });

  // ── Test 3: 關返 HC mode ──
  console.log('[test 3] 關 HC mode');
  await hcBtn.click();
  await page.waitForTimeout(500);
  const t3 = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    return {
      hasDataHc: html.hasAttribute('data-hc'),
      bodyBg: getComputedStyle(body).backgroundColor,
      storage: localStorage.getItem('fc_hc_mode'),
    };
  });
  console.log(`  ${JSON.stringify(t3)}`);
  const t3Pass = !t3.hasDataHc && t3.storage === '0';
  console.log(`  ${t3Pass ? '✅' : '❌'} data-hc 移除, storage 還原 '0'`);
  await page.screenshot({ path: '/tmp/fc-audit/hc-off.png', fullPage: true });

  // ── Test 4: 重 reload 持久化測試 ──
  console.log('[test 4] 持久化 — reload 後保留 HC state');
  await hcBtn.click(); // 再開返
  await page.waitForTimeout(300);
  await page.reload();
  await page.waitForTimeout(1500);
  const t4 = await page.evaluate(() => {
    const html = document.documentElement;
    return {
      hasDataHc: html.hasAttribute('data-hc'),
      dataHcVal: html.getAttribute('data-hc'),
      storage: localStorage.getItem('fc_hc_mode'),
    };
  });
  console.log(`  ${JSON.stringify(t4)}`);
  const t4Pass = t4.hasDataHc && t4.dataHcVal === 'true' && t4.storage === '1';
  console.log(`  ${t4Pass ? '✅' : '❌'} reload 後 HC mode 保留`);

  // ── Test 5: 對比度 spot check — 揀一個 button, 拎 background / text 計 ratio ──
  console.log('[test 5] Button 對比度 spot check');
  await page.evaluate(() => FC.goSettings());
  await page.waitForTimeout(800);
  const contrast = await page.evaluate(() => {
    const btn = document.querySelector('.btn-primary');
    if (!btn) return null;
    const cs = getComputedStyle(btn);
    return {
      bg: cs.backgroundColor,
      color: cs.color,
    };
  });
  console.log(`  btn-primary: ${JSON.stringify(contrast)}`);
  // 純黑底 + 純黃字 對比度應該好高
  const t5Pass = contrast && contrast.bg === 'rgb(0, 0, 0)' && contrast.color === 'rgb(255, 255, 0)';
  console.log(`  ${t5Pass ? '✅' : '❌'} btn-primary 黑底 + 黃字（高對比）`);

  await browser.close();

  const allPass = t1Pass && t2Pass && t3Pass && t4Pass && t5Pass;
  console.log('');
  console.log(allPass ? '✅ 全部通過' : '❌ 有失敗');
  process.exit(allPass ? 0 : 1);
}

run().catch(e => { console.error(e); process.exit(2); });
