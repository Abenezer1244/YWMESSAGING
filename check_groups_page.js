const { chromium } = require('playwright');

async function checkGroupsPage() {
  console.log('\n🔍 Checking Groups Page Content\n');

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // Login
    console.log('📍 Step 1: Login');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.locator('input[name="email"]').fill('michaelbeki99@gmail.com');
    await page.locator('input[name="password"]').fill('12!Michael');
    await page.locator('button:has-text("Login")').click();
    await page.waitForURL('https://koinoniasms.com/dashboard*', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Logged in\n');

    // Navigate to Branches
    console.log('📍 Step 2: Navigate to Branches');
    await page.goto('https://koinoniasms.com/dashboard/branches', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot of branches page
    await page.screenshot({ path: 'page_branches.png', fullPage: true });
    console.log('📸 Screenshot: page_branches.png\n');

    // Check what's on the page
    const pageContent = await page.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll('h1, h2')).map(h => h.textContent?.trim());
      const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean);
      const allText = document.body.innerText.substring(0, 500);

      return {
        headings: h1s.slice(0, 10),
        buttons: buttons.slice(0, 15),
        firstText: allText,
        url: window.location.href
      };
    });

    console.log('Page Content:');
    console.log(`  URL: ${pageContent.url}`);
    console.log(`  Headings: ${pageContent.headings.join(', ')}`);
    console.log(`  Buttons: ${pageContent.buttons.slice(0, 10).join(', ')}`);
    console.log(`  Text preview: ${pageContent.firstText.substring(0, 200)}...\n`);

    // Try to find a branch and click it
    console.log('📍 Step 3: Look for branches');
    const branchLinks = page.locator('a, button, [role="button"]').filter({ hasText: /branch|Branch/i });
    const branchCount = await branchLinks.count();
    console.log(`Found ${branchCount} potential branch elements\n`);

    if (branchCount > 0) {
      console.log('📍 Step 4: Click first branch');
      const firstBranch = branchLinks.first();
      const text = await firstBranch.textContent();
      console.log(`Clicking: "${text}"\n`);

      await firstBranch.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Take screenshot of groups page
      await page.screenshot({ path: 'page_groups.png', fullPage: true });
      console.log('📸 Screenshot: page_groups.png\n');

      // Check groups content
      const groupsContent = await page.evaluate(() => {
        const h1s = Array.from(document.querySelectorAll('h1, h2')).map(h => h.textContent?.trim());
        const groupCards = Array.from(document.querySelectorAll('[class*="card"], [class*="item"]'));
        const allButtons = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean);
        const bodyText = document.body.innerText.substring(0, 800);

        return {
          headings: h1s,
          cardCount: groupCards.length,
          buttonCount: allButtons.length,
          buttons: allButtons.slice(0, 20),
          text: bodyText,
          url: window.location.href
        };
      });

      console.log('Groups Page Content:');
      console.log(`  URL: ${groupsContent.url}`);
      console.log(`  Headings: ${groupsContent.headings.join(', ')}`);
      console.log(`  Card elements: ${groupsContent.cardCount}`);
      console.log(`  Total buttons: ${groupsContent.buttonCount}`);
      console.log(`  Button texts: ${groupsContent.buttons.join(', ')}\n`);
      console.log(`  Page text preview:\n${groupsContent.text}\n`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await context.close();
    await browser.close();
  }
}

checkGroupsPage();
