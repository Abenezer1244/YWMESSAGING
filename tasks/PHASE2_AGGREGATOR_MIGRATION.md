# Phase 2: Growth - Aggregator Migration Plan

**Date:** 2024-10-30  
**Strategy:** Switch to SMS Aggregator (Bandwidth/Telnyx) at 50K+ messages/month  
**Goal:** Better pricing, lower costs, improved margins

---

## 🎯 PHASE 2 OVERVIEW

### When to Switch:
- ✅ You're sending 50K+ messages/month
- ✅ You have consistent volume
- ✅ You want better pricing than Twilio
- ✅ You're ready for volume commitment

### Target Aggregators:
1. **Telnyx** (Recommended - lowest minimum)
2. **Bandwidth** (Best for US, direct carrier connections)
3. **MessageBird** (Good global option)

---

## 📊 AGGREGATOR COMPARISON

### Telnyx ⭐⭐⭐⭐⭐ (Recommended)

**Why:**
- ✅ Lowest minimum (25K messages/month)
- ✅ Very competitive pricing
- ✅ Direct carrier connections
- ✅ Easy integration
- ✅ Good documentation

**Pricing:**
- Phone number: ~$0.50/month
- SMS: ~$0.003-0.005 per message (at scale)
- Setup: $500-$2,000
- Minimum: 25K messages/month

**Features:**
- Direct carrier connections
- Real-time delivery status
- Global coverage
- Good API documentation

---

### Bandwidth ⭐⭐⭐⭐⭐ (Best for US)

**Why:**
- ✅ Direct carrier connections (owns infrastructure)
- ✅ Best pricing at scale
- ✅ Very reliable
- ✅ Good for US market

**Pricing:**
- Phone number: ~$0.50/month
- SMS: ~$0.004-0.006 per message (at scale)
- Setup: $1,000-$5,000
- Minimum: 50K messages/month

**Features:**
- Owns telecom infrastructure
- Direct carrier connections
- A2P messaging support
- Excellent reliability

---

### MessageBird ⭐⭐⭐⭐

**Why:**
- ✅ Global reach
- ✅ Good pricing
- ✅ Omnichannel support

**Pricing:**
- Phone number: ~$0.75/month
- SMS: ~$0.005-0.007 per message
- Setup: $500-$2,000
- Minimum: 25K messages/month

**Features:**
- Global coverage
- Multiple channels
- Good API

---

## 💰 COST SAVINGS ANALYSIS

### Current (Twilio):
- Phone number: $1/month
- SMS: $0.0075 per message
- At 100K messages/month: $750 + $100 = $850/month

### With Telnyx:
- Phone number: $0.50/month
- SMS: $0.004 per message (at 100K/month)
- At 100K messages/month: $400 + $50 = $450/month
- **Savings: $400/month (47% reduction)**

### With Bandwidth:
- Phone number: $0.50/month
- SMS: $0.005 per message (at 100K/month)
- At 100K messages/month: $500 + $50 = $550/month
- **Savings: $300/month (35% reduction)**

**Annual Savings:**
- Telnyx: ~$4,800/year
- Bandwidth: ~$3,600/year

---

## 📋 PREPARATION CHECKLIST

### Before You Switch:

#### 1. Volume Assessment
- [ ] Calculate current messages/month
- [ ] Track growth rate
- [ ] Project 3-6 month volume
- [ ] Confirm you meet 25K-50K minimum

#### 2. Aggregator Evaluation
- [ ] Contact Telnyx for pricing quote
- [ ] Contact Bandwidth for pricing quote
- [ ] Compare to current Twilio costs
- [ ] Evaluate API documentation
- [ ] Check support quality

#### 3. Technical Preparation
- [ ] Review aggregator APIs
- [ ] Plan integration approach
- [ ] Test API in sandbox
- [ ] Prepare migration plan

#### 4. Business Preparation
- [ ] Calculate ROI of switching
- [ ] Plan timeline
- [ ] Budget for setup fees
- [ ] Notify stakeholders

---

## 🔧 TECHNICAL IMPLEMENTATION

### Step 1: Create Aggregator Service

**File: `backend/src/services/telnyx.service.ts`** (or bandwidth.service.ts)

