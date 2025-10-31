# Professional Design System - Connect YW

**Inspired by:** Spacefor Agency Template
**Version:** 2.0 (Professional Edition)
**Status:** In Development
**Color Palette:** Modern Professional

---

## Design Philosophy

**Modern. Clean. Professional.**

- Minimalist aesthetic with purposeful whitespace
- Strong visual hierarchy
- Professional typography scale
- Consistent spacing system
- Accessible and responsive
- Modern micro-interactions

---

## Color Palette

### Primary Colors

```css
/* Modern Professional Palette */
--color-primary-50: #f0f4ff
--color-primary-100: #e0e9ff
--color-primary-200: #c7d9ff
--color-primary-300: #a8baff
--color-primary-400: #8c9bff
--color-primary-500: #6b7dff    /* Main Primary Blue */
--color-primary-600: #5566ff
--color-primary-700: #4450e6
--color-primary-800: #3840cc
--color-primary-900: #2d33b3

/* Dark Blue for text & headers */
--color-dark-blue: #0f1419
--color-dark-blue-secondary: #1a1f2e
```

### Neutral Colors (Professional Gray Scale)

```css
/* Clean, professional grays */
--color-neutral-50: #f9fafb
--color-neutral-100: #f3f4f6
--color-neutral-200: #e5e7eb
--color-neutral-300: #d1d5db
--color-neutral-400: #9ca3af
--color-neutral-500: #6b7280
--color-neutral-600: #4b5563
--color-neutral-700: #374151
--color-neutral-800: #1f2937
--color-neutral-900: #111827

/* Pure white & black */
--color-white: #ffffff
--color-black: #000000
```

### Semantic Colors

```css
/* Success - Green */
--color-success-50: #f0fdf4
--color-success-500: #22c55e
--color-success-600: #16a34a
--color-success-700: #15803d

/* Warning - Amber */
--color-warning-50: #fffbeb
--color-warning-500: #f59e0b
--color-warning-600: #d97706

/* Danger - Red */
--color-danger-50: #fef2f2
--color-danger-500: #ef4444
--color-danger-600: #dc2626

/* Info - Light Blue */
--color-info-50: #f0f9ff
--color-info-500: #0ea5e9
--color-info-600: #0284c7
```

### Gradient Accents

```css
/* Modern Gradient */
--gradient-primary: linear-gradient(135deg, #6b7dff 0%, #4450e6 100%)

/* Dark Gradient (for dark backgrounds) */
--gradient-dark: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%)

/* Light Gradient (for cards) */
--gradient-light: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)
```

---

## Typography System

### Font Family

```css
/* Modern Sans-Serif Stack */
--font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif

/* Monospace (for code/data) */
--font-family-mono: 'Fira Code', 'Courier New', monospace
```

### Font Sizes (Modular Scale 1.125)

```css
/* Headings */
--text-h1: 56px (3.5rem)    /* Page titles */
--text-h2: 48px (3rem)      /* Section titles */
--text-h3: 36px (2.25rem)   /* Subsection titles */
--text-h4: 28px (1.75rem)   /* Card titles */
--text-h5: 24px (1.5rem)    /* Small headings */
--text-h6: 20px (1.25rem)   /* Label headings */

/* Body Text */
--text-lg: 18px (1.125rem)  /* Large body */
--text-base: 16px (1rem)    /* Default body */
--text-sm: 14px (0.875rem)  /* Small text */
--text-xs: 12px (0.75rem)   /* Tiny text */

/* Display */
--text-display: 72px (4.5rem) /* Hero headlines */
```

### Line Heights

```css
--line-height-tight: 1.2      /* Headings */
--line-height-normal: 1.5     /* Body text */
--line-height-relaxed: 1.75   /* Long-form content */
--line-height-loose: 2        /* Accessibility */
```

### Font Weights

```css
--font-weight-light: 300
--font-weight-regular: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
--font-weight-extrabold: 800
```

