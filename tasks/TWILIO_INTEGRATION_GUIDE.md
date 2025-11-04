# Twilio Integration Guide - Current Status & Enhancements

**Date:** 2024-10-30  
**Status:** Twilio Already Integrated  
**Current Features:** Basic SMS sending, credential validation

---

## ✅ CURRENT INTEGRATION STATUS

### What's Already Working:

1. **Twilio Service** (`backend/src/services/twilio.service.ts`)
   - ✅ SMS sending function
   - ✅ Credential validation
   - ✅ Error handling

2. **Message Controller** (`backend/src/controllers/message.controller.ts`)
   - ✅ Connect Twilio endpoint
   - ✅ Send message endpoint
   - ✅ Credential validation

3. **Database Schema**
   - ✅ Church model has Twilio fields:
     - `twilioAccountSid`
     - `twilioAuthToken`
     - `twilioPhoneNumber`
     - `twilioVerified`

4. **Routes**
   - ✅ `/api/churches/:churchId/twilio/connect`
   - ✅ `/api/messages/send`

---

## 📋 HOW IT CURRENTLY WORKS

### Current Flow:

```
1. Church connects Twilio account
   POST /api/churches/:churchId/twilio/connect
   {
     accountSid: "...",
     authToken: "...",
     phoneNumber: "+1234567890"
   }
   ↓
2. Credentials saved to database
   ↓
3. When sending message:
   POST /api/messages/send
   {
     content: "Hello!",
     targetType: "groups",
     targetIds: ["group1", "group2"]
   }
   ↓
4. System uses church's Twilio credentials
   ↓
5. Twilio sends SMS to recipients
```

### Current Implementation:

**File: `backend/src/services/twilio.service.ts`**
- Gets church Twilio credentials from database
- Initializes Twilio client
- Sends SMS message
- Returns message SID

**File: `backend/src/controllers/message.controller.ts`**
- `connectTwilio()` - Connects church's Twilio account
- `sendMessage()` - Sends messages using Twilio

---

## 🔧 ENHANCEMENTS YOU CAN ADD

### 1. **MMS Support** (Send Images/Videos)

**Current:** Only SMS text messages  
**Enhancement:** Add MMS for images/videos

**Implementation:**

**File: `backend/src/services/twilio.service.ts`**

Add MMS functions:

```typescript
/**
 * Send MMS (image/video) via Twilio
 */
export async function sendMMS(
  to: string,
  message: string,
  mediaUrl: string | string[], // URL(s) to media
  churchId: string
): Promise<{ messageSid: string; success: boolean }> {
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: {
      twilioAccountSid: true,
      twilioAuthToken: true,
      twilioPhoneNumber: true,
    },
  });

  if (!church?.twilioAccountSid || !church?.twilioAuthToken || !church?.twilioPhoneNumber) {
    throw new Error('Twilio credentials not configured');
  }

  const client = twilio(church.twilioAccountSid, church.twilioAuthToken);

  try {
    // Convert single URL to array
    const mediaUrls = Array.isArray(mediaUrl) ? mediaUrl : [mediaUrl];

    const result = await client.messages.create({
      body: message,
      from: church.twilioPhoneNumber,
      to: to,
      mediaUrl: mediaUrls, // Array of media URLs
    });

    return {
      messageSid: result.sid,
      success: true,
    };
  } catch (error: any) {
    throw new Error(`Twilio MMS error: ${error.message}`);
  }
}
```

**Note:** MMS has 5MB limit and compression issues (as you mentioned).

---

### 2. **Webhook Support** (Delivery Status)

**Current:** No delivery status tracking  
**Enhancement:** Track message delivery status

**Implementation:**

**File: `backend/src/controllers/message.controller.ts`**

Add webhook handler:

```typescript
/**
 * POST /api/webhooks/twilio
 * Handle Twilio webhooks for delivery status
 */
export async function handleTwilioWebhook(req: Request, res: Response) {
  try {
    const { MessageSid, MessageStatus, To, From } = req.body;

    // Update message recipient status
    await prisma.messageRecipient.updateMany({
      where: {
        twilioMessageSid: MessageSid,
        member: {
          phone: To,
        },
      },
      data: {
        status: MessageStatus === 'delivered' ? 'delivered' : 
               MessageStatus === 'failed' ? 'failed' : 'sent',
        deliveredAt: MessageStatus === 'delivered' ? new Date() : undefined,
        failedAt: MessageStatus === 'failed' ? new Date() : undefined,
      },
    });

    // Return 200 to acknowledge webhook
    res.status(200).send('OK');
  } catch (error) {
    console.error('Twilio webhook error:', error);
    res.status(500).send('Error');
  }
}
```

**Setup in Twilio Console:**
1. Go to Twilio Console → Phone Numbers
2. Select your number
3. Set webhook URL: `https://yourdomain.com/api/webhooks/twilio`
4. Save

---

### 3. **Message Scheduling**

**Current:** Messages send immediately  
**Enhancement:** Schedule messages for later

**Implementation:**

