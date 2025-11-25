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
 * Invoke a single agent via Claude API
 */ export declare function invokeAgent(request: AgentInvocationRequest): Promise<AgentResponse>;
/**
 * Invoke multiple agents for a given event
 */
export declare function invokeMultipleAgents(agents: string[], request: AgentInvocationRequest, parallel?: boolean): Promise<AgentResponse[]>;
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
export {};
//# sourceMappingURL=agent-invocation.service.d.ts.map