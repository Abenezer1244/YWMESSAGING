# Accessibility Guidelines for Developers

**Version**: 1.0
**Status**: Complete
**Compliance Level**: WCAG 2.1 Level AA
**Last Updated**: December 3, 2024

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Principles](#core-principles)
3. [Semantic HTML](#semantic-html)
4. [ARIA Attributes](#aria-attributes)
5. [Keyboard Navigation](#keyboard-navigation)
6. [Color & Contrast](#color--contrast)
7. [Focus Management](#focus-management)
8. [Forms & Inputs](#forms--inputs)
9. [Images & Alt Text](#images--alt-text)
10. [Testing & Validation](#testing--validation)
11. [Common Mistakes](#common-mistakes)
12. [Tools & Resources](#tools--resources)

---

## Quick Start

### Accessibility Checklist (for every component)

- [ ] Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<h1>-<h6>`, etc.)
- [ ] Add proper `aria-label` or `aria-labelledby` for screen readers
- [ ] Ensure keyboard navigation works (Tab, Enter, Space, Escape)
- [ ] Maintain focus indicators (2px blue outline, WCAG AA compliant)
- [ ] Check color contrast (4.5:1 minimum for text, WCAG AA)
- [ ] Test with dark mode enabled
- [ ] Verify with `prefers-reduced-motion` setting enabled
- [ ] Use accessible component library (AccessibleButton, AccessibleInput, etc.)
- [ ] Run ESLint jsx-a11y rules: `npm run lint`
- [ ] Run jest-axe tests: `npm run test`

---

## Core Principles

### The 4 Pillars of Web Accessibility (WCAG 2.1)

#### 1. **Perceivable**
Users must be able to perceive the information being presented.

- Provide text alternatives for images (alt text)
- Offer captions for audio/video content
- Ensure sufficient color contrast (4.5:1 minimum)
- Don't rely solely on color to convey information

#### 2. **Operable**
Users must be able to operate all interactive elements.

- All functionality available via keyboard
- No keyboard traps (users can Tab away from elements)
- Touch targets minimum 44x44px (WCAG AAA standard)
- Animations respect `prefers-reduced-motion` preference

#### 3. **Understandable**
Users must understand the content and how to use the interface.

- Use clear language (avoid jargon)
- Proper heading hierarchy (h1 → h2 → h3)
- Form labels clearly associated with inputs
- Error messages explain what went wrong and how to fix it

#### 4. **Robust**
Content must be compatible with assistive technologies.

- Valid semantic HTML
- Proper ARIA attributes (only when needed)
- No reliance on JavaScript for core functionality
- Works with screen readers (NVDA, JAWS, VoiceOver)

---

## Semantic HTML

### Why It Matters
Semantic HTML provides meaning to assistive technologies like screen readers. Always prefer semantic tags over `<div>` soup.

### Semantic Tags Reference

| Tag | Purpose | ARIA Alternative |
|-----|---------|-----------------|
| `<button>` | Clickable action | `role="button"` on div |
| `<nav>` | Navigation section | `role="navigation"` |
| `<main>` | Main content area | `role="main"` |
| `<header>` | Introductory content | N/A |
| `<footer>` | Footer content | `role="contentinfo"` |
| `<article>` | Self-contained content | N/A |
| `<section>` | Thematic grouping | N/A |
| `<h1>-<h6>` | Headings (h1 should be only once per page) | `role="heading"` aria-level="1" |
| `<label>` | Form label (must associate with input) | N/A |
| `<input>` | Form input | N/A |
| `<textarea>` | Multi-line text input | N/A |
| `<select>` | Dropdown/combobox | `role="combobox"` |
| `<ul>`, `<ol>`, `<li>` | Lists | `role="list"` |
| `<a>` | Links (with href) | `role="link"` |

### Example: Semantic Structure

```jsx
// ✅ GOOD: Semantic HTML
<main>
  <header>
    <nav>
      <ul>
        <li><a href="/home">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>

  <section>
    <h1>Page Title</h1>
    <article>
      <h2>Article Title</h2>
      <p>Content here...</p>
    </article>
  </section>

  <footer>
    <p>&copy; 2024 Koinonia</p>
  </footer>
</main>

// ❌ BAD: Non-semantic divs
<div class="main">
  <div class="header">
    <div class="nav">
      <div class="list">
        <div class="item"><div>Home</div></div>
        <div class="item"><div>About</div></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="h1">Page Title</div>
    <div class="article">
      <div class="h2">Article Title</div>
      <p>Content here...</p>
    </div>
  </div>
</div>
```

---

## ARIA Attributes

### When to Use ARIA
> Only use ARIA when semantic HTML won't work. ARIA is a **band-aid**, not a solution.

### Common ARIA Attributes

#### `aria-label`
Provides a text label for an element when no visible label exists.

```jsx
// Good: Icon button with aria-label
<button aria-label="Close dialog">×</button>

// Good: Menu toggle
<button aria-label="Toggle navigation menu">☰</button>

// Bad: Redundant on form field (use <label> instead)
<input aria-label="Email" /> // Don't do this!
```

#### `aria-labelledby`
Links an element to another element that labels it.

```jsx
<h2 id="dialog-title">Confirm Action</h2>
<dialog aria-labelledby="dialog-title">
  <p>Are you sure?</p>
  <button>Yes</button>
  <button>No</button>
</dialog>
```

#### `aria-describedby`
Links an element to another element that describes it (often for error messages).

```jsx
<input
  id="email"
  type="email"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">
  Please enter a valid email address
</span>
```

#### `aria-invalid`
Indicates that form input has an error.

```jsx
<input
  id="password"
  type="password"
  aria-invalid={hasError}
  aria-describedby={hasError ? "password-error" : undefined}
/>
{hasError && <span id="password-error">Password too short</span>}
```

#### `aria-live`
Announces dynamic content changes to screen readers.

```jsx
// Assertive: Announce immediately (errors, alerts)
<div aria-live="assertive">
  Error: Please fill in all required fields
</div>

// Polite: Announce when appropriate (status updates)
<div aria-live="polite">
  Draft saved at 2:45 PM
</div>
```

#### `aria-hidden`
Hides decorative elements from screen readers.

```jsx
// Decorative icon/divider
<span aria-hidden="true">•</span>

// Decorative spacer
<div aria-hidden="true" className="spacer" />
```

#### `role`
Defines the role of an element (when semantic HTML isn't available).

```jsx
// Good: Using semantic button (no role needed)
<button>Submit</button>

// Acceptable: Custom element with role
<div role="button" onClick={handleClick} onKeyPress={handleKey}>
  Click me
</div>

// Bad: Using role instead of semantic HTML
<div role="button">Submit</div> // Should be <button>
```

---

## Keyboard Navigation

### Essential Keyboard Patterns

#### Tab Navigation
- **Tab**: Focus next element
- **Shift+Tab**: Focus previous element
- **Must work on all interactive elements**

#### Button & Link Interaction
- **Enter**: Activate button/link
- **Space**: Activate button (not link)

#### Form Navigation
- **Tab**: Move to next field
- **Escape**: Cancel/close dialog or form

#### Dropdown/Menu
- **Enter/Space**: Open menu
- **Arrow Up/Down**: Navigate items
- **Escape**: Close menu
- **Tab**: Close menu and move focus

#### Modal Dialog
- **Escape**: Close dialog (always!)
- **Tab**: Cycle through focusable elements within dialog
- **Focus trap**: Cannot Tab outside dialog

### Testing Keyboard Navigation

```bash
# Test with Tab key only (no mouse):
1. Click address bar
2. Tab through page
3. Verify focus visible on all interactive elements
4. Verify logical Tab order (left-to-right, top-to-bottom)
5. Verify no keyboard traps (can Tab away from all elements)
```

### Implementation Example

```jsx
// ✅ GOOD: Keyboard accessible button
<button
  onClick={handleClick}
  onKeyPress={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Submit
</button>

// ✅ GOOD: Dialog with focus trapping
import FocusTrap from 'focus-trap-react';

<FocusTrap>
  <dialog
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    onKeyDown={(e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    }}
  >
    <h2 id="dialog-title">Confirm</h2>
    <button>Cancel</button>
    <button>Confirm</button>
  </dialog>
</FocusTrap>

// ❌ BAD: Non-semantic element without keyboard support
<div onClick={handleClick}>
  Submit
</div>
```

---

## Color & Contrast

### WCAG AA Requirements

| Text Type | Minimum Ratio |
|-----------|--------------|
| Normal text | 4.5:1 |
| Large text (18pt+ or 14pt bold+) | 3:1 |
| Non-text elements (borders, icons) | 3:1 |

### Checking Contrast

**Tools**:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [TPGi Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

**Color System**:
Our design tokens use oklch color space with verified contrast ratios.

```javascript
// frontend/src/utils/designTokens.ts
export const colors = {
  primary: {
    light: 'oklch(0.6716 0.1368 48.5130)', // 7.3:1 on white
    dark: 'oklch(0.7214 0.1337 49.9802)',   // 6.8:1 on dark
  },
  // All colors pre-verified for WCAG AA
};
```

### Design Decisions

- ✅ No information conveyed by color alone
- ✅ Icons have sufficient contrast with background
- ✅ Links distinguishable without relying on color
- ✅ Form validation shown with both color AND text/icons

---

## Focus Management

### Focus Styles
All interactive elements must have visible focus indicators.

**Current implementation** (frontend/src/index.css):
```css
*:focus-visible {
  outline: 2px solid #2563eb;      /* Blue #2563eb */
  outline-offset: 2px;
  border-radius: 4px;
}

.dark *:focus-visible {
  outline: 2px solid #60a5fa;      /* Light blue for dark mode */
}

@media (prefers-contrast: high) {
  *:focus-visible {
    outline-width: 3px;            /* Thicker for high contrast mode */
    outline-offset: 3px;
  }
}
```

### Focus Order
Tab order should follow visual hierarchy (left-to-right, top-to-bottom).

```jsx
// ✅ GOOD: Natural tab order (follows DOM order)
<form>
  <label>Name <input type="text" /></label>
  <label>Email <input type="email" /></label>
  <button type="submit">Submit</button>
</form>

// ❌ BAD: Hidden tabindex values that break natural order
<input tabIndex={10} />
<input tabIndex={5} />
<input tabIndex={1} /> // Confusing order!
```

### Managing Focus Programmatically

```jsx
// Setting focus after action
function Dialog() {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    // Move focus to close button after dialog opens
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div role="dialog">
      <button ref={closeButtonRef} onClick={onClose}>
        Close
      </button>
    </div>
  );
}
```

---

## Forms & Inputs

### Label Association
Every form input must have an associated label.

```jsx
// ✅ GOOD: Explicit association
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ GOOD: Implicit association
<label>
  Email
  <input type="email" />
</label>

// ❌ BAD: No label association
<span>Email</span>
<input type="email" />

// ❌ BAD: Label not associated
<label>Email (not connected)</label>
<input id="user-email" type="email" />
```

### Autocomplete Attributes
Help users with cognitive disabilities and password managers.

```jsx
// ✅ GOOD: Proper autocomplete values
<input
  type="text"
  autoComplete="given-name"
  placeholder="First name"
/>
<input
  type="email"
  autoComplete="email"
  placeholder="Email address"
/>
<input
  type="password"
  autoComplete="new-password"
  placeholder="New password"
/>

// Accepted values:
// name, given-name, family-name, email, tel,
// username, password, current-password, new-password,
// organization, street-address, address-line1, address-line2,
// postal-code, cc-number, cc-exp-month, cc-exp-year, etc.
```

### Error Messages
Communicate validation errors clearly.

```jsx
// ✅ GOOD: Associated error message
<input
  id="password"
  type="password"
  aria-invalid={errors.password ? "true" : "false"}
  aria-describedby={errors.password ? "password-error" : undefined}
/>
{errors.password && (
  <span id="password-error" role="alert">
    Password must be at least 8 characters
  </span>
)}

// ❌ BAD: Error message not associated
<input type="password" />
<span>Password must be at least 8 characters</span>
```

---

## Images & Alt Text

### Alt Text Guidelines

| Image Type | Alt Text |
|-----------|----------|
| Informative photo | Describe the content (e.g., "A pastor speaking from the pulpit") |
| Icon (with nearby text) | Empty alt="" (text already describes it) |
| Icon (standalone) | Describe purpose (e.g., "Save document", "Delete this item") |
| Decorative image | Empty alt="" |
| Graph/chart | Describe data (or link to data table) |
| Logo/brand | Brand name if it serves as link; decorative if standalone |

### Implementation

```jsx
// ✅ GOOD: Informative photo with description
<img
  src="/church-service.jpg"
  alt="Members of Grace Community Church gathered for Sunday service"
/>

// ✅ GOOD: Icon with nearby text (empty alt)
<button>
  <img src="/check-icon.svg" alt="" />
  Save Changes
</button>

// ✅ GOOD: Icon without text (meaningful alt)
<button title="Delete message" aria-label="Delete message">
  <img src="/trash-icon.svg" alt="Delete" />
</button>

// ✅ GOOD: Chart with data table alternative
<figure>
  <figcaption>Message Delivery by Day</figcaption>
  <img src="/chart.svg" alt="Graph showing message delivery rates by day of week. See table below for details." />
  <table>
    <tr><td>Monday</td><td>92%</td></tr>
    <tr><td>Tuesday</td><td>95%</td></tr>
    {/* ... */}
  </table>
</figure>

// ❌ BAD: Generic or missing alt text
<img src="/photo.jpg" alt="photo" />
<img src="/icon.svg" /> {/* No alt attribute */}
```

---

## Testing & Validation

### Automated Testing

#### ESLint jsx-a11y
```bash
npm run lint

# Checks:
# - anchor-is-valid: Links have href and valid targets
# - alt-text: Images have alt attributes
# - aria-props: ARIA attributes are valid
# - aria-role: Roles are valid
# - heading-has-content: Headings contain text
# - label-has-associated-control: Form labels associated with inputs
# - role-has-required-aria-props: Roles have required ARIA
```

#### jest-axe Testing
```bash
npm run test

# Example test:
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('LoginForm should not have accessibility violations', async () => {
  const { container } = render(<LoginForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing

#### Keyboard Navigation
- [ ] Use only Tab/Shift+Tab to navigate
- [ ] Verify focus visible on all interactive elements
- [ ] Verify no keyboard traps
- [ ] Test with Escape to close dialogs

#### Screen Reader Testing (NVDA - Windows Free)
- [ ] Download NVDA from [nvaccess.org](https://www.nvaccess.org/)
- [ ] Start NVDA (Ctrl+Alt+N)
- [ ] Use arrow keys to read all content
- [ ] Use Tab to navigate interactive elements
- [ ] Verify proper heading hierarchy announced
- [ ] Verify form labels announced with inputs
- [ ] Verify button labels announced

#### Dark Mode Testing
- [ ] Enable dark mode in browser DevTools
- [ ] Verify text contrast meets 4.5:1 minimum
- [ ] Verify no text becomes unreadable
- [ ] Verify images not washed out

#### Color Blindness Simulation
- [ ] Use browser DevTools color blindness simulator
- [ ] Test with Protanopia (red-green)
- [ ] Test with Deuteranopia (red-green)
- [ ] Verify information conveyed without color alone

#### Zoom Testing
- [ ] Browser zoom to 200% (Ctrl + +)
- [ ] Verify no horizontal scrolling introduced
- [ ] Verify text remains readable
- [ ] Verify layout doesn't break

---

## Common Mistakes

### ❌ Mistake 1: Using `<div>` Instead of `<button>`
```jsx
// Bad
<div onClick={handleDelete} className="cursor-pointer">
  Delete
</div>

// Good
<button onClick={handleDelete}>Delete</button>
```
**Why**: Divs don't have keyboard support or screen reader semantics.

### ❌ Mistake 2: Missing `<label>` Elements
```jsx
// Bad
<input type="email" placeholder="Email address" />

// Good
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />
```
**Why**: Screen readers can't associate placeholder with input.

### ❌ Mistake 3: Removing Focus Outline
```jsx
// Bad
*:focus {
  outline: none;
}

// Good
*:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```
**Why**: Focus outline is essential for keyboard users.

### ❌ Mistake 4: Using `role` Instead of Semantic HTML
```jsx
// Bad
<div role="button" onClick={handle}>Click me</div>

// Good
<button onClick={handle}>Click me</button>
```
**Why**: Semantic HTML is more reliable and requires less code.

### ❌ Mistake 5: Images Without Alt Text
```jsx
// Bad
<img src="/logo.png" />

// Good
<img src="/logo.png" alt="Koinonia SMS Platform" />
```
**Why**: Alt text essential for screen readers and broken images.

### ❌ Mistake 6: Relying on Color Alone
```jsx
// Bad
<span style={{ color: 'red' }}>Error</span>

// Good
<span role="alert">❌ Error: Please fill in all fields</span>
```
**Why**: Color-blind users can't perceive color-only information.

### ❌ Mistake 7: No Keyboard Support for Custom Interactions
```jsx
// Bad
<div onClick={openMenu} className="custom-button">
  Menu
</div>

// Good
<button onClick={openMenu} onKeyDown={handleKeyDown}>
  Menu
</button>
```
**Why**: Keyboard users can't activate custom elements.

---

## Tools & Resources

### Testing Tools
- **NVDA**: Free screen reader for Windows
- **JAWS**: Commercial screen reader
- **VoiceOver**: Built into macOS
- **WebAIM Contrast Checker**: Color contrast validation
- **TPGi Colour Contrast Analyser**: Desktop contrast tool
- **Lighthouse**: Chrome DevTools accessibility audit
- **jest-axe**: Automated accessibility testing

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)

### Our Resources
- **Design System**: `/frontend/DESIGN_SYSTEM.md`
- **Accessible Components**: `/frontend/src/components/accessible/`
- **Design Tokens**: `/frontend/src/utils/designTokens.ts`
- **Accessibility Test Report**: `/ACCESSIBILITY_TEST_REPORT.md`
- **Phase 7 Summary**: `/PHASE_7_SUMMARY.md`

---

## Summary

| Area | Standard | Status |
|------|----------|--------|
| Semantic HTML | WCAG 1.3.1 | ✅ Enforced |
| ARIA Usage | WCAG 1.3.1 | ✅ Enforced |
| Keyboard Navigation | WCAG 2.1.1 | ✅ Tested |
| Focus Visible | WCAG 2.4.7 | ✅ Implemented |
| Color Contrast | WCAG 1.4.3 | ✅ Verified |
| Form Labels | WCAG 1.3.1 | ✅ Enforced |
| Alt Text | WCAG 1.1.1 | ✅ Enforced |
| Motion/Animation | WCAG 2.3.3 | ✅ Respected |

---

**Last Updated**: December 3, 2024
**Compliance**: WCAG 2.1 Level AA
**Questions?** Reach out to the accessibility team or check the resources above.
