import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import BackButton from './BackButton';
// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});
const renderWithRouter = (component) => {
    return render(_jsx(BrowserRouter, { children: component }));
};
describe('BackButton Component', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });
    it('should render back button with default text', () => {
        renderWithRouter(_jsx(BackButton, {}));
        expect(screen.getByText('Back')).toBeInTheDocument();
    });
    it('should navigate back (-1) when clicked without "to" prop', async () => {
        const user = userEvent.setup();
        renderWithRouter(_jsx(BackButton, {}));
        const button = screen.getByText('Back').closest('button');
        await user.click(button);
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
    it('should navigate to specific path when "to" prop is provided', async () => {
        const user = userEvent.setup();
        renderWithRouter(_jsx(BackButton, { to: "/dashboard" }));
        const button = screen.getByText('Back').closest('button');
        await user.click(button);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
    it('should have correct variant passed to Button', () => {
        const { container } = renderWithRouter(_jsx(BackButton, { variant: "outline" }));
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
    });
    it('should accept and apply custom className', () => {
        const { container } = renderWithRouter(_jsx(BackButton, { className: "custom-class" }));
        const button = container.querySelector('button');
        expect(button?.className).toContain('custom-class');
    });
    it('should render SVG icon', () => {
        const { container } = renderWithRouter(_jsx(BackButton, {}));
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });
    it('should have correct displayName', () => {
        expect(BackButton.displayName).toBe('BackButton');
    });
});
//# sourceMappingURL=BackButton.test.js.map