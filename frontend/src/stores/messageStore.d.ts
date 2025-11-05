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
interface MessageState {
    messages: SentMessage[];
    selectedRecipients: MessageRecipient | null;
    isLoading: boolean;
    setMessages: (messages: SentMessage[]) => void;
    setSelectedRecipients: (recipients: MessageRecipient | null) => void;
    setLoading: (loading: boolean) => void;
    addMessage: (message: SentMessage) => void;
}
declare const useMessageStore: import("zustand").UseBoundStore<import("zustand").StoreApi<MessageState>>;
export default useMessageStore;
//# sourceMappingURL=messageStore.d.ts.map