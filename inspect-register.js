const { chromium } = require('@playwright/test');

async function inspect() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Navigating to register page...');
  await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const text = await page.textContent('body');
  console.log('\n=== REGISTRATION FORM TEXT (first 1500 chars) ===');
  console.log(text.substring(0, 1500));

  const inputs = await page.$$('input');
  console.log('\n=== ALL INPUT FIELDS ===');
  for (let i = 0; i < inputs.length; i++) {
    const placeholder = await inputs[i].getAttribute('placeholder');
    const name = await inputs[i].getAttribute('name');
    const type = await inputs[i].getAttribute('type');
    const id = await inputs[i].getAttribute('id');
    console.log(`Input ${i}:
      - type: ${type}
      - placeholder: ${placeholder}
      - name: ${name}
      - id: ${id}`);
  }

  const labels = await page.$$('label');
  console.log('\n=== ALL LABELS ===');
  for (let i = 0; i < Math.min(10, labels.length); i++) {
    const text = await labels[i].textContent();
    const htmlFor = await labels[i].getAttribute('for');
    console.log(`Label ${i}: "${text.trim()}" (for: ${htmlFor})`);
  }

  const buttons = await page.$$('button');
  console.log('\n=== BUTTONS ===');
  for (let i = 0; i < buttons.length; i++) {
    const t = await buttons[i].textContent();
    console.log(`Button ${i}: "${t.trim()}"`);
  }

  await page.screenshot({ path: '/tmp/register-page.png', fullPage: true });
  console.log('\nScreenshot saved');

  await browser.close();
}

inspect().catch(console.error);
