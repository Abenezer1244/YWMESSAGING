import crypto from 'crypto';
import { AgentResponse } from './agent-invocation.service.js';

/**
 * Analysis Cache Service
 * Caches agent analysis results to prevent redundant Claude API calls
 * Improves performance by returning cached results for unchanged files
 */

interface CacheEntry {
  hash: string;
  responses: AgentResponse[];
  timestamp: number;
  expiresAt: number;
}

class AnalysisCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 1000; // Prevent memory bloat

  /**
   * Generate SHA256 hash of content for cache key
   */
  generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get cached analysis results if available and not expired
   */
  get(content: string): AgentResponse[] | null {
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
  set(content: string, responses: AgentResponse[]): void {
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
  private evictOldest(): void {
    let oldestKey: string | null = null;
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
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ Cache cleared (${size} entries removed)`);
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    entries: Array<{ hash: string; expiresIn: string }>;
  } {
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
