# Comprehensive Domain and URL References Report

## Summary
This document lists all hardcoded domain names, URLs, and email addresses found in the YWMESSAGING codebase.

---

## 1. EMAIL ADDRESSES WITH @connect.com

### Frontend Pages

#### ContactPage.tsx
- Line 57: `value: 'support@connect.com'`
- Line 59: `href: 'mailto:support@connect.com'`
- Line 64: `value: 'sales@connect.com'`
- Line 66: `href: 'mailto:sales@connect.com'`
- Line 71: `value: 'security@connect.com'`
- Line 73: `href: 'mailto:security@connect.com'`
- Line 78: `value: 'help@connect.com'`
- Line 80: `href: 'mailto:help@connect.com'`

#### PrivacyPage.tsx
- Line 125: `Email: privacy@connect.com`
- Line 126: `Website: www.connect.com`

#### SecurityPage.tsx
- Line 182: `security@connect.com` (in vulnerability reporting text)
- Line 186: `Email: security@connect.com`
- Line 199: `Email: support@connect.com`
- Line 200: `Website: www.connect.com`

#### CookiePolicyPage.tsx
- Line 142: `Email: privacy@connect.com`
- Line 143: `Website: www.connect.com`

#### TermsPage.tsx
- Line 123: `Email: support@connect.com`
- Line 124: `Website: www.connect.com`

#### CareersPage.tsx
- Line 197: `href="mailto:careers@connect.com"`
- Line 243: `href="mailto:careers@connect.com"`

#### BlogPage.tsx
- Line 169: `Contact us at blog@connect.com with your suggestions.`

#### Pricing.tsx
- Line 256: `href="mailto:support@connect.com"`

### Backend Services

#### sendgrid.service.ts
- Line 31: `from: process.env.SENDGRID_FROM_EMAIL || 'noreply@koinonia-sms.com'`

---

## 2. ENVIRONMENT VARIABLES WITH DOMAIN REFERENCES

### Backend Configuration

#### .env (Development)
- Line 13: `FRONTEND_URL=http://localhost:5173`
- Line 40: `SUPPORT_EMAIL=support@koinonia-sms.com`

#### .env.example (Template)
- Line 14: `FRONTEND_URL=http://localhost:5173`
- Line 43: `SUPPORT_EMAIL=support@koinonia-sms.com`

#### .env.production (Production)
- Line 11: `FRONTEND_URL=https://koinonia-sms-frontend.onrender.com`
- Line 34: `SUPPORT_EMAIL=support@koinonia-sms.com`

### Frontend Configuration

#### .env (Development)
- Line 2: `VITE_API_BASE_URL=http://localhost:3000/api`

#### .env.example (Template)
- Line 2: `VITE_API_BASE_URL=http://localhost:3000/api`

---

## 3. API BASE URLS

### Frontend API Client

#### client.ts
- Line 4: `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';`

#### client.js
- Line 3: `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';`

### Backend CORS Configuration

#### app.ts
- Line 146: `origin: process.env.FRONTEND_URL || 'http://localhost:5173'`

### Vite Configuration

#### vite.config.ts
- Line 17: `target: 'http://localhost:3000'`

---

## 4. COOKIE DOMAIN REFERENCES (Production)

### Backend Authentication Controller

#### auth.controller.ts
- Line 34-36: Cookie domain logic for production `.onrender.com`
- Line 36: `const cookieDomain = process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined;`
- Line 43: `domain: cookieDomain,` (in login)
- Line 51: `domain: cookieDomain,` (in refresh)
- Line 90: `const cookieDomain = process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined;` (logout)
- Line 97: `domain: cookieDomain,` (logout response)
- Line 105: `domain: cookieDomain,` (refresh response)
- Line 151: `const cookieDomain = process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined;` (password reset)
- Line 158: `domain: cookieDomain,` (password reset response)

---

## 5. EXTERNAL SERVICE DOMAINS

### Google Fonts (Do NOT Change)

#### frontend/src/index.css
- Line 1-2: Google Fonts imports

### PostHog Analytics (Do NOT Change)

#### useAnalytics.ts
- Line 16: `api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.posthog.com',`

#### useAnalytics.js
- Line 13: `api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.posthog.com',`

### Backend Content Security Policy (Do NOT Change)

#### app.ts (CSP Headers)
Lines 102-122: Third-party domain CSP directives for Stripe, CDN, Google Fonts

---

## SUMMARY BY LOCATION

### Files with @connect.com Email References (9 files):
1. `frontend/src/pages/ContactPage.tsx` - support, sales, security, help
2. `frontend/src/pages/BlogPage.tsx` - blog
3. `frontend/src/pages/CareersPage.tsx` - careers (2 occurrences)
4. `frontend/src/pages/CookiePolicyPage.tsx` - privacy, www.connect.com
5. `frontend/src/pages/PrivacyPage.tsx` - privacy, www.connect.com
6. `frontend/src/pages/SecurityPage.tsx` - security, support, www.connect.com
7. `frontend/src/pages/TermsPage.tsx` - support, www.connect.com
8. `frontend/src/components/landing/Pricing.tsx` - support
9. `backend/src/services/sendgrid.service.ts` - noreply@koinonia-sms.com

### Environment Configuration Files (5 files):
1. `backend/.env`
2. `backend/.env.example`
3. `backend/.env.production`
4. `frontend/.env`
5. `frontend/.env.example`

### Source Code Files with Hardcoded URLs (5 files):
1. `frontend/src/api/client.ts`
2. `frontend/src/api/client.js`
3. `frontend/vite.config.ts`
4. `backend/src/app.ts`
5. `backend/src/controllers/auth.controller.ts`

