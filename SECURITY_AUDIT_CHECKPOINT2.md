# Security Audit Report - Checkpoint 2: Authentication & Church Setup

**Date:** 2024-10-29
**Status:** ⚠️ CRITICAL ISSUES FOUND - Action Required Before Production

---

## Executive Summary

Code review identified **7 significant security vulnerabilities** and several best practice violations. While the application functions correctly, these issues must be addressed before deployment to production.

**Critical Issues:** 2
**High Issues:** 3
**Medium Issues:** 2
**Low Issues:** 2

---

## CRITICAL ISSUES 🔴

### 1. **Tokens Stored in localStorage (CRITICAL)**

**Location:** `frontend/src/stores/authStore.ts` (lines 92-100)
**Severity:** CRITICAL - XSS Vulnerability
**Risk:** Any XSS attack allows attacker to steal both access and refresh tokens

```typescript
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: 'auth-store',
    partialize: (state) => ({
      user: state.user,
      church: state.church,
      accessToken: state.accessToken,    // ⚠️ EXPOSED TO XSS
      refreshToken: state.refreshToken,  // ⚠️ EXPOSED TO XSS
    }),
  }
);
```

**Impact:**
- localStorage is accessible to any JavaScript on the page
- XSS vulnerabilities (though unlikely in React due to auto-escaping) allow token theft
- Tokens persist across browser sessions indefinitely
- No expiration in localStorage, even if JWT expires

**Recommendation:**
- ✅ Use `httpOnly` cookies instead of localStorage (NOT accessible to JavaScript)
- ✅ Cookies automatically sent with requests (no manual attachment needed)
- ✅ Server can set `Secure` flag for HTTPS-only
- ✅ Set `SameSite=Strict` for CSRF protection
- ✅ Keep accessToken in memory only, store refreshToken in httpOnly cookie

**Fix Priority:** BEFORE PRODUCTION

---

### 2. **Email Enumeration via Error Messages (CRITICAL)**

**Location:** `backend/src/services/auth.service.ts` (line 51)
**Severity:** CRITICAL - Information Disclosure
**Risk:** Attackers can determine which emails are registered

```typescript
if (existingAdmin) {
  throw new Error('Email already registered');  // ⚠️ LEAKS EMAIL EXISTENCE
}
```

**Impact:**
- Attackers can enumerate valid email addresses
- Can perform targeted phishing attacks
- Violates privacy - reveals who has accounts
- Error message is exposed in controller (line 38)

**Recommendation:**
- ✅ Use generic message: "Registration failed" for both email exists and validation errors
- ✅ Log actual error server-side for debugging
- ✅ Same generic message for all registration failures

```typescript
// DO NOT expose specific error reasons
throw new Error('Registration failed');
```

**Fix Priority:** BEFORE PRODUCTION

---

## HIGH SEVERITY ISSUES 🟠

### 3. **No Rate Limiting on Authentication Endpoints**

**Location:** `backend/src/routes/auth.routes.ts`
**Severity:** HIGH - Brute Force Attack
**Risk:** Attackers can attempt unlimited login/registration attempts

**Impact:**
- No protection against brute force attacks on login
- No protection against credential stuffing
- No protection against registration spam
- Accounts can be locked out by attackers

**Recommendation:**
- ✅ Install `express-rate-limit` package
- ✅ Limit login attempts: 5 attempts per IP per 15 minutes
- ✅ Limit registration: 3 attempts per IP per hour
- ✅ Implement exponential backoff or account lockout

**Example Implementation:**
```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many registration attempts, please try again later',
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, loginHandler);
```

**Fix Priority:** BEFORE PRODUCTION

---

### 4. **No CSRF Protection**

**Location:** `backend/src/app.ts`
**Severity:** HIGH - CSRF Attack
**Risk:** Attackers can forge requests on behalf of authenticated users

**Impact:**
- Cross-Site Request Forgery attacks possible
- Attacker can make authenticated requests from external site
- Can perform account changes, message sending, etc. without user knowledge

**Recommendation:**
- ✅ Install `csurf` middleware for CSRF tokens
- ✅ Generate CSRF token on page load
- ✅ Validate CSRF token on state-changing requests (POST, PUT, DELETE)
- ✅ Use `SameSite=Strict` cookies for additional protection

