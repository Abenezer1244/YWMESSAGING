/**
 * Rate Limit Allowlist Configuration
 * Services and webhooks that bypass per-user rate limiting
 *
 * Includes:
 * - Verified webhooks (Telnyx, Stripe)
 * - Internal services (CloudWatch scheduler, batch jobs)
 * - Trusted IPs (specific ranges for internal traffic)
 */
/**
 * Webhook allowlist - verified webhook sources
 * Format: 'provider:signature_verified' or 'provider:*' for any signature
 */
const webhookAllowlist = [
    'telnyx', // Telnyx SMS/MMS webhooks
    'stripe', // Stripe payment webhooks
    'github', // GitHub webhook events
];
/**
 * Service allowlist - internal trusted services
 * Format: 'service_name' or 'service:action'
 */
const serviceAllowlist = [
    'cloudwatch-scheduler', // AWS CloudWatch triggered tasks
    'batch-import', // Bulk import service
    'scheduled-jobs', // Cron job scheduler
    'internal-api', // Internal service-to-service calls
];
/**
 * IP allowlist - trusted IP addresses and ranges
 * Format: 'single_ip' or 'CIDR_range'
 *
 * Common allowlist ranges:
 * - 127.0.0.1: Localhost (development)
 * - 10.0.0.0/8: Private network (RFC 1918)
 * - 172.16.0.0/12: Private network (RFC 1918)
 * - 192.168.0.0/16: Private network (RFC 1918)
 */
const ipAllowlist = [
    '127.0.0.1', // Localhost
    '::1', // IPv6 localhost
    // Add internal IP ranges as needed:
    // '10.0.0.0/8',
    // '172.16.0.0/12',
    // '192.168.0.0/16',
];
export const allowlistConfig = {
    webhooks: webhookAllowlist,
    services: serviceAllowlist,
    ips: ipAllowlist,
};
/**
 * Check if webhook source is allowlisted
 * @param provider - Webhook provider name (e.g., 'telnyx', 'stripe')
 * @returns true if webhook is allowlisted and should bypass rate limiting
 */
export function isWebhookAllowlisted(provider) {
    if (!provider)
        return false;
    // Normalize to lowercase for comparison
    const normalizedProvider = provider.toLowerCase();
    // Check exact match or wildcard match
    return allowlistConfig.webhooks.some((allowedProvider) => allowedProvider.toLowerCase() === normalizedProvider ||
        allowedProvider === '*');
}
/**
 * Check if service is allowlisted
 * @param serviceName - Internal service identifier
 * @returns true if service is allowlisted and should bypass rate limiting
 */
export function isServiceAllowlisted(serviceName) {
    if (!serviceName)
        return false;
    // Normalize to lowercase for comparison
    const normalizedService = serviceName.toLowerCase();
    return allowlistConfig.services.some((allowedService) => allowedService.toLowerCase() === normalizedService ||
        allowedService === '*');
}
/**
 * Check if IP address is allowlisted
 * Supports both single IPs and CIDR ranges
 *
 * @param ipAddress - IP address to check
 * @returns true if IP is allowlisted and should bypass rate limiting
 */
export function isIPAllowlisted(ipAddress) {
    if (!ipAddress)
        return false;
    return allowlistConfig.ips.some((allowedIP) => {
        // Exact IP match
        if (allowedIP === ipAddress)
            return true;
        // CIDR range match (basic implementation)
        if (allowedIP.includes('/')) {
            return isCIDRMatch(ipAddress, allowedIP);
        }
        return false;
    });
}
/**
 * Check if IP matches CIDR notation
 * Basic implementation for IPv4 addresses
 *
 * @param ip - IP address to check
 * @param cidr - CIDR notation (e.g., '192.168.1.0/24')
 * @returns true if IP is within CIDR range
 */
function isCIDRMatch(ip, cidr) {
    try {
        const [range, bits] = cidr.split('/');
        const mask = ~(Math.pow(2, 32 - parseInt(bits, 10)) - 1);
        // Convert IPs to 32-bit integers
        const ipNum = ipToNumber(ip);
        const rangeNum = ipToNumber(range);
        // Bitwise AND with mask
        return (ipNum & mask) === (rangeNum & mask);
    }
    catch {
        // On parse error, don't match
        return false;
    }
}
/**
 * Convert IPv4 address to 32-bit integer
 * @param ip - IPv4 address (e.g., '192.168.1.1')
 * @returns 32-bit integer representation
 */
function ipToNumber(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4)
        throw new Error('Invalid IPv4 address');
    return ((parseInt(parts[0], 10) << 24) +
        (parseInt(parts[1], 10) << 16) +
        (parseInt(parts[2], 10) << 8) +
        parseInt(parts[3], 10));
}
/**
 * Check if request should bypass rate limiting
 * Checks webhooks, services, and IP allowlists
 *
 * @param provider - Webhook provider or service name
 * @param ipAddress - Request IP address
 * @returns true if request is allowlisted
 */
export function shouldBypassRateLimit(provider, ipAddress) {
    // Check webhook allowlist
    if (provider && isWebhookAllowlisted(provider)) {
        console.log(`✅ Rate limit bypass: allowlisted webhook (${provider})`);
        return true;
    }
    // Check service allowlist
    if (provider && isServiceAllowlisted(provider)) {
        console.log(`✅ Rate limit bypass: allowlisted service (${provider})`);
        return true;
    }
    // Check IP allowlist
    if (ipAddress && isIPAllowlisted(ipAddress)) {
        console.log(`✅ Rate limit bypass: allowlisted IP (${ipAddress})`);
        return true;
    }
    return false;
}
//# sourceMappingURL=allowlist.config.js.map