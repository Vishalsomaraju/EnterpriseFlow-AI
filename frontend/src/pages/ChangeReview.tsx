import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';
import { useApproveReview, useRejectReview } from '../hooks/mutations';
import { useReviewSummary, useSecurityResult } from '../hooks/queries';
import { Check, ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { LoadingState, ErrorState } from '../components/States';

export function ChangeReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const buildOrWorkflowId = id || 'w_1043';

  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();
  
  const { data: summary, isLoading, error } = useReviewSummary(buildOrWorkflowId);
  const { data: security } = useSecurityResult(buildOrWorkflowId);

  const isBlocked = security?.status === 'BLOCK';

  const handleApprove = () => {
    if (isBlocked) return;
    approveMutation.mutate(buildOrWorkflowId, {
      onSuccess: () => navigate('/app/dashboard')
    });
  };

  const handleReject = () => {
    rejectMutation.mutate({ reviewId: buildOrWorkflowId, reason: 'Declined' }, {
      onSuccess: () => navigate(`/app/workflows/${buildOrWorkflowId}/build/changes`)
    });
  };
  
  const isSubmitting = approveMutation.isPending || rejectMutation.isPending;

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Governance Gate" title="Human Review" />
        <LoadingState message="Loading review summary..." />
      </PageContainer>
    );
  }

  if (error || !summary) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Governance Gate" title="Human Review" />
        <ErrorState error={error} message="Failed to load review summary." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        eyebrow="Governance Gate" 
        title="Human Review"
      />

      <div style={{ maxWidth: '800px', margin: '40px auto' }}>
        
        {isBlocked && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger, #ef4444)',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <ShieldAlert size={28} color="#ef4444" />
            <div>
              <strong style={{ color: '#ef4444', fontSize: '16px' }}>APPROVAL BLOCKED — SecurePush Gate</strong>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text)' }}>
                Critical security findings detected ({security?.critical || 0} critical, {security?.high || 0} high). 
                Approval is prohibited until security findings are resolved.
              </p>
            </div>
          </div>
        )}

        <Card style={{ marginBottom: '32px' }}>
          <p className="eyebrow">Business rule changed</p>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <span>₹5L</span>
            <ArrowRight size={24} color="var(--muted)" />
            <span>₹10L</span>
          </div>
        </Card>
        
        <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
          <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '15px' }}>Workflow Updated</strong>
            <Check size={20} color="var(--success)" />
          </Card>
          <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '15px' }}>Code Updated</strong>
            <Check size={20} color="var(--success)" />
          </Card>
          <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '15px' }}>Tests Updated</strong>
            <Check size={20} color="var(--success)" />
          </Card>
          <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '15px' }}>Documentation Updated</strong>
            <Check size={20} color="var(--success)" />
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p className="eyebrow">Regression tests</p>
              <h3 style={{ fontSize: '24px', margin: '4px 0 0 0' }}>{summary.testsPassed} / {summary.testsPassed + summary.testsFailed}</h3>
            </div>
            <Check size={28} color="var(--success)" />
          </Card>

          <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p className="eyebrow">SecurePush Gate</p>
              <h3 style={{ 
                fontSize: '24px', 
                margin: '4px 0 0 0',
                color: security?.status === 'BLOCK' ? 'var(--danger, #ef4444)' : security?.status === 'WARN' ? '#f59e0b' : 'var(--success)'
              }}>
                {security?.status || 'PASS'}
              </h3>
            </div>
            {security?.status === 'BLOCK' ? (
              <ShieldAlert size={28} color="#ef4444" />
            ) : (
              <ShieldCheck size={28} color="var(--success)" />
            )}
          </Card>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={handleReject} disabled={isSubmitting}>Reject Change</Button>
          <Button 
            onClick={handleApprove} 
            disabled={isSubmitting || isBlocked}
            style={isBlocked ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {isBlocked ? 'Approval Blocked' : isSubmitting ? 'Approving...' : 'Approve Change'}
          </Button>
        </div>

      </div>
    </PageContainer>
  );
}
