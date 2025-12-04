/**
 * Design System Tokens
 * Centralized typography, spacing, border radius, and other design values
 * Used throughout the application for consistent styling
 *
 * References:
 * - WCAG 2.1 Level AA Compliance
 * - Accessible color contrast ratios: 4.5:1 for text, 3:1 for non-text
 * - Touch target sizes: 44x44px minimum (WCAG 2.5.5)
 * - Mobile-first responsive design
 */
export declare const designTokens: {
    colors: {
        primary: string;
        success: string;
        error: string;
        warning: string;
        info: string;
        foreground: string;
        'foreground-secondary': string;
        'muted-foreground': string;
        border: string;
        background: string;
        'background-secondary': string;
        card: string;
        input: string;
        muted: string;
        accent: string;
    };
    typography: {
        fontSize: {
            xs: string;
            sm: string;
            base: string;
            lg: string;
            xl: string;
            '2xl': string;
            '3xl': string;
            '4xl': string;
            '5xl': string;
            '6xl': string;
            '7xl': string;
        };
        fontFamily: {
            sans: string;
            mono: string;
        };
        fontWeight: {
            light: number;
            normal: number;
            medium: number;
            semibold: number;
            bold: number;
            extrabold: number;
        };
        lineHeight: {
            tight: number;
            normal: number;
            relaxed: number;
            loose: number;
        };
        letterSpacing: {
            tight: string;
            normal: string;
            wide: string;
        };
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
        '5xl': string;
    };
    borderRadius: {
        none: string;
        sm: string;
        base: string;
        md: string;
        lg: string;
        xl: string;
        full: string;
    };
    borderWidth: {
        none: string;
        thin: string;
        base: string;
        thick: string;
    };
    shadow: {
        none: string;
        xs: string;
        sm: string;
        base: string;
        md: string;
        lg: string;
        xl: string;
    };
    zIndex: {
        hide: number;
        base: number;
        dropdown: number;
        sticky: number;
        fixed: number;
        modal: number;
        popover: number;
        tooltip: number;
    };
    transition: {
        fast: string;
        normal: string;
        slow: string;
    };
    easing: {
        linear: string;
        ease: string;
        easeIn: string;
        easeOut: string;
        easeInOut: string;
    };
    typographyScale: {
        h1: {
            fontSize: string;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
        };
        h2: {
            fontSize: string;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
        };
        h3: {
            fontSize: string;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
        };
        body: {
            fontSize: string;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
        };
        small: {
            fontSize: string;
            fontWeight: number;
            lineHeight: number;
            letterSpacing: string;
        };
    };
    touchTarget: {
        minimum: string;
        enhanced: string;
        large: string;
    };
    breakpoints: {
        mobile: string;
        tablet: string;
        desktop: string;
        wide: string;
        ultraWide: string;
    };
};
export declare const stylePresets: {
    cardShadow: string;
    hoverElevation: string;
    backdropBlur: string;
    focusRing: string;
    truncate: {
        overflow: string;
        textOverflow: string;
        whiteSpace: string;
    };
    lineClamp: {
        display: string;
        WebkitLineClamp: number;
        WebkitBoxOrient: string;
        overflow: string;
    };
};
export type ColorToken = typeof designTokens.colors;
export type SpacingToken = typeof designTokens.spacing;
export type TypographyToken = typeof designTokens.typography;
export type BorderRadiusToken = typeof designTokens.borderRadius;
export type ShadowToken = typeof designTokens.shadow;
export type ZIndexToken = typeof designTokens.zIndex;
export type TransitionToken = typeof designTokens.transition;
export type EasingToken = typeof designTokens.easing;
export type TypographyScaleToken = typeof designTokens.typographyScale;
export type TouchTargetToken = typeof designTokens.touchTarget;
export type BreakpointToken = typeof designTokens.breakpoints;
//# sourceMappingURL=designTokens.d.ts.map