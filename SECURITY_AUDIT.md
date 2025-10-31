# Security Audit Report - UI/UX Overhaul Phase

## Executive Summary
**Risk Level: MEDIUM** - Several issues identified that require immediate attention, particularly in payment handling and authentication logging.

---

## Critical Issues 🔴

### 1. **Payment Processing Security Violation (CheckoutPage.tsx)**
**Severity:** CRITICAL
**Location:** `frontend/src/pages/CheckoutPage.tsx:86-124`

**Issue:**
- Frontend is collecting raw card data (card number, expiry, CVV)
- Direct input of sensitive payment card data violates PCI-DSS compliance
- Comment on line 47 acknowledges this: "In production, use Stripe.js"
- Current implementation stores card data in component state before sending to backend

**Risk:**
- PCI-DSS Violation (illegal for most businesses)
- Card data exposure in network requests
- Potential XSS could expose card details
- Audit failure / legal liability

**Recommendation:**
```
IMPLEMENT IMMEDIATELY:
1. Replace raw input fields with Stripe Elements or similar tokenization
2. Never accept raw card data on frontend
3. Use clientSecret to complete payment securely
4. Card data should only exist in Stripe iframe, never in React state
5. Example flow:
   - User enters card in Stripe Element (encrypted iframe)
   - Submit form → Call createPaymentIntent() → Get clientSecret
   - confirmCardPayment(clientSecret) → Stripe handles card directly
   - No card data ever touches your backend/frontend
```

---

### 2. **Debug Logging of Sensitive Data (App.tsx)**
**Severity:** CRITICAL
**Location:** `frontend/src/App.tsx:43, 59, 86`

**Issues:**
```typescript
// Line 43 - Exposes auth status and church ID
console.log('App rendering, isAuthenticated:', isAuthenticated, 'church:', church?.id);

// Line 59 - Reveals token restoration attempt
console.log('Found saved tokens in localStorage, restoring auth state');

// Line 86 - Error message logged to console
console.error('No active session:', error?.message);
```

**Risk:**
- Console logs visible to users in production
- Helps attackers understand auth flow
- Reveals church IDs and authentication state
- Error messages can expose system details

**Recommendation:**
```typescript
// Remove all console logs from production
// Use environment-based logging only in development
if (process.env.NODE_ENV === 'development') {
  console.log('App rendering, isAuthenticated:', isAuthenticated);
}

// For production errors, use error tracking service (Sentry, LogRocket)
// Never log sensitive data to console
```

---

## High Severity Issues 🟡

### 3. **Unsafe Type Casting (CheckoutPage.tsx)**
**Severity:** HIGH
**Location:** `frontend/src/pages/CheckoutPage.tsx:14`

**Issue:**
```typescript
const [planName, setPlanName] = useState<'starter' | 'growth' | 'pro' | null>(
  (searchParams.get('plan') as any) || null  // Unsafe cast!
);
```

**Risk:**
- User can pass invalid plan names via URL: `?plan=admin`, `?plan=../../etc/passwd`
- No validation of URL parameter
- Could bypass access controls if plan validation isn't enforced server-side

**Recommendation:**
```typescript
const getValidatedPlan = (plan: string | null): 'starter' | 'growth' | 'pro' | null => {
  const validPlans = ['starter', 'growth', 'pro'] as const;
  return validPlans.includes(plan as any) ? (plan as any) : null;
};

const [planName, setPlanName] = useState<'starter' | 'growth' | 'pro' | null>(
  getValidatedPlan(searchParams.get('plan'))
);
```

---

### 4. **Test Card Number Hardcoded in UI (CheckoutPage.tsx)**
**Severity:** HIGH
**Location:** `frontend/src/pages/CheckoutPage.tsx:104`

**Issue:**
```typescript
<p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2">
  Test card: 4242 4242 4242 4242
</p>
```

**Risk:**
- Test card visible in production
- Shows users testing is happening
- Can leak environment information

**Recommendation:**
```typescript
// Hide test cards behind environment check
if (process.env.NODE_ENV === 'development') {
  return <p className="text-sm text-secondary-600 mt-2">Test card: 4242 4242 4242 4242</p>;
}
return null;
```

---

### 5. **Tokens Stored in localStorage Without Proper Protection (App.tsx)**
**Severity:** HIGH
**Location:** `frontend/src/App.tsx:56-58, 77-78`

**Issue:**
- Access tokens stored in localStorage (vulnerable to XSS)
- No validation of token expiry before use
- Refresh token also stored in localStorage

**Risk:**
- XSS attack can steal tokens from localStorage
- No HTTPOnly flag protection
- Tokens could be exposed if localStorage is dumped

**Recommendation:**
```
Best practice for sensitive tokens:
1. Access token: HTTPOnly + Secure cookie (best)
2. Refresh token: HTTPOnly + Secure cookie
3. Only use localStorage for non-sensitive data (theme, preferences)
4. Implement token rotation and expiry checks
5. Clear tokens on logout
```

---

## Medium Severity Issues 🟠

### 6. **Missing Email Validation (AdminSettingsPage.tsx)**
**Severity:** MEDIUM
**Location:** `frontend/src/pages/AdminSettingsPage.tsx:135-144`

**Issue:**
```typescript
<Input
  label="📧 Email Address"
  type="email"  // HTML validation only
  value={formData.email}
  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
/>
```

**Risk:**
- Browser email validation can be bypassed
- Invalid email formats could be sent to API
- Server should also validate, but frontend should do primary validation

**Recommendation:**
```typescript
import { z } from 'zod';

const emailSchema = z.string().email('Invalid email address');

const handleSaveProfile = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate before submission
  const emailValidation = emailSchema.safeParse(formData.email);
  if (!emailValidation.success) {
    toast.error('Please enter a valid email address');
    return;
  }

  // Continue with submission...
};
```

