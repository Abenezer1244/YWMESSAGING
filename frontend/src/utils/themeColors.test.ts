import { describe, it, expect } from 'vitest';
import { themeColors } from './themeColors';

describe('themeColors utility', () => {
  it('should export themeColors object', () => {
    expect(themeColors).toBeDefined();
    expect(typeof themeColors).toBe('object');
  });

  it('should have all required color categories', () => {
    expect(themeColors.primary).toBeDefined();
    expect(themeColors.background).toBeDefined();
    expect(themeColors.muted).toBeDefined();
    expect(themeColors.accent).toBeDefined();
    expect(themeColors.success).toBeDefined();
    expect(themeColors.danger).toBeDefined();
    expect(themeColors.border).toBeDefined();
    expect(themeColors.text).toBeDefined();
    expect(themeColors.shadow).toBeDefined();
  });

  it('should have valid RGB color values for primary colors', () => {
    expect(themeColors.primary.base).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    expect(themeColors.primary.light).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    expect(themeColors.primary.dark).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
  });

  it('should have opacity variants with correct format', () => {
    expect(themeColors.primary.op10).toMatch(/^rgba\(\d+, \d+, \d+, 0\.1\)$/);
    expect(themeColors.primary.op20).toMatch(/^rgba\(\d+, \d+, \d+, 0\.2\)$/);
    expect(themeColors.primary.op50).toMatch(/^rgba\(\d+, \d+, \d+, 0\.5\)$/);
    expect(themeColors.primary.op80).toMatch(/^rgba\(\d+, \d+, \d+, 0\.8\)$/);
  });

  it('should have consistent color structure across categories', () => {
    // Each category should have a 'base' color
    expect(themeColors.primary.base).toBeDefined();
    expect(themeColors.success.base).toBeDefined();
    expect(themeColors.danger.base).toBeDefined();
    expect(themeColors.accent.base).toBeDefined();
  });

  it('should have valid text colors', () => {
    expect(themeColors.text.white).toBeDefined();
    expect(themeColors.text.lightGray).toBeDefined();
  });

  it('should have valid border colors', () => {
    expect(themeColors.border.dark).toBeDefined();
    expect(themeColors.border.light).toBeDefined();
  });
});
