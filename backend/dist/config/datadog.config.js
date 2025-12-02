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
export function initDatadog() {
    // Check if Datadog is enabled via environment variable
    const datadogEnabled = process.env.DATADOG_ENABLED === 'true';
    if (!datadogEnabled) {
        console.log('ℹ️ Datadog APM is disabled (set DATADOG_ENABLED=true to enable)');
        return;
    }
    try {
        tracer.init({
            service: 'connect-yw-backend',
            version: process.env.APP_VERSION || '1.0.0',
            env: process.env.NODE_ENV || 'development',
            // Sampling: trace 10% of requests in production, 100% in development
            sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
            // Enable instrumentation for common libraries
            enabled: true,
            // Database tracing
            'pg': {
                service: 'postgres',
            },
            // HTTP tracing
            'express': {
                service: 'express',
            },
            // External API tracing
            'http': {
                service: 'http-client',
            },
            'https': {
                service: 'https-client',
            },
            // Cache tracing
            'redis': {
                service: 'redis',
            },
            // API tracing for Stripe, Telnyx, etc.
            'axios': {
                service: 'http-client',
            },
        });
        // Add global tags for better filtering and organization
        tracer.setTag('environment', process.env.NODE_ENV || 'development');
        tracer.setTag('service', 'connect-yw-backend');
        tracer.setTag('version', process.env.APP_VERSION || '1.0.0');
        console.log('✅ Datadog APM initialized');
        console.log(`   Service: connect-yw-backend`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   Sample Rate: ${process.env.NODE_ENV === 'production' ? '10%' : '100%'}`);
    }
    catch (error) {
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
//# sourceMappingURL=datadog.config.js.map