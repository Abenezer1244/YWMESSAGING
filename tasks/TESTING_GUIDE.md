# Connect YW - Comprehensive Testing Guide

## Application Overview
Connect YW is a church messaging platform with the following key features:
- User authentication (Login/Register)
- Multi-branch management
- Group and member management
- SMS messaging capabilities
- Subscription/billing management
- Analytics and reporting
- Admin settings and co-admin management

---

## Phase 1: Landing Page & Navigation Testing

### 1.1 Landing Page Load
**URL**: `http://localhost:5173/` (or deployed frontend URL)
- [ ] Page loads without errors
- [ ] Hero section displays with proper styling
- [ ] All sections visible: Features, Pricing, Testimonials, CTA
- [ ] Images and icons load correctly
- [ ] Text is readable with proper contrast
- [ ] Layout is responsive on mobile (resize browser to 375px width)

### 1.2 Navigation & Call-to-Action Buttons
- [ ] "Start Free Trial" button navigates to Register page (when not authenticated)
- [ ] "Start Free Trial" button navigates to Dashboard (when authenticated)
- [ ] "View Pricing" button scrolls to pricing section
- [ ] All internal links work correctly
- [ ] No console errors in browser DevTools

### 1.3 Dark Mode Testing (Landing Page)
- [ ] Light mode displays with proper colors (white background, neutral text)
- [ ] Dark mode toggle available (check for theme switcher)
- [ ] Dark mode colors are correct (neutral-950 background, white text)
- [ ] All sections visible and readable in dark mode

---

## Phase 2: Authentication Testing

### 2.1 Register Flow
**URL**: `http://localhost:5173/register`
- [ ] Page loads correctly with form
- [ ] Form has fields: First Name, Last Name, Church Name, Email, Password, Confirm Password
- [ ] Error validation works (empty fields, password mismatch, invalid email)
- [ ] Success registers user and redirects to dashboard or trial page
- [ ] "Already have an account?" link redirects to login page

### 2.2 Login Flow
**URL**: `http://localhost:5173/login`
- [ ] Page loads correctly with login form
- [ ] Form has fields: Email, Password
- [ ] Error validation works (empty fields, invalid credentials)
- [ ] Successful login redirects to dashboard
- [ ] "Create account" link redirects to register page
- [ ] Password field is masked

### 2.3 Session Management
- [ ] After login, user stays authenticated on page refresh
- [ ] Logout clears session and redirects to login
- [ ] Accessing protected routes without auth redirects to login
- [ ] Tokens are stored in localStorage correctly

---

## Phase 3: Dashboard Testing

### 3.1 Dashboard Load & Layout
**URL**: `http://localhost:5173/dashboard` (after login)
- [ ] Dashboard loads with header showing user info
- [ ] "Welcome back, [User Name]!" displays correctly
- [ ] Navigation menu shows all available sections
- [ ] Stats cards display (Active Branches, Total Members, Messages Sent)
- [ ] Key Features section displays 6 features with icons

### 3.2 Navigation Menu
- [ ] All navigation items are visible and clickable
- [ ] Conditional items only show when applicable
- [ ] Branch selector displays available branches
- [ ] Logout button works correctly

### 3.3 Trial Banner (if applicable)
- [ ] Trial banner displays with days remaining
- [ ] Color changes based on trial status (green > yellow > red)
- [ ] Subscribe button redirects to subscription page

---

## Phase 4: Billing & Subscription Testing

### 4.1 Subscribe Page
**URL**: `http://localhost:5173/subscribe`
- [ ] Page loads with three pricing plans (Starter, Growth, Pro)
- [ ] Pricing cards display correctly with:
  - Plan name and description
  - Monthly price
  - Feature list
  - "Get Started" button
- [ ] "Most Popular" badge displays on Growth plan
- [ ] FAQ section displays with 4 Q&A items
- [ ] All text is readable and properly styled

### 4.2 Checkout Page
**URL**: `http://localhost:5173/checkout?plan=starter` (example)
- [ ] Page loads with selected plan details
- [ ] Payment form displays:
  - Cardholder name field
  - Stripe Card Element
  - Error message display area
  - Terms checkbox
  - Pay button with amount
- [ ] Order summary shows plan price and features
- [ ] Security note displays about payment encryption
- [ ] Back to plans link works

