import React from 'react';
import type { TestRun } from '../../types';
import { CheckCircle2, XCircle, Loader2, CircleSlash } from 'lucide-react';

export const TestResult: React.FC<{ test: TestRun }> = ({ test }) => {
  const getIcon = () => {
    switch (test.status) {
      case 'Passed': return <CheckCircle2 size={16} color="var(--success)" />;
      case 'Failed': return <XCircle size={16} color="var(--warning)" />;
      case 'Running': return <Loader2 size={16} color="var(--ai)" className="spin" />;
      case 'Skipped': return <CircleSlash size={16} color="var(--muted)" />;
      default: return null;
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {getIcon()}
        <span style={{ fontSize: '14px', fontWeight: 500, color: test.status === 'Skipped' ? 'var(--muted)' : 'var(--text)' }}>
          {test.name}
        </span>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
        {test.durationMs}ms
      </div>
    </div>
  );
};
