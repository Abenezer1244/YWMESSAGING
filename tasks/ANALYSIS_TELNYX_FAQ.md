# Analysis: Telnyx 10DLC FAQ vs Our Implementation

**Date:** November 18, 2025
**Status:** 🔍 Important Discovery - May affect API strategy

---

## Key Insight from Telnyx FAQ

The FAQ reveals the **actual 10DLC registration process** is more complex than just creating a brand:

### The Real 10DLC Process (From FAQ)

```
Step 1: Register a Brand
        ↓
Step 2: (Optional but recommended) Vet the Brand
        ↓
Step 3: Register a Campaign
        ↓
Step 4: Assign numbers to the campaign
        ↓
Step 5: Await manual review from TCR (The Campaign Registry)
        ↓
Step 6: Send traffic under those campaign numbers
```

### What We Currently Do

```
POST /a2p_brands  ← Trying to do Step 1 only
```

### What We're Missing

- ❌ Campaign registration (Step 3)
- ❌ Number assignment to campaign (Step 4)
- ❌ Waiting for TCR manual review (Step 5)

---

## Critical Discovery: Brand vs Campaign Relationship

**From the FAQ:**

> "A Brand can have multiple Campaigns, with a maximum of five Campaigns per Brand."
> "A Campaign can have multiple Numbers."
> "A Number can only be used in one Campaign and its parent Brand."

**This means:**
1. Brand is created first (organization/company level)
2. Campaign is created under Brand (specific use case level)
3. Numbers are assigned to Campaign (phone number level)

**Our current code:** Only tries to create Brand, doesn't create Campaign or assign numbers

---

## Questions This Raises

1. **Is `/a2p_brands` for creating Brands in the 10DLC process?**
   - Or is it something else entirely?

2. **Is there a separate `/a2p_campaigns` endpoint?**
   - Or `POST /brands/{brandId}/campaigns`?

3. **How do we assign numbers to campaigns via API?**
   - `POST /campaigns/{campaignId}/numbers`?
   - `PATCH /phone_numbers/{numberId}`?

4. **Does the FAQ's manual steps match what the API should do?**
   - Or is the API different from the manual process?

---

## What Telnyx FAQ Tells Us (Important Context)

### Brand Requirements
```
✅ One Brand per EIN (Employer Identification Number)
✅ You can create multiple Campaigns per Brand (max 5)
✅ Brands can be non-US entities
✅ Each Brand needs a name and company details
```

### Campaign Requirements
```
✅ Multiple Campaigns per Brand
✅ Each Campaign has a specific Use Case
✅ Use Cases: 2FA, Marketing, Notifications, Political, etc.
✅ Campaign can be "Mixed" (multiple sub-use cases)
✅ Each Campaign gets assigned a throughput limit
```

### Number Assignment
```
✅ Each Number assigned to ONE Campaign
✅ ONE Campaign can have multiple Numbers
✅ T-Mobile limit: 49 numbers per Campaign
✅ Daily limit for adding numbers (try again in 1 business day)
```

### Vetting (Important for Throughput)
```
⚠️ Recommended for better throughput (especially Marketing)
⚠️ Creates "Vetting Score" which improves "Brand Tier"
⚠️ Brand Tier affects throughput limits:
   - Top Tier (75-100): 200,000 messages/day (T-Mobile)
   - Low Tier (1-24): 2,000 messages/day (T-Mobile)
```

---

## Important Timeline Alert

From FAQ:
> "UPDATE: From February 3rd 2025, any 10DLC traffic which is not registered will be blocked altogether."

