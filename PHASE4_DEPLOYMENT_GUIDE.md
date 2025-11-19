# Phase 4 Deployment Guide - Campaign Auto-Creation

**Date:** November 19, 2025
**Status:** Ready for Deployment

---

## What's Being Deployed

1. **Campaign Auto-Creation Function** (`createCampaignAsync`)
   - Automatically creates campaigns when brands are verified
   - Configures CTIA/TCPA compliance keywords
   - Provides sample messages for testing

2. **Enhanced Webhook Handlers**
   - Triggers campaign creation on brand verification
   - Tracks campaign approval status
   - Stores campaign ID in database

3. **Database Schema Updates**
   - `tcrBrandId` - Registry brand ID
   - `dlcCampaignId` - Campaign ID tracking
   - `dlcCampaignStatus` - Campaign approval stage

---

## Deployment Steps

### Step 1: Commit Changes to Git

```bash
cd /path/to/YWMESSAGING

git add backend/src/jobs/10dlc-registration.ts
git add backend/src/jobs/10dlc-webhooks.ts
git add backend/prisma/schema.prisma
git add backend/prisma/migrations/20251119_add_campaign_tracking/

git commit -m "feat: Implement campaign auto-creation and opt-in/out configuration

- Add createCampaignAsync() function for automatic campaign creation
- Auto-configure opt-in (START, JOIN) and opt-out (STOP, UNSUBSCRIBE) keywords
- Integrate campaign creation with brand verification webhook
- Add database fields: dlcCampaignId, tcrBrandId, dlcCampaignStatus
- Create Prisma migration for schema updates
- Update campaign status monitoring in webhooks
- TypeScript compilation: ZERO ERRORS"
```

### Step 2: Push to Production

```bash
git push origin main
```

Render will automatically deploy from the main branch.

**Expected Timeline:**
- Build: 2-3 minutes
- Deployment: 1-2 minutes
- Total: ~5 minutes

### Step 3: Verify Deployment

Check that the backend is running:
```bash
curl https://connect-yw-backend.onrender.com/api/webhooks/10dlc/status
```

Expected response:
```json
{
  "status": "ok",
  "message": "Telnyx 10DLC webhook endpoint is healthy",
  "timestamp": "2025-11-19T..."
}
```

### Step 4: Run Database Migration

**Option A: Using Render Dashboard (Recommended)**

1. Go to: https://dashboard.render.com/
2. Select service: `connect-yw-backend`
3. Go to: **Settings** → **Shell** tab
4. Run command:
   ```
   npx prisma migrate deploy
   ```
5. Watch output until you see: `Migration completed successfully`

**Option B: Automatic Migration (if configured)**

If you've set up Render to auto-run migrations on deploy:
- Migration runs automatically during deployment
- Check deployment logs to confirm success
- Look for: `Migration X of Y completed`

---

## Verification Checklist

After deployment, verify everything is working:

### ✅ Endpoint Health

```bash
curl https://connect-yw-backend.onrender.com/api/webhooks/10dlc/status
```

Should return 200 OK.

### ✅ Database Schema

In your database client, run:
```sql
-- Check new columns exist
SELECT
  dlcBrandId,
  tcrBrandId,
  dlcCampaignId,
  dlcCampaignStatus,
  dlcStatus
FROM "Church"
LIMIT 1;
```

All columns should be present (may be NULL for existing churches).

### ✅ Check Logs

1. Go to Render Dashboard: https://dashboard.render.com/
2. Select `connect-yw-backend` service
3. Click **Logs** tab
4. Look for messages like:
   ```
   ✅ Prisma Client generated
   ✅ Server started
   ```

---

## Testing Campaign Creation

### Scenario: Test Brand Verification → Campaign Creation

**Step 1: Simulate Brand Verification Webhook**

Send a webhook as if Telnyx had verified a brand:

```bash
curl -X POST https://connect-yw-backend.onrender.com/api/webhooks/10dlc/status \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "event_type": "10dlc.brand.update",
      "id": "test-webhook-123",
      "occurred_at": "2025-11-19T12:00:00Z",
      "payload": {
        "type": "TCR_BRAND_WEBHOOK",
        "eventType": "BRAND_ADD",
        "brandId": "test-brand-id-12345",
        "tcrBrandId": "BBRAND999",
        "status": "OK",
        "identityStatus": "VERIFIED"
      }
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Webhook accepted for processing",
  "eventType": "10dlc.brand.update"
}
```

**Step 2: Check Render Logs**

