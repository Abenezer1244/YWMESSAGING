# Mobile Testing Checklist

Comprehensive manual testing checklist for validating mobile responsiveness across all pages and devices.

## Test Devices & Viewports

### Physical Devices
- [ ] iPhone 13 (390 × 844 pixels)
- [ ] iPhone 14/15 (390 × 844 pixels)
- [ ] iPad Pro 11" (834 × 1194 pixels)
- [ ] Pixel 5 (393 × 851 pixels)
- [ ] Samsung Galaxy S21 (360 × 800 pixels)

### Browser Emulation (DevTools)
- [ ] Chrome DevTools - iPhone SE (375 × 667)
- [ ] Chrome DevTools - Pixel 5 (393 × 851)
- [ ] Chrome DevTools - iPad Pro (1024 × 1366)

---

## Per-Page Testing

### 1. Login Page (`/login`)

**Mobile (375px)**
- [ ] Form fields stack vertically
- [ ] Email input is ≥ 44px tall
- [ ] Password input is ≥ 44px tall
- [ ] Login button is ≥ 44px tall
- [ ] No horizontal scroll
- [ ] Error messages display properly
- [ ] "Sign up" link is clickable and ≥ 44px tall

**Tablet (768px)**
- [ ] Form is centered with max-width
- [ ] All fields visible without scroll
- [ ] Touch targets are comfortable

**Desktop (1440px)**
- [ ] Form positioned correctly
- [ ] All interactive elements aligned

---

### 2. Register Page (`/register`)

**Mobile (375px)**
- [ ] Form fields stack vertically
- [ ] Each input is ≥ 44px tall
- [ ] Next/Submit buttons are ≥ 44px tall
- [ ] Trust indicators (3 columns) stack to 1 column
- [ ] No horizontal scroll
- [ ] No cramped text or icons

**Tablet (768px)**
- [ ] Form is properly centered
- [ ] Trust indicators show 3 columns side-by-side
- [ ] All elements visible

**Desktop (1440px)**
- [ ] Trust indicators well-spaced
- [ ] Form has proper max-width

---

### 3. Dashboard (`/dashboard`)

**Mobile (375px)**
- [ ] Navigation/sidebar accessible
- [ ] No horizontal scroll
- [ ] All cards display in single column
- [ ] Buttons are ≥ 44px tall

**Tablet (768px)**
- [ ] Grid adapts to 2-column layout
- [ ] Navigation visible and accessible

**Desktop (1440px)**
- [ ] Full 3+ column grid displays
- [ ] All panels visible in split view

---

### 4. Members Page (`/dashboard/branches/*/groups`)

**Mobile (375px)**
- [ ] 6-column table converts to card layout
- [ ] Each member shows as a card with:
  - [ ] Name (label + value)
  - [ ] Phone (label + value)
  - [ ] Email (label + value)
  - [ ] Status (label + badge)
  - [ ] Added date (label + value)
  - [ ] Delete button (≥ 44px)
- [ ] Search input is ≥ 44px tall
- [ ] "Add Member" button is ≥ 44px tall
- [ ] "Import CSV" button is ≥ 44px tall
- [ ] Pagination buttons are ≥ 44px tall
- [ ] No horizontal scroll
- [ ] Cards are full-width with padding

**Tablet (768px)**
- [ ] Cards display 2 per row (or table with horizontal scroll allowed)
- [ ] All controls visible
- [ ] Touch targets comfortable

**Desktop (1440px)**
- [ ] Full table displays (6 columns)
- [ ] Hover effects work
- [ ] All spacing proper

---

### 5. Admin Settings Page (`/dashboard/admin/settings`)

**Mobile (375px)**
- [ ] Tabs convert to dropdown select
- [ ] Select is ≥ 44px tall
- [ ] Tab content displays below dropdown
- [ ] All form fields are ≥ 44px tall
- [ ] Form fields stack vertically
- [ ] Save button is ≥ 44px tall
- [ ] No horizontal scroll

**Tablet (768px)**
- [ ] Tabs show horizontally with scroll if needed
- [ ] Form uses 2-column grid (if applicable)
- [ ] All controls accessible

**Desktop (1440px)**
- [ ] Tabs display as horizontal buttons
- [ ] Form uses 2-column grid
- [ ] All spacing proper

---

### 6. Conversations Page (`/dashboard/conversations`)

**Mobile (375px)**
- [ ] List view shows conversation items (full-width)
- [ ] Each item is clickable and ≥ 44px tall
- [ ] Search input is ≥ 44px tall
- [ ] Clicking conversation shows messages only
- [ ] Back button (< or back text) is ≥ 44px tall and visible
- [ ] Message thread displays full-width
- [ ] Reply composer is usable
- [ ] Back button navigates back to list
- [ ] No horizontal scroll in either view

**Tablet (768px)**
- [ ] Split view with list on left, messages on right
- [ ] List and messages both visible
- [ ] Proper proportions (e.g., 1/3 + 2/3)

**Desktop (1440px)**
- [ ] 3-column layout (list + messages + details)
- [ ] All sections visible and accessible

---

### 7. Message History Page (`/dashboard/messages/history`)

**Mobile (375px)**
- [ ] 5-column table converts to card layout
- [ ] Each message shows as a card with:
  - [ ] Message content (label + truncated text)
  - [ ] Recipients (label + count)
  - [ ] Delivery (label + count/percentage)
  - [ ] Status (label + badge)
  - [ ] Sent (label + date + time)
- [ ] Filter dropdown is ≥ 44px tall
- [ ] Pagination buttons are ≥ 44px tall
- [ ] No horizontal scroll
- [ ] Cards are full-width with padding

**Tablet (768px)**
- [ ] Cards display properly
- [ ] All controls accessible

