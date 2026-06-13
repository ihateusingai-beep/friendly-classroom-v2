// Full user-flow a11y audit for friendly-classroom-v2
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'fs';

const BASE = 'http://127.0.0.1:4174/';
const OUT = '/tmp/fc-audit';

async function run() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const summary = { views: {} };

  async function scanView(name) {
    await page.waitForTimeout(800);
    console.log(`\n[scan] ${name}`);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();
    fs.writeFileSync(`${OUT}/axe-${name}.json`, JSON.stringify(results, null, 2));
    summary.views[name] = {
      url: page.url(),
      violations: results.violations.length,
      incomplete: results.incomplete.length,
      passes: results.passes.length,
      violations_detail: results.violations.map(v => ({
        id: v.id, impact: v.impact, help: v.help,
        nodeCount: v.nodes.length,
        firstTargets: v.nodes.slice(0, 5).map(n => n.target),
        firstSummary: n => n.failureSummary?.slice(0, 300),
      })),
      incomplete_detail: results.incomplete.slice(0, 5).map(i => ({
        id: i.id, help: i.help, nodeCount: i.nodes.length,
      })),
    };
    console.log(`  violations: ${results.violations.length} | incomplete: ${results.incomplete.length}`);
    for (const v of results.violations) {
      console.log(`    [${v.impact}] ${v.id} (${v.nodes.length} nodes) — ${v.help}`);
    }
  }

  async function clickByText(text, opts = {}) {
    const sel = opts.tag || 'button';
    const loc = page.locator(`${sel}:has-text("${text}")`).first();
    if (await loc.count() === 0) {
      console.log(`  [click] not found: ${sel} "${text}"`);
      return false;
    }
    await loc.click({ timeout: 2000 });
    return true;
  }

  // 1. Home (role select)
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // boot
  await scanView('1-home-roleselect');

  // 2. Student mode
  if (await clickByText('學生模式', { tag: 'div' })) await scanView('2-student-mode');
  if (await clickByText('選擇', { tag: 'div' })) await scanView('2a-student-pick');

  // back to home
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 3. Subject select
  if (await clickByText('學生模式', { tag: 'div' })) {
    await page.waitForTimeout(500);
    if (await clickByText('開始答題', { tag: 'button' })) await scanView('3-subjects');
    if (await clickByText('價值觀', { tag: 'div' })) await scanView('3a-topics');
  }

  // 4. Direct nav: settings
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  // try teacher mode
  if (await clickByText('老師', { tag: 'div' })) {
    await page.waitForTimeout(800);
    if (await clickByText('設定', { tag: 'button' })) await scanView('4-settings');
  }

  // 5. Modal: add student
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  if (await clickByText('學生模式', { tag: 'div' })) {
    await page.waitForTimeout(500);
    if (await clickByText('新增', { tag: 'button' })) await scanView('5-add-student-modal');
    // close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // 6. Keyboard: focus traversal on home
  console.log('\n[keyboard] Tab order on home...');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const focusables = [];
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return null;
      const r = a.getBoundingClientRect();
      const cs = getComputedStyle(a);
      return {
        tag: a.tagName,
        role: a.getAttribute('role') || '',
        text: (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 50),
        visible: r.width > 0 && r.height > 0,
        hasFocusIndicator: cs.outlineStyle !== 'none' || (cs.boxShadow && cs.boxShadow !== 'none'),
        outline: cs.outlineStyle,
        boxShadow: cs.boxShadow?.slice(0, 60) || '',
      };
    });
    if (info) focusables.push(info);
  }
  summary.keyboard = {
    focusablesCount: focusables.length,
    items: focusables,
    noFocusIndicator: focusables.filter(f => !f.hasFocusIndicator),
  };

  // 7. Skip-link test
  const hasSkipLink = await page.evaluate(() =>
    !!document.querySelector('a[href^="#"][class*="skip"], a.skip-link, a[href="#main"], a[href="#content"]')
  );
  summary.skipLink = hasSkipLink;

  // 8. Semantics overview
  summary.semantics = await page.evaluate(() => {
    const out = {};
    out.h1Count = document.querySelectorAll('h1').length;
    out.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => ({
      level: h.tagName, text: h.textContent?.trim().slice(0, 60),
    }));
    out.mainLandmark = document.querySelectorAll('main, [role="main"]').length;
    out.navLandmark = document.querySelectorAll('nav, [role="navigation"]').length;
    out.headerLandmark = document.querySelectorAll('header, [role="banner"]').length;
    out.allLandmarks = Array.from(document.querySelectorAll('main, nav, header, footer, aside, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]'))
      .map(l => ({ tag: l.tagName, role: l.getAttribute('role') || '', label: l.getAttribute('aria-label') || '' }));
    out.divsWithOnclick = document.querySelectorAll('div[onclick]').length;
    out.buttonsNoLabel = Array.from(document.querySelectorAll('button')).filter(b =>
      !b.textContent?.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')
    ).length;
    out.imgsTotal = document.querySelectorAll('img').length;
    out.imgsNoAlt = Array.from(document.querySelectorAll('img')).filter(i => i.alt === undefined).length;
    out.decorativeImgs = Array.from(document.querySelectorAll('img')).filter(i => i.alt === '').length;
    out.inputsNoLabel = Array.from(document.querySelectorAll('input,textarea,select')).filter(i => {
      if (i.type === 'hidden') return false;
      const id = i.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAria = i.getAttribute('aria-label') || i.getAttribute('aria-labelledby');
      return !hasLabel && !hasAria;
    }).length;
    out.liveRegions = Array.from(document.querySelectorAll('[aria-live]')).map(e => ({
      tag: e.tagName, value: e.getAttribute('aria-live'),
    }));
    return out;
  });

  fs.writeFileSync(`${OUT}/summary.json`, JSON.stringify(summary, null, 2));
  console.log('\n========== DONE ==========');
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
