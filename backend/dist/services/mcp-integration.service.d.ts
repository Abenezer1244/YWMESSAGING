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
/**
 * Agent MCP configuration
 * Each agent gets MCPs relevant to their expertise
 */
export declare const AGENT_MCP_CONFIG: Record<string, string[]>;
/**
 * Get tools for a specific agent
 */
export declare function getAgentTools(agentType: string): any[];
/**
 * Tool execution handler for MCPs
 * Executes REAL MCP tools with actual API calls
 *
 * NO MOCKS. PRODUCTION IMPLEMENTATION.
 */
export declare function executeToolCall(toolName: string, toolInput: Record<string, any>): Promise<string>;
/**
 * Build tools array for Claude API request
 */
export declare function buildToolsArray(agentType: string): any[];
/**
 * Log MCP usage statistics
 */
export declare function logMcpStats(agentType: string): void;
/**
 * Verify MCP configuration for all agents
 */
export declare function verifyMcpConfiguration(): {
    valid: boolean;
    agents: Record<string, {
        tools: number;
        list: string[];
    }>;
};
//# sourceMappingURL=mcp-integration.service.d.ts.map