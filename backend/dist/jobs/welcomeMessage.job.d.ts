/**
 * Send welcome message when a member is added to a group
 * Triggered by GroupMember creation
 * Delay: 1 minute
 */
export declare function sendWelcomeMessage(groupMemberId: string, groupId: string, memberId: string): Promise<void>;
/**
 * Helper to call welcome message job with delay
 */
export declare function queueWelcomeMessage(groupMemberId: string, groupId: string, memberId: string, delayMs?: number): Promise<void>;
//# sourceMappingURL=welcomeMessage.job.d.ts.map