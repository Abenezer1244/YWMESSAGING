import React, { ReactNode } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { designTokens } from '../../utils/designTokens';

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
export function MobileTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  renderActions,
  emptyMessage = 'No data available',
  className = '',
}: MobileTableProps<T>): JSX.Element {
  const { isMobile } = useBreakpoint();

  // Get value from item by key (supports nested keys like "user.name")
  const getValue = (item: T, key: string | keyof T): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], item);
    }
    return item[key as keyof T];
  };

  // Empty state
  if (data.length === 0) {
    return (
      <div
        style={{
          padding: designTokens.spacing.xl,
          textAlign: 'center',
          color: designTokens.colors['muted-foreground'],
          backgroundColor: designTokens.colors['background-secondary'],
          borderRadius: designTokens.borderRadius.md,
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  // Mobile: Card layout
  if (isMobile) {
    return (
      <div
        className={`space-y-4 ${className}`}
        role="table"
        aria-label="Data table"
      >
        {data.map((item) => (
          <div
            key={String(item[keyField])}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: designTokens.spacing.md,
              padding: designTokens.spacing.lg,
              backgroundColor: designTokens.colors.background,
              border: `${designTokens.borderWidth.base} solid ${designTokens.colors.border}`,
              borderRadius: designTokens.borderRadius.md,
              boxShadow: designTokens.shadow.sm,
            }}
            role="row"
          >
            {columns
              .filter((col) => !col.hideOnMobile)
              .map((col, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: designTokens.spacing.md,
                  }}
                  role="gridcell"
                >
                  <label
                    style={{
                      fontWeight: designTokens.typography.fontWeight.semibold,
                      color: designTokens.colors['foreground-secondary'],
                      fontSize: designTokens.typography.fontSize.sm,
                      flexShrink: 0,
                      minWidth: '100px',
                    }}
                  >
                    {col.label}
                  </label>
                  <div
                    style={{
                      flex: 1,
                      color: designTokens.colors.foreground,
                      fontSize: designTokens.typography.fontSize.sm,
                      wordBreak: 'break-word',
                    }}
                    className={col.className}
                  >
                    {col.render
                      ? col.render(item)
                      : String(getValue(item, col.key) ?? '-')}
                  </div>
                </div>
              ))}

            {renderActions && (
              <div
                style={{
                  display: 'flex',
                  gap: designTokens.spacing.sm,
                  marginTop: designTokens.spacing.md,
                  paddingTop: designTokens.spacing.md,
                  borderTop: `${designTokens.borderWidth.base} solid ${designTokens.colors.border}`,
                  flexWrap: 'wrap',
                }}
              >
                {renderActions(item)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: Standard table layout
  return (
    <div
      className={`overflow-x-auto rounded-${designTokens.borderRadius.md} border ${className}`}
      style={{
        borderColor: designTokens.colors.border,
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: designTokens.typography.fontSize.sm,
        }}
        role="table"
        aria-label="Data table"
      >
        <thead>
          <tr
            style={{
              backgroundColor: designTokens.colors['background-secondary'],
              borderBottom: `${designTokens.borderWidth.base} solid ${designTokens.colors.border}`,
            }}
          >
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  padding: designTokens.spacing.md,
                  textAlign: 'left',
                  fontWeight: designTokens.typography.fontWeight.semibold,
                  color: designTokens.colors['foreground-secondary'],
                }}
                role="columnheader"
              >
                {col.label}
              </th>
            ))}
            {renderActions && (
              <th
                style={{
                  padding: designTokens.spacing.md,
                  textAlign: 'left',
                  fontWeight: designTokens.typography.fontWeight.semibold,
                  color: designTokens.colors['foreground-secondary'],
                }}
                role="columnheader"
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIdx) => (
            <tr
              key={String(item[keyField])}
              style={{
                borderBottom: `${designTokens.borderWidth.base} solid ${designTokens.colors.border}`,
              }}
              role="row"
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  style={{
                    padding: designTokens.spacing.md,
                    color: designTokens.colors.foreground,
                  }}
                  role="gridcell"
                  className={col.className}
                >
                  {col.render
                    ? col.render(item)
                    : String(getValue(item, col.key) ?? '-')}
                </td>
              ))}
              {renderActions && (
                <td
                  style={{
                    padding: designTokens.spacing.md,
                    color: designTokens.colors.foreground,
                  }}
                  role="gridcell"
                >
                  {renderActions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
