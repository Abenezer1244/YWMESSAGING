import { Router } from 'express';
import { invokeMultipleAgents, } from '../services/agent-invocation.service.js';
const router = Router();
/**
 * Agent Routes
 *
 * Endpoints for direct agent invocation (from LSP Server, IDE plugins, etc)
 * These routes allow tools to request code analysis from AI agents
 */
/**
 * POST /api/agents/invoke
 * Invoke agents for file analysis
 *
 * Request body:
 * {
 *   "fileContent": "const x = 1;",
 *   "fileName": "example.ts",
 *   "language": "typescript",
 *   "agents": ["backend-engineer", "security-analyst"]
 * }
 *
 * Response:
 * {
 *   "fileUri": "file:///path/to/file.ts",
 *   "results": [
 *     {
 *       "agent": "backend-engineer",
 *       "success": true,
 *       "issues": [...],
 *       "duration": 2345
 *     }
 *   ],
 *   "totalDuration": 4567,
 *   "timestamp": "2025-11-25T20:30:00.000Z"
 * }
 */
router.post('/agents/invoke', async (req, res) => {
    try {
        const { fileContent, fileName, language, agents } = req.body;
        // Validate required fields
        if (!fileContent) {
            return res.status(400).json({
                error: 'Missing required field: fileContent',
            });
        }
        if (!fileName) {
            return res.status(400).json({
                error: 'Missing required field: fileName',
            });
        }
        if (!language) {
            return res.status(400).json({
                error: 'Missing required field: language',
            });
        }
        if (!agents || agents.length === 0) {
            return res.status(400).json({
                error: 'Missing required field: agents (array)',
            });
        }
        if (!Array.isArray(agents)) {
            return res.status(400).json({
                error: 'agents must be an array of agent types',
            });
        }
        console.log(`🔍 Analyzing file: ${fileName}`);
        console.log(`   Language: ${language}`);
        console.log(`   Agents: ${agents.length}`);
        console.log(`   Content size: ${fileContent.length} bytes`);
        const startTime = Date.now();
        // Invoke agents for the file
        const agentResponses = await invokeMultipleAgents(agents, {
            agentType: 'batch', // Pseudo type for batch invocation
            eventType: 'lsp_analysis',
            context: {
                fileContent,
                fileName,
                language,
                analysis: fileContent.substring(0, 500), // First 500 chars for analysis
            },
            githubData: {}, // Empty for non-GitHub invocations
        }, true // parallel execution
        );
        const totalDuration = Date.now() - startTime;
        // Convert agent responses to issue format
        const results = agentResponses.map((agentResponse) => ({
            agent: agentResponse.agentType,
            success: true,
            issues: agentResponse.findings.map((finding, index) => ({
                message: finding,
                severity: agentResponse.severity === 'critical' ? 'error' :
                    agentResponse.severity === 'high' ? 'warning' :
                        agentResponse.severity === 'medium' ? 'info' : 'hint',
                line: undefined,
                column: undefined,
                suggestion: agentResponse.recommendations[index],
            })),
            duration: totalDuration / agentResponses.length,
        }));
        console.log(`✅ Analysis complete`);
        console.log(`   Total duration: ${totalDuration}ms`);
        console.log(`   Agents completed: ${results.length}`);
        console.log(`   Total issues: ${results.reduce((sum, r) => sum + r.issues.length, 0)}`);
        // Send response
        res.json({
            fileUri: `file:///${fileName}`,
            results,
            totalDuration,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('❌ Error invoking agents:', error.message);
        res.status(500).json({
            error: 'Failed to invoke agents',
            message: error.message,
        });
    }
});
/**
 * GET /api/agents/available
 * Get list of available agents
 *
 * Response:
 * {
 *   "agents": ["backend-engineer", "senior-frontend", ...]
 * }
 */
router.get('/agents/available', async (req, res) => {
    try {
        const availableAgents = [
            'backend-engineer',
            'senior-frontend',
            'security-analyst',
            'design-review',
            'qa-testing',
            'system-architecture',
            'devops',
            'product-manager',
        ];
        res.json({
            agents: availableAgents,
        });
    }
    catch (error) {
        console.error('❌ Error fetching available agents:', error.message);
        res.status(500).json({
            error: 'Failed to fetch available agents',
            message: error.message,
        });
    }
});
/**
 * GET /api/agents/health
 * Health check for agent service
 *
 * Response:
 * {
 *   "status": "healthy",
 *   "timestamp": "2025-11-25T20:30:00.000Z"
 * }
 */
router.get('/agents/health', async (req, res) => {
    try {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('❌ Health check failed:', error.message);
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
        });
    }
});
export default router;
//# sourceMappingURL=agents.routes.js.map