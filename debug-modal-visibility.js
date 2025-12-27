const { chromium } = require('playwright');

async function debugModalVisibility() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n🔍 DEBUG: Modal Visibility Issue\n');

    // Login via API for speed
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
    console.log('[1] Navigating to Members...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(2000);

    // Inspect DOM before clicking
    console.log('[2] DOM before clicking Add Member:');
    let beforeState = await page.evaluate(() => {
      const allModals = document.querySelectorAll('[role="dialog"]');
      const allDivs = Array.from(document.querySelectorAll('div')).filter(d => {
        const text = d.textContent;
        return text.includes('First Name') || text.includes('firstName');
      });

      return {
        dialogCount: allModals.length,
        modalContainerFound: allDivs.length > 0,
        containerInfo: allDivs.map(d => ({
          display: window.getComputedStyle(d).display,
          hidden: d.hidden,
          visible: d.offsetParent !== null,
          textPreview: d.textContent.substring(0, 50)
        }))
      };
    });

    console.log('  Dialogs with role="dialog": ' + beforeState.dialogCount);
    console.log('  Modal container found: ' + (beforeState.modalContainerFound ? '✅' : '❌'));
    beforeState.containerInfo.forEach((info, idx) => {
      console.log('    Container ' + (idx + 1) + ':');
      console.log('      display: ' + info.display);
      console.log('      hidden: ' + info.hidden);
      console.log('      visible (offsetParent): ' + info.visible);
    });
    console.log('');

    // Click Add Member
    console.log('[3] Clicking Add Member button...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      console.log('Button found:', !!btn);
      if (btn) {
        console.log('Clicking button');
        btn.click();
      }
    });

    await page.waitForTimeout(1000);

    // Inspect DOM after clicking
    console.log('[4] DOM after clicking Add Member:');
    let afterState = await page.evaluate(() => {
      const allModals = document.querySelectorAll('[role="dialog"]');
      const allDivs = Array.from(document.querySelectorAll('div')).filter(d => {
        const text = d.textContent;
        return text.includes('First Name') || text.includes('firstName');
      });

      // Also look for AddMemberModal specifically
      const formInputs = document.querySelectorAll('input[name="firstName"]');

      return {
        dialogCount: allModals.length,
        formInputs: formInputs.length,
        modalContainerFound: allDivs.length > 0,
        containerInfo: allDivs.map(d => {
          const styles = window.getComputedStyle(d);
          const parent = d.parentElement;
          const parentStyles = parent ? window.getComputedStyle(parent) : null;

          return {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            hidden: d.hidden,
            visible: d.offsetParent !== null,
            parentDisplay: parentStyles?.display,
            zIndex: styles.zIndex,
            position: styles.position,
            top: styles.top,
            left: styles.left
          };
        })
      };
    });

    console.log('  Dialogs with role="dialog": ' + afterState.dialogCount);
    console.log('  Form inputs (firstName): ' + afterState.formInputs);
    console.log('  Modal container found: ' + (afterState.modalContainerFound ? '✅' : '❌'));
    afterState.containerInfo.forEach((info, idx) => {
      console.log('    Container ' + (idx + 1) + ':');
      console.log('      display: ' + info.display);
      console.log('      visibility: ' + info.visibility);
      console.log('      opacity: ' + info.opacity);
      console.log('      visible (offsetParent): ' + info.visible);
      console.log('      parentDisplay: ' + info.parentDisplay);
      console.log('      zIndex: ' + info.zIndex);
      console.log('      position: ' + info.position);
    });
    console.log('');

    // Try to take screenshot to see what's actually visible
    console.log('[5] Taking screenshot to see actual visual state...');
    await page.screenshot({ path: '/tmp/modal-debug.png' });
    console.log('✅ Screenshot saved to /tmp/modal-debug.png\n');

    // Check if form is actually accepting input
    console.log('[6] Testing form input despite invisible modal:');
    const inputBefore = await page.evaluate(() => {
      const input = document.querySelector('input[name="firstName"]');
      return input ? input.value : 'NOT FOUND';
    });

    console.log('  firstName value before fill: ' + inputBefore);

    if (inputBefore !== 'NOT FOUND') {
      await page.fill('input[name="firstName"]', 'TestInput');
      const inputAfter = await page.evaluate(() => {
        return document.querySelector('input[name="firstName"]')?.value || 'NOT FOUND';
      });
      console.log('  firstName value after fill: ' + inputAfter);
      console.log('  Form accepts input despite being invisible: ' + (inputAfter === 'TestInput' ? '⚠️ YES' : '❌ NO'));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugModalVisibility();
