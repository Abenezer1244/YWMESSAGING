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

  console.log('Account created, navigating to branches...');
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // Navigate directly to branches
  console.log('Navigating directly to branches page...');
  await page.goto('https://koinoniasms.com/dashboard/branches', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const url = page.url();
  console.log(`\nCurrent URL: ${url}`);

  const text = await page.textContent('body');
  console.log('\n=== BRANCHES PAGE TEXT (first 2500 chars) ===');
  console.log(text.substring(0, 2500));

  const buttons = await page.$$('button');
  console.log('\n=== ALL BUTTONS (showing first 20) ===');
  for (let i = 0; i < Math.min(20, buttons.length); i++) {
    const t = await buttons[i].textContent();
    console.log(`Button ${i}: "${t.trim()}"`);
  }

  const inputs = await page.$$('input');
  console.log('\n=== ALL INPUT FIELDS ===');
  for (let i = 0; i < inputs.length; i++) {
    const type = await inputs[i].getAttribute('type');
    const name = await inputs[i].getAttribute('name');
    const placeholder = await inputs[i].getAttribute('placeholder');
    console.log(`Input ${i}: type="${type}" name="${name}" placeholder="${placeholder}"`);
  }

  // Look for "Create Branch" button or similar
  const createBranchBtn = await page.$('button:has-text("Create Branch")');
  const createBtn = await page.$('button:has-text("Create")');
  const addBtn = await page.$('button:has-text("Add Branch")');
  console.log(`\nCreate Branch button: ${createBranchBtn ? 'Found' : 'Not found'}`);
  console.log(`Create button: ${createBtn ? 'Found' : 'Not found'}`);
  console.log(`Add Branch button: ${addBtn ? 'Found' : 'Not found'}`);

  await page.screenshot({ path: '/tmp/branches-simple.png', fullPage: true });
  console.log('\n✅ Screenshot saved');

  await browser.close();
}

inspect().catch(console.error);
