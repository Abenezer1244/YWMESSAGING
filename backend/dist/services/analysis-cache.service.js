import crypto from 'crypto';
class AnalysisCache {
    constructor() {
        this.cache = new Map();
        this.CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
        this.MAX_CACHE_SIZE = 1000; // Prevent memory bloat
    }
    /**
     * Generate SHA256 hash of content for cache key
     */
    generateHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }
    /**
     * Get cached analysis results if available and not expired
     */
    get(content) {
        const hash = this.generateHash(content);
        const entry = this.cache.get(hash);
        if (!entry) {
            return null; // Cache miss
        }
        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(hash);
            console.log(`🗑️ Cache expired for hash ${hash.substring(0, 8)}...`);
            return null;
        }
        console.log(`✅ Cache hit for hash ${hash.substring(0, 8)}...`);
        console.log(`   Saved analysis time (would have cost Claude API call)`);
        return entry.responses;
    }
    /**
     * Store analysis results in cache
     */
    set(content, responses) {
        const hash = this.generateHash(content);
        // Prevent cache from growing indefinitely
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            this.evictOldest();
        }
        const now = Date.now();
        this.cache.set(hash, {
            hash,
            responses,
            timestamp: now,
            expiresAt: now + this.CACHE_DURATION_MS,
        });
        console.log(`💾 Cached analysis results for hash ${hash.substring(0, 8)}...`);
        console.log(`   Cache size: ${this.cache.size}/${this.MAX_CACHE_SIZE}`);
    }
    /**
     * Clear oldest cache entry when limit reached
     */
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.cache.delete(oldestKey);
            console.log(`🗑️ Evicted oldest cache entry (limit reached)`);
        }
    }
    /**
     * Clear entire cache (useful for deployments)
     */
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        console.log(`🗑️ Cache cleared (${size} entries removed)`);
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const entries = Array.from(this.cache.entries()).map(([, entry]) => ({
            hash: entry.hash.substring(0, 8) + '...',
            expiresIn: Math.round((entry.expiresAt - Date.now()) / 1000) + 's',
        }));
        return {
            size: this.cache.size,
            maxSize: this.MAX_CACHE_SIZE,
            entries,
        };
    }
}
// Export singleton instance
export const analysisCache = new AnalysisCache();
//# sourceMappingURL=analysis-cache.service.js.map