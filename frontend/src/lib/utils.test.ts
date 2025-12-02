import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should merge simple class names', () => {
    const result = cn('px-4', 'py-2');
    expect(result).toBe('px-4 py-2');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'active', false && 'inactive');
    expect(result).toContain('base');
    expect(result).toContain('active');
    expect(result).not.toContain('inactive');
  });

  it('should resolve Tailwind conflicts correctly', () => {
    // When there are conflicting Tailwind classes, twMerge should keep the last one
    const result = cn('px-2', 'px-4');
    expect(result).toContain('px-4');
    expect(result).not.toContain('px-2');
  });

  it('should handle array inputs', () => {
    const result = cn(['px-4', 'py-2']);
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
  });

  it('should handle object inputs (conditional classes)', () => {
    const result = cn({
      'text-red-600': true,
      'text-blue-600': false,
      'font-bold': true,
    });
    expect(result).toContain('text-red-600');
    expect(result).toContain('font-bold');
    expect(result).not.toContain('text-blue-600');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'extra');
    expect(result).toBe('base extra');
  });

  it('should handle empty strings', () => {
    const result = cn('', 'base', '');
    expect(result).toBe('base');
  });
});
