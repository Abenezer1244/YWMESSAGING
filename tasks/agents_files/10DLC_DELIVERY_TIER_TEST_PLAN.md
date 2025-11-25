# Koinoniasms 10DLC Delivery Tier Feature - Comprehensive Test Plan

**Version:** 1.0
**Date:** November 24, 2025
**Author:** QA Engineering Team
**Feature:** 10DLC Delivery Tier Selection (Standard vs Premium)

---

## Table of Contents

1. [Test Plan Summary](#test-plan-summary)
2. [Feature Overview](#feature-overview)
3. [Test Environment Setup](#test-environment-setup)
4. [Test Data Requirements](#test-data-requirements)
5. [Test Cases](#test-cases)
   - [Tier Selection Tests](#1-tier-selection-tests)
   - [Dashboard Badge Tests](#2-dashboard-badge-tests)
   - [Settings Page Tests](#3-settings-page-tests)
   - [SMS Sending Tests](#4-sms-sending-tests)
   - [API Endpoint Tests](#5-api-endpoint-tests)
   - [Edge Cases & Error Scenarios](#6-edge-cases--error-scenarios)
6. [Testing Strategy](#testing-strategy)
7. [Acceptance Criteria](#acceptance-criteria)
8. [Success Metrics](#success-metrics)
9. [Regression Test Suite](#regression-test-suite)

---

## Test Plan Summary

### Objective
Validate the 10DLC delivery tier feature allowing churches to choose between Standard Delivery (65%, shared brand, no EIN) and Premium 10DLC (99%, personal brand, EIN required).

### Scope
- Tier selection UI and form validation
- Dashboard badge display logic
- Settings page UI components
- SMS sending with correct brand ID
- Backend API endpoint functionality
- Database persistence
- User role and permission validation
- Error handling and edge cases

### Out of Scope
- Telnyx API integration testing (mocked)
- Payment processing for premium tier
- 10DLC approval workflow automation
- Campaign suspension/reactivation

### Test Coverage Target
- **Overall:** 95%
- **Critical Paths:** 100%
- **UI Components:** 90%
- **API Endpoints:** 100%

---

## Feature Overview

### User Flow
1. Church admin navigates to Settings → Church Profile
2. Selects delivery tier (Standard or Premium)
3. If Premium: Fills in required 10DLC brand information (EIN, address, etc.)
4. Saves profile
5. Dashboard displays delivery status badge
6. SMS messages sent using correct brand ID based on tier

### Key Components

**Frontend:**
- `AdminSettingsPage.tsx` - Tier selection form
- `DeliveryStatusBadge.tsx` - Status display component
- `DashboardPage.tsx` - Dashboard integration

**Backend:**
- `/api/admin/profile` (PUT) - Update church profile and tier
- `/api/admin/delivery-tier-status` (GET) - Get tier information
- `telnyx.service.ts` - SMS sending with brand ID logic
- `admin.controller.ts` - Profile update handler

**Database:**
- `Church.wantsPremiumDelivery` - Boolean flag for tier selection
- `Church.dlcStatus` - Current status (shared_brand, pending, approved, rejected)
- `Church.deliveryRate` - Current delivery rate (0.65 or 0.99)
- `Church.dlcBrandId` - Personal brand ID (if premium approved)

---

## Test Environment Setup

### Required Environments
1. **Local Development** - Full testing with mocked Telnyx API
2. **Staging** - Integration testing with Telnyx sandbox
3. **Production** - Smoke tests and monitoring

### Prerequisites
- PostgreSQL database with test data
- Node.js 18+
- Test Telnyx API key
- Test admin accounts with different roles
- Mock webhook endpoints

### Environment Variables
```env
TELNYX_API_KEY=test_key_xxx
TELNYX_PLATFORM_BRAND_ID=shared_brand_id_xxx
DATABASE_URL=postgresql://test:test@localhost:5432/koinonia_test
BACKEND_URL=http://localhost:3000
```

### Test Users
- **Admin (Owner)** - Full permissions
- **Co-Admin** - Limited permissions
- **Read-Only Admin** - View only (if applicable)

---

## Test Data Requirements

### Churches
```json
{
  "church_standard": {
    "id": "church_001",
    "name": "Test Church Standard",
    "wantsPremiumDelivery": false,
    "dlcStatus": "shared_brand",
    "deliveryRate": 0.65,
    "usingSharedBrand": true
  },
  "church_premium_pending": {
    "id": "church_002",
    "name": "Test Church Premium Pending",
    "wantsPremiumDelivery": true,
    "dlcStatus": "pending",
    "deliveryRate": 0.65,
    "ein": "123456789",
    "usingSharedBrand": true
  },
  "church_premium_approved": {
    "id": "church_003",
    "name": "Test Church Premium Approved",
    "wantsPremiumDelivery": true,
    "dlcStatus": "approved",
    "deliveryRate": 0.99,
    "dlcBrandId": "brand_xxx",
    "usingSharedBrand": false
  },
  "church_premium_rejected": {
    "id": "church_004",
    "name": "Test Church Premium Rejected",
    "wantsPremiumDelivery": true,
    "dlcStatus": "rejected",
    "deliveryRate": 0.65,
    "dlcRejectionReason": "Invalid EIN"
  }
}
```

### Admins
```json
{
  "admin_owner": {
    "id": "admin_001",
    "email": "owner@testchurch.com",
    "role": "owner",
    "churchId": "church_001"
  },
  "admin_coadmin": {
    "id": "admin_002",
    "email": "coadmin@testchurch.com",
    "role": "co-admin",
    "churchId": "church_001"
  }
}
```

---

## Test Cases

### 1. Tier Selection Tests

#### TC-001: Select Standard Delivery from Blank State
**Severity:** Critical
**Type:** Functional

**Preconditions:**
- New church account created
- No tier previously selected
- `wantsPremiumDelivery` is null or false
- User logged in as admin/owner

**Test Steps:**
1. Navigate to Settings → Church Profile
2. Locate "SMS Delivery Tier" section
3. Select "Standard Delivery" radio button
4. Verify "Premium 10DLC" radio button is not selected
5. Click "Save Changes"
6. Wait for success toast notification

**Expected Results:**
- Standard Delivery option is selected (blue highlight background)
- Description shows "65% delivery rate • Instant activation • No EIN required"
- Form does not show 10DLC brand information fields
- Success toast: "Profile updated successfully"
- Database: `wantsPremiumDelivery = false`
- Database: `dlcStatus = "shared_brand"`
- Database: `deliveryRate = 0.65`
- Page reloads with Standard selected

**Acceptance Criteria:**
✅ Selection persists after page refresh
✅ No validation errors shown
✅ 10DLC fields remain hidden
✅ Database updated correctly

---

#### TC-002: Select Premium 10DLC from Blank State
**Severity:** Critical
**Type:** Functional

**Preconditions:**
- New church account created
- No tier previously selected
- User logged in as admin/owner

**Test Steps:**
1. Navigate to Settings → Church Profile
2. Locate "SMS Delivery Tier" section
3. Select "Premium 10DLC" radio button
4. Verify 10DLC brand information section appears below
5. DO NOT fill in any fields yet
6. Click "Save Changes"

**Expected Results:**
- Premium 10DLC option is selected (green highlight background)
- 10DLC brand information section expands
- Validation errors appear for required fields:
  - "EIN (Employer Identification Number) is required for premium 10DLC"
  - "Brand contact phone number is required for premium 10DLC"
  - "Street address is required for premium 10DLC"
  - "City is required for premium 10DLC"
  - "State must be 2-letter code (e.g., CA, NY)"
  - "Postal code is required for premium 10DLC"
- Form does NOT submit
- No changes saved to database

**Acceptance Criteria:**
✅ All required fields validated
✅ Clear error messages displayed
✅ Form blocked from submission
✅ Database unchanged

---

#### TC-003: Select Premium 10DLC with Valid Data
**Severity:** Critical
**Type:** Functional

**Preconditions:**
- Church account exists with Standard tier
- User logged in as admin/owner
- Church has phone number configured

**Test Steps:**
1. Navigate to Settings → Church Profile
2. Select "Premium 10DLC" radio button
3. Fill in all required 10DLC fields:
   - **EIN:** 123456789
   - **Brand Phone:** +12065551234
   - **Street Address:** 123 Main Street
   - **City:** Seattle
   - **State:** WA
   - **Postal Code:** 98101
   - **Website:** https://testchurch.com (optional)
   - **Entity Type:** Non-Profit (default)
   - **Vertical:** NGO (default)
4. Click "Save Changes"
5. Wait for success notification

**Expected Results:**
- Success toast: "Profile updated successfully"
- Database updates:
  - `wantsPremiumDelivery = true`
  - `dlcStatus = "pending"` (awaiting approval)
  - `ein = "123456789"`
  - `brandPhoneNumber = "+12065551234"`
  - `streetAddress = "123 Main Street"`
  - `city = "Seattle"`
  - `state = "WA"`
  - `postalCode = "98101"`
  - `website = "https://testchurch.com"`
  - `entityType = "NON_PROFIT"`
  - `vertical = "NGO"`
- Background job triggered: `registerPersonal10DLCAsync()`
- Console logs show: "🔔 Triggering 10DLC registration for church..."
- Current Status section updates to "⏳ Awaiting Approval (99%)"

**Acceptance Criteria:**
✅ All fields saved to database
✅ 10DLC registration job triggered
✅ Status updates to pending
✅ User informed of pending approval

---

#### TC-004: Switch from Standard to Premium
**Severity:** High
**Type:** Functional

**Preconditions:**
- Church using Standard Delivery
- `wantsPremiumDelivery = false`
- `dlcStatus = "shared_brand"`
- User logged in as admin/owner

**Test Steps:**
1. Navigate to Settings → Church Profile
2. Verify "Standard Delivery" is currently selected
3. Select "Premium 10DLC" radio button
4. Fill in all required 10DLC fields (valid data)
5. Click "Save Changes"

**Expected Results:**
- Profile switches from Standard to Premium
- Database: `wantsPremiumDelivery` changes from `false` to `true`
- Database: `dlcStatus` changes from `"shared_brand"` to `"pending"`
- 10DLC registration background job triggered
- Success toast displayed
- Dashboard badge updates to "Pending Approval"

**Acceptance Criteria:**
✅ Tier switches correctly
✅ Database persists changes
✅ Registration initiated
✅ UI reflects new state

---

#### TC-005: Switch from Premium to Standard
**Severity:** High
**Type:** Functional

**Preconditions:**
- Church using Premium 10DLC (status: pending or approved)
- `wantsPremiumDelivery = true`
- User logged in as admin/owner

**Test Steps:**
1. Navigate to Settings → Church Profile
2. Verify "Premium 10DLC" is currently selected
3. Select "Standard Delivery" radio button
4. Confirm understanding that this will downgrade to 65% delivery
5. Click "Save Changes"

**Expected Results:**
- Profile switches from Premium to Standard
- Database: `wantsPremiumDelivery` changes from `true` to `false`
- Database: `dlcStatus` changes to `"shared_brand"`
- Database: `deliveryRate` changes to `0.65`
- 10DLC brand information remains in database (not deleted)
- Success toast displayed
- Dashboard badge updates to "Standard Delivery (65%)"

**Acceptance Criteria:**
✅ Downgrade processed correctly
✅ 10DLC data preserved (can re-upgrade)
✅ Delivery rate updated
✅ UI reflects downgrade

---

#### TC-006: Validate EIN Format
**Severity:** High
**Type:** Validation

**Preconditions:**
- Premium 10DLC selected
- User logged in as admin/owner

**Test Data:**
```
Valid: 123456789, 987654321
Invalid: 12-3456789, abc123456, 12345, 1234567890
```

**Test Steps:**
1. Select Premium 10DLC
2. For each invalid EIN:
   - Enter invalid EIN
   - Click "Save Changes"
   - Observe validation error
3. For each valid EIN:
   - Enter valid EIN
   - Fill other required fields
   - Click "Save Changes"
   - Observe success

**Expected Results:**
- **Invalid EINs:**
  - Error: "EIN must contain only digits" (if contains non-digits)
  - Error: "EIN (Employer Identification Number) is required for premium 10DLC" (if empty)
  - Form submission blocked
- **Valid EINs:**
  - No validation errors
  - Form submits successfully

**Acceptance Criteria:**
✅ Only numeric EINs accepted
✅ Clear error messages
✅ 9-digit format validated

---

#### TC-007: Validate Phone Number Format
**Severity:** High
**Type:** Validation

**Test Data:**
```
Valid: +12065551234, +13105559999
Invalid: 2065551234, +1206555123, +120655512345, +2206555123, (206) 555-1234
```

**Test Steps:**
1. Select Premium 10DLC
2. For each test phone number:
   - Enter phone in "Brand Contact Phone" field
   - Fill other required fields
   - Click "Save Changes"
   - Observe result

**Expected Results:**
- **Invalid Formats:**
  - Error: "Phone must be in format: +1XXXXXXXXXX"
  - Form submission blocked
- **Valid Formats:**
  - No validation errors
  - Form submits successfully

**Acceptance Criteria:**
✅ E.164 format enforced (+1 + 10 digits)
✅ Clear format guidance shown
✅ Proper validation feedback

---

#### TC-008: Co-Admin Access to Tier Selection
**Severity:** Medium
**Type:** Permission

**Preconditions:**
- Church account exists
- User logged in as co-admin (not owner)
- Co-admin has permission to edit settings

**Test Steps:**
1. Log in as co-admin
2. Navigate to Settings → Church Profile
3. Attempt to change delivery tier
4. Fill in required fields
5. Click "Save Changes"

**Expected Results:**
- Co-admin can view delivery tier section
- Co-admin can select different tier
- Co-admin can edit 10DLC fields
- Form submission succeeds
- Changes saved to database
- Activity log records co-admin making change

**Acceptance Criteria:**
✅ Co-admins have full edit access
✅ Changes attributed to co-admin in logs
✅ No permission errors

**Note:** If co-admins should NOT have this permission, update test to verify access denial.

---

### 2. Dashboard Badge Tests

#### TC-009: Badge Displays for Standard Delivery
**Severity:** High
**Type:** UI/Visual

**Preconditions:**
- Church using Standard Delivery
- `dlcStatus = "shared_brand"`
- `deliveryRate = 0.65`
- User logged in

**Test Steps:**
1. Navigate to Dashboard
2. Locate delivery status badge near welcome message
3. Inspect badge appearance and text

**Expected Results:**
- Badge visible below user name
- Badge displays: "📊 Standard Delivery"
- Color: Blue background (`bg-blue-100`, `text-blue-800`)
- Rounded pill shape
- Positioned near welcome text: "Welcome back, [Name]"

**Acceptance Criteria:**
✅ Badge renders correctly
✅ Correct emoji and text
✅ Blue color scheme
✅ No layout issues

---

#### TC-010: Badge Displays for Premium Pending
**Severity:** High
**Type:** UI/Visual

**Preconditions:**
- Church selected Premium 10DLC
- `dlcStatus = "pending"` OR `"brand_verified"` OR `"campaign_pending"`
- 10DLC approval not yet complete
- User logged in

**Test Steps:**
1. Navigate to Dashboard
2. Locate delivery status badge
3. Inspect badge appearance and text

**Expected Results:**
- Badge visible
- Badge displays: "⏳ Pending Approval"
- Color: Yellow background (`bg-yellow-100`, `text-yellow-800`)
- Rounded pill shape
- Subtext (if variant="inline"): "Premium 10DLC (99% when approved)"

**Acceptance Criteria:**
✅ Badge renders with pending status
✅ Correct emoji (hourglass)
✅ Yellow color scheme
✅ Conveys "waiting" state

---

#### TC-011: Badge Displays for Premium Approved
**Severity:** High
**Type:** UI/Visual

**Preconditions:**
- Church Premium 10DLC approved
- `dlcStatus = "approved"`
- `deliveryRate = 0.99`
- `dlcBrandId` is set
- User logged in

**Test Steps:**
1. Navigate to Dashboard
2. Locate delivery status badge
3. Inspect badge appearance and text

**Expected Results:**
- Badge visible
- Badge displays: "✅ Premium 10DLC"
- Color: Green background (`bg-green-100`, `text-green-800`)
- Rounded pill shape
- Subtext (if variant="inline"): "99% delivery rate"

**Acceptance Criteria:**
✅ Badge renders with approved status
✅ Correct emoji (checkmark)
✅ Green color scheme
✅ Conveys success/active state

---

#### TC-012: Badge Displays for Premium Rejected
**Severity:** High
**Type:** UI/Visual

**Preconditions:**
- Church Premium 10DLC rejected by Telnyx/TCR
- `dlcStatus = "rejected"`
- `dlcRejectionReason` is set
- User logged in

**Test Steps:**
1. Navigate to Dashboard
2. Locate delivery status badge
3. Inspect badge appearance and text

**Expected Results:**
- Badge visible
- Badge displays: "❌ Approval Failed"
- Color: Red background (`bg-red-100`, `text-red-800`)
- Rounded pill shape
- Subtext: "Contact support"
- User should see clear call-to-action to resolve issue

**Acceptance Criteria:**
✅ Badge renders with rejected status
✅ Correct emoji (X mark)
✅ Red color scheme
✅ Support contact info visible

---

#### TC-013: Upgrade Prompt Shows for Standard Tier
**Severity:** Medium
**Type:** UI/Marketing

**Preconditions:**
- Church using Standard Delivery
- `dlcStatus = "shared_brand"`
- User logged in

**Test Steps:**
1. Navigate to Dashboard
2. Scroll to area below delivery status badge
3. Locate upgrade prompt banner

**Expected Results:**
- Green-bordered banner visible
- Message: "🚀 Ready for better SMS delivery?"
- Subtext: "Upgrade to Premium 10DLC for 99% delivery rate. Visit your settings to enable it."
- "Upgrade →" button on right side
- Clicking "Upgrade" redirects to: `/admin/settings` (Settings page)

**Acceptance Criteria:**
✅ Prompt displays for Standard tier only
✅ Clear upgrade value proposition
✅ Functional CTA button
✅ Redirects to correct page

---

#### TC-014: Upgrade Prompt Hidden for Premium Users
**Severity:** Low
**Type:** UI

**Preconditions:**
- Church using Premium 10DLC (any status: pending, approved, rejected)
- `wantsPremiumDelivery = true`
- User logged in

**Test Steps:**
1. Navigate to Dashboard
2. Scroll entire page
3. Search for upgrade prompt banner

**Expected Results:**
- Upgrade prompt banner NOT visible
- Dashboard shows delivery status badge only
- No promotional messaging for Premium tier

**Acceptance Criteria:**
✅ Prompt hidden for Premium users
✅ Clean dashboard layout
✅ No redundant upgrade CTAs

---

#### TC-015: Click Upgrade Navigates to Settings
**Severity:** Medium
**Type:** Navigation

**Preconditions:**
- Church using Standard Delivery
- Upgrade prompt visible on Dashboard
- User logged in

**Test Steps:**
1. Navigate to Dashboard
2. Locate upgrade prompt
3. Click "Upgrade →" button
4. Observe page navigation

**Expected Results:**
- Browser navigates to: `#/admin/settings`
- Settings page loads
- "Church Profile" tab is active
- Delivery tier section visible
- User can immediately select Premium 10DLC

**Acceptance Criteria:**
✅ Navigation works correctly
✅ Settings page loads without errors
✅ User positioned at correct section

---

### 3. Settings Page Tests

#### TC-016: Standard Option Visible with Description
**Severity:** High
**Type:** UI

**Preconditions:**
- User logged in
- Settings page loaded

**Test Steps:**
1. Navigate to Settings → Church Profile
2. Scroll to "SMS Delivery Tier" section
3. Inspect "Standard Delivery" option

**Expected Results:**
- Radio button visible and functional
- Label: "📊 Standard Delivery"
- Blue badge: "Recommended"
- Description: "65% delivery rate • Instant activation • No EIN required"
- Benefits list:
  - ✓ Best for announcements, event notifications
  - ✓ No business information needed
  - ✓ Ready to use immediately
- Hover effect: Border color changes to primary blue

**Acceptance Criteria:**
✅ All text and icons render correctly
✅ Radio button functional
✅ Clear benefit statements
✅ Visual hierarchy apparent

---

#### TC-017: Premium Option Visible with Description
**Severity:** High
**Type:** UI

**Preconditions:**
- User logged in
- Settings page loaded

**Test Steps:**
1. Navigate to Settings → Church Profile
2. Scroll to "SMS Delivery Tier" section
3. Inspect "Premium 10DLC" option

**Expected Results:**
- Radio button visible and functional
- Label: "🚀 Premium 10DLC"
- Green badge: "Best Performance"
- Description: "99% delivery rate • 1-2 day approval • Requires EIN & business info"
- Benefits list:
  - ✓ Best for critical or time-sensitive messages
  - ✓ Highest delivery reliability (99%)
  - ✓ Individually verified brand
- Hover effect: Border color changes to primary blue

**Acceptance Criteria:**
✅ All text and icons render correctly
✅ Radio button functional
✅ Clear benefit statements
✅ Premium positioning conveyed

---

#### TC-018: Help Text Displays
**Severity:** Low
**Type:** UI/UX

**Preconditions:**
- User logged in
- Settings page loaded

**Test Steps:**
1. Navigate to Settings → Church Profile
2. Scroll to "SMS Delivery Tier" section
3. Locate help text box above tier options

**Expected Results:**
- Blue info box visible
- Icon: 💡
- Text: "Need help choosing? Standard works great for announcements and general messaging. Premium is best for time-sensitive or critical messages."
- Background: Light blue (`bg-blue-50`)
- Border: Blue (`border-blue-200`)

**Acceptance Criteria:**
✅ Help text clearly visible
✅ Guidance is helpful and accurate
✅ Styling consistent with design system

---

#### TC-019: Benefits Listed Correctly
**Severity:** Medium
**Type:** Content

**Preconditions:**
- User logged in
- Settings page loaded

**Test Steps:**
1. Navigate to Settings → Church Profile
2. Compare displayed benefits against specification

**Expected Results:**

**Standard Delivery Benefits:**
- ✓ Best for announcements, event notifications
- ✓ No business information needed
- ✓ Ready to use immediately

**Premium 10DLC Benefits:**
- ✓ Best for critical or time-sensitive messages
- ✓ Highest delivery reliability (99%)
- ✓ Individually verified brand

All benefits accurate, properly spelled, and aligned with marketing messaging.

**Acceptance Criteria:**
✅ Content accuracy verified
✅ No typos or grammar errors
✅ Benefits match product capabilities

---

#### TC-020: Form Saves Selection
**Severity:** Critical
**Type:** Functional

**Preconditions:**
- User logged in
- Settings page loaded

**Test Steps:**
1. Navigate to Settings → Church Profile
2. Select delivery tier (either Standard or Premium)
3. Fill in required fields (if Premium)
4. Click "Save Changes"
5. Observe UI feedback
6. Refresh page
7. Verify selection persists

**Expected Results:**
- Save button shows loading state: "Saving..."
- Success toast appears: "Profile updated successfully"
- Page reloads or state updates
- Selected tier remains checked after refresh
- Database confirms changes saved

**Acceptance Criteria:**
✅ Form submission works
✅ Loading states clear
✅ Success feedback shown
✅ Data persists across sessions

---

#### TC-021: Error Handling for Invalid Data
**Severity:** High
**Type:** Error Handling

**Test Data:**
```
Invalid EIN: abc123
Invalid Phone: 555-1234
Invalid State: XYZ
Invalid Postal: 123
```

**Test Steps:**
1. Select Premium 10DLC
2. Enter invalid data in each field
3. Click "Save Changes"
4. Observe error messages
5. Correct one field at a time
6. Re-submit after each correction

**Expected Results:**
- Multiple validation errors displayed simultaneously
- Each error message specific and actionable:
  - "EIN must contain only digits"
  - "Phone must be in format: +1XXXXXXXXXX"
  - "State must be 2-letter code (e.g., CA, NY)"
  - "Postal code must be 5 digits or 5+4 format"
- Errors clear when field corrected
- Form submits only when all valid

**Acceptance Criteria:**
✅ All validation errors shown
✅ Clear, helpful error messages
✅ Inline validation works
✅ Form blocks bad submissions

---

### 4. SMS Sending Tests

#### TC-022: Standard Uses Platform Brand ID
**Severity:** Critical
**Type:** Functional

**Preconditions:**
- Church using Standard Delivery
- `dlcStatus = "shared_brand"`
- `usingSharedBrand = true`
- Environment variable `TELNYX_PLATFORM_BRAND_ID` is set
- Church has phone number configured
- User logged in

**Test Steps:**
1. Navigate to Send Message page
2. Select group/members
3. Compose message: "Test message from Standard tier"
4. Click "Send Message"
5. Monitor backend console logs
6. Check Telnyx API request payload

**Expected Results:**
- SMS sent successfully
- Backend logs show:
  - "📤 Sending SMS: from [church_phone] to [recipient]"
  - "Brand: shared (65% delivery rate)"
  - "Using shared platform brand: [TELNYX_PLATFORM_BRAND_ID]"
- Telnyx API payload includes:
  ```json
  {
    "from": "[church_phone]",
    "to": "[recipient]",
    "text": "Test message from Standard tier",
    "brand_id": "[TELNYX_PLATFORM_BRAND_ID]"
  }
  ```
- Database: Message record created with `status = "sent"`

**Acceptance Criteria:**
✅ Platform brand ID used
✅ Message sent successfully
✅ 65% delivery rate indicated in logs
✅ Correct brand attribution

---

#### TC-023: Premium Approved Uses Church Brand ID
**Severity:** Critical
**Type:** Functional

**Preconditions:**
- Church using Premium 10DLC
- `dlcStatus = "approved"`
- `usingSharedBrand = false`
- `dlcBrandId` is set (e.g., "brand_church_xxx")
- Church has phone number configured
- User logged in

**Test Steps:**
1. Navigate to Send Message page
2. Select group/members
3. Compose message: "Test message from Premium tier"
4. Click "Send Message"
5. Monitor backend console logs
6. Check Telnyx API request payload

**Expected Results:**
- SMS sent successfully
- Backend logs show:
  - "📤 Sending SMS: from [church_phone] to [recipient]"
  - "Brand: personal (99% delivery rate)"
  - "Using personal 10DLC brand: [dlcBrandId]"
- Telnyx API payload includes:
  ```json
  {
    "from": "[church_phone]",
    "to": "[recipient]",
    "text": "Test message from Premium tier",
    "brand_id": "[dlcBrandId]"
  }
  ```
- Database: Message record created with `status = "sent"`

**Acceptance Criteria:**
✅ Church brand ID used
✅ Message sent successfully
✅ 99% delivery rate indicated in logs
✅ Correct brand attribution

---

#### TC-024: Premium Pending Uses Shared Brand
**Severity:** High
**Type:** Functional

**Preconditions:**
- Church selected Premium 10DLC
- `dlcStatus = "pending"` (awaiting approval)
- `usingSharedBrand = true` (fallback)
- `dlcBrandId` is null or not yet assigned
- Platform brand ID configured
- Church has phone number configured
- User logged in

**Test Steps:**
1. Navigate to Send Message page
2. Attempt to send message
3. Monitor backend behavior

**Expected Results:**
- **Option A (Fallback to Shared):**
  - SMS sent using platform brand ID
  - Logs show: "Brand: shared (65% delivery rate)"
  - User not blocked from sending

- **Option B (Queue Messages):**
  - Message queued for later delivery
  - User notification: "Message queued. Will send when Premium 10DLC approved."
  - Message status: "queued"

**Acceptance Criteria:**
✅ No error/crash during pending state
✅ Clear user feedback
✅ Fallback behavior documented
✅ Users can still communicate

**Note:** Verify intended behavior with product team.

---

#### TC-025: Brand ID Validation
**Severity:** High
**Type:** Error Handling

**Preconditions:**
- Church configured incorrectly (edge case)
- `usingSharedBrand = false` but `dlcBrandId = null`
- OR `usingSharedBrand = true` but `TELNYX_PLATFORM_BRAND_ID` not set
- User attempts to send SMS

**Test Steps:**
1. Configure church with invalid brand state
2. Attempt to send SMS
3. Observe error handling

**Expected Results:**
- Backend detects missing brand ID
- Warning log: "⚠️ Platform brand ID not configured. Sending without brand ID."
- OR Error: "Brand ID missing, cannot send message"
- User sees error toast: "Configuration error. Please contact support."
- Message not sent (or sent without brand_id if allowed by Telnyx)

**Acceptance Criteria:**
✅ Invalid states detected
✅ Clear error messages
✅ No silent failures
✅ Support escalation path provided

---

#### TC-026: Missing Environment Variable Handling
**Severity:** High
**Type:** Configuration

**Preconditions:**
- `TELNYX_PLATFORM_BRAND_ID` environment variable not set
- Church using Standard Delivery
- User attempts to send SMS

**Test Steps:**
1. Stop backend
2. Remove `TELNYX_PLATFORM_BRAND_ID` from `.env`
3. Start backend
4. Attempt to send SMS as Standard tier church

**Expected Results:**
- Backend logs warning on startup: "⚠️ TELNYX_PLATFORM_BRAND_ID not configured"
- SMS send attempt proceeds without brand_id
- Warning log: "⚠️ Platform brand ID not configured. Sending without brand ID."
- Message sent (Telnyx may accept, but with lower deliverability)
- OR Error if Telnyx rejects messages without brand_id

**Acceptance Criteria:**
✅ Graceful degradation
✅ Clear warning logs
✅ System doesn't crash
✅ Admin alerted to misconfiguration

---

### 5. API Endpoint Tests

#### TC-027: GET /api/admin/delivery-tier-status (Standard Tier)
**Severity:** High
**Type:** API

**Preconditions:**
- Church using Standard Delivery
- Valid auth token

**Test Steps:**
1. Send GET request to `/api/admin/delivery-tier-status`
2. Include auth header: `Authorization: Bearer [token]`
3. Inspect response

**Expected Results:**
- HTTP Status: 200 OK
- Response body:
```json
{
  "currentTier": "shared",
  "dlcStatus": "shared_brand",
  "deliveryRate": 0.65,
  "approvedAt": null,
  "tierName": "Standard Delivery (Shared Brand)",
  "description": "Platform's pre-verified shared SMS brand",
  "expectedDeliveryRate": "65%",
  "benefits": [
    "Instant activation",
    "No EIN required",
    "Pre-verified brand",
    "Works great for announcements"
  ],
  "setupTime": "Ready now ✅",
  "requirements": [],
  "upgradeInfo": {
    "available": true,
    "message": "Upgrade to Premium 10DLC anytime for 99% delivery"
  }
}
```

**Acceptance Criteria:**
✅ Correct HTTP status
✅ All fields present
✅ Data matches database
✅ Upgrade info shown

---

#### TC-028: GET /api/admin/delivery-tier-status (Premium Pending)
**Severity:** High
**Type:** API

**Preconditions:**
- Church selected Premium 10DLC
- `dlcStatus = "pending"`
- Valid auth token

**Test Steps:**
1. Send GET request to `/api/admin/delivery-tier-status`
2. Inspect response

**Expected Results:**
- HTTP Status: 200 OK
- Response body:
```json
{
  "currentTier": "premium",
  "dlcStatus": "pending",
  "deliveryRate": 0.65,
  "approvedAt": null,
  "tierName": "Premium 10DLC",
  "description": "Your church's personally verified SMS brand",
  "expectedDeliveryRate": "99%",
  "benefits": [
    "Highest delivery reliability (99%)",
    "Your church's branded SMS sender",
    "Individually verified with carriers",
    "Priority handling by carriers"
  ],
  "setupTime": "1-2 days",
  "requirements": [
    "Business EIN",
    "Church address",
    "Brand contact phone"
  ]
}
```

**Acceptance Criteria:**
✅ Premium tier indicated
✅ Pending status clear
✅ Expected delivery rate 99%
✅ Requirements listed

---

#### TC-029: GET /api/admin/delivery-tier-status (Premium Approved)
**Severity:** High
**Type:** API

**Preconditions:**
- Church Premium 10DLC approved
- `dlcStatus = "approved"`
- `dlcApprovedAt` is set
- Valid auth token

**Test Steps:**
1. Send GET request to `/api/admin/delivery-tier-status`
2. Inspect response

**Expected Results:**
- HTTP Status: 200 OK
- Response body includes:
```json
{
  "currentTier": "premium",
  "dlcStatus": "approved",
  "deliveryRate": 0.99,
  "approvedAt": "[ISO 8601 timestamp]",
  "tierName": "Premium 10DLC",
  "setupTime": "Complete ✅",
  ...
}
```

**Acceptance Criteria:**
✅ Approved status reflected
✅ 99% delivery rate
✅ Approval timestamp present
✅ Setup marked complete

---

#### TC-030: GET /api/admin/delivery-tier-status (Unauthorized)
**Severity:** Medium
**Type:** Security

**Preconditions:**
- No auth token OR invalid token

**Test Steps:**
1. Send GET request to `/api/admin/delivery-tier-status`
2. Omit `Authorization` header
3. Inspect response

**Expected Results:**
- HTTP Status: 401 Unauthorized
- Response body:
```json
{
  "error": "Unauthorized"
}
```
- No delivery tier data exposed

**Acceptance Criteria:**
✅ Auth required
✅ Correct error status
✅ No data leakage

---

#### TC-031: PUT /api/admin/profile (Update Tier to Standard)
**Severity:** Critical
**Type:** API

**Preconditions:**
- Church exists
- Valid auth token

**Test Steps:**
1. Send PUT request to `/api/admin/profile`
2. Request body:
```json
{
  "name": "Test Church",
  "email": "test@church.com",
  "wantsPremiumDelivery": false
}
```
3. Inspect response

**Expected Results:**
- HTTP Status: 200 OK
- Response body:
```json
{
  "success": true,
  "profile": {
    "id": "[church_id]",
    "name": "Test Church",
    "email": "test@church.com",
    "wantsPremiumDelivery": false,
    "dlcStatus": "shared_brand",
    "deliveryRate": 0.65,
    ...
  }
}
```
- Database: `wantsPremiumDelivery = false`
- Database: `dlcStatus = "shared_brand"`
- Activity log entry created

**Acceptance Criteria:**
✅ Profile updated successfully
✅ Tier changed to Standard
✅ Database persists changes
✅ Activity logged

---

#### TC-032: PUT /api/admin/profile (Update Tier to Premium with Valid Data)
**Severity:** Critical
**Type:** API

**Preconditions:**
- Church exists with phone number
- Valid auth token

**Test Steps:**
1. Send PUT request to `/api/admin/profile`
2. Request body:
```json
{
  "name": "Test Church",
  "email": "test@church.com",
  "wantsPremiumDelivery": true,
  "ein": "123456789",
  "brandPhoneNumber": "+12065551234",
  "streetAddress": "123 Main St",
  "city": "Seattle",
  "state": "WA",
  "postalCode": "98101",
  "website": "https://test.com",
  "entityType": "NON_PROFIT",
  "vertical": "NGO"
}
```
3. Inspect response

**Expected Results:**
- HTTP Status: 200 OK
- Response body includes updated profile with all fields
- Database: All 10DLC fields saved
- Background job triggered: `registerPersonal10DLCAsync()`
- Backend logs: "🔔 Triggering 10DLC registration..."
- Activity log entry created

**Acceptance Criteria:**
✅ All fields accepted and saved
✅ Registration job triggered
✅ No validation errors
✅ Activity logged

---

#### TC-033: PUT /api/admin/profile (Premium without Required Fields)
**Severity:** High
**Type:** API Validation

**Preconditions:**
- Church exists
- Valid auth token

**Test Steps:**
1. Send PUT request to `/api/admin/profile`
2. Request body:
```json
{
  "name": "Test Church",
  "email": "test@church.com",
  "wantsPremiumDelivery": true,
  "ein": "",
  "brandPhoneNumber": ""
}
```
3. Inspect response

**Expected Results:**
- HTTP Status: 400 Bad Request OR 200 OK with validation errors
- Frontend validation should prevent this, but backend validates too
- If backend validates:
  - Response includes error messages for missing fields
  - No database changes made
  - No background job triggered

**Acceptance Criteria:**
✅ Server-side validation works
✅ Clear error messages returned
✅ Invalid data rejected
✅ No partial updates

---

### 6. Edge Cases & Error Scenarios

#### TC-034: Switch Back from Premium to Standard
**Severity:** Medium
**Type:** Edge Case

**Preconditions:**
- Church upgraded to Premium
- Later decides to downgrade
- 10DLC brand information exists in database

**Test Steps:**
1. Church currently on Premium (any status)
2. Navigate to Settings
3. Select "Standard Delivery"
4. Save changes
5. Verify state

**Expected Results:**
- Downgrade successful
- `wantsPremiumDelivery = false`
- `dlcStatus = "shared_brand"`
- 10DLC brand data preserved in database (not deleted)
- Future re-upgrade possible without re-entering data

**Acceptance Criteria:**
✅ Downgrade works smoothly
✅ Data preserved for re-upgrade
✅ No data loss

---

#### TC-035: Multiple Churches Different Tiers
**Severity:** High
**Type:** Data Isolation

**Preconditions:**
- Multiple church accounts in system
- Church A: Standard
- Church B: Premium Pending
- Church C: Premium Approved

**Test Steps:**
1. For each church:
   - Log in as admin
   - Navigate to Dashboard
   - Check delivery status badge
   - Send test SMS
   - Verify correct brand ID used

**Expected Results:**
- Each church sees only their own tier
- Badge displays correctly per church
- SMS sent with correct brand ID per church:
  - Church A: Platform brand ID
  - Church B: Platform brand ID (fallback during pending)
  - Church C: Church C's brand ID
- No cross-contamination of data

**Acceptance Criteria:**
✅ Data isolation maintained
✅ Correct brand IDs used
✅ No leakage between tenants

---

#### TC-036: Brand Rejection State
**Severity:** High
**Type:** Error State

**Preconditions:**
- Church Premium 10DLC rejected
- `dlcStatus = "rejected"`
- `dlcRejectionReason = "Invalid EIN"`

**Test Steps:**
1. Log in as church admin
2. Navigate to Dashboard
3. Navigate to Settings
4. Attempt to re-submit with corrections

**Expected Results:**
- Dashboard badge: "❌ Approval Failed"
- Settings page shows:
  - Current Status: "❌ Failed - Contact support"
  - Clear explanation of rejection reason
- User can edit 10DLC fields
- User can re-save to trigger new registration attempt
- Support contact information visible

**Acceptance Criteria:**
✅ Rejection reason communicated
✅ User can self-serve corrections
✅ Re-submission possible
✅ Support escalation path clear

---

#### TC-037: Approval State Transitions
**Severity:** Medium
**Type:** State Machine

**Test Steps:**
1. Create church with Standard tier
2. Transition through all states:
   - Standard → Premium Pending
   - Pending → Approved
   - Approved → Standard (downgrade)
   - Standard → Premium Pending (re-upgrade)
3. Verify state transitions valid

**Expected Results:**
- All transitions work correctly
- State machine enforces valid transitions
- No invalid states reachable (e.g., can't go from "rejected" to "approved" directly)
- Database constraints prevent data corruption

**Acceptance Criteria:**
✅ State transitions valid
✅ No invalid states reachable
✅ Database integrity maintained

---

#### TC-038: User Role Permissions
**Severity:** High
**Type:** Authorization

**Test Roles:**
- Owner (full access)
- Co-Admin (assumed full or limited)
- Read-Only Admin (if exists)

**Test Steps:**
1. For each role:
   - Log in
   - Attempt to view tier selection
   - Attempt to change tier
   - Attempt to save changes
2. Verify permissions

**Expected Results:**
- **Owner:** Full access (view, edit, save)
- **Co-Admin:** Based on permissions (verify intended behavior)
- **Read-Only:** Can view, cannot edit (if role exists)
- Unauthorized actions blocked with clear error

**Acceptance Criteria:**
✅ Permissions enforced correctly
✅ Clear authorization errors
✅ Role-based access control works

---

#### TC-039: Data Consistency Checks
**Severity:** High
**Type:** Data Integrity

**Test Steps:**
1. After each tier change operation
2. Query database directly
3. Verify related fields updated together

**Expected Results:**
When `wantsPremiumDelivery = true`:
- If approved: `dlcStatus = "approved"` AND `deliveryRate = 0.99` AND `usingSharedBrand = false`
- If pending: `dlcStatus = "pending"` AND `deliveryRate = 0.65` AND `usingSharedBrand = true`

When `wantsPremiumDelivery = false`:
- `dlcStatus = "shared_brand"`
- `deliveryRate = 0.65`
- `usingSharedBrand = true`

No inconsistent states like:
- `wantsPremiumDelivery = false` but `dlcStatus = "approved"`
- `dlcStatus = "approved"` but `dlcBrandId = null`

**Acceptance Criteria:**
✅ Related fields stay synchronized
✅ No inconsistent database states
✅ Data integrity maintained

---

#### TC-040: Concurrent Tier Changes
**Severity:** Medium
**Type:** Concurrency

**Preconditions:**
- Church account exists
- Two admin users logged in simultaneously

**Test Steps:**
1. Admin A starts changing tier to Premium
2. Admin A fills in 10DLC fields (does not save yet)
3. Admin B changes tier to Standard and saves
4. Admin A clicks "Save Changes"
5. Verify outcome

**Expected Results:**
- **Option A (Last Write Wins):**
  - Admin A's save overwrites Admin B's change
  - Final state: Premium with Admin A's data

- **Option B (Optimistic Locking):**
  - Admin A gets error: "Profile updated by another user. Please refresh."
  - Admin A must reload and re-enter changes

- Activity log shows both attempts

**Acceptance Criteria:**
✅ Concurrency handled safely
✅ No data corruption
✅ Clear user feedback
✅ Activity log accurate

**Note:** Verify intended concurrency strategy with team.

---

#### TC-041: API Endpoint Response Validation
**Severity:** High
**Type:** API Contract

**Test Steps:**
1. Call `/api/admin/delivery-tier-status`
2. Validate response schema against spec
3. Ensure all required fields present
4. Ensure data types correct

**Expected Response Schema:**
```json
{
  "currentTier": "string (shared|premium)",
  "dlcStatus": "string",
  "deliveryRate": "number (0-1)",
  "approvedAt": "string (ISO 8601) | null",
  "tierName": "string",
  "description": "string",
  "expectedDeliveryRate": "string (percentage)",
  "benefits": ["string"],
  "setupTime": "string",
  "requirements": ["string"],
  "upgradeInfo": {
    "available": "boolean",
    "message": "string"
  } | undefined
}
```

**Acceptance Criteria:**
✅ All fields present when required
✅ Correct data types
✅ No extra/unexpected fields
✅ Schema documented

---

## Testing Strategy

### Test Approach

#### Manual Testing
- **UI/UX Tests:** TC-009 to TC-021, TC-034
- **Exploratory Testing:** All edge cases
- **User Acceptance Testing:** End-to-end workflows

#### Automated Testing

**Unit Tests:**
- Validation functions (EIN, phone, postal code formats)
- Component rendering (DeliveryStatusBadge states)
- Service layer (brand ID selection logic)

**Integration Tests:**
- API endpoints (TC-027 to TC-033)
- Database operations
- Background job triggering

**End-to-End Tests (Playwright/Cypress):**
- Critical user flows (TC-001, TC-003, TC-004, TC-022, TC-023)
- Cross-browser compatibility
- Mobile responsiveness

### Test Execution Schedule

**Phase 1: Unit & Integration (Week 1)**
- All validation logic
- API endpoints
- Database operations

**Phase 2: UI & Manual (Week 1-2)**
- Settings page UI
- Dashboard badge display
- Form interactions

**Phase 3: End-to-End (Week 2)**
- Critical user flows
- SMS sending with brand IDs
- Cross-browser testing

**Phase 4: Edge Cases (Week 2-3)**
- Concurrency scenarios
- Error states
- Data integrity checks

**Phase 5: UAT (Week 3)**
- Real user testing
- Feedback incorporation
- Final sign-off

---

## Acceptance Criteria

### Feature Complete When:

✅ **Tier Selection**
- [ ] Both tiers selectable and functional
- [ ] Validation prevents invalid data
- [ ] Database updates correctly
- [ ] Background jobs triggered appropriately

✅ **Dashboard Display**
- [ ] Badge displays for all tier states (4 variants)
- [ ] Upgrade prompt shows for Standard users
- [ ] Upgrade CTA navigates correctly

✅ **Settings UI**
- [ ] Both options fully described
- [ ] Help text clear and useful
- [ ] Form validation comprehensive
- [ ] Error messages actionable

✅ **SMS Functionality**
- [ ] Standard tier uses platform brand ID
- [ ] Premium approved uses church brand ID
- [ ] Fallback behavior during pending state
- [ ] No errors or crashes

✅ **API Endpoints**
- [ ] GET /api/admin/delivery-tier-status works for all states
- [ ] PUT /api/admin/profile updates tier correctly
- [ ] Authorization enforced
- [ ] Response schemas valid

✅ **Data Integrity**
- [ ] Related fields stay synchronized
- [ ] No inconsistent database states
- [ ] Concurrency handled safely
- [ ] Activity logs accurate

✅ **User Experience**
- [ ] Flows intuitive and clear
- [ ] Error messages helpful
- [ ] Loading states apparent
- [ ] Success feedback immediate

---

## Success Metrics

### Quantitative Metrics

**Test Coverage:**
- Unit test coverage: ≥ 90%
- Integration test coverage: ≥ 85%
- E2E test coverage for critical paths: 100%
- Overall code coverage: ≥ 85%

**Defect Metrics:**
- Critical defects: 0 before release
- High severity defects: ≤ 2 before release
- Medium/Low defects: ≤ 10 before release
- Post-release defects: ≤ 5 in first 30 days

**Performance:**
- Settings page load time: < 2 seconds
- Tier change save operation: < 3 seconds
- Dashboard badge render: < 100ms
- API endpoint response time: < 500ms (p95)

### Qualitative Metrics

**User Experience:**
- Users can select tier without confusion
- Error messages lead to successful corrections
- Upgrade path is clear and compelling
- Premium users see value in 99% delivery rate

**Reliability:**
- No data loss during tier changes
- Consistent state across page refreshes
- SMS sending never fails due to tier issues
- Graceful degradation when services unavailable

---

## Regression Test Suite

### Critical Smoke Tests (Run on every deploy)

1. **TC-001:** Select Standard Delivery from blank state
2. **TC-003:** Select Premium 10DLC with valid data
3. **TC-009:** Badge displays for Standard delivery
4. **TC-011:** Badge displays for Premium approved
5. **TC-022:** Standard uses platform brand ID
6. **TC-023:** Premium approved uses church brand ID
7. **TC-027:** GET /api/admin/delivery-tier-status (Standard)
8. **TC-031:** PUT /api/admin/profile (Update tier to Standard)

**Time:** ~30 minutes (automated)

### Full Regression Suite (Run before major releases)

- All 41 test cases
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness checks (375px, 768px, 1440px)
- Performance benchmarks
- Security scans

**Time:** ~4-6 hours (mostly automated)

---

## Test Execution Tracking

### Test Case Status Template

| Test ID | Title | Priority | Status | Assigned To | Date Executed | Notes |
|---------|-------|----------|--------|-------------|---------------|-------|
| TC-001 | Select Standard from blank | Critical | ✅ Pass | QA Engineer | 2025-11-24 | All assertions pass |
| TC-002 | Select Premium without data | Critical | ✅ Pass | QA Engineer | 2025-11-24 | Validation works |
| TC-003 | Select Premium with valid data | Critical | ⏳ In Progress | QA Engineer | - | - |
| ... | ... | ... | ... | ... | ... | ... |

**Legend:**
- ✅ Pass
- ❌ Fail
- ⏳ In Progress
- ⏸️ Blocked
- ⏭️ Skipped

---

## Defect Reporting Template

### Bug Report Format

**Title:** [Component] Brief description of issue

**Severity:**
- **Critical:** Blocks core functionality, data loss risk
- **High:** Major feature broken, workaround exists
- **Medium:** Minor feature issue, cosmetic with user impact
- **Low:** Cosmetic issue, no user impact

**Priority:**
- **P0:** Fix immediately (production down)
- **P1:** Fix before next release
- **P2:** Fix in upcoming sprint
- **P3:** Backlog

**Environment:**
- Browser/OS:
- Build version:
- Test environment:

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots/Logs:**
Attach evidence

**Test Case:** TC-XXX (if applicable)

---

## Test Environment Teardown

### Cleanup After Testing

**Database:**
- Remove test churches
- Reset tier selections for test accounts
- Clean up orphaned 10DLC records

**Telnyx Sandbox:**
- Release test phone numbers
- Delete test webhooks
- Clear test brand registrations

**Logs:**
- Archive test execution logs
- Preserve failure evidence for 90 days

---

## Appendix

### Glossary

- **10DLC:** 10-Digit Long Code, a phone number type for A2P messaging
- **A2P:** Application-to-Person messaging
- **TCR:** The Campaign Registry, manages brand/campaign registrations
- **EIN:** Employer Identification Number (US tax ID)
- **Telnyx:** SMS service provider
- **DLC Status:** Current state of 10DLC registration (shared_brand, pending, approved, rejected)
- **Brand ID:** Identifier for SMS sender brand in Telnyx system

### References

- [Telnyx 10DLC Documentation](https://developers.telnyx.com/docs/messaging/10dlc)
- [Feature Specification Document](./10DLC_FEATURE_SPEC.md)
- [Architecture Design](./ARCHITECTURE.md)
- [API Documentation](./API_DOCS.md)

---

## Sign-Off

**QA Lead:** _________________ Date: _________

**Product Manager:** _________________ Date: _________

**Engineering Lead:** _________________ Date: _________

---

**Document Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-24 | QA Team | Initial test plan created |