```typescript
import { Telnyx } from 'telnyx'; // or bandwidth SDK
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Telnyx client
const telnyxClient = new Telnyx(process.env.TELNYX_API_KEY);

/**
 * Send SMS via Telnyx
 */
export async function sendSMS(
  to: string,
  message: string,
  churchId: string
): Promise<{ messageSid: string; success: boolean }> {
  // Get church phone number (assigned by you or them)
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: {
      telnyxPhoneNumber: true, // or bandwidthPhoneNumber
    },
  });

  if (!church?.telnyxPhoneNumber) {
    throw new Error('Telnyx phone number not configured');
  }

  try {
    const result = await telnyxClient.messages.create({
      from: church.telnyxPhoneNumber,
      to: to,
      text: message,
    });

    return {
      messageSid: result.id,
      success: true,
    };
  } catch (error) {
    throw new Error(`Telnyx error: ${error.message}`);
  }
}

/**
 * Purchase phone number via Telnyx
 */
export async function purchasePhoneNumber(
  areaCode: string,
  churchId: string
): Promise<string> {
  // Search available numbers
  const availableNumbers = await telnyxClient.phoneNumbers.list({
    filter: { area_code: areaCode },
  });

  if (availableNumbers.data.length === 0) {
    throw new Error('No numbers available in that area code');
  }

  // Purchase number
  const phoneNumber = await telnyxClient.phoneNumbers.create({
    phone_number: availableNumbers.data[0].phone_number,
  });

  // Update church record
  await prisma.church.update({
    where: { id: churchId },
    data: {
      telnyxPhoneNumber: phoneNumber.phone_number,
    },
  });

  return phoneNumber.phone_number;
}
```

### Step 2: Update Database Schema

```prisma
model Church {
  // ... existing fields ...
  
  // New aggregator fields
  telnyxPhoneNumber      String?  // If using Telnyx
  bandwidthPhoneNumber   String?  // If using Bandwidth
  messageBirdPhoneNumber String?  // If using MessageBird
  
  // Aggregator selection
  smsProvider            String?  // "twilio" | "telnyx" | "bandwidth" | "messagebird"
  
  // Keep Twilio for backward compatibility
  twilioAccountSid       String?
  twilioAuthToken        String?
  twilioPhoneNumber      String?
}
```

### Step 3: Update SMS Service to Support Multiple Providers

**File: `backend/src/services/sms.service.ts`**

```typescript
import { sendSMS as twilioSendSMS } from './twilio.service';
import { sendSMS as telnyxSendSMS } from './telnyx.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Unified SMS sending function
 * Routes to correct provider based on church configuration
 */
export async function sendSMS(
  to: string,
  message: string,
  churchId: string
): Promise<{ messageSid: string; success: boolean }> {
  // Get church SMS provider preference
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: {
      smsProvider: true,
    },
  });

  const provider = church?.smsProvider || 'twilio'; // Default to Twilio

  switch (provider) {
    case 'telnyx':
      return await telnyxSendSMS(to, message, churchId);
    case 'bandwidth':
      return await bandwidthSendSMS(to, message, churchId);
    case 'twilio':
    default:
      return await twilioSendSMS(to, message, churchId);
  }
}
```

### Step 4: Update Controllers

**File: `backend/src/controllers/message.controller.ts`**

```typescript
// Update to support multiple providers
export async function connectSMSProvider(req: Request, res: Response) {
  const { provider, credentials } = req.body;
  
  // provider: "twilio" | "telnyx" | "bandwidth"
  // credentials: provider-specific credentials
  
  // Validate and save based on provider
  // ...
}
```

---

## 🚀 MIGRATION PLAN

### Phase 1: Preparation (Week 1-2)
- [ ] Sign up for aggregator account (Telnyx or Bandwidth)
- [ ] Get API credentials
- [ ] Test API in sandbox
- [ ] Review documentation
- [ ] Plan integration

### Phase 2: Development (Week 3-4)
- [ ] Create aggregator service files
- [ ] Update database schema
- [ ] Update SMS service to support multiple providers
- [ ] Update controllers
- [ ] Add number purchase functionality
- [ ] Test in development

### Phase 3: Testing (Week 5)
- [ ] Test SMS sending
- [ ] Test number purchase
- [ ] Test webhook handling
- [ ] Test delivery status
- [ ] End-to-end testing

### Phase 4: Beta Rollout (Week 6)
- [ ] Deploy to staging
- [ ] Test with 1-2 beta churches
- [ ] Monitor delivery rates
- [ ] Fix any issues
- [ ] Get feedback

### Phase 5: Full Migration (Week 7-8)
- [ ] Roll out to all new customers
- [ ] Offer migration to existing customers
- [ ] Monitor performance
- [ ] Optimize as needed

