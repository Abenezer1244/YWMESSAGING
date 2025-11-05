import prisma from '../config/prisma.config.js';
import { generateChatResponse } from './openai.service.js';

export async function getOrCreateConversation(
  userId?: string,
  visitorId?: string
): Promise<string> {
  // For authenticated users
  if (userId) {
    const existingConversation = await prisma.chatConversation.findFirst({
      where: { adminId: userId },
      orderBy: { updatedAt: 'desc' },
    });

    if (existingConversation) {
      return existingConversation.id;
    }

    const conversation = await prisma.chatConversation.create({
      data: { adminId: userId },
    });
    return conversation.id;
  }

  // For public visitors
  if (visitorId) {
    const existingConversation = await prisma.chatConversation.findFirst({
      where: { visitorId },
      orderBy: { updatedAt: 'desc' },
    });

    if (existingConversation) {
      return existingConversation.id;
    }

    const conversation = await prisma.chatConversation.create({
      data: { visitorId },
    });
    return conversation.id;
  }

  throw new Error('userId or visitorId required');
}

export async function sendChatMessage(conversationId: string, userMessage: string): Promise<string> {
  // Save user message
  await prisma.chatMessage.create({
    data: {
      conversationId,
      role: 'user',
      content: userMessage,
    },
  });

  // Get conversation history
  const messages = await prisma.chatMessage.findMany({
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
  await prisma.chatMessage.create({
    data: {
      conversationId,
      role: 'assistant',
      content: assistantResponse,
    },
  });

  // Update conversation timestamp
  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return assistantResponse;
}

export async function getConversationHistory(conversationId: string): Promise<any[]> {
  return prisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });
}
