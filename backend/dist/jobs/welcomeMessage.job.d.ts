/**
 * Send welcome message when a member is added to a church
 * PHASE 5: Multi-tenant refactoring
 * - Uses tenantPrisma for member (tenant-scoped)
 * - Uses registryPrisma for church (shared registry)
 */
export declare function sendWelcomeMessage(memberId: string, churchId: string): Promise<void>;
/**
 * Helper to call welcome message job with delay
 */
export declare function queueWelcomeMessage(memberId: string, churchId: string, delayMs?: number): Promise<void>;
//# sourceMappingURL=welcomeMessage.job.d.ts.map