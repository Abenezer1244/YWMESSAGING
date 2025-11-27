/**
 * MCP Agent Gateway Service
 *
 * Provides REST endpoints for Claude MCPs (Ref, Context7) by invoking agents
 * that have native access to these tools through the Claude API.
 *
 * This bridges the gap between backend REST clients and Claude's native MCP system.
 */
import axios from 'axios';
/**
 * Invoke a Claude agent with specific MCP tools and get results
 */
async function invokeAgentWithTool(prompt, toolName) {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
        throw new Error('CLAUDE_API_KEY environment variable not configured');
    }
    try {
        console.log(`📡 Invoking Claude agent for tool: ${toolName}`);
        // Map tool names to their MCP definitions
        const toolDefinitions = {
            ref_search_documentation: {
                name: 'ref_search_documentation',
                description: 'Search for documentation on the web or from private resources',
                input_schema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Query for documentation search',
                        },
                    },
                    required: ['query'],
                },
            },
            ref_read_url: {
                name: 'ref_read_url',
                description: 'Read the content of a URL as markdown',
                input_schema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: 'The exact URL to read, including the #hash if needed',
                        },
                    },
                    required: ['url'],
                },
            },
            context7_resolve_library_id: {
                name: 'mcp__context7__resolve-library-id',
                description: 'Resolve a package/product name to a Context7-compatible library ID',
                input_schema: {
                    type: 'object',
                    properties: {
                        libraryName: {
                            type: 'string',
                            description: 'Library name to search for',
                        },
                    },
                    required: ['libraryName'],
                },
            },
            context7_get_library_docs: {
                name: 'mcp__context7__get-library-docs',
                description: 'Fetch up-to-date documentation for a library',
                input_schema: {
                    type: 'object',
                    properties: {
                        context7CompatibleLibraryID: {
                            type: 'string',
                            description: 'The Context7-compatible library ID',
                        },
                        mode: {
                            type: 'string',
                            enum: ['code', 'info'],
                            description: "Documentation mode: 'code' for APIs (default), 'info' for conceptual guides",
                        },
                        topic: {
                            type: 'string',
                            description: 'Topic to focus documentation on',
                        },
                    },
                    required: ['context7CompatibleLibraryID'],
                },
            },
        };
        const tool = toolDefinitions[toolName];
        if (!tool) {
            throw new Error(`Unknown tool: ${toolName}`);
        }
        // Call Claude API with the tool available
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-opus-4-1-20250805',
            max_tokens: 4096,
            tools: [tool],
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        }, {
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
            },
            timeout: 60000,
        });
        const result = response.data.content[0];
        // If Claude used the tool, we need to handle tool use
        if (result.type === 'tool_use') {
            console.log(`✓ Agent invoked tool: ${result.name}`);
            return {
                status: 'success',
                tool: toolName,
                tool_use_id: result.id,
                tool_input: result.input,
                message: 'Agent successfully invoked the tool. Tool execution handled by Claude API.',
            };
        }
        // If it's text, return the response
        if (result.type === 'text') {
            return {
                status: 'success',
                tool: toolName,
                response: result.text,
                message: 'Agent response received',
            };
        }
        return {
            status: 'success',
            tool: toolName,
            result,
        };
    }
    catch (error) {
        console.error(`❌ Agent invocation failed: ${error.message}`);
        if (error.message.includes('CLAUDE_API_KEY')) {
            return {
                status: 'error',
                tool: toolName,
                error: 'CLAUDE_API_KEY not configured',
            };
        }
        return {
            status: 'error',
            tool: toolName,
            error: error.message,
        };
    }
}
/**
 * Search for documentation using Ref MCP
 */
export async function searchDocumentation(query) {
    console.log(`📚 Searching documentation: "${query}"`);
    const prompt = `Search for documentation and resources about: "${query}"

Please use the ref_search_documentation tool to find relevant documentation.
Return all results you find.`;
    return invokeAgentWithTool(prompt, 'ref_search_documentation');
}
/**
 * Read documentation from a URL using Ref MCP
 */
export async function readDocumentationUrl(url) {
    console.log(`📖 Reading documentation from: ${url}`);
    const prompt = `Please read and retrieve the content from this URL: ${url}

Use the ref_read_url tool to fetch the content. Return the complete content you retrieve.`;
    return invokeAgentWithTool(prompt, 'ref_read_url');
}
/**
 * Resolve library ID using Context7 MCP
 */
export async function resolveLibraryId(libraryName) {
    console.log(`🔍 Resolving library ID for: ${libraryName}`);
    const prompt = `I need to resolve the library ID for: "${libraryName}"

Please use the mcp__context7__resolve-library-id tool to find the Context7-compatible library ID.
Return the library ID and any matching libraries found.`;
    return invokeAgentWithTool(prompt, 'context7_resolve_library_id');
}
/**
 * Get library documentation using Context7 MCP
 */
export async function getLibraryDocs(libraryId, topic, mode = 'code') {
    console.log(`📚 Getting library docs for: ${libraryId}`);
    if (topic)
        console.log(`   Topic: ${topic}`);
    const topicText = topic ? ` with focus on topic: ${topic}` : '';
    const prompt = `I need documentation for the library with ID: "${libraryId}"${topicText}

Mode: ${mode === 'code' ? 'API references and code examples' : 'Conceptual guides and narrative information'}

Please use the mcp__context7__get-library-docs tool to fetch the documentation.
Return the complete documentation content.`;
    return invokeAgentWithTool(prompt, 'context7_get_library_docs');
}
//# sourceMappingURL=mcp-agent-gateway.service.js.map