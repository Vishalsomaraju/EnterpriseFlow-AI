import React from 'react';
import { Loader2, AlertCircle, FileBox, RefreshCw, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from './Card';
import { Button } from './Button';

// ---------------------------------------------------------------------------
// Skeleton Primitives
// ---------------------------------------------------------------------------

export function SkeletonBox({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-md)',
  style,
  className
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--border) 0%, color-mix(in srgb, var(--surface) 80%, var(--border)) 50%, var(--border) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        ...style
      }}
    >
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function SkeletonText({
  lines = 2,
  gap = 8,
  lineHeight = '14px',
  style
}: {
  lines?: number;
  gap?: number;
  lineHeight?: string | number;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, width: '100%', ...style }}>
      {Array.from({ length: lines }).map((_, idx) => (
        <SkeletonBox
          key={idx}
          height={lineHeight}
          width={idx === lines - 1 && lines > 1 ? '70%' : '100%'}
          borderRadius="var(--radius-sm)"
        />
      ))}
    </div>
  );
}

export function SkeletonMetrics({ count = 4 }: { count?: number }) {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: '16px', marginTop: '20px' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx}>
          <SkeletonBox width="80px" height="12px" style={{ marginBottom: '12px' }} />
          <SkeletonBox width="60px" height="32px" style={{ marginBottom: '8px' }} />
          <SkeletonBox width="110px" height="12px" />
        </Card>
      ))}
    </section>
  );
}

export function SkeletonCard({ height = '160px', padding = '24px' }: { height?: string | number, padding?: string }) {
  return (
    <Card padding={padding} style={{ minHeight: height }}>
      <SkeletonBox width="140px" height="16px" style={{ marginBottom: '16px' }} />
      <SkeletonText lines={3} gap={10} />
      <SkeletonBox width="90px" height="32px" style={{ marginTop: '20px' }} />
    </Card>
  );
}

export function SkeletonTable({ rows = 4, cols = 4 }: { rows?: number, cols?: number }) {
  return (
    <Card noShadow style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBox key={i} width="70%" height="14px" />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ padding: '16px 20px', borderBottom: r === rows - 1 ? 'none' : '1px solid var(--border)', display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px', alignItems: 'center' }}>
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonBox key={c} width={c === 0 ? '85%' : c === cols - 1 ? '40%' : '60%'} height="16px" />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SkeletonList({ items = 3 }: { items?: number }) {
  return (
    <Card padding="20px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Array.from({ length: items }).map((_, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx === items - 1 ? 'none' : '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '60%' }}>
              <SkeletonBox width="80px" height="10px" />
              <SkeletonBox width="100%" height="16px" />
            </div>
            <SkeletonBox width="100px" height="12px" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SkeletonCanvas({ height = '560px' }: { height?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', height }}>
      <Card noShadow style={{ border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--muted)' }}>
          <Loader2 size={32} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
          <SkeletonBox width="160px" height="14px" />
        </div>
      </Card>
      <Card>
        <SkeletonBox width="100px" height="12px" style={{ marginBottom: '16px' }} />
        <SkeletonBox width="180px" height="24px" style={{ marginBottom: '16px' }} />
        <SkeletonText lines={4} gap={12} />
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feedback States
// ---------------------------------------------------------------------------

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', gap: '16px', color: 'var(--muted)' }}>
      <Loader2 size={32} className="spinner" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
      <span style={{ fontSize: '14px', fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function ErrorState({
  error,
  message = 'Failed to load data from server.',
  onRetry,
  workflowId
}: {
  error?: Error | string | null;
  message?: string;
  onRetry?: () => void;
  workflowId?: string;
}) {
  const navigate = useNavigate();
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <Card noShadow style={{ borderColor: 'var(--danger)', background: 'var(--danger-tint)', color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--danger)' }} />
        <div style={{ flex: 1 }}>
          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--danger)', marginBottom: '4px' }}>{message}</strong>
          {errorMessage && (
            <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', lineHeight: 1.5 }}>
              {errorMessage}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RefreshCw size={14} style={{ marginRight: '6px' }} /> Retry
          </Button>
        )}
        {workflowId && (
          <Button variant="ghost" size="sm" onClick={() => navigate(`/app/workflows/${workflowId}/graph`)}>
            <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Back to Workflow
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/dashboard')}>
          <Home size={14} style={{ marginRight: '6px' }} /> Dashboard
        </Button>
      </div>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Card noShadow style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 32px', textAlign: 'center', gap: '16px', borderStyle: 'dashed' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'color-mix(in srgb, var(--surface) 50%, var(--bg))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', marginBottom: '4px' }}>
        {icon || <FileBox size={24} />}
      </div>
      <div style={{ maxWidth: '440px' }}>
        <strong style={{ display: 'block', fontSize: '16px', marginBottom: '6px', color: 'var(--text)' }}>{title}</strong>
        <span style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5, display: 'block' }}>{description}</span>
      </div>
      {action && <div style={{ marginTop: '8px' }}>{action}</div>}
    </Card>
  );
}

