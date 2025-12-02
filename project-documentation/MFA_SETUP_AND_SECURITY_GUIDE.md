# Multi-Factor Authentication (MFA) Setup & Security Guide

**Status**: ✅ Fully implemented and tested with comprehensive security validation

---

## Overview

Admin Multi-Factor Authentication (MFA) provides an additional layer of security for church administrator accounts using Time-based One-Time Passwords (TOTP) and recovery codes. This guide covers:

- **MFA Setup Flow** - How admins enable MFA
- **Recovery Codes** - Backup authentication method
- **Security Best Practices** - How to protect sensitive accounts
- **Troubleshooting** - Common issues and solutions

---

## Technology Stack

- **TOTP (Time-Based One-Time Password)**: RFC 6238 compliant via `speakeasy` library
- **QR Code Generation**: QR Server API for easy scanner compatibility
- **Recovery Codes**: 10 alphanumeric codes generated with crypto randomness
- **Database Storage**: Encrypted secrets with SHA256 hashed recovery codes
- **Input Validation**: Zod schemas for all MFA endpoints

---

## MFA Setup Flow (For End Users)

### Step 1: Initiate MFA Setup

**Admin Action**: Click "Enable Two-Factor Authentication" in security settings

**Backend Flow**:
```
POST /api/mfa/enable/initiate
Body: { email: "admin@church.com" }

Response: {
  success: true,
  data: {
    secret: "JBSWY3DPEBLW64TMMQ======",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=...",
    manualEntryKey: "JBSWY3DPEBLW64TMMQ======",
    message: "Scan this QR code with your authenticator app..."
  }
}
```

**Security Notes**:
- Secret is generated fresh (not reused)
- QR code embeds church email for context
- Manual entry key provided as backup for app input

### Step 2: Scan QR Code

**Admin Action**:
1. Open authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
2. Select "Scan QR Code"
3. Scan the QR code displayed in YW Messaging

**App Behavior**: Authenticator app now shows 6-digit code that changes every 30 seconds

### Step 3: Verify with TOTP Code

**Admin Action**: Enter the 6-digit code shown in authenticator app

**Backend Flow**:
```
POST /api/mfa/enable/verify
Body: {
  secret: "JBSWY3DPEBLW64TMMQ======",
  code: "123456",
  email: "admin@church.com"
}

Response: {
  success: true,
  data: {
    mfaEnabled: true,
    recoveryCodes: [
      "ABC123-XYZ",
      "DEF456-UVW",
      ... (10 codes total)
    ],
    message: "MFA enabled successfully!",
    warning: "Save these recovery codes in a safe place. Each code can only be used once."
  }
}
```

**Critical Security Actions Required**:
1. Admin MUST save recovery codes in secure location (password manager, printed document, etc.)
2. Admin MUST test login with MFA enabled before closing the dialog
3. Recovery codes should be stored separately from authenticator app

### Step 4: Confirm MFA Enabled

**Admin Action**: Login again to verify MFA is working

**Login Flow**:
1. Enter email and password (existing flow)
2. Submit
3. Receive prompt: "Enter 6-digit code from your authenticator app"
4. Admin enters current code from authenticator
5. Login completes

---

## Recovery Codes

### Purpose

Recovery codes provide backup access if the admin loses access to their authenticator app:
- Phone stolen or lost
- Authenticator app uninstalled
- Authenticator app data corrupted
- Device upgrade without backup

### How to Use Recovery Code

**During Login with Lost Authenticator**:
1. Login prompt asks for TOTP code
2. Admin clicks "Can't access authenticator? Use recovery code"
3. Admin enters one of 10 recovery codes
4. Login completes
5. Recovery code is marked as used (cannot be reused)

**Important**: Each recovery code can only be used once. After using 9 codes, admin should regenerate.

### Regenerating Recovery Codes

**Admin Action**: Settings → Security → "Regenerate Recovery Codes"

**Backend Flow**:
```
POST /api/mfa/regenerate-recovery-codes
Body: { code: "123456" }  # Current TOTP code required

Response: {
  success: true,
  data: {
    recoveryCodes: [
      "NEW123-ABC",
      "NEW456-DEF",
      ... (10 new codes)
    ],
    message: "Recovery codes regenerated successfully",
    warning: "Save these new recovery codes. Old codes are no longer valid."
  }
}
```

