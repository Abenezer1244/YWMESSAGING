const { chromium } = require('playwright');

async function debugDashboard() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const consoleLogs = [];
  const networkRequests = [];

  // Capture console messages
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  // Capture network requests
  page.on('response', response => {
    networkRequests.push({
      url: response.url(),
      status: response.status(),
      method: response.request().method()
    });
  });

  try {
    console.log('\n🔍 DEBUGGING DASHBOARD LOADING ISSUE\n');
    console.log('=' .repeat(80));

    console.log('\n1. Navigating to dashboard directly...');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000);

    console.log('\n2. Checking page title and content...');
    const title = await page.title();
    console.log(`   Page Title: ${title}`);

    const heading = await page.locator('h1').first().textContent().catch(() => 'Not found');
    console.log(`   Main Heading: ${heading}`);

    console.log('\n3. Checking if page is still loading...');
    const loader = await page.locator('svg').first().isVisible().catch(() => false);
    console.log(`   Loading spinner visible: ${loader}`);

    console.log('\n4. Console Messages (last 20):');
    consoleLogs.slice(-20).forEach(log => {
      if (log.type === 'error' || log.type === 'warn' || log.text.includes('Failed') || log.text.includes('Error')) {
        console.log(`   [${log.type.toUpperCase()}] ${log.text}`);
      }
    });

    console.log('\n5. Network Requests (last 10):');
    networkRequests.slice(-10).forEach(req => {
      if (req.status >= 400) {
        console.log(`   [${req.status}] ${req.method} ${req.url}`);
      }
    });

    console.log('\n6. Error Summary:');
    const errors = consoleLogs.filter(l => l.type === 'error');
    const failedRequests = networkRequests.filter(r => r.status >= 400);
    console.log(`   Console Errors: ${errors.length}`);
    console.log(`   Failed Network Requests: ${failedRequests.length}`);

    if (errors.length > 0) {
      console.log('\n   Error Details:');
      errors.forEach(e => {
        console.log(`   - ${e.text.substring(0, 100)}`);
      });
    }

    if (failedRequests.length > 0) {
      console.log('\n   Failed Requests:');
      failedRequests.forEach(r => {
        console.log(`   - [${r.status}] ${r.method} ${r.url}`);
      });
    }

    console.log('\n7. Attempting to click on sidebar navigation...');
    const sidebarLink = await page.locator('a').first().isVisible().catch(() => false);
    console.log(`   Sidebar link visible: ${sidebarLink}`);

    if (sidebarLink) {
      await page.locator('a').first().click();
      await page.waitForTimeout(2000);
      const newUrl = page.url();
      console.log(`   Navigated to: ${newUrl}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✨ DEBUG COMPLETE\n');

  } catch (error) {
    console.error('\n❌ Debug script error:', error.message);
  } finally {
    await browser.close();
  }
}

debugDashboard().catch(console.error);
