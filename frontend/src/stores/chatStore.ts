import { create } from 'zustand';
import { createSelectors } from '../hooks/createSelectors';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface ChatState {
  // Conversation management
  conversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;

  // Actions
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

const useChatStoreBase = create<ChatState>((set) => ({
  conversationId: null,
  messages: [],
  isLoading: false,
  error: null,
  isOpen: false,

  setConversationId: (id: string) => set({ conversationId: id }),

  addMessage: (message: ChatMessage) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages: ChatMessage[]) => set({ messages }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),

  toggleChatWindow: () => set((state) => ({ isOpen: !state.isOpen })),

  openChat: () => set({ isOpen: true }),

  closeChat: () => set({ isOpen: false }),

  clearChat: () => set({ messages: [], conversationId: null, error: null }),

  // ✅ Reset all chat data (used on logout/login to prevent data leakage)
  reset: () => set({
    conversationId: null,
    messages: [],
    isLoading: false,
    error: null,
    isOpen: false,
  }),
}));

export const useChatStore = createSelectors(useChatStoreBase);
