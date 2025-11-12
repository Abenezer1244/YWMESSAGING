export declare function getOrCreateConversation(userId?: string, visitorId?: string): Promise<string>;
export declare function sendChatMessage(conversationId: string, userMessage: string): Promise<string>;
export declare function getConversationHistory(conversationId: string): Promise<any[]>;
//# sourceMappingURL=chat.service.d.ts.map