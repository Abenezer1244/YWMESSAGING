/**
 * Agent Invocation Service
 * Handles automated invocation of Claude agents via Claude API
 * Manages agent selection, prompt formatting, and response processing
 */
interface AgentInvocationRequest {
    agentType: string;
    eventType: string;
    context: any;
    githubData: any;
}
export interface AgentResponse {
    agentType: string;
    findings: string[];
    recommendations: string[];
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    summary: string;
    details: string;
    timestamp: Date;
}
/**
 * Invoke a single agent via Claude API with MCP tools
 *
 * This implements a proper agentic loop:
 * 1. Call Claude with MCPs as tools
 * 2. If Claude uses a tool, execute it
 * 3. Add tool result back to conversation
 * 4. Repeat until Claude outputs final response
 * 5. Parse and return the response
 */
export declare function invokeAgent(request: AgentInvocationRequest): Promise<AgentResponse>;
/**
 * Invoke multiple agents for a given event
 */
export declare function invokeMultipleAgents(agents: string[], request: AgentInvocationRequest, parallel?: boolean, enableCache?: boolean): Promise<AgentResponse[]>;
/**
 * Store agent invocation in audit trail
 */
export declare function storeAgentAudit(agentType: string, eventType: string, githubData: any, response: AgentResponse | null, status: 'success' | 'failed', error?: string): Promise<void>;
/**
 * Format agent responses for display
 */
export declare function formatAgentResponse(response: AgentResponse): string;
/**
 * Combine multiple agent responses into a single report
 */
export declare function combineAgentResponses(responses: AgentResponse[]): string;
/**
 * Get agents to invoke based on event type
 */
export declare function getAgentsForEvent(eventType: string): string[];
/**
 * Get cache statistics (for debugging/monitoring)
 */
export declare function getCacheStats(): {
    size: number;
    maxSize: number;
    entries: Array<{
        hash: string;
        expiresIn: string;
    }>;
};
/**
 * Clear analysis cache (useful for testing/deployments)
 */
export declare function clearAnalysisCache(): void;
export {};
//# sourceMappingURL=agent-invocation.service.d.ts.map