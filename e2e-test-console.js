const { chromium } = require('playwright');

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const baseUrl = 'http://localhost:5173';
  const allMessages = [];

  // Capture ALL console messages
  page.on('console', msg => {
    allMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  try {
    console.log('\n🔍 CHECKING CONSOLE MESSAGES\n');
    console.log('=' .repeat(80));

    await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    console.log('\n1. Initial page load - messages so far:');
    allMessages.forEach(msg => {
      if (msg.type !== 'log' || msg.text.includes('Form errors')) {
        console.log(`   [${msg.type.toUpperCase()}] ${msg.text}`);
      }
    });

    const initialCount = allMessages.length;

    console.log('\n2. Filling form fields...');
    const firstNameInput = page.locator('input[placeholder="John"]');
    await firstNameInput.type('John', { delay: 20 });
    await page.waitForTimeout(200);

    console.log(`\n3. New console messages after typing (${allMessages.length - initialCount} new):`);
    allMessages.slice(initialCount).forEach(msg => {
      console.log(`   [${msg.type.toUpperCase()}] ${msg.text}`);
    });

    const afterTypingCount = allMessages.length;

    console.log('\n4. Blurring field...');
    await firstNameInput.blur();
    await page.waitForTimeout(300);

    console.log(`\n5. New console messages after blur (${allMessages.length - afterTypingCount} new):`);
    allMessages.slice(afterTypingCount).forEach(msg => {
      console.log(`   [${msg.type.toUpperCase()}] ${msg.text}`);
    });

    // Log all unique errors
    const errors = allMessages.filter(m => m.type === 'error');
    console.log(`\n6. All console errors (${errors.length} total):`);
    errors.forEach(err => {
      console.log(`   ${err.text}`);
    });

    console.log('\n7. Form errors log messages (looking for "Form errors:")');
    const formErrorLogs = allMessages.filter(m => m.text.includes('Form errors'));
    if (formErrorLogs.length > 0) {
      formErrorLogs.forEach(log => {
        console.log(`   ${log.text}`);
      });
    } else {
      console.log('   ❌ NO "Form errors:" messages found');
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✨ CONSOLE CHECK COMPLETE\n');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);
