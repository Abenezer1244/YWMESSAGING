import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { logRateLimitExceeded } from './utils/security-logger.js';
import { csrfProtection } from './middleware/csrf.middleware.js';
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
import adminRoutes from './routes/admin.routes.js';
import chatRoutes from './routes/chat.routes.js';
import schedulerRoutes from './routes/scheduler.routes.js';
const app = express();
// Trust proxy - required for rate limiting and IP detection on Render
app.set('trust proxy', 1);
// Rate Limiting Middleware Configurations
// Auth endpoints: strict limits to prevent brute-force attacks
// Development: more lenient, Production: strict
const authMaxRequests = process.env.NODE_ENV === 'production' ? 5 : 50;
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: authMaxRequests, // 5 in production, 50 in development
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
        return (req.ip || req.socket.remoteAddress);
    },
    handler: (req, res) => {
        const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown');
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
    keyGenerator: (req) => (req.ip || req.socket.remoteAddress),
    handler: (req, res) => {
        const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown');
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
    keyGenerator: (req) => (req.ip || req.socket.remoteAddress),
    handler: (req, res) => {
        const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown');
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
    keyGenerator: (req) => (req.ip || req.socket.remoteAddress),
    handler: (req, res) => {
        const ipAddress = (req.ip || req.socket.remoteAddress || 'unknown');
        logRateLimitExceeded(req.originalUrl || req.path, ipAddress, 100);
        res.status(429).json({ error: 'Too many requests. Please try again later.' });
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
                "https://js.stripe.com", // Stripe Elements
                "https://cdn.jsdelivr.net", // For CDN resources
                "'unsafe-inline'", // Required for some React patterns (consider nonce in production)
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'", // Required for inline styles
                "https://fonts.googleapis.com", // Google Fonts
            ],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: [
                "'self'",
                "https://api.stripe.com", // Stripe API
                "https://m.stripe.network", // Stripe network
                "https://js.stripe.com", // Stripe JS
            ],
            frameSrc: [
                "'self'",
                "https://js.stripe.com", // Stripe iframe
                "https://m.stripe.network", // Stripe network iframe
            ],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            ...(process.env.NODE_ENV === 'production' && {
                upgradeInsecureRequests: [], // Force HTTPS in production
            }),
        },
    },
    // Additional security headers
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
    frameguard: { action: 'deny' }, // Prevent clickjacking
    xssFilter: true,
    noSniff: true, // Prevent MIME-sniffing
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
// CORS configuration - allow development, staging, and production URLs
const corsOrigin = [
    // Development
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    // Production
    'https://koinoniasms.com',
    'https://www.koinoniasms.com',
    // Render deployments
    'https://connect-yw-frontend.onrender.com',
    'https://connect-yw-backend.onrender.com',
    // Environment-based (fallback)
    process.env.FRONTEND_URL || 'https://koinoniasms.com'
];
app.use(cors({
    origin: corsOrigin,
    credentials: true,
}));
// Raw body parser for webhooks (must be BEFORE express.json() to intercept raw bytes)
// This captures raw request body for ED25519 signature verification
app.use('/api/webhooks/', express.raw({ type: 'application/json' }));
// JSON parser for all other endpoints
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Health check endpoint (no auth needed)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// CSRF token endpoint - GET to retrieve a fresh CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});
// Webhook routes (must be after CSRF protection for security)
app.use('/api', webhookRoutes);
// Public auth routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
// Protected API Routes - JWT-based, no CSRF needed
// Apply moderate rate limiting to general API endpoints
app.use('/api/branches', apiLimiter, branchRoutes);
app.use('/api/groups', apiLimiter, groupRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);
app.use('/api/templates', apiLimiter, templateRoutes);
app.use('/api/recurring', apiLimiter, recurringRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);
app.use('/api/numbers', apiLimiter, numbersRoutes);
// Apply strict rate limiting to billing endpoints (payment security)
app.use('/api/billing', billingLimiter, billingRoutes);
// Apply moderate rate limiting to admin endpoints
app.use('/api/admin', apiLimiter, adminRoutes);
// Scheduler routes - AWS CloudWatch triggers (no auth needed, uses API key instead)
// No rate limiting - CloudWatch calls are infrequent and from trusted AWS
app.use('/api/scheduler', schedulerRoutes);
// Chat routes - public and protected
app.use('/api/chat', apiLimiter, chatRoutes);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        method: req.method,
    });
});
// Error handler
app.use((err, req, res, _next) => {
    // Log error details only in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }
    // Never expose backend error details to clients
    const statusCode = err.status || 500;
    const userMessage = statusCode === 404 ? 'Not Found' : 'Something went wrong. Please try again.';
    res.status(statusCode).json({
        error: userMessage,
    });
});
export default app;
//# sourceMappingURL=app.js.map