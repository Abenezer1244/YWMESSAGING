const { chromium } = require('playwright');

async function testPage() {
  console.log('🚀 Starting simple test...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  page.on('console', msg => {
    const type = msg.type().toUpperCase();
    if (type === 'ERROR' || type === 'WARNING') {
      console.log(`[${type}] ${msg.text()}`);
    }
  });

  console.log('📍 Navigating to register page...');
  await page.goto('https://koinoniasms.com/register', { waitUntil: 'domcontentloaded' });

  console.log('⏳ Waiting 5 seconds for page to fully load...');
  await page.waitForTimeout(5000);

  console.log('📸 Taking screenshot of register page...');
  await page.screenshot({ path: 'test-register.png', fullPage: true });

  console.log('🔍 Checking page content...');
  const bodyText = await page.textContent('body');
  console.log('Page length:', bodyText.length, 'characters');

  // Try to find form elements
  const inputs = await page.locator('input').count();
  const buttons = await page.locator('button').count();
  console.log(`Found: ${inputs} input fields, ${buttons} buttons`);

  // List all input placeholders/labels
  const inputElements = await page.locator('input').all();
  for (let i = 0; i < Math.min(10, inputElements.length); i++) {
    const placeholder = await inputElements[i].getAttribute('placeholder');
    const type = await inputElements[i].getAttribute('type');
    const name = await inputElements[i].getAttribute('name');
    console.log(`  Input ${i}: type="${type}", name="${name}", placeholder="${placeholder}"`);
  }

  // Check for main content area
  const hasMainContent = await page.locator('main, [role="main"]').count() > 0;
  console.log(`Has main content area: ${hasMainContent}`);

  // Get page title
  const title = await page.title();
  console.log(`Page title: "${title}"`);

  // Check for errors in network
  console.log('\n🔍 Network analysis:');
  const response = await page.goto('https://api.koinoniasms.com/api/health', { waitUntil: 'networkidle' }).catch(e => {
    console.log(`Health check failed: ${e.message}`);
    return null;
  });

  if (response) {
    console.log(`API health check status: ${response.status()}`);
  }

  console.log('\n✅ Test complete');
  await browser.close();
}

testPage().catch(e => {
  console.error('Test failed:', e.message);
  process.exit(1);
});
