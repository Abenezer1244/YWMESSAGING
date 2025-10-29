export interface RecurringMessage {
    id: string;
    churchId: string;
    name: string;
    content: string;
    targetType: 'individual' | 'groups' | 'branches' | 'all';
    targetIds: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    timeOfDay?: string;
    nextSendAt: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface CreateRecurringMessageData {
    name: string;
    content: string;
    targetType: 'individual' | 'groups' | 'branches' | 'all';
    targetIds?: string[];
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    timeOfDay: string;
}
/**
 * Get all recurring messages
 */
export declare function getRecurringMessages(): Promise<RecurringMessage[]>;
/**
 * Create recurring message
 */
export declare function createRecurringMessage(data: CreateRecurringMessageData): Promise<RecurringMessage>;
/**
 * Update recurring message
 */
export declare function updateRecurringMessage(messageId: string, data: Partial<CreateRecurringMessageData>): Promise<RecurringMessage>;
/**
 * Delete recurring message
 */
export declare function deleteRecurringMessage(messageId: string): Promise<any>;
/**
 * Toggle recurring message active status
 */
export declare function toggleRecurringMessage(messageId: string, isActive: boolean): Promise<RecurringMessage>;
//# sourceMappingURL=recurring.d.ts.map