1. Go to Render Dashboard
2. Watch logs for campaign creation:
   ```
   📨 Received Telnyx webhook: 10dlc.brand.update
   ✅ Brand verified and ready! Setting up campaign...
   📋 Starting campaign creation for church: [churchId]
   📤 Creating campaign for [churchName]
   ✅ Campaign created: [campaignId]
   ✅ Campaign [campaignId] created for [churchName]
   ```

**Step 3: Verify Database Update**

```sql
SELECT
  id,
  name,
  dlcStatus,
  dlcCampaignId
FROM "Church"
WHERE dlcBrandId = 'test-brand-id-12345';
```

Should show:
- `dlcStatus = 'campaign_pending'`
- `dlcCampaignId = '[campaignId from logs]'`

---

## Rollback Plan

If something goes wrong, you can rollback quickly:

### Option A: Revert Code (if deployment failed)

```bash
git revert HEAD
git push origin main
```

Render will redeploy with previous code.

### Option B: Rollback Database Schema

If the migration causes issues:

```sql
-- Drop new columns (removes campaign tracking)
ALTER TABLE "Church" DROP COLUMN "tcrBrandId";
ALTER TABLE "Church" DROP COLUMN "dlcCampaignId";
ALTER TABLE "Church" DROP COLUMN "dlcCampaignStatus";
```

Note: This loses campaign tracking until redeployed correctly.

---

## Monitoring After Deployment

### Key Metrics to Watch

1. **Webhook Processing**
   - Should see logs for each webhook received
   - Response time should be < 100ms

2. **Campaign Creation**
   - Should see logs starting 10-20 seconds after brand webhook
   - Should see "Campaign created" log with campaign ID

3. **Error Rates**
   - Should be 0 errors in logs
   - Any errors indicate misconfiguration

### Alert Rules (Optional)

Set up Render alerts:
1. Go to Render Dashboard
2. Select `connect-yw-backend`
3. Go to **Settings** → **Notifications**
4. Set up alerts for:
   - Deployment failures
   - Service restarts
   - High memory usage

---

## Troubleshooting

### Problem: "Campaign creation failed"

**Check:**
1. TELNYX_API_KEY is set in Render environment
2. Brand exists in Telnyx account
3. Church record exists in database

**Solution:**
```bash
# Verify API key
curl -X GET https://api.telnyx.com/v2/10dlc/brand \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  | head -20
```

### Problem: Webhook not triggering campaign

**Check:**
1. Brand status webhook was received
2. Status is 'OK' and identityStatus is 'VERIFIED'
3. Church record exists in database

**Solution:**
- Resend webhook manually (see Testing section)
- Check logs for error message
- Verify payload structure matches expected format

### Problem: Database migration failed

**Check:**
1. You have database access
2. PostgreSQL is running
3. Schema.prisma matches actual database

**Solution:**
```bash
# Check migration status
npx prisma migrate status

# If stuck, mark as applied
npx prisma migrate resolve --applied 20251119_add_campaign_tracking
```

---

## Support Contacts

If deployment issues occur:

1. **Check Render Logs** - Most issues visible in logs
2. **Verify API Keys** - Ensure TELNYX_API_KEY is set
3. **Verify Database** - Ensure PostgreSQL is accessible
4. **Check Network** - Ensure webhooks can reach endpoint

---

## Timeline

| Phase | Est. Time | Status |
|-------|-----------|--------|
| **Phase 1:** Brand Registration | ✅ Done | Deployed & working |
| **Phase 2:** Webhook Support | ✅ Done | Deployed & working |
| **Phase 3:** Webhook Endpoints | ✅ Done | Deployed & working |
| **Phase 4:** Campaign Auto-Creation | ✅ Ready | Deploying now |
| **Phase 5:** Notifications | ⏳ Planned | 2-3 hours |
| **Phase 6:** Phone Assignment | ⏳ Planned | 1-2 hours |
| **Phase 7:** Messaging Integration | ⏳ Planned | 1-2 hours |
| **Phase 8:** Admin Dashboard | ⏳ Planned | 3-4 hours |

---

## Success Criteria

Phase 4 deployment is successful when:

✅ Code deploys without errors
✅ Webhook endpoint remains healthy
✅ New database columns exist
✅ Campaign creation logs appear when brand is verified
✅ Campaign ID is stored in database
✅ No errors in production logs

---

## Next Steps

Once Phase 4 is verified working in production:

1. ⏳ **Phase 5:** Set up notification system (email alerts for status changes)
2. ⏳ **Phase 6:** Implement phone number assignment automation
3. ⏳ **Phase 7:** Integrate with messaging profiles
4. ⏳ **Phase 8:** Build admin dashboard for visibility

---

**Deployment Status:** Ready ✅
**All Systems:** Green ✅
**Go/No-Go Decision:** GO ✅
