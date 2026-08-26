import React from 'react';
import type { BobSubagent } from '../../types';
import { Bot, CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface SubagentCardProps {
  subagent: BobSubagent;
}

export const SubagentCard: React.FC<SubagentCardProps> = ({ subagent }) => {
  const getIcon = () => {
    switch (subagent.status) {
      case 'COMPLETED': return <CheckCircle2 size={16} color="var(--success)" />;
      case 'RUNNING': return <Loader2 size={16} color="var(--ai)" className="spin" />;
      case 'FAILED': return <Circle size={16} color="var(--warning)" />;
      default: return <Circle size={16} color="var(--border)" />;
    }
  };

  return (
    <div className="validation-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', 
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Bot size={18} color="var(--ai)" />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', margin: 0 }}>{subagent.name}</h4>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>{subagent.task}</p>
          </div>
        </div>
        <div>{getIcon()}</div>
      </div>
      {subagent.result && (
        <div style={{ marginTop: '12px', padding: '12px', background: 'var(--background)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
          {subagent.result}
        </div>
      )}
    </div>
  );
};
