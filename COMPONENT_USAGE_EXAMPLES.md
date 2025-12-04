# Component Usage Examples

**Version**: 1.0
**Status**: Complete
**Framework**: React + TypeScript
**Last Updated**: December 3, 2024

---

## Table of Contents

1. [Accessible Button](#accessible-button)
2. [Accessible Input](#accessible-input)
3. [Accessible Checkbox](#accessible-checkbox)
4. [Standard Button](#standard-button)
5. [Form Patterns](#form-patterns)
6. [Focus Management](#focus-management)
7. [Error Handling](#error-handling)

---

## Accessible Button

### Location
`frontend/src/components/accessible/AccessibleButton.tsx`

### Usage

```jsx
import { AccessibleButton } from '@/components/accessible';

export function Example() {
  return (
    <>
      {/* Primary button */}
      <AccessibleButton
        label="Save Changes"
        onClick={handleSave}
        variant="primary"
        size="md"
      />

      {/* Secondary button with icon */}
      <AccessibleButton
        label="Download Report"
        icon={<DownloadIcon />}
        iconPosition="left"
        variant="secondary"
      />

      {/* Loading state */}
      <AccessibleButton
        label="Sending..."
        isLoading={isSending}
        disabled={isSending}
        onClick={handleSend}
      />

      {/* Danger button */}
      <AccessibleButton
        label="Delete Account"
        variant="danger"
        onClick={handleDelete}
        aria-label="Permanently delete your account"
      />
    </>
  );
}
```

### Props

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `label` | string | required | Button text (visible) |
| `variant` | 'primary' \| 'secondary' \| 'danger' \| 'ghost' | 'primary' | Visual style |
| `size` | 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Button size |
| `icon` | ReactNode | undefined | Icon to display |
| `iconPosition` | 'left' \| 'right' | 'left' | Icon placement |
| `isLoading` | boolean | false | Show loading spinner |
| `disabled` | boolean | false | Disable interaction |
| `fullWidth` | boolean | false | Stretch to container width |
| `ariaLabel` | string | undefined | Extra ARIA label if needed |

### Accessibility Features

✅ **Touch targets**: 44x44px minimum (WCAG AAA)
✅ **Keyboard support**: Enter + Space keys work
✅ **Screen reader**: Announces label and loading state
✅ **Focus visible**: Blue outline with proper contrast
✅ **Color contrast**: WCAG AA compliant (4.5:1+)
✅ **Animations**: Respect prefers-reduced-motion

---

## Accessible Input

### Location
`frontend/src/components/accessible/AccessibleInput.tsx`

### Usage

```jsx
import { AccessibleInput } from '@/components/accessible';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  return (
    <form onSubmit={handleSubmit}>
      {/* Simple email input */}
      <AccessibleInput
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        placeholder="you@example.com"
        required
      />

      {/* Input with error */}
      <AccessibleInput
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        errorMessage="Password must be at least 8 characters"
        autoComplete="current-password"
      />

      {/* Input with helper text */}
      <AccessibleInput
        label="Phone Number"
        type="tel"
        helperText="Format: (123) 456-7890"
        autoComplete="tel"
        pattern="^\(\d{3}\) \d{3}-\d{4}$"
      />

      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Props

| Prop | Type | Purpose |
|------|------|---------|
| `label` | string | Required label text |
| `type` | string | Input type (email, password, tel, etc.) |
| `value` | string | Current value |
| `onChange` | function | Change handler |
| `error` | string | Error message (shows error state) |
| `helperText` | string | Helper/hint text below input |
| `required` | boolean | Required field marker |
| `disabled` | boolean | Disable interaction |
| `autoComplete` | string | Autocomplete hint (email, password, etc.) |
| `placeholder` | string | Placeholder text |
| `pattern` | string | HTML5 validation pattern |

### Accessibility Features

✅ **Label association**: htmlFor connects label to input
✅ **Error messages**: Associated with aria-describedby
✅ **Touch targets**: 44px minimum height
✅ **Helper text**: Announced with aria-describedby
✅ **Keyboard**: Tab, focus, standard input behavior
✅ **Screen reader**: All information announced

---

## Accessible Checkbox

### Location
`frontend/src/components/accessible/AccessibleCheckbox.tsx`

### Usage

```jsx
import { AccessibleCheckbox } from '@/components/accessible';

export function TermsForm() {
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agree) {
      setError('You must agree to continue');
      return;
    }
    // Submit form
  };

  return (
    <form onSubmit={handleSubmit}>
      <AccessibleCheckbox
        label="I agree to the Terms & Conditions"
        checked={agree}
        onChange={(e) => setAgree(e.target.checked)}
        isRequired
        error={error}
      />

      <AccessibleCheckbox
        label="Send me weekly updates"
        defaultChecked={false}
        helperText="Unsubscribe anytime from emails"
      />

      <button type="submit">Continue</button>
    </form>
  );
}
```

### Props

| Prop | Type | Purpose |
|------|------|---------|
| `label` | string | Required checkbox label |
| `checked` | boolean | Checked state |
| `onChange` | function | Change handler |
| `isRequired` | boolean | Show required indicator |
| `error` | string | Error message |
| `helperText` | string | Helper text |
| `disabled` | boolean | Disable interaction |

### Accessibility Features

✅ **Touch targets**: 44x44px minimum (includes padding)
✅ **Label association**: Full label clickable area
✅ **Error indication**: aria-invalid + error message
✅ **Screen reader**: Label and state announced
✅ **Keyboard**: Space bar to toggle

---

## Standard Button

### Location
`frontend/src/components/ui/Button.tsx`

### Usage

```jsx
import Button from '@/components/ui/Button';

export function Dashboard() {
  return (
    <>
      {/* Primary action */}
      <Button variant="primary" size="md">
        Send Message
      </Button>

      {/* Secondary action */}
      <Button variant="secondary">Cancel</Button>

      {/* Outline button */}
      <Button variant="outline">Learn More</Button>

      {/* Ghost (minimal) button */}
      <Button variant="ghost">Skip</Button>

      {/* Danger button */}
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>

      {/* Full width button */}
      <Button variant="primary" fullWidth>
        Submit Form
      </Button>
    </>
  );
}
```

### Props

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `variant` | 'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger' | 'primary' | Button style |
| `size` | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Button size |
| `onClick` | function | undefined | Click handler |
| `disabled` | boolean | false | Disable button |
| `fullWidth` | boolean | false | Full container width |
| `children` | ReactNode | undefined | Button content |

### Micro-interactions

- **Hover**: Button scales up 5% (hover:scale-105)
- **Active**: Button scales down 5% (active:scale-95)
- **Transition**: Smooth 200ms duration
- **Respects**: prefers-reduced-motion setting

---

## Form Patterns

### Complete Login Form

```jsx
import { AccessibleInput } from '@/components/accessible';
import Button from '@/components/ui/Button';
import { useState } from 'react';

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      // Submit login
      await loginAPI(formData);
    } catch (error) {
      setErrors({
        form: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign In</h1>

      {/* General form error */}
      {errors.form && (
        <div role="alert" className="text-error mb-4">
          {errors.form}
        </div>
      )}

      {/* Email field */}
      <AccessibleInput
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) =>
          setFormData({ ...formData, email: e.target.value })
        }
        error={errors.email}
        autoComplete="email"
        required
      />

      {/* Password field */}
      <AccessibleInput
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) =>
          setFormData({ ...formData, password: e.target.value })
        }
        error={errors.password}
        autoComplete="current-password"
        required
      />

      {/* Submit button */}
      <Button
        variant="primary"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>

      <a href="/forgot-password">Forgot password?</a>
    </form>
  );
}
```

### Form with Multiple Fields

```jsx
import { AccessibleInput } from '@/components/accessible';
import { AccessibleCheckbox } from '@/components/accessible';

export function RegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    churchName: '',
    agreeToTerms: false,
  });

  return (
    <form>
      <fieldset>
        <legend>Personal Information</legend>

        <AccessibleInput
          label="First Name"
          type="text"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          autoComplete="given-name"
          required
        />

        <AccessibleInput
          label="Last Name"
          type="text"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          autoComplete="family-name"
          required
        />
      </fieldset>

      <fieldset>
        <legend>Church Information</legend>

        <AccessibleInput
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          autoComplete="email"
          required
        />

        <AccessibleInput
          label="Church Name"
          type="text"
          value={formData.churchName}
          onChange={(e) =>
            setFormData({ ...formData, churchName: e.target.value })
          }
          autoComplete="organization"
          required
        />
      </fieldset>

      <fieldset>
        <legend>Agreement</legend>

        <AccessibleCheckbox
          label="I agree to the Terms & Conditions"
          checked={formData.agreeToTerms}
          onChange={(e) =>
            setFormData({ ...formData, agreeToTerms: e.target.checked })
          }
          isRequired
        />
      </fieldset>

      <Button variant="primary" fullWidth type="submit">
        Create Account
      </Button>
    </form>
  );
}
```

---

## Focus Management

### Modal Dialog with Focus Trapping

```jsx
import FocusTrap from 'focus-trap-react';
import { useRef, useEffect } from 'react';

