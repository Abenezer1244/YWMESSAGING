/**
 * Send welcome message when a member is added to a church
 * Note: Group functionality has been removed
 */
export declare function sendWelcomeMessage(memberId: string, churchId: string): Promise<void>;
/**
 * Helper to call welcome message job with delay
 */
export declare function queueWelcomeMessage(memberId: string, churchId: string, delayMs?: number): Promise<void>;
//# sourceMappingURL=welcomeMessage.job.d.ts.map