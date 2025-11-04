/**
 * Data migration script: Encrypt existing phone numbers
 * Run: node src/scripts/migrate-phone-encryption.js
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 16;

function encrypt(plaintext) {
  try {
    const iv = crypto.randomBytes(12);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${salt.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

function hashForSearch(plaintext) {
  return crypto.createHmac('sha256', ENCRYPTION_KEY).update(plaintext).digest('hex');
}

async function migratePhoneEncryption() {
  console.log('Starting phone encryption migration...');

  try {
    const members = await prisma.member.findMany({
      where: {
        phone: {
          not: '',
        },
      },
    });

    console.log(`Found ${members.length} members to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const member of members) {
      try {
        if (member.phone.includes(':')) {
          console.log(`  Skipping member ${member.id} (already encrypted)`);
          skipped++;
          continue;
        }

        const encryptedPhone = encrypt(member.phone);
        const phoneHash = hashForSearch(member.phone);

        await prisma.member.update({
          where: { id: member.id },
          data: {
            phone: encryptedPhone,
            phoneHash,
          },
        });

        console.log(`  ✓ Encrypted phone for member ${member.id}`);
        migrated++;
      } catch (error) {
        console.error(`  ✗ Failed to migrate member ${member.id}:`, error.message);
      }
    }

    console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migratePhoneEncryption();