---

### 7. **Generic Error Messages Exposed (All Pages)**
**Severity:** MEDIUM
**Location:** Multiple error handling blocks

**Issue:**
```typescript
catch (error) {
  toast.error((error as Error).message || 'Failed to save profile');
  // Backend error message shown directly to user
}
```

**Risk:**
- Backend error messages could expose system details
- "No user found" vs "Database error" reveals different info
- Attackers use error messages for reconnaissance

**Recommendation:**
```typescript
catch (error) {
  // Log full error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Profile update error:', error);
  }

  // Show generic message to user
  const userMessage = isNetworkError(error)
    ? 'Network error. Please check your connection.'
    : 'Something went wrong. Please try again.';

  toast.error(userMessage);
}
```

---

### 8. **Missing Input Sanitization (BillingPage.tsx, AdminSettingsPage.tsx)**
**Severity:** MEDIUM
**Location:** Input fields displaying user data

**Issue:**
- User input (church name) displayed without sanitization
- Could be vulnerable to XSS if input isn't sanitized server-side

**Recommendation:**
```typescript
// If displaying user-generated content, sanitize it
import DOMPurify from 'dompurify';

const sanitizedName = DOMPurify.sanitize(formData.name);

<p className="font-medium text-secondary-900 dark:text-secondary-50">
  {sanitizedName}
</p>
```

---

### 9. **Links to Terms/Privacy Point to "#" (CheckoutPage.tsx)**
**Severity:** MEDIUM
**Location:** `frontend/src/pages/CheckoutPage.tsx:144-150`

**Issue:**
```typescript
<a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
  Terms of Service
</a>
```

**Risk:**
- Links don't work, confuses users about ToS/Privacy
- Potential legal issue if users can't access terms
- Looks unfinished/unprofessional

**Recommendation:**
```typescript
<a href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
  Terms of Service
</a>
<a href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
  Privacy Policy
</a>

// Create actual /terms and /privacy pages
```

---

### 10. **Incomplete TypeScript Typing (AdminSettingsPage.tsx)**
**Severity:** MEDIUM
**Location:** `frontend/src/pages/AdminSettingsPage.tsx:15`

**Issue:**
```typescript
const [profile, setProfile] = useState<any>(null);
```

**Risk:**
- `any` type defeats TypeScript safety
- Type errors won't be caught at compile time
- Profile data structure could change unexpectedly

**Recommendation:**
```typescript
interface Profile {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: string;
  createdAt: string;
}

const [profile, setProfile] = useState<Profile | null>(null);
```

---

## Low Severity Issues 🟢

### 11. **Missing Dependency Array (App.tsx)**
**Severity:** LOW
**Location:** `frontend/src/App.tsx:46-91`

**Issue:**
- useEffect depends on `setAuth` but it might be recreated on every render
- Could cause unnecessary re-renders

**Recommendation:**
```typescript
useEffect(() => {
  // ... initialization code
}, [setAuth]); // Ensure this is in dependencies
```

---

### 12. **Race Condition in CheckoutPage Navigation**
**Severity:** LOW
**Location:** `frontend/src/pages/CheckoutPage.tsx:24-28`

**Issue:**
```typescript
useEffect(() => {
  if (!planName) {
    navigate('/subscribe');  // Could be called multiple times
  }
}, [planName, navigate]);
```

**Risk:**
- Multiple rapid navigation calls if planName changes
- Not a security issue but could cause UX problems

**Recommendation:**
```typescript
useEffect(() => {
  if (!planName) {
    const timer = setTimeout(() => navigate('/subscribe'), 0);
    return () => clearTimeout(timer);
  }
}, [planName, navigate]);
```

---

## Recommendations Summary

### Immediate Actions (This Week)
- [ ] **CRITICAL:** Implement Stripe Elements for payment processing
- [ ] **CRITICAL:** Remove all console.log statements
- [ ] **HIGH:** Add plan name validation in CheckoutPage
- [ ] **HIGH:** Hide test card number behind environment check
- [ ] **HIGH:** Implement proper token storage strategy

### Short Term (1-2 Weeks)
- [ ] Add email validation to form inputs
- [ ] Implement error message sanitization
- [ ] Add input sanitization for user-generated content
- [ ] Update Terms/Privacy links to actual pages
- [ ] Improve TypeScript typing throughout

### Medium Term (1 Month)
- [ ] Implement Content Security Policy (CSP)
- [ ] Add rate limiting to API calls
- [ ] Implement request signing for sensitive operations
- [ ] Add security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] Regular security dependencies audit

---

## Testing Checklist

- [ ] Test with invalid URL parameters (?plan=invalid)
- [ ] Test XSS payloads in input fields
- [ ] Test localStorage access via DevTools
- [ ] Test error messages for information leakage
- [ ] Test missing HTTPS on localhost only
- [ ] Test CORS headers for API requests
- [ ] Run npm audit for dependency vulnerabilities
- [ ] Test with CSP headers enabled

---

## Code Quality Standards Going Forward

1. **No `console.log` in production** - Use proper error tracking
2. **No `any` types** - Always use proper TypeScript
3. **Validate all URL parameters** - Never trust URL input
4. **Never handle payment data** - Always use tokenization services
5. **Sanitize user input** - Assume all input is malicious
6. **Generic error messages** - Never expose backend details
7. **Secure token storage** - Use HTTPOnly cookies when possible
8. **Environment-based secrets** - Never hardcode API keys or test data

---

**Last Updated:** 2024-10-30
**Reviewed By:** Security Audit
**Status:** REQUIRES ACTION ON CRITICAL ISSUES