**Example Implementation:**
```typescript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: false });

app.post('/api/auth/login', csrfProtection, loginHandler);
app.post('/api/auth/register', csrfProtection, register);

// Provide CSRF token to frontend
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

**Fix Priority:** BEFORE PRODUCTION

---

### 5. **Default JWT Secrets in Code**

**Location:** `backend/src/utils/jwt.utils.ts` (lines 3-4)
**Severity:** HIGH - Weak Secrets
**Risk:** Easy to predict secrets compromise token security

```typescript
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_key_default';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_default';
```

**Impact:**
- If environment variable not set, fallback secrets are used
- Secrets are published in code (on GitHub)
- Anyone can generate valid tokens
- No protection against token forgery

**Recommendation:**
- ✅ NEVER use default secrets
- ✅ Require environment variables to be set
- ✅ Throw error if missing
- ✅ Generate strong secrets (use `openssl rand -hex 32`)

```typescript
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in environment');
}
```

**Fix Priority:** BEFORE PRODUCTION

---

## MEDIUM SEVERITY ISSUES 🟡

### 6. **No Password Strength Requirements**

**Location:** `backend/src/controllers/auth.controller.ts` (line 25)
**Severity:** MEDIUM - Weak Password Policy
**Risk:** Users can set weak passwords

```typescript
if (password.length < 8) {
  res.status(400).json({ error: 'Password must be at least 8 characters' });
}
```

**Impact:**
- Only checks length, no complexity requirements
- Users can set passwords like "password123" (easily guessable)
- No protection against common password patterns

**Recommendation:**
- ✅ Add password strength validation
- ✅ Require: uppercase, lowercase, numbers, special characters
- ✅ Check against common password list
- ✅ Minimum 12 characters recommended

**Example:**
```typescript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
if (!passwordRegex.test(password)) {
  res.status(400).json({
    error: 'Password must be 12+ characters with uppercase, lowercase, number, and special character'
  });
}
```

**Fix Priority:** BEFORE PRODUCTION

---

### 7. **Verbose Error Logging**

**Location:** `backend/src/controllers/auth.controller.ts` (lines 37, 61, 91, 117)
**Severity:** MEDIUM - Information Disclosure
**Risk:** Error logs may expose sensitive information

```typescript
console.error('Registration error:', error);  // Could log sensitive data
console.error('Login error:', error);
console.error('Token refresh error:', error);
console.error('Get admin error:', error);
```

**Impact:**
- Error messages logged to console/files
- Stack traces may expose file paths and internal details
- Errors propagated from service layer expose business logic
- Logs accessible to server admins/attackers

**Recommendation:**
- ✅ Log minimal error info server-side
- ✅ Don't log sensitive user data
- ✅ Use proper logging library (Winston, Pino) with levels
- ✅ Separate sensitive logs to secured area

**Example:**
```typescript
import logger from '../utils/logger'; // Use proper logging library

