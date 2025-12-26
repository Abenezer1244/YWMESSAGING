import { ReactNode } from 'react';
/**
 * Column definition for MobileTable
 */
export interface Column<T> {
    label: string;
    key: keyof T | string;
    render?: (item: T) => ReactNode;
    hideOnMobile?: boolean;
    className?: string;
}
/**
 * Props for MobileTable component
 */
export interface MobileTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField: keyof T;
    renderActions?: (item: T) => ReactNode;
    emptyMessage?: string;
    className?: string;
}
/**
 * MobileTable Component
 *
 * Transforms data tables into mobile-friendly card layouts automatically.
 * - Desktop (≥ 768px): Standard HTML table with overflow-x-auto
 * - Mobile (< 768px): Card layout with label/value pairs
 *
 * Features:
 * - Responsive design that adapts to viewport
 * - Custom render functions for complex columns
 * - Optional actions renderer for buttons
 * - Accessible (proper HTML semantics)
 * - Touch-friendly on mobile
 *
 * @example
 * ```typescript
 * const columns: Column<Member>[] = [
 *   { label: 'Name', key: 'firstName', render: (m) => `${m.firstName} ${m.lastName}` },
 *   { label: 'Phone', key: 'phone' },
 *   { label: 'Email', key: 'email' }
 * ];
 *
 * <MobileTable
 *   data={members}
 *   columns={columns}
 *   keyField="id"
 *   renderActions={(m) => <button onClick={() => delete(m.id)}>Delete</button>}
 * />
 * ```
 */
export declare function MobileTable<T extends Record<string, any>>({ data, columns, keyField, renderActions, emptyMessage, className, }: MobileTableProps<T>): JSX.Element;
//# sourceMappingURL=MobileTable.d.ts.map