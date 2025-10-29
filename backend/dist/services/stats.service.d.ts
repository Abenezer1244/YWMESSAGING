/**
 * Get message statistics for a church
 */
export declare function getMessageStats(churchId: string, days?: number): Promise<{
    totalMessages: number;
    deliveredCount: number;
    failedCount: number;
    pendingCount: number;
    deliveryRate: number;
    byDay: {
        date: string;
        count: number;
        delivered: number;
        failed: number;
    }[];
}>;
/**
 * Get statistics per branch
 */
export declare function getBranchStats(churchId: string): Promise<{
    id: string;
    name: string;
    memberCount: number;
    messageCount: number;
    deliveryRate: number;
    groupCount: number;
}[]>;
/**
 * Get summary statistics
 */
export declare function getSummaryStats(churchId: string): Promise<{
    totalMessages: number;
    averageDeliveryRate: number;
    totalMembers: number;
    totalBranches: number;
    totalGroups: number;
}>;
//# sourceMappingURL=stats.service.d.ts.map