const { chromium } = require('playwright');

async function traceButtonClick() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n🔍 TRACE: Button Click & State Change\n');

    // Navigate and setup
    const loginRes = await page.request.post('https://api.koinoniasms.com/api/auth/login', {
      data: {
        email: 'DOKaA@GMAIL.COM',
        password: '12!Michael'
      }
    });

    await page.goto('https://koinoniasms.com/dashboard', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    // Close modals
    for (let i = 0; i < 5; i++) {
      try { await page.press('body', 'Escape'); } catch (e) {}
      await page.waitForTimeout(100);
    }

    // Go to Members
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(2000);

    console.log('[1] Looking for "Add Member" button...');
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map((btn, idx) => ({
        idx,
        text: btn.textContent.trim().substring(0, 30),
        visible: btn.offsetParent !== null,
        disabled: btn.disabled
      }));
    });

    const addMemberBtn = buttons.find(b => b.text.includes('Add Member'));
    console.log('  Buttons found: ' + buttons.length);
    if (addMemberBtn) {
      console.log('  "Add Member" button: FOUND at index ' + addMemberBtn.idx);
      console.log('    Visible: ' + (addMemberBtn.visible ? '✅' : '❌'));
      console.log('    Disabled: ' + (addMemberBtn.disabled ? '❌' : '✅'));
    } else {
      console.log('  "Add Member" button: NOT FOUND');
    }
    console.log('');

    // Check initial modal state
    console.log('[2] Initial modal state (before click):');
    let beforeClick = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      const formInputs = document.querySelectorAll('input[name="firstName"]');

      return {
        modalDiv: !!modal,
        modalVisible: modal ? modal.offsetParent !== null : false,
        formInputs: formInputs.length,
        formVisible: formInputs.length > 0 ? formInputs[0].offsetParent !== null : false
      };
    });

    console.log('  Modal div exists: ' + (beforeClick.modalDiv ? '✅' : '❌'));
    console.log('  Modal visible: ' + (beforeClick.modalVisible ? '✅' : '❌'));
    console.log('  Form inputs exist: ' + (beforeClick.formInputs ? '✅' : '❌'));
    console.log('  Form visible: ' + (beforeClick.formVisible ? '✅' : '❌'));
    console.log('');

    // Monitor network and DOM changes during click
    console.log('[3] Clicking "Add Member" button...');

    // Set up to listen for DOM changes
    let mutationCount = 0;
    await page.evaluate(() => {
      window.mutationCount = 0;
      const observer = new MutationObserver(() => {
        window.mutationCount++;
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });

    const clickTime = Date.now();
    await page.click('button:has-text("Add Member")');
    const clickDuration = Date.now() - clickTime;

    console.log('  Click completed in ' + clickDuration + 'ms');
    console.log('');

    // Check state immediately after click
    console.log('[4] Modal state immediately after click:');
    await page.waitForTimeout(500); // Quick wait

    let afterClick = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      const backdrop = document.querySelector('.fixed.inset-0.bg-black');
      const formInputs = document.querySelectorAll('input[name="firstName"]');

      // Also check for any visible overlay
      const overlays = Array.from(document.querySelectorAll('.fixed')).filter(el =>
        el.offsetParent !== null && el.style.zIndex >= 50
      );

      return {
        modalDiv: !!modal,
        modalVisible: modal ? modal.offsetParent !== null : false,
        backdropVisible: backdrop ? backdrop.offsetParent !== null : false,
        formInputs: formInputs.length,
        formVisible: formInputs.length > 0 ? formInputs[0].offsetParent !== null : false,
        visibleOverlays: overlays.length,
        modalHTML: modal ? modal.innerHTML.substring(0, 100) : 'N/A'
      };
    });

    console.log('  Modal div exists: ' + (afterClick.modalDiv ? '✅' : '❌'));
    console.log('  Modal visible (offsetParent): ' + (afterClick.modalVisible ? '✅' : '❌'));
    console.log('  Backdrop visible: ' + (afterClick.backdropVisible ? '✅' : '❌'));
    console.log('  Form inputs exist: ' + (afterClick.formInputs ? '✅' : '❌'));
    console.log('  Form visible: ' + (afterClick.formVisible ? '✅' : '❌'));
    console.log('  Visible overlays (z-index 50+): ' + afterClick.visibleOverlays);
    console.log('');

    // Try to fill form
    console.log('[5] Testing form interaction:');
    try {
      const locator = page.locator('input[name="firstName"]');
      const isVisible = await locator.isVisible();
      console.log('  Form visible via Playwright: ' + (isVisible ? '✅' : '❌'));

      if (isVisible) {
        await locator.fill('TestName');
        const value = await locator.inputValue();
        console.log('  Form accepts input: ✅ (value: ' + value + ')');
      } else {
        console.log('  Form NOT visible via Playwright, but trying fill anyway...');
        try {
          await page.fill('input[name="firstName"]', 'TestName');
          console.log('  Fill succeeded anyway: ⚠️');
        } catch (e) {
          console.log('  Fill failed: ' + e.message);
        }
      }
    } catch (e) {
      console.log('  Error checking form: ' + e.message);
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Button click works: ' + (clickDuration < 500 ? '✅' : '❌'));
    console.log('Modal appears after click: ' + (afterClick.modalDiv ? '✅' : '❌'));
    console.log('Modal is visible: ' + (afterClick.modalVisible ? '✅' : '❌'));
    console.log('Form is accessible: ' + (afterClick.formInputs > 0 ? '✅' : '❌'));
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

traceButtonClick();
