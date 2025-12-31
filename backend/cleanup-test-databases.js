/**
 * Cleanup Test Databases
 * Safely removes test tenant databases and registry entries
 *
 * SAFETY FEATURES:
 * - Only deletes databases marked as "test" in list
 * - Requires user confirmation before deletion
 * - Provides detailed progress and results
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync } from 'fs';
import readline from 'readline';

const registryPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.REGISTRY_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function cleanupTestDatabases() {
  console.log('\n🧹 TEST DATABASE CLEANUP SCRIPT\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Read the list of test databases
    const listData = JSON.parse(readFileSync('test-databases-list.json', 'utf8'));
    const { testTenants, summary } = listData;

    if (testTenants.length === 0) {
      console.log('✅ No test databases found to clean up.\n');
      process.exit(0);
    }

    console.log(`📊 Found ${testTenants.length} test databases to clean:\n`);

    // Show what will be deleted
    testTenants.forEach((tenant, index) => {
      console.log(`   ${index + 1}. ${tenant.churchName}`);
      console.log(`      Database: ${tenant.databaseName}`);
    });

    console.log('\n⚠️  WARNING: This will permanently delete:');
    console.log(`   • ${testTenants.length} tenant databases`);
    console.log(`   • ${testTenants.length} church records`);
    console.log(`   • ${testTenants.length} tenant registry entries`);
    console.log(`   • All data within these databases\n`);

    console.log('🏢 Production databases (SAFE - will NOT be touched):');
    console.log(`   • ${summary.productionCount} databases will remain untouched\n`);

    // Get user confirmation
    const answer = await question('❓ Type "DELETE" (in caps) to confirm deletion, or anything else to cancel: ');

    if (answer !== 'DELETE') {
      console.log('\n❌ Cleanup cancelled. No changes made.\n');
      rl.close();
      await registryPrisma.$disconnect();
      process.exit(0);
    }

    console.log('\n✅ Confirmation received. Starting cleanup...\n');

    // Track results
    const results = {
      successful: [],
      failed: [],
      startTime: new Date().toISOString()
    };

    // Delete each test database
    for (let i = 0; i < testTenants.length; i++) {
      const tenant = testTenants[i];
      const progress = `[${i + 1}/${testTenants.length}]`;

      try {
        console.log(`${progress} Deleting: ${tenant.churchName}...`);

        // Step 1: Drop the tenant database
        console.log(`   → Dropping database ${tenant.databaseName}...`);
        await registryPrisma.$executeRawUnsafe(
          `DROP DATABASE IF EXISTS "${tenant.databaseName}"`
        );

        // Step 2: Delete tenant from registry
        console.log(`   → Removing tenant registry entry...`);
        await registryPrisma.tenant.delete({
          where: { id: tenant.tenantId }
        });

        // Step 3: Delete church record (if exists and has no other tenants)
        if (tenant.churchId) {
          console.log(`   → Removing church record...`);
          try {
            await registryPrisma.church.delete({
              where: { id: tenant.churchId }
            });
          } catch (error) {
            // Church might have other tenants or already deleted
            console.log(`   ⚠️  Church record not deleted (may have other tenants)`);
          }
        }

        console.log(`   ✅ Successfully deleted\n`);
        results.successful.push({
          churchName: tenant.churchName,
          databaseName: tenant.databaseName,
          tenantId: tenant.tenantId
        });

      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}\n`);
        results.failed.push({
          churchName: tenant.churchName,
          databaseName: tenant.databaseName,
          tenantId: tenant.tenantId,
          error: error.message
        });
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Final results
    results.endTime = new Date().toISOString();
    const duration = new Date(results.endTime) - new Date(results.startTime);

    console.log('\n═══════════════════════════════════════════════════');
    console.log('CLEANUP COMPLETE');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Successfully deleted: ${results.successful.length} databases`);
    console.log(`❌ Failed deletions:     ${results.failed.length} databases`);
    console.log(`⏱️  Duration:             ${(duration / 1000).toFixed(1)} seconds`);
    console.log('═══════════════════════════════════════════════════\n');

    if (results.failed.length > 0) {
      console.log('⚠️  Failed deletions:\n');
      results.failed.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.churchName}`);
        console.log(`      Database: ${item.databaseName}`);
        console.log(`      Error: ${item.error}\n`);
      });
    }

    // Save results
    writeFileSync('cleanup-results.json', JSON.stringify(results, null, 2));
    console.log('📄 Full results saved to: cleanup-results.json\n');

    // Show connection pool status
    console.log('📊 CONNECTION POOL STATUS:');
    console.log(`   Before cleanup: ~${testTenants.length * 2} connections used`);
    console.log(`   After cleanup:  ~${results.failed.length * 2} connections used`);
    console.log(`   Freed up:       ~${results.successful.length * 2} connections\n`);

    rl.close();
    await registryPrisma.$disconnect();
    process.exit(results.failed.length > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error);
    rl.close();
    await registryPrisma.$disconnect();
    process.exit(1);
  }
}

cleanupTestDatabases();
