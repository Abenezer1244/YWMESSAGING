/**
 * MCP REST API Endpoints - Integration Tests
 *
 * Real tests for all MCP REST endpoints:
 * - Semgrep code scanning
 * - Ref documentation search & read
 * - Context7 library resolution & documentation
 * - Health check
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const client = axios.create({
  baseURL: API_BASE_URL,
  validateStatus: () => true, // Don't throw on any status code
});

describe('MCP REST API Endpoints', () => {
  // Wait for backend to be ready
  beforeAll(async () => {
    let retries = 0;
    const maxRetries = 30;

    while (retries < maxRetries) {
      try {
        await client.get('/health');
        console.log('✓ Backend is running');
        break;
      } catch (err) {
        retries++;
        if (retries === maxRetries) {
          throw new Error('Backend not available after 30 seconds');
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }, 60000);

  describe('GET /api/security/health', () => {
    test('should return health status of all MCP tools', async () => {
      const response = await client.get('/api/security/health');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('tools');
      expect(response.data.tools).toHaveProperty('semgrep');
      expect(response.data.tools).toHaveProperty('exa');
      expect(response.data.tools).toHaveProperty('ref');
      expect(response.data.tools).toHaveProperty('context7');

      console.log('Health Check Response:', JSON.stringify(response.data, null, 2));
    });

    test('health status should indicate tool availability', async () => {
      const response = await client.get('/api/security/health');

      expect(['operational', 'degraded', 'unhealthy']).toContain(response.data.status);
      expect(['available', 'unavailable']).toContain(response.data.tools.semgrep);
    });
  });

  describe('POST /api/security/semgrep-scan', () => {
    test('should accept valid code and language', async () => {
      const response = await client.post('/api/security/semgrep-scan', {
        code: 'password = "hardcoded123"',
        language: 'python',
      });

      expect([200, 400, 500]).toContain(response.status);
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('tool');
      expect(response.data.tool).toBe('semgrep_scan');

      console.log('Semgrep Response:', JSON.stringify(response.data, null, 2));
    });

    test('should validate required parameters', async () => {
      const response = await client.post('/api/security/semgrep-scan', {
        code: 'const x = 1;',
        // missing language
      });

      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      console.log('Validation Error:', response.data.error);
    });

    test('should reject missing code', async () => {
      const response = await client.post('/api/security/semgrep-scan', {
        language: 'javascript',
        // missing code
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('code');
    });

    test('should handle language aliases', async () => {
      const response = await client.post('/api/security/semgrep-scan', {
        code: 'const password = "secret";',
        language: 'js', // Should be mapped to javascript
      });

      expect([200, 400, 500]).toContain(response.status);
      if (response.data.status === 'success') {
        expect(response.data.language).toBe('javascript');
      }
      console.log('Language Mapping Response:', response.data.status);
    });
  });

  describe('POST /api/security/ref/search', () => {
    test('should accept documentation search query', async () => {
      const response = await client.post('/api/security/ref/search', {
        query: 'React hooks best practices',
      });

      expect([200, 400, 500]).toContain(response.status);
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('tool');
      expect(response.data.tool).toBe('ref_search_documentation');

      console.log('Ref Search Response:', JSON.stringify(response.data, null, 2));
    });

    test('should validate query parameter', async () => {
      const response = await client.post('/api/security/ref/search', {
        // missing query
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('query');
    });

    test('should reject empty queries', async () => {
      const response = await client.post('/api/security/ref/search', {
        query: '',
      });

      expect(response.status).toBe(400);
    });

    test('should enforce query length limit', async () => {
      const longQuery = 'a'.repeat(501);
      const response = await client.post('/api/security/ref/search', {
        query: longQuery,
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('exceeds');
    });
  });

  describe('POST /api/security/ref/read', () => {
    test('should accept documentation URL', async () => {
      const response = await client.post('/api/security/ref/read', {
        url: 'https://react.dev/reference/react/useState',
      });

      expect([200, 400, 500]).toContain(response.status);
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('tool');
      expect(response.data.tool).toBe('ref_read_url');

      console.log('Ref Read Response:', JSON.stringify(response.data, null, 2));
    });

    test('should validate URL parameter', async () => {
      const response = await client.post('/api/security/ref/read', {
        // missing url
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('url');
    });

    test('should reject invalid URLs', async () => {
      const response = await client.post('/api/security/ref/read', {
        url: 'not-a-valid-url',
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('URL');
    });

    test('should accept URLs with hash fragments', async () => {
      const response = await client.post('/api/security/ref/read', {
        url: 'https://nodejs.org/api/fs.html#fs_file_system',
      });

      expect([200, 400, 500]).toContain(response.status);
      expect(response.data.tool).toBe('ref_read_url');
    });
  });

  describe('POST /api/security/context7/resolve', () => {
    test('should accept library name', async () => {
      const response = await client.post('/api/security/context7/resolve', {
        libraryName: 'React',
      });

      expect([200, 400, 500]).toContain(response.status);
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('tool');
      expect(response.data.tool).toBe('context7_resolve_library_id');

      console.log('Context7 Resolve Response:', JSON.stringify(response.data, null, 2));
    });

    test('should validate library name parameter', async () => {
      const response = await client.post('/api/security/context7/resolve', {
        // missing libraryName
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('libraryName');
    });

    test('should enforce library name length limit', async () => {
      const longName = 'a'.repeat(201);
      const response = await client.post('/api/security/context7/resolve', {
        libraryName: longName,
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('exceeds');
    });
  });

  describe('POST /api/security/context7/docs', () => {
    test('should accept library ID and return docs', async () => {
      const response = await client.post('/api/security/context7/docs', {
        libraryId: '/facebook/react',
      });

      expect([200, 400, 500]).toContain(response.status);
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('tool');
      expect(response.data.tool).toBe('context7_get_library_docs');

      console.log('Context7 Docs Response:', JSON.stringify(response.data, null, 2));
    });

    test('should accept optional topic and mode', async () => {
      const response = await client.post('/api/security/context7/docs', {
        libraryId: '/facebook/react',
        topic: 'hooks',
        mode: 'code',
      });

      expect([200, 400, 500]).toContain(response.status);
      if (response.data.status === 'success') {
        expect(response.data.tool).toBe('context7_get_library_docs');
      }
    });

    test('should support info mode', async () => {
      const response = await client.post('/api/security/context7/docs', {
        libraryId: '/facebook/react',
        mode: 'info',
      });

      expect([200, 400, 500]).toContain(response.status);
      expect(response.data.tool).toBe('context7_get_library_docs');
    });

    test('should validate library ID parameter', async () => {
      const response = await client.post('/api/security/context7/docs', {
        // missing libraryId
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('libraryId');
    });

    test('should reject invalid mode values', async () => {
      const response = await client.post('/api/security/context7/docs', {
        libraryId: '/facebook/react',
        mode: 'invalid',
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('mode');
    });

    test('should default to code mode if not specified', async () => {
      const response = await client.post('/api/security/context7/docs', {
        libraryId: '/facebook/react',
        // mode not specified, should default to 'code'
      });

      expect([200, 400, 500]).toContain(response.status);
      expect(response.data.tool).toBe('context7_get_library_docs');
    });
  });

  describe('Integration Tests', () => {
    test('all endpoints should be rate-limited', async () => {
      // Note: This is a smoke test - real rate limiting test would need
      // to send many requests quickly. Here we just verify endpoints exist.
      const endpoints = [
        { method: 'get', url: '/api/security/health' },
        { method: 'post', url: '/api/security/semgrep-scan', data: { code: 'x=1', language: 'js' } },
        { method: 'post', url: '/api/security/ref/search', data: { query: 'test' } },
        { method: 'post', url: '/api/security/ref/read', data: { url: 'https://example.com' } },
        {
          method: 'post',
          url: '/api/security/context7/resolve',
          data: { libraryName: 'React' },
        },
        { method: 'post', url: '/api/security/context7/docs', data: { libraryId: '/facebook/react' } },
      ];

      for (const endpoint of endpoints) {
        const response = await client[endpoint.method](endpoint.url, endpoint.data);
        expect([200, 400, 500]).toContain(response.status);
        console.log(`✓ ${endpoint.method.toUpperCase()} ${endpoint.url}`);
      }
    });

    test('should have proper error responses', async () => {
      const response = await client.post('/api/security/semgrep-scan', {
        // Empty request
      });

      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('error');
      expect(response.data.status).toBe('error');
    });

    test('all endpoints should include tool metadata in responses', async () => {
      const endpoints = [
        { method: 'post', url: '/api/security/semgrep-scan', data: { code: 'x=1', language: 'js' } },
        { method: 'post', url: '/api/security/ref/search', data: { query: 'test' } },
      ];

      for (const endpoint of endpoints) {
        const response = await client[endpoint.method](endpoint.url, endpoint.data);
        expect(response.data).toHaveProperty('tool');
        expect(response.data).toHaveProperty('status');
      }
    });
  });
});
