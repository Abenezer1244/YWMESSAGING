# Connect Platform - Component Inventory & Mapping

## 📊 Available Library Components

### shadcn/ui: 40+ Components Available
### Kibo UI: 41+ Components Available
**Total: 81+ Pre-built Components**

---

## 🎯 Strategic Component Selection

This document maps the optimal component usage for each page/feature in Connect platform, maximizing library usage and minimizing custom code.

---

# 📄 LANDING PAGE COMPONENTS

## Hero Section
**Purpose:** Eye-catching welcome with CTA
**Components to Use:**
- **shadcn/ui - Button**: Primary & Secondary CTA buttons
- **shadcn/ui - Badge**: "PREMIUM SOLUTION" badge above headline
- **Kibo UI - Announcement**: Floating announcement banner
- **Custom:** Hero headline with gradient text (Tailwind)

**Details:**
- Large, bold typography
- Two prominent CTAs (Get Started, Learn More)
- Trust indicators/logos below hero
- Responsive full-width background

---

## Features Section
**Purpose:** Showcase platform capabilities
**Components to Use:**
- **shadcn/ui - Card**: Feature cards (6-8 features)
- **Kibo UI - Avatar Stack**: Team member avatars (if applicable)
- **shadcn/ui - Badge**: Feature tags/categories
- **Lucide Icons**: Feature icons (from integrated icon library)

**Details:**
- 3-column grid on desktop, stacked on mobile
- Icon + Title + Description per card
- Hover animations
- Color-coded feature categories

---

## Pricing Section
**Purpose:** Display subscription tiers
**Components to Use:**
- **shadcn/ui - Card**: Pricing tier cards
- **shadcn/ui - Button**: CTA buttons (different states for best value)
- **shadcn/ui - Badge**: "Popular" or "Most Chosen" badge
- **shadcn/ui - Check List**: Feature checkmarks
- **shadcn/ui - Separator**: Visual dividers between tiers

**Details:**
- 3-column layout (Starter, Professional, Enterprise)
- Feature comparison table below
- Highlight popular tier
- Monthly/yearly toggle if needed

---

## Testimonials Section
**Purpose:** Build social proof
**Components to Use:**
- **shadcn/ui - Card**: Testimonial cards
- **Kibo UI - Avatar Stack**: Customer avatars
- **shadcn/ui - Rating**: Star ratings (5-star system)
- **Kibo UI - Reel**: Optional video testimonials carousel

**Details:**
- 3-card carousel
- Customer photo, name, title
- 5-star rating
- Testimonial text
- Company logos

---

## Final CTA Section
**Purpose:** Convert visitors
**Components to Use:**
- **shadcn/ui - Button**: Primary CTA button
- **shadcn/ui - Badge**: "14-Day Free Trial" badge
- **Kibo UI - Banner**: Full-width promotional banner
- **shadcn/ui - Input**: Email signup field

**Details:**
- Bold headline
- Single email input
- Primary CTA button
- Trust message below

---

## Navigation/Header
**Purpose:** Site navigation
**Components to Use:**
- **shadcn/ui - Navigation Menu**: Desktop menu
- **shadcn/ui - Sheet**: Mobile hamburger menu
- **shadcn/ui - Button**: Auth buttons (Login/Register)
- **Kibo UI - Theme Switcher**: Dark mode toggle

**Details:**
- Logo on left
- Menu items center
- Auth buttons right
- Mobile-responsive sheet menu
- Dark mode switcher

---

## Footer
**Purpose:** Links and company info
**Components to Use:**
- **shadcn/ui - Separator**: Dividers
- **shadcn/ui - Navigation Menu**: Link groups
- **Kibo UI - Pill**: Social media icons
- **Lucide Icons**: Social links

**Details:**
- Multiple column layout
- Product, Company, Resources links
- Newsletter signup
- Social media links
- Copyright info

---

# 🔐 AUTHENTICATION PAGES