**Desktop (1440px)**
- [ ] Full table displays (5 columns)
- [ ] All spacing and hover effects work

---

### 8. Analytics Page (`/dashboard/analytics`)

**Mobile (375px)**
- [ ] Summary stats grid shows 1 column
- [ ] Each stat card is ≥ 40px tall
- [ ] Charts resize to fit viewport width
- [ ] Branch details table converts to cards
- [ ] Message stats grid shows 1 column (4 items stacked)
- [ ] Filter/date selector dropdown is ≥ 44px tall
- [ ] No horizontal scroll

**Tablet (768px)**
- [ ] Summary stats show 2 columns
- [ ] Message stats show 2 columns
- [ ] Charts are readable
- [ ] Branch table shows as cards or horizontal scroll

**Desktop (1440px)**
- [ ] Summary stats show 5 columns
- [ ] Message stats show 4 columns
- [ ] Charts full-width and readable
- [ ] Branch table shows full 5-column layout

---

## Cross-Device Testing

### Dark Mode Testing

**All Devices:**
- [ ] Login page dark mode
- [ ] Register page dark mode
- [ ] Dashboard dark mode
- [ ] All form inputs visible in dark mode
- [ ] All text has sufficient contrast
- [ ] Badges and status indicators visible

### Orientation Testing (Mobile/Tablet)

**Portrait Mode (Primary)**
- [ ] All layouts test as documented above

**Landscape Mode (Mobile)**
- [ ] No horizontal scroll
- [ ] Layouts adapt to wider viewport (375w → 667w)
- [ ] All controls remain touch-friendly

**Landscape Mode (Tablet)**
- [ ] Full content visible
- [ ] Navigation accessible
- [ ] No excessive spacing

---

## Touch & Interaction Testing

### Button Accessibility
- [ ] All buttons ≥ 40px tall (≥ 44px recommended)
- [ ] Button padding is comfortable for touch
- [ ] Active/hover states are visible
- [ ] Disabled states are visually distinct

### Form Input Accessibility
- [ ] All inputs ≥ 40px tall
- [ ] Labels are visible and associated
- [ ] Placeholders don't replace labels
- [ ] Error messages are clear
- [ ] Required fields marked with asterisk

### Scrolling
- [ ] No unintended horizontal scroll
- [ ] Vertical scroll is smooth
- [ ] Pull-to-refresh works (if implemented)
- [ ] Infinite scroll works (if implemented)

### Gestures
- [ ] Swipe gestures (if implemented) work
- [ ] Double-tap zoom works appropriately
- [ ] Pinch zoom works on images
- [ ] Long-press shows context menu (if applicable)

---

## Performance Testing

### Load Times
- [ ] Pages load within 3 seconds on 3G
- [ ] Images load and display properly
- [ ] CSS is applied before content paints
- [ ] JavaScript doesn't block initial render

### Rendering
- [ ] No layout shift during load (CLS < 0.1)
- [ ] Animations are smooth (60fps)
- [ ] Scrolling is smooth
- [ ] No jank when opening/closing modals

### Network
- [ ] Handles slow 3G gracefully
- [ ] Shows loading states
- [ ] Error handling displays properly
- [ ] Retry buttons work

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Enter/Space triggers buttons
- [ ] Escape closes modals
- [ ] Arrow keys work in dropdowns

### Screen Reader (VoiceOver/TalkBack)
- [ ] All buttons are announced
- [ ] Form labels are associated
- [ ] ARIA labels present where needed
- [ ] Headings are semantic
- [ ] Images have alt text

### Color Contrast
- [ ] Text contrast ≥ 4.5:1 (normal)
- [ ] Large text contrast ≥ 3:1
- [ ] Button contrast ≥ 3:1 for non-text
- [ ] Check in both light and dark modes

---

## Known Issues & Notes

### Device-Specific Issues
- [ ] iPhone notch handling (safe areas)
- [ ] Android system bars (if WebView)
- [ ] Home indicator on iPad
- [ ] Status bar overlap

### Browser-Specific Issues
- [ ] Safari viewport height issues
- [ ] Chrome DevTools accuracy
- [ ] Firefox responsive mode differences

---

## Test Results Summary

### Date: _______________

| Page | Mobile | Tablet | Desktop | Notes |
|------|--------|--------|---------|-------|
| Login | ☐ Pass | ☐ Pass | ☐ Pass | |
| Register | ☐ Pass | ☐ Pass | ☐ Pass | |
| Dashboard | ☐ Pass | ☐ Pass | ☐ Pass | |
| Members | ☐ Pass | ☐ Pass | ☐ Pass | |
| Admin Settings | ☐ Pass | ☐ Pass | ☐ Pass | |
| Conversations | ☐ Pass | ☐ Pass | ☐ Pass | |
| Message History | ☐ Pass | ☐ Pass | ☐ Pass | |
| Analytics | ☐ Pass | ☐ Pass | ☐ Pass | |

### Overall Status
- [ ] All pages pass mobile testing
- [ ] All pages pass tablet testing
- [ ] All pages pass desktop testing
- [ ] All accessibility requirements met
- [ ] All performance targets met

### Signed Off By: _______________
### Date: _______________

---

## Automated Testing

Run Playwright tests:
```bash
npm run test -- mobile-responsiveness
```

Run on specific devices:
```bash
npm run test -- mobile-responsiveness --project="iPhone 13"
npm run test -- mobile-responsiveness --project="iPad Pro"
npm run test -- mobile-responsiveness --project="Mobile Chrome"
```

View HTML report:
```bash
npm run test:report
```

---

## Resources

- [WCAG 2.1 Mobile Accessibility](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Playwright Device Emulation](https://playwright.dev/docs/emulation)
- [Chrome DevTools Mobile Emulation](https://developer.chrome.com/docs/devtools/device-mode/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
