const { PrismaClient } = require('@prisma/client');

async function debugGroupIssue() {
  const prisma = new PrismaClient();

  try {
    console.log('\n🔍 DEBUGGING GROUP ISSUE\n');

    // Get the test group directly
    const groupId = 'cmjnzo0wq0009o29s6zrc3wt8';
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    if (!group) {
      console.log('❌ Group not found: ' + groupId);
      return;
    }

    console.log('Group found:');
    console.log('  ID: ' + group.id);
    console.log('  Name: ' + group.name);
    console.log('  Admin ID: ' + (group.adminId || 'NULL'));
    console.log('  Members via _count: ' + group._count.members);
    console.log('');

    // Get admin (if any)
    if (group.adminId) {
      const admin = await prisma.admin.findUnique({
        where: { id: group.adminId }
      });
      if (admin) {
        console.log('Admin:');
        console.log('  Email: ' + admin.email);
        console.log('  Welcome completed: ' + admin.welcomeCompleted);
      }
    } else {
      console.log('No admin linked to this group!');
    }
    console.log('');

    // Get all members in this group
    console.log('[1] All members in group:');
    const members = await prisma.groupMember.findMany({
      where: { groupId: groupId },
      include: { member: true }
    });

    console.log('  Total: ' + members.length);
    members.forEach((gm, idx) => {
      console.log('  [' + (idx + 1) + '] ' + gm.member.firstName + ' ' + gm.member.lastName);
      console.log('      ID: ' + gm.member.id);
      console.log('      Created: ' + (gm.createdAt ? gm.createdAt.toISOString() : 'NULL'));
    });
    console.log('');

    // Get TraceTest member specifically
    console.log('[2] TraceTest member in DB:');
    const traceTestMembers = await prisma.member.findMany({
      where: { firstName: 'TestTrace' }
    });

    console.log('  Total TraceTest members: ' + traceTestMembers.length);
    traceTestMembers.forEach((m, idx) => {
      console.log('  [' + (idx + 1) + '] ' + m.firstName + ' ' + m.lastName);
      console.log('      ID: ' + m.id);
    });
    console.log('');

    // Check GroupMember for the TraceTest member
    if (traceTestMembers.length > 0) {
      const lastTraceTest = traceTestMembers[traceTestMembers.length - 1];
      const groupMemberRecord = await prisma.groupMember.findUnique({
        where: {
          groupId_memberId: {
            groupId: groupId,
            memberId: lastTraceTest.id
          }
        }
      });

      console.log('[3] GroupMember record for TraceTest:');
      if (groupMemberRecord) {
        console.log('  Found: ✅ YES');
        console.log('  Created: ' + (groupMemberRecord.createdAt ? groupMemberRecord.createdAt.toISOString() : 'NULL'));
        console.log('  Imported: ' + groupMemberRecord.imported);
      } else {
        console.log('  Found: ❌ NO');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugGroupIssue();
