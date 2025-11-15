-- CreateTable Conversation
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable ConversationMessage
CREATE TABLE IF NOT EXISTS "ConversationMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "deliveryStatus" TEXT,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "mediaName" TEXT,
    "mediaSizeBytes" INTEGER,
    "mediaS3Key" TEXT,
    "mediaMimeType" TEXT,
    "mediaWidth" INTEGER,
    "mediaHeight" INTEGER,
    "mediaDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for Conversation
CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_churchId_memberId_key" ON "Conversation"("churchId", "memberId");
CREATE INDEX IF NOT EXISTS "Conversation_churchId_idx" ON "Conversation"("churchId");
CREATE INDEX IF NOT EXISTS "Conversation_memberId_idx" ON "Conversation"("memberId");
CREATE INDEX IF NOT EXISTS "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");
CREATE INDEX IF NOT EXISTS "Conversation_status_idx" ON "Conversation"("status");

-- CreateIndex for ConversationMessage
CREATE INDEX IF NOT EXISTS "ConversationMessage_conversationId_idx" ON "ConversationMessage"("conversationId");
CREATE INDEX IF NOT EXISTS "ConversationMessage_createdAt_idx" ON "ConversationMessage"("createdAt");
CREATE INDEX IF NOT EXISTS "ConversationMessage_direction_idx" ON "ConversationMessage"("direction");
CREATE INDEX IF NOT EXISTS "ConversationMessage_mediaType_idx" ON "ConversationMessage"("mediaType");
CREATE INDEX IF NOT EXISTS "ConversationMessage_providerMessageId_idx" ON "ConversationMessage"("providerMessageId");

-- AddForeignKey
DO $$
BEGIN
    ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
