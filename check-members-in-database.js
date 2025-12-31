/**
 * Check members directly in tenant database
 *
 * This will tell us if members are being saved or not
 */

const { PrismaClient: RegistryPrismaClient } = require('./backend/node_modules/@prisma/client');
const { PrismaClient: TenantPrismaClient } = require('./backend/node_modules/.prisma/client-tenant/index.js');

const registryUrl = process.env.REGISTRY_DATABASE_URL;

if (!registryUrl) {
  console.error('❌ REGISTRY_DATABASE_URL not set');
  process.exit(1);
}

const email = process.argv[2] || 'mikitsegaye29@gmail.com';

async function checkMembersInDatabase() {
  console.log(`\n=== CHECKING MEMBERS IN DATABASE: ${email} ===\n`);

  const registryPrisma = new RegistryPrismaClient({
    datasources: { db: { url: registryUrl } }
  });

  try {
    // Step 1: Get tenant info
    const church = await registryPrisma.church.findFirst({
      where: { email },
      include: { tenant: true }
    });

    if (!church) {
      console.log(`❌ No church found with email: ${email}`);
      return;
    }

    console.log('Church:', church.name);
    console.log('Tenant ID:', church.id);
    console.log('Database URL:', church.tenant?.databaseUrl);
    console.log('');

    if (!church.tenant?.databaseUrl) {
      console.log('❌ No database URL!');
      return;
    }

    // Step 2: Connect to tenant database
    console.log('Connecting to tenant database...');
    const tenantPrisma = new TenantPrismaClient({
      datasources: {
        db: { url: church.tenant.databaseUrl }
      }
    });

    // Step 3: Count members
    console.log('Counting members...');
    const memberCount = await tenantPrisma.member.count();
    console.log(`✅ Total members: ${memberCount}\n`);

    if (memberCount === 0) {
      console.log('⚠️  NO MEMBERS IN DATABASE!');
      console.log('   This means writes are failing or members were never added.\n');
    } else {
      // Step 4: Show recent members
      console.log('Recent members (last 10):');
      const recentMembers = await tenantPrisma.member.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
        }
      });

      recentMembers.forEach((m, i) => {
        const created = new Date(m.createdAt).toLocaleString();
        console.log(`  ${i+1}. ${m.firstName} ${m.lastName} - ${m.phone}`);
        console.log(`     Created: ${created}`);
        console.log(`     ID: ${m.id}`);
      });

      console.log('\n✅ Members ARE in database');
      console.log('   If you added a member in last 5 minutes and it\'s not listed above,');
      console.log('   then the write is failing silently.');
    }

    await tenantPrisma.$disconnect();
    await registryPrisma.$disconnect();

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Full error:', error);
    await registryPrisma.$disconnect();
  }
}

checkMembersInDatabase();
