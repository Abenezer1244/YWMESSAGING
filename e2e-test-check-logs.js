const { chromium } = require('playwright');

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const baseUrl = 'http://localhost:5173';
  const consoleLogs = [];

  // Capture ALL console messages
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  try {
    console.log('\n🔍 CHECKING VALIDATION CONSOLE LOGS\n');
    console.log('=' .repeat(80));

    await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log(`\n1. Initial console logs (${consoleLogs.length} total):`);
    consoleLogs.forEach(log => {
      if (log.text.includes('validate') || log.text.includes('watchedValues')) {
        console.log(`   [${log.type}] ${log.text}`);
      }
    });

    const initialCount = consoleLogs.length;

    console.log('\n2. Typing invalid password...');
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.type('password123', { delay: 30 });
    await page.waitForTimeout(1000);

    console.log(`\n3. New console logs after typing (${consoleLogs.length - initialCount} new):`);
    consoleLogs.slice(initialCount).forEach(log => {
      console.log(`   [${log.type}] ${log.text}`);
    });

    const validateLogs = consoleLogs.filter(l => l.text.includes('validateField'));
    const watchLogs = consoleLogs.filter(l => l.text.includes('watchedValues'));

    console.log(`\n4. Summary:`);
    console.log(`   validateField calls: ${validateLogs.length}`);
    console.log(`   watchedValues changes: ${watchLogs.length}`);

    console.log('\n' + '='.repeat(80));
    console.log('\n✨ TEST COMPLETE\n');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
