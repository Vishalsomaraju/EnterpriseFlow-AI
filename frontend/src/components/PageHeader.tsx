import React from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, actions }: PageHeaderProps) {
  return (
    <header className="screen-topbar light" style={{ marginBottom: '24px' }}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '-0.02em' }}>{title}</h1>
      </div>
      {actions && <div className="topbar-actions">{actions}</div>}
    </header>
  );
}
