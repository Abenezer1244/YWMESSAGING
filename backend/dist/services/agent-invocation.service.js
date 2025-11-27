import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { analysisCache } from './analysis-cache.service.js';
import { executeToolCall, buildToolsArray, logMcpStats, } from './mcp-integration.service.js';
const prisma = new PrismaClient();
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
 */ function buildAgentPrompt(agentType, eventType, context, githubData) {
    const agent = AGENTS[agentType];
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
    }
    else if (eventType === 'push') {
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
 * Invoke a single agent via Claude API with MCP tools
 *
 * This implements a proper agentic loop:
 * 1. Call Claude with MCPs as tools
 * 2. If Claude uses a tool, execute it
 * 3. Add tool result back to conversation
 * 4. Repeat until Claude outputs final response
 * 5. Parse and return the response
 */
export async function invokeAgent(request) {
    const { agentType, eventType, context, githubData } = request;
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
        throw new Error('CLAUDE_API_KEY environment variable not configured');
    }
    try {
        console.log(`\n🤖 Invoking ${agentType} agent with MCPs...`);
        // Log MCP configuration for this agent
        logMcpStats(agentType);
        const prompt = buildAgentPrompt(agentType, eventType, context, githubData);
        const tools = buildToolsArray(agentType);
        // Initialize message history with the user prompt
        const messages = [
            {
                role: 'user',
                content: prompt,
            },
        ];
        // Agentic loop - continue until no tool use
        let iterations = 0;
        const maxIterations = 10; // Prevent infinite loops
        let finalResponse = null;
        while (iterations < maxIterations) {
            iterations++;
            console.log(`\n   🔄 Iteration ${iterations}/${maxIterations}`);
            // Call Claude API
            const apiResponse = await axios.post('https://api.anthropic.com/v1/messages', {
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 2048,
                tools: tools.length > 0 ? tools : undefined,
                messages,
            }, {
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
            });
            const response = apiResponse.data;
            console.log(`   Stop reason: ${response.stop_reason}`);
            // Add assistant response to messages
            const assistantContent = response.content;
            messages.push({
                role: 'assistant',
                content: assistantContent,
            });
            // Check stop reason
            if (response.stop_reason === 'end_turn') {
                // Agent is done - extract text response
                const textContent = assistantContent.find((c) => c.type === 'text');
                if (textContent) {
                    finalResponse = textContent.text;
                }
                console.log(`   ✅ Agent completed (end_turn)`);
                break;
            }
            else if (response.stop_reason === 'tool_use') {
                // Agent used a tool - execute it and continue
                const toolUseBlocks = assistantContent.filter((c) => c.type === 'tool_use');
                console.log(`   🔧 Agent used ${toolUseBlocks.length} tool(s)`);
                // Execute each tool
                const toolResults = [];
                for (const toolUse of toolUseBlocks) {
                    const { id, name, input } = toolUse;
                    console.log(`      Executing: ${name}`);
                    // Execute the tool
                    const result = await executeToolCall(name, input);
                    // Add tool result to messages
                    toolResults.push({
                        type: 'tool_result',
                        tool_use_id: id,
                        content: result,
                    });
                    console.log(`      ✓ Tool result added to context`);
                }
                // Add all tool results in a single user message
                messages.push({
                    role: 'user',
                    content: toolResults,
                });
            }
            else {
                // Unknown stop reason
                console.log(`   ⚠️ Unknown stop reason: ${response.stop_reason}`);
                break;
            }
        }
        if (iterations >= maxIterations) {
            console.warn(`⚠️ Agent hit maximum iterations (${maxIterations}), stopping`);
        }
        // Parse final response
        let parsedResponse;
        try {
            // Extract JSON from response (might be wrapped in markdown code blocks)
            if (finalResponse) {
                const jsonMatch = finalResponse.match(/\{[\s\S]*\}/);
                parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
            }
            else {
                parsedResponse = {};
            }
        }
        catch (parseError) {
            console.warn(`⚠️ Failed to parse agent response as JSON:`, parseError);
            parsedResponse = {
                findings: finalResponse
                    ? [finalResponse]
                    : ['Analysis completed without findings'],
                recommendations: [],
                severity: 'info',
                summary: 'Analysis complete',
                details: finalResponse || 'No details available',
            };
        }
        const agentResponse = {
            agentType,
            findings: parsedResponse.findings || [],
            recommendations: parsedResponse.recommendations || [],
            severity: parsedResponse.severity || 'info',
            summary: parsedResponse.summary || 'No summary provided',
            details: parsedResponse.details || finalResponse || 'No details',
            timestamp: new Date(),
        };
        console.log(`✅ ${agentType} agent completed (${iterations} iterations)`);
        console.log(`   Severity: ${agentResponse.severity}`);
        console.log(`   Findings: ${agentResponse.findings.length}`);
        return agentResponse;
    }
    catch (error) {
        console.error(`❌ Error invoking ${agentType} agent:`);
        console.error(`   Status: ${error.response?.status || 'N/A'}`);
        console.error(`   Status Text: ${error.response?.statusText || 'N/A'}`);
        console.error(`   Message: ${error.message}`);
        console.error(`   URL: ${error.config?.url || 'N/A'}`);
        if (error.response?.data) {
            console.error(`   Response Body: ${JSON.stringify(error.response.data)}`);
        }
        throw new Error(`Agent invocation failed: ${error.message}`);
    }
}
/**
 * Invoke multiple agents for a given event
 */
