import { Conversation } from '../../api/conversations';
interface ConversationsListProps {
    conversations: Conversation[];
    selectedConversationId?: string;
    onSelectConversation: (conversationId: string) => void;
    onUpdateStatus?: (conversationId: string, status: 'open' | 'closed' | 'archived') => Promise<void>;
    isLoading?: boolean;
    containerHeight?: number;
}
export declare function ConversationsList({ conversations, selectedConversationId, onSelectConversation, onUpdateStatus, isLoading, containerHeight, }: ConversationsListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ConversationsList.d.ts.map