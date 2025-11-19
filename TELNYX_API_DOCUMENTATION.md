# Telnyx 10DLC API Documentation (Extracted from PM WAY.docx)

**Date Extracted:** November 19, 2025

---

## 1. BRAND MANAGEMENT APIs

### 1.1 List Brands
**Endpoint:** `GET https://api.telnyx.com/v2/10dlc/brand`

**Query Parameters:**
- `page` (Integer): Default: 1, Min: >= 1
- `recordsPerPage` (Integer): Default: 10, Max: 500
- `sort` (String): Sort order for results. Options:
  - `assignedCampaignsCount`, `-assignedCampaignsCount`
  - `brandId`, `-brandId`
  - `createdAt`, `-createdAt`
  - `displayName`, `-displayName`
  - `identityStatus`, `-identityStatus`
  - `status`, `-status`
  - `tcrBrandId`, `-tcrBrandId`
  - Default: `-createdAt`
- `displayName` (String): Filter by display name
- `entityType` (String): Filter by entity type
- `state` (String): Filter by state
- `country` (String): Filter by country
- `brandId` (String): Filter by Telnyx Brand ID
- `tcrBrandId` (String): Filter by TCR Brand ID

**Response Schema:**
```json
{
  "records": [
    {
      "brandId": "string",
      "tcrBrandId": "string",
      "entityType": "PRIVATE_PROFIT | PUBLIC_PROFIT | NON_PROFIT | GOVERNMENT",
      "identityStatus": "VERIFIED | UNVERIFIED | SELF_DECLARED | VETTED_VERIFIED",
      "companyName": "string",
      "displayName": "string",
      "email": "string",
      "website": "string",
      "failureReasons": "string",
      "status": "OK | REGISTRATION_PENDING | REGISTRATION_FAILED",
      "createdAt": "string (ISO8601)",
      "updatedAt": "string (ISO8601)",
      "assignedCampaignsCount": "integer"
    }
  ],
  "page": 1,
  "totalRecords": "integer"
}
```

**cURL Example:**
```bash
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <TOKEN>'
```

---

### 1.2 Create Brand
**Endpoint:** `POST https://api.telnyx.com/v2/10dlc/brand`

**Cost:** $4.00 (one-time, non-refundable)

**Request Body:**

**Required Fields:**
- `entityType` (String) [REQUIRED]: Entity type behind the brand
  - Values: `PRIVATE_PROFIT`, `PUBLIC_PROFIT`, `NON_PROFIT`, `GOVERNMENT`
- `displayName` (String) [REQUIRED]: Display or marketing name (Max: 100 chars)
- `country` (String) [REQUIRED]: ISO2 2-character country code (e.g., "US")
- `email` (String) [REQUIRED]: Valid email address (Max: 100 chars)
- `vertical` (String) [REQUIRED]: Industry/vertical category
  - Values: `REAL_ESTATE`, `HEALTHCARE`, `ENERGY`, `ENTERTAINMENT`, `RETAIL`, `AGRICULTURE`, `INSURANCE`, `EDUCATION`, `HOSPITALITY`, `FINANCIAL`, `GAMBLING`, `CONSTRUCTION`, `NGO`, `MANUFACTURING`, `GOVERNMENT`, `TECHNOLOGY`, `COMMUNICATION`

**Conditionally Required:**
- `companyName` (String): Legal company name (Required for Non-profit/Private/Public, Max: 100 chars)
- `ein` (String): Government corporate tax ID (Required for NON_PROFIT, Max: 20 chars, 9-digits in US)
- `stockSymbol` (String): Stock symbol (Required for PUBLIC_PROFIT, Max: 10 chars)
- `stockExchange` (String): Stock exchange (Required for PUBLIC_PROFIT)
  - Values: `NONE`, `NASDAQ`, `NYSE`, `AMEX`, `AMX`, `ASX`, `B3`, `BME`, `BSE`, `FRA`, `ICEX`, `JPX`, `JSE`, `KRX`, `LON`, `NSE`, `OMX`, `SEHK`, `SSE`, `STO`, `SWX`, `SZSE`, `TSX`, `TWSE`, `VSE`
- `businessContactEmail` (String): Business contact email (Required if entityType is PUBLIC_PROFIT)

