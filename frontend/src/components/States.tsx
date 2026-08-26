import React from 'react';
import { Loader2, AlertCircle, FileBox } from 'lucide-react';
import { Card } from './Card';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', gap: '16px', color: 'var(--muted)' }}>
      <Loader2 size={32} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '14px' }}>{message}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function ErrorState({ error, message = 'Something went wrong.' }: { error?: Error | string | null, message?: string }) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  return (
    <Card noShadow style={{ borderColor: 'var(--danger)', background: 'var(--danger-tint)', color: 'var(--danger)', display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'flex-start' }}>
      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <strong style={{ display: 'block', marginBottom: '4px' }}>{message}</strong>
        {errorMessage && <span style={{ fontSize: '14px', opacity: 0.9 }}>{errorMessage}</span>}
      </div>
    </Card>
  );
}

export function EmptyState({ title, description, action }: { title: string, description: string, action?: React.ReactNode }) {
  return (
    <Card noShadow style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 32px', textAlign: 'center', gap: '16px', borderStyle: 'dashed' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'color-mix(in srgb, var(--surface) 50%, var(--bg))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', marginBottom: '8px' }}>
        <FileBox size={24} />
      </div>
      <div>
        <strong style={{ display: 'block', fontSize: '16px', marginBottom: '8px', color: 'var(--text)' }}>{title}</strong>
        <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{description}</span>
      </div>
      {action && <div style={{ marginTop: '8px' }}>{action}</div>}
    </Card>
  );
}
