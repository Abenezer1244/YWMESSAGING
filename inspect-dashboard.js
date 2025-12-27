const { chromium } = require('@playwright/test');

async function inspect() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Signing up...');
  const email = `test${Date.now()}@test-e2e.com`;
  const password = 'TestPassword123!';

  // Go to register
  await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Fill form
  await page.fill('input[name="firstName"]', 'Test');
  await page.fill('input[name="lastName"]', 'User');
  await page.fill('input[name="churchName"]', `Church${Date.now()}`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);

  // Submit
  await page.click('button:has-text("Create Account")');
  await page.waitForTimeout(3000);

  console.log('Account created, waiting for dashboard...');
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  const url = page.url();
  console.log(`\nCurrent URL: ${url}`);

  const text = await page.textContent('body');
  console.log('\n=== DASHBOARD TEXT (first 2500 chars) ===');
  console.log(text.substring(0, 2500));

  const links = await page.$$('a');
  console.log('\n=== ALL LINKS ===');
  for (let i = 0; i < Math.min(20, links.length); i++) {
    const t = await links[i].textContent();
    const href = await links[i].getAttribute('href');
    console.log(`Link ${i}: "${t.trim()}" (href: ${href})`);
  }

  const buttons = await page.$$('button');
  console.log('\n=== FIRST 15 BUTTONS ===');
  for (let i = 0; i < Math.min(15, buttons.length); i++) {
    const t = await buttons[i].textContent();
    const classes = await buttons[i].getAttribute('class');
    console.log(`Button ${i}: "${t.trim()}" (class snippet: ${classes ? classes.substring(0, 50) : 'none'})`);
  }

  await page.screenshot({ path: '/tmp/dashboard-page.png', fullPage: true });
  console.log('\n✅ Screenshot saved to /tmp/dashboard-page.png');

  await browser.close();
}

inspect().catch(console.error);
