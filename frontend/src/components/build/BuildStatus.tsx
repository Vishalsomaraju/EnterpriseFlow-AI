import React from 'react';
import type { BuildStatus as StatusType } from '../../types';

interface BuildStatusProps {
  status: StatusType;
}

export const BuildStatus: React.FC<BuildStatusProps> = ({ status }) => {
  const getStyle = (s: StatusType) => {
    switch(s) {
      case 'QUEUED': return { background: 'var(--border)', color: 'var(--text)' };
      case 'ANALYZING':
      case 'PLANNING':
      case 'IMPLEMENTING':
      case 'TESTING': return { background: 'var(--ai-tint)', color: 'var(--ai)', border: '1px solid var(--ai)' };
      case 'COMPLETED': return { background: 'var(--success-tint)', color: 'var(--success)', border: '1px solid var(--success)' };
      case 'FAILED': return { background: 'var(--warning-tint)', color: 'var(--warning)', border: '1px solid var(--warning)' };
      default: return { background: 'var(--border)', color: 'var(--text)' };
    }
  };

  const style = getStyle(status);

  return (
    <span style={{
      ...style,
      padding: '4px 8px',
      borderRadius: 'var(--radius-sm)',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase'
    }}>
      {status}
    </span>
  );
};
