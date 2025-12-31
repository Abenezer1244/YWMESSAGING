/**
 * Test the URL regex from database-provisioning.service.ts
 */

const testUrl = "postgresql://connect_yw_user:RkFG9qz5nL5wF22BuKEYngvLhsHVyfgP@dpg-d41af09r0fns73c9i010-a.oregon-postgres.render.com:5432/connect_yw_production?sslmode=require&connection_limit=95&pool_timeout=45";

console.log('Testing URL:', testUrl);
console.log('');

// Line 28 regex (used in first part of provisionTenantDatabase)
const regex1 = /postgresql:\/\/([^:]+):([^@]+)@([^:/?]+):?(\d+)?/;
const match1 = testUrl.match(regex1);

console.log('=== REGEX 1 (Line 28) ===');
console.log('Pattern: /postgresql:\\/\\/([^:]+):([^@]+)@([^:/?]+):?(\\d+)?/');
if (match1) {
  console.log('Match found!');
  console.log('  [1] user:', match1[1]);
  console.log('  [2] password:', match1[2]);
  console.log('  [3] host:', match1[3]);
  console.log('  [4] port:', match1[4] || 'not captured');
} else {
  console.log('NO MATCH!');
}

console.log('');

// Line 63 regex (used in error handling)
const regex2 = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)/;
const match2 = testUrl.match(regex2);

console.log('=== REGEX 2 (Line 63) ===');
console.log('Pattern: /postgresql:\\/\\/([^:]+):([^@]+)@([^:]+):(\\d+)/');
if (match2) {
  console.log('Match found!');
  console.log('  [1] user:', match2[1]);
  console.log('  [2] password:', match2[2]);
  console.log('  [3] host:', match2[3]);
  console.log('  [4] port:', match2[4]);
} else {
  console.log('NO MATCH!');
}

console.log('');
console.log('=== CONSTRUCTING TENANT URL ===');
if (match1) {
  const [, user, password, host, port = '5432'] = match1;
  const tenantUrl = `postgresql://${user}:${password}@${host}:${port}/tenant_test123`;
  console.log('Generated tenant URL:', tenantUrl);
}
