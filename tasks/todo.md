# Add BackButton Component to Remaining Pages

## Problem
The BackButton component exists and has been added to BranchesPage and GroupsPage, but needs to be added to all other dashboard and auth pages for consistent navigation.

## Plan

### Dashboard Pages (use import path: `../../components/BackButton`)
- [ ] MembersPage.tsx
- [ ] SendMessagePage.tsx
- [ ] MessageHistoryPage.tsx
- [ ] TemplatesPage.tsx
- [ ] RecurringMessagesPage.tsx
- [ ] AnalyticsPage.tsx
- [ ] AdminSettingsPage.tsx

### Auth Pages (use import path: `../components/BackButton`)
- [ ] LoginPage.tsx
- [ ] RegisterPage.tsx
- [ ] SubscribePage.tsx
- [ ] CheckoutPage.tsx
- [ ] BillingPage.tsx

## Implementation Steps

For each page:
1. Add import statement at top with other component imports
2. Add BackButton JSX after main div opening:
   ```jsx
   <div className="mb-6">
     <BackButton variant="ghost" />
   </div>
   ```

## Review
(To be completed after implementation)