**Optional Fields:**
- `firstName` (String): First name of business contact (Max: 100 chars)
- `lastName` (String): Last name of business contact (Max: 100 chars)
- `phone` (String): Valid phone number in E.164 format (Max: 20 chars)
- `street` (String): Street number and name (Max: 100 chars)
- `city` (String): City name (Max: 100 chars)
- `state` (String): State (Max: 20 chars, must be 2-letter code for US)
- `postalCode` (String): Postal code (Max: 10 chars, use 5-digit zipcode for US)
- `ipAddress` (String): IP address of browser requesting brand creation (Max: 50 chars)
- `website` (String): Brand website URL (Max: 100 chars)
- `isReseller` (Boolean): Indicates if brand is a reseller
- `mock` (Boolean): Mock brand for testing (Default: false)
- `mobilePhone` (String): Mobile phone number in E.164 format (Max: 20 chars)
- `webhookURL` (String): Webhook URL for brand status updates
- `webhookFailoverURL` (String): Failover webhook URL for brand status updates

**Response Schema:**
```json
{
  "entityType": "PRIVATE_PROFIT | PUBLIC_PROFIT | NON_PROFIT | GOVERNMENT",
  "cspId": "string",
  "brandId": "string (unique identifier assigned to brand)",
  "tcrBrandId": "string (unique identifier assigned by registry)",
  "displayName": "string",
  "companyName": "string",
  "firstName": "string",
  "lastName": "string",
  "ein": "string",
  "phone": "string",
  "street": "string",
  "city": "string",
  "state": "string",
  "postalCode": "string",
  "country": "string",
  "email": "string",
  "stockSymbol": "string",
  "stockExchange": "string",
  "ipAddress": "string",
  "website": "string",
  "brandRelationship": "BASIC_ACCOUNT | SMALL_ACCOUNT | MEDIUM_ACCOUNT | LARGE_ACCOUNT | KEY_ACCOUNT",
  "vertical": "string",
  "altBusinessId": "string",
  "altBusinessIdType": "NONE | DUNS | GIIN | LEI",
  "universalEin": "string",
  "referenceId": "string",
  "identityStatus": "VERIFIED | UNVERIFIED | SELF_DECLARED | VETTED_VERIFIED",
  "optionalAttributes": {
    "taxExemptStatus": "string"
  },
  "mock": false,
  "mobilePhone": "string",
  "isReseller": false,
  "webhookURL": "string",
  "businessContactEmail": "string",
  "webhookFailoverURL": "string",
  "createdAt": "string (ISO8601)",
  "updatedAt": "string (ISO8601)",
  "status": "OK | REGISTRATION_PENDING | REGISTRATION_FAILED",
  "failureReasons": "string"
}
```

**cURL Example:**
```bash
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer <TOKEN>' \
  --data-raw '{
    "entityType": "NON_PROFIT",
    "displayName": "Example Church",
    "companyName": "Example Church Organization",
    "ein": "123456789",
    "phone": "+12024567890",
    "street": "123 Main St",
    "city": "Seattle",
    "state": "WA",
    "postalCode": "98101",
    "country": "US",
    "email": "contact@church.com",
    "vertical": "RELIGION",
    "mobilePhone": "+12024567890"
  }'
```

**Response Example:**
```json
{
  "entityType": "NON_PROFIT",
  "cspId": "string",
  "brandId": "4b20017f-8da9-a992-a6c0-683072fb7729",
  "tcrBrandId": "BBRAND1",
  "displayName": "Example Church",
  "companyName": "Example Church Organization",
  "ein": "123456789",
  "phone": "+12024567890",
  "street": "123 Main St",
  "city": "Seattle",
  "state": "WA",
  "postalCode": "98101",
  "country": "US",
  "email": "contact@church.com",
  "brandRelationship": "BASIC_ACCOUNT",
  "vertical": "RELIGION",
  "identityStatus": "UNVERIFIED",
  "mock": false,
  "isReseller": false,
  "webhookURL": null,
  "businessContactEmail": null,
  "createdAt": "2021-03-08T17:57:48.801186",
  "updatedAt": "2021-03-08T17:57:48.801186",
  "status": "REGISTRATION_PENDING",
  "failureReasons": null
}
```

---

### 1.3 Get Brand
**Endpoint:** `GET https://api.telnyx.com/v2/10dlc/brand/:brandId`

**Path Parameters:**
- `brandId` (String) [REQUIRED]: Telnyx Brand ID

**Response:** Same as Create Brand response

---

## KEY FINDINGS

