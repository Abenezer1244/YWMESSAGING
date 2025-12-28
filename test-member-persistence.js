const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMemberPersistence() {
  console.log('\n🧪 TESTING MEMBER PERSISTENCE\n');

  try {
    // Get a recent group (the one from new account)
    const groups = await prisma.group.findMany({
      where: {
        branch: {
          church: {
            // Get the most recent church
            name: { contains: '' }, // Get any church
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
      include: {
        branch: {
          include: {
            church: true
          }
        },
        members: {
          include: {
            member: true
          }
        }
      }
    });

    if (!groups.length) {
      console.log('❌ No groups found in database');
      return;
    }

    const group = groups[0];
    const church = group.branch.church;

    console.log(`✅ Found group: ${group.name}`);
    console.log(`   Church: ${church.name}`);
    console.log(`   Group ID: ${group.id}`);
    console.log(`   Members in group: ${group.members.length}\n`);

    if (group.members.length > 0) {
      console.log('Members linked to this group:');
      for (const gm of group.members) {
        console.log(`  - ${gm.member.firstName} ${gm.member.lastName} (ID: ${gm.member.id})`);
      }
    } else {
      console.log('⚠️  No members linked to this group');
    }

    // Check GroupMember records directly
    console.log('\nChecking GroupMember records directly:');
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId: group.id },
      include: { member: true }
    });

    console.log(`Found ${groupMembers.length} GroupMember records:`);
    for (const gm of groupMembers) {
      console.log(`  - GroupMember ID: ${gm.id}, Member: ${gm.member.firstName} ${gm.member.lastName}`);
    }

    // Check all members in the system
    console.log('\nAll members in database:');
    const allMembers = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        groups: true
      }
    });

    console.log(`Total members: ${allMembers.length}`);
    for (const member of allMembers) {
      console.log(`  - ${member.firstName} ${member.lastName}: linked to ${member.groups.length} groups`);
      if (member.groups.length === 0) {
        console.log(`    ⚠️  NOT LINKED TO ANY GROUP`);
      }
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testMemberPersistence();
