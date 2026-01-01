/**
 * ============================================================================
 * TEST EIN VALIDATION
 * ============================================================================
 *
 * Tests different EIN formats to see what's accepted
 */

console.log('');
console.log('======================================================================');
console.log('EIN VALIDATION TEST');
console.log('======================================================================');
console.log('');

function testEINFormat(input, description) {
  console.log(`Testing: ${description}`);
  console.log(`Input: "${input}"`);

  // This is what the backend does
  const cleanEIN = input.replace(/\D/g, ''); // Remove all non-digits
  console.log(`Cleaned: "${cleanEIN}"`);
  console.log(`Length: ${cleanEIN.length} digits`);

  if (cleanEIN.length === 9) {
    console.log(`✅ VALID - Would be accepted`);
  } else {
    console.log(`❌ INVALID - Would be rejected (needs exactly 9 digits)`);
  }
  console.log('');
}

// Test various formats
testEINFormat('123456789', 'Plain 9 digits');
testEINFormat('12-3456789', 'With dash (standard format)');
testEINFormat('12 3456789', 'With space');
testEINFormat('12-345-6789', 'With multiple dashes');
testEINFormat('12.3456789', 'With period');
testEINFormat('1234567890', '10 digits (too long)');
testEINFormat('12345678', '8 digits (too short)');
testEINFormat('', 'Empty string');
testEINFormat('abc123def', 'With letters');
testEINFormat('12-34567', 'Too short with dash');

console.log('======================================================================');
console.log('');
console.log('SUMMARY:');
console.log('✅ Accepted formats:');
console.log('   • 123456789 (9 digits, no formatting)');
console.log('   • 12-3456789 (with dash)');
console.log('   • 12 3456789 (with space)');
console.log('   • Any format with exactly 9 digits');
console.log('');
console.log('❌ Rejected formats:');
console.log('   • Fewer than 9 digits');
console.log('   • More than 9 digits');
console.log('   • Empty string');
console.log('   • Only letters/no digits');
console.log('');
