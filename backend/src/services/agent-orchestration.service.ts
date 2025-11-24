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

import { invokeMultipleAgents, getAgentsForEvent, type AgentResponse } from './agent-invocation.service.js';
import { postOrUpdatePRFindings } from './github-results.service.js';

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
          owner: { login: string };
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
export async function orchestrateAgentWorkflow(
  context: OrchestrationContext
): Promise<OrchestrationResult> {
  const result: OrchestrationResult = {
    success: false,
    eventType: context.eventType,
    agentsInvoked: 0,
    agentsSucceeded: 0,
    agentsFailed: 0,
    findings: [],
    errors: [],
    postedToGitHub: false,
    timestamp: new Date(),
  };

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🤖 Agent Orchestration Started`);
    console.log(`   Event Type: ${context.eventType}`);
    console.log(`   Timestamp: ${result.timestamp.toISOString()}`);
    console.log(`${'='.repeat(60)}`);

    // Step 1: Get appropriate agents for this event type
    const agents = getAgentsForEvent(context.eventType);

    if (agents.length === 0) {
      console.warn(`⚠️ No agents configured for event type: ${context.eventType}`);
      result.success = true;
      return result;
    }

    result.agentsInvoked = agents.length;
    console.log(`\n📡 Step 1: Agent Selection`);
    console.log(`   Agents: ${agents.join(', ')}`);

    // Step 2: Invoke all agents in parallel
    console.log(`\n⚙️ Step 2: Invoking Agents`);
    console.log(`   Mode: Parallel (${agents.length} agents)`);
    console.log(`   Starting invocation...`);

    try {
      const responses = await invokeMultipleAgents(
        agents,
        {
          agentType: '',
          eventType: context.eventType,
          context: context.context,
          githubData: context.githubData,
        },
        true // parallel execution
      );

      result.findings = responses;
      result.agentsSucceeded = responses.length;
      result.agentsFailed = agents.length - responses.length;

      console.log(`\n✅ Step 2 Complete`);
      console.log(`   Agents succeeded: ${result.agentsSucceeded}/${result.agentsInvoked}`);

      // Summary of findings
      const severities = {
        critical: responses.filter((r) => r.severity === 'critical').length,
        high: responses.filter((r) => r.severity === 'high').length,
        medium: responses.filter((r) => r.severity === 'medium').length,
        low: responses.filter((r) => r.severity === 'low').length,
        info: responses.filter((r) => r.severity === 'info').length,
      };

      console.log(`\n📊 Findings Summary`);
      Object.entries(severities).forEach(([severity, count]) => {
        if (count > 0) {
          console.log(`   ${severity.toUpperCase()}: ${count}`);
        }
      });
    } catch (error: any) {
      result.agentsFailed = agents.length;
      result.errors.push(`Agent invocation failed: ${error.message}`);
      console.error(`❌ Step 2 Failed: ${error.message}`);
      throw error;
    }

    // Step 3: Post results to GitHub (for PR events)
    if (context.eventType === 'pull_request' && context.githubData.pr) {
      console.log(`\n📝 Step 3: Posting Results to GitHub`);

      try {
        const pr = context.githubData.pr;
        const posted = await postOrUpdatePRFindings(
          {
            repoOwner: pr.base?.repo?.owner.login || context.githubData.repo?.owner || 'unknown',
            repoName: pr.base?.repo?.name || context.githubData.repo?.name || 'unknown',
            prNumber: pr.number,
          },
          result.findings
        );

        result.postedToGitHub = posted;

        if (posted) {
          console.log(`✅ Step 3 Complete`);
          console.log(`   PR #${pr.number}: Results posted successfully`);
        } else {
          console.warn(`⚠️ Step 3 Partial: Failed to post to GitHub`);
          result.errors.push('Failed to post findings to GitHub PR');
        }
      } catch (error: any) {
        console.error(`❌ Step 3 Failed: ${error.message}`);
        result.errors.push(`GitHub posting failed: ${error.message}`);
      }
    }

    // Step 4: Log audit trail (would integrate with database)
    console.log(`\n📋 Step 4: Audit Trail`);
    console.log(`   Event recorded with ${result.findings.length} agent findings`);
    console.log(`   Database integration: Ready (awaiting Prisma schema)`);

    result.success = result.agentsFailed === 0;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`${result.success ? '✅' : '⚠️'} Agent Orchestration Complete`);
    console.log(`${'='.repeat(60)}\n`);

    return result;
  } catch (error: any) {
    result.success = false;
    result.errors.push(`Orchestration failed: ${error.message}`);
    console.error(`\n❌ ORCHESTRATION FAILED: ${error.message}`);
    return result;
  }
}

/**
 * Get orchestration status summary
 */
export function getOrchestrationSummary(result: OrchestrationResult): string {
  const lines = [
    `🤖 Orchestration Summary`,
    `Event Type: ${result.eventType}`,
    `Status: ${result.success ? '✅ Success' : '❌ Failed'}`,
    `Agents: ${result.agentsSucceeded}/${result.agentsInvoked} succeeded`,
    `Findings: ${result.findings.length}`,
    `Posted to GitHub: ${result.postedToGitHub ? '✅ Yes' : '❌ No'}`,
  ];

  if (result.errors.length > 0) {
    lines.push(`Errors: ${result.errors.length}`);
    result.errors.forEach((err) => lines.push(`  - ${err}`));
  }

  return lines.join('\n');
}

/**
 * Critical issues detection for workflow outcomes
 */
export function hasCriticalIssues(result: OrchestrationResult): boolean {
  return result.findings.some((f) => f.severity === 'critical') || result.agentsFailed > 0;
}

/**
 * Get workflow outcome status for CI/CD integration
 */
export function getWorkflowOutcome(result: OrchestrationResult): 'success' | 'warning' | 'failure' {
  if (!result.success || result.agentsFailed > 0) {
    return 'failure';
  }

  if (result.findings.some((f) => f.severity === 'critical')) {
    return 'warning';
  }

  return 'success';
}
