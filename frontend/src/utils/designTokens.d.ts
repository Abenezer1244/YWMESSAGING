/**
 * Design System Tokens
 * Centralized typography, spacing, border radius, and other design values
 * Used throughout the application for consistent styling
 */
export declare const designTokens: {
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
//# sourceMappingURL=designTokens.d.ts.map