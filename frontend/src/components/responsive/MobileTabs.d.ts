import { ReactNode } from 'react';
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
export declare function MobileTabs({ tabs, value, onChange, variant, className, }: MobileTabsProps): JSX.Element;
//# sourceMappingURL=MobileTabs.d.ts.map