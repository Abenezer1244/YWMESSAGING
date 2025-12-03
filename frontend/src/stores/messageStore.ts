import { create } from 'zustand';
import { createSelectors } from '../hooks/createSelectors';

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
  // State
  messages: SentMessage[];
  selectedRecipients: MessageRecipient | null;
  isLoading: boolean;

  // Actions
  setMessages: (messages: SentMessage[]) => void;
  setSelectedRecipients: (recipients: MessageRecipient | null) => void;
  setLoading: (loading: boolean) => void;
  addMessage: (message: SentMessage) => void;
}

const useMessageStoreBase = create<MessageState>()((set) => ({
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
