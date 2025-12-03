import React from 'react';
import { Conversation } from '../../api/conversations';
interface ConversationItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onSelect: (conversationId: string) => void;
    onUpdateStatus?: (conversationId: string, status: 'open' | 'closed' | 'archived') => Promise<void>;
    index: number;
}
declare function ConversationItemComponent({ conversation, isSelected, onSelect, onUpdateStatus, index, }: ConversationItemProps): import("react/jsx-runtime").JSX.Element;
/**
 * Memoized ConversationItem component
 * Prevents re-renders of individual conversation items when list updates
 * Critical for performance when displaying many conversations
 * Shallow comparison of conversation object, selection state, and callbacks
 */
export declare const ConversationItem: React.MemoExoticComponent<typeof ConversationItemComponent>;
export {};
//# sourceMappingURL=ConversationItem.d.ts.map