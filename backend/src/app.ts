import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { logRateLimitExceeded } from './utils/security-logger.js';
import { csrfProtection, generateCsrfToken } from './middleware/csrf.middleware.js';
import { originValidationMiddleware } from './middleware/origin-validation.middleware.js';
import { initSentry, getSentryRequestHandler, getSentryErrorHandler } from './config/sentry.config.js';
import authRoutes from './routes/auth.routes.js';
import branchRoutes from './routes/branch.routes.js';
import groupRoutes from './routes/group.routes.js';
import messageRoutes from './routes/message.routes.js';
import templateRoutes from './routes/template.routes.js';
import recurringRoutes from './routes/recurring.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import billingRoutes from './routes/billing.routes.js';
import numbersRoutes from './routes/numbers.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import gitHubAgentsRoutes from './routes/github-agents.routes.js';
import agentsRoutes from './routes/agents.routes.js';
import adminRoutes from './routes/admin.routes.js';
import adminDLQRoutes from './routes/admin.dlq.routes.js';
import chatRoutes from './routes/chat.routes.js';
import schedulerRoutes from './routes/scheduler.routes.js';
import securityRoutes from './routes/security.routes.js';
import gdprRoutes from './routes/gdpr.routes.js';
import mfaRoutes from './routes/mfa.routes.js';
import onboardingRoutes from './routes/onboarding.routes.js';
import healthRoutes from './routes/health.routes.js';
import { compressionMiddleware } from './middleware/compression.middleware.js';
import { etagMiddleware } from './middleware/etag.middleware.js';
import AppError, { getSafeErrorMessage, getStatusCode } from './utils/app-error.js';
import { loggerMiddleware } from './utils/logger.js';
import { initializeSession } from './config/session.config.js';

const app = express();

// Disable Express's built-in ETag generation (we implement our own)
app.set('etag', false);

// ✅ CRITICAL: Add request-level timeout middleware
// Ensures ALL requests complete within 10 seconds maximum
// This prevents hanging requests from blocking the entire server
app.use((req, res, next) => {
  const requestTimeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error('[TIMEOUT]', req.method, req.path, '- Hard timeout after 10 seconds');
      res.status(504).json({
        success: false,
        error: 'Request timeout - server took too long to respond'
      });
    }
  }, 10000); // 10 second hard timeout

  // Clear timeout if response completes before timeout
  res.on('finish', () => {
    clearTimeout(requestTimeout);
  });

  res.on('close', () => {
    clearTimeout(requestTimeout);
  });

  next();
});

// ✅ SECURITY: Initialize Sentry for error tracking and monitoring
// Must be done as early as possible in the application lifecycle
initSentry();

// ✅ SECURITY: Add Sentry request handler middleware
// Captures request information for error context
app.use(getSentryRequestHandler());

// Trust proxy - required for rate limiting and IP detection on Render
app.set('trust proxy', 1);

// Rate Limiting Middleware Configurations
// Auth endpoints: reasonable limits to prevent brute-force attacks while allowing legitimate users
// Development: lenient, Production: moderate (20 attempts allows for 4 form corrections)
const authMaxRequests = process.env.NODE_ENV === 'production' ? 20 : 100;
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: authMaxRequests, // 20 in production, 100 in development
  message: 'Too many login/signup attempts. Please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: true, // Only count failed attempts, not successful logins
  skip: (req) => {
    // Skip rate limiting for refresh endpoint - it's essential for session persistence
    return req.path === '/refresh';
  },
  keyGenerator: (req) => {
    // Use IP address for rate limiting
    return (req.ip || req.socket.remoteAddress) as string;
  },
  handler: (req, res) => {
    const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown') as string;
    logRateLimitExceeded(req.originalUrl || req.path, ipAddress, authMaxRequests);
    res.status(429).json({ error: 'Too many login/signup attempts. Please try again later.' });
  },
});

// Password reset: even stricter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many password reset attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.ip || req.socket.remoteAddress) as string,
  handler: (req, res) => {
    const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown') as string;
    logRateLimitExceeded(req.originalUrl || req.path, ipAddress, 3);
    res.status(429).json({ error: 'Too many password reset attempts. Please try again later.' });
  },
});

// Billing/Payment endpoints: strict to prevent fraud but allow frequent checks
const billingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 minutes (includes trial checks, billing checks, etc.)
  message: 'Too many billing requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.ip || req.socket.remoteAddress) as string,
  handler: (req, res) => {
    const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown') as string;
    logRateLimitExceeded(req.originalUrl || req.path, ipAddress, 30);
    res.status(429).json({ error: 'Too many billing requests. Please try again later.' });
  },
});