## Login Page
**Purpose:** User authentication
**Components to Use:**
- **shadcn/ui - Card**: Main form container
- **shadcn/ui - Input**: Email and password fields
- **shadcn/ui - Button**: Sign In CTA
- **shadcn/ui - Label**: Field labels
- **shadcn/ui - Separator**: Divider for social login
- **shadcn/ui - Alert**: Error messages
- **shadcn/ui - Link/Typography**: Forgot password, signup link

**Details:**
- Centered card layout
- Email input with validation
- Password input with show/hide toggle
- Remember me checkbox (optional)
- Forgot password link
- Sign up redirect
- Error message display

---

## Register Page
**Purpose:** New account creation
**Components to Use:**
- **shadcn/ui - Card**: Form container
- **shadcn/ui - Input**: First name, last name, email, password
- **shadcn/ui - Button**: Sign Up CTA
- **shadcn/ui - Label**: Field labels
- **shadcn/ui - Alert**: Validation errors
- **shadcn/ui - Checkbox**: Terms & conditions agreement
- **Kibo UI - Dropzone**: Optional church logo upload

**Details:**
- Multi-field form
- Email validation feedback
- Password strength indicator (custom Tailwind)
- Terms & conditions checkbox
- Login redirect link
- Field validation on blur
- Clear error messages

---

## Subscribe Page
**Purpose:** Choose subscription plan
**Components to Use:**
- **shadcn/ui - Card**: Plan options
- **shadcn/ui - Button**: Select plan button
- **shadcn/ui - Radio Group**: Plan selection
- **shadcn/ui - Badge**: Feature list
- **shadcn/ui - Separator**: Plan dividers

**Details:**
- Radio button selection per plan
- Features listed as badges
- Price display per plan
- Monthly/annual toggle
- Proceed to checkout button

---

## Billing Page
**Purpose:** View and manage subscription
**Components to Use:**
- **shadcn/ui - Card**: Billing info, current plan
- **shadcn/ui - Button**: Update payment, change plan, cancel
- **shadcn/ui - Badge**: Status badge (Active, Trial, etc.)
- **shadcn/ui - Table**: Billing history
- **shadcn/ui - Tabs**: Current Plan / Billing History
- **Kibo UI - Credit Card**: Current payment method display
- **shadcn/ui - Dialog**: Confirmation dialogs

**Details:**
- Current plan card with status
- Payment method display
- Billing history table (sortable)
- Usage meter
- Quick action buttons
- Upcoming charges info

---

## Checkout Page
**Purpose:** Payment processing
**Components to Use:**
- **shadcn/ui - Card**: Checkout summary
- **shadcn/ui - Input**: Card details (integrated with Stripe)
- **shadcn/ui - Button**: Pay Now CTA
- **shadcn/ui - Badge**: Order summary items
- **shadcn/ui - Spinner**: Loading state during payment
- **shadcn/ui - Alert**: Error/success messages
- **shadcn/ui - Separator**: Order breakdown sections

**Details:**
- Order summary on right
- Stripe card element
- Billing address form
- Apply promo code field
- Process button
- Security badges/messages

---

# 📊 DASHBOARD PAGES

## Main Dashboard Page
**Purpose:** Overview and quick actions
**Components to Use:**
- **shadcn/ui - Card**: Metric cards, quick stats
- **shadcn/ui - Button**: Quick action buttons
- **shadcn/ui - Badge**: Status indicators
- **shadcn/ui - Tabs**: Different dashboard views
- **shadcn/ui - Sidebar**: Navigation panel
- **shadcn/ui - Separator**: Content dividers
- **Kibo UI - Chart**: Message stats chart
- **Lucide Icons**: Metric icons

**Details:**
- Sidebar navigation on left
- Top metric cards (members, groups, messages sent)
- Activity chart
- Recent activity list
- Quick action buttons (Send Message, Add Member, etc.)
- Welcome message/banner

---

