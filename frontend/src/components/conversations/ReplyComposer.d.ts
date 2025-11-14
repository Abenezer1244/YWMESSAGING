interface ReplyComposerProps {
    conversationId: string;
    onReply: (message: string) => Promise<void>;
    isLoading?: boolean;
}
export declare function ReplyComposer({ conversationId, onReply, isLoading, }: ReplyComposerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ReplyComposer.d.ts.map