-- Step 1: Add new Telnyx columns to Church table (keep Twilio fields for backward compatibility)
ALTER TABLE "Church" ADD COLUMN "telnyxPhoneNumber" TEXT;
ALTER TABLE "Church" ADD COLUMN "telnyxNumberSid" TEXT UNIQUE;
ALTER TABLE "Church" ADD COLUMN "telnyxVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Church" ADD COLUMN "telnyxPurchasedAt" TIMESTAMP(3);

-- Step 2: Create ChatConversation table
CREATE TABLE IF NOT EXISTS "ChatConversation" (
    "id" TEXT NOT NULL,
    "churchId" TEXT,
    "adminId" TEXT,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create ChatMessage table
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- Step 4: Create indexes for ChatConversation
CREATE INDEX IF NOT EXISTS "ChatConversation_churchId_idx" ON "ChatConversation"("churchId");
CREATE INDEX IF NOT EXISTS "ChatConversation_adminId_idx" ON "ChatConversation"("adminId");
CREATE INDEX IF NOT EXISTS "ChatConversation_visitorId_idx" ON "ChatConversation"("visitorId");

-- Step 5: Create indexes for ChatMessage
CREATE INDEX IF NOT EXISTS "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");

-- Step 6: Add foreign key constraint for ChatMessage
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
