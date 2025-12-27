const { PrismaClient } = require('@prisma/client');

async function checkMemberCreation() {
  const prisma = new PrismaClient();

  try {
    console.log('\n🔍 CHECKING DATABASE FOR TRACE TEST MEMBERS\n');

    // Get all members created in the last 2 minutes with "TraceTest" in name
    const timestamp2MinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const traceMembers = await prisma.member.findMany({
      where: {
        firstName: 'TestTrace',
        createdAt: {
          gte: timestamp2MinutesAgo
        }
      },
      include: {
        groups: true
      }
    });

    console.log('Members with firstName=TestTrace created in last 2 minutes:');
    console.log('  Count: ' + traceMembers.length);
    traceMembers.forEach((member, idx) => {
      console.log('  [' + (idx + 1) + '] ' + member.firstName + ' ' + member.lastName);
      console.log('      ID: ' + member.id);
      console.log('      Phone: ' + member.phone);
      console.log('      Created: ' + member.createdAt.toISOString());
      console.log('      Linked groups: ' + member.groups.length);
      member.groups.forEach((group, gIdx) => {
        console.log('        [' + (gIdx + 1) + '] ' + group.id);
      });
    });
    console.log('');

    // Get the test group (DOKaA group)
    const testAdmin = await prisma.admin.findFirst({
      where: { email: 'DOKaA@GMAIL.COM' }
    });

    if (testAdmin) {
      console.log('Test admin found: ' + testAdmin.id);

      const testGroup = await prisma.group.findFirst({
        where: { adminId: testAdmin.id },
        include: {
          members: {
            where: {
              createdAt: {
                gte: timestamp2MinutesAgo
              }
            }
          }
        }
      });

      if (testGroup) {
        console.log('Test group found: ' + testGroup.id);
        console.log('  Total members in group: ' + testGroup._count?.members || 'N/A');
        console.log('  Members added in last 2 minutes: ' + testGroup.members.length);
        testGroup.members.forEach((member, idx) => {
          console.log('    [' + (idx + 1) + '] ' + member.firstName + ' ' + member.lastName + ' (ID: ' + member.id + ')');
        });
      } else {
        console.log('No test group found');
      }
    } else {
      console.log('Test admin not found');
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('ANALYSIS:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Members created in DB: ' + (traceMembers.length > 0 ? '✅ YES (' + traceMembers.length + ')' : '❌ NO'));

    if (traceMembers.length > 0) {
      const firstMember = traceMembers[0];
      console.log('Member linked to group: ' + (firstMember.groups.length > 0 ? '✅ YES' : '❌ NO'));

      const testGroup = await prisma.group.findFirst({
        where: { adminId: testAdmin.id },
        select: { id: true }
      });

      if (testGroup && firstMember.groups.some(g => g.id === testGroup.id)) {
        console.log('Member linked to correct group: ✅ YES');
      } else {
        console.log('Member linked to correct group: ❌ NO');
      }
    }
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMemberCreation();
