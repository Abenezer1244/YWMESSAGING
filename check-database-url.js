/**
 * Check database URL for tenant
 */

const { PrismaClient } = require('./backend/node_modules/@prisma/client');

const registryUrl = process.env.REGISTRY_DATABASE_URL;

if (!registryUrl) {
  console.error('❌ REGISTRY_DATABASE_URL not set');
  process.exit(1);
}

const email = process.argv[2] || 'mikitsegaye29@gmail.com';

async function checkDatabaseUrl() {
  console.log(`\n=== CHECKING DATABASE URL FOR: ${email} ===\n`);

  const registryPrisma = new PrismaClient({
    datasources: { db: { url: registryUrl } }
  });

  try {
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
    console.log('\nDatabase connection info:');
    console.log('  databaseHost:', church.tenant?.databaseHost);
    console.log('  databasePort:', church.tenant?.databasePort);
    console.log('  databaseName:', church.tenant?.databaseName);
    console.log('\n  Full databaseUrl:', church.tenant?.databaseUrl);

    if (church.tenant?.databaseUrl) {
      try {
        const url = new URL(church.tenant.databaseUrl);
        console.log('\nParsed URL:');
        console.log('  protocol:', url.protocol);
        console.log('  hostname:', url.hostname);
        console.log('  port:', url.port);
        console.log('  pathname:', url.pathname);
        console.log('  username:', url.username);
        console.log('  password:', url.password ? '[REDACTED]' : 'none');
      } catch (e) {
        console.log('\n❌ Invalid URL format:', e.message);
      }
    }

    await registryPrisma.$disconnect();

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await registryPrisma.$disconnect();
  }
}

checkDatabaseUrl();