try {
  // ...
} catch (error) {
  logger.error('Auth error', {
    errorCode: error.code,
    endpoint: 'register',
    // DO NOT log: email, password, user data
  });
  res.status(400).json({ error: 'Registration failed' });
}
```

**Fix Priority:** AFTER PRODUCTION

---

## LOW SEVERITY ISSUES 🟡

### 8. **No HTTPS Enforcement**

**Location:** `frontend/src/api/client.ts` (line 4)
**Severity:** LOW - Network Security
**Risk:** API calls could be made over unencrypted HTTP

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

**Impact:**
- Tokens and sensitive data transmitted unencrypted in production
- Man-in-the-middle attacks possible
- Only an issue in production (dev uses localhost)

**Recommendation:**
- ✅ In production, enforce HTTPS only
- ✅ Use environment variable for production URL
- ✅ Set `Strict-Transport-Security` header on backend

**Fix Priority:** PRODUCTION DEPLOYMENT

---

### 9. **Unvalidated Stripe API Key**

**Location:** `backend/src/services/stripe.service.ts` (line 5)
**Severity:** LOW - Configuration Error
**Risk:** Invalid Stripe key causes failures without warning

```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
```

**Impact:**
- Placeholder key used if environment variable not set
- Stripe operations silently fail or use test mode
- No validation that key is correct format

**Recommendation:**
- ✅ Validate environment variables at startup
- ✅ Throw error if missing or invalid
- ✅ Use same pattern as JWT secrets

**Fix Priority:** AFTER PRODUCTION

---

## SECURITY BEST PRACTICES IMPLEMENTED ✅

The following security practices are correctly implemented:

- ✅ **Password Hashing:** Uses bcrypt with 10 rounds (industry standard)
- ✅ **SQL Injection Prevention:** Uses Prisma ORM with parameterized queries
- ✅ **XSS Prevention:** React auto-escapes HTML content
- ✅ **JWT Token Expiration:** Access tokens expire in 15 minutes (good)
- ✅ **Refresh Token Rotation:** New tokens generated on refresh
- ✅ **Authorization Checks:** Auth middleware validates JWT before access
- ✅ **Church Isolation:** `authorizeChurch` prevents cross-church access
- ✅ **Input Validation:** Email format and password length checked
- ✅ **Secure Defaults:** Most security headers set via Helmet middleware
- ✅ **CORS Configuration:** Properly configured for localhost dev

---

## ACTION ITEMS - PRIORITY ORDER

### 🔴 MUST FIX BEFORE PRODUCTION

1. **[ ] Switch tokens from localStorage to httpOnly cookies**
   - Remove localStorage persistence
   - Implement cookie-based token storage
   - Update Axios client to use cookies
   - Estimated effort: 4 hours

2. **[ ] Fix email enumeration vulnerability**
   - Use generic error messages
   - Log specific errors server-side only
   - Update both controller and service
   - Estimated effort: 1 hour

3. **[ ] Add rate limiting**
   - Install `express-rate-limit`
   - Apply to `/register` and `/login` endpoints
   - Set appropriate limits
   - Estimated effort: 1 hour

4. **[ ] Add CSRF protection**
   - Install `csurf`
   - Implement CSRF token generation/validation
   - Update frontend to include CSRF token
   - Estimated effort: 2 hours

5. **[ ] Remove default JWT secrets**
   - Make environment variables required
   - Add startup validation
   - Throw error if missing
   - Estimated effort: 30 minutes

### 🟠 SHOULD FIX BEFORE PRODUCTION

6. **[ ] Enhance password strength requirements**
   - Add complexity validation
   - Check against common passwords
   - Update both frontend and backend
   - Estimated effort: 2 hours

### 🟡 SHOULD FIX SOON

7. **[ ] Implement proper logging**
   - Set up Winston or Pino logger
   - Remove console.error calls
   - Implement structured logging
   - Estimated effort: 3 hours

---

## TESTING RECOMMENDATIONS

### Security Test Cases

```bash
# Test 1: Email Enumeration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"existing@test.com", "password":"Test1234", "firstName":"John", "lastName":"Doe", "churchName":"Test Church"}'
# Should return generic "Registration failed" message

# Test 2: Brute Force Attack Prevention
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com", "password":"wrong"}'
done
# Should receive rate limit error after 5 attempts

# Test 3: XSS Token Theft (after httpOnly cookies implemented)
# Try to access localStorage.getItem('auth-store') in console
# Should return null (token in secure cookie instead)
```

---

## COMPLIANCE & STANDARDS

This application should implement:

- ✅ OWASP Top 10 2021 protections
- ⚠️ JWT best practices (RFC 8949)
- ⚠️ NIST password guidelines
- ⚠️ PCI-DSS (if handling payments)
- ⚠️ GDPR (if handling EU user data)

---

## CONCLUSION

The authentication implementation is **functionally correct** but has **critical security gaps** that must be fixed before production deployment.

**Timeline to Production:**
- With all fixes: 2-3 weeks
- With critical fixes only: 1-2 weeks

**Recommendation:** Address all 5 critical/high issues before any production deployment.

---

**Next Review:** After fixes are implemented
**Reviewed by:** Security Audit - Checkpoint 2
**Status:** 🔴 NOT APPROVED FOR PRODUCTION