---

## Spacing System (8px base)

```css
/* Consistent spacing scale */
--space-0: 0
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
--space-28: 112px
--space-32: 128px
```

---

## Border & Radius

```css
/* Border Radius */
--radius-none: 0
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-2xl: 24px
--radius-3xl: 32px
--radius-full: 9999px

/* Border Width */
--border-thin: 1px
--border-normal: 2px
--border-thick: 3px
```

---

## Shadows (Elevation System)

```css
/* Subtle shadows for depth */
--shadow-none: none

--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)

--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -1px rgba(0, 0, 0, 0.06)

--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -2px rgba(0, 0, 0, 0.05)

--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 10px 10px -5px rgba(0, 0, 0, 0.04)

--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)

/* Inset shadow (for form focus) */
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)
```

---

## Breakpoints (Mobile First)

```css
--breakpoint-xs: 320px   /* Extra small phones */
--breakpoint-sm: 640px   /* Small phones */
--breakpoint-md: 768px   /* Tablets */
--breakpoint-lg: 1024px  /* Laptops */
--breakpoint-xl: 1280px  /* Desktops */
--breakpoint-2xl: 1536px /* Large desktops */
```

---

## Component Specifications

### Buttons

#### Primary Button
```
Background: --color-primary-500
Text: white
Padding: 12px 24px (--space-3 --space-6)
Border Radius: --radius-lg
Font Weight: --font-weight-semibold
Font Size: --text-base
Transition: all 200ms ease-in-out

States:
- Default: --color-primary-500
- Hover: --color-primary-600 (shadow-md)
- Active: --color-primary-700
- Disabled: --color-neutral-300 (opacity 50%)
- Focus: outline 2px offset 2px --color-primary-500
```

#### Secondary Button
```
Background: --color-neutral-100
Text: --color-neutral-900
Border: 1px --color-neutral-300
Padding: 12px 24px
Border Radius: --radius-lg
Font Weight: --font-weight-semibold

States:
- Hover: --color-neutral-200
- Active: --color-neutral-300
```

#### Button Sizes
```
Small:   8px 16px, --text-sm
Medium:  12px 24px, --text-base (default)
Large:   16px 32px, --text-lg
```

### Cards

```
Background: --color-white
Border: 1px --color-neutral-200
Border Radius: --radius-xl
Padding: --space-6
Shadow: --shadow-md
Transition: all 200ms ease-in-out

States:
- Hover: shadow-lg, transform translateY(-2px)
- Focus: outline 2px --color-primary-500
```

### Input Fields

```
Background: --color-white
Border: 1px --color-neutral-300
Border Radius: --radius-lg
Padding: --space-3 --space-4
Font Size: --text-base
Line Height: --line-height-normal

States:
- Focus: border-color --color-primary-500, shadow-inner
- Error: border-color --color-danger-500
- Disabled: background --color-neutral-100, opacity 50%
- Success: border-color --color-success-500

Label:
- Font Size: --text-sm
- Font Weight: --font-weight-semibold
- Color: --color-neutral-700
- Margin Bottom: --space-2
```

### Navigation

```
Height: 64px (4rem)
Background: --color-white
Border Bottom: 1px --color-neutral-200
Shadow: --shadow-sm
Padding: 0 --space-6

Logo:
- Font Size: --text-h6
- Font Weight: --font-weight-bold
- Color: --color-primary-500

Links:
- Font Size: --text-base
- Font Weight: --font-weight-medium
- Color: --color-neutral-600
- Hover: --color-primary-500
- Active: --color-primary-500, border-bottom 3px
```

---

## Layout Specifications

### Container Widths
```css
--container-sm: 640px
--container-md: 768px
--container-lg: 1024px
--container-xl: 1280px
--container-full: 100%

Max Width: 1280px (for most content)
Padding (mobile): --space-4
Padding (desktop): --space-6
```

