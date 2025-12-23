/**
 * Express Session Configuration with Redis Store
 *
 * CRITICAL FOR HORIZONTAL SCALING:
 * This configuration stores sessions in Redis instead of process memory.
 * This allows multiple servers to share the same session data.
 *
 * Without Redis session store:
 * - Sessions stored in memory (lost on server restart)
 * - Won't work with load balancer (sticky sessions required)
 * - Can't scale to multiple servers
 *
 * With Redis session store:
 * - Sessions persisted across server restarts
 * - Works with any load balancer (no sticky sessions needed)
 * - Fully stateless, scales horizontally
 */
import { SessionOptions } from 'express-session';
/**
 * Session configuration for production and development
 * Separates security-critical options based on environment
 */
export declare const getSessionConfig: () => SessionOptions;
/**
 * Initialize session middleware
 * Usage in app.ts:
 *   import { initializeSession } from './config/session.config';
 *   app.use(initializeSession());
 */
export declare const initializeSession: () => any;
//# sourceMappingURL=session.config.d.ts.map