## Branches Page
**Purpose:** Manage church branches
**Components to Use:**
- **shadcn/ui - Card**: Branch cards or table
- **shadcn/ui - Button**: Add Branch, Edit, Delete
- **shadcn/ui - Dialog**: Add/Edit branch modal
- **shadcn/ui - Input**: Form fields (name, address, phone)
- **shadcn/ui - Select**: Dropdown for status
- **shadcn/ui - Badge**: Branch status badge
- **shadcn/ui - Tabs**: Branches / Settings
- **shadcn/ui - Table**: Branches list view
- **shadcn/ui - Empty**: Empty state when no branches

**Details:**
- Table/card view toggle
- Add Branch button in header
- Edit/Delete actions per row
- Branch info modal
- Status indicators
- Sort by name/date

---

## Groups Page
**Purpose:** Manage messaging groups
**Components to Use:**
- **shadcn/ui - Card**: Group cards
- **shadcn/ui - Table**: Groups list view
- **shadcn/ui - Button**: Add Group, Edit, Delete
- **shadcn/ui - Dialog**: Add/Edit group modal
- **shadcn/ui - Input**: Group name, welcome message
- **shadcn/ui - Badge**: Member count badge
- **shadcn/ui - Tabs**: Groups / Broadcast
- **shadcn/ui - Pagination**: Paginated group list
- **shadcn/ui - Empty**: Empty state

**Details:**
- Groups list with member count
- Add Group button
- Edit group details modal
- Delete confirmation dialog
- Search/filter groups
- View members in group link

---

## Members Page
**Purpose:** Manage church members
**Components to Use:**
- **shadcn/ui - Table**: Members data table (TanStack Table)
- **shadcn/ui - Button**: Add Member, Import CSV, Edit, Delete
- **shadcn/ui - Dialog**: Add/Edit member modal
- **shadcn/ui - Input**: Search members, name, phone, email
- **shadcn/ui - Checkbox**: Select multiple members
- **shadcn/ui - Badge**: Opt-in status, group tags
- **shadcn/ui - Pagination**: Member list pagination
- **shadcn/ui - Tabs**: Members / Imports / Exports
- **shadcn/ui - Empty**: Empty state
- **Kibo UI - Dropzone**: CSV import area
- **Kibo UI - Tags**: Member group tags

**Details:**
- Sortable/filterable table
- Search by name, phone, email
- Bulk actions (delete, add to group)
- Import CSV modal
- Export members functionality
- Status indicators

---

# 💬 MESSAGING PAGES

## Send Message Page
**Purpose:** Compose and send messages
**Components to Use:**
- **shadcn/ui - Card**: Form container
- **shadcn/ui - Tabs**: Recipients / Message / Schedule
- **shadcn/ui - Select**: Choose group/branch
- **shadcn/ui - Textarea**: Message content
- **shadcn/ui - Button**: Send, Save Draft, Schedule
- **shadcn/ui - Badge**: Character count, group members count
- **shadcn/ui - Checkbox**: Confirm sending
- **shadcn/ui - Dialog**: Preview message modal
- **shadcn/ui - Alert**: Validation alerts
- **Kibo UI - Editor**: Rich text message editor
- **Kibo UI - Calendar**: Schedule date picker
- **Lucide Icons**: Input type icons

**Details:**
- Group/branch selector
- Message compose area (plain text or rich text)
- Recipient list preview
- Estimated cost display
- Schedule option (date/time picker)
- Send/Save/Preview buttons
- Character counter
- Template selector

---

## Message History Page
**Purpose:** View sent messages and status
**Components to Use:**
- **shadcn/ui - Table**: Message history table
- **shadcn/ui - Badge**: Status badges (Sent, Failed, Scheduled)
- **shadcn/ui - Button**: Resend, View Details
- **shadcn/ui - Dialog**: Message details modal
- **shadcn/ui - Pagination**: Paginated history
- **shadcn/ui - Tabs**: Sent / Scheduled / Failed
- **shadcn/ui - Input**: Search/filter messages
- **shadcn/ui - Empty**: Empty state
- **Kibo UI - Relative Time**: Message send time display
- **Kibo UI - Table**: Enhanced table with sorting

