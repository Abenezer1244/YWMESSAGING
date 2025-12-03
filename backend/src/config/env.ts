/**
 * Environment Variable Validation
 * Validates all required environment variables at startup
 * Fails fast if critical configuration is missing
 */

interface EnvironmentConfig {
  // Server
  port: number;
  nodeEnv: string;

  // Database
  databaseUrl: string;

  // Redis
  redisUrl: string;

  // Authentication
  jwtSecret: string;
  jwtRefreshSecret: string;

  // External Services
  stripeSecret: string;
  stripePublishable: string;
  telnyxApiKey: string;
  sendgridApiKey: string;

  // AWS/S3
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
  s3BucketName: string;

  // Monitoring
  datadogApiKey?: string;
  sentryDsn?: string;

  // Email
  resendApiKey: string;

  // Frontend
  frontendUrl: string;
}

const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'TELNYX_API_KEY',
  'SENDGRID_API_KEY',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'S3_BUCKET_NAME',
  'RESEND_API_KEY',
  'FRONTEND_URL',
];

const optionalEnvVars = [
  'DATADOG_API_KEY',
  'SENTRY_DSN',
  'PORT',
  'NODE_ENV',
];

/**
 * Validate environment variables at startup
 * Throws error if required variables are missing
 */
export function validateEnvironment(): EnvironmentConfig {
  const missing: string[] = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('');
    console.error('Action: Set all required environment variables in .env file');
    console.error('See .env.example for reference');
    process.exit(1);
  }

  // Validate format of critical variables
  const errors: string[] = [];

  // Validate DATABASE_URL is a valid PostgreSQL connection string
  if (!process.env.DATABASE_URL?.includes('postgresql://')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  // Validate REDIS_URL is a valid Redis connection string
  if (!process.env.REDIS_URL?.includes('redis://') && !process.env.REDIS_URL?.includes('rediss://')) {
    errors.push('REDIS_URL must be a valid Redis connection string (redis:// or rediss://)');
  }

  // Validate JWT secrets are strong (at least 32 characters)
  if ((process.env.JWT_SECRET || '').length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  if ((process.env.JWT_REFRESH_SECRET || '').length < 32) {
    errors.push('JWT_REFRESH_SECRET must be at least 32 characters long');
  }

  // Validate AWS region format
  if (!/^[a-z]{2}-[a-z]+-\d{1}$/.test(process.env.AWS_REGION || '')) {
    errors.push(`AWS_REGION format invalid: "${process.env.AWS_REGION}" (should be like us-east-1)`);
  }

  // Validate S3 bucket name
  if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(process.env.S3_BUCKET_NAME || '')) {
    errors.push(`S3_BUCKET_NAME format invalid: "${process.env.S3_BUCKET_NAME}"`);
  }

  // Validate FRONTEND_URL is a valid URL
  try {
    new URL(process.env.FRONTEND_URL || '');
  } catch (e) {
    errors.push(`FRONTEND_URL must be a valid URL: "${process.env.FRONTEND_URL}"`);
  }

  if (errors.length > 0) {
    console.error('❌ CRITICAL: Environment variable validation failed:');
    errors.forEach(e => console.error(`   - ${e}`));
    console.error('');
    console.error('Action: Fix the above configuration errors');
    process.exit(1);
  }

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'production',
    databaseUrl: process.env.DATABASE_URL!,
    redisUrl: process.env.REDIS_URL!,
    jwtSecret: process.env.JWT_SECRET!,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
    stripeSecret: process.env.STRIPE_SECRET_KEY!,
    stripePublishable: process.env.STRIPE_PUBLISHABLE_KEY!,
    telnyxApiKey: process.env.TELNYX_API_KEY!,
    sendgridApiKey: process.env.SENDGRID_API_KEY!,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    awsRegion: process.env.AWS_REGION!,
    s3BucketName: process.env.S3_BUCKET_NAME!,
    datadogApiKey: process.env.DATADOG_API_KEY,
    sentryDsn: process.env.SENTRY_DSN,
    resendApiKey: process.env.RESEND_API_KEY!,
    frontendUrl: process.env.FRONTEND_URL!,
  };
}

// Validate environment on import
export const config = validateEnvironment();
