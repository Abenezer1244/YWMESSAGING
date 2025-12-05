/**
 * Test Utilities
 * Helper functions for testing (authentication, API requests, mocking)
 */
import jwt from 'jsonwebtoken';
/**
 * Generate a test JWT token
 */
export function generateTestToken(userId, churchId, secret = process.env.JWT_SECRET || 'test-secret-min-32-chars-required-!!', expiresIn = '1h') {
    return jwt.sign({
        sub: userId,
        churchId,
        email: 'test@church.com',
    }, secret, { expiresIn });
}
/**
 * Generate a test refresh token
 */
export function generateTestRefreshToken(userId, churchId, secret = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-min-32-chars-!!', expiresIn = '7d') {
    return jwt.sign({
        sub: userId,
        churchId,
        type: 'refresh',
    }, secret, { expiresIn });
}
/**
 * Verify and decode a JWT token (for testing)
 */
export function verifyTestToken(token, secret = process.env.JWT_SECRET || 'test-secret-min-32-chars-required-!!') {
    try {
        return jwt.verify(token, secret);
    }
    catch (error) {
        throw new Error(`Invalid token: ${error}`);
    }
}
/**
 * Create Stripe API mock
 */
export function createStripeMock() {
    return {
        customers: {
            create: jest.fn().mockResolvedValue({
                id: 'cus_test_123',
                email: 'test@church.com',
            }),
            retrieve: jest.fn().mockResolvedValue({
                id: 'cus_test_123',
                invoice_settings: {
                    default_payment_method: 'pm_test_123',
                },
            }),
            update: jest.fn().mockResolvedValue({
                id: 'cus_test_123',
            }),
        },
        subscriptions: {
            create: jest.fn().mockResolvedValue({
                id: 'sub_test_123',
                status: 'active',
                current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
            }),
            retrieve: jest.fn().mockResolvedValue({
                id: 'sub_test_123',
                status: 'active',
            }),
            update: jest.fn().mockResolvedValue({
                id: 'sub_test_123',
                status: 'active',
            }),
            cancel: jest.fn().mockResolvedValue({
                id: 'sub_test_123',
                status: 'canceled',
            }),
        },
        webhookEndpoints: {
            create: jest.fn().mockResolvedValue({
                id: 'we_test_123',
                url: 'https://example.com/webhook',
            }),
        },
    };
}
/**
 * Create Telnyx API mock
 */
export function createTelnyxMock() {
    return {
        messages: {
            create: jest.fn().mockResolvedValue({
                data: {
                    id: 'msg_test_123',
                    to: '+15551234567',
                    from: '+15559876543',
                    text: 'Test message',
                    direction: 'outbound',
                    status: 'queued',
                },
            }),
            retrieve: jest.fn().mockResolvedValue({
                data: {
                    id: 'msg_test_123',
                    status: 'delivered',
                },
            }),
        },
        phoneNumbers: {
            create: jest.fn().mockResolvedValue({
                data: {
                    id: 'num_test_123',
                    phoneNumber: '+15551234567',
                    status: 'active',
                },
            }),
            retrieve: jest.fn().mockResolvedValue({
                data: {
                    id: 'num_test_123',
                    phoneNumber: '+15551234567',
                    status: 'active',
                },
            }),
        },
        webhooks: {
            create: jest.fn().mockResolvedValue({
                data: {
                    id: 'wh_test_123',
                    url: 'https://example.com/webhook',
                },
            }),
        },
    };
}
/**
 * Mock external API services in tests
 */
export function mockExternalApis() {
    const stripeMock = createStripeMock();
    const telnyxMock = createTelnyxMock();
    jest.mock('stripe', () => ({
        __esModule: true,
        default: jest.fn(() => stripeMock),
    }));
    jest.mock('telnyx', () => ({
        __esModule: true,
        default: jest.fn(() => telnyxMock),
    }));
    return {
        stripe: stripeMock,
        telnyx: telnyxMock,
    };
}
/**
 * Clear all mock calls
 */
export function clearMocks() {
    jest.clearAllMocks();
}
/**
 * Wait for a condition to be true (useful for async assertions)
 */
export async function waitFor(condition, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        if (await condition()) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}
/**
 * Create a Stripe webhook signature for testing
 */
export function createStripeWebhookSignature(payload, secret = 'whsec_test') {
    const crypto = require('crypto');
    const timestamp = Math.floor(Date.now() / 1000);
    const signedContent = `${timestamp}.${payload}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedContent);
    const signature = hmac.digest('hex');
    return `t=${timestamp},v1=${signature}`;
}
/**
 * Create a Telnyx webhook signature for testing
 */
export function createTelnyxWebhookSignature(payload, secret = 'test_secret') {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return hmac.digest('hex');
}
/**
 * Rate limit test helper - simulate rate limit headers
 */
export function createRateLimitHeaders(remaining = 60, resetTime = Math.floor(Date.now() / 1000) + 3600) {
    return {
        'x-ratelimit-limit': '100',
        'x-ratelimit-remaining': remaining.toString(),
        'x-ratelimit-reset': resetTime.toString(),
    };
}
//# sourceMappingURL=test-utils.js.map