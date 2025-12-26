import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { designTokens } from '../../utils/designTokens';
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
export function MobileTable({ data, columns, keyField, renderActions, emptyMessage = 'No data available', className = '', }) {
    const { isMobile } = useBreakpoint();
    // Get value from item by key (supports nested keys like "user.name")
    const getValue = (item, key) => {
        if (typeof key === 'string' && key.includes('.')) {
            return key.split('.').reduce((obj, k) => obj?.[k], item);
        }
        return item[key];
    };
    // Empty state
    if (data.length === 0) {
        return (_jsx("div", { style: {
                padding: designTokens.spacing.xl,
                textAlign: 'center',
                color: designTokens.colors['muted-foreground'],
                backgroundColor: designTokens.colors['background-secondary'],
                borderRadius: designTokens.borderRadius.md,
            }, children: emptyMessage }));
    }
    // Mobile: Card layout
    if (isMobile) {
        return (_jsx("div", { className: `space-y-4 ${className}`, role: "table", "aria-label": "Data table", children: data.map((item) => (_jsxs("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: designTokens.spacing.md,
                    padding: designTokens.spacing.lg,
                    backgroundColor: designTokens.colors.background,
                    border: `${designTokens.borderWidth.base} solid ${designTokens.colors.border}`,
                    borderRadius: designTokens.borderRadius.md,
                    boxShadow: designTokens.shadow.sm,
                }, role: "row", children: [columns
                        .filter((col) => !col.hideOnMobile)
                        .map((col, idx) => (_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: designTokens.spacing.md,
                        }, role: "gridcell", children: [_jsx("label", { style: {
                                    fontWeight: designTokens.typography.fontWeight.semibold,
                                    color: designTokens.colors['foreground-secondary'],
                                    fontSize: designTokens.typography.fontSize.sm,
                                    flexShrink: 0,
                                    minWidth: '100px',
                                }, children: col.label }), _jsx("div", { style: {
                                    flex: 1,
                                    color: designTokens.colors.foreground,
                                    fontSize: designTokens.typography.fontSize.sm,
                                    wordBreak: 'break-word',
                                }, className: col.className, children: col.render
                                    ? col.render(item)
                                    : String(getValue(item, col.key) ?? '-') })] }, idx))), renderActions && (_jsx("div", { style: {
                            display: 'flex',
                            gap: designTokens.spacing.sm,
                            marginTop: designTokens.spacing.md,
                            paddingTop: designTokens.spacing.md,
                            borderTop: `${designTokens.borderWidth.base} solid ${designTokens.colors.border}`,
                            flexWrap: 'wrap',
                        }, children: renderActions(item) }))] }, String(item[keyField])))) }));
    }
    // Desktop: Standard table layout
    return (_jsx("div", { className: `overflow-x-auto rounded-${designTokens.borderRadius.md} border ${className}`, style: {
            borderColor: designTokens.colors.border,
        }, children: _jsxs("table", { style: {
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: designTokens.typography.fontSize.sm,
            }, role: "table", "aria-label": "Data table", children: [_jsx("thead", { children: _jsxs("tr", { style: {
                            backgroundColor: designTokens.colors['background-secondary'],
                            borderBottom: `${designTokens.borderWidth.base} solid ${designTokens.colors.border}`,
                        }, children: [columns.map((col, idx) => (_jsx("th", { style: {
                                    padding: designTokens.spacing.md,
                                    textAlign: 'left',
                                    fontWeight: designTokens.typography.fontWeight.semibold,
                                    color: designTokens.colors['foreground-secondary'],
                                }, role: "columnheader", children: col.label }, idx))), renderActions && (_jsx("th", { style: {
                                    padding: designTokens.spacing.md,
                                    textAlign: 'left',
                                    fontWeight: designTokens.typography.fontWeight.semibold,
                                    color: designTokens.colors['foreground-secondary'],
                                }, role: "columnheader", children: "Actions" }))] }) }), _jsx("tbody", { children: data.map((item, rowIdx) => (_jsxs("tr", { style: {
                            borderBottom: `${designTokens.borderWidth.base} solid ${designTokens.colors.border}`,
                        }, role: "row", children: [columns.map((col, colIdx) => (_jsx("td", { style: {
                                    padding: designTokens.spacing.md,
                                    color: designTokens.colors.foreground,
                                }, role: "gridcell", className: col.className, children: col.render
                                    ? col.render(item)
                                    : String(getValue(item, col.key) ?? '-') }, colIdx))), renderActions && (_jsx("td", { style: {
                                    padding: designTokens.spacing.md,
                                    color: designTokens.colors.foreground,
                                }, role: "gridcell", children: renderActions(item) }))] }, String(item[keyField])))) })] }) }));
}
//# sourceMappingURL=MobileTable.js.map