### 4.3 Payment Processing
- [ ] Cardholder name validation works (required field)
- [ ] Card validation through Stripe
- [ ] Terms checkbox is required
- [ ] Error messages display without exposing sensitive details
- [ ] Payment success shows toast notification
- [ ] Successful payment redirects to billing page

### 4.4 Billing Page
**URL**: `http://localhost:5173/billing` (after subscription)
- [ ] Current plan displays with price
- [ ] "Change Plan" button works
- [ ] "Cancel Subscription" button shows confirmation
- [ ] Usage bars display for:
  - Branches (with limit)
  - Members (with limit)
  - Messages this month (with limit)
  - Co-Admins (with limit)
- [ ] Remaining capacity cards display with amounts
- [ ] Color-coded usage bars (green < yellow < red)
- [ ] "Manage in Stripe" button is visible

---

## Phase 5: Admin Settings Testing

### 5.1 Admin Settings Page
**URL**: `http://localhost:5173/admin/settings`
- [ ] Tab navigation works (Profile, Co-Admins, Activity Logs)
- [ ] Page loads without errors

### 5.2 Church Profile Tab
- [ ] Church name field displays current value
- [ ] Email field displays current value
- [ ] Account information shows subscription status and creation date
- [ ] Form validation works (empty fields, invalid email)
- [ ] Save button updates profile
- [ ] Success toast message displays on save
- [ ] Error handling shows generic error message

### 5.3 Co-Admins Tab
- [ ] Tab displays co-admin management interface
- [ ] Can view existing co-admins
- [ ] Can add new co-admins
- [ ] Can remove co-admins (with confirmation)
- [ ] Error handling works properly

### 5.4 Activity Logs Tab
- [ ] Tab displays activity logs
- [ ] Log entries show action, user, timestamp
- [ ] Logs are sortable/filterable (if implemented)

---

## Phase 6: Core Features Testing (Dashboard)

### 6.1 Branches Management
**URL**: `http://localhost:5173/branches`
- [ ] List of branches displays
- [ ] Create branch button works
- [ ] Branch form validation works
- [ ] Delete branch functionality works
- [ ] Successful operations show toast notification

### 6.2 Groups Management
**URL**: `http://localhost:5173/branches/[branchId]/groups`
- [ ] List of groups displays for selected branch
- [ ] Create group button works
- [ ] Group form validation works
- [ ] Delete group functionality works
- [ ] Can view groups by branch

### 6.3 Members Management
**URL**: `http://localhost:5173/members`
- [ ] List of members displays
- [ ] Filter by group works
- [ ] Create member button works
- [ ] Member import functionality works (if available)
- [ ] Delete member functionality works
- [ ] Edit member details works

### 6.4 Send Message
**URL**: `http://localhost:5173/send-message`
- [ ] Message form loads correctly
- [ ] Can select recipients (groups/members)
- [ ] Message text area works
- [ ] Character count displays
- [ ] Send button submits message
- [ ] Success notification displays
- [ ] Error handling shows appropriate messages

### 6.5 Message History
**URL**: `http://localhost:5173/message-history`
- [ ] List of sent messages displays
- [ ] Can filter by date range
- [ ] Can view message details
- [ ] Delivery status shows correctly
- [ ] Can resend messages (if available)

### 6.6 Templates
**URL**: `http://localhost:5173/templates`
- [ ] List of templates displays
- [ ] Create template button works
- [ ] Template form validation works
- [ ] Can use template in send message
- [ ] Delete template functionality works
- [ ] Edit template works

### 6.7 Recurring Messages
**URL**: `http://localhost:5173/recurring-messages`
- [ ] List of recurring messages displays
- [ ] Create recurring message button works
- [ ] Scheduling options work (daily, weekly, monthly)
- [ ] Can enable/disable recurring messages
- [ ] Delete recurring message works
- [ ] Edit recurring message works

### 6.8 Analytics
**URL**: `http://localhost:5173/analytics`
- [ ] Analytics dashboard loads
- [ ] Charts and graphs display correctly
- [ ] Can view different time periods
- [ ] Engagement metrics display
- [ ] Delivery statistics display
- [ ] Can export data (if available)

---

