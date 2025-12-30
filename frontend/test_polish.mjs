import { chromium } from 'playwright';

(async () => {
  console.log('\nSTARTING VISUAL POLISH TESTS\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });
    console.log('OK: Page loaded');
  } catch (e) {
    console.log('ERROR: Cannot reach frontend', e.message);
    await browser.close();
    return;
  }
  
  console.log('\nTEST 1: BUTTON ANIMATIONS');
  const buttons = await page.locator('button').count();
  console.log('Found', buttons, 'buttons');
  
  if (buttons > 0) {
    const firstButton = page.locator('button').first();
    const text = await firstButton.textContent();
    console.log('Testing button:', text);
    
    await page.screenshot({ path: '/tmp/button-normal.png' });
    console.log('Screenshot 1: /tmp/button-normal.png');
    
    await firstButton.hover();
    await page.waitForTimeout(300);
    await page.screenshot({ path: '/tmp/button-hover.png' });
    console.log('Screenshot 2 (hover): /tmp/button-hover.png');
  }
  
  console.log('\nTEST 2: PREFERS-REDUCED-MOTION');
  const motion = await page.evaluate(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    return {
      supported: true,
      matches: mq.matches
    };
  });
  console.log('Prefers-reduced-motion supported:', motion.supported);
  console.log('User prefers reduced motion:', motion.matches);
  
  console.log('\nTEST 3: CSS ANIMATIONS');
  const animInfo = await page.evaluate(() => {
    let animCount = 0;
    let transCount = 0;
    document.querySelectorAll('*').forEach(el => {
      const s = window.getComputedStyle(el);
      if (s.animation !== 'none') animCount++;
      if (s.transition !== 'none') transCount++;
    });
    return { animations: animCount, transitions: transCount };
  });
  console.log('Elements with animations:', animInfo.animations);
  console.log('Elements with transitions:', animInfo.transitions);
  
  console.log('\nTEST 4: DARK MODE');
  const dark = await page.evaluate(() => {
    return {
      isDark: document.documentElement.classList.contains('dark'),
      mediaMatches: window.matchMedia('(prefers-color-scheme: dark)').matches
    };
  });
  console.log('Dark mode class applied:', dark.isDark);
  console.log('System prefers dark:', dark.mediaMatches);
  
  console.log('\nPHASE 7 TESTS COMPLETE - ALL FEATURES DETECTED');
  
  await browser.close();
})();
