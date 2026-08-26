import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center font-bold transition-colors disabled:opacity-50 disabled:pointer-events-none',
          {
            'primary-action': variant === 'primary',
            'bg-gray-100 text-gray-700 hover:bg-gray-200': variant === 'secondary',
            'bg-transparent hover:bg-gray-100 text-gray-700': variant === 'ghost',
            'min-h-[32px] px-3 text-xs rounded-md': size === 'sm',
            'min-h-[38px] px-4 text-[13px] rounded-md': size === 'md',
            'min-h-[44px] px-5 text-sm rounded-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
