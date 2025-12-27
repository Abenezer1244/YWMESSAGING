const { PrismaClient } = require('@prisma/client');

async function checkGroupMembership() {
  const prisma = new PrismaClient();

  try {
    console.log('\n🔍 CHECKING GROUP MEMBERSHIP DETAILS\n');

    // Find the TraceTest member
    const traceMember = await prisma.member.findFirst({
      where: {
        firstName: 'TestTrace'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!traceMember) {
      console.log('❌ No TraceTest member found');
      return;
    }

    console.log('TraceTest member found:');
    console.log('  ID: ' + traceMember.id);
    console.log('  Name: ' + traceMember.firstName + ' ' + traceMember.lastName);
    console.log('');

    // Check GroupMember entries
    console.log('[1] Checking GroupMember table entries:');
    const groupMembers = await prisma.groupMember.findMany({
      where: { memberId: traceMember.id },
      include: { group: true }
    });

    console.log('  GroupMember records: ' + groupMembers.length);
    groupMembers.forEach((gm, idx) => {
      console.log('  [' + (idx + 1) + '] Group: ' + gm.group.id);
      console.log('      Group name: ' + gm.group.name);
      console.log('      Admin: ' + gm.group.adminId);
      console.log('      Created: ' + gm.createdAt.toISOString());
    });
    console.log('');

    // Get the group we linked to
    if (groupMembers.length > 0) {
      const groupId = groupMembers[0].groupId;
      const group = groupMembers[0].group;

      console.log('[2] Checking if member is in group member list:');
      const memberInGroup = await prisma.groupMember.findMany({
        where: { groupId: groupId },
        include: { member: true }
      });

      console.log('  Group ID: ' + groupId);
      console.log('  Total members in group: ' + memberInGroup.length);

      const hasTraceTest = memberInGroup.some(gm => gm.member.firstName === 'TestTrace');
      console.log('  TraceTest in group: ' + (hasTraceTest ? '✅ YES' : '❌ NO'));

      // Find how many groups this admin has
      console.log('');
      console.log('[3] Admin information:');
      const admin = group.adminId ? await prisma.admin.findUnique({
        where: { id: group.adminId },
        include: {
          groups: {
            select: { id: true, name: true }
          }
        }
      }) : null;

      if (admin) {
        console.log('  Admin email: ' + admin.email);
        console.log('  Admin groups: ' + admin.groups.length);
        admin.groups.forEach((g, idx) => {
          console.log('    [' + (idx + 1) + '] ' + g.id + ' (' + g.name + ')');
        });

        // Show which group we're checking
        console.log('');
        console.log('[4] Test scenario:');
        console.log('  Linked group ID: ' + groupId);
        console.log('  Is primary group: ' + (admin.groups[0]?.id === groupId ? '✅ YES' : '❌ NO (primary: ' + admin.groups[0]?.id + ')'));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkGroupMembership();
