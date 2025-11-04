/**
 * Semantic Theme Colors
 * All color values derived from the design system tokens
 * Used for dynamic styles, animations, and theme-based properties
 */

export const themeColors = {
  // Primary colors (blue)
  primary: {
    base: 'rgb(59, 130, 246)', // Primary blue
    light: 'rgb(96, 165, 250)',
    dark: 'rgb(37, 99, 235)',
    // With opacity variants
    op10: 'rgba(59, 130, 246, 0.1)',
    op20: 'rgba(59, 130, 246, 0.2)',
    op30: 'rgba(59, 130, 246, 0.3)',
    op40: 'rgba(59, 130, 246, 0.4)',
    op50: 'rgba(59, 130, 246, 0.5)',
    op60: 'rgba(59, 130, 246, 0.6)',
    op80: 'rgba(59, 130, 246, 0.8)',
  },

  // Background and neutral colors
  background: {
    base: 'rgb(15, 23, 42)',
    light: 'rgb(30, 41, 59)',
    lighter: 'rgb(51, 65, 85)',
    darkDim: 'rgb(31, 41, 55)', // #1f2937 converted to RGB
    // With opacity
    op80: 'rgba(15, 23, 42, 0.8)',
  },

  // Muted/secondary colors
  muted: {
    base: 'rgb(55, 65, 81)',
    light: 'rgb(75, 85, 99)',
    // With opacity
    op50: 'rgba(55, 65, 81, 0.5)',
    op80: 'rgba(55, 65, 81, 0.8)',
  },

  // Accent colors (yellow/amber)
  accent: {
    base: 'rgb(234, 179, 8)',
    light: 'rgb(250, 204, 21)',
    // With opacity
    op50: 'rgba(234, 179, 8, 0.5)',
  },

  // Success/Green colors
  success: {
    base: 'rgb(16, 185, 129)', // #10b981
    dark: 'rgb(5, 150, 105)',
  },

  // Danger/Red colors
  danger: {
    base: 'rgb(239, 68, 68)', // #ef4444
    light: 'rgb(248, 113, 113)',
  },

  // Border/divider colors
  border: {
    base: 'rgb(100, 116, 139)',
    light: 'rgb(148, 163, 184)',
    dark: 'rgba(0, 0, 0, 0.1)',
    darkDim: 'rgb(55, 65, 81)', // #374151 converted to RGB
  },

  // Text colors
  text: {
    white: 'rgb(255, 255, 255)', // #ffffff
    lightGray: 'rgb(148, 163, 184)', // #94a3b8
  },

  // Semantic shadows
  shadow: {
    primary: 'rgba(59, 130, 246, 0.3)',
    primaryBright: 'rgba(96, 165, 250, 0.5)',
    neutral: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.2)',
  },
};

// Helper function to get shadow with color
export const getShadow = (color: string, size: string = '10px', intensity: number = 0.3): string => {
  return `0 0 ${size} ${color}`;
};
