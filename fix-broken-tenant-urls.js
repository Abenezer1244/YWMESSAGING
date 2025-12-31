/**
 * Fix broken tenant database URLs
 *
 * Finds all tenants with incomplete hostnames (missing .oregon-postgres.render.com)
 * and updates them with the correct full hostname
 */

const { PrismaClient } = require('./backend/node_modules/@prisma/client');

const registryUrl = process.env.REGISTRY_DATABASE_URL;

if (!registryUrl) {
  console.error('❌ REGISTRY_DATABASE_URL not set');
  process.exit(1);
}

async function fixBrokenTenantUrls() {
  console.log('\n=== FIXING BROKEN TENANT DATABASE URLS ===\n');

  const prisma = new PrismaClient({
    datasources: { db: { url: registryUrl } }
  });

  try {
    // Find all tenants
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        databaseUrl: true,
        databaseHost: true,
      }
    });

    console.log(`Found ${tenants.length} tenants\n`);

    // Find broken ones (hostname without .oregon-postgres.render.com)
    const brokenTenants = tenants.filter(t =>
      t.databaseHost &&
      !t.databaseHost.includes('.') &&
      t.databaseHost.startsWith('dpg-')
    );

    if (brokenTenants.length === 0) {
      console.log('✅ No broken tenant URLs found!');
      await prisma.$disconnect();
      return;
    }

    console.log(`❌ Found ${brokenTenants.length} broken tenant(s):\n`);

    for (const tenant of brokenTenants) {
      console.log(`Tenant: ${tenant.name} (${tenant.id})`);
      console.log(`  Current host: ${tenant.databaseHost}`);
      console.log(`  Current URL: ${tenant.databaseUrl}`);

      // Fix the URL
      const fixedUrl = tenant.databaseUrl.replace(
        `@${tenant.databaseHost}/`,
        `@${tenant.databaseHost}.oregon-postgres.render.com:5432/`
      );

      const fixedHost = `${tenant.databaseHost}.oregon-postgres.render.com`;

      console.log(`  Fixed host: ${fixedHost}`);
      console.log(`  Fixed URL: ${fixedUrl}`);

      // Update in database
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          databaseHost: fixedHost,
          databaseUrl: fixedUrl,
        }
      });

      console.log(`  ✅ Updated!\n`);
    }

    console.log(`\n✅ Fixed ${brokenTenants.length} tenant database URLs`);
    await prisma.$disconnect();

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

fixBrokenTenantUrls();
