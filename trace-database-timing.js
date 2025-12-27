const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function traceDatabaseTiming() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n🔍 TRACE: Database Timing Analysis\n');

    // Login
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
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Members'
      );
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(2000);

    // Get initial member count from database
    console.log('[1] Getting initial member count from database...');
    const initialDbCount = await prisma.groupMember.count({
      where: { groupId: 'cmjnzo0wq0009o29s6zrc3wt8' }
    });
    console.log('  Database count: ' + initialDbCount + '\n');

    // Get initial member count from UI
    console.log('[2] Getting initial member count from UI...');
    const initialUICount = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      return rows.length;
    });
    console.log('  UI count: ' + initialUICount + '\n');

    // Click Add Member and fill form
    console.log('[3] Submitting form...');
    const timestamp = Date.now();
    const lastName = 'TimingTest' + timestamp;

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.trim() === 'Add Member'
      );
      if (btn) btn.click();
    });
    await page.waitForTimeout(500);

    const formFillTime = Date.now();
    await page.fill('input[name="firstName"]', 'TimingTrace');
    await page.fill('input[name="lastName"]', lastName);
    await page.fill('input[name="phone"]', '+15551234567');

    const submitTime = Date.now();
    await page.click('button[type="submit"]:has-text("Add Member")');
    console.log('  Form submitted at T+' + (submitTime - timestamp) + 'ms\n');

    // Monitor database for new member - check every 100ms for 5 seconds
    console.log('[4] Monitoring database for new member creation...');
    let memberCreatedAt = null;
    let groupLinkedAt = null;

    for (let i = 0; i < 50; i++) {
      const elapsed = i * 100;

      // Check database
      const members = await prisma.member.findMany({
        where: { firstName: 'TimingTrace' },
        orderBy: { createdAt: 'desc' }
      });

      if (members.length > 0 && !memberCreatedAt) {
        const createdMs = new Date(members[0].createdAt).getTime() - timestamp;
        memberCreatedAt = elapsed;
        console.log('  ✅ Member created at T+' + memberCreatedAt + 'ms (createdAt: ' + createdMs + 'ms)');
      }

      if (members.length > 0 && !groupLinkedAt) {
        const groupMember = await prisma.groupMember.findUnique({
          where: {
            groupId_memberId: {
              groupId: 'cmjnzo0wq0009o29s6zrc3wt8',
              memberId: members[0].id
            }
          }
        });

        if (groupMember) {
          groupLinkedAt = elapsed;
          console.log('  ✅ Member linked to group at T+' + groupLinkedAt + 'ms');
          break;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('');

    // Get final database count
    console.log('[5] Getting final member count from database...');
    const finalDbCount = await prisma.groupMember.count({
      where: { groupId: 'cmjnzo0wq0009o29s6zrc3wt8' }
    });
    console.log('  Database count: ' + finalDbCount);
    console.log('  Change: ' + initialDbCount + ' → ' + finalDbCount + ' (' + (finalDbCount - initialDbCount) + ')\n');

    // Wait a bit and check UI again
    await page.waitForTimeout(2000);

    console.log('[6] Getting final member count from UI...');
    const finalUICount = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      return rows.length;
    });
    console.log('  UI count: ' + finalUICount);
    console.log('  Change: ' + initialUICount + ' → ' + finalUICount + ' (' + (finalUICount - initialUICount) + ')\n');

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('TIMING ANALYSIS SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Member created: ' + (memberCreatedAt !== null ? '✅ at T+' + memberCreatedAt + 'ms' : '❌ NOT CREATED'));
    console.log('Member linked: ' + (groupLinkedAt !== null ? '✅ at T+' + groupLinkedAt + 'ms' : '❌ NOT LINKED'));
    console.log('Database updated: ' + (finalDbCount > initialDbCount ? '✅' : '❌'));
    console.log('UI updated: ' + (finalUICount > initialUICount ? '✅' : '❌'));
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await browser.close();
  }
}

traceDatabaseTiming();
