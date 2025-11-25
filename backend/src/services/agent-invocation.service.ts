import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
 * Agent definitions with their roles and focus areas
 */
const AGENTS = {
  'backend-engineer': {
    name: '🔧 Backend Engineer',
    role: 'Code review, API design, database optimization',
    prompt: 'You are an expert backend engineer reviewing this change. Focus on: API design, database queries, business logic, performance, scalability.',
  },
  'senior-frontend': {
    name: '🎨 Senior Frontend Engineer',
    role: 'Component architecture, performance optimization',
    prompt: 'You are an expert frontend engineer reviewing this change. Focus on: React/Vue patterns, component architecture, performance, accessibility, best practices.',
  },
  'security-analyst': {
    name: '🔒 Security Analyst',
    role: 'Vulnerability assessment, threat modeling',
    prompt: 'You are a security analyst reviewing this change for vulnerabilities. Focus on: OWASP Top 10, authentication, authorization, data protection, injection attacks, cross-site attacks.',
  },
  'design-review': {
    name: '✨ Design Review',
    role: 'UI/UX consistency, accessibility compliance',
    prompt: 'You are a design specialist reviewing UI/UX changes. Focus on: accessibility (WCAG), responsive design, visual consistency, user experience, design system compliance.',
  },
  'qa-testing': {
    name: '✅ QA Testing',
    role: 'Test coverage, regression risks',
    prompt: 'You are a QA engineer reviewing this change. Focus on: test coverage, edge cases, regression risks, test strategies, manual testing needs.',
  },
  'system-architecture': {
    name: '🏗️ System Architecture',
    role: 'Scalability, architecture patterns',
    prompt: 'You are a systems architect reviewing this change. Focus on: scalability, architecture patterns, system impact, database design, integration points.',
  },
  'devops': {
    name: '🚀 DevOps',
    role: 'Deployment, infrastructure, CI/CD',
    prompt: 'You are a DevOps engineer reviewing this change. Focus on: deployment readiness, infrastructure impact, CI/CD, monitoring, scaling.',
  },
  'product-manager': {
    name: '📊 Product Manager',
    role: 'Feature value, roadmap alignment',
    prompt: 'You are a product manager reviewing this change. Focus on: feature value, user impact, roadmap alignment, business metrics, MVP scope.',
  },
};

/**
 * Build prompt for agent based on event type and context
 */function buildAgentPrompt(
  agentType: string,
  eventType: string,
  context: any,
  githubData: any
): string {
  const agent = AGENTS[agentType as keyof typeof AGENTS];
  if (!agent) {
    throw new Error(`Unknown agent type: ${agentType}`);
  }

  if (!githubData) {
    throw new Error(`Missing githubData for ${eventType} event`);
  }

  let basePrompt = `${agent.prompt}\n\n`;

  // Build context based on event type
  if (eventType === 'pull_request') {
    basePrompt += `
Review the following GitHub Pull Request:

**PR Information:**
- Number: #${githubData.pr.number}
- Title: ${githubData.pr.title}
- Author: ${githubData.pr.user.login}
- Branch: ${githubData.pr.head.ref} → ${githubData.pr.base.ref}
- Description: ${githubData.pr.body || 'No description provided'}

**Files Changed:** ${githubData.pr.changed_files || 'Unknown'} files
**Additions:** +${githubData.pr.additions || 0}
**Deletions:** -${githubData.pr.deletions || 0}

**Changes Summary:**
${context.changesSummary || 'Analysis of changes pending...'}

Please provide:
1. **Key Findings** - Main issues or observations
2. **Recommendations** - Specific improvements
3. **Severity Level** - critical/high/medium/low/info
4. **Summary** - Brief 1-2 sentence summary
5. **Details** - Comprehensive feedback

Format your response as JSON:
{
  "findings": ["finding1", "finding2"],
  "recommendations": ["rec1", "rec2"],
  "severity": "medium",
  "summary": "Brief summary",
  "details": "Full feedback"
}`;
  } else if (eventType === 'push') {
    basePrompt += `
Review the following code push to main branch:

**Commit Information:**
- SHA: ${githubData?.after?.substring(0, 7) || 'unknown'}
- Author: ${githubData?.pusher?.name || 'unknown'}
- Commits: ${githubData?.commits?.length || 0}

**Analysis:**
${context.analysis || 'Code analysis pending...'}

Please provide:
1. **Key Findings** - Important observations
2. **Recommendations** - Improvements
3. **Severity Level** - critical/high/medium/low/info
4. **Summary** - Brief assessment
5. **Details** - Full analysis

Format as JSON (same structure as above).`;
  }

  return basePrompt;
}

