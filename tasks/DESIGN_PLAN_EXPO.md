# Expo-Inspired Redesign Plan for Connect

## Overview
Transform Connect from a navy+gold luxury theme to a modern, dark-themed minimalist design inspired by Expo.dev. This redesign maintains all functionality while updating the visual aesthetic to be contemporary and professional.

## Design System

### Color Palette
**Primary Dark:**
- Background: #0a0a0a (near-black)
- Surface: #1a1a1a (dark gray)
- Border: #333333 (subtle borders)

**Accent Colors:**
- Primary Blue: #3b82f6 (action items, links)
- Success Green: #10b981 (confirmation, success states)
- Warning Orange: #f97316 (warnings, alerts)
- Error Red: #ef4444 (errors)

**Text:**
- Primary: #ffffff (white)
- Secondary: #a0aec0 (light gray)
- Tertiary: #718096 (medium gray)

### Typography
- Headlines (H1-H3): Bold, large (44-56px)
- Body: Medium weight, 16px
- Small text: 14px
- Letter-spacing: Tight for headings

### Components
- Bordered cards with 1px #333333 border
- Dark backgrounds with minimal color
- White text on dark backgrounds
- Rounded corners: 8-12px for cards
- Spacing: 16px, 24px, 32px baseline

## Page-by-Page Changes

### 1. Landing Page (LandingPage.tsx)
**Hero Section:**
- Dark background gradient (from #0a0a0a to #1a1a1a)
- Large bold headline: "Everything you need to communicate with your church"
- Subheading in secondary text color
- Two CTA buttons: Primary (white bg) and Secondary (outline)

**Features Section:**
- Grid of bordered feature cards (2-3 columns)
- Icon + title + description per card
- Dark borders, minimal spacing
- Example features:
  - Send SMS messages instantly
  - Manage branches and groups
  - Real-time analytics
  - Advanced message templates

**Social Proof Section:**
- "Trusted by..." heading
- Grid of company/church logos
- Stats section with metrics

**Bottom CTA:**
- Large heading with call-to-action
- Primary button

### 2. Navigation/Header
- Dark background (#0a0a0a)
- Logo on left
- Navigation links in white
- Sign Up button (white background, dark text)
- Subtle border-bottom

### 3. Login Page (LoginPage.tsx)
- Dark background gradient
- Centered card container with dark background
- Logo at top
- Form fields with dark styling
- Login button (white background)
- "Don't have an account?" link with Sign Up button

### 4. Register Page (RegisterPage.tsx)
- Same dark styling as Login
- Form fields for: First Name, Last Name, Church Name, Email, Password
- Create Account button
- Login link

### 5. Dashboard Pages
**Main Dashboard (DashboardPage.tsx):**
- Dark background
- Grid layout for dashboard cards
- Bordered cards with stats, recent activity
- Charts with accent color accents

**Sub-pages (all using same dark theme):**
- Branches, Groups, Members, Send Message, Message History, Templates, Recurring Messages, Analytics, Admin Settings
- Consistent dark card styling
- White text, subtle borders
- Action buttons with proper contrast

### 6. Billing/Subscription Pages
**Pricing Page (SubscribePage.tsx):**
- Dark background
- Plan cards in grid (3 columns)
- Bordered cards with dark backgrounds
- Pricing prominently displayed
- Feature list per plan
- CTA buttons for each plan

**Checkout Page (CheckoutPage.tsx):**
- Dark background
- Payment form card
- Order summary card
- Security badge

**Billing Page (BillingPage.tsx):**
- Dark card layout
- Current plan display
- Usage bars with accent colors
- Remaining capacity cards
- Billing information

### 7. Footer
- Dark background (#0a0a0a)
- 4-column layout: Product, Resources, Company, Legal
- Link sections
- Copyright text
- Social icons (GitHub, Twitter, Discord, etc.)

## Implementation Strategy

### Phase 1: Foundation
1. Update Tailwind config with dark colors
2. Create global CSS for dark mode defaults
3. Update Button component variants

### Phase 2: Core Pages
1. Redesign Landing Page with dark theme
2. Update Navigation
3. Redesign Login/Register pages

### Phase 3: Dashboard
1. Redesign Main Dashboard
2. Update all dashboard subpages
3. Maintain all existing functionality

### Phase 4: Billing & Footer
1. Redesign Pricing/Billing pages
2. Create new Footer component
3. Update Subscription flow

### Phase 5: Polish & Deploy
1. Comprehensive testing
2. Responsive design verification
3. Build and deploy

## Design Principles
- **Minimalism**: Remove unnecessary elements
- **Dark Theme**: Reduce eye strain, modern aesthetic
- **Clarity**: Large typography, clear hierarchy
- **Consistency**: Uniform spacing, colors, components
- **Functionality**: All features remain intact
- **Performance**: Optimize for fast loading

## Component Updates Needed
- Button (add dark variants)
- Card (dark styling)
- Input (dark theme)
- Select (dark theme)
- Navigation (dark theme with new structure)
- Footer (new component)

## Asset Requirements
- Expo-style icons for features
- Stats/analytics chart styling
- Brand colors for church/organization logos display

## Success Criteria
✓ All pages render in dark theme
✓ All existing functionality preserved
✓ Responsive on mobile, tablet, desktop
✓ Consistent with Expo design aesthetic
✓ Zero TypeScript errors
✓ Build succeeds
✓ Deploy successfully to Render
