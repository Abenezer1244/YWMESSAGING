import { createClient } from 'redis';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisClient = createClient({
    url: redisUrl,
    // Auto-reconnect configuration to handle connection drops
    socket: {
        reconnectStrategy: (retries) => {
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
redisClient.on('error', (err) => {
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
// Koinonia to Redis with timeout
export async function connectRedis(timeoutMs = 10000) {
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
            .catch((error) => {
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
        }
        catch (error) {
            console.error('⚠️  Error disconnecting Redis:', error.message);
        }
    }
}
//# sourceMappingURL=redis.config.js.map