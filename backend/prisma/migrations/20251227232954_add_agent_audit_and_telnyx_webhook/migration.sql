-- DropIndex
DROP INDEX "Church_entityType_idx";

-- DropIndex
DROP INDEX "Church_vertical_idx";

-- DropIndex
DROP INDEX "Conversation_churchId_lastMessageAt_idx";

-- DropIndex
DROP INDEX "ConversationMessage_conversationId_createdAt_idx";

-- DropIndex
DROP INDEX "Member_phone_idx";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "emailHash" TEXT,
ADD COLUMN     "encryptedEmail" TEXT;

-- AlterTable
ALTER TABLE "Church" ADD COLUMN     "dlcCampaignSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dlcCampaignSuspendedAt" TIMESTAMP(3),
ADD COLUMN     "dlcCampaignSuspendedReason" TEXT,
ADD COLUMN     "dlcNumberAssignedAt" TIMESTAMP(3),
ADD COLUMN     "telnyxWebhookId" TEXT,
ADD COLUMN     "wantsPremiumDelivery" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "emailHash" TEXT,
ADD COLUMN     "encryptedEmail" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "billingCycle" TEXT NOT NULL DEFAULT 'monthly';

-- CreateTable
CREATE TABLE "PlanningCenterIntegration" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "memberSyncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "serviceSyncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "lastSyncAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanningCenterIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageQueue" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaS3Url" TEXT,
    "conversationMessageId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentAudit" (
    "id" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "githubPrNumber" INTEGER,
    "githubBranch" TEXT,
    "status" TEXT NOT NULL,
    "findings" TEXT NOT NULL DEFAULT '[]',
    "recommendations" TEXT NOT NULL DEFAULT '[]',
    "severity" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentLog" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "memberId" TEXT,
    "adminId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountDeletionRequest" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "initiatedBy" TEXT NOT NULL,
    "confirmationToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduledDeletionAt" TIMESTAMP(3) NOT NULL,
    "actualDeletionAt" TIMESTAMP(3),
    "reason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountDeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataExport" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DataExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminMFA" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "totpSecret" TEXT NOT NULL,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "backupCodesUsed" TEXT NOT NULL DEFAULT '[]',
    "enabledAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminMFA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MFARecoveryCode" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MFARecoveryCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NPSSurvey" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "responderId" TEXT,
    "score" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "feedback" TEXT,
    "sentiment" TEXT,
    "followupEmail" TEXT,
    "followupSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NPSSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeadLetterQueue" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "churchId" TEXT,
    "externalId" TEXT,
    "originalPayload" JSONB NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "errorStack" TEXT,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "firstAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeadLetterQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingProgress" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanningCenterIntegration_churchId_key" ON "PlanningCenterIntegration"("churchId");

-- CreateIndex
CREATE INDEX "PlanningCenterIntegration_churchId_idx" ON "PlanningCenterIntegration"("churchId");

-- CreateIndex
CREATE INDEX "PlanningCenterIntegration_isEnabled_idx" ON "PlanningCenterIntegration"("isEnabled");

-- CreateIndex
CREATE INDEX "PlanningCenterIntegration_syncStatus_idx" ON "PlanningCenterIntegration"("syncStatus");

-- CreateIndex
CREATE INDEX "PlanningCenterIntegration_lastSyncAt_idx" ON "PlanningCenterIntegration"("lastSyncAt");

-- CreateIndex
CREATE INDEX "MessageQueue_churchId_idx" ON "MessageQueue"("churchId");

-- CreateIndex
CREATE INDEX "MessageQueue_status_idx" ON "MessageQueue"("status");

-- CreateIndex
CREATE INDEX "MessageQueue_createdAt_idx" ON "MessageQueue"("createdAt");

-- CreateIndex
CREATE INDEX "AgentAudit_agentType_idx" ON "AgentAudit"("agentType");

-- CreateIndex
CREATE INDEX "AgentAudit_eventType_idx" ON "AgentAudit"("eventType");

-- CreateIndex
CREATE INDEX "AgentAudit_status_idx" ON "AgentAudit"("status");

-- CreateIndex
CREATE INDEX "AgentAudit_severity_idx" ON "AgentAudit"("severity");

-- CreateIndex
CREATE INDEX "AgentAudit_createdAt_idx" ON "AgentAudit"("createdAt");

-- CreateIndex
CREATE INDEX "ConsentLog_churchId_idx" ON "ConsentLog"("churchId");

-- CreateIndex
CREATE INDEX "ConsentLog_memberId_idx" ON "ConsentLog"("memberId");

-- CreateIndex
CREATE INDEX "ConsentLog_adminId_idx" ON "ConsentLog"("adminId");

-- CreateIndex
CREATE INDEX "ConsentLog_type_idx" ON "ConsentLog"("type");

-- CreateIndex
CREATE INDEX "ConsentLog_createdAt_idx" ON "ConsentLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AccountDeletionRequest_churchId_key" ON "AccountDeletionRequest"("churchId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountDeletionRequest_confirmationToken_key" ON "AccountDeletionRequest"("confirmationToken");

-- CreateIndex
CREATE INDEX "AccountDeletionRequest_churchId_idx" ON "AccountDeletionRequest"("churchId");

-- CreateIndex
CREATE INDEX "AccountDeletionRequest_confirmationToken_idx" ON "AccountDeletionRequest"("confirmationToken");

-- CreateIndex
CREATE INDEX "AccountDeletionRequest_status_idx" ON "AccountDeletionRequest"("status");

-- CreateIndex
CREATE INDEX "AccountDeletionRequest_scheduledDeletionAt_idx" ON "AccountDeletionRequest"("scheduledDeletionAt");

-- CreateIndex
CREATE INDEX "DataExport_churchId_idx" ON "DataExport"("churchId");

-- CreateIndex
CREATE INDEX "DataExport_expiresAt_idx" ON "DataExport"("expiresAt");

-- CreateIndex
CREATE INDEX "DataExport_status_idx" ON "DataExport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AdminMFA_adminId_key" ON "AdminMFA"("adminId");

-- CreateIndex
CREATE INDEX "AdminMFA_adminId_idx" ON "AdminMFA"("adminId");

-- CreateIndex
CREATE INDEX "AdminMFA_mfaEnabled_idx" ON "AdminMFA"("mfaEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "MFARecoveryCode_code_key" ON "MFARecoveryCode"("code");

-- CreateIndex
CREATE INDEX "MFARecoveryCode_adminId_idx" ON "MFARecoveryCode"("adminId");

-- CreateIndex
CREATE INDEX "MFARecoveryCode_usedAt_idx" ON "MFARecoveryCode"("usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MFARecoveryCode_adminId_index_key" ON "MFARecoveryCode"("adminId", "index");

-- CreateIndex
CREATE INDEX "NPSSurvey_churchId_idx" ON "NPSSurvey"("churchId");

-- CreateIndex
CREATE INDEX "NPSSurvey_score_idx" ON "NPSSurvey"("score");

-- CreateIndex
CREATE INDEX "NPSSurvey_sentiment_idx" ON "NPSSurvey"("sentiment");

-- CreateIndex
CREATE INDEX "NPSSurvey_category_idx" ON "NPSSurvey"("category");

-- CreateIndex
CREATE INDEX "NPSSurvey_createdAt_idx" ON "NPSSurvey"("createdAt");

-- CreateIndex
CREATE INDEX "NPSSurvey_responderId_idx" ON "NPSSurvey"("responderId");

-- CreateIndex
CREATE INDEX "DeadLetterQueue_status_idx" ON "DeadLetterQueue"("status");

-- CreateIndex
CREATE INDEX "DeadLetterQueue_category_idx" ON "DeadLetterQueue"("category");

-- CreateIndex
CREATE INDEX "DeadLetterQueue_churchId_idx" ON "DeadLetterQueue"("churchId");

-- CreateIndex
CREATE INDEX "DeadLetterQueue_externalId_idx" ON "DeadLetterQueue"("externalId");

-- CreateIndex
CREATE INDEX "DeadLetterQueue_createdAt_idx" ON "DeadLetterQueue"("createdAt");

-- CreateIndex
CREATE INDEX "DeadLetterQueue_retryCount_idx" ON "DeadLetterQueue"("retryCount");

-- CreateIndex
CREATE INDEX "OnboardingProgress_churchId_idx" ON "OnboardingProgress"("churchId");

-- CreateIndex
CREATE INDEX "OnboardingProgress_completed_idx" ON "OnboardingProgress"("completed");

-- CreateIndex
CREATE INDEX "OnboardingProgress_completedAt_idx" ON "OnboardingProgress"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingProgress_churchId_taskId_key" ON "OnboardingProgress"("churchId", "taskId");

-- CreateIndex
CREATE INDEX "Admin_churchId_role_idx" ON "Admin"("churchId", "role");

-- CreateIndex
CREATE INDEX "Admin_emailHash_idx" ON "Admin"("emailHash");

-- CreateIndex
CREATE INDEX "Church_telnyxPhoneNumber_idx" ON "Church"("telnyxPhoneNumber");

-- CreateIndex
CREATE INDEX "Conversation_churchId_lastMessageAt_idx" ON "Conversation"("churchId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "ConversationMessage_conversationId_createdAt_idx" ON "ConversationMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "ConversationMessage_direction_conversationId_idx" ON "ConversationMessage"("direction", "conversationId");

-- CreateIndex
CREATE INDEX "Group_id_churchId_idx" ON "Group"("id", "churchId");

-- CreateIndex
CREATE INDEX "Member_emailHash_idx" ON "Member"("emailHash");

-- CreateIndex
CREATE INDEX "Member_phoneHash_idx" ON "Member"("phoneHash");

-- CreateIndex
CREATE INDEX "Member_createdAt_idx" ON "Member"("createdAt");

-- CreateIndex
CREATE INDEX "Subscription_billingCycle_idx" ON "Subscription"("billingCycle");

-- AddForeignKey
ALTER TABLE "PlanningCenterIntegration" ADD CONSTRAINT "PlanningCenterIntegration_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminMFA" ADD CONSTRAINT "AdminMFA_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NPSSurvey" ADD CONSTRAINT "NPSSurvey_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingProgress" ADD CONSTRAINT "OnboardingProgress_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
