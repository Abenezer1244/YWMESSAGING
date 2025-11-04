# Step-by-Step Guide: Switching to Telnyx

**Date:** 2024-10-30  
**Goal:** Migrate from Twilio to Telnyx for better pricing  
**Approach:** Support both providers initially, then migrate

---

## 🎯 OVERVIEW

This guide will help you:
1. Set up Telnyx account
2. Install Telnyx SDK
3. Create Telnyx service
4. Update database schema
5. Update controllers
6. Test and migrate

**Strategy:** Support both Twilio and Telnyx initially, then migrate customers gradually.

---

## STEP 1: Set Up Telnyx Account

### 1.1 Sign Up for Telnyx
1. Go to https://telnyx.com
2. Click "Sign Up" or "Get Started"
3. Create account (free to start)
4. Verify email

### 1.2 Get API Credentials
1. Log into Telnyx dashboard
2. Go to "API Keys" section
3. Create new API key
4. **Copy and save:**
   - API Key (starts with `KEY...`)
   - You'll need this for environment variables

### 1.3 Set Up Phone Number (Optional for Now)
- You can purchase numbers later
- For now, just get API key

### 1.4 Add Environment Variables

**File: `backend/.env`**

Add these lines:
```env
# Telnyx Configuration
TELNYX_API_KEY=KEY_your_api_key_here
TELNYX_MESSAGING_PROFILE_ID=your_messaging_profile_id_here

# Keep Twilio for backward compatibility
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

**Note:** You'll get `MESSAGING_PROFILE_ID` from Telnyx dashboard after setting up messaging profile.

---

## STEP 2: Install Telnyx SDK

### 2.1 Install Package

**Terminal (in backend directory):**
```bash
cd backend
npm install @telnyx/telnyx-js
```

### 2.2 Verify Installation

Check `backend/package.json` - you should see:
```json
"dependencies": {
  "@telnyx/telnyx-js": "^x.x.x"
}
```

---

## STEP 3: Update Database Schema

### 3.1 Update Prisma Schema

**File: `backend/prisma/schema.prisma`**

Update the `Church` model:

```prisma
model Church {
  id                    String   @id @default(cuid())
  name                  String
  email                 String   @unique
  stripeCustomerId      String?  @unique
  
  // SMS Provider Configuration
  smsProvider           String?  @default("twilio") // "twilio" | "telnyx"
  
  // Twilio (keep for backward compatibility)
  twilioAccountSid      String?
  twilioAuthToken       String?
  twilioPhoneNumber     String?
  twilioVerified        Boolean  @default(false)
  
  // Telnyx (new)
  telnyxPhoneNumber     String?
  telnyxMessagingProfileId String?
  telnyxVerified        Boolean  @default(false)
  
  trialEndsAt           DateTime
  subscriptionStatus    String   @default("trial")
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relations
  branches              Branch[]
  admins                Admin[]
  groups                Group[]
  messages              Message[]
  messageTemplates      MessageTemplate[]
  subscriptions         Subscription[]
  recurringMessages     RecurringMessage[]

  @@index([subscriptionStatus])
  @@index([trialEndsAt])
}
```

### 3.2 Create Migration

**Terminal:**
```bash
cd backend
npx prisma migrate dev --name add_telnyx_support
```

### 3.3 Generate Prisma Client

```bash
npx prisma generate
```

---

## STEP 4: Create Telnyx Service

### 4.1 Create Telnyx Service File

**File: `backend/src/services/telnyx.service.ts`**

```typescript
import Telnyx from '@telnyx/telnyx-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Telnyx client
const telnyx = new Telnyx(process.env.TELNYX_API_KEY || '');

/**
 * Send SMS via Telnyx
 */