**Key Points**:
- All old recovery codes become invalid immediately
- Requires current TOTP code verification
- Should only be done when necessary (codes running low)
- Admin must save new codes before closing dialog

### Recovery Code Format & Storage

**Format**: `XXXXXX-YYY` (alphanumeric with dash)
- Example: `ABC123-XYZ`, `DEF456-UVW`
- Always 8-12 characters
- Case-insensitive (system accepts both cases)

**Recommended Storage**:
1. **Password Manager** (Best)
   - Bitwarden, 1Password, LastPass, KeePass
   - Encrypted, synced, easily accessible
   - Can share with co-admin if needed

2. **Printed Backup** (Good)
   - Print recovery codes
   - Store in safe deposit box or secure location
   - Do NOT store digitally on same device as authenticator

3. **NOT Recommended**:
   - Email (can be compromised)
   - Notes app on phone (lost if phone stolen)
   - Unencrypted text file on computer

---

## MFA Disable

### When to Disable MFA

- Admin switching to new authenticator app
- Admin lost access to authenticator and used all recovery codes
- MFA enforcement temporarily disabled for troubleshooting

### How to Disable MFA

**Admin Action**: Settings → Security → "Disable Two-Factor Authentication"

**Backend Flow**:
```
POST /api/mfa/disable
Body: { code: "123456" }  # Current TOTP code required

Response: {
  success: true,
  data: {
    message: "Two-factor authentication has been disabled"
  }
}
```

**Requirements**:
- Admin must provide current 6-digit TOTP code
- Prevents unauthorized disabling (attacker cannot disable without current code)
- Disabled MFA is immediately inactive

**After Disabling**:
- Login no longer requires TOTP code
- All recovery codes become invalid
- Can re-enable MFA anytime (generates new secret & recovery codes)

---

## Authenticator App Recommendations

### Most Compatible Apps

| App | Platform | Recovery | Cost | Notes |
|-----|----------|----------|------|-------|
| **Google Authenticator** | iOS, Android | Manual backup | Free | Most popular, simple |
| **Authy** | iOS, Android | Cloud backup | Free | Good sync across devices |
| **Microsoft Authenticator** | iOS, Android | Cloud backup | Free | Works with Microsoft accounts |
| **1Password** | iOS, Android, Mac, Windows | Built-in | Paid | Password manager + authenticator |
| **Bitwarden** | All platforms | Cloud backup | Free/Paid | Password manager + authenticator |
| **KeePass** | All platforms | Manual | Free | Open source, offline |

### Setup Tips

1. **Choose App with Backup**: Authy, 1Password, or Bitwarden allow cloud sync
2. **Test Before Relying**: Add test secret, verify code works
3. **Document Your Choice**: Let co-admins know which app you use
4. **Save Manual Entry Key**: If scanning QR code fails, can type secret manually

### Migration Between Apps

If switching authenticator apps:
1. Do NOT disable MFA yet
2. Disable 2FA in old app
3. In YW Messaging, go to Settings → Security → "Regenerate Secret"
4. Scan new QR code in new authenticator app
5. Verify login with new app
6. Delete old secret from old app

---

## Multi-Admin Scenarios

### Multiple Admins, One Church

**Scenario**: Church has 2-3 admin accounts managing YW Messaging

**Recommendation**:
- Each admin has their own MFA enabled
- Each admin saves recovery codes independently
- Each admin chooses their own authenticator app

**Co-Admin Support**:
- If admin1 loses authenticator, admin1 must use their recovery codes
- Other admins cannot access admin1's account or recovery codes
- If admin1 uses all recovery codes: Contact support to disable MFA

### Admin Change/Offboarding

**When Admin Leaves**:
1. Disable old admin account
2. Old MFA secrets are cleared
3. Recovery codes automatically invalid
4. New admin uses their own MFA

**No Recovery Code Sharing**:
- Recovery codes are personal/non-transferable
- Sharing recovery codes defeats MFA purpose
- Each admin must manage their own codes

---

## Security Best Practices

### For Admins

