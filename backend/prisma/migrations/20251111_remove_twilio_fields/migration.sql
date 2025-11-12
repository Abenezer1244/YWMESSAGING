-- Remove all Twilio-related columns from the database
-- Since the app hasn't launched yet, we can safely drop these

ALTER TABLE "Church" DROP COLUMN IF EXISTS "twilioAccountSid";
ALTER TABLE "Church" DROP COLUMN IF EXISTS "twilioAuthToken";
ALTER TABLE "Church" DROP COLUMN IF EXISTS "twilioPhoneNumber";
ALTER TABLE "Church" DROP COLUMN IF EXISTS "twilioVerified";

-- Rename twilioMessageSid to providerMessageId (generic name for any SMS provider)
ALTER TABLE "MessageRecipient" DROP COLUMN IF EXISTS "twilioMessageSid";
ALTER TABLE "MessageRecipient" ADD COLUMN IF NOT EXISTS "providerMessageId" TEXT;