export function ConfirmDialog({ isOpen, onClose, onConfirm }) {
  const titleRef = useRef(null);

  useEffect(() => {
    // Move focus to title when dialog opens
    if (isOpen) {
      titleRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <FocusTrap>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="modal"
        onKeyDown={(e) => {
          // Close on Escape
          if (e.key === 'Escape') {
            onClose();
          }
        }}
      >
        <h2 id="dialog-title" ref={titleRef} tabIndex={-1}>
          Confirm Action
        </h2>

        <p>Are you sure you want to continue?</p>

        <div className="modal-buttons">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </FocusTrap>
  );
}
```

---

## Error Handling

### Form with Validation

```jsx
export function MessageForm() {
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!message.trim()) {
      newErrors.message = 'Message cannot be empty';
    } else if (message.length < 5) {
      newErrors.message = 'Message must be at least 5 characters';
    } else if (message.length > 1600) {
      newErrors.message = 'Message must be less than 1600 characters';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Submit form
      console.log('Form valid, submitting...');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <AccessibleInput
        label="Message"
        type="textarea"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        error={submitted ? errors.message : undefined}
        helperText={`${message.length}/1600 characters`}
        placeholder="Type your message here..."
        required
      />

      <Button type="submit" variant="primary">
        Send Message
      </Button>
    </form>
  );
}
```

### Error Alert Pattern

```jsx
export function AlertMessage({ type, message, onClose }) {
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`alert alert-${type}`}
    >
      {type === 'error' && <span aria-label="Error">❌</span>}
      {type === 'success' && <span aria-label="Success">✅</span>}
      {type === 'info' && <span aria-label="Information">ℹ️</span>}

      <span>{message}</span>

      {onClose && (
        <button
          aria-label={`Close ${type} message`}
          onClick={onClose}
          className="alert-close"
        >
          ×
        </button>
      )}
    </div>
  );
}
```

---

## Best Practices Summary

### DO ✅

- Use semantic HTML first (button, input, label)
- Use accessible components from the library
- Associate labels with form inputs
- Provide clear error messages
- Test keyboard navigation
- Respect user motion preferences
- Include focus management for modals
- Use proper ARIA attributes when needed

### DON'T ❌

- Replace semantics with ARIA unless necessary
- Create custom buttons without keyboard support
- Hide focus indicators
- Rely on color alone for information
- Forget to test with screen readers
- Ignore dark mode contrast
- Use placeholder as label
- Forget aria-label on icon buttons

---

**Version**: 1.0
**Last Updated**: December 3, 2024
**Framework**: React + TypeScript
**Compliance**: WCAG 2.1 Level AA
