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
export declare function initDatadog(): void;
/**
 * Export tracer for use in application code
 * Use this to create custom spans and trace application-specific logic
 */
export { tracer };
export default tracer;
//# sourceMappingURL=datadog.config.d.ts.map