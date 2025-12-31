/**
 * List All Test Databases for Cleanup
 * Identifies test tenant databases created during Phase 5 testing
 */

const { PrismaClient } = require('@prisma/client');

const registryPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.REGISTRY_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

async function listTestDatabases() {
  console.log('\n🔍 Scanning for test databases...\n');

  try {
    // Get all tenants from registry
    const allTenants = await registryPrisma.tenant.findMany({
      include: {
        church: {
          select: {
            name: true,
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Total Tenants in Registry: ${allTenants.length}\n`);

    // Categorize tenants
    const testTenants = [];
    const productionTenants = [];

    for (const tenant of allTenants) {
      const churchName = tenant.church?.name || 'Unknown';
      const isTest =
        churchName.toLowerCase().includes('test') ||
        churchName.toLowerCase().includes('phase5') ||
        churchName.toLowerCase().includes('session') ||
        churchName.toLowerCase().includes('verification') ||
        churchName.toLowerCase().includes('verify');

      if (isTest) {
        testTenants.push({
          tenantId: tenant.id,
          churchId: tenant.churchId,
          churchName: churchName,
          databaseName: tenant.databaseName,
          status: tenant.status,
          createdAt: tenant.createdAt
        });
      } else {
        productionTenants.push({
          tenantId: tenant.id,
          churchId: tenant.churchId,
          churchName: churchName,
          databaseName: tenant.databaseName,
          status: tenant.status,
          createdAt: tenant.createdAt
        });
      }
    }

    // Display test databases
    console.log('🧪 TEST DATABASES TO CLEAN:\n');
    if (testTenants.length === 0) {
      console.log('   No test databases found.\n');
    } else {
      testTenants.forEach((tenant, index) => {
        console.log(`   ${index + 1}. ${tenant.churchName}`);
        console.log(`      Database: ${tenant.databaseName}`);
        console.log(`      Tenant ID: ${tenant.tenantId}`);
        console.log(`      Status: ${tenant.status}`);
        console.log(`      Created: ${tenant.createdAt.toLocaleString()}`);
        console.log('');
      });
    }

    // Display production databases (for safety check)
    console.log('🏢 PRODUCTION DATABASES (WILL NOT TOUCH):\n');
    if (productionTenants.length === 0) {
      console.log('   No production databases found.\n');
    } else {
      productionTenants.forEach((tenant, index) => {
        console.log(`   ${index + 1}. ${tenant.churchName}`);
        console.log(`      Database: ${tenant.databaseName}`);
        console.log(`      Tenant ID: ${tenant.tenantId}`);
        console.log('');
      });
    }

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('CLEANUP SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`Test Databases to Delete:     ${testTenants.length}`);
    console.log(`Production Databases (Safe):  ${productionTenants.length}`);
    console.log(`Total Databases:              ${allTenants.length}`);
    console.log('═══════════════════════════════════════════════════\n');

    // Save to file for cleanup script
    const fs = require('fs');
    fs.writeFileSync('test-databases-list.json', JSON.stringify({
      testTenants,
      productionTenants,
      summary: {
        testCount: testTenants.length,
        productionCount: productionTenants.length,
        totalCount: allTenants.length
      }
    }, null, 2));

    console.log('✅ List saved to: test-databases-list.json\n');

    await registryPrisma.$disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error listing databases:', error.message);
    await registryPrisma.$disconnect();
    process.exit(1);
  }
}

listTestDatabases();
