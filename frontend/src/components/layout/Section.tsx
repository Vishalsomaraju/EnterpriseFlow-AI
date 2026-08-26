import type { ReactNode } from 'react';

export function Section({ 
  title, 
  eyebrow, 
  description, 
  actions, 
  children,
  className,
  style
}: { 
  title?: ReactNode;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section className={className} style={{ display: 'flex', flexDirection: 'column', gap: '16px', ...style }}>
      {(title || eyebrow || description || actions) && (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {eyebrow && <p className="eyebrow" style={{ color: 'var(--accent)', marginBottom: '4px' }}>{eyebrow}</p>}
            {title && <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--text)' }}>{title}</h2>}
            {description && <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>{description}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </header>
      )}
      <div>{children}</div>
    </section>
  );
}
