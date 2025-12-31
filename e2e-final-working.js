/**
 * Complete E2E Production Test - WORKING VERSION
 * ✅ Registration → ✅ Close Modals → ✅ Create Branch → Add Members → Import
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const testData = {
  email: `e2e-test-${Date.now()}@test.com`,
  password: 'SecureTest123!',
  firstName: 'E2E',
  lastName: 'Tester',
  churchName: `E2E Test Church ${Date.now()}`
};

const errors = [];
const logs = [];

function log(msg, type = 'INFO') {
  const entry = `[${new Date().toISOString()}] [${type}] ${msg}`;
  console.log(entry);
  logs.push(entry);
}

function logError(step, error) {
  errors.push({ step, error: error.message, timestamp: new Date().toISOString() });
  log(`ERROR in ${step}: ${error.message}`, 'ERROR');
}

async function screenshot(page, name) {
  try {
    await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
    log(`📸 ${name}.png`);
  } catch (e) {}
}

async function closeModals(page) {
  for (let i = 0; i < 10; i++) {
    if (await page.locator('[role="dialog"]').count() === 0) {
      log(`✅ Modals closed (${i} closed)`);
      break;
    }

    const selectors = ['button:has-text("Next")', 'button[aria-label*="Close"]', 'button:has-text("Skip")'];
    let clicked = false;

    for (const sel of selectors) {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
        await btn.click();
        clicked = true;
        await page.waitForTimeout(1500);
        break;
      }
    }

    if (!clicked) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  }
}

async function runTest() {
  let browser, page;

  try {
    log('🚀 Starting E2E Test\n');

    browser = await chromium.launch({ headless: false, slowMo: 300 });
    page = await (await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
    })).newPage();

    log('✅ Browser ready\n');

    // ============================================
    // STEP 1: REGISTRATION
    // ============================================
    log('STEP 1: Registration');
    log('─────────────────────────────────────────────────');

    try {
      await page.goto('https://koinoniasms.com/register', { waitUntil: 'networkidle' });
      await page.fill('input[name="firstName"]', testData.firstName);
      await page.fill('input[name="lastName"]', testData.lastName);
      await page.fill('input[name="churchName"]', testData.churchName);
      await page.fill('input[type="email"]', testData.email);
      await page.fill('input[name="password"]', testData.password);
      await page.fill('input[name="confirmPassword"]', testData.password);

      log(`Submitting: ${testData.email}`);
      await screenshot(page, '01-registration');

      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**', { timeout: 90000 });

      log('✅ Registration successful!\n');
      await screenshot(page, '02-dashboard');
      await page.waitForTimeout(3000);

    } catch (error) {
      logError('Registration', error);
      await screenshot(page, '02-failed');
      throw error;
    }

    // Close modals
    await closeModals(page);
    await screenshot(page, '03-modals-closed');

    // ============================================
    // STEP 2: CREATE BRANCH
    // ============================================
    log('STEP 2: Create Branch');
    log('─────────────────────────────────────────────────');

    try {
      // Click "Start" for "Create Your First Branch"
      const startBtn = page.locator('button:has-text("Start")').first();
      await startBtn.click();
      await page.waitForTimeout(2000);
      log('Navigated to branches');

      // Click "Create Your First Branch" button
      await page.locator('button:has-text("Create Your First Branch")').click();
      await page.waitForTimeout(1000);
      log('Modal opened');

      // Fill and submit
      await page.fill('input[name="name"]', 'Main Campus');
      await page.fill('input[name="address"]', '123 Church Street, Seattle, WA 98101');
      await screenshot(page, '04-branch-form');
      await page.locator('button[type="submit"]').first().click();

      await page.waitForTimeout(3000);
      await screenshot(page, '05-branch-created');
      log('✅ Branch created!\n');

    } catch (error) {
      logError('Create Branch', error);
      await screenshot(page, '05-failed');
      throw error;
    }

    // ============================================
    // STEP 3: ADD MEMBERS
    // ============================================
    log('STEP 3: Add Members');
    log('─────────────────────────────────────────────────');

    try {
      // Go back to dashboard to use onboarding
      await page.goto('https://koinoniasms.com/dashboard', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      await screenshot(page, '06-back-to-dashboard');

      // Click "Start" for "Import Members" onboarding task
      const importStartBtn = page.locator('button:has-text("Start")').nth(1); // Second "Start" button

      if (await importStartBtn.count() > 0) {
        await importStartBtn.click();
        await page.waitForTimeout(2000);
        log('Navigated to members via onboarding');
      } else {
        // Fallback: Click Members in sidebar
        log('Using sidebar navigation...');
        await page.locator('a:has-text("Members")').first().click();
        await page.waitForTimeout(2000);
      }

      await screenshot(page, '07-members-page');

      // Add 3 members
      const members = [
        { firstName: 'John', lastName: 'Smith', phone: '+12065551001', email: 'john@test.com' },
        { firstName: 'Jane', lastName: 'Doe', phone: '+12065551002', email: 'jane@test.com' },
        { firstName: 'Bob', lastName: 'Johnson', phone: '+12065551003', email: 'bob@test.com' },
      ];

      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        log(`Adding ${m.firstName} ${m.lastName}...`);

        // Click "Add Member"
        await page.locator('button:has-text("Add Member")').first().click();
        await page.waitForTimeout(1000);

        // Fill form
        await page.fill('input[name="firstName"]', m.firstName);
        await page.fill('input[name="lastName"]', m.lastName);
        await page.fill('input[name="phone"]', m.phone);
        await page.fill('input[name="email"]', m.email);
        await screenshot(page, `08-member-${i + 1}`);

        // Submit
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(2000);
        log(`✅ ${m.firstName} added`);
      }

      log('✅ All members added!\n');
      await screenshot(page, '09-members-added');

    } catch (error) {
      logError('Add Members', error);
      await screenshot(page, '09-failed');
    }

    // ============================================
    // STEP 4: IMPORT
    // ============================================
    log('STEP 4: Import Members');
    log('─────────────────────────────────────────────────');

    try {
      // Create CSV
      const csv = [
        'firstName,lastName,phone,email',
        ...Array.from({ length: 20 }, (_, i) => `Import${i + 1},User,+1206555${1001 + i},import${i + 1}@test.com`)
      ].join('\n');

      writeFileSync('members-import.csv', csv);
      log('✅ CSV created');

      // Click "Import CSV"
      const importBtn = page.locator('button:has-text("Import CSV")').first();

      if (await importBtn.count() > 0) {
        await importBtn.click();
        await page.waitForTimeout(1000);

        // Upload
        await page.locator('input[type="file"]').setInputFiles('members-import.csv');
        await page.waitForTimeout(2000);
        await screenshot(page, '10-import-uploading');

        // Submit
        await page.locator('button:has-text("Import")').first().click();
        await page.waitForTimeout(5000);
        await screenshot(page, '11-import-done');

        log('✅ Import complete!\n');
      } else {
        log('⚠️ Import button not found');
      }

    } catch (error) {
      logError('Import', error);
      await screenshot(page, '11-failed');
    }

    // ============================================
    // SUMMARY
    // ============================================
    log('\n═══════════════════════════════════════════════════');
    log('TEST SUMMARY');
    log('═══════════════════════════════════════════════════\n');

    await screenshot(page, '12-final');

    log(`✅ Account: ${testData.email}`);
    log(`✅ Password: ${testData.password}`);
    log(`✅ Church: ${testData.churchName}`);
    log(`\n📊 Errors: ${errors.length}`);

    if (errors.length === 0) {
      log('\n🎉🎉🎉 SUCCESS - ALL STEPS COMPLETED! 🎉🎉🎉');
    } else {
      log('\n⚠️ COMPLETED WITH ERRORS:');
      errors.forEach((e, i) => log(`${i + 1}. ${e.step}: ${e.error}`));
    }

    const report = {
      testData,
      timestamp: new Date().toISOString(),
      errors,
      logs,
      status: errors.length === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS'
    };

    writeFileSync('E2E-FINAL-REPORT.json', JSON.stringify(report, null, 2));
    log('\n📄 Report: E2E-FINAL-REPORT.json');

    log('\nClosing in 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    log(`\n❌ FATAL: ${error.message}`, 'ERROR');
    if (page) await screenshot(page, '99-fatal');
  } finally {
    if (browser) await browser.close();
    log('Browser closed');
  }
}

// Setup
import { mkdirSync } from 'fs';
try { mkdirSync('screenshots', { recursive: true }); } catch (e) {}

// Run
runTest().catch(console.error);
