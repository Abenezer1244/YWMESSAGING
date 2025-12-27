const { chromium } = require('playwright');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function checkMemberPages() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║         CHECK MEMBER LIST PAGINATION                            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Login
    console.log('[STEP 1] Logging in...');
    await page.goto('https://koinoniasms.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'DOKaA@GMAIL.COM');
    await page.fill('input[type="password"]', '12!Michael');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });

    await page.waitForTimeout(2000);

    // Close welcome modal
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next'));
      if (btn) btn.click();
    });
    await page.waitForTimeout(1500);

    // Navigate to Members
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});

    // Close modals
    for (let i = 0; i < 3; i++) {
      await page.press('body', 'Escape');
      await page.waitForTimeout(300);
    }

    await page.waitForTimeout(1000);

    // Get initial info
    const info1 = await page.evaluate(() => {
      const memberRows = Array.from(document.querySelectorAll('table tbody tr')).map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        return {
          name: cells[0]?.textContent?.trim() || '',
          phone: cells[1]?.textContent?.trim() || '',
        };
      });

      return {
        title: 'PAGE 1',
        totalMembers: document.body.innerText.match(/(\d+)\s*members?/i)?.[1],
        membersOnPage: memberRows.length,
        members: memberRows,
        hasNextBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next'))
      };
    });

    console.log('PAGE 1:');
    console.log(`  Total members in group: ${info1.totalMembers}`);
    console.log(`  Members shown on this page: ${info1.membersOnPage}`);
    console.log('  Members:');
    info1.members.forEach(m => {
      console.log(`    - ${m.name} (${m.phone})`);
    });
    console.log(`  Has Next button: ${info1.hasNextBtn}`);

    // If there's a next button, click it
    if (info1.hasNextBtn) {
      console.log('\n[Clicking Next...]');
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(2000);

      const info2 = await page.evaluate(() => {
        const memberRows = Array.from(document.querySelectorAll('table tbody tr')).map(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          return {
            name: cells[0]?.textContent?.trim() || '',
            phone: cells[1]?.textContent?.trim() || '',
          };
        });

        return {
          membersOnPage: memberRows.length,
          members: memberRows,
          hasPrevBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Previous')),
          hasNextBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next'))
        };
      });

      console.log('\nPAGE 2:');
      console.log(`  Members shown on this page: ${info2.membersOnPage}`);
      console.log('  Members:');
      info2.members.forEach(m => {
        console.log(`    - ${m.name} (${m.phone})`);
      });
      console.log(`  Has Previous button: ${info2.hasPrevBtn}`);
      console.log(`  Has Next button: ${info2.hasNextBtn}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

checkMemberPages();