## Phase 7: UI/UX Consistency Testing

### 7.1 Design System Compliance
- [ ] All pages use consistent color palette:
  - Primary: Blue (#6b7dff)
  - Neutral: Gray shades (white to #111827)
  - Accents: Green, red, yellow for status
- [ ] All pages have neutral-950 dark mode background
- [ ] All pages have white light mode background
- [ ] Buttons have consistent styling
- [ ] Cards have consistent borders (neutral-200/800)
- [ ] Typography is consistent across pages

### 7.2 Responsive Design
- [ ] Desktop (1920px width): All elements properly spaced
- [ ] Tablet (768px width): Layout adapts correctly
- [ ] Mobile (375px width):
  - Menu collapses to mobile nav (if applicable)
  - Cards stack vertically
  - Text is readable
  - Buttons are easy to tap

### 7.3 Dark Mode Consistency
- [ ] All pages support dark mode
- [ ] Dark mode toggle works (if available)
- [ ] Text has sufficient contrast in dark mode
- [ ] All colors are updated in dark mode
- [ ] No light backgrounds in dark mode

### 7.4 Navigation Consistency
- [ ] Header/footer present on all pages
- [ ] Navigation menu consistent
- [ ] Breadcrumbs display correctly (if used)
- [ ] Back buttons work properly

---

## Phase 8: Error Handling & Validation

### 8.1 Form Validation
- [ ] Required fields show error message if empty
- [ ] Email validation works (invalid format shows error)
- [ ] Password requirements enforced (if applicable)
- [ ] Password confirmation validates (if applicable)
- [ ] Character limits enforced

### 8.2 API Error Handling
- [ ] Network error shows generic message (no technical details)
- [ ] 401 Unauthorized redirects to login
- [ ] 403 Forbidden shows appropriate message
- [ ] 404 Not Found shows error page
- [ ] 500 Server Error shows generic message
- [ ] Toast notifications display for errors and success

### 8.3 Loading States
- [ ] Loading spinners display while fetching data
- [ ] Buttons show loading state while processing
- [ ] Forms are disabled while submitting
- [ ] No double-submit is possible

---

## Phase 9: Security & Performance

### 9.1 Security Checks
- [ ] CSRF tokens are sent with forms
- [ ] Sensitive data not exposed in error messages
- [ ] No sensitive data in console logs (development only)
- [ ] Password fields are masked
- [ ] API calls use HTTPS (in production)
- [ ] Session tokens stored securely

### 9.2 Performance
- [ ] Page load time is reasonable (< 3 seconds)
- [ ] Images are optimized
- [ ] No memory leaks (check DevTools)
- [ ] Smooth scrolling and animations
- [ ] No excessive re-renders

---

## Phase 10: Browser Compatibility

### 10.1 Cross-Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (Chrome, Safari on iOS)

### 10.2 Browser Features
- [ ] Local storage works
- [ ] Cookies accepted properly
- [ ] Fetch API works
- [ ] Event listeners work

---

## Testing Checklist Summary

**Phase 1 - Landing Page**: ___/4 sections passed
**Phase 2 - Authentication**: ___/3 sections passed
**Phase 3 - Dashboard**: ___/3 sections passed
**Phase 4 - Billing**: ___/4 sections passed
**Phase 5 - Admin Settings**: ___/4 sections passed
**Phase 6 - Core Features**: ___/8 sections passed
**Phase 7 - UI/UX**: ___/4 sections passed
**Phase 8 - Error Handling**: ___/3 sections passed
**Phase 9 - Security**: ___/2 sections passed
**Phase 10 - Browser**: ___/2 sections passed

**Total Score**: ___/40 sections passed

---

## Notes for Testers

1. Use test accounts if available
2. Document any bugs with screenshots
3. Test both light and dark modes
4. Test on multiple devices/screen sizes
5. Clear browser cache between sessions if needed
6. Check browser console for errors (F12 -> Console)
7. Use browser DevTools Network tab to verify API calls
8. Take notes on user experience issues

---

## Known Issues / Limitations

(To be filled in as testing progresses)

---

## Final Sign-Off

- [ ] All critical features tested and working
- [ ] No blocking bugs found
- [ ] Design system properly implemented
- [ ] Performance acceptable
- [ ] Ready for production
