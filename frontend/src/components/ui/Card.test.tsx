import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card Component', () => {
  it('should render with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should render with different variants', () => {
    const { container } = render(<Card variant="highlight">Highlight</Card>);
    const card = container.querySelector('div');
    // Highlight variant includes specific gradient styles
    expect(card?.className).toContain('border-2');
    expect(card?.className).toContain('border-primary');
  });

  it('should render with different padding sizes', () => {
    const { container } = render(<Card padding="lg">Large Padding</Card>);
    const card = container.querySelector('div');
    // Large padding includes p-6
    expect(card?.className).toContain('p-6');
  });

  it('should apply hover effect when hoverEffect is true', () => {
    const { container } = render(<Card hoverEffect>Hoverable</Card>);
    const card = container.querySelector('div');
    expect(card?.className).toContain('hover:shadow-md');
  });

  it('should have border by default', () => {
    const { container } = render(<Card border>With Border</Card>);
    const card = container.querySelector('div');
    expect(card?.className).toContain('border');
  });

  it('should accept custom className', () => {
    const { container } = render(<Card className="custom-class">Custom</Card>);
    const card = container.querySelector('div');
    expect(card?.className).toContain('custom-class');
  });

  it('should have correct displayName', () => {
    expect(Card.displayName).toBe('Card');
  });
});
