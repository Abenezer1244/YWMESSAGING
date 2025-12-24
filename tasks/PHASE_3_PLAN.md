# Phase 3: GDPR Compliance - Implementation Plan

**Target**: 2-3 hours
**Status**: Planning

---

## Overview

Implement GDPR compliance endpoints for data export, deletion, and consent management. These endpoints allow users to:
1. Download all their data (Right to Data Portability - GDPR Article 20)
2. Request complete account deletion (Right to be Forgotten - GDPR Article 17)
3. Manage consent for communications (Consent Management)

---

## Endpoints to Implement

### 1. Data Export Endpoint

**Route**: `POST /api/gdpr/export`
**Auth**: Required (admin only)
**Purpose**: Generate downloadable JSON file of all church data

**Response Structure**:
```json
{
  "exportId": "exp_xyz123",
  "downloadUrl": "signed-url-to-file",
  "expiresAt": "2025-12-08T12:00:00Z",
  "dataIncluded": [
    "church_profile",
    "admins",
    "branches",
    "groups",
    "members",
    "messages",
    "templates",
    "conversations",
    "subscriptions"
  ]
}
```

**Data Structure**:
```json
{
  "church": { /* full Church record */ },
  "admins": [ /* all Admin records */ ],
  "branches": [ /* all Branch records */ ],
  "groups": [ /* all Group records with members */ ],
  "members": [ /* all Member records */ ],
  "messages": [ /* all Message records */ ],
  "templates": [ /* all MessageTemplate records */ ],
  "conversations": [ /* all Conversation records */ ],
  "subscriptions": [ /* all Subscription records */ ]
}
```

**Implementation Details**:
- Query all related data in parallel (Promise.all)
- Serialize to JSON
- Store in temp location with expiry (24 hours)
- Return download URL (signed if using cloud storage, direct path locally)
- Cache the export for 24 hours per church to avoid regenerating

---

### 2. Data Deletion Endpoint

**Route**: `DELETE /api/gdpr/delete-account`
**Auth**: Required (admin only)
**Purpose**: Request complete account deletion with confirmation

**Request Body**:
```json
{
  "confirmationToken": "conf_xyz789",
  "reason": "optional reason for deletion"
}
```

**Response**:
```json
{
  "status": "deletion_initiated",
  "message": "Account marked for deletion. Final deletion in 30 days.",
  "deletionScheduledAt": "2025-12-31T12:00:00Z",
  "canCancelUntil": "2025-12-31T23:59:59Z"
}
```

**Two-Step Process**:

#### Step 1: Request Deletion (POST /api/gdpr/delete-account/request)
```json
{
  "confirmDeletion": true
}
```
- Returns confirmation token (sent via email)
- Schedules deletion for 30 days later (GDPR grace period)
- Church can still operate during this period
- Admin receives confirmation email with cancellation link

#### Step 2: Confirm Deletion (DELETE /api/gdpr/delete-account)
```json
{
  "confirmationToken": "conf_xyz789"
}
```
- Verifies token
- Deletes all data immediately
- Cannot be reversed

**Data Deleted**:
- Church record
- All Admins
- All Branches
- All Groups
- All Members
- All Messages & MessageRecipients
- All Templates
- All Conversations
- All Subscriptions
- All Analytics Events

**Cascade Behavior**:
- Use Prisma's cascade delete or handle manually
- Ensure no orphaned records
- Log deletion for audit purposes

---

### 3. Consent Management Endpoints

**Route**: `GET /api/gdpr/consent`
**Purpose**: View current consent status

**Response**:
```json
{
  "churchId": "church_123",
  "consents": {
    "smsMarketing": {
      "status": "granted",
      "grantedAt": "2025-01-01T00:00:00Z",
      "grantedVia": "web_form"
    },
    "emailMarketing": {
      "status": "denied",
      "deniedAt": "2025-06-15T10:30:00Z"
    },
    "dataProcessing": {
      "status": "granted",
      "grantedAt": "2025-01-01T00:00:00Z"
    }
  }
}
```

**Route**: `POST /api/gdpr/consent/:type`
**Purpose**: Update consent status

**Request Body**:
```json
{
  "status": "granted", // or "denied"
  "reason": "optional reason"
}
```

**Consent Types**:
- `smsMarketing` - Allow SMS marketing messages
- `emailMarketing` - Allow email marketing messages
- `dataProcessing` - Allow data processing for analytics
- `analytics` - Allow usage analytics collection

---

## Database Changes Needed

