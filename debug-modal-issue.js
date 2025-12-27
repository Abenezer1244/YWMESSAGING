const { chromium } = require('playwright');
const fs = require('fs');

async function debugModalIssue() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Debugging modal issue...\n');

  try {
    // Login
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });

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
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Take screenshot BEFORE clicking Add Member
    console.log('[STEP 1] Saving screenshot BEFORE clicking Add Member...');
    await page.screenshot({ path: '/tmp/before-add-member.png' });
    console.log('✅ Screenshot saved: /tmp/before-add-member.png');

    // Click Add Member
    console.log('\n[STEP 2] Clicking "Add Member" button...');
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.trim() === 'Add Member');
      console.log(`Button found: ${!!btn}`);
      if (btn) {
        console.log('Clicking button...');
        btn.click();
        return true;
      }
      return false;
    });

    console.log(`Button clicked: ${clicked}`);

    // Wait a bit
    await page.waitForTimeout(1500);

    // Take screenshot AFTER clicking
    console.log('\n[STEP 3] Saving screenshot AFTER clicking...');
    await page.screenshot({ path: '/tmp/after-click.png' });
    console.log('✅ Screenshot saved: /tmp/after-click.png');

    // Check DOM state
    const domState = await page.evaluate(() => {
      return {
        formsCount: document.querySelectorAll('form').length,
        dialogsCount: document.querySelectorAll('[role="dialog"]').length,
        modalsCount: document.querySelectorAll('[class*="modal"]').length,
        fixedOverlays: document.querySelectorAll('div.fixed').length,
        addMemberBtns: Array.from(document.querySelectorAll('button')).filter(b =>
          b.textContent.trim() === 'Add Member'
        ).length
      };
    });

    console.log('\n[STEP 4] DOM State:');
    console.log(`  Forms: ${domState.formsCount}`);
    console.log(`  Dialogs ([role="dialog"]): ${domState.dialogsCount}`);
    console.log(`  Modals (class*="modal"): ${domState.modalsCount}`);
    console.log(`  Fixed overlays: ${domState.fixedOverlays}`);
    console.log(`  Add Member buttons: ${domState.addMemberBtns}`);

    // Try checking isOpen state in React component
    const reactState = await page.evaluate(() => {
      // Look for modal title
      const titleExists = !!Array.from(document.querySelectorAll('h2')).find(h =>
        h.textContent.includes('Add Member')
      );

      // Look for form inputs
      const firstNameInput = document.querySelector('input[name="firstName"]');
      const hasFormInputs = !!firstNameInput;

      // Look for modal backdrop
      const hasBackdrop = !!document.querySelector('.bg-black.bg-opacity-50');
      const hasFixedBackdrop = !!Array.from(document.querySelectorAll('div')).find(d =>
        d.classList.contains('fixed') && d.classList.contains('inset-0') &&
        (d.classList.contains('bg-black') || d.style.backgroundColor)
      );

      return {
        modalTitleExists: titleExists,
        hasFormInputs,
        hasBackdrop,
        hasFixedBackdrop,
        bodyText: document.body.innerText.substring(0, 200)
      };
    });

    console.log('\n[STEP 5] React Component State:');
    console.log(`  Modal title "Add Member" visible: ${reactState.modalTitleExists}`);
    console.log(`  Form inputs present: ${reactState.hasFormInputs}`);
    console.log(`  Backdrop (bg-black): ${reactState.hasBackdrop}`);
    console.log(`  Fixed backdrop: ${reactState.hasFixedBackdrop}`);

    if (!reactState.modalTitleExists && !reactState.hasFormInputs) {
      console.log('\n❌ MODAL DID NOT OPEN!');
    } else if (reactState.modalTitleExists && reactState.hasFormInputs) {
      console.log('\n✅ MODAL IS OPEN!');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugModalIssue();
