const { chromium } = require('@playwright/test');

async function inspect() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Navigating to login page...');
  await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const text = await page.textContent('body');
  console.log('\n=== LOGIN PAGE TEXT (first 1500 chars) ===');
  console.log(text.substring(0, 1500));

  const inputs = await page.$$('input');
  console.log('\n=== ALL INPUT FIELDS ===');
  for (let i = 0; i < inputs.length; i++) {
    const placeholder = await inputs[i].getAttribute('placeholder');
    const name = await inputs[i].getAttribute('name');
    const type = await inputs[i].getAttribute('type');
    console.log(`Input ${i}: type="${type}" name="${name}" placeholder="${placeholder}"`);
  }

  const buttons = await page.$$('button');
  console.log('\n=== BUTTONS ===');
  for (let i = 0; i < buttons.length; i++) {
    const t = await buttons[i].textContent();
    const type = await buttons[i].getAttribute('type');
    console.log(`Button ${i}: "${t.trim()}" (type: ${type})`);
  }

  const links = await page.$$('a');
  console.log('\n=== LINKS ===');
  for (let i = 0; i < links.length; i++) {
    const t = await links[i].textContent();
    const href = await links[i].getAttribute('href');
    console.log(`Link ${i}: "${t.trim()}" (href: ${href})`);
  }

  await page.screenshot({ path: '/tmp/login-page.png', fullPage: true });
  console.log('\nScreenshot saved');

  await browser.close();
}

inspect().catch(console.error);
