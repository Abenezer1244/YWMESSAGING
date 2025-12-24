# Phase 4: Admin MFA - Implementation Plan

**Target**: 3-4 hours
**Status**: Planning

---

## Overview

Implement Multi-Factor Authentication (MFA) for admin accounts using:
- **TOTP** (Time-based One-Time Password) - Google Authenticator, Authy, Microsoft Authenticator, etc.
- **QR Code** - Easy setup for users
- **Recovery Codes** - Backup access if phone is lost
- **SMS backup** - Optional secondary backup

---

## Architecture

### MFA Flow

**Enable MFA**:
1. Admin clicks "Enable Two-Factor Authentication"
2. System generates TOTP secret
3. QR code displayed (encodes secret + user email)
4. Admin scans with authenticator app
5. Admin enters TOTP code to verify setup
6. Recovery codes generated and displayed
7. Admin saves recovery codes
8. MFA enabled

**Login with MFA**:
1. Admin enters email + password (normal login)
2. If password correct AND MFA enabled:
   - Request TOTP code or recovery code
   - Show verification screen
3. Admin enters 6-digit TOTP code (or recovery code)
4. Verify code is valid
5. Generate session tokens
6. If recovery code used: remove that code, don't show again

**Disable MFA**:
1. Admin enters current TOTP code (verification)
2. MFA settings deleted
3. Recovery codes invalidated

---

## Dependencies

### Install speakeasy
```bash
npm install speakeasy qrcode
npm install --save-dev @types/speakeasy
```

**Why speakeasy**:
- Battle-tested TOTP library
- Used by major companies
- Simple API for TOTP generation and verification
- Widely compatible with authenticator apps

**Why qrcode**:
- Generates QR code images
- Returns as data URL for display
- Simple integration with response

---

## Database Changes

### New Model: AdminMFA

```prisma
model AdminMFA {
  id                  String   @id @default(cuid())
  adminId             String   @unique
  totpSecret          String   // Encrypted TOTP secret
  mfaEnabled          Boolean  @default(false)
  backupCodesUsed     String   @default("[]") // JSON array of used code indices
  enabledAt           DateTime?
  disabledAt          DateTime?
  lastVerifiedAt      DateTime?

  admin               Admin    @relation(fields: [adminId], references: [id], onDelete: Cascade)

  @@index([adminId])
  @@index([mfaEnabled])
}
```

### New Model: MFARecoveryCode

```prisma
model MFARecoveryCode {
  id                  String   @id @default(cuid())
  adminId             String
  code                String   @unique // Hashed recovery code
  index               Int      // Position in recovery codes list
  usedAt              DateTime?
  createdAt           DateTime @default(now())

  @@unique([adminId, index])
  @@index([adminId])
  @@index([usedAt]) // For finding unused codes
}
```

---

## Service Implementation

### New File: `src/services/mfa.service.ts`

**Functions**:

```typescript
// Generate TOTP secret and QR code
export async function generateMFASecret(email: string): Promise<{
  secret: string;
  qrCodeUrl: string;
}>

// Enable MFA for admin
export async function enableMFA(adminId: string, totpSecret: string, verifyCode: string): Promise<{
  recoveryCodes: string[];
  backupCodesMessage: string;
}>

// Verify TOTP code
export async function verifyTOTPCode(adminId: string, code: string): Promise<boolean>

// Verify recovery code
export async function verifyRecoveryCode(adminId: string, code: string): Promise<boolean>

// Disable MFA
export async function disableMFA(adminId: string, verifyCode: string): Promise<void>

// Get MFA status
export async function getMFAStatus(adminId: string): Promise<{
  mfaEnabled: boolean;
  backupCodesRemaining: number;
  enabledAt: DateTime | null;
}>

// Generate recovery codes
export async function generateRecoveryCodes(adminId: string, count: number = 10): Promise<string[]>

// Mark recovery code as used
export async function markRecoveryCodeAsUsed(adminId: string, code: string): Promise<void>
```

---

## Controller Implementation

### New File: `src/controllers/mfa.controller.ts`

**Routes**:

```typescript
// GET /api/mfa/status - Check if MFA enabled
export async function getMFAStatus(req: Request, res: Response)

// POST /api/mfa/enable/initiate - Start MFA setup (get QR code)
export async function initiateMFASetup(req: Request, res: Response)

// POST /api/mfa/enable/verify - Complete MFA setup with verification code
export async function verifyMFASetup(req: Request, res: Response)

// POST /api/mfa/disable - Disable MFA (requires verification code)
export async function disableMFA(req: Request, res: Response)

// GET /api/mfa/recovery-codes - Get count of remaining recovery codes
export async function getRecoveryCodeStatus(req: Request, res: Response)

// POST /api/mfa/regenerate-recovery-codes - Generate new recovery codes
export async function regenerateRecoveryCodes(req: Request, res: Response)
```

---

## Login Flow Changes

### Modified File: `src/controllers/auth.controller.ts`

**Update login endpoint**:

```typescript
export async function login(input: LoginInput): Promise<LoginResponse> {
  // Existing: verify email + password
  const passwordMatch = await comparePassword(input.password, admin.passwordHash);

  // NEW: Check if MFA enabled
  if (mfaEnabled) {
    // Return partial response requiring TOTP
    return {
      requiresMFA: true,
      sessionToken: tempSessionToken,  // Temporary token valid for 5 minutes
      message: "Enter your 6-digit code from authenticator app or recovery code"
    };
  }

  // Existing: generate tokens and return
  return loginResponse;
}
```

**New MFA verification endpoint**:

