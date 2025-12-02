import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge Component', () => {
  it('should render with default props', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('should render with different variants', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    const badge = container.querySelector('div');
    expect(badge).toBeInTheDocument();
    // Outline variant includes border styles
    expect(badge?.className).toContain('border');
  });

  it('should render with different colors', () => {
    const { container } = render(<Badge color="success">Success</Badge>);
    const badge = container.querySelector('div');
    // Success color is applied through CSS classes
    expect(badge).toBeInTheDocument();
  });

  it('should render with different sizes', () => {
    const { container } = render(<Badge size="lg">Large</Badge>);
    const badge = container.querySelector('div');
    // Large size includes larger padding
    expect(badge?.className).toContain('px-4');
    expect(badge?.className).toContain('py-2');
  });

  it('should render with icon', () => {
    const { container } = render(
      <Badge icon={<span>🔔</span>}>With Icon</Badge>
    );
    expect(screen.getByText('🔔')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('should accept custom className', () => {
    const { container } = render(<Badge className="custom-class">Custom</Badge>);
    const badge = container.querySelector('div');
    expect(badge?.className).toContain('custom-class');
  });

  it('should have correct displayName', () => {
    expect(Badge.displayName).toBe('Badge');
  });
});
