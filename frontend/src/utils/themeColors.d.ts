/**
 * Semantic Theme Colors
 * All color values derived from the design system tokens
 * Used for dynamic styles, animations, and theme-based properties
 */
export declare const themeColors: {
    primary: {
        base: string;
        light: string;
        dark: string;
        op10: string;
        op20: string;
        op30: string;
        op40: string;
        op50: string;
        op60: string;
        op80: string;
    };
    background: {
        base: string;
        light: string;
        lighter: string;
        op80: string;
    };
    muted: {
        base: string;
        light: string;
        op50: string;
        op80: string;
    };
    accent: {
        base: string;
        light: string;
        op50: string;
    };
    border: {
        base: string;
        light: string;
        dark: string;
    };
    shadow: {
        primary: string;
        primaryBright: string;
        neutral: string;
        dark: string;
    };
};
export declare const getShadow: (color: string, size?: string, intensity?: number) => string;
//# sourceMappingURL=themeColors.d.ts.map