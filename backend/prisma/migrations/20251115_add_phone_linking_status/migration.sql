-- Phase 2: Enterprise phone number linking status tracking
-- Adds fields to track automatic linking attempts and status for recovery

ALTER TABLE "Church" ADD COLUMN "telnyxPhoneLinkingStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Church" ADD COLUMN "telnyxPhoneLinkingLastAttempt" TIMESTAMP(3);
ALTER TABLE "Church" ADD COLUMN "telnyxPhoneLinkingRetryCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Church" ADD COLUMN "telnyxPhoneLinkingError" TEXT;

-- Create index for efficient querying of churches that need linking
CREATE INDEX "Church_telnyxPhoneLinkingStatus_idx" ON "Church"("telnyxPhoneLinkingStatus");
