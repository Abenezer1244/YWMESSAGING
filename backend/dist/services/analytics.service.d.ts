/**
 * Analytics Service
 * Integrates with PostHog for event tracking
 *
 * In production, this would use: npm install posthog
 * For now, we'll mock the implementation
 */
declare class AnalyticsService {
    private apiKey;
    private isEnabled;
    constructor();
    /**
     * Track a user event
     */
    track(userId: string, eventName: string, properties?: Record<string, any>): Promise<void>;
    /**
     * Track authentication events
     */
    trackAuthEvent(userId: string, eventType: 'signup' | 'login' | 'logout', churchId?: string, email?: string): Promise<void>;
    /**
     * Track message events
     */
    trackMessageEvent(userId: string, eventType: 'sent' | 'delivered' | 'failed', churchId: string, properties?: Record<string, any>): Promise<void>;
    /**
     * Track member events
     */
    trackMemberEvent(userId: string, eventType: 'added' | 'imported' | 'updated' | 'removed', churchId: string, groupId?: string, count?: number): Promise<void>;
    /**
     * Track group events
     */
    trackGroupEvent(userId: string, eventType: 'created' | 'updated' | 'deleted', churchId: string, branchId: string, properties?: Record<string, any>): Promise<void>;
    /**
     * Track branch events
     */
    trackBranchEvent(userId: string, eventType: 'created' | 'updated' | 'deleted', churchId: string, properties?: Record<string, any>): Promise<void>;
    /**
     * Track template events
     */
    trackTemplateEvent(userId: string, eventType: 'created' | 'used' | 'deleted', churchId: string, properties?: Record<string, any>): Promise<void>;
    /**
     * Track recurring message events
     */
    trackRecurringEvent(userId: string, eventType: 'created' | 'executed' | 'paused' | 'resumed', churchId: string, frequency?: string): Promise<void>;
}
declare const _default: AnalyticsService;
export default _default;
//# sourceMappingURL=analytics.service.d.ts.map