### Correct Endpoints (NOT `/a2p_brands`!)
✅ **List Brands:** `GET https://api.telnyx.com/v2/10dlc/brand`
✅ **Create Brand:** `POST https://api.telnyx.com/v2/10dlc/brand`
✅ **Get Brand:** `GET https://api.telnyx.com/v2/10dlc/brand/:brandId`

### For NON_PROFIT Churches
**Minimum Required Fields:**
```json
{
  "entityType": "NON_PROFIT",
  "displayName": "Church Name",
  "companyName": "Church Legal Name",
  "ein": "123456789",
  "country": "US",
  "email": "contact@church.com",
  "vertical": "RELIGION"  // or appropriate vertical
}
```

**Recommended Fields (for better approval chances):**
```json
{
  "phone": "+12024567890",
  "street": "123 Main St",
  "city": "Seattle",
  "state": "WA",
  "postalCode": "98101",
  "mobilePhone": "+12024567890",
  "website": "https://church.com"
}
```

### Cost
- **Brand Creation:** $4.00 (one-time, non-refundable)
- **Billed immediately** upon successful creation

### Approval Status Values
- `REGISTRATION_PENDING`: Brand is being reviewed
- `REGISTRATION_FAILED`: Brand registration failed
- `OK`: Brand is approved and ready
- `UNVERIFIED`: Brand not yet verified
- `VERIFIED`: Brand has been verified

---

## NOTES ON IMPLEMENTATION

1. **Endpoint Path Is Wrong In Current Code**
   - Current: `/a2p_brands` ❌ (returns 404)
   - Correct: `/10dlc/brand` ✅

2. **Request Payload Needs Updates**
   - Remove: `brand_type` field (not in official API)
   - Add: `entityType` field (required)
   - Add: `companyName` field (required for NON_PROFIT)
   - Add: `ein` field (required for NON_PROFIT)
   - Add: `vertical` field (required)

3. **Response Handling Needs Updates**
   - Response includes `brandId` (not `brand_id`)
   - Response includes `status` field for approval tracking
   - Check `identityStatus` for verification status

---

## 2. CAMPAIGN MANAGEMENT APIs

### 2.1 Submit Campaign (Create Campaign)
**Endpoint:** `POST https://api.telnyx.com/v2/10dlc/campaignBuilder`

**Cost:** Non-refundable 3-month charge (varies by use case)

**Required Fields:**
- `brandId` (String): ID of the brand to associate with this campaign
- `description` (String): Summary description of the campaign
- `usecase` (String): Campaign use case. Must check qualification first using Qualify By Usecase endpoint
  - Examples: `2FA`, `MARKETING`, `NOTIFICATIONS`, `POLITICAL`, `POLLING`, etc.
- `termsAndConditions` (Boolean): Must be `true` to accept T&Cs

**Important Optional Fields for Churches:**
- `subscriberOptin` (Boolean): Does campaign require subscriber opt-in?
- `optinKeywords` (String): Keywords for opt-in (comma-separated, no spaces)
- `optinMessage` (String): Message to send on opt-in
- `subscriberOptout` (Boolean): Does campaign support opt-out?
- `optoutKeywords` (String): Keywords for opt-out (comma-separated, no spaces)
- `optoutMessage` (String): Message to send on opt-out
- `subscriberHelp` (Boolean): Does campaign respond to help keywords?
- `helpKeywords` (String): Help keywords (comma-separated)
- `helpMessage` (String): Help message
- `sample1` - `sample5` (String): Message samples (required depending on tier)
- `messageFlow` (String): Description of message flow

**Response Fields:**
- `campaignId` (String): Unique identifier for the campaign
- `tcrCampaignId` (String): TCR's identifier for the campaign
- `campaignStatus` (String): Status progression through approval workflow
  - Values: `TCR_PENDING`, `TCR_ACCEPTED`, `TCR_FAILED`, `TELNYX_ACCEPTED`, `TELNYX_FAILED`, `MNO_PENDING`, `MNO_ACCEPTED`, `MNO_REJECTED`, `MNO_PROVISIONED`
- `submissionStatus` (String): Current submission phase
  - Values: `CREATED`, `PENDING`, `FAILED`

---

### 2.2 List Campaigns
**Endpoint:** `GET https://api.telnyx.com/v2/10dlc/campaign`

Query parameters: `page`, `recordsPerPage`, `sort`, `brandId`, `status`

---

