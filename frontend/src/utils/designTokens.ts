/**
 * Design System Tokens
 * Centralized typography, spacing, border radius, and other design values
 * Used throughout the application for consistent styling
 */

export const designTokens = {
  // Typography - Font Sizes
  typography: {
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '42px',
      '6xl': '48px',
      '7xl': '56px',
    },
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      mono: "'Monaco', 'Courier New', 'Courier', monospace",
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.05em',
    },
  },

  // Spacing/Sizing (following 8px grid system)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
    '5xl': '80px',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '4px',
    base: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // Border Width
  borderWidth: {
    none: '0',
    thin: '1px',
    base: '1px',
    thick: '2px',
  },

  // Shadows
  shadow: {
    none: 'none',
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    base: '0 4px 6px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px rgba(0, 0, 0, 0.1)',
  },

  // Z-Index layers
  zIndex: {
    hide: -1,
    base: 1,
    dropdown: 100,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },

  // Transition/Animation timing
  transition: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
};

// Predefined style combinations for common use cases
export const stylePresets = {
  // Card shadows
  cardShadow: designTokens.shadow.md,

  // Hover elevation
  hoverElevation: designTokens.shadow.lg,

  // Modal backdrop
  backdropBlur: 'blur(4px)',

  // Focus ring (accessible)
  focusRing: `2px solid rgba(59, 130, 246, 0.5)`,

  // Truncate text
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // Line clamp (3 lines)
  lineClamp: {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
};
