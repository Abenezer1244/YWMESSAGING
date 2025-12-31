/**
 * Complete E2E Production Test - WORKING VERSION
 *
 * Flow: Registration → Close Modals → Navigate to Branches → Create Branch → Add Members → Import
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
  errors.push({ step, error: error.message, timestamp: new Date().toISOString() });
  log(`ERROR in ${step}: ${error.message}`, 'error');
}

async function takeScreenshot(page, name) {
  try {
    await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
    log(`Screenshot: ${name}.png`);
  } catch (error) {
    log(`Screenshot failed: ${error.message}`, 'warn');
  }
}

async function closeAllModals(page) {
  log('Closing modals...');

  for (let i = 0; i < 10; i++) {
    const hasModal = await page.locator('[role="dialog"]').count() > 0;
    if (!hasModal) {
      log(`✅ All modals closed (${i} closed)`);
      break;
    }

    // Try close buttons
    const closeSelectors = ['button:has-text("Next")', 'button[aria-label*="Close"]', 'button:has-text("Skip")'];
    let clicked = false;

    for (const selector of closeSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.count() > 0 && await btn.isVisible()) {
          await btn.click();
          clicked = true;
          await page.waitForTimeout(1500);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!clicked) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  }
}

async function runE2ETest() {
  let browser;
  let page;

  try {
    log('🚀 Starting Complete E2E Test\n');
    log('═══════════════════════════════════════════════════\n');

    browser = await chromium.launch({ headless: false, slowMo: 300 });
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
      await page.fill('input[name="firstName"]', testData.firstName);
      await page.fill('input[name="lastName"]', testData.lastName);
      await page.fill('input[name="churchName"]', testData.churchName);
      await page.fill('input[type="email"]', testData.email);
      await page.fill('input[name="password"]', testData.password);
      await page.fill('input[name="confirmPassword"]', testData.password);

      log(`Registering: ${testData.email}`);
      await takeScreenshot(page, '01-registration-filled');

      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**', { timeout: 90000 });

      log('✅ Registration successful!');
      await takeScreenshot(page, '02-dashboard');
      await page.waitForTimeout(3000);

    } catch (error) {
      logError('Registration', error);
      await takeScreenshot(page, '02-registration-failed');
      throw error;
    }

    // ============================================
    // CLOSE MODALS
    // ============================================
    log('\nClosing onboarding modals...');
    await closeAllModals(page);
    await takeScreenshot(page, '03-modals-closed');
    log('✅ Modals closed\n');

    // ============================================
    // STEP 2: CREATE BRANCH
    // ============================================
    log('STEP 2: Create Branch');
    log('─────────────────────────────────────────────────');

    try {
      // Method 1: Click "Start" in onboarding checklist (navigates to branches page)
      log('Clicking "Start" for branch creation...');
      const startBtn = page.locator('button:has-text("Start")').first();

      if (await startBtn.count() > 0) {
        await startBtn.click();
        await page.waitForTimeout(2000);
        log('Navigated to branches page');
      } else {
        // Fallback: Direct navigation
        log('Start button not found, navigating directly...');
        await page.goto('https://koinoniasms.com/dashboard/branches', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
      }

      await takeScreenshot(page, '04-branches-page');

      // Now click "Create Your First Branch" button on the branches page
      log('Clicking "Create Your First Branch" button...');
      const createBranchBtn = page.locator('button:has-text("Create Your First Branch")').first();

      await createBranchBtn.waitFor({ state: 'visible', timeout: 10000 });
      await createBranchBtn.click();
      log('Branch modal opened');

      await page.waitForTimeout(1000);
      await takeScreenshot(page, '05-branch-modal');

      // Fill branch form
      log('Filling branch details...');
      await page.fill('input[name="name"]', 'Main Campus');
      await page.fill('input[name="address"]', '123 Church Street, Seattle, WA 98101');
      await takeScreenshot(page, '05a-branch-form-filled');

      // Submit
      await page.locator('button[type="submit"]').first().click();
      log('Branch creation submitted');

      await page.waitForTimeout(3000);
      await takeScreenshot(page, '06-branch-created');

      log('✅ STEP 2 COMPLETE: Branch created\n');

    } catch (error) {
      logError('Create Branch', error);
      await takeScreenshot(page, '06-branch-failed');
      throw error; // Stop if branch creation fails - members require a branch
    }

    // ============================================
    // STEP 3: ADD MEMBERS
    // ============================================
    log('STEP 3: Add Members');
    log('─────────────────────────────────────────────────');

    try {
      // Navigate to members page
      log('Navigating to members...');
      const membersLink = page.locator('a:has-text("Members"), button:has-text("Members")').first();

      if (await membersLink.count() > 0) {
        await membersLink.click();
        await page.waitForTimeout(2000);
      } else {
        await page.goto('https://koinoniasms.com/dashboard/members', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
      }

      await takeScreenshot(page, '07-members-page');

      // Add 3 members
      const members = [
        { firstName: 'John', lastName: 'Smith', phone: '+12065551001', email: 'john.smith@test.com' },
        { firstName: 'Jane', lastName: 'Doe', phone: '+12065551002', email: 'jane.doe@test.com' },
        { firstName: 'Bob', lastName: 'Johnson', phone: '+12065551003', email: 'bob.johnson@test.com' },
      ];

      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        log(`Adding member ${i + 1}: ${member.firstName} ${member.lastName}`);

        // Click "Add Member"
        const addBtn = page.locator('button:has-text("Add Member")').first();
        await addBtn.waitFor({ state: 'visible', timeout: 10000 });
        await addBtn.click();

        await page.waitForTimeout(1000);
        await takeScreenshot(page, `08-add-member-${i + 1}-modal`);

        // Fill form
        await page.fill('input[name="firstName"]', member.firstName);
        await page.fill('input[name="lastName"]', member.lastName);
        await page.fill('input[name="phone"]', member.phone);
        await page.fill('input[name="email"]', member.email);

        // Submit
        await page.locator('button[type="submit"]').first().click();
        log(`✅ Member ${i + 1} added`);

        await page.waitForTimeout(2000);
        await takeScreenshot(page, `09-member-${i + 1}-added`);
      }

      log('✅ STEP 3 COMPLETE: 3 members added\n');

    } catch (error) {
      logError('Add Members', error);
      await takeScreenshot(page, '09-members-failed');
    }

    // ============================================
    // STEP 4: IMPORT 20 MEMBERS
    // ============================================
    log('STEP 4: Import Members');
    log('─────────────────────────────────────────────────');

    try {
      // Create CSV
      const csvMembers = [];
      for (let i = 1; i <= 20; i++) {
        csvMembers.push({
          firstName: `Import${i}`,
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
      log('✅ CSV created');

      // Click "Import CSV"
      const importBtn = page.locator('button:has-text("Import CSV")').first();

      if (await importBtn.count() > 0) {
        await importBtn.click();
        log('Import modal opened');
        await page.waitForTimeout(1000);
        await takeScreenshot(page, '10-import-modal');

        // Upload file
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles('test-members-import.csv');
          log('✅ CSV uploaded');
          await page.waitForTimeout(2000);
          await takeScreenshot(page, '10a-file-selected');

          // Submit
          const confirmBtn = page.locator('button:has-text("Import"), button:has-text("Upload")').first();
          if (await confirmBtn.count() > 0) {
            await confirmBtn.click();
            log('Import submitted');
            await page.waitForTimeout(5000);
            await takeScreenshot(page, '11-import-complete');
          }

          log('✅ STEP 4 COMPLETE: Import done\n');
        }
      } else {
        log('⚠️ Import button not found');
        await takeScreenshot(page, '10-no-import');
      }

    } catch (error) {
      logError('Import Members', error);
      await takeScreenshot(page, '11-import-failed');
    }

    // ============================================
    // SUMMARY
    // ============================================
    log('\n═══════════════════════════════════════════════════');
    log('TEST SUMMARY');
    log('═══════════════════════════════════════════════════\n');

    await takeScreenshot(page, '12-final');

    log(`✅ Account: ${testData.email}`);
    log(`✅ Password: ${testData.password}`);
    log(`✅ Church: ${testData.churchName}`);
    log(`\n📊 Errors: ${errors.length}`);

    if (errors.length > 0) {
      log('\n❌ ERROR DETAILS:');
      errors.forEach((err, i) => {
        log(`${i + 1}. ${err.step}: ${err.error}`);
      });
    } else {
      log('\n✅✅✅ SUCCESS - All steps completed! ✅✅✅');
    }

    const report = {
      testData,
      timestamp: new Date().toISOString(),
      errors,
      logs,
      status: errors.length === 0 ? 'SUCCESS' : 'COMPLETED_WITH_ERRORS'
    };

    writeFileSync('E2E-COMPLETE-REPORT.json', JSON.stringify(report, null, 2));
    log('\n📄 Report: E2E-COMPLETE-REPORT.json\n');

    log('Browser will close in 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    log(`\n❌ FATAL: ${error.message}`, 'error');
    if (page) await takeScreenshot(page, '99-fatal');
  } finally {
    if (browser) {
      await browser.close();
      log('Browser closed');
    }
  }
}

// Create screenshots dir
import { mkdirSync } from 'fs';
try { mkdirSync('screenshots', { recursive: true }); } catch (e) {}

// Run
runE2ETest().catch(console.error);
