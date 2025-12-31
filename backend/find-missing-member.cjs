// Find which database has the missing member
const { PrismaClient: RegistryPrismaClient } = require('@prisma/client');
const { PrismaClient: TenantPrismaClient } = require('./.prisma/client-tenant');

async function findMissingMember() {
  const memberId = 'cmjtf90b600idvys2hxtge3go'; // The member that "disappeared"
  const memberEmail = 'debug1767149607485@test.com';

  console.log('\n🔍 Searching for missing member...');
  console.log('Member ID:', memberId);
  console.log('Member Email:', memberEmail);
  console.log('');

  // Connect to registry
  const registryPrisma = new RegistryPrismaClient({
    datasources: {
      db: {
        url: process.env.REGISTRY_DATABASE_URL,
      },
    },
  });

  try {
    // Get all active tenants
    const tenants = await registryPrisma.tenant.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        email: true,
        databaseUrl: true,
        databaseName: true,
      },
    });

    console.log(`Found ${tenants.length} active tenants\n`);

    // Search each tenant database
    for (const tenant of tenants) {
      console.log(`Checking tenant: ${tenant.name} (${tenant.email})`);
      console.log(`Database: ${tenant.databaseName}`);

      const tenantPrisma = new TenantPrismaClient({
        datasources: {
          db: {
            url: tenant.databaseUrl,
          },
        },
      });

      try {
        // Search for the member by ID
        const memberById = await tenantPrisma.member.findUnique({
          where: { id: memberId },
        });

        if (memberById) {
          console.log('✅ FOUND BY ID!');
          console.log('Member:', JSON.stringify(memberById, null, 2));
          console.log('\n🎯 THIS IS THE DATABASE THE MEMBER WAS SAVED TO!');
          console.log('Tenant ID:', tenant.id);
          console.log('Tenant Name:', tenant.name);
          console.log('Tenant Email:', tenant.email);
          await tenantPrisma.$disconnect();
          break;
        }

        // Search by email as backup
        const memberByEmail = await tenantPrisma.member.findFirst({
          where: { email: memberEmail },
        });

        if (memberByEmail) {
          console.log('✅ FOUND BY EMAIL!');
          console.log('Member:', JSON.stringify(memberByEmail, null, 2));
          console.log('\n🎯 THIS IS THE DATABASE THE MEMBER WAS SAVED TO!');
          console.log('Tenant ID:', tenant.id);
          console.log('Tenant Name:', tenant.name);
          console.log('Tenant Email:', tenant.email);
          await tenantPrisma.$disconnect();
          break;
        }

        console.log('❌ Not found in this database\n');
        await tenantPrisma.$disconnect();
      } catch (error) {
        console.error('Error checking tenant:', error.message);
        await tenantPrisma.$disconnect();
      }
    }

    await registryPrisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await registryPrisma.$disconnect();
  }
}

findMissingMember();
