export interface MessageRecipient {
    type: 'individual' | 'branches' | 'all';
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
    reset: () => void;
}
export declare const useMessageStore: {
    (): MessageState;
    <U>(selector: (state: MessageState) => U): U;
    <U>(selector: (state: MessageState) => U, equalityFn: (a: U, b: U) => boolean): U;
} & import("zustand").StoreApi<MessageState> & {
    use: {
        messages: () => SentMessage[];
        selectedRecipients: () => MessageRecipient | null;
        isLoading: () => boolean;
        setMessages: () => (messages: SentMessage[]) => void;
        setSelectedRecipients: () => (recipients: MessageRecipient | null) => void;
        setLoading: () => (loading: boolean) => void;
        addMessage: () => (message: SentMessage) => void;
        reset: () => () => void;
    };
};
export {};
//# sourceMappingURL=messageStore.d.ts.map