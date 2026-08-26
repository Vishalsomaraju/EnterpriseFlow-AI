import React from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'ai';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'info', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx('pill', variant, className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
