# Local Storage - Detailed Code References

## 1. Authentication Store (authStore.ts)

**File Path:** `frontend/src/stores/authStore.ts`

### Code: Line 73 - STORE AUTH STATE
```typescript
sessionStorage.setItem('authState', JSON.stringify(authState));
```
**What it does:** Persists complete auth state to sessionStorage after successful login
**Data:** `{user, church, isLoading, isAuthenticated, accessToken, refreshToken, tokenExpiresAt}`
**Why:** Allows session to survive page refresh without forcing re-authentication

### Code: Line 92 - CLEAR ON clearAuth()
```typescript
sessionStorage.removeItem('authState');
```
**What it does:** Removes auth state when manually clearing auth
**Triggered by:** clearAuth() action

### Code: Line 119 - CLEAR ON LOGOUT
```typescript
sessionStorage.removeItem('authState');
```
**What it does:** Removes auth state when user logs out
**Triggered by:** logout() action
**Security:** Ensures no auth data remains after logout

---

## 2. App Component (App.tsx)

**File Path:** `frontend/src/App.tsx`

### Code: Line 80 - RETRIEVE AUTH STATE
```typescript
const savedAuthState = sessionStorage.getItem('authState');
```
**What it does:** Retrieves stored auth state when app initializes

### Code: Line 82 - PARSE JSON
```typescript
const authState = JSON.parse(savedAuthState);
```
**What it does:** Converts stored JSON string back to object

### Code: Line 84 - RESTORE TO STORE
```typescript
setAuth(authState.user, authState.church, authState.accessToken, 
        authState.refreshToken, authState.tokenExpiresAt ? 
        Math.ceil((authState.tokenExpiresAt - Date.now()) / 1000) : 3600);
```
**What it does:** Restores auth state to Zustand store
**Fallback:** If sessionStorage empty, fetches from backend via getMe()

---

## 3. Theme Context (ThemeContext.tsx)

**File Path:** `frontend/src/contexts/ThemeContext.tsx`

### Code: Line 19 - READ THEME
```typescript
const stored = localStorage.getItem('theme') as Theme | null;
```
**What it does:** Retrieves user's previously selected theme

### Code: Line 20-21 - SYSTEM PREFERENCE FALLBACK
```typescript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = stored || (prefersDark ? 'dark' : 'light');
```
**What it does:** Uses system preference if no stored theme found

### Code: Line 35 - STORE THEME
```typescript
localStorage.setItem('theme', newTheme);
```
**What it does:** Saves theme preference when user toggles theme
**Data:** String - 'light' or 'dark'

---

## 4. Chat Widget (ChatWidget.tsx)

**File Path:** `frontend/src/components/ChatWidget.tsx`

### Code: Line 19-24 - GENERATE/RETRIEVE VISITOR ID
```typescript
const [visitorId] = useState(() => {
  let id = localStorage.getItem('visitor_id');
  if (!id) {
    id = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('visitor_id', id);
  }
  return id;
});
```
**What it does:** Creates or retrieves a unique visitor identifier
**Format:** `visitor_{1731264000000}_{abc123def}`
**Purpose:** Track chat conversations across sessions
**Storage:** localStorage (persists across browser closes)

---

## Storage Flow Diagrams

### Authentication Flow
```
User Login
    ↓
Token received (in HTTPOnly cookie)
    ↓
setAuth() called
    ↓
Zustand store updated
    ↓
sessionStorage.setItem('authState')
    ↓
Success - User authenticated
```

### Page Refresh Flow
```
User refreshes page
    ↓
App.tsx useEffect runs
    ↓
sessionStorage.getItem('authState')
    ↓
Found? → Restore to store → Skip backend call
Not found? → Call getMe() → Restore from backend
```

### Logout Flow
```
User clicks logout
    ↓
logout() action
    ↓
sessionStorage.removeItem('authState')
    ↓
Zustand store cleared
    ↓
Backend logout endpoint called
    ↓
HTTPOnly cookies cleared
    ↓
User redirected to login
```

### Theme Preference Flow
```
User toggles theme
    ↓
setTheme(newTheme)
    ↓
localStorage.setItem('theme', newTheme)
    ↓
DOM class updated (dark/light)
    ↓
Preference persists on page reload
```

### Chat Visitor Flow
```
ChatWidget mounts
    ↓
Check localStorage for visitor_id
    ↓
Found? → Use existing ID
Not found? → Generate new ID → Store in localStorage
    ↓
Send chat messages with visitor_id
    ↓
Backend correlates messages to conversation
```

---

## Error Handling

### authStore.ts - Storage operations wrapped in try/catch
```typescript
try {
  sessionStorage.setItem('authState', JSON.stringify(authState));
} catch (e) {
  console.warn('Failed to persist auth state to sessionStorage');
  // Auth still works - just no page refresh persistence
}
```

**Fallback Behavior:** If storage fails, authentication still works, just won't survive page refresh.

---

## Security Measures

1. **Tokens in HTTPOnly Cookies (Primary)**
   - Not accessible to JavaScript
   - Protected from XSS attacks

2. **sessionStorage for Backup**
   - Auto-clears when browser closes
   - Not persisted to disk
   - Session-scoped only

3. **No Sensitive Data in localStorage**
   - Theme preference is non-sensitive
   - Visitor ID is anonymous

4. **Error Handling**
   - All storage operations use try/catch
   - Graceful degradation if storage unavailable

5. **Clear on Logout**
   - sessionStorage explicitly cleared
   - HTTPOnly cookies cleared by server

---

## Testing Checklist

- [ ] Theme preference persists on page reload
- [ ] Auth state survives page refresh (sessionStorage)
- [ ] Auth state cleared when browser closes (sessionStorage)
- [ ] Auth state cleared on logout
- [ ] Visitor ID generated once and reused
- [ ] Chat messages correlated to correct conversation
- [ ] Browser storage access errors don't break app
- [ ] Switching themes immediately applies change

