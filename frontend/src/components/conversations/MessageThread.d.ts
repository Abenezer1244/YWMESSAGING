import { ConversationMessage, Conversation } from '../../api/conversations';
interface MessageThreadProps {
    conversation: Conversation;
    messages: ConversationMessage[];
    isLoading?: boolean;
    page?: number;
    pages?: number;
    onLoadMore?: (page: number) => Promise<void>;
}
export declare function MessageThread({ conversation, messages, isLoading, page, pages, onLoadMore, }: MessageThreadProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MessageThread.d.ts.map