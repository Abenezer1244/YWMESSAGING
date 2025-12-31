/**
 * Test if member is actually saved to database
 *
 * Usage: node test-member-database-save.js <email-used-in-incognito>
 */

const { PrismaClient: RegistryPrismaClient } = require('./backend/node_modules/@prisma/client');
const { PrismaClient: TenantPrismaClient } = require('./backend/node_modules/.prisma/client-tenant/index.js');

const registryUrl = process.env.REGISTRY_DATABASE_URL;

if (!registryUrl) {
  console.error('❌ REGISTRY_DATABASE_URL not set');
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error('❌ Please provide email: node test-member-database-save.js <email>');
  process.exit(1);
}

async function checkMemberInDatabase() {
  console.log(`\n=== CHECKING DATABASE FOR ACCOUNT: ${email} ===\n`);

  const registryPrisma = new RegistryPrismaClient({
    datasources: { db: { url: registryUrl } }
  });

  try {
    // Step 1: Find tenant for this email
    console.log('Step 1: Finding tenant...');
    const church = await registryPrisma.church.findFirst({
      where: { email },
      include: { tenant: true }
    });

    if (!church) {
      console.log(`❌ No church found with email: ${email}`);
      console.log('   Did you use this email to register in incognito?');
      return;
    }

    console.log(`✅ Found church: ${church.name}`);
    console.log(`   Tenant ID: ${church.id}`);
    console.log(`   Database: ${church.tenant?.databaseName}`);

    if (!church.tenant?.databaseUrl) {
      console.log(`❌ No database URL for this tenant!`);
      return;
    }

    // Step 2: Connect to tenant database
    console.log('\nStep 2: Connecting to tenant database...');
    const tenantPrisma = new TenantPrismaClient({
      datasources: {
        db: { url: church.tenant.databaseUrl }
      }
    });

    // Step 3: Count members
    console.log('\nStep 3: Counting members in tenant database...');
    const memberCount = await tenantPrisma.member.count();
    console.log(`✅ Total members in database: ${memberCount}`);

    if (memberCount === 0) {
      console.log('\n⚠️  DATABASE HAS 0 MEMBERS!');
      console.log('   This means:');
      console.log('   1. Member was never saved to database, OR');
      console.log('   2. You haven\'t added any members yet');
    } else {
      // Step 4: Show recent members
      console.log('\nStep 4: Showing most recent members...');
      const recentMembers = await tenantPrisma.member.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        }
      });

      console.log('\nRecent members:');
      recentMembers.forEach((m, i) => {
        console.log(`  ${i+1}. ${m.firstName} ${m.lastName} (created: ${m.createdAt.toISOString()})`);
      });

      console.log('\n✅ Members ARE being saved to database');
      console.log('   If you added a member and it\'s not listed above,');
      console.log('   the issue is likely a caching or timing problem.');
    }

    await tenantPrisma.$disconnect();
    await registryPrisma.$disconnect();

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await registryPrisma.$disconnect();
  }
}

checkMemberInDatabase();
