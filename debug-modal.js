const { chromium } = require('playwright');

async function debugModal() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     Debug: Add Member Modal State and Form Elements            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Login
    console.log('[LOGIN] Authenticating...');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
    console.log('✅ Logged in\n');

    await page.waitForTimeout(2000);

    // Close modals
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next'));
      if (btn) btn.click();
    });
    await page.waitForTimeout(1500);

    for (let i = 0; i < 3; i++) {
      await page.press('body', 'Escape');
      await page.waitForTimeout(300);
    }

    // Go to Members
    console.log('[NAVIGATE] Going to Members page...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Check if Add Member button exists
    console.log('[CHECK] Looking for Add Member button...');
    const hasButton = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      return !!btn;
    });
    console.log('Button exists: ' + (hasButton ? '✅ YES' : '❌ NO'));

    if (!hasButton) {
      console.log('\n❌ ERROR: Add Member button not found!');
      const allButtons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim());
      });
      console.log('Available buttons:', allButtons);
      return;
    }

    // Click Add Member button
    console.log('\n[CLICK] Clicking Add Member button...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });

    await page.waitForTimeout(1500);

    // Check modal state
    console.log('[CHECK] Modal after click...');
    const modalState = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      const inputs = {
        firstName: document.querySelector('input[name="firstName"]'),
        lastName: document.querySelector('input[name="lastName"]'),
        phone: document.querySelector('input[name="phone"]'),
        submitBtn: Array.from(document.querySelectorAll('button[type="submit"]')).find(b =>
          b.textContent.includes('Add Member')
        )
      };

      return {
        modalExists: !!modal,
        modalVisible: modal ? modal.offsetHeight > 0 : false,
        firstNameInput: !!inputs.firstName,
        lastNameInput: !!inputs.lastName,
        phoneInput: !!inputs.phone,
        submitButton: !!inputs.submitBtn,
        firstNameValue: inputs.firstName?.value || '',
        firstNameDisabled: inputs.firstName?.disabled || false
      };
    });

    console.log('Modal state:');
    console.log('  Modal exists: ' + (modalState.modalExists ? '✅ YES' : '❌ NO'));
    console.log('  Modal visible: ' + (modalState.modalVisible ? '✅ YES' : '❌ NO'));
    console.log('  FirstName input: ' + (modalState.firstNameInput ? '✅ YES' : '❌ NO'));
    console.log('  LastName input: ' + (modalState.lastNameInput ? '✅ YES' : '❌ NO'));
    console.log('  Phone input: ' + (modalState.phoneInput ? '✅ YES' : '❌ NO'));
    console.log('  Submit button: ' + (modalState.submitButton ? '✅ YES' : '❌ NO'));
    console.log('  FirstName disabled: ' + (modalState.firstNameDisabled ? '🟡 YES' : '❌ NO'));

    if (!modalState.firstNameInput) {
      console.log('\n⚠️ WARNING: Form inputs not found!');
      const allInputs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input')).map(inp => ({
          name: inp.name,
          type: inp.type,
          value: inp.value
        }));
      });
      console.log('All inputs:', allInputs);
      return;
    }

    // Try to fill the form
    console.log('\n[FILL] Filling form...');
    await page.fill('input[name="firstName"]', 'TestFirst');
    await page.waitForTimeout(300);
    await page.fill('input[name="lastName"]', 'TestLast');
    await page.waitForTimeout(300);
    await page.fill('input[name="phone"]', '5551234567');
    await page.waitForTimeout(300);

    const filledState = await page.evaluate(() => {
      return {
        firstName: document.querySelector('input[name="firstName"]')?.value,
        lastName: document.querySelector('input[name="lastName"]')?.value,
        phone: document.querySelector('input[name="phone"]')?.value
      };
    });

    console.log('Form filled:');
    console.log('  FirstName: ' + (filledState.firstName === 'TestFirst' ? '✅ ' + filledState.firstName : '❌ ' + filledState.firstName));
    console.log('  LastName: ' + (filledState.lastName === 'TestLast' ? '✅ ' + filledState.lastName : '❌ ' + filledState.lastName));
    console.log('  Phone: ' + (filledState.phone === '5551234567' ? '✅ ' + filledState.phone : '❌ ' + filledState.phone));

    // Try to click submit
    console.log('\n[SUBMIT] Looking for submit button...');
    const submitBtn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b =>
        b.textContent.includes('Add Member')
      );
      return {
        found: !!btn,
        text: btn?.textContent || 'N/A',
        disabled: btn?.disabled || false
      };
    });

    console.log('Submit button:');
    console.log('  Found: ' + (submitBtn.found ? '✅ YES' : '❌ NO'));
    console.log('  Text: ' + submitBtn.text);
    console.log('  Disabled: ' + (submitBtn.disabled ? '🟡 YES - FORM DISABLED!' : '❌ NO'));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugModal();