// General API endpoints: moderate limits
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.ip || req.socket.remoteAddress) as string,
  handler: (req, res) => {
    const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown') as string;
    logRateLimitExceeded(req.originalUrl || req.path, ipAddress, 100);
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
  },
});

// Message sending rate limiter - per user to prevent API abuse
const messageRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 messages per user per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by user ID (churchId + userId) from JWT
    const userId = (req as any).user?.userId || (req.ip || req.socket.remoteAddress) as string;
    const churchId = (req as any).user?.churchId || 'unknown';
    return `${churchId}:${userId}`;
  },
  handler: (req, res) => {
    const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown') as string;
    logRateLimitExceeded(req.originalUrl || req.path, ipAddress, 100);
    res.status(429).json({
      error: 'Too many messages sent. You can send maximum 100 messages per 15 minutes.'
    });
  },
});

// GitHub webhook endpoints: protect against abuse/DOS
const githubWebhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 webhook events per 15 minutes per IP (GitHub typically sends <10/hour)
  message: 'Too many GitHub webhook requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.ip || req.socket.remoteAddress) as string,
  handler: (req, res) => {
    const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown') as string;
    logRateLimitExceeded(req.originalUrl || req.path, ipAddress, 50);
    res.status(429).json({ error: 'GitHub webhook rate limit exceeded. Please try again later.' });
  },
});

// Middleware
// Enhanced security headers with Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://js.stripe.com",           // Stripe Elements
        "https://cdn.jsdelivr.net",        // For CDN resources
        "'unsafe-inline'",                 // Required for some React patterns (consider nonce in production)
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",                 // Required for inline styles
        "https://fonts.googleapis.com",    // Google Fonts
      ],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",          // Stripe API
        "https://m.stripe.network",        // Stripe network
        "https://js.stripe.com",           // Stripe JS
      ],
      frameSrc: [
        "'self'",
        "https://js.stripe.com",           // Stripe iframe
        "https://m.stripe.network",        // Stripe network iframe
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      ...(process.env.NODE_ENV === 'production' && {
        upgradeInsecureRequests: [],  // Force HTTPS in production
      }),
    },
  },
  // Additional security headers
  hsts: {
    maxAge: 31536000,                      // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },           // Prevent clickjacking
  xssFilter: true,
  noSniff: true,                            // Prevent MIME-sniffing
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ✅ SECURITY: CORS Configuration Hardening
// Only allow specific trusted origins to prevent CSRF and unauthorized access
const corsOrigin: string | boolean | RegExp | (string | RegExp)[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void) =
  process.env.NODE_ENV === 'production'
    ? // Production: strict - only allow configured frontend URLs
      [
        'https://koinoniasms.com',                          // Primary production domain
        'https://www.koinoniasms.com',                      // www variant
        process.env.FRONTEND_URL!,                          // Also allow env-configured URL
        process.env.FRONTEND_URL?.replace('https://', 'https://www.'),  // www variant of env URL
      ].filter(Boolean) as string[]
    : // Development: allow localhost variants for development/testing
      [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'https://koinoniasms.com',                          // Also allow production domain in dev
        process.env.FRONTEND_URL!,  // Also allow env URL in dev
      ];

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
    maxAge: 86400, // 24 hours: how long browser should cache CORS preflight
    optionsSuccessStatus: 200,
  })
);

// ✅ SECURITY: Request size limits (DoS protection)
// Prevents attackers from sending massive payloads to exhaust memory/bandwidth
// Limits configured for typical API use cases (10 MB for JSON, webhooks)

// Raw body parser for webhooks (must be BEFORE express.json() to intercept raw bytes)
// This captures raw request body for ED25519 signature verification
app.use('/api/webhooks/', express.raw({
  type: 'application/json',
  limit: '10 mb'  // Telnyx, Stripe, SendGrid webhooks are typically < 100 KB
}));

// JSON parser for all other endpoints
app.use(express.json({
  limit: '10 mb'  // API payloads (conversations, messages, bulk operations) typically < 1 MB
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10 mb'  // Form submissions (very rare in this app, but limited for safety)
}));
app.use(cookieParser());

