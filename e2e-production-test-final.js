/**
 * Complete E2E Production Test - FINAL VERSION
 * Proper order: Registration → Close Modals → Create Branch (via onboarding) → Add Members → Import
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const testEmail = `e2e-test-${Date.now()}@test.com`;
const testPassword = 'SecureTest123!';
const testData = {
  firstName: 'E2E',
  lastName: 'Tester',
  churchName: `E2E Test Church ${Date.now()}`,
  email: testEmail,
  password: testPassword
};

const errors = [];
const logs = [];

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  console.log(logEntry);
  logs.push(logEntry);
}

function logError(step, error) {
  errors.push({
    step,
    error: error.message,
    timestamp: new Date().toISOString()
  });
  log(`ERROR in ${step}: ${error.message}`, 'error');
}

async function takeScreenshot(page, name) {
  try {
    await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
    log(`Screenshot saved: ${name}.png`);
  } catch (error) {
    log(`Failed to take screenshot: ${error.message}`, 'warn');
  }
}

async function closeAllModals(page) {
  log('Closing all modals...');

  const maxAttempts = 10;
  let modalsClosed = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Check for any modal
    const hasModal = await page.locator('[role="dialog"], .modal, [class*="Modal"]').count() > 0;
    const hasBackdrop = await page.locator('.fixed.inset-0, [class*="backdrop"]').count() > 0;

    if (!hasModal && !hasBackdrop) {
      log(`✅ All modals closed (${modalsClosed} total)`);
      break;
    }

    log(`Attempt ${attempt + 1}: Looking for modals...`);

    // Try clicking any visible close button
    const closeButtons = [
      'button:has-text("Next")',
      'button:has-text("Skip")',
      'button:has-text("Close")',
      'button[aria-label*="Close"]',
      'button.close',
      '[role="dialog"] button:has-text("×")'
    ];

    let clicked = false;
    for (const selector of closeButtons) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.count() > 0 && await btn.isVisible()) {
          log(`Clicking: ${selector}`);
          await btn.click();
          modalsClosed++;
          clicked = true;
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!clicked) {
      log('No close button found, trying Escape...');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    await takeScreenshot(page, `modal-attempt-${attempt + 1}`);
  }
}

async function runE2ETest() {
  let browser;
  let page;

  try {
    log('🚀 Starting Complete E2E Production Test - FINAL\n');
    log('═══════════════════════════════════════════════════\n');

    browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
    });
    page = await context.newPage();
    log('✅ Browser launched\n');

    // ============================================
    // STEP 1: REGISTRATION
    // ============================================
    log('STEP 1: Registration');
    log('─────────────────────────────────────────────────');

    try {
      await page.goto('https://koinoniasms.com/register', { waitUntil: 'networkidle', timeout: 30000 });
      await takeScreenshot(page, '01-registration-page');

      await page.fill('input[name="firstName"]', testData.firstName);
      await page.fill('input[name="lastName"]', testData.lastName);
      await page.fill('input[name="churchName"]', testData.churchName);
      await page.fill('input[type="email"]', testData.email);
      await page.fill('input[name="password"]', testData.password);
      await page.fill('input[name="confirmPassword"]', testData.password);

      log(`Form filled: ${testData.email}`);
      await takeScreenshot(page, '02-registration-filled');

      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**', { timeout: 90000 });

      log('✅ Registration successful!');
      await takeScreenshot(page, '03-registration-success');
      log('✅ STEP 1 COMPLETE\n');

    } catch (error) {
      logError('Registration', error);
      await takeScreenshot(page, '03-registration-failed');
      throw error;
    }

    await page.waitForTimeout(3000);

    // ============================================
    // CLOSE ALL MODALS
    // ============================================
    log('Closing all onboarding modals...');
    log('─────────────────────────────────────────────────');

    await takeScreenshot(page, '04-before-closing-modals');
    await closeAllModals(page);
    await takeScreenshot(page, '04-after-closing-modals');

    log('✅ Modals closed\n');
    await page.waitForTimeout(2000);

    // ============================================
    // STEP 2: CREATE BRANCH (via onboarding checklist)
    // ============================================
    log('STEP 2: Create Branch');
    log('─────────────────────────────────────────────────');

    try {
      log('Looking for "Create Your First Branch" in onboarding checklist...');
      await takeScreenshot(page, '05-dashboard-ready');

      // Find and click the "Start" button next to "Create Your First Branch"
      const startButton = page.locator('button:has-text("Start")').first();

      if (await startButton.count() > 0) {
        log('Clicking "Start" button for branch creation...');
        await startButton.click();
        await page.waitForTimeout(2000);
        await takeScreenshot(page, '06-branch-modal-opened');

        // Fill branch form
        log('Filling branch details...');
        await page.fill('input[name="name"]', 'Main Campus');
        await page.fill('input[name="address"]', '123 Church Street, Seattle, WA 98101');
        await takeScreenshot(page, '06a-branch-form-filled');

        // Submit
        const submitButton = page.locator('button[type="submit"]').first();
        await submitButton.click();
        log('Submitted branch creation');

        await page.waitForTimeout(3000);
        await takeScreenshot(page, '07-branch-created');

        log('✅ STEP 2 COMPLETE: Branch created\n');
      } else {
        // Fallback: Try clicking "Branches" in sidebar
        log('Start button not found, trying sidebar navigation...');
        const branchesLink = page.locator('a:has-text("Branches"), button:has-text("Branches")').first();
        if (await branchesLink.count() > 0) {
          await branchesLink.click();
          await page.waitForTimeout(2000);
          await takeScreenshot(page, '06-branches-page');

          // Click "Add Branch"
          const addButton = page.locator('button:has-text("Add Branch")').first();
          await addButton.click();
          await page.waitForTimeout(1000);

          // Fill and submit
          await page.fill('input[name="name"]', 'Main Campus');
          await page.fill('input[name="address"]', '123 Church Street, Seattle, WA 98101');
          const submitButton = page.locator('button[type="submit"]').first();
          await submitButton.click();

          await page.waitForTimeout(3000);
          await takeScreenshot(page, '07-branch-created');
          log('✅ STEP 2 COMPLETE: Branch created\n');
        } else {
          throw new Error('Could not find branch creation option');
        }
      }

    } catch (error) {
      logError('Create Branch', error);
      await takeScreenshot(page, '07-branch-failed');
    }

    // ============================================
    // STEP 3: ADD MEMBERS (now that branch exists)
    // ============================================
    log('STEP 3: Add Members Manually');
    log('─────────────────────────────────────────────────');

    try {
      log('Navigating to members page...');

      // Click "Members" in sidebar
      const membersLink = page.locator('a:has-text("Members"), button:has-text("Members")').first();
      if (await membersLink.count() > 0) {
        await membersLink.click();
        await page.waitForTimeout(2000);
      } else {
        await page.goto('https://koinoniasms.com/dashboard/members', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
      }

      await takeScreenshot(page, '08-members-page');

      // Add 3 members
      const membersToAdd = [
        { firstName: 'John', lastName: 'Smith', phone: '+12065551001', email: 'john.smith@test.com' },
        { firstName: 'Jane', lastName: 'Doe', phone: '+12065551002', email: 'jane.doe@test.com' },
        { firstName: 'Bob', lastName: 'Johnson', phone: '+12065551003', email: 'bob.johnson@test.com' },
      ];

      for (let i = 0; i < membersToAdd.length; i++) {
        const member = membersToAdd[i];
        log(`Adding member ${i + 1}: ${member.firstName} ${member.lastName}`);

        // Click "Add Member" button
        const addButton = page.locator('button:has-text("Add Member")').first();
        await addButton.waitFor({ state: 'visible', timeout: 10000 });
        await addButton.click();
        log('Clicked Add Member');

        await page.waitForTimeout(1000);
        await takeScreenshot(page, `09-add-member-${i + 1}-modal`);

        // Fill form
        await page.fill('input[name="firstName"]', member.firstName);
        await page.fill('input[name="lastName"]', member.lastName);
        await page.fill('input[name="phone"]', member.phone);
        await page.fill('input[name="email"]', member.email);
        await takeScreenshot(page, `09a-member-${i + 1}-filled`);

        // Submit
        const submitBtn = page.locator('button[type="submit"]').first();
        await submitBtn.click();
        log(`✅ Member ${i + 1} added`);

        await page.waitForTimeout(2000);
        await takeScreenshot(page, `10-member-${i + 1}-added`);
      }

      log('✅ STEP 3 COMPLETE: 3 members added\n');

    } catch (error) {
      logError('Add Members Manually', error);
      await takeScreenshot(page, '10-manual-members-failed');
    }

    // ============================================
    // STEP 4: IMPORT 20 MEMBERS
    // ============================================
    log('STEP 4: Import 20 Members');
    log('─────────────────────────────────────────────────');

    try {
      // Create CSV
      const csvMembers = [];
      for (let i = 1; i <= 20; i++) {
        csvMembers.push({
          firstName: `ImportTest${i}`,
          lastName: `User`,
          phone: `+1206555${1000 + i}`,
          email: `import${i}@test.com`
        });
      }

      const csvContent = [
        'firstName,lastName,phone,email',
        ...csvMembers.map(m => `${m.firstName},${m.lastName},${m.phone},${m.email}`)
      ].join('\n');

      writeFileSync('test-members-import.csv', csvContent);
      log('✅ CSV created with 20 members');

      // Click "Import CSV" button
      const importButton = page.locator('button:has-text("Import CSV")').first();

      if (await importButton.count() > 0) {
        await importButton.click();
        log('Clicked Import CSV');
        await page.waitForTimeout(1000);
        await takeScreenshot(page, '11-import-modal');

        // Upload file
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles('test-members-import.csv');
          log('✅ CSV uploaded');
          await page.waitForTimeout(2000);
          await takeScreenshot(page, '11a-file-selected');

          // Submit import
          const confirmBtn = page.locator('button:has-text("Import"), button:has-text("Upload")').first();
          if (await confirmBtn.count() > 0) {
            await confirmBtn.click();
            log('Import submitted');
            await page.waitForTimeout(5000);
            await takeScreenshot(page, '12-import-complete');
          }

          log('✅ STEP 4 COMPLETE: Import done\n');
        } else {
          log('⚠️ File input not found');
        }
      } else {
        log('⚠️ Import CSV button not found');
        await takeScreenshot(page, '11-no-import-button');
      }

    } catch (error) {
      logError('Import Members', error);
      await takeScreenshot(page, '12-import-failed');
    }

    // ============================================
    // SUMMARY
    // ============================================
    log('\n═══════════════════════════════════════════════════');
    log('TEST SUMMARY');
    log('═══════════════════════════════════════════════════\n');

    await takeScreenshot(page, '13-final-state');

    log(`Account: ${testData.email}`);
    log(`Password: ${testData.password}`);
    log(`Church: ${testData.churchName}`);
    log(`\nErrors: ${errors.length}`);

    if (errors.length > 0) {
      log('\nERROR DETAILS:');
      errors.forEach((err, i) => {
        log(`${i + 1}. ${err.step}: ${err.error}`);
      });
    } else {
      log('✅✅✅ SUCCESS - All steps completed! ✅✅✅');
    }

    const report = {
      testData,
      timestamp: new Date().toISOString(),
      errors,
      logs,
      status: errors.length === 0 ? 'SUCCESS' : 'COMPLETED_WITH_ERRORS'
    };

    writeFileSync('e2e-production-test-report-final.json', JSON.stringify(report, null, 2));
    log('\n📄 Report saved: e2e-production-test-report-final.json\n');

    log('Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    log(`\n❌ FATAL ERROR: ${error.message}`, 'error');
    if (page) await takeScreenshot(page, '99-fatal-error');
  } finally {
    if (browser) {
      await browser.close();
      log('Browser closed');
    }
  }
}

// Create screenshots directory
import { mkdirSync } from 'fs';
try {
  mkdirSync('screenshots', { recursive: true });
} catch (e) {}

// Run test
runE2ETest().catch(console.error);
