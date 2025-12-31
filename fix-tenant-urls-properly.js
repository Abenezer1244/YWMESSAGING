/**
 * PROPERLY fix broken tenant database URLs
 *
 * The previous script only fixed databaseHost but not databaseUrl!
 * This script fixes the actual connection string used by the backend
 */

const { PrismaClient } = require('./backend/node_modules/@prisma/client');

const registryUrl = process.env.REGISTRY_DATABASE_URL;

if (!registryUrl) {
  console.error('❌ REGISTRY_DATABASE_URL not set');
  process.exit(1);
}

async function fixTenantUrlsProperly() {
  console.log('\n=== PROPERLY FIXING TENANT DATABASE URLS ===\n');

  const prisma = new PrismaClient({
    datasources: { db: { url: registryUrl } }
  });

  try {
    // Find all tenants with broken URLs (hostname without domain suffix)
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        databaseUrl: true,
        databaseHost: true,
      }
    });

    console.log(`Found ${tenants.length} tenants\n`);

    let fixedCount = 0;

    for (const tenant of tenants) {
      // Check if URL has the short hostname (without .oregon-postgres.render.com)
      if (tenant.databaseUrl.includes('@dpg-d41af09r0fns73c9i010-a:5432/') ||
          tenant.databaseUrl.includes('@dpg-d41af09r0fns73c9i010-a/')) {

        console.log(`Fixing: ${tenant.name} (${tenant.id})`);
        console.log(`  Current URL: ${tenant.databaseUrl}`);

        // Fix the URL by replacing the short hostname with full hostname
        let fixedUrl = tenant.databaseUrl
          .replace(
            '@dpg-d41af09r0fns73c9i010-a:5432/',
            '@dpg-d41af09r0fns73c9i010-a.oregon-postgres.render.com:5432/'
          )
          .replace(
            '@dpg-d41af09r0fns73c9i010-a/',
            '@dpg-d41af09r0fns73c9i010-a.oregon-postgres.render.com:5432/'
          );

        console.log(`  Fixed URL:   ${fixedUrl}`);

        // Update in database
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            databaseUrl: fixedUrl,
            databaseHost: 'dpg-d41af09r0fns73c9i010-a.oregon-postgres.render.com',
          }
        });

        console.log(`  ✅ Updated!\n`);
        fixedCount++;
      }
    }

    if (fixedCount === 0) {
      console.log('✅ All tenant URLs are correct!');
    } else {
      console.log(`\n✅ Fixed ${fixedCount} tenant database URLs`);
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

fixTenantUrlsProperly();
