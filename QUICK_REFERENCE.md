# Frontend Hardcoded Colors - Quick Reference Guide

## 14 Files With Issues Found

### CRITICAL (1)
1. **DashboardPage.tsx** - 15+ hardcoded color instances, includes hex colors and gradients

### HIGH PRIORITY (10)
2. **AdminSettingsPage.tsx** - Gradient: `from-blue-500 to-cyan-500`
3. **BillingPage.tsx** - Gradient: `from-blue-500 to-cyan-500`
4. **AnalyticsPage.tsx** - Gradient: `from-blue-500 to-cyan-500`
5. **BranchesPage.tsx** - Gradient: `from-blue-500 to-cyan-500`
6. **GroupsPage.tsx** - Gradient: `from-blue-500 to-cyan-500`
7. **MembersPage.tsx** - Gradient: `from-blue-500 to-cyan-500`
8. **MessageHistoryPage.tsx** - Gradient: `from-blue-500 to-cyan-500`
9. **RecurringMessagesPage.tsx** - Gradient: `from-blue-500 to-cyan-500`
10. **SendMessagePage.tsx** - Gradient: `from-blue-500 to-cyan-500`
11. **TemplatesPage.tsx** - Gradient: `from-blue-500 to-cyan-500`

### MEDIUM PRIORITY (3)
12. **AboutPage.tsx** - Mixed: `from-primary/10 to-blue-500/10`
13. **BlogPage.tsx** - Mixed: `from-primary/10 to-blue-500/10`
14. **CareersPage.tsx** - Mixed: `from-primary/10 to-blue-500/10`

---

## What To Replace

### Hex Colors
```typescript
// BEFORE (Hardcoded)
const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];
<Bar fill="#3b82f6" />
<Line stroke="#06b6d4" />

// AFTER (Design Tokens)
const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];
// Or use hsl() with CSS variables
```

### Tailwind Gradients
```typescript
// BEFORE (Hardcoded)
className="bg-gradient-to-r from-blue-500 to-cyan-500"

// AFTER (Design Tokens)
className="bg-gradient-to-r from-primary to-secondary"
// Or
className="bg-gradient-to-r from-secondary to-accent"
```

### Mixed Gradients
```typescript
// BEFORE (Mixed)
className="bg-gradient-to-r from-primary/10 to-blue-500/10"

// AFTER (Consistent)
className="bg-gradient-to-r from-primary/10 to-secondary/10"
// Or
className="bg-gradient-to-r from-primary/10 to-accent/10"
```

---

## Available Design Tokens

| Token | Tailwind Class | Usage |
|-------|---|---|
| `--primary` | `bg-primary`, `text-primary` | Main brand color |
| `--secondary` | `bg-secondary`, `text-secondary` | Secondary actions |
| `--accent` | `bg-accent`, `text-accent` | Accent highlights |
| `--muted` | `bg-muted`, `text-muted` | Disabled/secondary content |
| `--background` | `bg-background` | Page background |
| `--foreground` | `text-foreground` | Primary text |
| `--destructive` | `bg-destructive` | Errors/dangerous actions |
| `--chart-1` to `--chart-5` | `text-chart-1` | Chart colors |

### Opacity Support
All tokens support Tailwind opacity modifiers:
```typescript
bg-primary/10   // 10% opacity
bg-primary/20   // 20% opacity
...
bg-primary/90   // 90% opacity
```

---

## Compliance Checklist

For each page with issues:

- [ ] No hex color codes (#XXXXXX)
- [ ] No hardcoded Tailwind colors (blue-500, cyan-500, etc.)
- [ ] All colors use design tokens or CSS variables
- [ ] Gradients use design token combinations
- [ ] Chart fills/strokes use design tokens
- [ ] Consistent color usage across the page
- [ ] Works in light and dark modes

---

## Files Already Compliant (No Changes Needed)

- LoginPage.tsx
- RegisterPage.tsx
- TermsPage.tsx
- PrivacyPage.tsx
- SecurityPage.tsx
- LandingPage.tsx
- CheckoutPage.tsx
- CookiePolicyPage.tsx

---

## References

**Design Tokens Definition:**
`frontend/src/index.css` (Lines 421-618)

**Tailwind Configuration:**
`frontend/tailwind.config.js` (Colors section)

**Usage Examples:**
See LoginPage.tsx, RegisterPage.tsx, or TermsPage.tsx for compliant implementations.

---

## Quick Stats

- **Total Pages Audited:** 22
- **Pages with Issues:** 14 (64%)
- **Compliant Pages:** 8 (36%)
- **Hardcoded Colors Found:** 5 hex values
- **Hardcoded Tailwind Classes:** 15+ instances
- **Design Tokens Available:** 14+ primary tokens

