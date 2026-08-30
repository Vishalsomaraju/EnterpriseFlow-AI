import React from 'react';
import type { BobActivityEvent } from '../../types';
import { Terminal, Code, Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface BobActivityProps {
  events: BobActivityEvent[];
}

export const BobActivity: React.FC<BobActivityProps> = ({ events }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'log': return <Terminal size={14} />;
      case 'info': return <Info size={14} color="var(--accent)" />;
      case 'success': return <CheckCircle size={14} color="var(--success)" />;
      case 'error': return <AlertTriangle size={14} color="var(--warning)" />;
      default: return <Code size={14} />;
    }
  };

  return (
    <div className="schema-block" style={{ background: '#09090b', color: '#e4e4e7', borderRadius: 'var(--radius-md)', border: '1px solid #27272a', padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', background: '#18181b', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Terminal size={16} color="var(--ai)" />
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.05em' }}>BOB ACTIVITY STREAM</span>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
        {events.map(event => (
          <div key={event.id} style={{ display: 'grid', gridTemplateColumns: '60px 24px 1fr 100px', gap: '8px', alignItems: 'start', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: '#52525b' }}>{new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}</div>
            <div>{getIcon(event.eventType)}</div>
            <div style={{ color: event.eventType === 'error' ? '#ef4444' : event.eventType === 'success' ? '#10b981' : '#e4e4e7' }}>{event.message}</div>
            <div style={{ textAlign: 'right', color: '#52525b', fontSize: '11px' }}>[{event.agent}]</div>
          </div>
        ))}
      </div>
    </div>
  );
};