/**
 * Invoke a single agent via Claude API
 */export async function invokeAgent(
  request: AgentInvocationRequest
): Promise<AgentResponse> {
  const { agentType, eventType, context, githubData } = request;
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY environment variable not configured');
  }

  try {
    console.log(`\n🤖 Invoking ${agentType} agent...`);
    console.log(`   API Key present: ${apiKey ? 'YES' : 'NO'}`);
    console.log(`   API Key length: ${apiKey ? apiKey.length : 0} chars`);
    console.log(`   Key format: ${apiKey ? apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5) : 'NONE'}`);

    const prompt = buildAgentPrompt(agentType, eventType, context, githubData);

    // Call Claude API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    // Extract response
    const responseContent = response.data.content[0]?.text || '';

    // Parse JSON response
    let parsedResponse: any;
    try {
      // Extract JSON from response (might be wrapped in markdown code blocks)
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (parseError) {
      console.warn(`⚠️ Failed to parse agent response as JSON:`, parseError);
      parsedResponse = {
        findings: [responseContent],
        recommendations: [],
        severity: 'info',
        summary: 'Analysis complete',
        details: responseContent,
      };
    }

    const agentResponse: AgentResponse = {
      agentType,
      findings: parsedResponse.findings || [],
      recommendations: parsedResponse.recommendations || [],
      severity: parsedResponse.severity || 'info',
      summary: parsedResponse.summary || 'No summary provided',
      details: parsedResponse.details || responseContent,
      timestamp: new Date(),
    };

    console.log(`✅ ${agentType} agent completed`);
    console.log(`   Severity: ${agentResponse.severity}`);
    console.log(`   Findings: ${agentResponse.findings.length}`);

    return agentResponse;
  } catch (error: any) {
    console.error(`❌ Error invoking ${agentType} agent:`);
    console.error(`   Status: ${error.response?.status || 'N/A'}`);
    console.error(`   Status Text: ${error.response?.statusText || 'N/A'}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   URL: ${error.config?.url || 'N/A'}`);
    console.error(`   Headers: ${JSON.stringify(error.config?.headers || {})}`);
    if (error.response?.data) {
      console.error(`   Response Body: ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Agent invocation failed: ${error.message}`);
  }
}

/**
 * Invoke multiple agents for a given event
 */
export async function invokeMultipleAgents(
  agents: string[],
  request: AgentInvocationRequest,
  parallel: boolean = true
): Promise<AgentResponse[]> {
  console.log(`\n🤖 Invoking ${agents.length} agents (${parallel ? 'parallel' : 'sequential'})`);

  const invocations = agents.map((agentType) =>
    invokeAgent({
      ...request,
      agentType,
    })
  );

  if (parallel) {
    // Run all agents in parallel using Promise.allSettled
    // This ensures one failing agent doesn't crash the entire workflow
    const results = await Promise.allSettled(invocations);

    // Extract successful responses and log failures
    const responses: AgentResponse[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        responses.push(result.value);
      } else {
        console.warn(`⚠️ Agent ${agents[index]} failed: ${result.reason.message}`);
      }
    });

    return responses;
  } else {
    // Run agents sequentially
    const results: AgentResponse[] = [];
    for (const invocation of invocations) {
      try {
        results.push(await invocation);
      } catch (error) {
        console.error('Error in sequential agent invocation:', error);
        // Continue with other agents
      }
    }
    return results;
  }
}

/**
 * Store agent invocation in audit trail
 */
export async function storeAgentAudit(
  agentType: string,
  eventType: string,
  githubData: any,
  response: AgentResponse | null,
  status: 'success' | 'failed',
  error?: string
) {
  try {
    // Optional: Store in database for audit trail
    // Uncomment if you have an agent_audit table in your database
    /*
    await prisma.agentAudit.create({
      data: {
        agentType,
        eventType,
        githubPrNumber: githubData.pr?.number,
        githubBranch: githubData.pr?.head?.ref,
        status,
        findings: response?.findings || [],
        recommendations: response?.recommendations || [],
        severity: response?.severity,
        error,
        createdAt: new Date(),
      },
    });
    */
    console.log(`📝 Audit logged for ${agentType}`);
  } catch (auditError: any) {
    console.error(`⚠️ Failed to store audit:`, auditError.message);
  }
}

/**
 * Format agent responses for display
 */
export function formatAgentResponse(response: AgentResponse): string {
  const agent = AGENTS[response.agentType as keyof typeof AGENTS];
  const agentName = agent?.name || response.agentType;

  let output = `\n## ${agentName}\n\n`;
  output += `**Severity:** ${response.severity.toUpperCase()}\n\n`;
  output += `**Summary:** ${response.summary}\n\n`;

  if (response.findings.length > 0) {
    output += `**Findings:**\n`;
    response.findings.forEach((finding) => {
      output += `- ${finding}\n`;
    });
    output += '\n';
  }

  if (response.recommendations.length > 0) {
    output += `**Recommendations:**\n`;
    response.recommendations.forEach((rec) => {
      output += `- ${rec}\n`;
    });
    output += '\n';
  }

  if (response.details) {
    output += `**Details:**\n${response.details}\n\n`;
  }

  return output;
}

/**
 * Combine multiple agent responses into a single report
 */
export function combineAgentResponses(responses: AgentResponse[]): string {
  let report = `# 🤖 Automated Agent Analysis Report\n\n`;
  report += `**Analysis Timestamp:** ${new Date().toISOString()}\n`;
  report += `**Agents:** ${responses.length}\n\n`;

  // Group by severity
  const bySeverity = {
    critical: responses.filter((r) => r.severity === 'critical'),
    high: responses.filter((r) => r.severity === 'high'),
    medium: responses.filter((r) => r.severity === 'medium'),
    low: responses.filter((r) => r.severity === 'low'),
    info: responses.filter((r) => r.severity === 'info'),
  };

  // Add summary table
  report += `## Summary\n\n`;
  report += `| Severity | Count |\n`;
  report += `|----------|-------|\n`;
  Object.entries(bySeverity).forEach(([severity, items]) => {
    if (items.length > 0) {
      report += `| ${severity} | ${items.length} |\n`;
    }
  });
  report += '\n';

  // Add individual agent reports, critical first
  const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
  for (const severity of severityOrder) {
    bySeverity[severity as keyof typeof bySeverity].forEach((response) => {
      report += formatAgentResponse(response);
    });
  }

  return report;
}

/**
 * Get agents to invoke based on event type
 */
export function getAgentsForEvent(eventType: string): string[] {
  switch (eventType) {
    case 'pull_request':
      return [
        'backend-engineer',
        'senior-frontend',
        'security-analyst',
        'design-review',
        'qa-testing',
      ];
    case 'push':
      return ['system-architecture', 'devops', 'product-manager'];
    case 'workflow_run':
      return ['security-analyst'];
    default:
      return [];
  }
}
