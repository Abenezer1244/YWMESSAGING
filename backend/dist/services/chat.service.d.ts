export declare function getOrCreateConversation(churchId: string, userId?: string, visitorId?: string): Promise<string>;
export declare function sendChatMessage(churchId: string, conversationId: string, userMessage: string): Promise<string>;
export declare function getConversationHistory(churchId: string, conversationId: string): Promise<any[]>;
//# sourceMappingURL=chat.service.d.ts.map