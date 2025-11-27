/**
 * MCP Integration Service
 *
 * Integrates Model Context Providers with Claude agents.
 * Each agent gets MCPs relevant to their role for enhanced analysis.
 *
 * PRODUCTION IMPLEMENTATION:
 * - ref: Real documentation lookup via API
 * - context7: Real code examples and library docs via API
 * - exa: Real web search via Exa API
 * - semgrep: Real code security scanning via Semgrep API
 * - playwright: Browser integration (browser instance required)
 *
 * NO MOCKS. NO STUBS. REAL IMPLEMENTATIONS.
 */
import { executeExaSearch, executeContext7Docs, executeContext7Resolve, executeSemgrepScan, executeRefSearch, executeRefRead, executePlaywrightNavigate, executePlaywrightScreenshot, } from './mcp-real-tools.service.js';
/**
 * Tool definitions for each MCP
 */
const MCP_TOOLS = {
    // Ref MCP - Documentation lookup
    ref_search: {
        name: 'ref_search_documentation',
        description: 'Search documentation for libraries, frameworks, and best practices',
        input_schema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search query for documentation (e.g., "React hooks", "TypeScript strict mode")',
                },
            },
            required: ['query'],
        },
    },
    ref_read: {
        name: 'ref_read_url',
        description: 'Read documentation from a specific URL',
        input_schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'The exact URL from ref_search_documentation result',
                },
            },
            required: ['url'],
        },
    },
    // Context7 MCP - Code context and examples
    context7_resolve: {
        name: 'context7_resolve_library_id',
        description: 'Resolve a library/package name to get Context7-compatible ID',
        input_schema: {
            type: 'object',
            properties: {
                library_name: {
                    type: 'string',
                    description: 'Name of library/framework (e.g., "React", "Next.js", "Express")',
                },
            },
            required: ['library_name'],
        },
    },
    context7_docs: {
        name: 'context7_get_library_docs',
        description: 'Fetch documentation and code examples for a library',
        input_schema: {
            type: 'object',
            properties: {
                library_id: {
                    type: 'string',
                    description: 'Context7-compatible library ID (e.g., "/react/docs")',
                },
                topic: {
                    type: 'string',
                    description: 'Optional specific topic (e.g., "hooks", "performance")',
                },
                mode: {
                    type: 'string',
                    enum: ['code', 'info'],
                    description: 'code=API reference, info=conceptual guides',
                },
            },
            required: ['library_id'],
        },
    },
    // Exa MCP - Web search
    exa_search: {
        name: 'exa_web_search_exa',
        description: 'Search the web for current information and best practices',
        input_schema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search query (e.g., "React performance optimization 2025")',
                },
                type: {
                    type: 'string',
                    enum: ['auto', 'fast', 'deep'],
                    description: 'Search depth: auto=balanced, fast=quick, deep=comprehensive',
                },
                num_results: {
                    type: 'number',
                    description: 'Number of results to return (default: 8)',
                },
            },
            required: ['query'],
        },
    },
    // Semgrep MCP - Code security scanning
    semgrep_scan: {
        name: 'semgrep_scan',
        description: 'Scan code for security vulnerabilities and code patterns',
        input_schema: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    description: 'Code to scan',
                },
                language: {
                    type: 'string',
                    description: 'Programming language (e.g., "javascript", "python", "typescript")',
                },
                rules: {
                    type: 'string',
                    description: 'Semgrep rules to use (e.g., "security", "performance", "best-practices")',
                },
            },
            required: ['code', 'language'],
        },
    },
    // Playwright MCP - UI Testing
    playwright_screenshot: {
        name: 'playwright_browser_take_screenshot',
        description: 'Take screenshot of a webpage for visual verification',
        input_schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'URL to take screenshot of',
                },
            },
            required: ['url'],
        },
    },
    playwright_navigate: {
        name: 'playwright_browser_navigate',
        description: 'Navigate to a URL in the browser',
        input_schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'URL to navigate to',
                },
            },
            required: ['url'],
        },
    },
};
/**
 * Agent MCP configuration
 * Each agent gets MCPs relevant to their expertise
 */
