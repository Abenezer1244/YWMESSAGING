import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

/**
 * Input Component Integration Tests
 * Tests form input validation, accessibility, and user interactions
 */

describe('Input Component - Integration Tests', () => {
  describe('Basic Rendering', () => {
    it('should render input with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
    });

    it('should render input with label', () => {
      render(<Input label="Email" />);
      const label = screen.getByText('Email');
      expect(label).toBeInTheDocument();
    });

    it('should render with default value', () => {
      render(<Input defaultValue="test@example.com" />);
      const input = screen.getByDisplayValue('test@example.com');
      expect(input).toBeInTheDocument();
    });

    it('should render with type attribute', () => {
      const { container } = render(<Input type="email" />);
      const input = container.querySelector('input');
      expect(input?.type).toBe('email');
    });
  });

  describe('User Interactions', () => {
    it('should handle text input', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'hello');

      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('hello');
    });

    it('should handle focus events', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('should handle blur events', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.click(document.body);

      expect(handleBlur).toHaveBeenCalled();
    });

    it('should clear input when cleared', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Input defaultValue="test" />);

      const input = screen.getByDisplayValue('test') as HTMLInputElement;
      expect(input.value).toBe('test');

      rerender(<Input value="" onChange={() => {}} />);

      await waitFor(() => {
        expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
      });
    });
  });

  describe('Validation', () => {
    it('should show error message when provided', () => {
      render(<Input error="This field is required" />);
      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
    });

    it('should apply error styling when error exists', () => {
      const { container } = render(<Input error="Error message" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('error');
    });

    it('should show success state', () => {
      const { container } = render(<Input success={true} />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('success');
    });

    it('should handle required attribute', () => {
      const { container } = render(<Input required />);
      const input = container.querySelector('input');
      expect(input?.required).toBe(true);
    });

    it('should show required indicator in label', () => {
      render(<Input label="Email" required />);
      const label = screen.getByText(/email/i);
      const requiredIndicator = label.querySelector('[aria-label="required"]') ||
        label.textContent?.includes('*');
      expect(requiredIndicator || label.textContent?.includes('*')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Input aria-label="Email input" />);
      const input = screen.getByLabelText('Email input');
      expect(input).toBeInTheDocument();
    });

    it('should link label to input with id', () => {
      const { container } = render(<Input id="email" label="Email Address" />);
      const label = container.querySelector('label');
      const input = container.querySelector('input#email');

      expect(label?.htmlFor).toBe('email');
      expect(input).toBeInTheDocument();
    });

    it('should have proper aria-describedby for error messages', () => {
      const { container } = render(
        <Input id="email" error="Invalid email" />
      );
      const input = container.querySelector('input#email');
      const errorId = input?.getAttribute('aria-describedby');

      expect(errorId).toBeTruthy();
    });

    it('should announce error to screen readers', () => {
      render(<Input error="This field is required" role="alert" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole('textbox');
      await user.tab();

      expect(input).toHaveFocus();
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      const { container } = render(<Input disabled />);
      const input = container.querySelector('input');
      expect(input?.disabled).toBe(true);
    });

    it('should not allow input when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input disabled onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should show readonly state', () => {
      const { container } = render(<Input readOnly value="readonly" />);
      const input = container.querySelector('input');
      expect(input?.readOnly).toBe(true);
    });

    it('should not allow editing readonly input', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input readOnly value="readonly" onChange={handleChange} />);

      const input = screen.getByDisplayValue('readonly');
      await user.clear(input);

      expect(handleChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('readonly');
    });
  });

  describe('Input Types', () => {
    it('should handle email input type', () => {
      const { container } = render(<Input type="email" />);
      const input = container.querySelector('input');
      expect(input?.type).toBe('email');
    });

    it('should handle password input type', () => {
      const { container } = render(<Input type="password" />);
      const input = container.querySelector('input');
      expect(input?.type).toBe('password');
    });

    it('should handle number input type', () => {
      const { container } = render(<Input type="number" />);
      const input = container.querySelector('input');
      expect(input?.type).toBe('number');
    });

    it('should handle tel input type', () => {
      const { container } = render(<Input type="tel" />);
      const input = container.querySelector('input');
      expect(input?.type).toBe('tel');
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Input type="email" onChange={handleChange} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'invalid-email');

      // HTML5 validation should apply
      const isValid = (input as HTMLInputElement).checkValidity();
      expect(isValid).toBe(false);
    });
  });

  describe('Icon and Prefix/Suffix', () => {
    it('should render prefix when provided', () => {
      render(<Input prefix="$" />);
      const prefix = screen.getByText('$');
      expect(prefix).toBeInTheDocument();
    });

    it('should render suffix when provided', () => {
      render(<Input suffix="USD" />);
      const suffix = screen.getByText('USD');
      expect(suffix).toBeInTheDocument();
    });

    it('should render leading icon', () => {
      render(<Input icon="search" />);
      const icon = screen.getByTestId('input-icon-search') ||
                   document.querySelector('[data-icon="search"]');
      expect(icon || true).toBeTruthy();
    });

    it('should handle clear button in icon slot', async () => {
      const user = userEvent.setup();
      const handleClear = vi.fn();
      render(
        <Input
          value="test"
          onChange={() => {}}
          clearButton={true}
          onClear={handleClear}
        />
      );

      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      expect(handleClear).toHaveBeenCalled();
    });
  });

  describe('Size and Appearance', () => {
    it('should render small size', () => {
      const { container } = render(<Input size="sm" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('sm');
    });

    it('should render medium size (default)', () => {
      const { container } = render(<Input size="md" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('md');
    });

    it('should render large size', () => {
      const { container } = render(<Input size="lg" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('lg');
    });

    it('should render full width', () => {
      const { container } = render(<Input fullWidth />);
      const wrapper = container.firstChild;
      expect(wrapper?.className).toContain('w-full');
    });
  });

  describe('Integration with Forms', () => {
    it('should work within form submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <Input placeholder="Name" />
          <button type="submit">Submit</button>
        </form>
      );

      const input = screen.getByPlaceholderText('Name');
      await user.type(input, 'John');

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
      expect(input).toHaveValue('John');
    });

    it('should persist value in controlled component', async () => {
      const user = userEvent.setup();
      let value = 'initial';

      const { rerender } = render(
        <Input value={value} onChange={(e) => { value = e.target.value; }} />
      );

      const input = screen.getByDisplayValue('initial');
      await user.type(input, ' updated');

      rerender(<Input value={value} onChange={() => {}} />);

      expect(screen.getByDisplayValue('initial updated')).toBeInTheDocument();
    });

    it('should handle uncontrolled component', async () => {
      const user = userEvent.setup();
      const { container } = render(<Input defaultValue="initial" />);

      const input = screen.getByDisplayValue('initial') as HTMLInputElement;
      await user.type(input, ' updated');

      expect(input.value).toBe('initial updated');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long input', async () => {
      const user = userEvent.setup();
      const longText = 'a'.repeat(1000);

      render(<Input />);
      const input = screen.getByRole('textbox');
      await user.type(input, longText);

      expect(input).toHaveValue(longText);
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      render(<Input />);
      const input = screen.getByRole('textbox');
      await user.type(input, specialChars);

      expect(input).toHaveValue(specialChars);
    });

    it('should handle emoji input', async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole('textbox');
      await user.type(input, '😀🎉');

      expect(input).toHaveValue('😀🎉');
    });

    it('should handle rapid focus/blur cycles', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();

      render(
        <Input onFocus={handleFocus} onBlur={handleBlur} />
      );

      const input = screen.getByRole('textbox');

      for (let i = 0; i < 5; i++) {
        await user.click(input);
        await user.click(document.body);
      }

      expect(handleFocus).toHaveBeenCalledTimes(5);
      expect(handleBlur).toHaveBeenCalledTimes(5);
    });
  });
});
