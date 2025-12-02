import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';
describe('Input Component', () => {
    it('should render with placeholder', () => {
        render(_jsx(Input, { placeholder: "Enter text" }));
        const input = screen.getByPlaceholderText('Enter text');
        expect(input).toBeInTheDocument();
    });
    it('should render with label', () => {
        render(_jsx(Input, { label: "Username" }));
        expect(screen.getByText('Username')).toBeInTheDocument();
    });
    it('should show required asterisk when required', () => {
        render(_jsx(Input, { label: "Email", required: true }));
        const asterisk = screen.getByText('*');
        expect(asterisk).toBeInTheDocument();
        expect(asterisk?.className).toContain('text-destructive');
    });
    it('should display error message', () => {
        render(_jsx(Input, { error: "This field is required" }));
        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
    it('should display helper text when no error', () => {
        render(_jsx(Input, { helperText: "This is a hint" }));
        expect(screen.getByText('This is a hint')).toBeInTheDocument();
    });
    it('should handle user input', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        const { container } = render(_jsx(Input, { onChange: handleChange }));
        const input = container.querySelector('input');
        await user.type(input, 'hello');
        expect(handleChange).toHaveBeenCalled();
    });
    it('should show character count when enabled', () => {
        const { container } = render(_jsx(Input, { showCharCount: true, maxLength: 10, value: "test", onChange: () => { } }));
        expect(screen.getByText('4 / 10')).toBeInTheDocument();
    });
    it('should be disabled when disabled prop is true', () => {
        const { container } = render(_jsx(Input, { disabled: true }));
        const input = container.querySelector('input');
        expect(input.disabled).toBe(true);
    });
    it('should toggle password visibility', async () => {
        const user = userEvent.setup();
        const { container } = render(_jsx(Input, { isPassword: true }));
        const input = container.querySelector('input');
        expect(input.type).toBe('password');
        const toggleButton = container.querySelector('button');
        if (toggleButton) {
            await user.click(toggleButton);
            expect(input.type).toBe('text');
        }
    });
    it('should have correct displayName', () => {
        expect(Input.displayName).toBe('Input');
    });
});
//# sourceMappingURL=Input.test.js.map