**Details:**
- Filterable message list
- Status column with badges
- Sent date/time
- Recipient count
- View delivery status button
- Resend option
- Failed messages highlighted

---

## Templates Page
**Purpose:** Manage message templates
**Components to Use:**
- **shadcn/ui - Card**: Template cards
- **shadcn/ui - Button**: Create Template, Edit, Delete, Use
- **shadcn/ui - Dialog**: Create/Edit template modal
- **shadcn/ui - Input**: Template name, category
- **shadcn/ui - Textarea**: Template content
- **shadcn/ui - Badge**: Category/type badge
- **shadcn/ui - Tabs**: My Templates / Shared / All
- **shadcn/ui - Empty**: Empty state
- **Kibo UI - Editor**: Rich text template editor
- **shadcn/ui - Pagination**: Template list pagination

**Details:**
- Template card grid view
- Create new template button
- Edit/delete/duplicate options
- Template preview
- Categories/tags
- Search templates
- Use template quick action

---

## Recurring Messages Page
**Purpose:** Set up automated/recurring messages
**Components to Use:**
- **shadcn/ui - Card**: Recurring message cards
- **shadcn/ui - Button**: Create, Edit, Delete, Pause/Resume
- **shadcn/ui - Dialog**: Create/Edit recurring message modal
- **shadcn/ui - Input**: Title, message content
- **shadcn/ui - Select**: Frequency (daily, weekly, monthly)
- **shadcn/ui - Checkbox**: Days of week/month selector
- **shadcn/ui - Badge**: Status badge (Active, Paused)
- **shadcn/ui - Tabs**: Active / Paused / Completed
- **Kibo UI - Calendar**: Frequency date picker
- **shadcn/ui - Pagination**: Recurring list pagination
- **Kibo UI - Table**: Recurring messages table

**Details:**
- List of recurring messages
- Status indicator (active/paused)
- Frequency display (Every Monday at 9am, etc.)
- Next send date
- Edit/delete/pause buttons
- Create recurring message form with frequency picker

---

# 📈 ANALYTICS PAGE

**Purpose:** View comprehensive messaging analytics and reporting
**Components to Use:**
- **shadcn/ui - Tabs**: Message Stats / Delivery / Engagement / Custom
- **shadcn/ui - Card**: Metric cards (total messages, delivery rate, opt-in rate)
- **shadcn/ui - Select**: Date range picker, group filter
- **Kibo UI - Chart**: Multiple chart types (bar, line, pie, area)
- **shadcn/ui - Badge**: Status indicators, legend
- **shadcn/ui - Table**: Detailed analytics table
- **shadcn/ui - Pagination**: Data pagination
- **shadcn/ui - Button**: Export, Download, Share
- **shadcn/ui - Empty**: Empty state for no data
- **Lucide Icons**: Metric icons

**Details:**
- Date range selector
- Multiple metric cards (top row)
- Interactive charts (message volume, delivery status, engagement)
- Breakdown by group/branch
- Export to CSV/PDF
- Comparison view (month-to-month, etc.)
- Real-time stats dashboard

---

# ⚙️ ADMIN SETTINGS PAGE

**Purpose:** Admin controls and management
**Components to Use:**
- **shadcn/ui - Tabs**: Church Settings / Co-Admins / Activity Logs / Integrations
- **shadcn/ui - Card**: Setting categories
- **shadcn/ui - Input**: Church name, email, phone, Twilio config
- **shadcn/ui - Button**: Save, Cancel, Disconnect, Test Connection
- **shadcn/ui - Select**: Timezone, language, notification preferences
- **shadcn/ui - Checkbox**: Feature toggles
- **shadcn/ui - Toggle**: Enable/disable integrations
- **shadcn/ui - Dialog**: Confirmation dialogs, invite modal
- **shadcn/ui - Alert**: Warnings, success messages
- **shadcn/ui - Badge**: Integration status
- **shadcn/ui - Table**: Co-admins list, activity logs
- **Kibo UI - Relative Time**: Activity log timestamps
- **shadcn/ui - Empty**: Empty state