### 2.3 Get Campaign
**Endpoint:** `GET https://api.telnyx.com/v2/10dlc/campaign/:campaignId`

Returns full campaign details including approval status

---

### 2.4 Update Campaign
**Endpoint:** `PUT https://api.telnyx.com/v2/10dlc/campaign/:campaignId`

**Note:** Only sample messages can be edited after creation

---

## 3. PHONE NUMBER ASSIGNMENT API

### 3.1 Assign Messaging Profile To Campaign
**Endpoint:** `POST https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile`

**Purpose:** Link phone numbers (via Messaging Profile) to a campaign

**Request Body:**
- `messagingProfileId` (String) [REQUIRED]: The Messaging Profile containing the phone numbers to assign
- `campaignId` (String): Campaign ID (use for Telnyx-created campaigns)
- `tcrCampaignId` (String): TCR Campaign ID (use for shared/external campaigns)

**Response:**
- `taskId` (String): ID of the task processing the assignment
- `message` (String): Status message

**Response Status:** 202 Accepted (async operation)

---

## FULL 10DLC WORKFLOW (Complete Steps)

```
Step 1: Create Brand
├─ POST /10dlc/brand
├─ Response: brandId
└─ Cost: $4 (one-time)

Step 2: Monitor Brand Approval
├─ GET /10dlc/brand/{brandId}
├─ Status progression: REGISTRATION_PENDING → OK + VERIFIED
└─ Approval time: 1-7 business days typically

Step 3: Create Campaign
├─ POST /10dlc/campaignBuilder
├─ Provide: brandId, usecase, description, samples, etc.
├─ Response: campaignId
└─ Cost: Non-refundable 3-month charge

Step 4: Monitor Campaign Approval
├─ GET /10dlc/campaign/{campaignId}
├─ Status progression: TCR_ACCEPTED → TELNYX_ACCEPTED → MNO_PROVISIONED
└─ Approval time: 1-3 days typically

Step 5: Assign Phone Numbers To Campaign
├─ POST /10dlc/phoneNumberAssignmentByProfile
├─ Link Messaging Profile to Campaign
└─ Takes a few hours to complete

Step 6: Start Sending Messages
└─ Campaign ready for SMS traffic
```

---

## CHURCH-SPECIFIC CONFIGURATION

### For Religion/Church Use Case:

**Brand Creation:**
```json
{
  "entityType": "NON_PROFIT",
  "displayName": "Church Name",
  "companyName": "Church Legal Name",
  "ein": "XX-XXXXXXX",
  "country": "US",
  "email": "contact@church.com",
  "vertical": "RELIGION",
  "phone": "+1-XXX-XXX-XXXX",
  "street": "123 Main St",
  "city": "City",
  "state": "ST",
  "postalCode": "12345"
}
```

**Campaign Creation (Example):**
```json
{
  "brandId": "4b20017f-8da9-a992-a6c0-683072fb7729",
  "usecase": "NOTIFICATIONS",
  "description": "Church notification messages for members",
  "sample1": "Church announcement: Service time changed to 5 PM",
  "subscriberOptin": true,
  "optinKeywords": "START,JOIN",
  "optinMessage": "You've been added to church notifications. Reply STOP to unsubscribe.",
  "subscriberOptout": true,
  "optoutKeywords": "STOP,UNSUBSCRIBE",
  "optoutMessage": "You've been removed from church notifications.",
  "subscriberHelp": true,
  "helpKeywords": "HELP,INFO",
  "helpMessage": "For church notifications support, reply HELP for more information.",
  "termsAndConditions": true
}
```

---

## CAMPAIGN STATUS VALUES

**campaignStatus progression:**
- `TCR_PENDING` → Campaign submitted to registry
- `TCR_ACCEPTED` → Registry accepted, moving to Telnyx review
- `TCR_FAILED` → Registry rejected
- `TELNYX_ACCEPTED` → Telnyx compliance approved
- `TELNYX_FAILED` → Telnyx rejected
- `MNO_PENDING` → Waiting for carrier (MNO) approval
- `MNO_ACCEPTED` → Carrier accepted
- `MNO_REJECTED` → Carrier rejected
- `MNO_PROVISIONED` → ✅ READY TO SEND! (Final approval)

---

## Document Note
This documentation was fully extracted from "YWMESSAGING PM WAY.docx". All Brand, Campaign, and Phone Number Assignment APIs are now documented.
