import { create } from 'zustand';
import { createSelectors } from '../hooks/createSelectors';
const useMessageStoreBase = create()((set) => ({
    // State
    messages: [],
    selectedRecipients: null,
    isLoading: false,
    // Actions
    setMessages: (messages) => {
        set({ messages });
    },
    setSelectedRecipients: (recipients) => {
        set({ selectedRecipients: recipients });
    },
    setLoading: (loading) => {
        set({ isLoading: loading });
    },
    addMessage: (message) => {
        set((state) => ({
            messages: [message, ...state.messages],
        }));
    },
}));
export const useMessageStore = createSelectors(useMessageStoreBase);
//# sourceMappingURL=messageStore.js.map