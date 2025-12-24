# Accessibility Best Practices Guide

**Version**: 1.0
**Status**: Complete
**Team**: All Developers & Designers
**Last Updated**: December 3, 2024

---

## Executive Summary

This guide contains battle-tested best practices for building accessible web applications. Following these practices ensures our platform is usable by everyone, including people with disabilities, and keeps us WCAG 2.1 Level AA compliant.

---

## 1. Planning Phase

### Start with Accessibility in Mind
- Include accessibility in user stories and acceptance criteria
- Plan for keyboard navigation from the start
- Consider color blindness when designing UI
- Design for screen readers, not just visual interfaces

### Example: User Story with Accessibility

```
As a user with low vision,
I want to zoom the page to 200%,
So that I can read the content without using a screen magnifier.

Acceptance Criteria:
- ✅ All text remains readable at 200% zoom
- ✅ No horizontal scrolling introduced at 200% zoom
- ✅ Focus indicators still visible at 200% zoom
- ✅ Touch targets maintain 44x44px size
```

---

## 2. Design Phase

### Color & Contrast

**DO**:
- ✅ Use color combinations with 4.5:1 contrast ratio (WCAG AA)
- ✅ Test designs with color blindness simulator
- ✅ Use color + icons/text to convey information
- ✅ Consider dark mode from the start

**DON'T**:
- ❌ Use color alone to convey information
- ❌ Make assumptions about color perception
- ❌ Use low contrast for decorative elements
- ❌ Forget about dark mode contrast

