import { useOutletContext, Link } from 'react-router-dom';
import { BuildPipeline } from '../../components/build/BuildPipeline';
import { BobActivity } from '../../components/build/BobActivity';
import { Card } from '../../components/Card';
import { useBobActivity, useSecurityResult } from '../../hooks/queries';
import type { Build } from '../../types';
import { ShieldCheck, ShieldAlert, Shield, FlaskConical, ArrowRight } from 'lucide-react';
import { SkeletonCard, SkeletonList, ErrorState, EmptyState } from '../../components/States';

export function BobBuildOverview() {
  const { build } = useOutletContext<{ build: Build }>();
  const { data: activity = [], isLoading: activityLoading, error: activityError, refetch: refetchActivity } = useBobActivity(build.id);
  const { data: security, isLoading: securityLoading, error: securityError } = useSecurityResult(build.id);

  if (activityLoading || securityLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        <SkeletonCard height="320px" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <SkeletonCard height="160px" />
            <SkeletonCard height="160px" />
          </div>
          <SkeletonList items={3} />
        </div>
      </div>
    );
  }

  if (activityError && securityError) {
    return <ErrorState error={activityError || securityError} message="Failed to load build overview." onRetry={() => refetchActivity()} />;
  }

  const workflowId = build.workflowId || '0bc69865-15e0-4f30-af96-6227abee5e6c';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
      <BuildPipeline stages={build.stages} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Security Summary */}
          {security ? (
            <Card style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                {security.status === 'PASS' ? <ShieldCheck color="var(--success)" size={20} /> : <ShieldAlert color="var(--warning)" size={20} />}
                <h3 style={{ fontSize: '15px', margin: 0 }}>Security Validation</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><span style={{ fontSize: '12px', color: 'var(--muted)' }}>Critical:</span> <strong style={{ color: security.critical > 0 ? 'var(--warning)' : 'var(--text)' }}>{security.critical}</strong></div>
                <div><span style={{ fontSize: '12px', color: 'var(--muted)' }}>High:</span> <strong style={{ color: security.high > 0 ? 'var(--warning)' : 'var(--text)' }}>{security.high}</strong></div>
                <div><span style={{ fontSize: '12px', color: 'var(--muted)' }}>Medium:</span> <strong>{security.medium}</strong></div>
                <div><span style={{ fontSize: '12px', color: 'var(--muted)' }}>Low:</span> <strong>{security.low}</strong></div>
              </div>
            </Card>
          ) : (
            <Card style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Shield color="var(--muted)" size={20} />
                <h3 style={{ fontSize: '15px', margin: 0 }}>Security Validation</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                No automated security scan executed for this build yet.
              </p>
            </Card>
          )}

          {/* Test Summary */}
          <Card style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FlaskConical color="var(--accent)" size={20} />
              <h3 style={{ fontSize: '15px', margin: 0 }}>Test Execution</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', flex: 1, margin: 0 }}>
              Automated regression and boundary tests verified against the workflow implementation.
            </p>
            <Link to={`/app/workflows/${workflowId}/tests`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px' }}>
              View Test Results <ArrowRight size={14} />
            </Link>
          </Card>
        </div>

        {activity.length === 0 ? (
          <EmptyState
            title="No activity logged yet"
            description="Agent events will appear here once the build pipeline runs."
          />
        ) : (
          <BobActivity events={activity} />
        )}
      </div>
    </div>
  );
}
