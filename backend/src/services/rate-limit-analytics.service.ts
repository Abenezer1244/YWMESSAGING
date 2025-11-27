/**
 * Rate Limit Analytics Service
 * Tracks and analyzes rate limit violations for abuse detection
 *
 * Monitors:
 * - Per-user usage patterns
 * - Abuse attempts (rate limit violations)
 * - Peak usage times
 * - Anomalies and suspicious activity
 */

import { redisClient } from '../config/redis.config.js';

export interface AbuseReport {
  userId: string;
  violationCount: number;
  lastViolation: string;
  endpoints: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface UsageStats {
  userId: string;
  requestCount: number;
  violationCount: number;
  period: string; // 'hourly' | 'daily' | 'weekly'
  endpoints: Map<string, number>;
}

/**
 * Record a rate limit violation for abuse detection
 */
export async function recordViolation(
  userId: string,
  endpoint: string
): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const key = `rate_limit:violations:${userId}`;

    // Add to violation list
    const violation = {
      endpoint,
      timestamp,
    };

    await redisClient.lPush(key, JSON.stringify(violation));

    // Keep last 1000 violations (7 day rolling window assuming ~100/day)
    await redisClient.lTrim(key, 0, 999);

    // Set TTL to 7 days
    await redisClient.expire(key, 7 * 24 * 60 * 60);

    console.log(
      `⚠️ Violation recorded: user=${userId}, endpoint=${endpoint}`
    );
  } catch (error: any) {
    console.error(
      `❌ Failed to record violation for user ${userId}:`,
      error.message
    );
  }
}

/**
 * Get violation history for a user
 */
export async function getViolationHistory(
  userId: string,
  limit: number = 100
): Promise<any[]> {
  try {
    const key = `rate_limit:violations:${userId}`;
    const violations = await redisClient.lRange(key, 0, limit - 1);
    return violations.map((v) => JSON.parse(v));
  } catch (error: any) {
    console.error(
      `❌ Failed to get violations for user ${userId}:`,
      error.message
    );
    return [];
  }
}

/**
 * Get abuse report for a user
 * Identifies suspicious activity patterns
 */
export async function getAbuseReport(userId: string): Promise<AbuseReport | null> {
  try {
    const violations = await getViolationHistory(userId, 1000);

    if (violations.length === 0) {
      return null; // No violations
    }

    // Count violations by endpoint
    const endpointMap = new Map<string, number>();
    for (const v of violations) {
      const count = endpointMap.get(v.endpoint) || 0;
      endpointMap.set(v.endpoint, count + 1);
    }

    // Determine severity based on violation frequency
    let severity: 'low' | 'medium' | 'high' = 'low';
    const violationCount = violations.length;

    if (violationCount > 100) {
      severity = 'high'; // >100 violations in 7 days
    } else if (violationCount > 50) {
      severity = 'medium'; // 50-100 violations
    }

    // Check for recent spike (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentViolations = violations.filter((v) => v.timestamp > oneHourAgo);

    if (recentViolations.length > 10) {
      severity = 'high'; // Recent spike
    }

    return {
      userId,
      violationCount,
      lastViolation: violations[0].timestamp,
      endpoints: Array.from(endpointMap.keys()),
      severity,
    };
  } catch (error: any) {
    console.error(
      `❌ Failed to generate abuse report for user ${userId}:`,
      error.message
    );
    return null;
  }
}

/**
 * Get top abusers (users with most violations)
 * Used for monitoring and security audits
 */
export async function getTopAbusers(limit: number = 10): Promise<AbuseReport[]> {
  try {
    // Scan all violation keys
    const pattern = 'rate_limit:violations:*';
    const keys = await redisClient.keys(pattern);

    // Get violations for each user
    const reports: (AbuseReport | null)[] = await Promise.all(
      keys.map((key) => {
        const userId = key.split(':')[3]; // Extract from 'rate_limit:violations:{userId}'
        return getAbuseReport(userId);
      })
    );

    // Filter nulls and sort by violation count
    return reports
      .filter((r): r is AbuseReport => r !== null)
      .sort((a, b) => b.violationCount - a.violationCount)
      .slice(0, limit);
  } catch (error: any) {
    console.error('❌ Failed to get top abusers:', error.message);
    return [];
  }
}

/**
 * Record successful request for user (analytics)
 */
export async function recordSuccess(
  userId: string,
  endpoint: string
): Promise<void> {
  try {
    // Track endpoint usage
    const key = `usage:${userId}:${endpoint}`;
    const count = await redisClient.incr(key);

    // Set TTL to 24 hours if this is first request
    if (count === 1) {
      await redisClient.expire(key, 24 * 60 * 60);
    }
  } catch (error: any) {
    console.error(
      `❌ Failed to record success for user ${userId}:`,
      error.message
    );
  }
}

/**
 * Get usage stats for a user in last 24 hours
 */
export async function getUserUsageStats(userId: string): Promise<UsageStats> {
  try {
    // Get all endpoint usage keys for this user
    const pattern = `usage:${userId}:*`;
    const keys = await redisClient.keys(pattern);

    // Count requests per endpoint
    const endpoints = new Map<string, number>();
    for (const key of keys) {
      const endpoint = key.split(':').slice(2).join(':'); // Extract endpoint
      const count = await redisClient.get(key);
      if (count) {
        endpoints.set(endpoint, parseInt(count, 10));
      }
    }

    const totalRequests = Array.from(endpoints.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    // Get violation count
    const violations = await getViolationHistory(userId, 1000);

    return {
      userId,
      requestCount: totalRequests,
      violationCount: violations.length,
      period: 'hourly',
      endpoints,
    };
  } catch (error: any) {
    console.error(
      `❌ Failed to get usage stats for user ${userId}:`,
      error.message
    );
    return {
      userId,
      requestCount: 0,
      violationCount: 0,
      period: 'hourly',
      endpoints: new Map(),
    };
  }
}

/**
 * Detect anomalies in usage patterns
 * Identifies sudden spikes or unusual behavior
 */
export async function detectAnomalies(): Promise<string[]> {
  try {
    const abusers = await getTopAbusers(100);
    const anomalies: string[] = [];

    // Flag users with high violation rates
    for (const report of abusers) {
      if (report.severity === 'high') {
        anomalies.push(
          `High severity abuse detected: ${report.userId} (${report.violationCount} violations)`
        );
      }
    }

    return anomalies;
  } catch (error: any) {
    console.error('❌ Failed to detect anomalies:', error.message);
    return [];
  }
}

/**
 * Clean up old analytics data (maintenance)
 * Called periodically to free up Redis space
 */
export async function cleanupOldData(): Promise<void> {
  try {
    // Redis TTL handles automatic cleanup
    // This is a no-op but kept for explicit cleanup if needed
    console.log('✅ Rate limit analytics cleaned (TTL-based expiration)');
  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
  }
}
