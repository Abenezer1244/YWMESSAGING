/**
 * Data migration script: Encrypt existing phone numbers
 * Run: npx ts-node src/scripts/migrate-phone-encryption.ts
 */
import { PrismaClient } from '@prisma/client';
import { encrypt, hashForSearch } from '../utils/encryption.utils.js';
const prisma = new PrismaClient();
async function migratePhoneEncryption() {
    console.log('Starting phone encryption migration...');
    try {
        // Find all members with unencrypted phones (phone field starts with +, not with hex)
        const members = await prisma.member.findMany({
            where: {
                phone: {
                    not: '', // Exclude empty phones
                },
            },
        });
        console.log(`Found ${members.length} members to migrate`);
        let migrated = 0;
        let skipped = 0;
        for (const member of members) {
            try {
                // Check if already encrypted (encrypted format has colons)
                if (member.phone.includes(':')) {
                    console.log(`  Skipping member ${member.id} (already encrypted)`);
                    skipped++;
                    continue;
                }
                // Encrypt phone and generate hash
                const encryptedPhone = encrypt(member.phone);
                const phoneHash = hashForSearch(member.phone);
                // Update member
                await prisma.member.update({
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
        console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped`);
    }
    catch (error) {
        console.error('Migration failed:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
migratePhoneEncryption();
//# sourceMappingURL=migrate-phone-encryption.js.map