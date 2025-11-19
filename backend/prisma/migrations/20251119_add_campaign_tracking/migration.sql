-- Add campaign tracking fields to Church model
ALTER TABLE "Church" ADD COLUMN "tcrBrandId" TEXT;
ALTER TABLE "Church" ADD COLUMN "dlcCampaignId" TEXT;
ALTER TABLE "Church" ADD COLUMN "dlcCampaignStatus" TEXT;