**File: `backend/src/services/twilio.service.ts`**

Add scheduling:

```typescript
/**
 * Schedule SMS to send at specific time
 */
export async function scheduleSMS(
  to: string,
  message: string,
  sendAt: Date, // When to send
  churchId: string
): Promise<{ messageSid: string; success: boolean }> {
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: {
      twilioAccountSid: true,
      twilioAuthToken: true,
      twilioPhoneNumber: true,
    },
  });

  if (!church?.twilioAccountSid || !church?.twilioAuthToken || !church?.twilioPhoneNumber) {
    throw new Error('Twilio credentials not configured');
  }

  const client = twilio(church.twilioAccountSid, church.twilioAuthToken);

  try {
    const result = await client.messages.create({
      body: message,
      from: church.twilioPhoneNumber,
      to: to,
      scheduleType: 'fixed',
      sendAt: sendAt, // ISO 8601 format
    });

    return {
      messageSid: result.sid,
      success: true,
    };
  } catch (error: any) {
    throw new Error(`Twilio scheduling error: ${error.message}`);
  }
}
```

**Note:** Twilio scheduling requires special account setup or use your own job queue (Bull/Redis).

---

### 4. **Phone Number Purchase**

**Current:** Churches bring their own Twilio numbers  
**Enhancement:** Buy numbers on behalf of churches

**Implementation:**

**File: `backend/src/services/twilio.service.ts`**

Add number purchase:

```typescript
/**
 * Search available phone numbers
 */
export async function searchAvailableNumbers(
  areaCode: string,
  churchId: string
): Promise<string[]> {
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: {
      twilioAccountSid: true,
      twilioAuthToken: true,
    },
  });

  if (!church?.twilioAccountSid || !church?.twilioAuthToken) {
    throw new Error('Twilio credentials not configured');
  }

  const client = twilio(church.twilioAccountSid, church.twilioAuthToken);

  try {
    const availableNumbers = await client.availablePhoneNumbers('US')
      .local.list({ areaCode });

    return availableNumbers.map(num => num.phoneNumber);
  } catch (error: any) {
    throw new Error(`Twilio search error: ${error.message}`);
  }
}

/**
 * Purchase phone number for church
 */
export async function purchasePhoneNumber(
  phoneNumber: string,
  churchId: string
): Promise<string> {
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: {
      twilioAccountSid: true,
      twilioAuthToken: true,
    },
  });

  if (!church?.twilioAccountSid || !church?.twilioAuthToken) {
    throw new Error('Twilio credentials not configured');
  }

  const client = twilio(church.twilioAccountSid, church.twilioAuthToken);

  try {
    const incomingNumber = await client.incomingPhoneNumbers.create({
      phoneNumber: phoneNumber,
    });

    // Update church record
    await prisma.church.update({
      where: { id: churchId },
      data: {
        twilioPhoneNumber: incomingNumber.phoneNumber,
      },
    });

    return incomingNumber.phoneNumber;
  } catch (error: any) {
    throw new Error(`Twilio purchase error: ${error.message}`);
  }
}
```

---

### 5. **Incoming Message Handling** (2-Way Messaging)

**Current:** Only outgoing messages  
**Enhancement:** Handle incoming replies

**Implementation:**

**File: `backend/src/controllers/message.controller.ts`**

Add incoming message handler:

```typescript
/**
 * POST /api/webhooks/twilio/incoming
 * Handle incoming SMS messages
 */
export async function handleIncomingMessage(req: Request, res: Response) {
  try {
    const { From, To, Body, MessageSid } = req.body;

    // Find church by phone number
    const church = await prisma.church.findFirst({
      where: {
        twilioPhoneNumber: To,
      },
    });

    if (!church) {
      return res.status(404).send('Church not found');
    }

    // Find member by phone number
    const member = await prisma.member.findFirst({
      where: {
        phone: From,
      },
    });

    if (!member) {
      return res.status(404).send('Member not found');
    }

    // Store incoming message
    await prisma.message.create({
      data: {
        churchId: church.id,
        content: Body,
        status: 'received',
        targetType: 'individual',
        targetIds: JSON.stringify([member.id]),
        sentAt: new Date(),
      },
    });

    // Return TwiML response (optional)
    res.type('text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error('Incoming message error:', error);
    res.status(500).send('Error');
  }
}
```

**Setup in Twilio Console:**
1. Go to Phone Numbers → Your Number
2. Set "A MESSAGE COMES IN" webhook: `https://yourdomain.com/api/webhooks/twilio/incoming`
3. Save

---

### 6. **Error Handling & Retry Logic**

**Current:** Basic error handling  
**Enhancement:** Retry failed messages

**Implementation:**

**File: `backend/src/services/twilio.service.ts`**

Add retry logic:

```typescript
/**
 * Send SMS with retry logic
 */
export async function sendSMSWithRetry(
  to: string,
  message: string,
  churchId: string,
  maxRetries: number = 3
): Promise<{ messageSid: string; success: boolean }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendSMS(to, message, churchId);
      return result;
    } catch (error) {
      lastError = error as Error;
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError || new Error('Failed to send SMS after retries');
}
```