**Details:**

### Church Settings Tab:
- Church name, email, phone
- Timezone selector
- Feature preferences
- Notification settings
- Twilio integration setup
- Save changes button

### Co-Admins Tab:
- List of co-admins (table)
- Add co-admin button
- Invite modal (email input)
- Remove button
- Role selector

### Activity Logs Tab:
- Searchable activity log table
- User, action, timestamp, details
- Filter by action type
- Export logs button

### Integrations Tab:
- Connected services display
- Disconnect buttons
- Test connection buttons
- API key display (masked)

---

# 🔧 UTILITY & SHARED COMPONENTS

## Components Used Across All Pages

### Form Components (shadcn/ui)
- **Input**: Text fields, email, password
- **Label**: Field labels
- **Textarea**: Multi-line text
- **Select**: Dropdown selectors
- **Checkbox**: Boolean options
- **Radio Group**: Single option selection
- **Switch**: On/off toggles
- **Combobox**: Searchable dropdowns
- **Date Picker**: Date selection with calendar
- **Calendar**: Inline calendar selector
- **Input OTP**: For 2FA if needed

### Navigation (shadcn/ui)
- **Sidebar**: Left navigation panel
- **Navigation Menu**: Top menu
- **Dropdown Menu**: Action menus
- **Tabs**: Content sections
- **Breadcrumb**: Navigation path

### Dialogs & Overlays (shadcn/ui)
- **Dialog**: Modal windows
- **Alert Dialog**: Confirmation modals
- **Drawer**: Side panel
- **Sheet**: Mobile navigation
- **Popover**: Small floating panels

### Data Display (shadcn/ui + Kibo UI)
- **Table**: Data listing (shadcn/ui Table or Kibo Table)
- **Badge**: Status, category tags
- **Avatar**: User profile pictures
- **Card**: Content containers
- **Separator**: Visual dividers

### Feedback (shadcn/ui)
- **Alert**: Important messages
- **Toast**: Notifications (react-hot-toast already integrated)
- **Skeleton**: Loading placeholders
- **Spinner**: Loading indicator
- **Progress**: Progress bars

### Special (Kibo UI)
- **Theme Switcher**: Dark/light mode toggle
- **Announcement**: Promotional banners
- **Banner**: Full-width messages
- **Empty**: No data states

---

# 📋 INSTALLATION PRIORITY

## Batch 1: Foundation (Install First)
Already installed (6):
- Badge ✓
- Button ✓
- Card ✓
- DarkModeToggle ✓
- Input ✓
- Spinner ✓

Add next (15):
```bash
npx shadcn-cli@latest add dialog
npx shadcn-cli@latest add label
npx shadcn-cli@latest add textarea
npx shadcn-cli@latest add select
npx shadcn-cli@latest add checkbox
npx shadcn-cli@latest add radio-group
npx shadcn-cli@latest add switch
npx shadcn-cli@latest add table
npx shadcn-cli@latest add tabs
npx shadcn-cli@latest add separator
npx shadcn-cli@latest add alert
npx shadcn-cli@latest add navigation-menu
npx shadcn-cli@latest add dropdown-menu
npx shadcn-cli@latest add empty
npx shadcn-cli@latest add pagination
```

## Batch 2: Forms & Inputs (Install Second)
```bash
npx shadcn-cli@latest add form
npx shadcn-cli@latest add input-otp
npx shadcn-cli@latest add combobox
npx shadcn-cli@latest add calendar
npx shadcn-cli@latest add date-picker
npx shadcn-cli@latest add field
```

## Batch 3: Dialogs & Overlays (Install Third)
```bash
npx shadcn-cli@latest add alert-dialog
npx shadcn-cli@latest add drawer
npx shadcn-cli@latest add sheet
npx shadcn-cli@latest add popover
npx shadcn-cli@latest add tooltip
npx shadcn-cli@latest add hover-card
npx shadcn-cli@latest add context-menu
```

