/**
 * Agent Orchestration Service
 * Coordinates the complete automated agent workflow
 *
 * Flow:
 * 1. GitHub webhook received by controller
 * 2. Controller routes to appropriate handler (PR, Push, Workflow)
 * 3. Handler invokes this orchestration service
 * 4. Service invokes multiple agents in parallel
 * 5. Service posts results back to GitHub
 * 6. Service logs findings to database (audit trail)
 */
import { type AgentResponse } from './agent-invocation.service.js';
/**
 * Orchestration context for a GitHub event
 */
export interface OrchestrationContext {
    eventType: 'pull_request' | 'push' | 'workflow_run';
    githubData: {
        repo?: {
            owner: string;
            name: string;
        };
        pr?: {
            number: number;
            title: string;
            base?: {
                repo?: {
                    owner: {
                        login: string;
                    };
                    name: string;
                };
            };
        };
        pusher?: {
            name: string;
        };
        workflow?: {
            name: string;
        };
    };
    context: {
        [key: string]: any;
    };
}
/**
 * Orchestration result containing all findings and status
 */
export interface OrchestrationResult {
    success: boolean;
    eventType: string;
    agentsInvoked: number;
    agentsSucceeded: number;
    agentsFailed: number;
    findings: AgentResponse[];
    errors: string[];
    postedToGitHub: boolean;
    timestamp: Date;
}
/**
 * Main orchestration function - coordinates full workflow
 */
export declare function orchestrateAgentWorkflow(context: OrchestrationContext): Promise<OrchestrationResult>;
/**
 * Get orchestration status summary
 */
export declare function getOrchestrationSummary(result: OrchestrationResult): string;
/**
 * Critical issues detection for workflow outcomes
 */
export declare function hasCriticalIssues(result: OrchestrationResult): boolean;
/**
 * Get workflow outcome status for CI/CD integration
 */
export declare function getWorkflowOutcome(result: OrchestrationResult): 'success' | 'warning' | 'failure';
//# sourceMappingURL=agent-orchestration.service.d.ts.map