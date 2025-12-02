import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';
describe('Badge Component', () => {
    it('should render with default props', () => {
        render(_jsx(Badge, { children: "Test Badge" }));
        expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });
    it('should render with different variants', () => {
        const { container } = render(_jsx(Badge, { variant: "outline", children: "Outline" }));
        const badge = container.querySelector('div');
        expect(badge).toBeInTheDocument();
        // Outline variant includes border styles
        expect(badge?.className).toContain('border');
    });
    it('should render with different colors', () => {
        const { container } = render(_jsx(Badge, { color: "success", children: "Success" }));
        const badge = container.querySelector('div');
        // Success color is applied through CSS classes
        expect(badge).toBeInTheDocument();
    });
    it('should render with different sizes', () => {
        const { container } = render(_jsx(Badge, { size: "lg", children: "Large" }));
        const badge = container.querySelector('div');
        // Large size includes larger padding
        expect(badge?.className).toContain('px-4');
        expect(badge?.className).toContain('py-2');
    });
    it('should render with icon', () => {
        const { container } = render(_jsx(Badge, { icon: _jsx("span", { children: "\uD83D\uDD14" }), children: "With Icon" }));
        expect(screen.getByText('🔔')).toBeInTheDocument();
        expect(screen.getByText('With Icon')).toBeInTheDocument();
    });
    it('should accept custom className', () => {
        const { container } = render(_jsx(Badge, { className: "custom-class", children: "Custom" }));
        const badge = container.querySelector('div');
        expect(badge?.className).toContain('custom-class');
    });
    it('should have correct displayName', () => {
        expect(Badge.displayName).toBe('Badge');
    });
});
//# sourceMappingURL=Badge.test.js.map