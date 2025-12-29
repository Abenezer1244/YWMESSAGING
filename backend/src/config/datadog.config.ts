/**
 * Datadog APM Configuration
 * Must be imported and initialized BEFORE any other modules
 * Enables tracing of HTTP requests, database queries, and external API calls
 */

import tracer from 'dd-trace';

/**
 * Initialize Datadog APM
 * Call this function as early as possible in the application lifecycle
 */
export function initDatadog(): void {
  // Check if Datadog is enabled via environment variable
  const datadogEnabled = process.env.DATADOG_ENABLED === 'true';

  if (!datadogEnabled) {
    console.log('ℹ️ Datadog APM is disabled (set DATADOG_ENABLED=true to enable)');
    return;
  }

  try {
    tracer.init({
      service: 'koinonia-sms-backend',
      version: process.env.APP_VERSION || '1.0.0',
      env: process.env.NODE_ENV || 'development',
      // Sampling: trace 10% of requests in production, 100% in development
      sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });

    tracer.use('pg', { service: 'postgres' });
    tracer.use('express', { service: 'express' });
    tracer.use('http', { service: 'http-client' });
    tracer.use('redis', { service: 'redis' });

    console.log('✅ Datadog APM initialized');
    console.log(`   Service: koinonia-sms-backend`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Sample Rate: ${process.env.NODE_ENV === 'production' ? '10%' : '100%'}`);
  } catch (error) {
    console.error('❌ Failed to initialize Datadog APM:', error);
    // Don't crash application if Datadog init fails
  }
}

/**
 * Export tracer for use in application code
 * Use this to create custom spans and trace application-specific logic
 */
export { tracer };
export default tracer;
