import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from './Card';
describe('Card Component', () => {
    it('should render with children', () => {
        render(_jsx(Card, { children: "Card content" }));
        expect(screen.getByText('Card content')).toBeInTheDocument();
    });
    it('should render with different variants', () => {
        const { container } = render(_jsx(Card, { variant: "highlight", children: "Highlight" }));
        const card = container.querySelector('div');
        // Highlight variant includes specific gradient styles
        expect(card?.className).toContain('border-2');
        expect(card?.className).toContain('border-primary');
    });
    it('should render with different padding sizes', () => {
        const { container } = render(_jsx(Card, { padding: "lg", children: "Large Padding" }));
        const card = container.querySelector('div');
        // Large padding includes p-6
        expect(card?.className).toContain('p-6');
    });
    it('should apply hover effect when hoverEffect is true', () => {
        const { container } = render(_jsx(Card, { hoverEffect: true, children: "Hoverable" }));
        const card = container.querySelector('div');
        expect(card?.className).toContain('hover:shadow-md');
    });
    it('should have border by default', () => {
        const { container } = render(_jsx(Card, { border: true, children: "With Border" }));
        const card = container.querySelector('div');
        expect(card?.className).toContain('border');
    });
    it('should accept custom className', () => {
        const { container } = render(_jsx(Card, { className: "custom-class", children: "Custom" }));
        const card = container.querySelector('div');
        expect(card?.className).toContain('custom-class');
    });
    it('should have correct displayName', () => {
        expect(Card.displayName).toBe('Card');
    });
});
//# sourceMappingURL=Card.test.js.map