export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}
interface ChatState {
    conversationId: string | null;
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    isOpen: boolean;
    setConversationId: (id: string) => void;
    addMessage: (message: ChatMessage) => void;
    setMessages: (messages: ChatMessage[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    toggleChatWindow: () => void;
    openChat: () => void;
    closeChat: () => void;
    clearChat: () => void;
}
export declare const useChatStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ChatState>>;
export {};
//# sourceMappingURL=chatStore.d.ts.map