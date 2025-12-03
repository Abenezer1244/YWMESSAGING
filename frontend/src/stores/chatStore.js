import { create } from 'zustand';
import { createSelectors } from '../hooks/createSelectors';
const useChatStoreBase = create((set) => ({
    conversationId: null,
    messages: [],
    isLoading: false,
    error: null,
    isOpen: false,
    setConversationId: (id) => set({ conversationId: id }),
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
    })),
    setMessages: (messages) => set({ messages }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    toggleChatWindow: () => set((state) => ({ isOpen: !state.isOpen })),
    openChat: () => set({ isOpen: true }),
    closeChat: () => set({ isOpen: false }),
    clearChat: () => set({ messages: [], conversationId: null, error: null }),
}));
export const useChatStore = createSelectors(useChatStoreBase);
//# sourceMappingURL=chatStore.js.map