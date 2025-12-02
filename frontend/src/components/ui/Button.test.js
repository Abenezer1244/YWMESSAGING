import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';
describe('Button Component', () => {
    it('should render with text content', () => {
        render(_jsx(Button, { children: "Click me" }));
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });
    it('should handle click events', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();
        render(_jsx(Button, { onClick: handleClick, children: "Click me" }));
        const button = screen.getByText('Click me');
        await user.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
    it('should render with different variants', () => {
        const { container } = render(_jsx(Button, { variant: "outline", children: "Outline" }));
        const button = container.querySelector('button');
        // Outline variant includes border styles
        expect(button?.className).toContain('border');
    });
    it('should render with different sizes', () => {
        const { container } = render(_jsx(Button, { size: "lg", children: "Large" }));
        const button = container.querySelector('button');
        // Large size includes larger padding and text
        expect(button?.className).toContain('px-6');
    });
    it('should be disabled when disabled prop is true', () => {
        const { container } = render(_jsx(Button, { disabled: true, children: "Disabled" }));
        const button = container.querySelector('button');
        expect(button.disabled).toBe(true);
    });
    it('should be disabled when isLoading is true', () => {
        const { container } = render(_jsx(Button, { isLoading: true, children: "Loading" }));
        const button = container.querySelector('button');
        expect(button.disabled).toBe(true);
    });
    it('should render with full width', () => {
        const { container } = render(_jsx(Button, { fullWidth: true, children: "Full Width" }));
        const button = container.querySelector('button');
        expect(button?.className).toContain('w-full');
    });
    it('should have correct displayName', () => {
        expect(Button.displayName).toBe('Button');
    });
});
//# sourceMappingURL=Button.test.js.map