export const AGENT_MCP_CONFIG = {
    'backend-engineer': [
        'context7_resolve',
        'context7_docs',
        'exa_search',
        'semgrep_scan',
    ],
    'senior-frontend': [
        'context7_resolve',
        'context7_docs',
        'exa_search',
        'semgrep_scan',
        'playwright_navigate',
        'playwright_screenshot',
    ],
    'security-analyst': [
        'semgrep_scan',
        'exa_search',
        'context7_resolve',
        'context7_docs',
    ],
    'design-review': [
        'playwright_navigate',
        'playwright_screenshot',
        'exa_search',
    ],
    'qa-testing': [
        'playwright_navigate',
        'playwright_screenshot',
        'semgrep_scan',
        'exa_search',
    ],
    'system-architecture': [
        'context7_resolve',
        'context7_docs',
        'exa_search',
    ],
    'devops': [
        'context7_resolve',
        'context7_docs',
        'exa_search',
    ],
    'product-manager': [
        'exa_search',
        'context7_resolve',
        'context7_docs',
    ],
};
/**
 * Get tools for a specific agent
 */
export function getAgentTools(agentType) {
    const mcpNames = AGENT_MCP_CONFIG[agentType] || [];
    const tools = [];
    for (const mcpName of mcpNames) {
        const tool = MCP_TOOLS[mcpName];
        if (tool) {
            tools.push(tool);
        }
    }
    return tools;
}
/**
 * Tool execution handler for MCPs
 * Executes REAL MCP tools with actual API calls
 *
 * NO MOCKS. PRODUCTION IMPLEMENTATION.
 */
export async function executeToolCall(toolName, toolInput) {
    console.log(`\n🔧 EXECUTING REAL MCP TOOL: ${toolName}`);
    console.log(`   Input: ${JSON.stringify(toolInput)}`);
    try {
        let result;
        // REAL tool execution - no mocks
        switch (toolName) {
            // Ref MCP - REAL API CALLS
            case 'ref_search_documentation':
                result = await executeRefSearch(toolInput);
                break;
            case 'ref_read_url':
                result = await executeRefRead(toolInput);
                break;
            // Context7 MCP - REAL API CALLS
            case 'context7_resolve_library_id':
                result = await executeContext7Resolve(toolInput);
                break;
            case 'context7_get_library_docs':
                result = await executeContext7Docs(toolInput);
                break;
            // Exa Web Search - REAL API CALL
            case 'exa_web_search_exa':
                result = await executeExaSearch(toolInput);
                break;
            // Semgrep Code Scanning - REAL API CALL
            case 'semgrep_scan':
                result = await executeSemgrepScan(toolInput);
                break;
            // Playwright - Browser integration
            case 'playwright_browser_navigate':
                result = await executePlaywrightNavigate(toolInput);
                break;
            case 'playwright_browser_take_screenshot':
                result = await executePlaywrightScreenshot(toolInput);
                break;
            default:
                return JSON.stringify({
                    error: `Unknown tool: ${toolName}`,
                    available_tools: Object.keys(MCP_TOOLS),
                    status: 'error',
                });
        }
        console.log(`   ✓ Tool execution complete`);
        return JSON.stringify(result);
    }
    catch (error) {
        console.error(`❌ Tool execution error: ${error.message}`);
        return JSON.stringify({
            error: error.message,
            tool: toolName,
            status: 'failed',
        });
    }
}
/**
 * Build tools array for Claude API request
 */
export function buildToolsArray(agentType) {
    const tools = getAgentTools(agentType);
    if (tools.length === 0) {
        console.log(`⚠️ No MCPs configured for agent: ${agentType}`);
        return [];
    }
    console.log(`🔧 Agent "${agentType}" has ${tools.length} MCPs available`);
    tools.forEach((tool) => {
        console.log(`   - ${tool.name}`);
    });
    return tools;
}
/**
 * Log MCP usage statistics
 */
export function logMcpStats(agentType) {
    const tools = getAgentTools(agentType);
    console.log(`📊 MCP Configuration for ${agentType}:`);
    console.log(`   Total Tools: ${tools.length}`);
    tools.forEach((tool) => {
        console.log(`   ✓ ${tool.name}`);
    });
}
/**
 * Verify MCP configuration for all agents
 */
export function verifyMcpConfiguration() {
    const result = {};
    let allValid = true;
    for (const [agentType, toolNames] of Object.entries(AGENT_MCP_CONFIG)) {
        const tools = getAgentTools(agentType);
        result[agentType] = {
            tools: tools.length,
            list: tools.map((t) => t.name),
        };
        if (tools.length === 0) {
            console.warn(`⚠️ Agent "${agentType}" has no MCPs configured`);
            allValid = false;
        }
    }
    return {
        valid: allValid,
        agents: result,
    };
}
//# sourceMappingURL=mcp-integration.service.js.map