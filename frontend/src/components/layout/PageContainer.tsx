import type { ReactNode } from 'react';

export type PageContainerVariant = 'normal' | 'narrow' | 'wide' | 'full';

export function PageContainer({ 
  children, 
  style,
  variant = 'normal'
}: { 
  children: ReactNode;
  style?: React.CSSProperties;
  variant?: PageContainerVariant;
}) {
  const maxWidths = {
    normal: '1280px',
    narrow: '900px',
    wide: '1440px',
    full: '100%'
  };

  return (
    <div className="page-container" style={{
      padding: '24px',
      width: '100%',
      maxWidth: maxWidths[variant],
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      boxSizing: 'border-box',
      ...style
    }}>
      {children}
    </div>
  );
}
