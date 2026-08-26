import React from 'react';
import type { ReactNode } from 'react';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, className, style, ...props }, ref) => {
    return (
      <div style={{
        width: '100%',
        overflowX: 'auto',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <table
          ref={ref}
          className={`product-table ${className || ''}`}
          style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', ...style }}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);
Table.displayName = 'Table';