---

## 📈 MONITORING & OPTIMIZATION

### Key Metrics to Track:

1. **Delivery Rates**
   - Compare Twilio vs Aggregator
   - Track by carrier
   - Monitor for issues

2. **Costs**
   - Actual costs per message
   - Compare to projections
   - Track savings

3. **Performance**
   - Message delivery time
   - API response times
   - Error rates

4. **Customer Satisfaction**
   - Delivery issues
   - Support requests
   - Feedback

---

## 💡 IMPLEMENTATION STRATEGY

### Option 1: Gradual Migration (Recommended)
- New customers: Use aggregator
- Existing customers: Keep Twilio (or migrate)
- Low risk
- Gradual transition

### Option 2: All-at-Once Migration
- Switch all customers at once
- Higher risk
- Faster transition
- Requires more testing

### Option 3: Hybrid (Best)
- New customers: Aggregator
- Existing customers: Choice (Twilio or Aggregator)
- Let customers migrate when ready
- Maximum flexibility

---

## 📋 DECISION CRITERIA

### When to Use Telnyx:
- ✅ You have 25K+ messages/month
- ✅ You want lowest minimum
- ✅ You want competitive pricing
- ✅ You want easy integration

### When to Use Bandwidth:
- ✅ You have 50K+ messages/month
- ✅ You're US-focused
- ✅ You want best pricing at scale
- ✅ You want direct carrier connections

### When to Stay with Twilio:
- ✅ You have <25K messages/month
- ✅ You want no commitment
- ✅ You want easiest option
- ✅ You're not ready to optimize costs

---

## 🎯 IMMEDIATE ACTION ITEMS

### This Week:
1. **Calculate Current Volume**
   - [ ] Count messages sent in last 30 days
   - [ ] Project next 3 months
   - [ ] Confirm you meet minimums

2. **Contact Aggregators**
   - [ ] Request pricing from Telnyx
   - [ ] Request pricing from Bandwidth
   - [ ] Compare to Twilio costs
   - [ ] Ask about setup process

3. **Evaluate ROI**
   - [ ] Calculate current costs
   - [ ] Calculate aggregator costs
   - [ ] Calculate savings
   - [ ] Determine break-even

### Next Week:
1. **Technical Preparation**
   - [ ] Review aggregator APIs
   - [ ] Test in sandbox
   - [ ] Plan integration approach

2. **Decision**
   - [ ] Choose aggregator (Telnyx or Bandwidth)
   - [ ] Plan migration timeline
   - [ ] Budget for setup

---

## 📞 AGGREGATOR CONTACTS

### Telnyx:
- Website: https://telnyx.com
- Sales: sales@telnyx.com
- Documentation: https://developers.telnyx.com

### Bandwidth:
- Website: https://bandwidth.com
- Sales: Contact form on website
- Documentation: https://dev.bandwidth.com

### MessageBird:
- Website: https://messagebird.com
- Sales: Contact form on website
- Documentation: https://developers.messagebird.com

---

## ⚠️ IMPORTANT CONSIDERATIONS

### Before Switching:
1. **Volume Commitment**
   - Most aggregators require minimum volume
   - Make sure you can meet it
   - Consider growth projections

2. **Setup Costs**
   - $500-$5,000 setup fees
   - Budget for this
   - Calculate ROI

3. **Testing**
   - Test thoroughly before switching
   - Don't switch all customers at once
   - Have rollback plan

4. **Support**
   - Evaluate aggregator support
   - Make sure they can help
   - Check response times

---

## 🎯 RECOMMENDATION

### **Start with Telnyx** (If you have 25K+ messages/month)

**Why:**
- ✅ Lowest minimum (25K messages/month)
- ✅ Very competitive pricing
- ✅ Easy integration
- ✅ Good documentation
- ✅ Lower risk

**Next Steps:**
1. Contact Telnyx for pricing
2. Calculate savings
3. Test in sandbox
4. Plan migration

---

## 📊 SUCCESS METRICS

### By Month 1:
- ✅ Aggregator account set up
- ✅ API integrated
- ✅ Testing complete

### By Month 2:
- ✅ Beta customers using aggregator
- ✅ Delivery rates good
- ✅ Costs lower than Twilio

### By Month 3:
- ✅ All new customers on aggregator
- ✅ Savings realized
- ✅ Performance optimized

---

**Last Updated:** 2024-10-30  
**Status:** Ready for Implementation - Phase 2 Growth Strategy

