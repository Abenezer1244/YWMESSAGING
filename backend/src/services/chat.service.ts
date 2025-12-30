import { getTenantPrisma, getRegistryPrisma } from '../lib/tenant-prisma.js';
import { generateChatResponse } from './openai.service.js';

export async function getOrCreateConversation(
  churchId: string,
  userId?: string,
  visitorId?: string
): Promise<string> {
  const tenantPrisma = await getTenantPrisma(churchId);

  // For authenticated users
  if (userId) {
    const existingConversation = await tenantPrisma.chatConversation.findFirst({
      where: { adminId: userId },
      orderBy: { updatedAt: 'desc' },
    });

    if (existingConversation) {
      return existingConversation.id;
    }

    const conversation = await tenantPrisma.chatConversation.create({
      data: { adminId: userId },
    });
    return conversation.id;
  }

  // For public visitors
  if (visitorId) {
    const existingConversation = await tenantPrisma.chatConversation.findFirst({
      where: { visitorId },
      orderBy: { updatedAt: 'desc' },
    });

    if (existingConversation) {
      return existingConversation.id;
    }

    const conversation = await tenantPrisma.chatConversation.create({
      data: { visitorId },
    });
    return conversation.id;
  }

  throw new Error('userId or visitorId required');
}

export async function sendChatMessage(churchId: string, conversationId: string, userMessage: string): Promise<string> {
  const tenantPrisma = await getTenantPrisma(churchId);

  // Save user message
  await tenantPrisma.chatMessage.create({
    data: {
      conversationId,
      role: 'user',
      content: userMessage,
    },
  });

  // Get conversation history
  const messages = await tenantPrisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });

  // Generate AI response
  const assistantResponse = await generateChatResponse(
    messages.map(m => ({
      role: m.role,
      content: m.content,
    }))
  );

  // Save assistant message
  await tenantPrisma.chatMessage.create({
    data: {
      conversationId,
      role: 'assistant',
      content: assistantResponse,
    },
  });

  // Update conversation timestamp
  await tenantPrisma.chatConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return assistantResponse;
}

export async function getConversationHistory(churchId: string, conversationId: string): Promise<any[]> {
  const tenantPrisma = await getTenantPrisma(churchId);
  return tenantPrisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });
}
