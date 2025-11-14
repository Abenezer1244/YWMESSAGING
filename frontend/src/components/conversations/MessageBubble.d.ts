interface MessageProps {
    id: string;
    content: string;
    direction: 'inbound' | 'outbound';
    memberName?: string;
    deliveryStatus?: string | null;
    mediaUrl?: string | null;
    mediaType?: 'image' | 'video' | 'audio' | 'document' | null;
    mediaName?: string | null;
    mediaSizeBytes?: number | null;
    mediaDuration?: number | null;
    createdAt: string | Date;
}
export declare function MessageBubble(props: MessageProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MessageBubble.d.ts.map