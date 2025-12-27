const { chromium } = require('playwright');

async function diagnoseUIIssue() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     DIAGNOSTIC: Understanding UI Behavior                       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Login
    console.log('[1] Logging in...');
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
    console.log('[2] Navigating to Members page...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);
    console.log('✅ On Members page\n');

    // Inspect page structure
    console.log('[3] Checking page structure...');
    const pageState = await page.evaluate(() => {
      return {
        hasTable: !!document.querySelector('table'),
        hasModal: !!document.querySelector('[role="dialog"]'),
        initialRows: document.querySelectorAll('table tbody tr').length,
        hasAddButton: !!Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.trim() === 'Add Member'
        ),
        pageTitle: document.title,
        url: window.location.href
      };
    });
    console.log('Page structure:');
    console.log('  Has table: ' + (pageState.hasTable ? '✅' : '❌'));
    console.log('  Has modal: ' + (pageState.hasModal ? '✅' : '❌'));
    console.log('  Initial rows: ' + pageState.initialRows);
    console.log('  Has Add Button: ' + (pageState.hasAddButton ? '✅' : '❌'));
    console.log('  URL: ' + pageState.url + '\n');

    // Open modal
    console.log('[4] Opening Add Member modal...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) {
        console.log('Found Add Member button, clicking it');
        btn.click();
      } else {
        console.log('Add Member button not found');
      }
    });
    await page.waitForTimeout(1000);
    console.log('✅ Modal opened\n');

    // Check modal is visible
    const modalVisible = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      return modal ? !modal.hidden : false;
    });
    console.log('[5] Modal visible: ' + (modalVisible ? '✅ YES' : '❌ NO') + '\n');

    // Fill form
    const timestamp = Date.now();
    const lastName = 'Diag' + timestamp;

    console.log('[6] Filling form with: TestDiag ' + lastName);
    await page.fill('input[name="firstName"]', 'TestDiag');
    await page.fill('input[name="lastName"]', lastName);
    await page.fill('input[name="phone"]', '5556664444');
    console.log('✅ Form filled\n');

    // Before submit - check state
    const beforeSubmit = await page.evaluate(() => {
      return {
        formInputsValid: !!document.querySelector('input[name="firstName"]').value,
        submitButtonVisible: !!Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.includes('Add Member') && !b.parentElement.textContent.includes('Form')
        ),
        rows: document.querySelectorAll('table tbody tr').length
      };
    });
    console.log('[7] Before submit - Rows in table: ' + beforeSubmit.rows + '\n');

    // Submit
    console.log('[8] Submitting form...');
    const startTime = Date.now();

    let apiSuccess = false;
    let apiMemberId = null;

    page.on('response', async response => {
      if (response.url().includes('/api/groups') && response.url().includes('/members') &&
          response.request().method() === 'POST') {
        const data = await response.json();
        apiSuccess = data.success;
        apiMemberId = data.data?.id;
        console.log('API Response: status=' + response.status() + ', success=' + data.success);
      }
    });

    await page.click('button[type="submit"]:has-text("Add Member")');
    await page.waitForTimeout(2000);

    console.log('API Call: ' + (apiSuccess ? '✅ SUCCESS' : '❌ FAILED'));
    console.log('Member ID: ' + (apiMemberId ? apiMemberId : 'N/A') + '\n');

    // Check modal closed
    console.log('[9] Checking if modal closed...');
    for (let i = 0; i < 5; i++) {
      const modalStillOpen = await page.evaluate(() => {
        const modal = document.querySelector('[role="dialog"]');
        return modal && !modal.hidden;
      });

      if (!modalStillOpen) {
        console.log('✅ Modal closed after ' + ((i + 1) * 200) + 'ms\n');
        break;
      }

      await page.waitForTimeout(200);
    }

    // Check if refetch happened
    console.log('[10] Checking table for new member...');
    for (let i = 0; i < 10; i++) {
      const tableState = await page.evaluate((lastName) => {
        const rows = document.querySelectorAll('table tbody tr');
        const lastNames = Array.from(rows).map(r => {
          const cells = r.querySelectorAll('td');
          if (cells.length > 1) {
            return cells[0].textContent.trim(); // First column has name
          }
          return '';
        });

        return {
          count: rows.length,
          hasNewMember: lastNames.some(name => name.includes(lastName))
        };
      }, lastName);

      const elapsed = (i + 1) * 1000;
      console.log(`  +${elapsed}ms: ${tableState.count} rows, new member: ${tableState.hasNewMember ? '✅' : '❌'}`);

      if (tableState.hasNewMember) {
        console.log('✅ MEMBER FOUND\n');
        break;
      }

      await page.waitForTimeout(1000);
    }

    console.log('\n[11] Console logs from page:');
    consoleLogs.forEach(log => {
      if (log.text.includes('load') || log.text.includes('Member') || log.text.includes('error')) {
        console.log('  ' + log.type.toUpperCase() + ': ' + log.text);
      }
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

diagnoseUIIssue();