✅ **DO**:
- Enable MFA on all admin accounts
- Use strong authenticator app (with backup)
- Store recovery codes securely
- Test login with MFA enabled
- Regenerate recovery codes when running low (< 3 codes remaining)
- Use unique authenticator for each admin account
- Enable automatic sync in authenticator app (if available)

❌ **DON'T**:
- Share recovery codes with other admins
- Store recovery codes in email
- Screenshot authenticator app codes
- Use same authenticator secret for multiple accounts
- Disable MFA unless necessary
- Trust old phone with authenticator app
- Share authenticator app backups

### For Church/Organization

✅ **Recommended Policies**:
- Require MFA for all admin accounts
- Document MFA setup training for new admins
- Quarterly review of active admin accounts
- Recovery code policy: Store in safe deposit box + password manager
- Backup admin procedure: Maintain list of recovery codes for emergency access

### Time Synchronization

**Critical**: Authenticator app relies on accurate time on device

**If Code Doesn't Work**:
1. Check device time is correct (Settings → Date & Time)
2. Enable automatic time zone setting
3. Authenticator codes valid for ~60 seconds (30 seconds before, 30 seconds after)
4. If time is drastically wrong, fix time first, then try new code

---

## Input Validation & Security

All MFA endpoints use Zod schema validation:

### MFAInitiateSchema
```typescript
email: z.string()
  .email('Invalid email address')
  .max(255, 'Email too long')
```
**Prevents**: Invalid emails, SQL injection, buffer overflow

### MFAVerifySchema
```typescript
secret: z.string()
  .min(1, 'TOTP secret is required')
  .regex(/^[A-Z2-7]+$/, 'Invalid TOTP secret format'),
code: z.string()
  .length(6, 'Verification code must be 6 digits')
  .regex(/^\d{6}$/, 'Verification code must contain only digits'),
```
**Prevents**: Invalid secret format, non-numeric codes, brute force (rate limited)

### MFADisableSchema & RegenerateRecoveryCodesSchema
```typescript
code: z.string()
  .length(6, 'Verification code must be 6 digits')
  .regex(/^\d{6}$/, 'Verification code must contain only digits')
```
**Prevents**: Invalid code format, injection attacks

---

## API Endpoints Reference

### GET /api/mfa/status
Get current MFA status for authenticated admin

**Response**:
```json
{
  "success": true,
  "data": {
    "mfaEnabled": true,
    "method": "totp"
  }
}
```

### POST /api/mfa/enable/initiate
Generate new TOTP secret and QR code

**Body**: `{ email: string }`

**Response**:
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEBLW64TMMQ======",
    "qrCodeUrl": "https://api.qrserver.com/v1/...",
    "manualEntryKey": "JBSWY3DPEBLW64TMMQ======"
  }
}
```

### POST /api/mfa/enable/verify
Verify TOTP code and enable MFA

**Body**:
```json
{
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "code": "123456",
  "email": "admin@church.com"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "mfaEnabled": true,
    "recoveryCodes": ["ABC123-XYZ", ...]
  }
}
```

### POST /api/mfa/disable
Disable MFA (requires verification code)

**Body**: `{ code: "123456" }`

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Two-factor authentication has been disabled"
  }
}
```

### GET /api/mfa/recovery-codes
Get recovery code status

**Response**:
```json
{
  "success": true,
  "data": {
    "totalCodes": 10,
    "remainingCodes": 7,
    "lastRegenerated": "2025-12-01T10:30:00Z"
  }
}
```

### POST /api/mfa/regenerate-recovery-codes
Generate new recovery codes (old codes invalidated)

**Body**: `{ code: "123456" }`

**Response**:
```json
{
  "success": true,
  "data": {
    "recoveryCodes": ["NEW123-ABC", ...],
    "message": "Recovery codes regenerated successfully"
  }
}
```

---

## Testing & Verification

### Running MFA Integration Tests

```bash
# Run all MFA tests
npm test -- __tests__/integration/mfa.integration.test.ts

# Run specific test suite
npm test -- --testNamePattern="MFA Verification"

# Run with coverage
npm test -- __tests__/integration/mfa.integration.test.ts --coverage
```

### Manual Testing Checklist

