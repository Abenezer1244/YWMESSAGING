export interface MessageRecipient {
    type: 'individual' | 'groups' | 'branches' | 'all';
    ids: string[];
}
export interface SentMessage {
    id: string;
    content: string;
    targetType: string;
    totalRecipients: number;
    deliveredCount: number;
    failedCount: number;
    status: string;
    createdAt: string;
    sentAt?: string;
    deliveryRate?: number;
}
declare const useMessageStore: any;
export default useMessageStore;
//# sourceMappingURL=messageStore.d.ts.map