export async function invokeMultipleAgents(agents, request, parallel = true, enableCache = true) {
    console.log(`\n🤖 Invoking ${agents.length} agents (${parallel ? 'parallel' : 'sequential'})`);
    // Check cache for identical analysis (based on changes summary)
    const cacheKey = request.context?.changesSummary || request.context?.analysis || '';
    if (enableCache && cacheKey) {
        const cachedResults = analysisCache.get(cacheKey);
        if (cachedResults) {
            console.log(`🎯 Using cached results (skipped ${agents.length} agent invocations)`);
            return cachedResults;
        }
    }
    const invocations = agents.map((agentType) => invokeAgent({
        ...request,
        agentType,
    }));
    if (parallel) {
        // Run all agents in parallel using Promise.allSettled
        // This ensures one failing agent doesn't crash the entire workflow
        const results = await Promise.allSettled(invocations);
        // Extract successful responses and log failures
        const responses = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                responses.push(result.value);
            }
            else {
                console.warn(`⚠️ Agent ${agents[index]} failed: ${result.reason.message}`);
            }
        });
        // Cache successful results
        if (enableCache && cacheKey && responses.length > 0) {
            analysisCache.set(cacheKey, responses);
        }
        return responses;
    }
    else {
        // Run agents sequentially
        const results = [];
        for (const invocation of invocations) {
            try {
                results.push(await invocation);
            }
            catch (error) {
                console.error('Error in sequential agent invocation:', error);
                // Continue with other agents
            }
        }
        // Cache successful results
        if (enableCache && cacheKey && results.length > 0) {
            analysisCache.set(cacheKey, results);
        }
        return results;
    }
}
/**
 * Store agent invocation in audit trail
 */
export async function storeAgentAudit(agentType, eventType, githubData, response, status, error) {
    try {
        // Store in database for audit trail and compliance tracking
        await prisma.agentAudit.create({
            data: {
                agentType,
                eventType,
                githubPrNumber: githubData.pr?.number,
                githubBranch: githubData.pr?.head?.ref,
                status,
                findings: JSON.stringify(response?.findings || []),
                recommendations: JSON.stringify(response?.recommendations || []),
                severity: response?.severity,
                error,
            },
        });
        console.log(`📝 Audit logged for ${agentType}`);
    }
    catch (auditError) {
        console.error(`⚠️ Failed to store audit:`, auditError.message);
    }
}
/**
 * Format agent responses for display
 */
export function formatAgentResponse(response) {
    const agent = AGENTS[response.agentType];
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
export function combineAgentResponses(responses) {
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
        bySeverity[severity].forEach((response) => {
            report += formatAgentResponse(response);
        });
    }
    return report;
}
/**
 * Get agents to invoke based on event type
 */
export function getAgentsForEvent(eventType) {
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
/**
 * Get cache statistics (for debugging/monitoring)
 */
export function getCacheStats() {
    return analysisCache.getStats();
}
/**
 * Clear analysis cache (useful for testing/deployments)
 */
export function clearAnalysisCache() {
    analysisCache.clear();
}
//# sourceMappingURL=agent-invocation.service.js.map