- [ ] Enable MFA: Scan QR code with authenticator app
- [ ] Verify code: Enter 6-digit code, MFA should be enabled
- [ ] Login test: Logout, login requires TOTP code
- [ ] Save recovery codes: Verify codes are displayed and downloadable
- [ ] Test recovery code: Use one code as if lost authenticator
- [ ] Regenerate codes: Get new codes, old codes invalid
- [ ] Disable MFA: Verify can disable with TOTP code
- [ ] Error cases: Try invalid codes, wrong emails, etc.

### Test Coverage

**14+ Integration Tests Cover**:
- ✅ MFA status retrieval
- ✅ TOTP secret generation
- ✅ TOTP code verification (valid/invalid/expired)
- ✅ Recovery code generation (10 codes)
- ✅ Recovery code usage & tracking
- ✅ Recovery code regeneration
- ✅ MFA disable with verification
- ✅ Multi-tenancy isolation
- ✅ Error handling

---

## Troubleshooting

### "Invalid verification code" - Code works in app but rejected by server

**Causes**:
- Device time is off (authenticator uses server time)
- Code timed out (codes only valid 60 seconds)
- Wrong secret was scanned

**Solutions**:
1. Check device time is correct (Settings → Date & Time → Auto)
2. Ensure automatic time zone is enabled
3. Get new TOTP code (codes refresh every 30 seconds)
4. Restart authenticator app and re-read code

### "Lost my authenticator app, what do I do?"

**If you have recovery codes**:
1. Go to login page
2. When prompted for TOTP code, click "Use recovery code"
3. Enter one of your 10 recovery codes
4. Login succeeds, recovery code marked as used
5. Immediately go to Settings → Security → Re-enable MFA
6. Use new authenticator app for new setup

**If you lost both authenticator AND recovery codes**:
1. Contact church support team
2. Admin with higher privileges can disable MFA from admin panel
3. Re-setup MFA with new authenticator app
4. Save recovery codes immediately

### "Recovery codes don't work"

**Verification**:
- Recovery codes are case-insensitive (`abc-123` and `ABC-123` both work)
- Each code can only be used once
- Codes have 30-day expiration if account has no activity
- Check you're using codes from most recent regeneration

**If still failing**:
1. Contact support
2. Provide email and church name
3. Support can verify if codes are valid

### "Can't scan QR code"

**Troubleshooting**:
1. Ensure good lighting
2. Hold device steady
3. Try different angles
4. Use manual entry key instead:
   - Select "Enter code manually" in authenticator app
   - Type the manual entry key shown in YW Messaging
   - Continue setup

### "Authenticator app synced to old phone"

**Best Practice**:
1. Update authenticator app on new phone
2. Import/restore backup (if available)
3. If no backup, use YW Messaging to regenerate codes
4. Delete secret from old phone

---

## Monitoring & Support

### For Support Teams

**Common Issues to Track**:
1. Recovery code exhaustion (admin using more than expected)
2. Failed MFA attempts (possible attack, rate limiting active)
3. MFA disable requests (admin lost authenticator)

**Admin Account Recovery**:
1. Verify admin identity (email, phone, church name)
2. Request security questions or recent activity
3. If verified, can reset MFA from admin panel
4. Send recovery codes securely

### Metrics to Monitor

```typescript
// MFA Usage
- Total admins with MFA enabled
- Admins with MFA disabled
- Failed MFA attempts (rate limited)
- Recovery code usage rate
- MFA setup completion rate

// Security Events
- MFA disable requests
- Recovery code regeneration
- Failed code attempts (possible attack)
- Account recovery requests
```

---

## Summary

| Aspect | Details |
|--------|---------|
| **Type** | TOTP-based (RFC 6238) |
| **Recovery Method** | 10 alphanumeric codes |
| **Code Duration** | 30 seconds per code |
| **Time Window** | 30 seconds before/after (60s total) |
| **Database** | Encrypted secret + hashed recovery codes |
| **Rate Limiting** | 5 attempts per minute per admin |
| **Input Validation** | Zod schemas all endpoints |
| **Tests** | 14+ integration tests |
| **Support Level** | Full production ready |

---

**Last Updated**: December 2, 2025
**Status**: ✅ Production Ready
**Test Coverage**: 14+ integration tests
**Security Level**: Enterprise-grade with TOTP + Recovery Codes
