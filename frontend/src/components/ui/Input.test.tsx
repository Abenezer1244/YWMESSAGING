import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input Component', () => {
  it('should render with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('should render with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('should show required asterisk when required', () => {
    render(<Input label="Email" required />);
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk?.className).toContain('text-destructive');
  });

  it('should display error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should display helper text when no error', () => {
    render(<Input helperText="This is a hint" />);
    expect(screen.getByText('This is a hint')).toBeInTheDocument();
  });

  it('should handle user input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { container } = render(<Input onChange={handleChange} />);

    const input = container.querySelector('input');
    await user.type(input!, 'hello');
    expect(handleChange).toHaveBeenCalled();
  });

  it('should show character count when enabled', () => {
    const { container } = render(
      <Input showCharCount maxLength={10} value="test" onChange={() => {}} />
    );
    expect(screen.getByText('4 / 10')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<Input disabled />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    const { container } = render(<Input isPassword />);

    const input = container.querySelector('input') as HTMLInputElement;
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
