/**
 * Check tenant IDs in registry database
 */

const { PrismaClient } = require('@prisma/client');

const registryUrl = process.env.REGISTRY_DATABASE_URL;

if (!registryUrl) {
  console.error('❌ REGISTRY_DATABASE_URL not set in environment');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: registryUrl }
  }
});

async function checkTenantIds() {
  console.log('\n=== CHECKING TENANT IDS IN REGISTRY ===\n');

  try {
    // Find mike@gmail.com church
    const mikeChurch = await prisma.church.findFirst({
      where: { email: 'mike@gmail.com' },
      include: {
        tenant: true
      }
    });

    console.log('mike@gmail.com:');
    if (mikeChurch) {
      console.log(`  Church ID: ${mikeChurch.id}`);
      console.log(`  Church Name: ${mikeChurch.name}`);
      console.log(`  Tenant ID: ${mikeChurch.tenant?.id || 'NO TENANT'}`);
      console.log(`  Database: ${mikeChurch.tenant?.databaseName || 'NO DATABASE'}`);
    } else {
      console.log('  ❌ NOT FOUND');
    }

    // Find ja@gmail.com church
    const jaChurch = await prisma.church.findFirst({
      where: { email: 'ja@gmail.com' },
      include: {
        tenant: true
      }
    });

    console.log('\nja@gmail.com:');
    if (jaChurch) {
      console.log(`  Church ID: ${jaChurch.id}`);
      console.log(`  Church Name: ${jaChurch.name}`);
      console.log(`  Tenant ID: ${jaChurch.tenant?.id || 'NO TENANT'}`);
      console.log(`  Database: ${jaChurch.tenant?.databaseName || 'NO DATABASE'}`);
    } else {
      console.log('  ❌ NOT FOUND');
    }

    // Check admin email index
    console.log('\n=== ADMIN EMAIL INDEX ===\n');

    const mikeAdmin = await prisma.adminEmailIndex.findFirst({
      where: { email: 'mike@gmail.com' }
    });

    console.log('mike@gmail.com admin:');
    if (mikeAdmin) {
      console.log(`  Tenant ID: ${mikeAdmin.tenantId}`);
      console.log(`  Admin ID: ${mikeAdmin.adminId}`);
    } else {
      console.log('  ❌ NOT FOUND');
    }

    const jaAdmin = await prisma.adminEmailIndex.findFirst({
      where: { email: 'ja@gmail.com' }
    });

    console.log('\nja@gmail.com admin:');
    if (jaAdmin) {
      console.log(`  Tenant ID: ${jaAdmin.tenantId}`);
      console.log(`  Admin ID: ${jaAdmin.adminId}`);
    } else {
      console.log('  ❌ NOT FOUND');
    }

    // ANALYSIS
    console.log('\n=== ANALYSIS ===\n');

    if (mikeChurch && jaChurch) {
      if (mikeChurch.id === jaChurch.id) {
        console.log('🚨 CRITICAL: BOTH ACCOUNTS HAVE SAME CHURCH ID!');
      } else {
        console.log('✅ Accounts have different Church IDs');
      }

      if (mikeAdmin && jaAdmin && mikeAdmin.tenantId === jaAdmin.tenantId) {
        console.log('🚨 CRITICAL: BOTH ADMINS MAPPED TO SAME TENANT!');
      } else {
        console.log('✅ Admins mapped to different tenants');
      }
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTenantIds();