## Batch 4: Display & Advanced (Install Fourth)
```bash
npx shadcn-cli@latest add skeleton
npx shadcn-cli@latest add progress
npx shadcn-cli@latest add slider
npx shadcn-cli@latest add scroll-area
npx shadcn-cli@latest add resizable
npx shadcn-cli@latest add carousel
npx shadcn-cli@latest add breadcrumb
npx shadcn-cli@latest add toggle
npx shadcn-cli@latest add toggle-group
npx shadcn-cli@latest add button-group
npx shadcn-cli@latest add avatar
npx shadcn-cli@latest add aspect-ratio
npx shadcn-cli@latest add kbd
npx shadcn-cli@latest add command
```

## Batch 5: Kibo UI Components (Install Last)
```bash
npx shadcn-cli@latest add -r @kibo-ui data-table
npx shadcn-cli@latest add -r @kibo-ui chart
npx shadcn-cli@latest add -r @kibo-ui editor
npx shadcn-cli@latest add -r @kibo-ui dropzone
npx shadcn-cli@latest add -r @kibo-ui color-picker
npx shadcn-cli@latest add -r @kibo-ui tags
npx shadcn-cli@latest add -r @kibo-ui avatar-stack
npx shadcn-cli@latest add -r @kibo-ui rating
npx shadcn-cli@latest add -r @kibo-ui theme-switcher
npx shadcn-cli@latest add -r @kibo-ui announcement
npx shadcn-cli@latest add -r @kibo-ui banner
npx shadcn-cli@latest add -r @kibo-ui credit-card
npx shadcn-cli@latest add -r @kibo-ui calendar
npx shadcn-cli@latest add -r @kibo-ui relative-time
```

---

# 🎯 Component Count Summary

### Current Status:
- ✅ **6 components installed** (Badge, Button, Card, DarkModeToggle, Input, Spinner)
- ⏳ **39 more shadcn/ui components** to add
- ⏳ **14 Kibo UI components** to add
- **Total: 59 additional components** ready to install

### Custom Components to Update (24):
1. BranchFormModal → Use shadcn Dialog
2. BranchSelector → Use shadcn Select or Combobox
3. GroupFormModal → Use shadcn Dialog
4. AddMemberModal → Use shadcn Dialog
5. ImportCSVModal → Use Kibo Dropzone
6. TemplateFormModal → Use shadcn Dialog + Kibo Editor
7. RecurringMessageModal → Use shadcn Dialog + Kibo Calendar
8. TrialBanner → Use Kibo Banner
9. ActivityLogsPanel → Use shadcn Table + Kibo Relative Time
10. CoAdminPanel → Use shadcn Table + Dialog
11. All landing components → Use appropriate components above

---

# 🔄 Implementation Strategy

## Phase 1: Component Installation
- Install all shadcn/ui Batch 1-4 components
- Install Kibo UI components
- Verify all components render without errors
- Test imports and basic functionality

## Phase 2: Component Mapping
- Map each custom component to library components
- Plan modal structures
- Plan form layouts
- Plan table implementations

## Phase 3: Page-by-Page Redesign
- Use component inventory as reference
- Replace custom HTML with library components
- Apply design system (colors, spacing, typography)
- Add interactivity and states

## Phase 4: Testing
- Verify all pages render correctly
- Test all interactions
- Responsive design validation
- Cross-browser testing

---

# 📚 Additional Notes

### Dependencies Already Integrated:
- ✅ react-hot-toast (for notifications/toasts)
- ✅ recharts (for charts, used by Kibo Chart)
- ✅ react-hook-form (for form management)
- ✅ lucide-react (for icons)
- ✅ @stripe/react-stripe-js (for payments)
- ✅ tailwindcss (base styling)

### Why This Strategy Works:
1. **Maximum code reuse**: 59 pre-built components = less custom code
2. **Consistency**: All components follow same design patterns
3. **Accessibility**: All components WCAG compliant
4. **Responsive**: All components mobile-first
5. **Maintenance**: Easier to update and maintain
6. **Speed**: Faster development using proven components

---

