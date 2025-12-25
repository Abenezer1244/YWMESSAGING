const { chromium } = require('playwright');

async function quickTest() {
  console.log('\n🔍 Quick Login Page Structure Check\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle', timeout: 15000 });

    console.log('✓ Login page loaded\n');

    // Wait for React to fully render
    await page.waitForTimeout(3000);

    console.log('Checking inputs on page...');
    const allInputs = await page.locator('input').all();
    console.log(`Total inputs found: ${allInputs.length}\n`);

    for (let i = 0; i < Math.min(10, allInputs.length); i++) {
      const type = await allInputs[i].getAttribute('type');
      const name = await allInputs[i].getAttribute('name');
      const id = await allInputs[i].getAttribute('id');
      const placeholder = await allInputs[i].getAttribute('placeholder');
      const isVisible = await allInputs[i].isVisible().catch(() => false);

      console.log(`Input ${i + 1}:`);
      console.log(`  type: ${type}`);
      console.log(`  name: ${name}`);
      console.log(`  id: ${id}`);
      console.log(`  placeholder: ${placeholder}`);
      console.log(`  visible: ${isVisible}\n`);
    }

    // Check for buttons
    console.log('\nButtons on page:');
    const buttons = await page.locator('button').all();
    console.log(`Total buttons: ${buttons.length}\n`);

    for (let i = 0; i < Math.min(5, buttons.length); i++) {
      const text = await buttons[i].textContent();
      const type = await buttons[i].getAttribute('type');
      const isVisible = await buttons[i].isVisible().catch(() => false);
      console.log(`Button ${i + 1}: "${text.trim()}" (type: ${type}, visible: ${isVisible})`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

quickTest();
