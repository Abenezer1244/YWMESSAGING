-- Add 10DLC fields to Church table
ALTER TABLE "Church" ADD COLUMN "dlcBrandId" TEXT,
ADD COLUMN "dlcStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN "dlcRegisteredAt" TIMESTAMP(3),
ADD COLUMN "dlcApprovedAt" TIMESTAMP(3),
ADD COLUMN "dlcRejectionReason" TEXT,
ADD COLUMN "dlcNextCheckAt" TIMESTAMP(3),
ADD COLUMN "usingSharedBrand" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "deliveryRate" DOUBLE PRECISION NOT NULL DEFAULT 0.65;

-- Add indexes for 10DLC queries
CREATE INDEX "Church_dlcStatus_idx" ON "Church"("dlcStatus");
CREATE INDEX "Church_dlcNextCheckAt_idx" ON "Church"("dlcNextCheckAt");
