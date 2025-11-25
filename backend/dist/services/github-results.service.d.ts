import { AgentResponse } from './agent-invocation.service.js';
/**
 * GitHub Results Service
 * Posts agent findings back to GitHub PRs as comments
 * Formats responses into GitHub Markdown with severity levels
 */
interface GitHubPRContext {
    repoOwner: string;
    repoName: string;
    prNumber: number;
}
/**
 * Format agent responses into a GitHub PR comment
 */
export declare function formatAgentFindingsForGitHub(responses: AgentResponse[]): string;
/**
 * Post agent findings to a GitHub PR as a comment
 */
export declare function postPRComment(context: GitHubPRContext, responses: AgentResponse[]): Promise<boolean>;
/**
 * Update existing agent findings comment (for re-runs)
 */
export declare function updatePRComment(context: GitHubPRContext, commentId: number, responses: AgentResponse[]): Promise<boolean>;
/**
 * Find existing agent findings comment on a PR
 */
export declare function findAgentComment(context: GitHubPRContext): Promise<number | null>;
/**
 * Post or update agent findings on PR (idempotent)
 */
export declare function postOrUpdatePRFindings(context: GitHubPRContext, responses: AgentResponse[]): Promise<boolean>;
export {};
//# sourceMappingURL=github-results.service.d.ts.map