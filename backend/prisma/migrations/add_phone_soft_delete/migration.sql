-- AlterTable: Add soft-delete fields for phone number management
ALTER TABLE "Church" ADD COLUMN "telnyxNumberStatus" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "Church" ADD COLUMN "telnyxNumberDeletedAt" TIMESTAMP(3);
ALTER TABLE "Church" ADD COLUMN "telnyxNumberDeletedBy" TEXT;
ALTER TABLE "Church" ADD COLUMN "telnyxNumberRecoveryDeadline" TIMESTAMP(3);

-- CreateIndex: Add indexes for soft-delete operations
CREATE INDEX "Church_telnyxNumberStatus_idx" ON "Church"("telnyxNumberStatus");
CREATE INDEX "Church_telnyxNumberRecoveryDeadline_idx" ON "Church"("telnyxNumberRecoveryDeadline");
