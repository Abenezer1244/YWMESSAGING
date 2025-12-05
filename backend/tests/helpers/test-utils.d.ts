/**
 * Test Utilities
 * Helper functions for testing (authentication, API requests, mocking)
 */
/**
 * Generate a test JWT token
 */
export declare function generateTestToken(userId: string, churchId: string, secret?: string, expiresIn?: string): string;
/**
 * Generate a test refresh token
 */
export declare function generateTestRefreshToken(userId: string, churchId: string, secret?: string, expiresIn?: string): string;
/**
 * Verify and decode a JWT token (for testing)
 */
export declare function verifyTestToken(token: string, secret?: string): any;
/**
 * Create Stripe API mock
 */
export declare function createStripeMock(): {
    customers: {
        create: jest.Mock<any, any, any>;
        retrieve: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
    };
    subscriptions: {
        create: jest.Mock<any, any, any>;
        retrieve: jest.Mock<any, any, any>;
        update: jest.Mock<any, any, any>;
        cancel: jest.Mock<any, any, any>;
    };
    webhookEndpoints: {
        create: jest.Mock<any, any, any>;
    };
};
/**
 * Create Telnyx API mock
 */
export declare function createTelnyxMock(): {
    messages: {
        create: jest.Mock<any, any, any>;
        retrieve: jest.Mock<any, any, any>;
    };
    phoneNumbers: {
        create: jest.Mock<any, any, any>;
        retrieve: jest.Mock<any, any, any>;
    };
    webhooks: {
        create: jest.Mock<any, any, any>;
    };
};
/**
 * Mock external API services in tests
 */
export declare function mockExternalApis(): {
    stripe: {
        customers: {
            create: jest.Mock<any, any, any>;
            retrieve: jest.Mock<any, any, any>;
            update: jest.Mock<any, any, any>;
        };
        subscriptions: {
            create: jest.Mock<any, any, any>;
            retrieve: jest.Mock<any, any, any>;
            update: jest.Mock<any, any, any>;
            cancel: jest.Mock<any, any, any>;
        };
        webhookEndpoints: {
            create: jest.Mock<any, any, any>;
        };
    };
    telnyx: {
        messages: {
            create: jest.Mock<any, any, any>;
            retrieve: jest.Mock<any, any, any>;
        };
        phoneNumbers: {
            create: jest.Mock<any, any, any>;
            retrieve: jest.Mock<any, any, any>;
        };
        webhooks: {
            create: jest.Mock<any, any, any>;
        };
    };
};
/**
 * Clear all mock calls
 */
export declare function clearMocks(): void;
/**
 * Wait for a condition to be true (useful for async assertions)
 */
export declare function waitFor(condition: () => boolean | Promise<boolean>, timeout?: number): Promise<void>;
/**
 * Create a Stripe webhook signature for testing
 */
export declare function createStripeWebhookSignature(payload: string, secret?: string): string;
/**
 * Create a Telnyx webhook signature for testing
 */
export declare function createTelnyxWebhookSignature(payload: string, secret?: string): string;
/**
 * Rate limit test helper - simulate rate limit headers
 */
export declare function createRateLimitHeaders(remaining?: number, resetTime?: number): {
    'x-ratelimit-limit': string;
    'x-ratelimit-remaining': string;
    'x-ratelimit-reset': string;
};
//# sourceMappingURL=test-utils.d.ts.map