### Grid System
```css
/* 12-column grid */
Column Gap: --space-4 (16px)
Row Gap: --space-4 (16px)

Common Layouts:
- 1 Column: Full width
- 2 Columns: 50/50
- 3 Columns: 33.33%/33.33%/33.33%
- 4 Columns: 25%/25%/25%/25%
```

### Section Spacing
```css
Padding Top: --space-20 (80px) desktop, --space-12 (48px) mobile
Padding Bottom: --space-20 (80px) desktop, --space-12 (48px) mobile
Margin Between Sections: --space-0
```

---

## Animations & Transitions

```css
/* Easing functions */
--ease-linear: linear
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)

/* Duration */
--duration-fast: 150ms
--duration-normal: 300ms
--duration-slow: 500ms

/* Common transitions */
--transition-fast: all 150ms --ease-in-out
--transition-normal: all 300ms --ease-in-out
--transition-slow: all 500ms --ease-in-out
```

---

## Dark Mode

### Dark Mode Colors

```css
Body Background: --color-neutral-950 (#030712)
Card Background: --color-neutral-900 (#111827)
Text Primary: --color-white
Text Secondary: --color-neutral-300
Border: --color-neutral-800

Accent Colors: Same as light mode (primary, success, danger, etc.)
```

---

## Accessibility

### WCAG 2.1 Compliance

- **Contrast Ratios:**
  - Large text: 3:1 minimum
  - Normal text: 4.5:1 minimum
  - UI components: 3:1 minimum

- **Focus Indicators:**
  - Outline: 2px solid --color-primary-500
  - Offset: 2px
  - Visible on all interactive elements

- **Font Sizes:**
  - Minimum: 12px (--text-xs)
  - Recommended minimum: 16px for body text
  - Scalable up to 200%

- **Line Height:**
  - Minimum: 1.5 for body text
  - Better readability with 1.75-2.0

---

## Icon System

```
Size: 24px (default)
Color: Inherit from context
Weight: 2px stroke weight
Style: Minimal, professional, consistent
Family: Feather Icons or similar

Sizes:
- Icon XS: 16px (--text-sm)
- Icon SM: 20px
- Icon MD: 24px (default)
- Icon LG: 32px
- Icon XL: 48px
```

---

## Image Guidelines

```
Quality: High-resolution (2x for retina)
Format: WebP with PNG fallback
Aspect Ratios:
  - Hero: 16:9
  - Card: 4:3
  - Avatar: 1:1
  - Thumbnail: 1:1

Optimization:
- Compress with TinyPNG/ImageOptim
- Serve responsive images (srcset)
- Lazy load below fold
```

---

## Mobile Design Principles

1. **Touch-Friendly:**
   - Minimum touch target: 44x44px
   - Spacing between targets: 8px

2. **Readability:**
   - Font size: minimum 16px
   - Line height: 1.6+

3. **Performance:**
   - Fast interactions (< 100ms)
   - Optimized images
   - Minimal dependencies

4. **Responsive:**
   - Mobile-first approach
   - Flexible layouts
   - Proportional scaling

---

## Design Tokens Implementation

These values should be implemented as:
- **CSS Variables** (for styling)
- **SCSS/LESS Variables** (for preprocessing)
- **Design System Constants** (in components)
- **Figma Design System** (for design collaboration)

---

## Design Checklist

Before launching redesigned pages:

- [ ] Colors match palette
- [ ] Typography follows system
- [ ] Spacing consistent (8px grid)
- [ ] Buttons meet specifications
- [ ] Forms accessible and usable
- [ ] Images optimized
- [ ] Responsive on all breakpoints
- [ ] Dark mode tested
- [ ] Accessibility tested
- [ ] Performance optimized
- [ ] Micro-interactions smooth
- [ ] Navigation clear and consistent

---

**Status:** Ready for implementation
**Last Updated:** 2024-10-30
**Version:** 2.0 (Professional Edition)
