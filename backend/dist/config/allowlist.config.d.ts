/**
 * Rate Limit Allowlist Configuration
 * Services and webhooks that bypass per-user rate limiting
 *
 * Includes:
 * - Verified webhooks (Telnyx, Stripe)
 * - Internal services (CloudWatch scheduler, batch jobs)
 * - Trusted IPs (specific ranges for internal traffic)
 */
export interface AllowlistConfig {
    webhooks: string[];
    services: string[];
    ips: string[];
}
export declare const allowlistConfig: AllowlistConfig;
/**
 * Check if webhook source is allowlisted
 * @param provider - Webhook provider name (e.g., 'telnyx', 'stripe')
 * @returns true if webhook is allowlisted and should bypass rate limiting
 */
export declare function isWebhookAllowlisted(provider: string): boolean;
/**
 * Check if service is allowlisted
 * @param serviceName - Internal service identifier
 * @returns true if service is allowlisted and should bypass rate limiting
 */
export declare function isServiceAllowlisted(serviceName: string): boolean;
/**
 * Check if IP address is allowlisted
 * Supports both single IPs and CIDR ranges
 *
 * @param ipAddress - IP address to check
 * @returns true if IP is allowlisted and should bypass rate limiting
 */
export declare function isIPAllowlisted(ipAddress: string): boolean;
/**
 * Check if request should bypass rate limiting
 * Checks webhooks, services, and IP allowlists
 *
 * @param provider - Webhook provider or service name
 * @param ipAddress - Request IP address
 * @returns true if request is allowlisted
 */
export declare function shouldBypassRateLimit(provider?: string, ipAddress?: string): boolean;
//# sourceMappingURL=allowlist.config.d.ts.map