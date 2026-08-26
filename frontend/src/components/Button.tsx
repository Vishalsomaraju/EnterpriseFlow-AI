import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', style, children, ...props }, ref) => {
    
    let bg = 'var(--surface)';
    let color = 'var(--text)';
    let border = '1px solid var(--border)';

    if (variant === 'primary') {
      bg = 'var(--accent)';
      color = '#ffffff';
      border = '1px solid var(--accent)';
    } else if (variant === 'secondary') {
      bg = 'var(--surface)';
      color = 'var(--text)';
      border = '1px solid var(--border)';
    } else if (variant === 'ghost') {
      bg = 'transparent';
      color = 'var(--muted)';
      border = '1px solid transparent';
    } else if (variant === 'danger') {
      bg = 'var(--danger)';
      color = '#ffffff';
      border = '1px solid var(--danger)';
    }

    let minHeight = '38px';
    let padding = '0 16px';
    let fontSize = '13px';
    let borderRadius = 'var(--radius-md)';

    if (size === 'sm') {
      minHeight = '32px';
      padding = '0 12px';
      fontSize = '12px';
      borderRadius = 'var(--radius-sm)';
    } else if (size === 'lg') {
      minHeight = '44px';
      padding = '0 20px';
      fontSize = '14px';
      borderRadius = 'var(--radius-lg)';
    }

    return (
      <button
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: 600,
          cursor: props.disabled ? 'not-allowed' : 'pointer',
          opacity: props.disabled ? 0.6 : 1,
          transition: 'all 0.15s ease',
          background: bg,
          color: color,
          border: border,
          minHeight,
          padding,
          fontSize,
          borderRadius,
          ...style
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
