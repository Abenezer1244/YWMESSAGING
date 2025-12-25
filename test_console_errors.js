const { chromium } = require('playwright');

const TEST_EMAIL = `console-${Date.now()}@koinoniasms.com`;
const TEST_PASSWORD = 'ConsoleTest123!';

class ConsoleErrorTest {
  constructor() {
    this.consoleMessages = [];
  }

  async runTest() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔍 CONSOLE ERROR CAPTURE TEST');
    console.log('═══════════════════════════════════════════════════════\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Capture all console messages
    page.on('console', (msg) => {
      this.consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
      });

      // Print in real-time
      const emoji = msg.type() === 'error' ? '❌' : msg.type() === 'warn' ? '⚠️' : 'ℹ️';
      console.log(`${emoji} [${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    try {
      // REGISTER
      console.log('\n=== REGISTERING ===\n');
      await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);

      await page.fill('input[name="firstName"]', 'Console');
      await page.fill('input[name="lastName"]', 'Test');
      await page.fill('input[name="churchName"]', 'Console Test Church');
      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

      await Promise.all([
        page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        page.click('button[type="submit"]'),
      ]);

      console.log('\n✅ Registration complete\n');
      await page.waitForTimeout(2000);

      // CLEAR & NAVIGATE TO LOGIN
      console.log('=== NAVIGATING TO LOGIN ===\n');
      await context.clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.goto('https://koinoniasms.com/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      console.log('✅ On login page\n');

      // LOGIN
      console.log('=== ATTEMPTING LOGIN ===\n');
      console.log(`Email: ${TEST_EMAIL}`);
      console.log(`Password: ${TEST_PASSWORD}\n`);

      await page.waitForSelector('input[name="email"]', { timeout: 10000 });

      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);

      console.log('📝 Form filled, clicking submit...\n');

      // Add a click listener to debug
      await page.evaluate(() => {
        const btn = document.querySelector('button[type="submit"]');
        if (btn) {
          const originalClick = btn.onclick;
          btn.onclick = function(e) {
            console.log('Button clicked!');
            return originalClick?.call(this, e);
          };
        }
      });

      await page.click('button[type="submit"]');

      // Wait for any response or error
      await page.waitForTimeout(5000);

      console.log('\n=== CONSOLE MESSAGES SUMMARY ===\n');

      const errors = this.consoleMessages.filter((m) => m.type === 'error');
      const warnings = this.consoleMessages.filter((m) => m.type === 'warn');

      console.log(`Total messages: ${this.consoleMessages.length}`);
      console.log(`Errors: ${errors.length}`);
      console.log(`Warnings: ${warnings.length}`);

      if (errors.length > 0) {
        console.log('\n❌ ERRORS FOUND:');
        errors.forEach((err, i) => {
          console.log(`\n${i + 1}. ${err.text}`);
          if (err.location) {
            console.log(`   at ${err.location.url}:${err.location.lineNumber}`);
          }
        });
      } else {
        console.log('\n✅ No errors in console');
      }

    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
    } finally {
      await browser.close();
    }
  }
}

const test = new ConsoleErrorTest();
test.runTest().catch(console.error);