// ✅ SESSION MANAGEMENT: Redis-backed session store
// CRITICAL FOR HORIZONTAL SCALING:
// - Sessions stored in Redis (not memory) → survives server restarts
// - Works with load balancers (no sticky sessions needed)
// - Enables multi-server deployments
// Must be after cookieParser and before routes
app.use(initializeSession());

// ✅ SECURITY: Origin/Referer validation for CSRF protection
// Prevents cross-site requests to state-changing endpoints
app.use(originValidationMiddleware);

// ✅ LOGGING: Structured logging middleware
// Logs all requests/responses with correlation IDs for tracing
app.use(loggerMiddleware);

// ✅ OPTIMIZATION: HTTP Response Optimization (Priority 3.1)
// Compression middleware: Gzip compress responses >1KB (60-70% reduction)
app.use(compressionMiddleware);

// ETag middleware: Cache validation for 304 Not Modified responses
app.use(etagMiddleware);

// ✅ Health check routes (no auth needed)
// Endpoints: /health, /health/detailed, /ready, /alive
// Used by load balancer, monitoring, and Kubernetes orchestration
app.use('/', healthRoutes);

// CSRF token endpoint - GET to retrieve a fresh CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Webhook routes (must be after CSRF protection for security)
app.use('/api', webhookRoutes);

// GitHub Agents webhook routes (automated agent invocation from CI/CD)
// No authentication needed - signature verified in handler
// Rate limiting applied to prevent abuse and DOS attacks
app.use('/api', githubWebhookLimiter, gitHubAgentsRoutes);

// Agents API routes (LSP server, IDE plugins, direct invocation)
// Rate limited to prevent abuse
app.use('/api', apiLimiter, agentsRoutes);

// Public auth routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Protected API Routes - JWT-based, no CSRF needed
// Apply moderate rate limiting to general API endpoints
app.use('/api/branches', apiLimiter, branchRoutes);
app.use('/api/groups', apiLimiter, groupRoutes);
// Apply strict per-user rate limiting to messages (prevent SMS spam)
app.use('/api/messages', messageRateLimiter, messageRoutes);
app.use('/api/templates', apiLimiter, templateRoutes);
app.use('/api/recurring', apiLimiter, recurringRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);
app.use('/api/numbers', apiLimiter, numbersRoutes);

// Apply strict rate limiting to billing endpoints (payment security)
app.use('/api/billing', billingLimiter, billingRoutes);

// Apply moderate rate limiting to admin endpoints
app.use('/api/admin', apiLimiter, adminRoutes);

// Dead Letter Queue management (admin only)
app.use('/api/admin/dlq', apiLimiter, adminDLQRoutes);

// Scheduler routes - AWS CloudWatch triggers (no auth needed, uses API key instead)
// No rate limiting - CloudWatch calls are infrequent and from trusted AWS
app.use('/api/scheduler', schedulerRoutes);

// Chat routes - public and protected
app.use('/api/chat', apiLimiter, chatRoutes);

// Security & code analysis routes - code scanning and analysis tools
app.use('/api/security', apiLimiter, securityRoutes);

// GDPR routes - data export, deletion, and consent management
// Rate limited to prevent abuse
app.use('/api/gdpr', apiLimiter, gdprRoutes);

// MFA routes - multi-factor authentication setup and management
// Rate limited to prevent brute force attacks
app.use('/api/mfa', apiLimiter, mfaRoutes);

// Onboarding routes - track and verify onboarding task completion
// Rate limited to prevent abuse
app.use('/api/onboarding', apiLimiter, onboardingRoutes);

// ✅ SECURITY: Add Sentry error handler middleware
// Must be after routes but before the final error handler
app.use(getSentryErrorHandler());

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// Error handler - centralized error response management
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Log full error details server-side for debugging
  // (never exposed to client)
  if (err instanceof AppError) {
    err.logError();
  } else {
    console.error('[UnhandledError]', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }

  // Extract safe error message and status code
  const statusCode = getStatusCode(err);
  const userMessage = getSafeErrorMessage(err);

  // Build error response with optional error code for programmatic handling
  const errorResponse: any = {
    error: userMessage,
  };

  // Include error code if available (from new error hierarchy)
  // Allows clients to programmatically handle specific error types
  if (err.code) {
    errorResponse.code = err.code;
  }

  // Include details if available (useful for validation errors)
  if (err.details) {
    errorResponse.details = err.details;
  }

  // Return safe error response (never includes stack traces or internal details)
  res.status(statusCode).json(errorResponse);
});

export default app;
