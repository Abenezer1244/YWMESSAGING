-- Add phoneHash column to Member table if it doesn't exist
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "phoneHash" TEXT;

-- Create unique index for phoneHash if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS "Member_phoneHash_key" ON "Member"("phoneHash");

-- Create regular index for phoneHash if it doesn't exist
CREATE INDEX IF NOT EXISTS "Member_phoneHash_idx" ON "Member"("phoneHash");
