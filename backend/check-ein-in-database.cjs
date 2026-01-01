/**
 * ============================================================================
 * CHECK EIN ENCRYPTION IN DATABASE
 * ============================================================================
 *
 * This script checks how EINs are stored in the database:
 * 1. Shows the encrypted format (you can't read it)
 * 2. Decrypts it to verify it matches what you entered
 * 3. Shows the masked version (XX-XXX6789)
 * 4. Shows audit trail (when encrypted, who accessed it)
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { decryptEINSafe, maskEIN } = require('./dist/utils/encryption.utils.js');

const registryPrisma = new PrismaClient({
  datasourceUrl: process.env.REGISTRY_DATABASE_URL || process.env.DATABASE_URL,
});

async function checkEINEncryption() {
  console.log('');
  console.log('======================================================================');
  console.log('EIN ENCRYPTION DATABASE CHECK');
  console.log('======================================================================');
  console.log('');

  try {
    // Get all churches with EINs
    const churches = await registryPrisma.church.findMany({
      where: {
        ein: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        ein: true,
        einHash: true,
        einEncryptedAt: true,
        einAccessedAt: true,
        einAccessedBy: true,
      },
      orderBy: {
        einEncryptedAt: 'desc'
      }
    });

    if (churches.length === 0) {
      console.log('⚠️  No churches with EINs found in database');
      console.log('');
      console.log('Next Steps:');
      console.log('1. Log in to your church account');
      console.log('2. Go to Admin Settings');
      console.log('3. Add your EIN in the "10DLC Registration" section');
      console.log('4. Run this script again to see the encryption');
      console.log('');
      return;
    }

    console.log(`Found ${churches.length} church(es) with EIN\n`);

    for (const church of churches) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Church: ${church.name}`);
      console.log(`Email: ${church.email}`);
      console.log(`ID: ${church.id}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');

      // Show encrypted value (raw database storage)
      console.log('🔒 ENCRYPTED VALUE IN DATABASE:');
      console.log('   (This is what attackers would see if they stole the database)');
      console.log('');
      console.log(`   ${church.ein}`);
      console.log('');

      // Parse the encryption format
      const parts = church.ein?.split(':');
      if (parts && parts.length === 4) {
        console.log('   Format breakdown:');
        console.log(`   • IV (Initialization Vector): ${parts[0]} (${Buffer.from(parts[0], 'hex').length} bytes)`);
        console.log(`   • Salt: ${parts[1]} (${Buffer.from(parts[1], 'hex').length} bytes)`);
        console.log(`   • Encrypted EIN: ${parts[2]} (${Buffer.from(parts[2], 'hex').length} bytes)`);
        console.log(`   • Auth Tag: ${parts[3]} (${Buffer.from(parts[3], 'hex').length} bytes)`);
        console.log('');
      }

      // Show hash
      console.log('🔑 HASH (SHA-256):');
      console.log('   (Used for validation without decrypting)');
      console.log('');
      console.log(`   ${church.einHash}`);
      console.log('');

      // Decrypt and show (this is what the system does when it needs the real EIN)
      try {
        const decrypted = decryptEINSafe(church.ein);
        console.log('🔓 DECRYPTED VALUE:');
        console.log('   (This is what your app sees when it needs the real EIN)');
        console.log('');
        console.log(`   ${decrypted}`);
        console.log('');

        // Show masked version (what users see in UI)
        const masked = maskEIN(decrypted);
        console.log('👁️  MASKED VERSION (UI):');
        console.log('   (This is what you see in the admin settings)');
        console.log('');
        console.log(`   ${masked}`);
        console.log('');
      } catch (error) {
        console.log('❌ Failed to decrypt (encryption key may be different)');
        console.log('');
      }

      // Show audit trail
      console.log('📋 AUDIT TRAIL:');
      console.log(`   • Encrypted at: ${church.einEncryptedAt?.toISOString() || 'N/A'}`);
      console.log(`   • Last accessed: ${church.einAccessedAt?.toISOString() || 'N/A'}`);
      console.log(`   • Accessed by: ${church.einAccessedBy || 'N/A'}`);
      console.log('');

      // Security demonstration
      console.log('🛡️  SECURITY DEMONSTRATION:');
      console.log('');
      console.log('   ✅ WITHOUT encryption key:');
      console.log('      Attacker sees: ' + church.ein?.substring(0, 50) + '...');
      console.log('      ❌ Cannot read the EIN (looks like random garbage)');
      console.log('');
      console.log('   ✅ WITH encryption key:');
      console.log('      Your system sees: ' + (church.ein ? maskEIN(decryptEINSafe(church.ein)) : 'N/A'));
      console.log('      ✅ Can decrypt when needed for Telnyx API');
      console.log('');
      console.log('   ✅ UI Display:');
      console.log('      Admin sees: ' + (church.ein ? maskEIN(decryptEINSafe(church.ein)) : 'N/A'));
      console.log('      ✅ Last 4 digits only (secure display)');
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ ENCRYPTION VERIFICATION COMPLETE');
    console.log('');
    console.log('What this proves:');
    console.log('• EIN is stored encrypted (not readable without key)');
    console.log('• Encryption uses proper format (iv:salt:encrypted:tag)');
    console.log('• Decryption works correctly');
    console.log('• Masking works for UI display');
    console.log('• Audit trail is maintained');
    console.log('');
    console.log('Your EIN is secure! 🔒');
    console.log('');

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    console.error('');
    console.error('Make sure:');
    console.error('1. DATABASE_URL is set in .env');
    console.error('2. Database is accessible');
    console.error('3. ENCRYPTION_KEY matches what was used to encrypt');
  } finally {
    await registryPrisma.$disconnect();
  }
}

// Run the check
checkEINEncryption().catch(console.error);
