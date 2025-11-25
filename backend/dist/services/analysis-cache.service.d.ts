import { AgentResponse } from './agent-invocation.service.js';
declare class AnalysisCache {
    private cache;
    private readonly CACHE_DURATION_MS;
    private readonly MAX_CACHE_SIZE;
    /**
     * Generate SHA256 hash of content for cache key
     */
    generateHash(content: string): string;
    /**
     * Get cached analysis results if available and not expired
     */
    get(content: string): AgentResponse[] | null;
    /**
     * Store analysis results in cache
     */
    set(content: string, responses: AgentResponse[]): void;
    /**
     * Clear oldest cache entry when limit reached
     */
    private evictOldest;
    /**
     * Clear entire cache (useful for deployments)
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        entries: Array<{
            hash: string;
            expiresIn: string;
        }>;
    };
}
export declare const analysisCache: AnalysisCache;
export {};
//# sourceMappingURL=analysis-cache.service.d.ts.map