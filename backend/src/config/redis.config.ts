import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: redisUrl,
  // Auto-reconnect configuration to handle connection drops
  socket: {
    reconnectStrategy: (retries: number) => {
      // Reconnect immediately first 3 times, then with exponential backoff
      if (retries < 3) {
        return 0; // Retry immediately
      }
      const delayMs = Math.min(1000 * Math.pow(2, retries - 3), 30000); // Max 30 seconds
      console.log(`🔄 Redis reconnect attempt ${retries}, waiting ${delayMs}ms`);
      return delayMs;
    },
    // Connection timeout and keepalive
    connectTimeout: 10000,
    keepAlive: 30000,
  },
});

redisClient.on('error', (err: any) => {
  console.error('❌ Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisClient.on('ready', () => {
  console.log('✅ Redis ready to use');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Koinonia to Redis
export async function connectRedis() {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      console.log('✅ Redis connection established');
    } catch (error: any) {
      console.error('❌ CRITICAL: Failed to connect to Redis:', error.message);
      console.error('   Token revocation service will not work without Redis');
      console.error('   Check REDIS_URL environment variable');
      throw error;
    }
  }
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