---

## 📋 SETUP CHECKLIST

### Initial Setup:

- [ ] Twilio account created
- [ ] Twilio phone number purchased
- [ ] API credentials obtained (Account SID, Auth Token)
- [ ] Environment variables set (if using master account)
- [ ] Webhooks configured (for delivery status)

### For Each Church:

1. **Church Gets Twilio Account:**
   - [ ] Church creates Twilio account
   - [ ] Church purchases phone number
   - [ ] Church gets Account SID and Auth Token

2. **Church Connects to Your Platform:**
   - [ ] Church logs into your platform
   - [ ] Goes to Settings → Twilio
   - [ ] Enters Account SID, Auth Token, Phone Number
   - [ ] Clicks "Connect"
   - [ ] System validates credentials
   - [ ] Credentials saved

3. **Church Can Send Messages:**
   - [ ] Church sends message via your platform
   - [ ] System uses church's Twilio credentials
   - [ ] Twilio sends SMS
   - [ ] Delivery status tracked (if webhooks set up)

---

## 🔐 SECURITY CONSIDERATIONS

### Current Security:
- ✅ Credentials stored in database
- ✅ Credentials validated before saving
- ✅ Each church uses their own credentials

### Enhancements:
- [ ] Encrypt credentials in database
- [ ] Use environment variables for master account (if you buy numbers)
- [ ] Validate webhook signatures
- [ ] Rate limiting on send endpoints

---

## 📊 MONITORING & ANALYTICS

### Current:
- ✅ Message SID stored
- ✅ Message status tracked (if webhooks set up)

### Enhancements:
- [ ] Track delivery rates
- [ ] Monitor error rates
- [ ] Track costs per church
- [ ] Alert on high failure rates

---

## 🎯 RECOMMENDED NEXT STEPS

### Priority 1: Add Webhooks (High Value)
- Track delivery status
- Better analytics
- User feedback

### Priority 2: Add MMS Support
- Send images/videos
- Note: 5MB limit and compression

### Priority 3: Add Incoming Messages
- 2-way communication
- Reply inbox
- Better engagement

### Priority 4: Add Number Purchase
- You buy numbers for churches
- Better control
- Revenue opportunity

---

## 📝 API ENDPOINTS SUMMARY

### Current Endpoints:

**POST `/api/churches/:churchId/twilio/connect`**
- Connect church's Twilio account
- Body: `{ accountSid, authToken, phoneNumber }`
- Returns: `{ success, data: { twilioVerified, twilioPhoneNumber } }`

**POST `/api/messages/send`**
- Send message to recipients
- Body: `{ content, targetType, targetIds }`
- Returns: `{ success, messageId }`

### Recommended New Endpoints:

**POST `/api/messages/send-mms`**
- Send MMS with media
- Body: `{ content, mediaUrl, targetType, targetIds }`

**POST `/api/webhooks/twilio`**
- Handle delivery status webhooks
- Called by Twilio automatically

**POST `/api/webhooks/twilio/incoming`**
- Handle incoming messages
- Called by Twilio automatically

**GET `/api/churches/:churchId/twilio/numbers/search`**
- Search available phone numbers
- Query: `?areaCode=206`

**POST `/api/churches/:churchId/twilio/numbers/purchase`**
- Purchase phone number
- Body: `{ phoneNumber }`

---

## 💡 INTEGRATION TIPS

### 1. **Test with Twilio Test Credentials**
- Use Twilio test credentials for development
- Test messages don't send real SMS
- Free to use

### 2. **Handle Errors Gracefully**
- Twilio can fail for various reasons
- Implement retry logic
- Log errors for debugging

### 3. **Monitor Costs**
- Track messages sent per church
- Set up alerts for high usage
- Consider rate limiting

### 4. **Webhook Security**
- Validate Twilio webhook signatures
- Use HTTPS for webhooks
- Authenticate requests

---

## 📞 TWILIO RESOURCES

- **Documentation:** https://www.twilio.com/docs
- **SMS API:** https://www.twilio.com/docs/sms
- **MMS API:** https://www.twilio.com/docs/sms/send-messages#mms
- **Webhooks:** https://www.twilio.com/docs/usage/webhooks
- **Console:** https://console.twilio.com

---

## ✅ SUMMARY

### What You Have:
- ✅ Basic Twilio integration
- ✅ SMS sending
- ✅ Credential validation
- ✅ Multi-tenant (each church has own credentials)

### What You Can Add:
- 📸 MMS support (images/videos)
- 📊 Webhook delivery tracking
- 📥 Incoming message handling
- 📞 Phone number purchase
- 🔄 Retry logic
- 📅 Message scheduling

### Current Status:
**Your Twilio integration is working!** Churches can connect their Twilio accounts and send SMS messages.

**Next:** Choose which enhancements to add based on your needs.

---

**Last Updated:** 2024-10-30  
**Status:** Integration Guide Complete - Ready to Enhance

