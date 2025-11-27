import { Router } from 'express';
import { executeSemgrepScan } from '../services/mcp-real-tools.service.js';
import { searchDocumentation, readDocumentationUrl, resolveLibraryId, getLibraryDocs, } from '../services/mcp-agent-gateway.service.js';
const router = Router();
/**
 * Security & Code Analysis Routes
 *
 * REST endpoints for code security scanning and analysis tools
 * These are backed by real API integrations (Semgrep, etc)
 */
/**
 * POST /api/security/semgrep-scan
 * Perform code security scanning with Semgrep
 *
 * Request body:
 * {
 *   "code": "const password = 'hardcoded';",
 *   "language": "javascript",
 *   "rules": "security" (optional)
 * }
 *
 * Response:
 * {
 *   "status": "success",
 *   "tool": "semgrep_scan",
 *   "language": "javascript",
 *   "results_count": 1,
 *   "results": [
 *     {
 *       "rule_id": "javascript.lang.hardcoded-password",
 *       "message": "Hardcoded credentials detected",
 *       "severity": "HIGH",
 *       "line": 1,
 *       "column": 17
 *     }
 *   ],
 *   "timestamp": "2025-11-26T06:30:00.000Z"
 * }
 */
router.post('/semgrep-scan', async (req, res) => {
    try {
        const { code, language, rules } = req.body;
        // Validate input
        if (!code || !language) {
            return res.status(400).json({
                status: 'error',
                error: 'Missing required fields: code, language',
            });
        }
        if (code.length > 1000000) {
            // 1MB limit
            return res.status(400).json({
                status: 'error',
                error: 'Code size exceeds 1MB limit',
            });
        }
        console.log(`📊 Semgrep scan requested - Language: ${language}, Size: ${code.length} bytes`);
        const result = await executeSemgrepScan({
            code,
            language,
            rules: rules || 'security',
        });
        // Return appropriate status code based on result
        const statusCode = result.status === 'success' ? 200 : result.status === 'error' ? 400 : 200;
        res.status(statusCode).json(result);
    }
    catch (error) {
        console.error('Semgrep scan error:', error);
        res.status(500).json({
            status: 'error',
            tool: 'semgrep_scan',
            error: 'Internal server error during code scanning',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
/**
 * POST /api/security/ref/search
 * Search documentation using Ref MCP via Claude agent
 *
 * Request body:
 * {
 *   "query": "React hooks"
 * }
 *
 * Response:
 * {
 *   "status": "success",
 *   "tool": "ref_search_documentation",
 *   "response": "Documentation search results..."
 * }
 */
router.post('/ref/search', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                status: 'error',
                error: 'Missing required field: query (string)',
            });
        }
        if (query.length > 500) {
            return res.status(400).json({
                status: 'error',
                error: 'Query exceeds 500 character limit',
            });
        }
        console.log(`📊 Ref search requested - Query: "${query}"`);
        const result = await searchDocumentation(query);
        const statusCode = result.status === 'success' ? 200 : 400;
        res.status(statusCode).json(result);
    }
    catch (error) {
        console.error('Ref search error:', error);
        res.status(500).json({
            status: 'error',
            tool: 'ref_search_documentation',
            error: 'Failed to search documentation',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
/**
 * POST /api/security/ref/read
 * Read documentation from a URL using Ref MCP via Claude agent
 *
 * Request body:
 * {
 *   "url": "https://react.dev/reference/react/useState"
 * }
 *
 * Response:
 * {
 *   "status": "success",
 *   "tool": "ref_read_url",
 *   "response": "Documentation content..."
 * }
 */
router.post('/ref/read', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || typeof url !== 'string') {
            return res.status(400).json({
                status: 'error',
                error: 'Missing required field: url (string)',
            });
        }
        // Basic URL validation
        try {
            new URL(url);
        }
        catch {
            return res.status(400).json({
                status: 'error',
                error: 'Invalid URL format',
            });
        }
        console.log(`📊 Ref read requested - URL: ${url}`);
        const result = await readDocumentationUrl(url);
        const statusCode = result.status === 'success' ? 200 : 400;
        res.status(statusCode).json(result);
    }
    catch (error) {
        console.error('Ref read error:', error);
        res.status(500).json({
            status: 'error',
            tool: 'ref_read_url',
            error: 'Failed to read documentation URL',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
/**
 * POST /api/security/context7/resolve
 * Resolve a library name to Context7 library ID via Claude agent
 *
 * Request body:
 * {
 *   "libraryName": "React"
 * }
 *
 * Response:
 * {
 *   "status": "success",
 *   "tool": "context7_resolve_library_id",
 *   "response": "Library ID resolution results..."
 * }
 */
router.post('/context7/resolve', async (req, res) => {
    try {
        const { libraryName } = req.body;
        if (!libraryName || typeof libraryName !== 'string') {
            return res.status(400).json({
                status: 'error',
                error: 'Missing required field: libraryName (string)',
            });
        }
        if (libraryName.length > 200) {
            return res.status(400).json({
                status: 'error',
                error: 'Library name exceeds 200 character limit',
            });
        }
        console.log(`📊 Context7 resolve requested - Library: "${libraryName}"`);
        const result = await resolveLibraryId(libraryName);
        const statusCode = result.status === 'success' ? 200 : 400;
        res.status(statusCode).json(result);
    }
    catch (error) {
        console.error('Context7 resolve error:', error);
        res.status(500).json({
            status: 'error',
            tool: 'context7_resolve_library_id',
            error: 'Failed to resolve library ID',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
/**
 * POST /api/security/context7/docs
 * Get library documentation from Context7 via Claude agent
 *
 * Request body:
 * {
 *   "libraryId": "/facebook/react",
 *   "topic": "hooks",
 *   "mode": "code"
 * }
 *
 * Response:
 * {
 *   "status": "success",
 *   "tool": "context7_get_library_docs",
 *   "response": "Library documentation..."
 * }
 */
router.post('/context7/docs', async (req, res) => {
    try {
        const { libraryId, topic, mode = 'code' } = req.body;
        if (!libraryId || typeof libraryId !== 'string') {
            return res.status(400).json({
                status: 'error',
                error: 'Missing required field: libraryId (string)',
            });
        }
        if (!['code', 'info'].includes(mode)) {
            return res.status(400).json({
                status: 'error',
                error: "Invalid mode. Must be 'code' or 'info'",
            });
        }
        console.log(`📊 Context7 docs requested - Library: ${libraryId}, Mode: ${mode}`);
        if (topic)
            console.log(`   Topic: ${topic}`);
        const result = await getLibraryDocs(libraryId, topic, mode);
        const statusCode = result.status === 'success' ? 200 : 400;
        res.status(statusCode).json(result);
    }
    catch (error) {
        console.error('Context7 docs error:', error);
        res.status(500).json({
            status: 'error',
            tool: 'context7_get_library_docs',
            error: 'Failed to get library documentation',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
/**
 * GET /api/security/health
 * Check if security scanning service is available
 */
router.get('/health', async (req, res) => {
    try {
        const hasKey = !!process.env.SEMGREP_API_KEY;
        const exaKeyPresent = !!process.env.EXA_API_KEY;
        const claudeKeyPresent = !!process.env.CLAUDE_API_KEY;
        res.json({
            status: hasKey ? 'operational' : 'degraded',
            tools: {
                semgrep: hasKey ? 'available' : 'unavailable',
                exa: exaKeyPresent ? 'available' : 'unavailable',
                ref: claudeKeyPresent ? 'available' : 'unavailable',
                context7: claudeKeyPresent ? 'available' : 'unavailable',
            },
            message: hasKey
                ? 'Code security scanning service is operational'
                : 'SEMGREP_API_KEY not configured',
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Failed to check security service health',
        });
    }
});
export default router;
//# sourceMappingURL=security.routes.js.map