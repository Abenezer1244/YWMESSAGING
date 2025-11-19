-- Add 10DLC brand information fields to Church table
-- Required for churches to create their own 10DLC brands with Telnyx
ALTER TABLE "Church" ADD COLUMN "ein" TEXT,
ADD COLUMN "brandPhoneNumber" TEXT,
ADD COLUMN "streetAddress" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "postalCode" TEXT,
ADD COLUMN "website" TEXT,
ADD COLUMN "entityType" TEXT NOT NULL DEFAULT 'NON_PROFIT',
ADD COLUMN "vertical" TEXT NOT NULL DEFAULT 'RELIGION';

-- Add index for entityType lookups
CREATE INDEX "Church_entityType_idx" ON "Church"("entityType");
CREATE INDEX "Church_vertical_idx" ON "Church"("vertical");