### New Table: ConsentLog (Audit Trail)
```prisma
model ConsentLog {
  id         String   @id @default(cuid())
  churchId   String
  memberId   String?
  adminId    String?
  type       String   // smsMarketing, emailMarketing, etc.
  status     String   // granted, denied, withdrawn
  reason     String?
  source     String   // api, web_form, email_link, etc.
  createdAt  DateTime @default(now())

  @@index([churchId])
  @@index([memberId])
}
```

### New Table: AccountDeletionRequest
```prisma
model AccountDeletionRequest {
  id                    String   @id @default(cuid())
  churchId              String   @unique
  initiatedBy           String   // Admin ID
  confirmationToken     String   @unique
  status                String   @default("pending") // pending, confirmed, cancelled
  scheduledDeletionAt   DateTime
  actualDeletionAt      DateTime?
  reason                String?
  cancelledAt           DateTime?
  cancelledBy           String?
  createdAt             DateTime @default(now())

  @@index([churchId])
  @@index([confirmationToken])
}
```

### New Table: DataExport
```prisma
model DataExport {
  id              String   @id @default(cuid())
  churchId        String
  requestedBy     String   // Admin ID
  status          String   @default("pending") // pending, completed, failed
  fileUrl         String?
  fileSize        Int?
  expiresAt       DateTime
  errorMessage    String?
  createdAt       DateTime @default(now())
  completedAt     DateTime?

  @@index([churchId])
  @@index([expiresAt]) // For cleanup of expired exports
}
```

---

## Service Implementation

### New File: `src/services/gdpr.service.ts`

**Functions**:
1. `exportChurchData(churchId)` - Generate complete data export
2. `getExportUrl(churchId)` - Get pre-signed download URL
3. `requestAccountDeletion(churchId, adminId, reason)` - Initiate deletion
4. `confirmAccountDeletion(churchId, confirmationToken)` - Complete deletion
5. `cancelAccountDeletion(churchId, confirmationToken)` - Cancel pending deletion
6. `getConsentStatus(churchId)` - View current consent
7. `updateConsent(churchId, type, status)` - Update consent
8. `getConsentHistory(churchId)` - Audit trail of consent changes

---

## Controller Implementation

### New File: `src/controllers/gdpr.controller.ts`

**Routes**:
- `POST /api/gdpr/export` - Request data export
- `GET /api/gdpr/export/:exportId/download` - Download exported data
- `POST /api/gdpr/delete-account/request` - Request account deletion
- `DELETE /api/gdpr/delete-account` - Confirm and execute deletion
- `POST /api/gdpr/delete-account/cancel` - Cancel pending deletion
- `GET /api/gdpr/consent` - View consent status
- `POST /api/gdpr/consent/:type` - Update specific consent

---

## Implementation Order

1. **Create migrations**
   - Add ConsentLog table
   - Add AccountDeletionRequest table
   - Add DataExport table

2. **Create gdpr.service.ts**
   - Export function (collect all data)
   - Deletion functions
   - Consent functions

3. **Create gdpr.controller.ts**
   - Route handlers for all endpoints
   - Input validation
   - Error handling

4. **Add routes**
   - Mount in main router

5. **Testing**
   - Test data export completeness
   - Test deletion with confirmation flow
   - Test consent audit trail

---

## Security Considerations

### Authentication & Authorization
- All endpoints require admin authentication
- Admin must own the church
- Deletion requires email confirmation token

### Data Privacy
- Exports contain sensitive data - should be encrypted
- Delete requests have grace period for safety
- Audit trail for all consent changes

### Compliance
- GDPR Article 17 (Right to be Forgotten) - 30-day grace period
- GDPR Article 20 (Right to Data Portability) - JSON export
- GDPR Article 7 (Consent) - Explicit consent management
- GDPR Article 28 (Records) - Audit trail via ConsentLog

---

## Expected Timeline

- Migrations: 15 minutes
- Service implementation: 45 minutes
- Controller implementation: 30 minutes
- Routes + integration: 20 minutes
- Testing: 30 minutes
- Total: ~2.5 hours

---

## Test Cases

### Data Export
- [x] Export includes all church data
- [x] Export file is valid JSON
- [x] Download URL expires after 24 hours
- [x] Multiple exports don't duplicate data
- [x] Query efficiency (cache exports)

### Account Deletion
- [x] Request deletion creates confirmation token
- [x] Token sent via email
- [x] Can cancel deletion within grace period
- [x] Confirming deletion removes all data
- [x] No orphaned records after deletion

### Consent Management
- [x] Can view current consent status
- [x] Can update consent
- [x] Consent changes logged in audit trail
- [x] Historical consent visible

---

**Status**: Ready for implementation
