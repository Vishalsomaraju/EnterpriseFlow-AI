import React from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, actions }: PageHeaderProps) {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p className="eyebrow" style={{ color: 'var(--accent)', marginBottom: '8px' }}>{eyebrow}</p>
        <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--text-h)', letterSpacing: '-0.02em' }}>{title}</h1>
      </div>
      {actions && <div style={{ display: 'flex', gap: '12px' }}>{actions}</div>}
    </header>
  );
}
