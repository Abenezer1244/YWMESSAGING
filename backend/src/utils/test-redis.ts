/**
 * Redis Connection Test Utility
 * Verifies Redis connectivity and basic operations
 *
 * Usage: npx ts-node src/utils/test-redis.ts
 */

import * as redis from 'redis';

async function testRedisConnection() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  console.log('\n🔍 Redis Connection Test\n');
  console.log('═'.repeat(60));

  const client = redis.createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
  });

  // Error handler
  client.on('error', (err) => {
    console.error('❌ Redis client error:', err);
  });

  try {
    console.log('\n📍 Step 1: Connecting to Redis');
    console.log(`   URL: ${redisUrl.replace(/:[^@]*@/, ':***@')}`);
    console.log('   Connecting...');

    await client.connect();
    console.log('   ✅ Connected successfully\n');

    // Test PING
    console.log('📍 Step 2: Testing PING');
    const pong = await client.ping();
    console.log(`   ✅ PING response: ${pong}\n`);

    // Test SET/GET
    console.log('📍 Step 3: Testing SET/GET operations');
    const testKey = 'test-key-' + Date.now();
    const testValue = 'test-value-' + Math.random();

    await client.set(testKey, testValue);
    console.log(`   ✅ SET ${testKey} = ${testValue}`);

    const getValue = await client.get(testKey);
    if (getValue === testValue) {
      console.log(`   ✅ GET ${testKey} = ${getValue}\n`);
    } else {
      throw new Error(`GET mismatch: expected ${testValue}, got ${getValue}`);
    }

    // Test TTL operations
    console.log('📍 Step 4: Testing TTL (Time to Live)');
    const ttlKey = 'ttl-test-' + Date.now();
    await client.setEx(ttlKey, 10, 'expires-in-10s');
    const ttl = await client.ttl(ttlKey);
    console.log(`   ✅ SET with TTL: ${ttlKey} expires in ${ttl}s\n`);

    // Test DEL
    console.log('📍 Step 5: Testing DELETE');
    const delCount = await client.del([testKey, ttlKey]);
    console.log(`   ✅ Deleted ${delCount} keys\n`);

    // Test INCREMENT (for counters)
    console.log('📍 Step 6: Testing INCR (counters)');
    const counterKey = 'counter-' + Date.now();
    const count1 = await client.incr(counterKey);
    const count2 = await client.incr(counterKey);
    const count3 = await client.incr(counterKey);
    console.log(`   ✅ Incremented counter: ${count1} → ${count2} → ${count3}\n`);

    // Test LPUSH/LPOP (for queues)
    console.log('📍 Step 7: Testing LIST operations (LPUSH/LPOP)');
    const listKey = 'queue-' + Date.now();
    await client.lPush(listKey, 'job-1', 'job-2', 'job-3');
    console.log(`   ✅ LPUSH: Added 3 jobs to list`);

    const job = await client.lPop(listKey);
    console.log(`   ✅ LPOP: Retrieved job: ${job}\n`);

    // Test INFO (server status)
    console.log('📍 Step 8: Checking Server Status');
    const info = await client.info('server');
    const lines = info.split('\r\n');
    const versionLine = lines.find((l) => l.startsWith('redis_version'));
    const version = versionLine ? versionLine.split(':')[1] : 'unknown';
    console.log(`   ✅ Redis version: ${version}`);

    const memoryLine = lines.find((l) => l.startsWith('used_memory_human'));
    const memory = memoryLine ? memoryLine.split(':')[1] : 'unknown';
    console.log(`   ✅ Memory usage: ${memory}\n`);

    // Summary
    console.log('═'.repeat(60));
    console.log('\n✅ ALL TESTS PASSED!\n');
    console.log('Summary:');
    console.log('  • Connection: OK');
    console.log('  • Ping: OK');
    console.log('  • String operations (SET/GET): OK');
    console.log('  • TTL operations: OK');
    console.log('  • Delete operations: OK');
    console.log('  • Counter operations: OK');
    console.log('  • List operations: OK');
    console.log('  • Server info: OK\n');
    console.log('Redis is ready for:');
    console.log('  ✅ Message queuing (Bull)');
    console.log('  ✅ Caching layer');
    console.log('  ✅ Session management\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED!\n');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error('\nTroubleshooting:');
    console.error('  1. Check REDIS_URL environment variable');
    console.error('  2. Verify Redis instance is running');
    console.error('  3. Check network connectivity and firewall');
    console.error('  4. Verify password is correct (if using auth)\n');
    process.exit(1);
  } finally {
    await client.quit();
  }
}

// Run test
testRedisConnection().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
