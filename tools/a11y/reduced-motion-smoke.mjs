// a11y/reduced-motion-smoke.mjs
// 驗證：
//   A. reduced motion toggle：data-rm + CSS kill switch
//      1. 默認冇 data-rm，<html> 動畫/transition 正常
//      2. toggle on → data-rm="true" + 全部 transition-duration = 0.001ms
//      3. toggle off → data-rm 移除，duration 還原
//      4. 重 reload 持久化
//   B. announceToSR 嘅 visual toast fallback
//      5. 撳 scenario → #fc-announce-toast 出現 2.5s
//      6. toast textContent 同步 sr-announcer
//      7. toast 喺 reduced motion mode 仍然 show（即時出現，唔做 fade）
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:4174/';

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
    localStorage.setItem('fc_rm_mode', '0');
  });
  await page.reload();
  await page.waitForTimeout(1500);

  // ── A1: 默認無 data-rm ──
  console.log('[A1] 默認 state');
  const a1 = await page.evaluate(() => {
    const html = document.documentElement;
    const btn = document.querySelector('.btn-primary, .btn');
    const cs = btn ? getComputedStyle(btn) : null;
    return {
      hasDataRm: html.hasAttribute('data-rm'),
      transitionDuration: cs?.transitionDuration || null,
    };
  });
  console.log(`  ${JSON.stringify(a1)}`);
  const a1Pass = !a1.hasDataRm;
  console.log(`  ${a1Pass ? '✅' : '❌'} 默認冇 data-rm attribute`);

  // ── A2: toggle on ──
  console.log('[A2] 開 reduced motion');
  await page.evaluate(() => FC.chooseRole('student'));
  await page.waitForTimeout(500);
  await page.evaluate(() => FC.goSettings());
  await page.waitForTimeout(800);
  const rmBtn = await page.$('button.toggle[data-key="rm"]');
  if (!rmBtn) {
    console.error('  ❌ 揾唔到 reduced motion toggle button');
    process.exit(2);
  }
  await rmBtn.click();
  await page.waitForTimeout(500);
  const a2 = await page.evaluate(() => {
    const html = document.documentElement;
    // 拎 .btn 嘅 transition-duration — RM mode 應該係 0.001ms
    const btns = document.querySelectorAll('.btn');
    const dur = btns[0] ? getComputedStyle(btns[0]).transitionDuration : null;
    // 再拎 .fade-in 嘅 animation-duration
    const fadeIn = document.createElement('div');
    fadeIn.className = 'fade-in';
    document.body.appendChild(fadeIn);
    const fadeDur = getComputedStyle(fadeIn).animationDuration;
    fadeIn.remove();
    return {
      hasDataRm: html.hasAttribute('data-rm'),
      dataRmVal: html.getAttribute('data-rm'),
      btnTransitionDuration: dur,
      fadeInAnimationDuration: fadeDur,
      storage: localStorage.getItem('fc_rm_mode'),
    };
  });
  console.log(`  ${JSON.stringify(a2)}`);
  const a2Pass = a2.hasDataRm && a2.dataRmVal === 'true' &&
    a2.storage === '1' &&
    // Chromium serialize 0.001ms 做 "1e-06s" (0.000001s) — accept ≤ 0.001ms (1e-06)
    parseFloat(a2.btnTransitionDuration) <= 0.001 &&
    parseFloat(a2.fadeInAnimationDuration) <= 0.001;
  console.log(`  ${a2Pass ? '✅' : '❌'} data-rm=true, transition+animation ≤ 0.001ms (${a2.btnTransitionDuration}, ${a2.fadeInAnimationDuration})`);
  await page.screenshot({ path: '/tmp/fc-audit/rm-on.png', fullPage: true });

  // ── A3: toggle off ──
  console.log('[A3] 關 reduced motion');
  await rmBtn.click();
  await page.waitForTimeout(500);
  const a3 = await page.evaluate(() => {
    const html = document.documentElement;
    const btns = document.querySelectorAll('.btn');
    const dur = btns[0] ? getComputedStyle(btns[0]).transitionDuration : null;
    return {
      hasDataRm: html.hasAttribute('data-rm'),
      btnTransitionDuration: dur,
      storage: localStorage.getItem('fc_rm_mode'),
    };
  });
  console.log(`  ${JSON.stringify(a3)}`);
  // transitionDuration 喺 toggle off 後應該係 '0.15s' / '0.2s' 之類正常值（> 0）
  const durVal = parseFloat(a3.btnTransitionDuration || '0');
  const a3Pass = !a3.hasDataRm && a3.storage === '0' && durVal > 0.01;
  console.log(`  ${a3Pass ? '✅' : '❌'} data-rm 移除, transition 還原 (${a3.btnTransitionDuration})`);

  // ── A4: reload 持久化 ──
  console.log('[A4] 持久化 — reload 後保留 RM state');
  await rmBtn.click(); // 再開返
  await page.waitForTimeout(300);
  await page.reload();
  await page.waitForTimeout(1500);
  const a4 = await page.evaluate(() => {
    const html = document.documentElement;
    return {
      hasDataRm: html.hasAttribute('data-rm'),
      storage: localStorage.getItem('fc_rm_mode'),
    };
  });
  console.log(`  ${JSON.stringify(a4)}`);
  const a4Pass = a4.hasDataRm && a4.storage === '1';
  console.log(`  ${a4Pass ? '✅' : '❌'} reload 後 RM mode 保留`);

  // 還原 — 關返 RM mode
  await page.evaluate(() => FC.chooseRole('student'));
  await page.waitForTimeout(500);
  await page.evaluate(() => FC.goSettings());
  await page.waitForTimeout(800);
  const rmBtn2 = await page.$('button.toggle[data-key="rm"]');
  if (rmBtn2 && rmBtn2.evaluate) {
    await rmBtn2.click();
  } else {
    // alternate path
    const onOff = await page.evaluate(() => {
      const b = document.querySelector('button.toggle[data-key="rm"]');
      if (b && b.classList.contains('on')) b.click();
      return b ? b.classList.contains('on') : null;
    });
    console.log('  rmBtn2 state after:', onOff);
  }
  await page.waitForTimeout(500);

  // ── B5: announceToSR 嘅 visual toast fallback ──
  console.log('[B5] announce toast 顯示');
  // 確保 toast element 未存在
  await page.evaluate(() => {
    const existing = document.getElementById('fc-announce-toast');
    if (existing) existing.remove();
  });
  // 觸發一次 announce（透過揀 scenario）
  await page.evaluate(() => FC.goGameHub());
  await page.waitForTimeout(500);
  await page.evaluate(() => FC.playGoodDeedBank());
  await page.waitForTimeout(800);
  const b5 = await page.evaluate(() => {
    const toast = document.getElementById('fc-announce-toast');
    return {
      exists: !!toast,
      role: toast?.getAttribute('role'),
      ariaLive: toast?.getAttribute('aria-live'),
      textContent: toast?.textContent || '',
      hasBankInText: toast?.textContent?.includes('銀行') || false,
      srAnnouncerText: document.getElementById('sr-announcer')?.textContent || '',
    };
  });
  console.log(`  ${JSON.stringify(b5)}`);
  const b5Pass = b5.exists && b5.role === 'status' && b5.ariaLive === 'polite' && b5.hasBankInText;
  console.log(`  ${b5Pass ? '✅' : '❌'} #fc-announce-toast 出現，包含「銀行」+ role=status`);
  await page.screenshot({ path: '/tmp/fc-audit/announce-toast.png', fullPage: true });

  // ── B6: toast textContent 同步 sr-announcer ──
  console.log('[B6] toast 同步 sr-announcer textContent');
  const b6Pass = b5.textContent === b5.srAnnouncerText;
  console.log(`  toast="${b5.textContent.slice(0, 30)}"`);
  console.log(`  sr   ="${b5.srAnnouncerText.slice(0, 30)}"`);
  console.log(`  ${b6Pass ? '✅' : '❌'} 兩個 region textContent 一致`);

  // ── B7: 2.5s 自動消失 ──
  console.log('[B7] toast 2.5s 自動消失');
  await page.waitForTimeout(3000);
  const b7 = await page.evaluate(() => {
    const toast = document.getElementById('fc-announce-toast');
    return {
      opacity: toast ? parseFloat(getComputedStyle(toast).opacity) : null,
      textEmpty: toast?.textContent === '',
    };
  });
  console.log(`  ${JSON.stringify(b7)}`);
  const b7Pass = b7.opacity === 0;
  console.log(`  ${b7Pass ? '✅' : '❌'} toast opacity = 0 (auto-dismiss)`);

  // ── B8: RM mode 下 toast 即時 show（無 fade） ──
  console.log('[B8] RM mode 下 toast 即時 show');
  await page.evaluate(() => {
    localStorage.setItem('fc_rm_mode', '1');
  });
  await page.reload();
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const existing = document.getElementById('fc-announce-toast');
    if (existing) existing.remove();
  });
  await page.evaluate(() => FC.chooseRole('student'));
  await page.waitForTimeout(500);
  await page.evaluate(() => FC.goGameHub());
  await page.waitForTimeout(500);
  await page.evaluate(() => FC.playGoodDeedBank());
  await page.waitForTimeout(200); // 即時 check，唔等 fade
  const b8 = await page.evaluate(() => {
    const toast = document.getElementById('fc-announce-toast');
    if (!toast) return { exists: false };
    return {
      exists: true,
      opacity: parseFloat(getComputedStyle(toast).opacity),
      transitionDuration: getComputedStyle(toast).transitionDuration,
      hasBankInText: toast.textContent.includes('銀行'),
    };
  });
  console.log(`  ${JSON.stringify(b8)}`);
  const b8Pass = b8.exists && b8.opacity === 1 &&
    // toast 嘅 transition 喺 RM block 內 explicit set 'none' → 0s
    parseFloat(b8.transitionDuration) <= 0.001 &&
    b8.hasBankInText;
  console.log(`  ${b8Pass ? '✅' : '❌'} RM mode toast opacity=1, transition ≤ 0.001ms (${b8.transitionDuration})`);

  await browser.close();

  const allPass = a1Pass && a2Pass && a3Pass && a4Pass && b5Pass && b6Pass && b7Pass && b8Pass;
  console.log('');
  console.log(`A1: ${a1Pass ? '✅' : '❌'}  A2: ${a2Pass ? '✅' : '❌'}  A3: ${a3Pass ? '✅' : '❌'}  A4: ${a4Pass ? '✅' : '❌'}`);
  console.log(`B5: ${b5Pass ? '✅' : '❌'}  B6: ${b6Pass ? '✅' : '❌'}  B7: ${b7Pass ? '✅' : '❌'}  B8: ${b8Pass ? '✅' : '❌'}`);
  console.log(allPass ? '✅ 全部通過' : '❌ 有失敗');
  process.exit(allPass ? 0 : 1);
}

run().catch(e => { console.error(e); process.exit(2); });
