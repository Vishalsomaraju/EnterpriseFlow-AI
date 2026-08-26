import React from 'react';

export type BadgeStatus = 'ACTIVE' | 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'BLOCKED' | 'REVIEW REQUIRED' | 'WARNING' | 'DANGER' | 'DEFAULT';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, status = 'DEFAULT', style, children, ...props }, ref) => {
    
    let bg = 'var(--surface)';
    let color = 'var(--text)';
    let border = '1px solid var(--border)';

    switch (status) {
      case 'ACTIVE':
      case 'COMPLETED':
        bg = 'var(--success-tint)';
        color = 'var(--success)';
        border = '1px solid var(--success-tint)';
        break;
      case 'FAILED':
      case 'BLOCKED':
        bg = 'var(--danger-tint)';
        color = 'var(--danger)';
        border = '1px solid var(--danger-tint)';
        break;
      case 'WARNING':
      case 'REVIEW REQUIRED':
        bg = 'var(--warning-tint)';
        color = 'var(--warning)';
        border = '1px solid var(--warning-tint)';
        break;
      case 'RUNNING':
        bg = 'var(--accent-tint)';
        color = 'var(--accent)';
        border = '1px solid var(--accent-tint)';
        break;
      case 'PENDING':
      case 'DEFAULT':
      default:
        bg = 'color-mix(in srgb, var(--surface) 50%, var(--bg))';
        color = 'var(--muted)';
        border = '1px solid var(--border)';
        break;
    }

    return (
      <span
        ref={ref}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          background: bg,
          color: color,
          border: border,
          whiteSpace: 'nowrap',
          ...style
        }}
        className={className}
        {...props}
      >
        {children || status}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
