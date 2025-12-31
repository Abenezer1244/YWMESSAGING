import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Redis availability state
let redisAvailable = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5; // Stop after 5 attempts
let permanentlyDisabled = false;

export const redisClient = createClient({
  url: redisUrl,
  // Auto-reconnect configuration with limits
  socket: {
    reconnectStrategy: (retries: number) => {
      reconnectAttempts = retries;

      // Stop reconnecting after max attempts - enter permanent fallback mode
      if (retries > MAX_RECONNECT_ATTEMPTS) {
        if (!permanentlyDisabled) {
          console.error(`❌ Redis: Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) exceeded`);
          console.error('   ⚠️  Entering PERMANENT FALLBACK MODE');
          console.error('   → Token revocation: DISABLED');
          console.error('   → Cache: IN-MEMORY ONLY');
          console.error('   → Rate limiting: BASIC MODE');
          console.error('   → To restore: Fix Redis and restart application');
          permanentlyDisabled = true;
        }
        return false; // Stop reconnecting
      }

      // Exponential backoff for retries
      if (retries < 3) {
        return 1000; // 1 second for first 3 attempts
      }
      const delayMs = Math.min(1000 * Math.pow(2, retries - 3), 10000); // Max 10 seconds
      console.log(`🔄 Redis reconnect attempt ${retries}/${MAX_RECONNECT_ATTEMPTS}, waiting ${delayMs}ms`);
      return delayMs;
    },
    // Connection timeout and keepalive
    connectTimeout: 10000,
    keepAlive: 30000,
  },
});

redisClient.on('error', (err: any) => {
  redisAvailable = false;
  // Only log if not permanently disabled (avoid spam)
  if (!permanentlyDisabled && reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
    console.error('❌ Redis Client Error:', err.message);
  }
});

redisClient.on('connect', () => {
  redisAvailable = true;
  reconnectAttempts = 0;
  permanentlyDisabled = false;
  console.log('✅ Redis connected');
});

redisClient.on('ready', () => {
  redisAvailable = true;
  console.log('✅ Redis ready to use');
});

redisClient.on('reconnecting', () => {
  redisAvailable = false;
  if (!permanentlyDisabled && reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
    console.log('🔄 Redis reconnecting...');
  }
});

redisClient.on('end', () => {
  redisAvailable = false;
  if (!permanentlyDisabled) {
    console.log('⚠️  Redis connection closed');
  }
});

// Koinonia to Redis with timeout
export async function connectRedis(timeoutMs: number = 10000): Promise<boolean> {
  if (redisClient.isOpen) {
    return true; // Already connected
  }

  return new Promise((resolve) => {
    let connected = false;
    const timeout = setTimeout(() => {
      if (!connected) {
        console.error('❌ Redis connection timeout after', timeoutMs, 'ms');
        console.error('   Using fallback mode: Token revocation will be less reliable');
        console.error('   Check REDIS_URL environment variable or Redis service status');
        resolve(false); // Resolve as failed but don't throw - app can continue
      }
    }, timeoutMs);

    redisClient.connect()
      .then(() => {
        connected = true;
        clearTimeout(timeout);
        console.log('✅ Redis connection established successfully');
        resolve(true);
      })
      .catch((error: any) => {
        connected = true;
        clearTimeout(timeout);
        console.error('❌ Redis connection failed:', error.message);
        console.error('   Using fallback mode: Token revocation disabled');
        console.error('   Ensure REDIS_URL is set to a valid Redis instance');
        resolve(false); // Continue without Redis
      });
  });
}

export async function disconnectRedis() {
  if (redisClient.isOpen) {
    try {
      await redisClient.disconnect();
      console.log('✅ Redis connection closed gracefully');
    } catch (error: any) {
      console.error('⚠️  Error disconnecting Redis:', error.message);
    }
  }
}

/**
 * Check if Redis is currently available
 * @returns true if Redis is connected and ready
 */
export function isRedisAvailable(): boolean {
  return redisAvailable && redisClient.isOpen && !permanentlyDisabled;
}

/**
 * Check if Redis is permanently disabled (max retries exceeded)
 * @returns true if in permanent fallback mode
 */
export function isRedisPermanentlyDisabled(): boolean {
  return permanentlyDisabled;
}

/**
 * Execute a Redis operation with graceful fallback
 * @param operation The Redis operation to execute
 * @param fallbackValue Value to return if Redis is unavailable
 * @param operationName Name of operation for logging
 * @returns Result from Redis or fallback value
 */
export async function executeRedisOperation<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  operationName: string = 'Redis operation'
): Promise<T> {
  if (!isRedisAvailable()) {
    // Redis not available, return fallback silently
    return fallbackValue;
  }

  try {
    return await operation();
  } catch (error: any) {
    console.warn(`⚠️  ${operationName} failed:`, error.message, '- using fallback');
    redisAvailable = false; // Mark as unavailable
    return fallbackValue;
  }
}

/**
 * Execute a Redis operation that returns void with graceful fallback
 * @param operation The Redis operation to execute
 * @param operationName Name of operation for logging
 */
export async function executeRedisVoidOperation(
  operation: () => Promise<void>,
  operationName: string = 'Redis operation'
): Promise<void> {
  if (!isRedisAvailable()) {
    // Redis not available, skip silently
    return;
  }

  try {
    await operation();
  } catch (error: any) {
    console.warn(`⚠️  ${operationName} failed:`, error.message, '- skipping');
    redisAvailable = false; // Mark as unavailable
  }
}
