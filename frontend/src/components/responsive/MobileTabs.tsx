import React, { ReactNode } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { designTokens } from '../../utils/designTokens';

/**
 * Tab definition for MobileTabs
 */
export interface Tab {
  label: string;
  value: string;
  icon?: ReactNode;
  disabled?: boolean;
}

/**
 * Props for MobileTabs component
 */
export interface MobileTabsProps {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'auto' | 'scroll' | 'dropdown';
  className?: string;
}

/**
 * MobileTabs Component
 *
 * Responsive tab navigation that adapts to viewport size.
 * - Mobile (< 768px): Dropdown select (best for 4+ tabs)
 * - Tablet (768px - 1024px): Horizontal scroll (overflow handling)
 * - Desktop (≥ 1024px): Horizontal buttons (no scroll)
 *
 * Features:
 * - Automatic breakpoint detection
 * - Touch-friendly on mobile
 * - Keyboard accessible (dropdown/buttons)
 * - Support for icons with labels
 * - Configurable variant for manual override
 *
 * @example
 * ```typescript
 * const tabs: Tab[] = [
 *   { label: 'General', value: 'general', icon: <Settings /> },
 *   { label: 'Account', value: 'account', icon: <User /> },
 *   { label: 'Notifications', value: 'notifications', icon: <Bell /> },
 * ];
 *
 * const [activeTab, setActiveTab] = useState('general');
 *
 * <MobileTabs
 *   tabs={tabs}
 *   value={activeTab}
 *   onChange={setActiveTab}
 *   variant="auto"
 * />
 * ```
 */
export function MobileTabs({
  tabs,
  value,
  onChange,
  variant = 'auto',
  className = '',
}: MobileTabsProps): JSX.Element {
  const { isMobile, isTablet } = useBreakpoint();

  // Determine which variant to use
  let renderedVariant = variant;
  if (variant === 'auto') {
    if (isMobile) {
      renderedVariant = 'dropdown';
    } else if (isTablet) {
      renderedVariant = 'scroll';
    } else {
      renderedVariant = 'scroll';
    }
  }

  const selectedTab = tabs.find((t) => t.value === value);

  // Mobile: Dropdown select
  if (renderedVariant === 'dropdown') {
    return (
      <div className={className}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
            backgroundColor: designTokens.colors.input,
            border: `${designTokens.borderWidth.base} solid ${designTokens.colors.border}`,
            borderRadius: designTokens.borderRadius.md,
            fontSize: designTokens.typography.fontSize.base,
            fontWeight: designTokens.typography.fontWeight.medium,
            color: designTokens.colors.foreground,
            cursor: 'pointer',
            minHeight: designTokens.touchTarget.enhanced,
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${encodeURIComponent(designTokens.colors.foreground)}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            paddingRight: `${designTokens.spacing.xl}`,
          }}
        >
          {tabs.map((tab) => (
            <option key={tab.value} value={tab.value} disabled={tab.disabled}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Desktop/Tablet: Horizontal scroll or button layout
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        gap: designTokens.spacing.md,
        overflowX: renderedVariant === 'scroll' ? 'auto' : 'visible',
        overflowY: 'hidden',
        paddingBottom: designTokens.spacing.sm,
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => !tab.disabled && onChange(tab.value)}
          disabled={tab.disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing.sm,
            padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
            backgroundColor:
              value === tab.value
                ? designTokens.colors.primary
                : designTokens.colors['background-secondary'],
            color:
              value === tab.value
                ? designTokens.colors.background
                : designTokens.colors.foreground,
            border: `${designTokens.borderWidth.base} solid ${
              value === tab.value
                ? designTokens.colors.primary
                : designTokens.colors.border
            }`,
            borderRadius: designTokens.borderRadius.md,
            fontSize: designTokens.typography.fontSize.sm,
            fontWeight: designTokens.typography.fontWeight.medium,
            cursor: tab.disabled ? 'not-allowed' : 'pointer',
            minHeight: designTokens.touchTarget.enhanced,
            minWidth: 'max-content',
            whiteSpace: 'nowrap',
            opacity: tab.disabled ? 0.5 : 1,
            transition: `all ${designTokens.transition.fast} ease`,
            boxShadow:
              value === tab.value ? designTokens.shadow.sm : designTokens.shadow.none,
          }}
          aria-selected={value === tab.value}
          role="tab"
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
