import type { ReactNode } from 'react';

export function PageContainer({ 
  children, 
  style,
  maxWidth = '1200px'
}: { 
  children: ReactNode;
  style?: React.CSSProperties;
  maxWidth?: string | number;
}) {
  return (
    <div style={{
      padding: '24px',
      maxWidth,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      width: '100%',
      boxSizing: 'border-box',
      ...style
    }}>
      {children}
    </div>
  );
}
