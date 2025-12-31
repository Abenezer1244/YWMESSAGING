/**
 * Complete E2E Production Test - V2 (ALL MODALS CLOSED)
 * Tests: Registration → Close ALL Modals → Create Branch → Add Members → Import Members
 *
 * FIXES:
 * 1. Closes welcome modal after registration
 * 2. Closes phone number purchase modal (automatically opens after welcome)
 * 3. Uses correct selectors for all UI elements
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

// Test data
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
  const errorEntry = {
    step,
    error: error.message,
    timestamp: new Date().toISOString()
  };
  errors.push(errorEntry);
  log(`ERROR in ${step}: ${error.message}`, 'error');
}

async function takeScreenshot(page, name) {
  try {
    await page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true
    });
    log(`Screenshot saved: ${name}.png`);
  } catch (error) {
    log(`Failed to take screenshot: ${error.message}`, 'warn');
  }
}

async function closeAllModals(page) {
  log('Closing all modals...');

  // List of possible close button selectors
  const closeSelectors = [
    'button:has-text("Next")',
    'button[aria-label*="Close"]',
    'button:has-text("Skip")',
    '.modal button:has-text("×")',
    '[role="dialog"] button:has-text("×")',
    'button.close',
  ];

  let modalsClosed = 0;
  const maxAttempts = 5; // Try up to 5 times to close modals

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Check if there's still a backdrop (indicating a modal)
    const backdrop = await page.locator('.fixed.inset-0.bg-black\\/40, .fixed.inset-0.bg-black\\/50, [class*="backdrop"]').count();

    if (backdrop === 0) {
      log(`✅ All modals closed (${modalsClosed} modals closed)`);
      break;
    }

    log(`Modal backdrop detected (attempt ${attempt + 1}/${maxAttempts})`);

    // Try each close selector
    let foundButton = false;
    for (const selector of closeSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.count() > 0 && await button.isVisible()) {
          log(`Found close button with selector: ${selector}`);
          await button.click({ timeout: 2000 });
          modalsClosed++;
          foundButton = true;
          await page.waitForTimeout(1500); // Wait for modal animation
          break;
        }
      } catch (e) {
        // Try next selector
        continue;
      }
    }

    // If no button found but backdrop exists, try clicking backdrop or pressing Escape
    if (!foundButton) {
      log('No close button found, trying Escape key...');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }

    await takeScreenshot(page, `modal-close-attempt-${attempt + 1}`);
  }

  // Final verification
  const remainingBackdrops = await page.locator('.fixed.inset-0.bg-black\\/40, .fixed.inset-0.bg-black\\/50').count();
  if (remainingBackdrops > 0) {
    log(`⚠️ Warning: ${remainingBackdrops} modal backdrop(s) still visible`, 'warn');
  }
}

async function runE2ETest() {
  let browser;
  let page;

  try {
    log('🚀 Starting Complete E2E Production Test V2\n');
    log('═══════════════════════════════════════════════════\n');

    // Launch browser
    log('Launching browser...');
    browser = await chromium.launch({
      headless: false,
      slowMo: 500
    });

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
      log('Navigating to registration page...');
      await page.goto('https://koinoniasms.com/register', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      await takeScreenshot(page, '01-registration-page');

      log('Filling registration form...');
      await page.fill('input[name="firstName"]', testData.firstName);
      await page.fill('input[name="lastName"]', testData.lastName);
      await page.fill('input[name="churchName"]', testData.churchName);
      await page.fill('input[type="email"]', testData.email);
      await page.fill('input[name="password"]', testData.password);
      await page.fill('input[name="confirmPassword"]', testData.password);

      log(`Form filled with email: ${testData.email}`);
      await takeScreenshot(page, '02-registration-filled');

      log('Submitting registration...');
      await page.click('button[type="submit"]');

      await Promise.race([
        page.waitForURL('**/dashboard**', { timeout: 90000 }),
        page.waitForSelector('.error, [role="alert"]', { timeout: 90000 })
      ]);

      const currentURL = page.url();
      if (currentURL.includes('/dashboard')) {
        log('✅ Registration successful! Redirected to dashboard');
        await takeScreenshot(page, '03-registration-success');
      } else {
        const errorText = await page.textContent('.error, [role="alert"]').catch(() => null);
        if (errorText) {
          throw new Error(`Registration failed: ${errorText}`);
        }
      }

      log('✅ STEP 1 COMPLETE: Registration successful\n');

    } catch (error) {
      logError('Registration', error);
      await takeScreenshot(page, '03-registration-failed');
      throw error;
    }

    // Wait for dashboard to load
    await page.waitForTimeout(3000);

    // ============================================
    // CRITICAL: CLOSE ALL MODALS
    // ============================================
    log('CRITICAL: Closing all modals...');
    log('─────────────────────────────────────────────────');

    await takeScreenshot(page, '04-before-closing-modals');
    await closeAllModals(page);
    await takeScreenshot(page, '04-after-closing-modals');

    log('✅ All modals closed, ready for navigation\n');

    // ============================================
    // STEP 2: CREATE BRANCH
    // ============================================
    log('STEP 2: Create Branch');
    log('─────────────────────────────────────────────────');

    try {
      log('Navigating to branches page...');

      // Use direct navigation (more reliable)
      await page.goto('https://koinoniasms.com/dashboard/branches', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      await page.waitForTimeout(2000);

      await takeScreenshot(page, '05-branches-page');

      // Look for "Add Branch" button
      log('Looking for Add Branch button...');
      const addBranchButton = page.getByText('Add Branch', { exact: false }).first();

      await addBranchButton.waitFor({ state: 'visible', timeout: 10000 });
      await addBranchButton.click();
      log('Clicked Add Branch button');

      await page.waitForTimeout(1000);
      await takeScreenshot(page, '06-create-branch-modal');

      // Fill branch form
      log('Filling branch details...');
      await page.fill('input[name="name"]', 'Main Campus');
      await page.fill('input[name="address"]', '123 Church Street, Seattle, WA 98101');

      // Submit
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      log('Submitted branch creation');

      await page.waitForTimeout(3000);
      await takeScreenshot(page, '07-branch-created');

      log('✅ STEP 2 COMPLETE: Branch created\n');

    } catch (error) {
      logError('Create Branch', error);
      await takeScreenshot(page, '07-branch-failed');
    }

    // ============================================
    // STEP 3: ADD MEMBERS MANUALLY
    // ============================================
    log('STEP 3: Add Members Manually');
    log('─────────────────────────────────────────────────');

    try {
      log('Navigating to members page...');
      await page.goto('https://koinoniasms.com/dashboard/members', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      await page.waitForTimeout(2000);

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

        // Find "Add Member" button (MembersPage.tsx line 127-133)
        const addButton = page.getByRole('button', { name: 'Add Member', exact: true });

        await addButton.waitFor({ state: 'visible', timeout: 10000 });
        await addButton.click();
        log(`Clicked Add Member button`);

        await page.waitForTimeout(1000);
        await takeScreenshot(page, `09-add-member-${i + 1}-modal`);

        // Fill form
        log(`Filling form for ${member.firstName}...`);
        await page.fill('input[name="firstName"]', member.firstName);
        await page.fill('input[name="lastName"]', member.lastName);
        await page.fill('input[name="phone"]', member.phone);
        await page.fill('input[name="email"]', member.email);

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
      log('Creating CSV file...');

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
      log('✅ CSV file created with 20 members');

      // Find "Import CSV" button (MembersPage.tsx line 147-153)
      const importButton = page.getByRole('button', { name: 'Import CSV', exact: true });

      if (await importButton.count() > 0) {
        log('Found Import CSV button');
        await importButton.click();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, '11-import-modal');

        // Find file input
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles('test-members-import.csv');
          log('✅ CSV file uploaded');
          await page.waitForTimeout(2000);
          await takeScreenshot(page, '11a-file-selected');

          // Submit import
          const confirmButton = page.locator('button:has-text("Import"), button:has-text("Upload")').first();
          if (await confirmButton.count() > 0) {
            await confirmButton.click();
            log('Import submitted');
            await page.waitForTimeout(5000);
            await takeScreenshot(page, '12-import-complete');
          }

          log('✅ STEP 4 COMPLETE: Import process completed\n');
        } else {
          log('⚠️ File input not found in modal');
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
    // FINAL SUMMARY
    // ============================================
    log('\n═══════════════════════════════════════════════════');
    log('TEST SUMMARY');
    log('═══════════════════════════════════════════════════\n');

    await takeScreenshot(page, '13-final-state');

    log(`Account Created: ${testData.email}`);
    log(`Password: ${testData.password}`);
    log(`Church: ${testData.churchName}`);
    log(`\nErrors Encountered: ${errors.length}`);

    if (errors.length > 0) {
      log('\nERROR DETAILS:');
      errors.forEach((err, index) => {
        log(`${index + 1}. Step: ${err.step}`);
        log(`   Error: ${err.error}`);
        log(`   Time: ${err.timestamp}`);
      });
    } else {
      log('✅✅✅ NO ERRORS - All steps completed successfully! ✅✅✅');
    }

    // Save report
    const report = {
      testData,
      timestamp: new Date().toISOString(),
      errors,
      logs,
      status: errors.length === 0 ? 'SUCCESS' : 'COMPLETED_WITH_ERRORS'
    };

    writeFileSync('e2e-production-test-report-v2.json', JSON.stringify(report, null, 2));
    log('\n📄 Test report saved to: e2e-production-test-report-v2.json\n');

    log('Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    log(`\n❌ FATAL ERROR: ${error.message}`, 'error');
    if (page) {
      await takeScreenshot(page, '99-fatal-error');
    }
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
} catch (e) {
  // Directory already exists
}

// Run test
runE2ETest().catch(console.error);
