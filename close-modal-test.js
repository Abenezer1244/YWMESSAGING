const { chromium } = require('playwright');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function testCloseModal() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║              CLOSE MODAL TEST                                   ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Login
    console.log('[STEP 1] Logging in...');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
    console.log(`✅ Logged in. URL: ${page.url()}`);

    await page.waitForTimeout(2000);

    // Check for overlay/modal
    console.log('\n[STEP 2] Checking for modal...');
    const overlay = await page.locator('div.bg-black.bg-opacity-50, [role="dialog"]').first();
    const overlayCount = await page.locator('div.fixed.inset-0').count();
    console.log(`Modal overlays found: ${overlayCount}`);

    // Try to close modal by pressing Escape
    console.log('\n[STEP 3] Trying to close modal with Escape key...');
    await page.press('body', 'Escape');
    await page.waitForTimeout(500);

    // Check if overlay is still there
    const overlayCount2 = await page.locator('div.fixed.inset-0').count();
    console.log(`Modal overlays after Escape: ${overlayCount2}`);

    // Look for close button
    console.log('\n[STEP 4] Looking for close button...');
    const closeBtn = await page.locator('button[aria-label="Close"], button:has-text("×"), [role="button"][aria-label="Close dialog"]').first();
    const closeBtnCount = await closeBtn.count().then(() => 1).catch(() => 0);
    console.log(`Close buttons found: ${closeBtnCount}`);

    if (closeBtnCount > 0) {
      console.log('Clicking close button...');
      await closeBtn.click();
      await page.waitForTimeout(500);
    }

    // Try navigating to branches
    console.log('\n[STEP 5] Trying to navigate to branches...');
    const branchesBtn = await page.locator('button:has-text("Branches")').first();
    console.log(`Branches button found: ${await branchesBtn.count().then(() => true).catch(() => false)}`);

    if (branchesBtn) {
      await branchesBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
      console.log(`✅ Navigated to: ${page.url()}`);
    }

    // Check page content
    console.log('\n[STEP 6] Page content check...');
    const text = await page.evaluate(() => document.body.innerText);
    if (text.includes('Branches') || text.includes('New Branch')) {
      console.log('✅ Page loaded successfully');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

testCloseModal();