```typescript
// POST /api/auth/verify-mfa
export async function verifyMFA(req: Request, res: Response) {
  const { sessionToken, code } = req.body;

  // Verify temporary session token
  // Verify TOTP code OR recovery code
  // Generate final access/refresh tokens
  // Mark recovery code as used if applicable

  return loginResponse;
}
```

---

## Routes

### New File: `src/routes/mfa.routes.ts`

```typescript
router.get('/status', authenticateToken, getMFAStatus);
router.post('/enable/initiate', authenticateToken, initiateMFASetup);
router.post('/enable/verify', authenticateToken, verifyMFASetup);
router.post('/disable', authenticateToken, disableMFA);
router.get('/recovery-codes', authenticateToken, getRecoveryCodeStatus);
router.post('/regenerate-recovery-codes', authenticateToken, regenerateRecoveryCodes);
```

---

## API Response Examples

### Enable MFA - Initiate

**POST /api/mfa/enable/initiate**

```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCodeUrl": "data:image/png;base64,...",
    "manualEntryKey": "JBSWY3DPEHPK3PXP",
    "timeRemaining": 30,
    "message": "Scan this QR code with your authenticator app, or enter the key manually"
  }
}
```

### Enable MFA - Verify

**POST /api/mfa/enable/verify**

```json
{
  "success": true,
  "data": {
    "mfaEnabled": true,
    "recoveryCodes": [
      "ABC12-34567",
      "DEF89-01234",
      ...
    ],
    "message": "Save these recovery codes in a safe place. You can use them if you lose access to your authenticator app.",
    "backupCodesMessage": "Keep a copy of these codes secure. Each code can only be used once."
  }
}
```

### Login with MFA

**POST /api/auth/login** (with MFA enabled)

```json
{
  "success": true,
  "requiresMFA": true,
  "sessionToken": "sess_temp_xyz",
  "message": "Two-factor authentication required. Enter your 6-digit code."
}
```

### Verify MFA

**POST /api/auth/verify-mfa**

```json
{
  "success": true,
  "accessToken": "...",
  "refreshToken": "...",
  "admin": { ... },
  "church": { ... }
}
```

---

## Security Considerations

### TOTP Secret Storage
- Encrypt secrets using AES-256-GCM (same as email encryption in Phase 5)
- Never store plaintext secrets
- Include salt for additional security

### Recovery Codes
- Generate 10 codes (8 characters each)
- Hash codes before storage (bcrypt)
- Each code can only be used once
- Track index of used codes

### Session Tokens
- Temporary session token valid for 5 minutes
- Can only be used for MFA verification endpoint
- Marked as temporary in JWT payload
- Auto-invalidates after successful MFA or expiry

### Rate Limiting
- MFA verification endpoint rate-limited
- After 5 failed attempts: lock for 15 minutes
- Log failed MFA attempts for security audit

### Backup Codes
- Never display same code twice
- Warn user when low on backup codes
- Require TOTP to regenerate
- Show count of remaining codes

---

## Implementation Order

1. **Database Models** (15 min)
   - Add AdminMFA model
   - Add MFARecoveryCode model
   - Generate Prisma client

2. **Install Dependencies** (5 min)
   - `npm install speakeasy qrcode`
   - Add type definitions

3. **MFA Service** (45 min)
   - TOTP secret generation
   - QR code generation
   - TOTP verification
   - Recovery code generation and verification
   - Enable/disable MFA

4. **MFA Routes & Controller** (45 min)
   - GET /api/mfa/status
   - POST /api/mfa/enable/initiate
   - POST /api/mfa/enable/verify
   - POST /api/mfa/disable
   - GET /api/mfa/recovery-codes
   - POST /api/mfa/regenerate-recovery-codes

5. **Auth Flow Changes** (45 min)
   - Modify login endpoint
   - Add POST /api/auth/verify-mfa
   - Handle temporary session tokens
   - Update JWT payload for temporary sessions

6. **Middleware Updates** (15 min)
   - Update auth middleware to handle temporary tokens
   - Rate limiting for MFA verification

7. **Testing** (30 min)
   - Test MFA enable flow
   - Test TOTP verification
   - Test recovery codes
   - Test login with MFA
   - Test MFA disable

---

## Expected Timeline

- Models + Dependencies: 20 min
- MFA Service: 45 min
- Controllers + Routes: 45 min
- Auth Flow Changes: 30 min
- Testing: 30 min
- **Total**: ~2.5 hours

---

## Test Cases

### MFA Enable Flow
- [x] GET status returns mfaEnabled: false
- [x] Initiate shows QR code and secret
- [x] Secret can be manually entered
- [x] Verify with correct code enables MFA
- [x] Verify with incorrect code fails
- [x] Recovery codes displayed after enable
- [x] Each recovery code unique

### MFA Verification
- [x] TOTP code with correct digits works
- [x] TOTP code off by 30 seconds still works (time skew)
- [x] Recovery code works as alternative
- [x] Each recovery code can only be used once
- [x] Using recovery code removes it from list

### Login with MFA
- [x] Correct password + correct TOTP works
- [x] Correct password + wrong TOTP fails
- [x] Correct password + recovery code works
- [x] Password incorrect skips MFA check

### MFA Disable
- [x] Disable requires current TOTP verification
- [x] Disable with wrong code fails
- [x] After disable, login doesn't ask for MFA
- [x] Recovery codes invalidated

### Recovery Codes
- [x] 10 codes generated
- [x] Each code 8 characters
- [x] Codes are cryptographically random
- [x] Low code warning at < 3 codes
- [x] Can regenerate codes with TOTP

---

**Status**: Ready for implementation
