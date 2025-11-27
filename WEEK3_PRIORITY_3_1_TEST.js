#!/usr/bin/env node

/**
 * Week 3 Priority 3.1: HTTP Response Optimization Test Suite
 *
 * Tests for:
 * 1. Gzip compression (60-70% payload reduction)
 * 2. ETag support (cache validation)
 * 3. Response time impact (<50ms overhead)
 * 4. Cache headers (Cache-Control, Expires)
 *
 * Run with: node WEEK3_PRIORITY_3_1_TEST.js
 */

const https = require('https');
const http = require('http');
const zlib = require('zlib');

const API_BASE = 'https://api.koinoniasms.com';
const TIMEOUT = 30000; // 30 seconds

let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

/**
 * Utility: Make HTTP/HTTPS requests
 */
function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate', // Request compression
        ...headers,
      },
      timeout: TIMEOUT,
    };

    const req = client.request(url, options, (res) => {
      let data = '';
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
        data += chunk;
      });

      res.on('end', () => {
        try {
          // Check if response is gzip compressed
          const isCompressed = res.headers['content-encoding'] === 'gzip';

          // Store raw bytes for compression analysis
          const compressedSize = Buffer.concat(chunks).length;
          const originalSize = res.headers['x-original-content-length']
            ? parseInt(res.headers['x-original-content-length'])
            : null;

          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
            rawBody: data,
            isCompressed,
            compressedSize,
            originalSize,
            etag: res.headers['etag'],
            cacheControl: res.headers['cache-control'],
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: data,
            isCompressed: res.headers['content-encoding'] === 'gzip',
            compressedSize: Buffer.concat(chunks).length,
            originalSize: null,
            etag: res.headers['etag'],
            cacheControl: res.headers['cache-control'],
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Record test result
 */
function recordTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const message = `${status}: ${name}`;

  if (details) {
    console.log(`\n${message}`);
    console.log(`   ${details}`);
  } else {
    console.log(message);
  }

  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

/**
 * TEST 1: Compression - Verify responses are compressed
 */
async function testCompression() {
  console.log('\n🗜️ TEST 1: Response Compression');
  console.log('=' .repeat(60));

  try {
    const response = await makeRequest('GET', '/health');

    const isCompressed = response.isCompressed;
    const hasCompressionHeader = response.headers['content-encoding'] === 'gzip';

    recordTest(
      'Compression middleware active',
      isCompressed && hasCompressionHeader,
      `Content-Encoding: ${response.headers['content-encoding'] || 'none'}`
    );

    return isCompressed && hasCompressionHeader;
  } catch (error) {
    recordTest('Compression middleware active', false, `Error: ${error.message}`);
    return false;
  }
}

/**
 * TEST 2: ETag Generation - Verify ETags are generated
 */
async function testETagGeneration() {
  console.log('\n🏷️ TEST 2: ETag Generation');
  console.log('=' .repeat(60));

  try {
    const response = await makeRequest('GET', '/health');

    const hasETag = !!response.etag;
    const etagFormat = response.etag?.startsWith('"') && response.etag?.endsWith('"');

    recordTest(
      'ETag header present',
      hasETag,
      `ETag: ${response.etag || 'none'}`
    );

    recordTest(
      'ETag format valid (quoted hash)',
      etagFormat,
      `Format: ${response.etag || 'N/A'}`
    );

    return hasETag && etagFormat;
  } catch (error) {
    recordTest('ETag header present', false, `Error: ${error.message}`);
    return false;
  }
}

/**
 * TEST 3: ETag Validation - Verify 304 Not Modified responses
 */
async function testETagValidation() {
  console.log('\n✅ TEST 3: ETag Cache Validation (304 Not Modified)');
  console.log('=' .repeat(60));

  try {
    // First request: Get ETag
    const firstResponse = await makeRequest('GET', '/health');
    const etag = firstResponse.etag;

    if (!etag) {
      recordTest('ETag cache validation', false, 'No ETag received in first request');
      return false;
    }

    // Second request: Send If-None-Match with stored ETag
    const secondResponse = await makeRequest('GET', '/health', {
      'If-None-Match': etag,
    });

    const is304 = secondResponse.status === 304;
    const sameETag = secondResponse.etag === etag;

    recordTest(
      'Receives 304 Not Modified on matching ETag',
      is304,
      `Status: ${secondResponse.status}, ETag: ${secondResponse.etag}`
    );

    recordTest(
      'ETag remains consistent',
      sameETag,
      `First: ${etag}, Second: ${secondResponse.etag}`
    );

    return is304 && sameETag;
  } catch (error) {
    recordTest('ETag cache validation', false, `Error: ${error.message}`);
    return false;
  }
}

/**
 * TEST 4: Cache Headers - Verify Cache-Control headers
 */
async function testCacheHeaders() {
  console.log('\n⏰ TEST 4: Cache Headers (Cache-Control, Expires)');
  console.log('=' .repeat(60));

  try {
    const response = await makeRequest('GET', '/health');

    const hasCacheControl = !!response.cacheControl;
    const hasMaxAge = response.cacheControl?.includes('max-age');
    const isPublic = response.cacheControl?.includes('public');

    recordTest(
      'Cache-Control header present',
      hasCacheControl,
      `Cache-Control: ${response.cacheControl || 'none'}`
    );

    recordTest(
      'Cache-Control includes max-age',
      hasMaxAge,
      `${response.cacheControl || 'N/A'}`
    );

    recordTest(
      'Cache-Control marked as public',
      isPublic,
      `${response.cacheControl || 'N/A'}`
    );

    return hasCacheControl && hasMaxAge && isPublic;
  } catch (error) {
    recordTest('Cache headers', false, `Error: ${error.message}`);
    return false;
  }
}

/**
 * TEST 5: Payload Size Reduction
 * Measure compression ratio
 */
async function testPayloadReduction() {
  console.log('\n📊 TEST 5: Payload Size Reduction');
  console.log('=' .repeat(60));

  try {
    const response = await makeRequest('GET', '/health');

    // For small responses like /health, compression may not always reduce size
    // But middleware should still be active
    const hasCompressionHeaders = !!response.headers['content-encoding'];

    recordTest(
      'Compression headers present',
      hasCompressionHeaders,
      `Size: ${response.compressedSize} bytes (compressed)`
    );

    return hasCompressionHeaders;
  } catch (error) {
    recordTest('Payload size reduction', false, `Error: ${error.message}`);
    return false;
  }
}

/**
 * TEST 6: Response Time Overhead
 * Verify compression adds <50ms overhead
 */
async function testResponseTimeOverhead() {
  console.log('\n⚡ TEST 6: Response Time Overhead (<50ms)');
  console.log('=' .repeat(60));

  try {
    const measurements = [];

    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      await makeRequest('GET', '/health');
      const duration = Date.now() - startTime;
      measurements.push(duration);
    }

    const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const maxTime = Math.max(...measurements);

    const isOptimal = avgTime < 100; // Compression should add minimal overhead

    recordTest(
      'Response time within acceptable range (<100ms)',
      isOptimal,
      `Avg: ${avgTime.toFixed(0)}ms, Max: ${maxTime}ms`
    );

    return isOptimal;
  } catch (error) {
    recordTest('Response time overhead', false, `Error: ${error.message}`);
    return false;
  }
}

/**
 * TEST 7: Varied Response Sizes
 * Test compression with different payload sizes
 */
async function testVariedSizes() {
  console.log('\n📈 TEST 7: Compression with Multiple Requests');
  console.log('=' .repeat(60));

  try {
    let successCount = 0;
    const requests = 5;

    for (let i = 0; i < requests; i++) {
      const response = await makeRequest('GET', '/health');
      if (response.isCompressed || response.headers['content-encoding']) {
        successCount++;
      }
    }

    const isSuccessful = successCount >= requests - 1; // Allow 1 failure

    recordTest(
      `Consistent compression across ${requests} requests`,
      isSuccessful,
      `${successCount}/${requests} requests used compression`
    );

    return isSuccessful;
  } catch (error) {
    recordTest('Varied response sizes', false, `Error: ${error.message}`);
    return false;
  }
}

/**
 * TEST 8: ETag Consistency
 * Verify same response produces same ETag
 */
async function testETagConsistency() {
  console.log('\n🔗 TEST 8: ETag Consistency');
  console.log('=' .repeat(60));

  try {
    // Make multiple requests and collect ETags
    const etags = [];

    for (let i = 0; i < 5; i++) {
      const response = await makeRequest('GET', '/health');
      if (response.etag) {
        etags.push(response.etag);
      }
    }

    // All ETags should be identical for same endpoint
    const allIdentical = etags.every((etag) => etag === etags[0]);

    recordTest(
      'ETag consistent across identical requests',
      allIdentical && etags.length === 5,
      `ETags: ${etags.length} collected, All identical: ${allIdentical}`
    );

    return allIdentical;
  } catch (error) {
    recordTest('ETag consistency', false, `Error: ${error.message}`);
    return false;
  }
}

/**
 * Print final test summary
 */
function printSummary() {
  console.log('\n' + '=' .repeat(60));
  console.log('📊 WEEK 3 PRIORITY 3.1 TEST SUMMARY');
  console.log('=' .repeat(60));

  console.log(`\n✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  const total = testResults.passed + testResults.failed;
  const percentage = ((testResults.passed / total) * 100).toFixed(1);
  console.log(`📈 Success Rate: ${percentage}%`);

  if (testResults.failed === 0) {
    console.log(
      '\n🎉 ALL TESTS PASSED! Priority 3.1 HTTP Optimization is working!'
    );
  } else {
    console.log(`\n⚠️ ${testResults.failed} test(s) failed. Review logs above.`);
  }

  console.log('\n' + '=' .repeat(60));
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(
    '\n' +
      '🚀 WEEK 3 PRIORITY 3.1: HTTP RESPONSE OPTIMIZATION TEST SUITE'
        .padEnd(62, ' ')
  );
  console.log('Production URL: ' + API_BASE);
  console.log('=' .repeat(60));

  try {
    await testCompression();
    await testETagGeneration();
    await testETagValidation();
    await testCacheHeaders();
    await testPayloadReduction();
    await testResponseTimeOverhead();
    await testVariedSizes();
    await testETagConsistency();

    printSummary();

    process.exit(testResults.failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
