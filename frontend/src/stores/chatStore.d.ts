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
    reset: () => void;
}
export declare const useChatStore: {
    (): ChatState;
    <U>(selector: (state: ChatState) => U): U;
    <U>(selector: (state: ChatState) => U, equalityFn: (a: U, b: U) => boolean): U;
} & import("zustand").StoreApi<ChatState> & {
    use: {
        conversationId: () => string | null;
        messages: () => ChatMessage[];
        isLoading: () => boolean;
        error: () => string | null;
        isOpen: () => boolean;
        setConversationId: () => (id: string) => void;
        addMessage: () => (message: ChatMessage) => void;
        setMessages: () => (messages: ChatMessage[]) => void;
        setLoading: () => (loading: boolean) => void;
        setError: () => (error: string | null) => void;
        toggleChatWindow: () => () => void;
        openChat: () => () => void;
        closeChat: () => () => void;
        clearChat: () => () => void;
        reset: () => () => void;
    };
};
export {};
//# sourceMappingURL=chatStore.d.ts.map