import React from 'react';
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
declare function MessageBubbleComponent(props: MessageProps): import("react/jsx-runtime").JSX.Element;
/**
 * Memoized MessageBubble component
 * Prevents re-renders of individual messages when conversation re-renders
 * Shallow comparison of all message props (content, direction, media, status, etc.)
 * Critical for performance in message lists with many messages
 */
export declare const MessageBubble: React.MemoExoticComponent<typeof MessageBubbleComponent>;
export {};
//# sourceMappingURL=MessageBubble.d.ts.map