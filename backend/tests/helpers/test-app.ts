/**
 * Test Express App
 * Minimal Express app configured for integration testing
 * Includes only essential middleware and routes, no external service dependencies
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../../src/routes/auth.routes.js';

export function createTestApp(): express.Express {
  const app = express();

  // Essential middleware for testing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Trust proxy for testing
  app.set('trust proxy', 1);

  // Routes
  app.use('/api/auth', authRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}
