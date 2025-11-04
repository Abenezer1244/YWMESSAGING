-- CreateTable Church
CREATE TABLE IF NOT EXISTS "Church" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "twilioAccountSid" TEXT,
    "twilioAuthToken" TEXT,
    "twilioPhoneNumber" TEXT,
    "twilioVerified" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3) NOT NULL,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'trial',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Church_pkey" PRIMARY KEY ("id")
);

-- CreateTable Branch
CREATE TABLE IF NOT EXISTS "Branch" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable Group
CREATE TABLE IF NOT EXISTS "Group" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "welcomeMessageEnabled" BOOLEAN NOT NULL DEFAULT false,
    "welcomeMessageText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable Member
CREATE TABLE IF NOT EXISTS "Member" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneHash" TEXT,
    "email" TEXT,
    "optInSms" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- Backfill phoneHash for existing members with placeholder to prevent NULL uniqueness issues
DO $$
DECLARE
    v_member_id TEXT;
    v_counter INT := 1;
BEGIN
    FOR v_member_id IN SELECT "id" FROM "Member" WHERE "phoneHash" IS NULL LOOP
        UPDATE "Member" SET "phoneHash" = 'placeholder_' || v_counter WHERE "id" = v_member_id;
        v_counter := v_counter + 1;
    END LOOP;
END $$;

-- CreateTable GroupMember
CREATE TABLE IF NOT EXISTS "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "welcomeMessageSent" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable Message
CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "targetType" TEXT NOT NULL,
    "targetIds" TEXT NOT NULL DEFAULT '',
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable MessageRecipient
CREATE TABLE IF NOT EXISTS "MessageRecipient" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "twilioMessageSid" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,

    CONSTRAINT "MessageRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable MessageTemplate
CREATE TABLE IF NOT EXISTS "MessageTemplate" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable RecurringMessage
CREATE TABLE IF NOT EXISTS "RecurringMessage" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetIds" TEXT NOT NULL DEFAULT '',
    "frequency" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "timeOfDay" TEXT,
    "nextSendAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable Admin
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CO_ADMIN',
    "invitationToken" TEXT,
    "invitationExpiresAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable Subscription
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "stripeSubId" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'starter',
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable AnalyticsEvent
CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "churchId" TEXT,
    "eventName" TEXT NOT NULL,
    "properties" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Church_email_key" ON "Church"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Church_stripeCustomerId_key" ON "Church"("stripeCustomerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Church_subscriptionStatus_idx" ON "Church"("subscriptionStatus");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Church_trialEndsAt_idx" ON "Church"("trialEndsAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Branch_churchId_idx" ON "Branch"("churchId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Branch_isActive_idx" ON "Branch"("isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Group_branchId_idx" ON "Group"("branchId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Group_churchId_idx" ON "Group"("churchId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Member_phone_idx" ON "Member"("phone");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Member_email_idx" ON "Member"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GroupMember_groupId_idx" ON "GroupMember"("groupId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GroupMember_memberId_idx" ON "GroupMember"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "GroupMember_groupId_memberId_key" ON "GroupMember"("groupId", "memberId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Message_churchId_idx" ON "Message"("churchId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Message_status_idx" ON "Message"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Message_sentAt_idx" ON "Message"("sentAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MessageRecipient_messageId_idx" ON "MessageRecipient"("messageId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MessageRecipient_memberId_idx" ON "MessageRecipient"("memberId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MessageRecipient_status_idx" ON "MessageRecipient"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MessageRecipient_messageId_memberId_key" ON "MessageRecipient"("messageId", "memberId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MessageTemplate_churchId_idx" ON "MessageTemplate"("churchId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MessageTemplate_category_idx" ON "MessageTemplate"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RecurringMessage_churchId_idx" ON "RecurringMessage"("churchId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RecurringMessage_isActive_idx" ON "RecurringMessage"("isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RecurringMessage_nextSendAt_idx" ON "RecurringMessage"("nextSendAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Admin_churchId_idx" ON "Admin"("churchId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Admin_role_idx" ON "Admin"("role");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_churchId_key" ON "Subscription"("churchId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeSubId_key" ON "Subscription"("stripeSubId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Subscription_plan_idx" ON "Subscription"("plan");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_churchId_idx" ON "AnalyticsEvent"("churchId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_eventName_idx" ON "AnalyticsEvent"("eventName");

-- AddForeignKey (with error handling for existing constraints)
DO $$
BEGIN
    ALTER TABLE "Branch" ADD CONSTRAINT "Branch_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "Group" ADD CONSTRAINT "Group_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "Group" ADD CONSTRAINT "Group_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "Message" ADD CONSTRAINT "Message_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "MessageRecipient" ADD CONSTRAINT "MessageRecipient_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "MessageRecipient" ADD CONSTRAINT "MessageRecipient_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "RecurringMessage" ADD CONSTRAINT "RecurringMessage_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "Admin" ADD CONSTRAINT "Admin_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
