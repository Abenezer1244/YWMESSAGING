/**
 * Data migration script: Encrypt existing phone numbers
 * Run: npx ts-node src/scripts/migrate-phone-encryption.ts
 *
 * ✅ Database-per-tenant: Iterates over all tenants
 */
import { getRegistryPrisma, getTenantPrisma } from '../lib/tenant-prisma.js';
import { encrypt, hashForSearch } from '../utils/encryption.utils.js';
async function migratePhoneEncryption() {
    console.log('Starting phone encryption migration for all tenants...');
    const registryPrisma = getRegistryPrisma();
    try {
        // Get all tenants
        const tenants = await registryPrisma.tenant.findMany();
        console.log(`Found ${tenants.length} tenants to migrate`);
        let totalMigrated = 0;
        let totalSkipped = 0;
        for (const tenant of tenants) {
            console.log(`\nMigrating tenant: ${tenant.id}`);
            const tenantPrisma = await getTenantPrisma(tenant.id);
            try {
                // Find all members with unencrypted phones (phone field starts with +, not with hex)
                const members = await tenantPrisma.member.findMany({
                    where: {
                        phone: {
                            not: '', // Exclude empty phones
                        },
                    },
                });
                console.log(`  Found ${members.length} members to migrate`);
                let migrated = 0;
                let skipped = 0;
                for (const member of members) {
                    try {
                        // Check if already encrypted (encrypted format has colons)
                        if (member.phone.includes(':')) {
                            skipped++;
                            continue;
                        }
                        // Encrypt phone and generate hash
                        const encryptedPhone = encrypt(member.phone);
                        const phoneHash = hashForSearch(member.phone);
                        // Update member
                        await tenantPrisma.member.update({
                            where: { id: member.id },
                            data: {
                                phone: encryptedPhone,
                                phoneHash,
                            },
                        });
                        console.log(`  ✓ Encrypted phone for member ${member.id}`);
                        migrated++;
                    }
                    catch (error) {
                        console.error(`  ✗ Failed to migrate member ${member.id}:`, error);
                    }
                }
                console.log(`  Tenant ${tenant.id} complete: ${migrated} migrated, ${skipped} skipped`);
                totalMigrated += migrated;
                totalSkipped += skipped;
            }
            catch (error) {
                console.error(`  Failed to migrate tenant ${tenant.id}:`, error);
            }
        }
        console.log(`\n✅ Migration complete for all tenants: ${totalMigrated} migrated, ${totalSkipped} skipped`);
    }
    catch (error) {
        console.error('Migration failed:', error);
    }
}
migratePhoneEncryption();
//# sourceMappingURL=migrate-phone-encryption.js.map