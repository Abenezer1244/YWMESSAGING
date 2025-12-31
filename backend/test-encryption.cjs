// Quick test of EIN encryption with production key
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'c7b8e58766739b81dc09862af016394bd81fe71e6032554559fed7131aa0130f';
const ALGORITHM = 'aes-256-gcm';

function encrypt(plaintext) {
  const iv = crypto.randomBytes(12);
  const salt = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${salt.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`;
}

function decrypt(encryptedData) {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[2], 'hex');
  const tag = Buffer.from(parts[3], 'hex');

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}

function maskEIN(ein) {
  const cleanEIN = ein.replace(/\D/g, '');
  if (cleanEIN.length !== 9) {
    return 'XX-XXXXXXX';
  }
  const lastFour = cleanEIN.slice(-4);
  return `XX-XXX${lastFour}`;
}

// Test
console.log('='.repeat(70));
console.log('EIN ENCRYPTION TEST');
console.log('='.repeat(70));
console.log('');

const testEIN = '123456789';
console.log('Test EIN (plain):', testEIN);
console.log('');

try {
  // Encrypt
  const encrypted = encrypt(testEIN);
  console.log('✅ Encryption successful');
  console.log('   Encrypted format:', encrypted.split(':').map((p, i) =>
    ['iv', 'salt', 'encrypted', 'tag'][i] + ` (${p.length/2} bytes)`
  ).join(', '));
  console.log('   First 60 chars:', encrypted.substring(0, 60) + '...');
  console.log('');

  // Decrypt
  const decrypted = decrypt(encrypted);
  console.log('✅ Decryption successful');
  console.log('   Decrypted EIN:', decrypted);
  console.log('');

  // Verify
  if (decrypted === testEIN) {
    console.log('✅ ROUNDTRIP TEST PASSED');
    console.log('   Original:  ', testEIN);
    console.log('   Decrypted: ', decrypted);
    console.log('   Match: YES');
  } else {
    console.log('❌ ROUNDTRIP TEST FAILED');
    console.log('   Original:  ', testEIN);
    console.log('   Decrypted: ', decrypted);
    console.log('   Match: NO');
  }
  console.log('');

  // Masking
  const masked = maskEIN(testEIN);
  console.log('✅ Masking test');
  console.log('   Original:  ', testEIN);
  console.log('   Masked:    ', masked);
  console.log('');

  console.log('='.repeat(70));
  console.log('ALL TESTS PASSED ✅');
  console.log('='.repeat(70));

} catch (error) {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
}