export async function sendSMS(
  to: string,
  message: string,
  churchId: string
): Promise<{ messageSid: string; success: boolean }> {
  // Get church Telnyx configuration
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: {
      telnyxPhoneNumber: true,
      telnyxMessagingProfileId: true,
    },
  });

  if (!church?.telnyxPhoneNumber) {
    throw new Error('Telnyx phone number not configured for this church');
  }

  // Use messaging profile ID from church or environment
  const messagingProfileId = 
    church.telnyxMessagingProfileId || 
    process.env.TELNYX_MESSAGING_PROFILE_ID;

  if (!messagingProfileId) {
    throw new Error('Telnyx messaging profile ID not configured');
  }

  try {
    const result = await telnyx.messages.create({
      from: church.telnyxPhoneNumber, // E.164 format
      to: to, // E.164 format
      text: message,
      messaging_profile_id: messagingProfileId,
    });

    return {
      messageSid: result.id || result.data?.id || '',
      success: true,
    };
  } catch (error: any) {
    const errorMessage = error?.message || error?.errors?.[0]?.detail || 'Failed to send SMS';
    throw new Error(`Telnyx error: ${errorMessage}`);
  }
}

/**
 * Validate Telnyx phone number
 */
export async function validateTelnyxPhoneNumber(
  phoneNumber: string
): Promise<boolean> {
  try {
    // Search for the phone number in Telnyx
    const numbers = await telnyx.phoneNumbers.list({
      filter: { phone_number: phoneNumber },
    });

    return numbers.data && numbers.data.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Search available phone numbers by area code
 */
export async function searchAvailableNumbers(
  areaCode: string
): Promise<string[]> {
  try {
    const numbers = await telnyx.phoneNumbers.list({
      filter: { area_code: areaCode },
    });

    return numbers.data?.map((n: any) => n.phone_number) || [];
  } catch (error: any) {
    throw new Error(`Telnyx error searching numbers: ${error.message}`);
  }
}

/**
 * Purchase phone number from Telnyx
 */
export async function purchasePhoneNumber(
  phoneNumber: string,
  churchId: string
): Promise<string> {
  try {
    // Purchase the number
    const result = await telnyx.phoneNumbers.create({
      phone_number: phoneNumber,
    });

    // Update church record
    await prisma.church.update({
      where: { id: churchId },
      data: {
        telnyxPhoneNumber: result.phone_number,
        telnyxVerified: true,
        smsProvider: 'telnyx',
      },
    });

    return result.phone_number;
  } catch (error: any) {
    throw new Error(`Telnyx error purchasing number: ${error.message}`);
  }
}

/**
 * Test Telnyx API connection
 */
export async function testTelnyxConnection(): Promise<boolean> {
  try {
    // Try to list phone numbers (simple API call)
    await telnyx.phoneNumbers.list({ limit: 1 });
    return true;
  } catch (error) {
    return false;
  }
}
```

---

## STEP 5: Update SMS Service (Unified Router)

### 5.1 Create Unified SMS Service

**File: `backend/src/services/sms.service.ts`** (NEW FILE)

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
      twilioVerified: true,
      telnyxVerified: true,
    },
  });

  if (!church) {
    throw new Error('Church not found');
  }

  // Determine provider (default to Twilio if not set)
  const provider = church.smsProvider || 'twilio';

  // Route to appropriate provider
  switch (provider) {
    case 'telnyx':
      if (!church.telnyxVerified) {
        throw new Error('Telnyx not configured for this church');
      }
      return await telnyxSendSMS(to, message, churchId);

    case 'twilio':
    default:
      if (!church.twilioVerified) {
        throw new Error('Twilio not configured for this church');
      }
      return await twilioSendSMS(to, message, churchId);
  }
}

/**
 * Get available providers for a church
 */
export async function getAvailableProviders(churchId: string): Promise<{
  twilio: boolean;
  telnyx: boolean;
}> {
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: {
      twilioVerified: true,
      telnyxVerified: true,
    },
  });

  return {
    twilio: church?.twilioVerified || false,
    telnyx: church?.telnyxVerified || false,
  };
}
```

### 5.2 Update All SMS Calls

**Find all places that call `twilioService.sendSMS` and replace with `smsService.sendSMS`:**

**Files to update:**
- `backend/src/controllers/message.controller.ts`
- `backend/src/jobs/welcomeMessage.job.ts`
- Any other files that send SMS

**Example update:**

**Before:**
```typescript
import { sendSMS } from '../services/twilio.service';
// ...
await sendSMS(member.phone, message, churchId);
```

**After:**
```typescript
import { sendSMS } from '../services/sms.service';
// ...
await sendSMS(member.phone, message, churchId);
```

---

## STEP 6: Update Controllers

### 6.1 Update Message Controller

**File: `backend/src/controllers/message.controller.ts`**

Add Telnyx connection endpoint:

```typescript
import { sendSMS } from '../services/sms.service';
import telnyxService from '../services/telnyx.service';

/**
 * POST /api/churches/:churchId/telnyx/connect
 * Connect Telnyx phone number
 */
export async function connectTelnyx(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    const { phoneNumber, messagingProfileId } = req.body;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Validate input
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'phoneNumber is required',
      });
    }

    // Validate phone number exists in Telnyx
    const isValid = await telnyxService.validateTelnyxPhoneNumber(phoneNumber);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Phone number not found in Telnyx account',
      });
    }

    // Save configuration
    const church = await prisma.church.update({
      where: { id: churchId },
      data: {
        telnyxPhoneNumber: phoneNumber,
        telnyxMessagingProfileId: messagingProfileId || process.env.TELNYX_MESSAGING_PROFILE_ID,
        telnyxVerified: true,
        smsProvider: 'telnyx', // Switch to Telnyx
      },
    });

    res.json({
      success: true,
      data: {
        telnyxVerified: church.telnyxVerified,
        telnyxPhoneNumber: church.telnyxPhoneNumber,
        smsProvider: church.smsProvider,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}

/**
 * POST /api/churches/:churchId/telnyx/purchase-number
 * Purchase phone number from Telnyx
 */
export async function purchaseTelnyxNumber(req: Request, res: Response) {
  try {
    const churchId = req.user?.churchId;
    const { areaCode } = req.body;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (!areaCode) {
      return res.status(400).json({
        success: false,
        error: 'areaCode is required',
      });
    }

    // Search available numbers
    const availableNumbers = await telnyxService.searchAvailableNumbers(areaCode);

    if (availableNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No numbers available in that area code',
      });
    }

    // Purchase first available number
    const phoneNumber = await telnyxService.purchasePhoneNumber(
      availableNumbers[0],
      churchId
    );

    res.json({
      success: true,
      data: {
        phoneNumber,
        availableNumbers, // Show other options
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
}
```

### 6.2 Update Routes

**File: `backend/src/routes/message.routes.ts`** (or wherever routes are defined)

Add Telnyx routes:

```typescript
import { connectTelnyx, purchaseTelnyxNumber } from '../controllers/message.controller';

// Add these routes
router.post('/churches/:churchId/telnyx/connect', authenticate, connectTelnyx);
router.post('/churches/:churchId/telnyx/purchase-number', authenticate, purchaseTelnyxNumber);
```

### 6.3 Update Send Message Endpoint

**File: `backend/src/controllers/message.controller.ts`**

Update the `sendMessage` function to use unified SMS service:

```typescript
// Change this import
import { sendSMS } from '../services/sms.service'; // Instead of twilio.service

// The rest of the function stays the same
export async function sendMessage(req: Request, res: Response) {
  // ... existing code ...
  
  // This will now route to correct provider automatically
  await sendSMS(member.phone, message.content, churchId);
  
  // ... rest of code ...
}
```

---

## STEP 7: Update Jobs

### 7.1 Update Welcome Message Job

**File: `backend/src/jobs/welcomeMessage.job.ts`**

Update import:

```typescript
// Change from:
import { sendSMS } from '../services/twilio.service';

// To:
import { sendSMS } from '../services/sms.service';
```

The rest of the code stays the same - it will automatically use the correct provider!

---

## STEP 8: Testing

### 8.1 Test Telnyx Connection

**Create test file: `backend/src/test/telnyx.test.ts`**

```typescript
import { testTelnyxConnection } from '../services/telnyx.service';

async function test() {
  const isConnected = await testTelnyxConnection();
  console.log('Telnyx connection:', isConnected ? '✅ Success' : '❌ Failed');
}

test();
```

**Run:**
```bash
cd backend
npx tsx src/test/telnyx.test.ts
```

### 8.2 Test SMS Sending

1. Set up a test church with Telnyx
2. Send a test message
3. Verify delivery

### 8.3 Test Both Providers

1. Create two test churches
2. One with Twilio, one with Telnyx
3. Send messages from both
4. Verify both work

---

## STEP 9: Migration Strategy

### 9.1 Gradual Migration (Recommended)

**Phase 1: Support Both (Week 1-2)**
- Deploy code with both providers
- New customers can choose Telnyx
- Existing customers stay on Twilio

**Phase 2: Offer Migration (Week 3-4)**
- Email existing customers
- Offer to switch to Telnyx
- Provide migration tool

**Phase 3: Default to Telnyx (Week 5+)**
- New customers default to Telnyx
- Existing customers can switch
- Eventually deprecate Twilio

### 9.2 Create Migration Tool

**File: `backend/src/controllers/admin.controller.ts`**

Add migration endpoint:

```typescript
/**
 * POST /api/admin/migrate-to-telnyx/:churchId
 * Migrate church from Twilio to Telnyx
 */
export async function migrateToTelnyx(req: Request, res: Response) {
  try {
    const churchId = req.params.churchId;
    
    // Get church
    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    if (!church) {
      return res.status(404).json({ error: 'Church not found' });
    }

    // Check if Telnyx is already configured
    if (church.telnyxVerified) {
      return res.status(400).json({
        error: 'Church already using Telnyx',
      });
    }

    // You would need to:
    // 1. Purchase Telnyx number for church
    // 2. Port existing number if needed
    // 3. Update church record
    // 4. Test sending

    // For now, just show what needs to happen
    res.json({
      success: true,
      message: 'Migration tool - implement based on your needs',
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
```

---

## STEP 10: Environment Variables Checklist

### Add to `backend/.env`:

```env
# Telnyx Configuration
TELNYX_API_KEY=KEY_your_api_key_here
TELNYX_MESSAGING_PROFILE_ID=your_messaging_profile_id_here

# Keep Twilio for backward compatibility
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

### Add to `.env.example`:

```env
# Telnyx Configuration
TELNYX_API_KEY=
TELNYX_MESSAGING_PROFILE_ID=

# Twilio Configuration (keep for backward compatibility)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Setup
- [ ] Sign up for Telnyx account
- [ ] Get API key
- [ ] Set up messaging profile
- [ ] Add environment variables

### Code
- [ ] Install Telnyx SDK
- [ ] Update database schema
- [ ] Create migration
- [ ] Create Telnyx service
- [ ] Create unified SMS service
- [ ] Update controllers
- [ ] Update routes
- [ ] Update jobs
- [ ] Update all SMS calls

### Testing
- [ ] Test Telnyx connection
- [ ] Test SMS sending
- [ ] Test both providers
- [ ] End-to-end testing

### Deployment
- [ ] Deploy to staging
- [ ] Test in staging
- [ ] Deploy to production
- [ ] Monitor

---

## 🚨 IMPORTANT NOTES

### 1. **Backward Compatibility**
- Keep Twilio code working
- Don't break existing customers
- Support both providers

### 2. **Phone Number Format**
- Telnyx requires E.164 format (+1234567890)
- Make sure your phone utils handle this

### 3. **Webhooks**
- You'll need to set up Telnyx webhooks for delivery status
- Similar to Twilio webhooks
- Update webhook handlers

### 4. **Error Handling**
- Handle Telnyx-specific errors
- Provide helpful error messages
- Log errors for debugging

---

## 📞 TELNYX RESOURCES

- **Documentation:** https://developers.telnyx.com
- **API Reference:** https://developers.telnyx.com/api/v2/messaging
- **Dashboard:** https://portal.telnyx.com
- **Support:** support@telnyx.com

---

## 🎯 NEXT STEPS

1. **This Week:**
   - Set up Telnyx account
   - Install SDK
   - Create service files

2. **Next Week:**
   - Update database
   - Update controllers
   - Test in development

3. **Week 3:**
   - Deploy to staging
   - Test thoroughly
   - Fix any issues

4. **Week 4:**
   - Deploy to production
   - Monitor closely
   - Start migrating customers

---

**Last Updated:** 2024-10-30  
**Status:** Ready for Implementation

