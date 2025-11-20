# Welcome Modal - Deployment Configuration Fix

## Issue Found

The welcome modal is not appearing after signup because of a **domain/API mismatch** on the Render deployment.

## Root Cause

1. **Frontend** is deployed at: `https://connect-yw-frontend.onrender.com`
2. **Frontend's API configuration** points to: `https://api.koinoniasms.com/api` (old domain)
3. **Backend CORS** at `https://api.koinoniasms.com` only allows requests from `https://koinoniasms.com`
4. **Result**: Registration API calls fail with CORS error → Modal never appears

## Solution

You need to update the frontend's environment variable on Render:

### Step 1: Access Render Dashboard
- Go to https://dashboard.render.com
- Select the **"connect-yw-frontend"** service

### Step 2: Update Environment Variable
- Click **"Environment"** tab
- Find or add the variable: `VITE_API_BASE_URL`
- Set its value to the correct backend URL (one of these):
  - If you have a `connect-yw-backend` service on Render: `https://connect-yw-backend.onrender.com/api`
  - Or if the backend is at a different Render URL: use that instead
  - If still using old backend: keep as `https://api.koinoniasms.com/api`

### Step 3: Redeploy
- Click **"Manual Deploy"** or wait for auto-deploy
- The frontend will redeploy with the correct API URL

## What I Fixed

I've already updated the **backend's CORS configuration** to accept:
- ✅ `https://connect-yw-frontend.onrender.com` (Render frontend)
- ✅ `https://koinoniasms.com` (old main domain)
- ✅ `https://www.koinoniasms.com` (main domain)
- ✅ All localhost development URLs
- ✅ All Render deployment URLs

## Files Changed

- `backend/src/app.ts` - Updated CORS to be more permissive for different deployment scenarios

## Commits

- `d09223a` - Fix: Allow Render frontend domain in backend CORS configuration
- `1b7fc24` - Fix: Allow localhost origins in CORS for local development testing

## Next Steps

1. Update the frontend's `VITE_API_BASE_URL` on Render
2. Redeploy the frontend service
3. Test signup at `https://connect-yw-frontend.onrender.com/register`
4. Welcome modal should now appear ✅

## Testing

After the fix, you can test with:
- **URL**: https://connect-yw-frontend.onrender.com/register
- **Fill form** with test data
- **Submit** and the welcome modal should appear
- **Select role** and click "Continue"
- **Verify** the modal closes and dashboard loads

If still not working:
1. Check browser DevTools → Network tab → look for `POST /auth/register`
2. Verify response status is 200 (not 400 or CORS error)
3. Check the response includes `welcomeCompleted: false`

