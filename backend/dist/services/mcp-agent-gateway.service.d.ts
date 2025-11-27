/**
 * MCP Agent Gateway Service
 *
 * Provides REST endpoints for Claude MCPs (Ref, Context7) by invoking agents
 * that have native access to these tools through the Claude API.
 *
 * This bridges the gap between backend REST clients and Claude's native MCP system.
 */
/**
 * Search for documentation using Ref MCP
 */
export declare function searchDocumentation(query: string): Promise<any>;
/**
 * Read documentation from a URL using Ref MCP
 */
export declare function readDocumentationUrl(url: string): Promise<any>;
/**
 * Resolve library ID using Context7 MCP
 */
export declare function resolveLibraryId(libraryName: string): Promise<any>;
/**
 * Get library documentation using Context7 MCP
 */
export declare function getLibraryDocs(libraryId: string, topic?: string, mode?: 'code' | 'info'): Promise<any>;
//# sourceMappingURL=mcp-agent-gateway.service.d.ts.map