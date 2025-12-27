const { chromium } = require('@playwright/test');

async function inspect() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Navigating to home page...');
  await page.goto('https://koinoniasms.com', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const url = page.url();
  console.log('Current URL:', url);

  const text = await page.textContent('body');
  console.log('\n=== PAGE TEXT (first 1500 chars) ===');
  console.log(text.substring(0, 1500));

  const buttons = await page.$$('button');
  console.log('\n=== ALL BUTTONS ===');
  for (let i = 0; i < buttons.length; i++) {
    const t = await buttons[i].textContent();
    const classes = await buttons[i].getAttribute('class');
    console.log(`Button ${i}: "${t.trim()}" (class: ${classes})`);
  }

  const links = await page.$$('a');
  console.log('\n=== ALL LINKS ===');
  for (let i = 0; i < links.length; i++) {
    const t = await links[i].textContent();
    const href = await links[i].getAttribute('href');
    console.log(`Link ${i}: "${t.trim()}" (href: ${href})`);
  }

  await page.screenshot({ path: '/tmp/home-page.png', fullPage: true });
  console.log('\nScreenshot saved to /tmp/home-page.png');

  await browser.close();
}

inspect().catch(console.error);
