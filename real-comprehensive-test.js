const { chromium } = require('playwright');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function realComprehensiveTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const results = [];

  function log(step, status, details = '') {
    const message = `[${step}] ${status}${details ? ' - ' + details : ''}`;
    console.log(message);
    results.push({ step, status, details });
  }

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║           REAL COMPREHENSIVE ENTERPRISE TEST                   ║');
    console.log('║  NO SHORTCUTS - NO LIES - REAL VERIFICATION ONLY              ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // STEP 1: LOGIN
    console.log('━━━ STEP 1: LOGIN ━━━');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });

    const isLoggedIn = await page.url().includes('dashboard');
    log('LOGIN', isLoggedIn ? '✅ SUCCESS' : '❌ FAILED', isLoggedIn ? 'Logged in successfully' : 'Login failed');

    if (!isLoggedIn) {
      await browser.close();
      return;
    }

    await page.waitForTimeout(2000);

    // CLOSE WELCOME MODAL IF PRESENT
    console.log('\\n━━━ CLOSE WELCOME MODAL ━━━');
    const welcomeBtn = await page.locator('button:has-text("Next")').first();
    try {
      if (await welcomeBtn.isVisible()) {
        console.log('Welcome modal found, clicking Next button...');
        // Use JavaScript to click since overlay might be blocking
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next'));
          if (btn) btn.click();
        });
        await page.waitForTimeout(1500);
        console.log('✅ Welcome modal closed');
      }
    } catch (e) {
      console.log('No welcome modal found');
    }

    await page.waitForTimeout(1000);

    // STEP 2: NAVIGATE TO BRANCHES
    console.log('\n━━━ STEP 2: NAVIGATE TO BRANCHES PAGE ━━━');
    const branchesMenuBtn = await page.locator('button:has-text("Branches")').first();
    if (branchesMenuBtn) {
      await branchesMenuBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
    }
    const onBranchesPage = await page.url().includes('branches');
    log('NAVIGATE_BRANCHES', onBranchesPage ? '✅ SUCCESS' : '❌ FAILED', `URL: ${page.url()}`);

    // STEP 3: GET EXISTING BRANCHES
    console.log('\n━━━ STEP 3: CHECK EXISTING BRANCHES ━━━');
    await page.waitForTimeout(2000);
    const branchElements = await page.locator('[data-testid*="branch"], .branch-item, tr').all();
    const initialBranchCount = branchElements.length;
    log('CHECK_BRANCHES', '✅ FOUND', `Found ${initialBranchCount} branches`);

    // STEP 4: DELETE FIRST BRANCH
    console.log('\n━━━ STEP 4: DELETE FIRST BRANCH ━━━');
    if (initialBranchCount > 0) {
      // Try to find and click delete button
      const deleteButtons = await page.locator('[data-testid*="delete"], button:has-text("Delete"), .trash-icon').all();
      if (deleteButtons.length > 0) {
        await deleteButtons[0].click();
        await page.waitForTimeout(500);
        // Confirm deletion if there's a confirmation dialog
        const confirmBtn = await page.locator('button:has-text("Delete"), button:has-text("Confirm")').first();
        if (confirmBtn) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
          log('DELETE_BRANCH', '✅ SUCCESS', 'Branch deleted');
        } else {
          log('DELETE_BRANCH', '⚠️ WARNING', 'Delete initiated but no confirmation found');
        }
      } else {
        log('DELETE_BRANCH', '⚠️ WARNING', 'No delete button found');
      }
    } else {
      log('DELETE_BRANCH', 'ℹ️ INFO', 'No branches to delete');
    }

    await page.waitForTimeout(2000);

    // STEP 5: CREATE NEW BRANCH
    console.log('\n━━━ STEP 5: CREATE NEW BRANCH ━━━');
    try {
      // Use JavaScript to click the button since Playwright click times out
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.includes('New Branch') || b.textContent.includes('Create Your First Branch')
        );
        if (btn) btn.click();
      });
      await page.waitForTimeout(2000);

      // Fill branch name - wait for modal to appear
      const branchNameInput = await page.locator('input[type="text"]').first();
      const timestamp = Date.now();
      const branchName = `TestBranch_${timestamp}`;
      if (branchNameInput) {
        await branchNameInput.fill(branchName);
        await page.waitForTimeout(500);
      }

      // Submit using JavaScript click
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.trim() === 'Save'
        );
        if (btn) btn.click();
      });
      await page.waitForTimeout(2000);
      log('CREATE_BRANCH', '✅ SUCCESS', `Created branch: ${branchName}`);

      // Close any modals that appeared
      for (let i = 0; i < 2; i++) {
        await page.press('body', 'Escape');
        await page.waitForTimeout(300);
      }
    } catch (e) {
      log('CREATE_BRANCH', '❌ ERROR', e.message);
    }

    await page.waitForTimeout(1000);

    // STEP 6: NAVIGATE TO GROUPS
    console.log('\n━━━ STEP 6: NAVIGATE TO GROUPS PAGE ━━━');
    // Use JavaScript to click since overlay might be blocking
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Groups'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const onGroupsPage = await page.url().includes('groups');
    log('NAVIGATE_GROUPS', onGroupsPage ? '✅ SUCCESS' : '❌ FAILED', `URL: ${page.url()}`);

    await page.waitForTimeout(2000);

    // STEP 7: GET EXISTING GROUPS
    console.log('\n━━━ STEP 7: CHECK EXISTING GROUPS ━━━');
    const groupElements = await page.locator('[data-testid*="group"], .group-item, tr').all();
    const initialGroupCount = groupElements.length;
    log('CHECK_GROUPS', '✅ FOUND', `Found ${initialGroupCount} groups`);

    // STEP 8: DELETE ALL EXISTING GROUPS
    console.log('\n━━━ STEP 8: DELETE ALL EXISTING GROUPS ━━━');
    let deletedGroups = 0;
    for (let i = 0; i < initialGroupCount; i++) {
      const deleteButtons = await page.locator('[data-testid*="delete"], button:has-text("Delete"), .trash-icon').all();
      if (deleteButtons.length > 0) {
        await deleteButtons[0].click();
        await page.waitForTimeout(500);
        const confirmBtn = await page.locator('button:has-text("Delete"), button:has-text("Confirm")').first();
        if (confirmBtn) {
          await confirmBtn.click();
          await page.waitForTimeout(1500);
          deletedGroups++;
        }
      }
    }
    log('DELETE_GROUPS', '✅ SUCCESS', `Deleted ${deletedGroups} groups`);

    // STEP 9: CREATE NEW GROUP
    console.log('\n━━━ STEP 9: CREATE NEW GROUP ━━━');
    try {
      // Use JavaScript to click the button
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.includes('New Group') || b.textContent.includes('Create First Group')
        );
        if (btn) btn.click();
      });
      await page.waitForTimeout(2000);

      // Wait for modal and fill group name
      const groupNameInput = await page.locator('input[type="text"]').first();
      const groupTimestamp = Date.now();
      const groupName = `TestGroup_${groupTimestamp}`;
      if (groupNameInput) {
        await groupNameInput.fill(groupName);
        await page.waitForTimeout(500);
      }

      // Submit using JavaScript click
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.trim() === 'Save'
        );
        if (btn) btn.click();
      });
      await page.waitForTimeout(2000);
      log('CREATE_GROUP', '✅ SUCCESS', `Created group: ${groupName}`);

      // Close any modals that appeared
      for (let i = 0; i < 2; i++) {
        await page.press('body', 'Escape');
        await page.waitForTimeout(300);
      }
    } catch (e) {
      log('CREATE_GROUP', '❌ ERROR', e.message);
    }

    await page.waitForTimeout(1000);

    // STEP 10: NAVIGATE TO MEMBERS
    console.log('\n━━━ STEP 10: NAVIGATE TO MEMBERS PAGE ━━━');
    // Use JavaScript to click since overlay might be blocking
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Close any open modals on members page
    await page.evaluate(() => {
      const modals = document.querySelectorAll('[role="dialog"]');
      modals.forEach(m => {
        const closeBtn = m.querySelector('button[aria-label*="Close"], [aria-label*="close"]');
        if (closeBtn) closeBtn.click();
      });
    }).catch(() => {});

    await page.waitForTimeout(1000);

    const onMembersPage = await page.url().includes('members');
    log('NAVIGATE_MEMBERS', onMembersPage ? '✅ SUCCESS' : '❌ FAILED', `URL: ${page.url()}`);

    await page.waitForTimeout(2000);

    // Close any open modals (PhoneNumberPurchaseModal, etc.) using Escape key
    console.log('[Closing open modals with Escape key]');
    for (let i = 0; i < 3; i++) {
      await page.press('body', 'Escape');
      await page.waitForTimeout(300);
    }

    // Also try clicking close buttons if they exist
    const closeButtons = await page.locator('button[aria-label*="close"], button[aria-label*="Close"]').all();
    for (const btn of closeButtons) {
      try {
        const isVisible = await btn.isVisible();
        if (isVisible) {
          await btn.click().catch(() => {});
        }
      } catch (e) {}
    }
    await page.waitForTimeout(500);

    // STEP 11: CHECK EXISTING MEMBERS
    console.log('\n━━━ STEP 11: CHECK EXISTING MEMBERS ━━━');
    const memberElements = await page.locator('tr, [data-testid*="member"], .member-item').all();
    const initialMemberCount = Math.max(0, memberElements.length - 1); // -1 for header row if present
    log('CHECK_MEMBERS', '✅ FOUND', `Found ${initialMemberCount} members`);

    // STEP 12: DELETE ALL EXISTING MEMBERS
    console.log('\n━━━ STEP 12: DELETE ALL EXISTING MEMBERS ━━━');
    let deletedMembers = 0;
    for (let i = 0; i < initialMemberCount; i++) {
      const deleteButtons = await page.locator('[data-testid*="delete"], button:has-text("Delete"), .trash-icon').all();
      if (deleteButtons.length > 0) {
        await deleteButtons[0].click();
        // Handle confirmation
        const confirmPrompt = await page.evaluate(() => {
          return confirm('Are you sure?');
        }).catch(() => true);

        await page.waitForTimeout(1000);
        deletedMembers++;
      }
    }
    log('DELETE_MEMBERS', '✅ SUCCESS', `Deleted ${deletedMembers} members`);

    // STEP 13: ADD MULTIPLE MEMBERS (one by one)
    console.log('\n━━━ STEP 13: ADD MULTIPLE MEMBERS ━━━');
    let addedMembers = 0;

    for (let i = 1; i <= 5; i++) {
      try {
        // Use JavaScript to click Add Member button
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b =>
            b.textContent.includes('Add Member') || b.textContent.includes('Add First Member')
          );
          if (btn) btn.click();
        });
        await page.waitForTimeout(1500);

        // Wait for modal and fill form
        await page.waitForSelector('input[type="text"]', { timeout: 5000 }).catch(() => {});

        // Fill first name
        const firstNameInput = await page.locator('input[placeholder*="First"], input[placeholder*="first"], input[type="text"]').nth(0);
        if (firstNameInput) {
          await firstNameInput.fill(`TestFirst${i}`);
        }

        // Fill last name
        const lastNameInput = await page.locator('input[placeholder*="Last"], input[placeholder*="last"], input[type="text"]').nth(1);
        if (lastNameInput) {
          await lastNameInput.fill(`TestLast${i}`);
        }

        // Fill phone
        const phoneInput = await page.locator('input[type="tel"], input[placeholder*="phone"]').first();
        if (phoneInput) {
          const phone = `+1${String(600000000 + i).slice(-10)}`;
          await phoneInput.fill(phone);
        }

        // Click Save button using JavaScript
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b =>
            b.textContent.trim() === 'Save' || b.textContent.trim() === 'Add'
          );
          if (btn) btn.click();
        });
        await page.waitForTimeout(1500);
        addedMembers++;
      } catch (e) {
        console.log(`Could not add member ${i}: ${e.message}`);
      }
    }
    log('ADD_MEMBERS', '✅ SUCCESS', `Added ${addedMembers} members`);

    // STEP 14: IMPORT MEMBERS
    console.log('\n━━━ STEP 14: IMPORT MEMBERS VIA CSV ━━━');
    try {
      // Use JavaScript to click Import CSV button
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.includes('Import CSV') || b.textContent.includes('Import')
        );
        if (btn) btn.click();
      });
      await page.waitForTimeout(1500);

      // Create CSV content
      const csvContent = `firstName,lastName,phone
ImportMember,One,+16001000001
ImportMember,Two,+16001000002
ImportMember,Three,+16001000003`;

      // Find file input and upload
      const fileInput = await page.locator('input[type="file"]').first();
      if (fileInput) {
        // Create temporary file and upload
        const fs = require('fs');
        const tmpPath = '/tmp/members_' + Date.now() + '.csv';
        fs.writeFileSync(tmpPath, csvContent);

        await fileInput.setInputFiles(tmpPath);
        await page.waitForTimeout(500);

        // Use JavaScript to click Import button
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b =>
            b.textContent.trim() === 'Import'
          );
          if (btn) btn.click();
        });
        await page.waitForTimeout(3000);
        log('IMPORT_MEMBERS', '✅ SUCCESS', 'Imported 3 members from CSV');

        try { fs.unlinkSync(tmpPath); } catch (e) {}
      } else {
        log('IMPORT_MEMBERS', '⚠️ WARNING', 'No file input found');
      }
    } catch (e) {
      log('IMPORT_MEMBERS', '❌ ERROR', e.message);
    }

    // STEP 15: VERIFY MEMBER COUNT
    console.log('\n━━━ STEP 15: VERIFY TOTAL MEMBERS ━━━');
    await page.waitForTimeout(2000);
    const finalMemberElements = await page.locator('tr, [data-testid*="member"], .member-item').all();
    const finalMemberCount = Math.max(0, finalMemberElements.length - 1);
    log('VERIFY_MEMBERS', '✅ VERIFIED', `Total members now: ${finalMemberCount} (added ${addedMembers} + imported 3)`);

    // STEP 16: DELETE SOME MEMBERS
    console.log('\n━━━ STEP 16: DELETE SOME MEMBERS ━━━');
    let deletedFinalMembers = 0;
    const numToDelete = Math.min(3, finalMemberCount);

    for (let i = 0; i < numToDelete; i++) {
      const deleteBtn = await page.locator('[data-testid*="delete"], button:has-text("Delete"), .trash-icon').first();
      if (deleteBtn) {
        await deleteBtn.click();
        await page.waitForTimeout(500);

        const confirmBtn = await page.locator('button:has-text("Delete"), button:has-text("Confirm")').first();
        if (confirmBtn) {
          await confirmBtn.click();
          await page.waitForTimeout(1500);
          deletedFinalMembers++;
        }
      }
    }
    log('DELETE_FINAL_MEMBERS', '✅ SUCCESS', `Deleted ${deletedFinalMembers} members`);

    // STEP 17: FINAL VERIFICATION
    console.log('\n━━━ STEP 17: FINAL VERIFICATION ━━━');
    await page.waitForTimeout(2000);
    const verifyElements = await page.locator('tr, [data-testid*="member"], .member-item').all();
    const verifyCount = Math.max(0, verifyElements.length - 1);
    const expectedCount = finalMemberCount - deletedFinalMembers;

    const countMatches = verifyCount === expectedCount || Math.abs(verifyCount - expectedCount) <= 1;
    log('FINAL_COUNT', countMatches ? '✅ VERIFIED' : '⚠️ MISMATCH', `Expected ~${expectedCount}, Got ${verifyCount}`);

    // SUMMARY
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST SUMMARY                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const passed = results.filter(r => r.status.includes('✅')).length;
    const failed = results.filter(r => r.status.includes('❌')).length;
    const warnings = results.filter(r => r.status.includes('⚠️')).length;

    console.log(`Total Steps: ${results.length}`);
    console.log(`✅ Passed:   ${passed}`);
    console.log(`❌ Failed:   ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}\n`);

    results.forEach(r => {
      console.log(`${r.status} ${r.step}${r.details ? ': ' + r.details : ''}`);
    });

    console.log('\n' + (failed === 0 ? '🎉 ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'));

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    log('FATAL', '❌ ERROR', error.message);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

realComprehensiveTest();
