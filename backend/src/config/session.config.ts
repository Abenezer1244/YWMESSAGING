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

import session, { SessionOptions } from 'express-session';
import RedisStore from 'connect-redis';
import { redisClient } from './redis.config.js';

/**
 * Session configuration for production and development
 * Separates security-critical options based on environment
 */
export const getSessionConfig = (): SessionOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // Store sessions in Redis (not memory)
    // This is REQUIRED for multi-server setups
    store: new RedisStore({ client: redisClient }),

    // Session encryption secret (use strong random value in production)
    // IMPORTANT: Change this value in production!
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',

    // Don't save session if nothing changed
    resave: false,

    // Don't create session until something is stored
    saveUninitialized: false,

    // Session name (default is 'connect.sid')
    name: 'sessionId',

    // Cookie configuration for security
    cookie: {
      // HTTPS only in production
      // This prevents session cookies from being transmitted over HTTP
      secure: isProduction,

      // HttpOnly prevents client-side JS from accessing the cookie
      // This protects against XSS attacks stealing session cookies
      httpOnly: true,

      // SameSite prevents CSRF attacks by limiting cookie to same-site requests
      // ✅ CRITICAL: Must match auth cookies (SameSite=none in production for cross-subdomain)
      // 'none' required for cross-subdomain requests (production)
      // 'lax' is safe for localhost (development)
      sameSite: isProduction ? 'none' : 'lax',

      // Session timeout: 24 hours
      // Sessions expire after 24 hours of inactivity
      maxAge: 24 * 60 * 60 * 1000, // milliseconds

      // ✅ Domain restriction for cross-subdomain cookie sharing
      // In production, set domain to .koinoniasms.com so cookies are sent to all subdomains
      // In development, leave undefined so cookies work on localhost
      domain: isProduction ? '.koinoniasms.com' : undefined,

      // Path restriction
      path: '/',
    },

    // Session regeneration after login (security best practice)
    // Prevents session fixation attacks
    genid: (req) => {
      // Use crypto to generate random session IDs
      // This ensures session IDs are unpredictable
      return crypto.randomUUID();
    },
  };
};

/**
 * Initialize session middleware
 * Usage in app.ts:
 *   import { initializeSession } from './config/session.config';
 *   app.use(initializeSession());
 */
export const initializeSession = () => {
  return session(getSessionConfig());
};
