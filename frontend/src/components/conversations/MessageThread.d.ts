import { ConversationMessage, Conversation } from '../../api/conversations';
interface MessageThreadProps {
    conversation: Conversation;
    messages: ConversationMessage[];
    isLoading?: boolean;
    isTyping?: boolean;
    page?: number;
    pages?: number;
    onLoadMore?: (page: number) => Promise<void>;
    onReact?: (messageId: string, emoji: string) => void;
    onSelectReplyMessage?: (messageId: string) => void;
}
export declare function MessageThread({ conversation, messages, isLoading, isTyping, page, pages, onLoadMore, onReact, onSelectReplyMessage, }: MessageThreadProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MessageThread.d.ts.map