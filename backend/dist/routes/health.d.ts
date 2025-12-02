/**
 * Health Check Endpoint
 * Used by Render for load balancer health checks and monitoring
 * Response time should be < 100ms
 *
 * Endpoint: GET /health
 * Response: JSON with service status
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=health.d.ts.map