import React from 'react';
import type { ReactNode } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: string;
  noShadow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, style, padding = '20px', noShadow = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding,
          boxShadow: noShadow ? 'none' : 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          ...style
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
