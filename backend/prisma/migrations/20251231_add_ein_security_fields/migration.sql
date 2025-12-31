-- AddEINSecurityFields
-- Add security audit fields for EIN encryption tracking

-- Add EIN security fields to Church model
ALTER TABLE "Church" ADD COLUMN IF NOT EXISTS "einHash" TEXT;
ALTER TABLE "Church" ADD COLUMN IF NOT EXISTS "einEncryptedAt" TIMESTAMP(3);
ALTER TABLE "Church" ADD COLUMN IF NOT EXISTS "einAccessedAt" TIMESTAMP(3);
ALTER TABLE "Church" ADD COLUMN IF NOT EXISTS "einAccessedBy" TEXT;

-- Add comment to document EIN field is now encrypted
COMMENT ON COLUMN "Church"."ein" IS 'SECURITY: Encrypted using AES-256-GCM. Format: iv:salt:encrypted:tag';
COMMENT ON COLUMN "Church"."einHash" IS 'SHA-256 hash for validation without decryption';
COMMENT ON COLUMN "Church"."einEncryptedAt" IS 'Timestamp when EIN was encrypted';
COMMENT ON COLUMN "Church"."einAccessedAt" IS 'Last access timestamp for audit trail';
COMMENT ON COLUMN "Church"."einAccessedBy" IS 'User ID who last accessed EIN for audit trail';

-- Create index for einHash for fast lookups
CREATE INDEX IF NOT EXISTS "Church_einHash_idx" ON "Church"("einHash");
