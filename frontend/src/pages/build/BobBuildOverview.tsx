
import { useOutletContext, Link } from 'react-router-dom';
import { BuildPipeline } from '../../components/build/BuildPipeline';
import { BobActivity } from '../../components/build/BobActivity';
import { useBobActivity, useSecurityResult } from '../../hooks/queries';
import type { Build } from '../../types';
import { ShieldCheck, ShieldAlert, FlaskConical, ArrowRight } from 'lucide-react';
import { LoadingState, ErrorState } from '../../components/States';

export function BobBuildOverview() {
  const { build } = useOutletContext<{ build: Build }>();
  const { data: activity = [], isLoading: activityLoading, error: activityError } = useBobActivity(build.id);
  const { data: security, isLoading: securityLoading, error: securityError } = useSecurityResult(build.id);

  if (activityLoading || securityLoading) {
    return <LoadingState message="Loading build overview..." />;
  }

  if (activityError || securityError) {
    return <ErrorState error={activityError || securityError} message="Failed to load build overview." />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
      <BuildPipeline stages={build.stages} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Security Summary */}
          {security && (
            <div className="validation-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                {security.status === 'PASS' ? <ShieldCheck color="var(--success)" size={20} /> : <ShieldAlert color="var(--warning)" size={20} />}
                <h3 style={{ fontSize: '15px' }}>Security Validation</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><span style={{ fontSize: '12px', color: 'var(--muted)' }}>Critical:</span> <strong style={{ color: security.critical > 0 ? 'var(--warning)' : 'var(--text)' }}>{security.critical}</strong></div>
                <div><span style={{ fontSize: '12px', color: 'var(--muted)' }}>High:</span> <strong style={{ color: security.high > 0 ? 'var(--warning)' : 'var(--text)' }}>{security.high}</strong></div>
                <div><span style={{ fontSize: '12px', color: 'var(--muted)' }}>Medium:</span> <strong>{security.medium}</strong></div>
                <div><span style={{ fontSize: '12px', color: 'var(--muted)' }}>Low:</span> <strong>{security.low}</strong></div>
              </div>
            </div>
          )}

          {/* Test Summary */}
          <div className="validation-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FlaskConical color="var(--accent)" size={20} />
              <h3 style={{ fontSize: '15px' }}>Test Execution</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', flex: 1 }}>
              Running regression and boundary tests across 3 changed files.
            </p>
            <Link to="/app/workflows/w_1043/tests" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Test Suite <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <BobActivity events={activity} />
      </div>
    </div>
  );
}
