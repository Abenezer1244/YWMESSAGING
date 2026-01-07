import { SendEffect, ConversationMessage } from '../../api/conversations';
interface ReplyComposerProps {
    conversationId: string;
    onReply: (message: string, options?: {
        replyToId?: string;
        sendEffect?: SendEffect;
    }) => Promise<void>;
    isLoading?: boolean;
    replyToMessage?: ConversationMessage | null;
    onCancelReply?: () => void;
}
export declare function ReplyComposer({ conversationId, onReply, isLoading, replyToMessage, onCancelReply, }: ReplyComposerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ReplyComposer.d.ts.map