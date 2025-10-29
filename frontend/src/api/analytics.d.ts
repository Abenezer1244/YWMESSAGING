export interface MessageStats {
    totalMessages: number;
    deliveredCount: number;
    failedCount: number;
    deliveryRate: number;
    pendingCount: number;
    byDay: Array<{
        date: string;
        count: number;
        delivered: number;
        failed: number;
    }>;
}
export interface BranchStats {
    id: string;
    name: string;
    memberCount: number;
    messageCount: number;
    deliveryRate: number;
    groupCount: number;
}
export interface SummaryStats {
    totalMessages: number;
    averageDeliveryRate: number;
    totalMembers: number;
    totalBranches: number;
    totalGroups: number;
}
/**
 * Get message statistics
 */
export declare function getMessageStats(options?: {
    days?: number;
}): Promise<MessageStats>;
/**
 * Get branch comparison statistics
 */
export declare function getBranchStats(): Promise<BranchStats[]>;
/**
 * Get overall summary statistics
 */
export declare function getSummaryStats(): Promise<SummaryStats>;
//# sourceMappingURL=analytics.d.ts.map