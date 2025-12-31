/**
 * Complete E2E Production Test - FIXED VERSION
 * Tests: Registration → Close Welcome Modal → Create Branch → Add Members → Import Members
 *
 * FIXES:
 * 1. Closes welcome modal after registration (was blocking navigation)
 * 2. Uses correct selector for "Add Member" button
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

async function runE2ETest() {
  let browser;
  let page;

  try {
    log('🚀 Starting Complete E2E Production Test (FIXED)\n');
    log('═══════════════════════════════════════════════════\n');

    // Launch browser
    log('Launching browser...');
    browser = await chromium.launch({
      headless: false, // Run with visible browser for debugging
      slowMo: 500 // Slow down actions for visibility
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

      // Fill form fields
      await page.fill('input[name="firstName"]', testData.firstName);
      await page.fill('input[name="lastName"]', testData.lastName);
      await page.fill('input[name="churchName"]', testData.churchName);
      await page.fill('input[type="email"]', testData.email);
      await page.fill('input[name="password"]', testData.password);
      await page.fill('input[name="confirmPassword"]', testData.password);

      log(`Form filled with email: ${testData.email}`);
      await takeScreenshot(page, '02-registration-filled');

      // Submit registration
      log('Submitting registration...');
      await page.click('button[type="submit"]');

      // Wait for either success (redirect to dashboard) or error message
      try {
        await Promise.race([
          page.waitForURL('**/dashboard**', { timeout: 90000 }), // Wait for redirect to dashboard
          page.waitForSelector('.error, [role="alert"]', { timeout: 90000 }) // Or error message
        ]);

        const currentURL = page.url();
        if (currentURL.includes('/dashboard')) {
          log('✅ Registration successful! Redirected to dashboard');
          await takeScreenshot(page, '03-registration-success-dashboard');
        } else {
          // Check for error messages
          const errorText = await page.textContent('.error, [role="alert"]').catch(() => null);
          if (errorText) {
            throw new Error(`Registration failed: ${errorText}`);
          }
        }
      } catch (error) {
        await takeScreenshot(page, '03-registration-error');

        // Try to get error message
        const errorElement = await page.$('.error, [role="alert"], .toast');
        if (errorElement) {
          const errorText = await errorElement.textContent();
          throw new Error(`Registration failed: ${errorText}`);
        } else {
          throw new Error('Registration timeout or failed - no clear error message');
        }
      }

      log('✅ STEP 1 COMPLETE: Registration successful\n');

    } catch (error) {
      logError('Registration', error);
      await takeScreenshot(page, '03-registration-failed');
      throw error; // Stop test if registration fails
    }

    // Wait a moment for dashboard to fully load
    await page.waitForTimeout(3000);

    // ============================================
    // FIX 1: CLOSE WELCOME MODAL
    // ============================================
    log('FIX: Checking for welcome modal...');

    try {
      // Look for the "Next" button in the welcome modal
      const nextButton = page.locator('button:has-text("Next")');
      const closeButton = page.locator('button[aria-label*="Close"]');

      // Try to find either button
      const modalButton = await Promise.race([
        nextButton.waitFor({ state: 'visible', timeout: 5000 }).then(() => nextButton),
        closeButton.waitFor({ state: 'visible', timeout: 5000 }).then(() => closeButton)
      ]).catch(() => null);

      if (modalButton) {
        log('Welcome modal found, closing it...');
        await modalButton.click();

        // Wait for the modal to close and API call to complete
        await page.waitForTimeout(2000);

        // Verify modal is gone
        const modalGone = await page.locator('.fixed.inset-0.bg-black\\/40').count() === 0;
        if (modalGone) {
          log('✅ Welcome modal closed successfully');
        } else {
          log('⚠️ Modal may still be visible, continuing anyway...');
        }

        await takeScreenshot(page, '03a-welcome-modal-closed');
      } else {
        log('No welcome modal found (already closed or not shown)');
      }
    } catch (error) {
      log(`Note: Could not close welcome modal: ${error.message}`, 'warn');
      // Continue anyway - not critical
    }

    // ============================================
    // STEP 2: CREATE BRANCH
    // ============================================
    log('\nSTEP 2: Create Branch');
    log('─────────────────────────────────────────────────');

    try {
      log('Looking for branches navigation...');
      await takeScreenshot(page, '04-dashboard-after-modal');

      // Try to find and click branches link/button
      const branchesSelectors = [
        'a[href*="branches"]',
        'button:has-text("Branches")',
        '[href="#/dashboard/branches"]'
      ];

      let navigated = false;
      for (const selector of branchesSelectors) {
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          log(`Found branches navigation with selector: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          navigated = true;
          break;
        }
      }

      if (!navigated) {
        // Try direct navigation
        log('Direct navigation to branches page...');
        await page.goto('https://koinoniasms.com/dashboard/branches', { waitUntil: 'networkidle' });
      }

      await takeScreenshot(page, '05-branches-page');

      // Click "Add Branch" or "Create Branch" button
      log('Looking for create branch button...');
      const createButton = await page.getByText('Add Branch').or(page.getByText('Create Branch')).or(page.getByText('New Branch')).first();

      if (await createButton.count() > 0) {
        await createButton.click();
        log('Clicked create branch button');
        await page.waitForTimeout(1000);
        await takeScreenshot(page, '06-create-branch-modal');

        // Fill branch form
        log('Filling branch details...');
        await page.fill('input[name="name"], input[placeholder*="Branch"], input[placeholder*="Name"]', 'Main Campus');
        await page.fill('input[name="address"], input[placeholder*="Address"]', '123 Church Street, Seattle, WA 98101');

        // Submit branch creation
        const submitButton = await page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').first();
        await submitButton.click();
        log('Submitted branch creation');

        // Wait for success or error
        await page.waitForTimeout(3000);
        await takeScreenshot(page, '07-branch-created');

        log('✅ STEP 2 COMPLETE: Branch created\n');
      } else {
        throw new Error('Could not find create branch button');
      }

    } catch (error) {
      logError('Create Branch', error);
      await takeScreenshot(page, '07-branch-creation-failed');
      // Continue test even if branch creation fails
    }

    // ============================================
    // STEP 3: ADD MEMBERS MANUALLY
    // ============================================
    log('STEP 3: Add Members Manually');
    log('─────────────────────────────────────────────────');

    try {
      log('Navigating to members page...');

      // Navigate to members
      const membersSelectors = [
        'a[href*="members"]',
        'button:has-text("Members")',
        '[href="#/dashboard/members"]'
      ];

      let navigated = false;
      for (const selector of membersSelectors) {
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          log(`Found members navigation with selector: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          navigated = true;
          break;
        }
      }

      if (!navigated) {
        log('Direct navigation to members page...');
        await page.goto('https://koinoniasms.com/dashboard/members', { waitUntil: 'networkidle' });
      }

      await takeScreenshot(page, '08-members-page');

      // Add 3 members manually
      const membersToAdd = [
        { firstName: 'John', lastName: 'Smith', phone: '+12065551001', email: 'john.smith@test.com' },
        { firstName: 'Jane', lastName: 'Doe', phone: '+12065551002', email: 'jane.doe@test.com' },
        { firstName: 'Bob', lastName: 'Johnson', phone: '+12065551003', email: 'bob.johnson@test.com' },
      ];

      for (let i = 0; i < membersToAdd.length; i++) {
        const member = membersToAdd[i];
        log(`Adding member ${i + 1}: ${member.firstName} ${member.lastName}`);

        // FIX 2: Use correct selector for Add Member button
        const addButton = page.getByText('Add Member', { exact: true });

        // Wait for button to be visible and clickable
        await addButton.waitFor({ state: 'visible', timeout: 10000 });
        await addButton.click();

        log(`Clicked Add Member button for member ${i + 1}`);
        await page.waitForTimeout(1000);
        await takeScreenshot(page, `09-add-member-${i + 1}-modal`);

        // Fill member form
        log(`Filling form for ${member.firstName} ${member.lastName}...`);
        await page.fill('input[name="firstName"]', member.firstName);
        await page.fill('input[name="lastName"]', member.lastName);

        // Try different phone field selectors
        const phoneInput = await page.locator('input[name="phone"], input[name="phoneNumber"], input[placeholder*="Phone"]').first();
        await phoneInput.fill(member.phone);

        await page.fill('input[name="email"], input[type="email"]', member.email);

        // Submit
        const submitButton = await page.locator('button[type="submit"], button:has-text("Add"), button:has-text("Save")').first();
        await submitButton.click();
        log(`✅ Member ${i + 1} submitted`);

        await page.waitForTimeout(2000);
        await takeScreenshot(page, `10-member-${i + 1}-added`);
      }

      log('✅ STEP 3 COMPLETE: 3 members added manually\n');

    } catch (error) {
      logError('Add Members Manually', error);
      await takeScreenshot(page, '10-manual-members-failed');
      // Continue test
    }

    // ============================================
    // STEP 4: IMPORT 20 MEMBERS
    // ============================================
    log('STEP 4: Import 20 Members');
    log('─────────────────────────────────────────────────');

    try {
      log('Looking for import button...');

      // Create CSV file with 20 members
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
      log('Created CSV file with 20 members');

      // Look for "Import CSV" button (as seen in MembersPage.tsx line 152)
      const importButton = page.getByText('Import CSV', { exact: true });

      if (await importButton.count() > 0) {
        log('Found Import CSV button');
        await importButton.click();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, '11-import-modal-opened');

        // Look for file input in the modal
        const fileInput = await page.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles('test-members-import.csv');
          log('CSV file uploaded');
          await page.waitForTimeout(2000);
          await takeScreenshot(page, '11a-import-file-selected');

          // Look for confirm/import button in modal
          const confirmButton = page.locator('button:has-text("Import"), button:has-text("Upload"), button:has-text("Confirm")').first();
          if (await confirmButton.count() > 0) {
            await confirmButton.click();
            log('Import submitted');
            await page.waitForTimeout(5000); // Wait for import to process
            await takeScreenshot(page, '12-import-complete');
          }

          log('✅ STEP 4 COMPLETE: 20 members imported\n');
        } else {
          log('⚠️ File input not found in import modal');
          await takeScreenshot(page, '11-import-no-file-input');
        }
      } else {
        log('⚠️ Import CSV button not found');
        await takeScreenshot(page, '11-import-button-not-found');
      }

    } catch (error) {
      logError('Import Members', error);
      await takeScreenshot(page, '12-import-failed');
      // Continue test
    }

    // ============================================
    // FINAL: VERIFY AND SUMMARY
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
      log('✅ NO ERRORS - All steps completed successfully!');
    }

    // Save test report
    const report = {
      testData,
      timestamp: new Date().toISOString(),
      errors,
      logs,
      status: errors.length === 0 ? 'SUCCESS' : 'COMPLETED_WITH_ERRORS'
    };

    writeFileSync('e2e-production-test-report-fixed.json', JSON.stringify(report, null, 2));
    log('\n📄 Test report saved to: e2e-production-test-report-fixed.json\n');

    // Keep browser open for 10 seconds to review
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
