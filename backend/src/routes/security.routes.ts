import { Router, Request, Response } from 'express';
import { executeSemgrepScan } from '../services/mcp-real-tools.service.js';

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
router.post('/semgrep-scan', async (req: Request, res: Response) => {
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
  } catch (error: any) {
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
 * GET /api/security/health
 * Check if security scanning service is available
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const hasKey = !!process.env.SEMGREP_API_KEY;
    const exaKeyPresent = !!process.env.EXA_API_KEY;

    res.json({
      status: hasKey ? 'operational' : 'degraded',
      tools: {
        semgrep: hasKey ? 'available' : 'unavailable',
        exa: exaKeyPresent ? 'available' : 'unavailable',
      },
      message: hasKey
        ? 'Code security scanning service is operational'
        : 'SEMGREP_API_KEY not configured',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'Failed to check security service health',
    });
  }
});

export default router;
