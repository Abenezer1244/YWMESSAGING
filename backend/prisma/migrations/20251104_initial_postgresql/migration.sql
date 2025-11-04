-- CreateTable Church
CREATE TABLE "Church" (
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
CREATE TABLE "Branch" (
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
CREATE TABLE "Group" (
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
CREATE TABLE "Member" (
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

-- CreateTable GroupMember
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "welcomeMessageSent" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable Message
CREATE TABLE "Message" (
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
CREATE TABLE "MessageRecipient" (
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
CREATE TABLE "MessageTemplate" (
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
CREATE TABLE "RecurringMessage" (
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
CREATE TABLE "Admin" (
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
CREATE TABLE "Subscription" (
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
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "churchId" TEXT,
    "eventName" TEXT NOT NULL,
    "properties" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Church_email_key" ON "Church"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Church_stripeCustomerId_key" ON "Church"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Church_subscriptionStatus_idx" ON "Church"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "Church_trialEndsAt_idx" ON "Church"("trialEndsAt");

-- CreateIndex
CREATE INDEX "Branch_churchId_idx" ON "Branch"("churchId");

-- CreateIndex
CREATE INDEX "Branch_isActive_idx" ON "Branch"("isActive");

-- CreateIndex
CREATE INDEX "Group_branchId_idx" ON "Group"("branchId");

-- CreateIndex
CREATE INDEX "Group_churchId_idx" ON "Group"("churchId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_phone_key" ON "Member"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_phoneHash_key" ON "Member"("phoneHash");

-- CreateIndex
CREATE INDEX "Member_phone_idx" ON "Member"("phone");

-- CreateIndex
CREATE INDEX "Member_email_idx" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_phoneHash_idx" ON "Member"("phoneHash");

-- CreateIndex
CREATE INDEX "GroupMember_groupId_idx" ON "GroupMember"("groupId");

-- CreateIndex
CREATE INDEX "GroupMember_memberId_idx" ON "GroupMember"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_memberId_key" ON "GroupMember"("groupId", "memberId");

-- CreateIndex
CREATE INDEX "Message_churchId_idx" ON "Message"("churchId");

-- CreateIndex
CREATE INDEX "Message_status_idx" ON "Message"("status");

-- CreateIndex
CREATE INDEX "Message_sentAt_idx" ON "Message"("sentAt");

-- CreateIndex
CREATE INDEX "MessageRecipient_messageId_idx" ON "MessageRecipient"("messageId");

-- CreateIndex
CREATE INDEX "MessageRecipient_memberId_idx" ON "MessageRecipient"("memberId");

-- CreateIndex
CREATE INDEX "MessageRecipient_status_idx" ON "MessageRecipient"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MessageRecipient_messageId_memberId_key" ON "MessageRecipient"("messageId", "memberId");

-- CreateIndex
CREATE INDEX "MessageTemplate_churchId_idx" ON "MessageTemplate"("churchId");

-- CreateIndex
CREATE INDEX "MessageTemplate_category_idx" ON "MessageTemplate"("category");

-- CreateIndex
CREATE INDEX "RecurringMessage_churchId_idx" ON "RecurringMessage"("churchId");

-- CreateIndex
CREATE INDEX "RecurringMessage_isActive_idx" ON "RecurringMessage"("isActive");

-- CreateIndex
CREATE INDEX "RecurringMessage_nextSendAt_idx" ON "RecurringMessage"("nextSendAt");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_churchId_idx" ON "Admin"("churchId");

-- CreateIndex
CREATE INDEX "Admin_role_idx" ON "Admin"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_churchId_key" ON "Subscription"("churchId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubId_key" ON "Subscription"("stripeSubId");

-- CreateIndex
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_churchId_idx" ON "AnalyticsEvent"("churchId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventName_idx" ON "AnalyticsEvent"("eventName");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRecipient" ADD CONSTRAINT "MessageRecipient_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRecipient" ADD CONSTRAINT "MessageRecipient_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringMessage" ADD CONSTRAINT "RecurringMessage_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
