const { chromium } = require('playwright');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function debugPageElements() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                   PAGE ELEMENT DEBUG                            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Login
    console.log('[STEP 1] Logging in...');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });

    const isLoggedIn = page.url().includes('dashboard');
    console.log(`Logged in: ${isLoggedIn ? '✅ YES' : '❌ NO'}`);
    console.log(`Current URL: ${page.url()}`);

    await page.waitForTimeout(2000);

    // Navigate to branches by clicking the menu
    console.log('\n[STEP 2] Navigating to branches page by clicking menu...');
    const branchesMenuBtn = await page.locator('button:has-text("Branches")').first();
    if (branchesMenuBtn) {
      await branchesMenuBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);
    }
    console.log(`Current URL: ${page.url()}`);

    // List all buttons on the page
    console.log('\n[STEP 3] All buttons on page:');
    const buttons = await page.locator('button').all();
    console.log(`Total buttons found: ${buttons.length}\n`);

    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const visible = await buttons[i].isVisible();
      console.log(`  Button ${i + 1}: "${text?.trim()}" (visible: ${visible})`);
    }

    // Check for specific button
    console.log('\n[STEP 4] Checking for specific buttons:');
    const newBranchBtn = await page.locator('button:has-text("New Branch")').count();
    console.log(`  "New Branch" buttons found: ${newBranchBtn}`);

    const createFirstBtn = await page.locator('button:has-text("Create Your First Branch")').count();
    console.log(`  "Create Your First Branch" buttons found: ${createFirstBtn}`);

    // Check for create button in general
    const createBtn = await page.locator('button:has-text("Create")').count();
    console.log(`  "Create" buttons found: ${createBtn}`);

    // Try searching by role
    console.log('\n[STEP 5] Searching by role:');
    const primaryButtons = await page.locator('button[variant="primary"]').count();
    console.log(`  Primary buttons found: ${primaryButtons}`);

    // Get all visible text on page
    console.log('\n[STEP 6] Page content (first 1000 chars):');
    const allText = await page.evaluate(() => {
      return document.body.innerText;
    });
    console.log(allText.substring(0, 1000));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

debugPageElements();