**This is CRITICAL:**
- 📅 Current date: November 18, 2025
- ⏰ Deadline: February 3, 2025 (ALREADY PASSED in the FAQ's timeline!)
- 🚨 This might mean the requirement is NOW active or very soon

This suggests 10DLC registration is urgent and mandatory.

---

## What We Need to Ask Telnyx (Updated Questions)

Based on the FAQ, our support email should have asked:

1. **Is `/a2p_brands` the API endpoint for Brand registration?**
   - And what is the full endpoint path including base URL?

2. **What is the Campaign registration endpoint?**
   - Is it `/a2p_campaigns` or something else?
   - How do we create a campaign under a brand via API?

3. **How do we assign numbers to campaigns via API?**
   - Is it a separate endpoint or part of campaign creation?

4. **Can we do the full workflow via API?**
   - Brand → Campaign → Number assignment
   - Or do we need to manually approve/review?

5. **Does the manual review (TCR) happen automatically?**
   - Or do we need to submit something and wait?

6. **What about vetting?**
   - Can we initiate vetting via API?
   - Or is that a manual process?

---

## Current Implementation Gap

**Our Code Does:**
```typescript
POST /a2p_brands {
  company_name: "church name",
  brand_type: "SOLE_PROPRIETOR",
  vertical: "RELIGION",
  // ...
}
```

**But According to FAQ, We Should Also Do:**
```typescript
// Step 1: Register Brand (what we do)
// Step 2: Vet Brand (optional but recommended)
// Step 3: Create Campaign for this Brand
POST /campaigns {
  brand_id: "...",
  use_case: "MIXED" or "NOTIFICATIONS",
  sub_use_cases: [...],
  // ...
}

// Step 4: Assign phone number to campaign
POST /campaigns/{campaignId}/numbers {
  phone_numbers: ["+14253800792"],
  // ...
}

// Step 5: Wait for manual review
// Step 6: Start sending
```

---

## Possible Explanations for 404

1. **`/a2p_brands` is correct, but we're missing the Campaign step**
   - Endpoint works, but there's a second endpoint we need to call

2. **`/a2p_brands` doesn't exist in the current API**
   - Maybe it's `/brands` or `/10dlc_brands` or something else
   - FAQ doesn't specify the exact API endpoint paths

3. **Account doesn't have Campaign registration enabled yet**
   - Maybe Brand registration works but Campaign API isn't available

4. **We're mixing concepts**
   - Maybe "A2P Brands" in the FAQ is different from the API endpoint
   - Need clarification on terminology

---

## Recommended Next Steps

### Option 1: Wait for Telnyx Response (Current)
Our email didn't ask about Campaigns. When they respond, ask:
- "What's the Campaign registration endpoint?"
- "How do we assign numbers to campaigns via API?"

### Option 2: Proactive Research
While waiting, check:
- Telnyx API documentation for "campaigns" endpoint
- Look for example code or postman collections
- Check if Campaign registration can be done via Mission Control Portal

### Option 3: Adjust Our Approach
Maybe we need to:
1. Create Brand via API (`/a2p_brands`)
2. Create Campaign via API or Mission Control Portal (manually)
3. Then assign numbers automatically

---

## Code Implications

**Current implementation assumes:**
- Create brand → Done → Ready to send

**Actual process might be:**
- Create brand → Create campaign → Assign number → Wait for review → Ready to send

**This means our code might need:**
```typescript
// Phase 1: Registration (what we do now)
registerPersonal10DLCAsync() {
  // POST /a2p_brands
  // Get brandId
}

// Phase 2: Campaign Creation (missing!)
createCampaignForBrand(brandId) {
  // POST /campaigns
  // Get campaignId
}

// Phase 3: Number Assignment (missing!)
assignNumberToCampaign(campaignId, phoneNumber) {
  // POST /campaigns/{campaignId}/numbers
}
```

---

## Bottom Line

The **FAQ reveals the full 10DLC process is 6 steps**, but we only coded 1 step.

**Wait for Telnyx response to clarify:**
1. API endpoint paths for each step
2. Which steps can be automated via API
3. Which steps require manual review
4. Timeline for approval

Once they respond, we may need to expand our code to handle the full workflow.

---

## Files for Reference

- **Our current implementation:** `backend/src/jobs/10dlc-registration.ts`
- **Telnyx FAQ:** Provided by user (10DLC FAQs)
- **Support email sent:** `TELNYX_EMAIL_RESPONSE.txt`

---

**Status:** ⏳ Waiting for Telnyx clarification on API endpoints and full workflow
