import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { csrfProtection, generateCsrfToken } from './middleware/csrf.middleware.js';
import authRoutes from './routes/auth.routes.js';
import branchRoutes from './routes/branch.routes.js';
import groupRoutes from './routes/group.routes.js';
import messageRoutes from './routes/message.routes.js';
import templateRoutes from './routes/template.routes.js';
import recurringRoutes from './routes/recurring.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import billingRoutes from './routes/billing.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// Trust proxy - required for rate limiting and IP detection on Render
app.set('trust proxy', 1);

// Rate Limiting Middleware Configurations
// Auth endpoints: strict limits to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes for login/register
  message: 'Too many login/signup attempts. Please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use IP address for rate limiting
    return (req.ip || req.socket.remoteAddress) as string;
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
});

// Billing/Payment endpoints: very strict to prevent fraud
const billingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many payment attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.ip || req.socket.remoteAddress) as string,
});

// General API endpoints: moderate limits
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.ip || req.socket.remoteAddress) as string,
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

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
// Raw body parser for Stripe webhook (SECURITY: required for signature validation)
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint (no auth needed)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Webhook routes (must be before CSRF protection, no rate limiting on webhooks)
app.use('/api', webhookRoutes);

// Public auth routes with rate limiting (must be before CSRF protection)
app.use('/api/auth', authLimiter, authRoutes);

// CSRF token endpoint - GET to retrieve a fresh CSRF token (before CSRF protection)
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Protected API Routes - JWT-based, no CSRF needed
// Apply moderate rate limiting to general API endpoints
app.use('/api/branches', apiLimiter, branchRoutes);
app.use('/api/groups', apiLimiter, groupRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);
app.use('/api/templates', apiLimiter, templateRoutes);
app.use('/api/recurring', apiLimiter, recurringRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);

// Apply strict rate limiting to billing endpoints (payment security)
app.use('/api/billing', billingLimiter, billingRoutes);

// Apply moderate rate limiting to admin endpoints
app.use('/api/admin', apiLimiter, adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
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