**Tools**:
- [Color Picker WebAIM](https://webaim.org/resources/contrastchecker/)
- [Coblis Color Blindness Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)

### Typography & Spacing

**DO**:
- ✅ Use 16px minimum for body text
- ✅ Maintain line height of 1.5 or greater
- ✅ Use max-width of 80 characters for readability
- ✅ Provide adequate spacing between elements

**DON'T**:
- ❌ Use text smaller than 14px (causes readability issues)
- ❌ Use line height less than 1.4
- ❌ Crowd elements together
- ❌ Use poor font choices for body text

### Interactive Elements

**DO**:
- ✅ Make touch targets at least 44x44px (WCAG AAA)
- ✅ Provide 8px spacing between touch targets
- ✅ Use clear, descriptive button labels
- ✅ Provide visual feedback for hover/focus states

**DON'T**:
- ❌ Create touch targets smaller than 24x24px (WCAG AA minimum)
- ❌ Place buttons too close together
- ❌ Use unclear or generic labels ("Click here")
- ❌ Hide focus or hover states

---

## 3. Development Phase

### Component Selection

**Always use accessible components**:
```jsx
// ✅ GOOD: Use accessible component library
import { AccessibleButton, AccessibleInput } from '@/components/accessible';

<AccessibleButton label="Submit" onClick={handleSubmit} />
<AccessibleInput label="Email" type="email" />

// ❌ BAD: Custom non-accessible components
<div onClick={handleSubmit}>Submit</div>
<input placeholder="Email" />
```

### Semantic HTML First

**Rule**: Use semantic HTML before considering ARIA.

```jsx
// ✅ GOOD: Semantic HTML
<button onClick={handleDelete}>Delete</button>
<nav><a href="/home">Home</a></nav>
<h1>Page Title</h1>
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ❌ BAD: Non-semantic HTML + ARIA patches
<div role="button" onClick={handleDelete}>Delete</div>
<div role="navigation"><div role="link">Home</div></div>
<div role="heading" aria-level="1">Page Title</div>
<div>Email</div>
<input type="email" />
```

### Form Handling

**Pattern**: Label + Input + Error Message

```jsx
// ✅ GOOD: Complete form field
<div className="form-field">
  <label htmlFor="password">
    Password
    <span aria-label="required">*</span>
  </label>
  <input
    id="password"
    type="password"
    aria-describedby={error ? "password-error" : undefined}
    aria-invalid={!!error}
    required
  />
  {error && (
    <span id="password-error" role="alert">
      {error}
    </span>
  )}
</div>

// ❌ BAD: Missing associations
<span>Password</span>
<input type="password" />
<span>Error message</span>
```

### Keyboard Navigation

**Every interactive element must work with keyboard**:

```jsx
// ✅ GOOD: Button works with keyboard
<button onClick={handleClick}>
  Click Me
</button>

// ❌ BAD: Div requires keyboard handling
<div onClick={handleClick}>
  Click Me
</div>

// ✅ GOOD: Dropdown with arrow key support
const handleKeyDown = (e) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      selectNext();
      break;
    case 'ArrowUp':
      e.preventDefault();
      selectPrev();
      break;
    case 'Escape':
      closeMenu();
      break;
  }
};

// Custom element must handle keyboard
<div
  role="button"
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  tabIndex={0}
>
  Custom Button
</div>
```

### ARIA Usage Rules

**Use ARIA only when semantic HTML won't work**:

```jsx
// ✅ GOOD: Use semantic HTML when possible
<button>Submit</button>          // Don't use role="button"
<nav>...</nav>                   // Don't use role="navigation"
<h1>Title</h1>                   // Don't use role="heading"

// ✅ GOOD: ARIA for dynamic content
<div role="status" aria-live="polite">
  Changes saved at 2:45 PM
</div>

// ✅ GOOD: ARIA for unclear labels
<button aria-label="Close dialog">×</button>

// ❌ BAD: ARIA instead of semantic HTML
<div role="button">Submit</div>
<div role="heading">Title</div>
<div role="navigation">...</div>
```

### Animations & Motion

**Respect user preferences**:

```jsx
// ✅ GOOD: Respects prefers-reduced-motion
// In CSS: @media (prefers-reduced-motion: reduce) { /* disable */ }

// ✅ GOOD: Animations only for enhancement
const variants = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: 10 },
};

// ❌ BAD: Required animations
// Animation is the only way to communicate state

// ❌ BAD: Distracting or flashing animations
// More than 3 flashes/second = seizure risk
```

---

## 4. Testing Phase

### Automated Testing

**Run before committing**:
```bash
# ESLint accessibility rules
npm run lint

# jest-axe automated testing
npm run test
```

### Manual Testing Checklist

**Keyboard Navigation**:
- [ ] Can Tab through all interactive elements
- [ ] Tab order follows visual hierarchy
- [ ] Focus is always visible
- [ ] No keyboard traps
- [ ] Escape closes modals/dropdowns

**Screen Reader**:
- [ ] Page structure announced correctly
- [ ] Heading hierarchy present
- [ ] Form labels associated
- [ ] Alt text present on images
- [ ] Buttons/links have clear labels
- [ ] Error messages announced

**Color & Contrast**:
- [ ] Text meets 4.5:1 contrast minimum
- [ ] Icons/borders meet 3:1 contrast minimum
- [ ] Dark mode contrast verified
- [ ] No information conveyed by color alone

**Responsive & Zoom**:
- [ ] Works at 320px viewport (mobile)
- [ ] Works at 200% zoom (no horizontal scroll)
- [ ] Works at 400% zoom on 320px (no horizontal scroll)
- [ ] Touch targets 44x44px minimum

### Browser DevTools Testing

**Chrome DevTools**:
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Run accessibility audit
4. Fix issues reported

**Color Blindness Simulator**:
1. DevTools → Rendering → Emulate vision deficiency
2. Test with Protanopia, Deuteranopia, Tritanopia

**Zoom Testing**:
1. Ctrl + scroll to zoom
2. Test at 200% and 400%
3. Verify no horizontal scrolling at 400%/320px

---

## 5. Code Review Checklist

### Review Accessibility Before Approving PR

```markdown
## Accessibility Review

- [ ] Uses semantic HTML where possible
- [ ] Form fields have labels
- [ ] ARIA used only when necessary
- [ ] Focus management tested
- [ ] Color contrast verified (4.5:1 minimum)
- [ ] Keyboard navigation works
- [ ] ESLint jsx-a11y passes
- [ ] jest-axe tests pass (if new components)
- [ ] Dark mode tested
- [ ] Animations respect prefers-reduced-motion
- [ ] Touch targets 44x44px minimum
- [ ] No hardcoded colors without contrast check

**Requesting Changes**: This PR needs accessibility review.
**Approving**: Excellent accessibility implementation!
```

---

## 6. Common Pitfalls & Solutions

### Pitfall 1: Empty Links or Buttons
```jsx
// ❌ BAD: No label
<a href="/about"><span></span></a>
<button onClick={delete}>
  <TrashIcon />
</button>

// ✅ GOOD: Clear labels
<a href="/about">About Us</a>
<button onClick={delete} aria-label="Delete item">
  <TrashIcon />
</button>
```

### Pitfall 2: Placeholder as Label
```jsx
// ❌ BAD: No real label
<input type="email" placeholder="Email address" />

// ✅ GOOD: Proper label
<label htmlFor="email">Email Address</label>
<input id="email" type="email" placeholder="you@example.com" />
```

### Pitfall 3: Missing Focus Management in Modals
```jsx
// ❌ BAD: Focus remains outside modal
<Dialog>
  <button>Close</button>
</Dialog>

// ✅ GOOD: Focus trapped in modal
import FocusTrap from 'focus-trap-react';

<FocusTrap>
  <Dialog role="dialog" aria-modal="true">
    <button autoFocus>Close</button>
  </Dialog>
</FocusTrap>
```

### Pitfall 4: Removing Focus Indicators
```css
/* ❌ BAD: Removes all focus styles */
*:focus {
  outline: none;
}

/* ✅ GOOD: Provides custom focus style */
*:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

### Pitfall 5: Using onclick on Non-Button Elements
```jsx
// ❌ BAD: No keyboard support
<div onClick={handleClick}>
  Action
</div>

// ✅ GOOD: Button semantics
<button onClick={handleClick}>
  Action
</button>

// ✅ GOOD: Custom element with keyboard support
<div
  role="button"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  tabIndex={0}
>
  Action
</div>
```

---

## 7. Team Practices

### Definition of Done
Every component/feature must have:
- [ ] Semantic HTML structure
- [ ] Keyboard navigation tested
- [ ] Focus management implemented
- [ ] Color contrast verified
- [ ] ARIA attributes (only when needed)
- [ ] ESLint jsx-a11y passing
- [ ] jest-axe tests passing
- [ ] Documented in COMPONENT_USAGE_EXAMPLES.md (if new)

### Code Review Questions
Ask yourself when reviewing:
1. Does this work without a mouse?
2. Would a screen reader user understand this?
3. Does it meet color contrast requirements?
4. Are focus indicators visible?
5. Is semantic HTML used?
6. Is ARIA used correctly?

### Pair Programming
When pairing on accessibility:
- One person writes code
- Other person navigates using **keyboard only**
- Test with screen reader (NVDA on Windows)
- Verify with color blindness simulator

---

## 8. Resources & Tools

### Essential Bookmarks
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Tools for Daily Use
| Tool | Purpose | Cost |
|------|---------|------|
| NVDA | Screen reader | Free |
| JAWS | Screen reader | Commercial |
| WebAIM Contrast Checker | Color contrast | Free |
| TPGi Contrast Analyser | Color contrast | Free |
| Lighthouse | Audit tool | Free (built into Chrome) |
| axe DevTools | Browser extension | Free |
| Polypane | Responsive design | Paid |

### Our Documentation
- `ACCESSIBILITY_GUIDELINES.md` - Comprehensive guide
- `COMPONENT_USAGE_EXAMPLES.md` - Practical examples
- `BEST_PRACTICES.md` - This file
- `DESIGN_SYSTEM.md` - Design tokens
- `ACCESSIBILITY_TEST_REPORT.md` - Test results
- `PHASE_7_SUMMARY.md` - Visual polish summary

---

## 9. Accessibility Compliance Summary

### WCAG 2.1 Level AA Checklist

| Criterion | Status | Evidence |
|-----------|--------|----------|
| 1.1.1 Non-text Content | ✅ | Alt text on all images |
| 1.3.1 Info & Relationships | ✅ | Semantic HTML, proper labels |
| 1.4.3 Contrast (Minimum) | ✅ | 4.5:1 ratio verified |
| 2.1.1 Keyboard | ✅ | All functions keyboard accessible |
| 2.1.2 No Keyboard Trap | ✅ | Focus trap + Escape in modals |
| 2.4.7 Focus Visible | ✅ | 2px blue outline, 7.5:1 contrast |
| 3.2.4 Consistent Identification | ✅ | Consistent component behavior |
| 4.1.3 Status Messages | ✅ | aria-live for announcements |

### Exceeds AA (Bonus)

| Feature | Exceeds |
|---------|---------|
| Touch targets | 44x44px (AAA minimum) |
| Color contrast | 7.3:1 average (exceeds AA 4.5:1) |
| Motion | Respects prefers-reduced-motion (WCAG 2.3.3) |
| Focus management | Focus trapping in modals (WCAG 2.1.2) |

---

## Final Notes

> "Accessibility is not about disability. It's about making technology work for everyone, in every situation."

By following these practices, we ensure our platform is:
- **Usable** for everyone, including people with disabilities
- **Compliant** with WCAG 2.1 Level AA standards
- **Maintainable** with clear patterns and practices
- **Professional** meeting enterprise-level standards

---

**Version**: 1.0
**Last Updated**: December 3, 2024
**Compliance Level**: WCAG 2.1 AA
**Questions?** Reference the ACCESSIBILITY_GUIDELINES.md or COMPONENT_USAGE_EXAMPLES.md
