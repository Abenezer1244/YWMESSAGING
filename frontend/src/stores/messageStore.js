import { create } from 'zustand';
const useMessageStore = create()((set) => ({
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
export default useMessageStore;
//# sourceMappingURL=messageStore.js.map