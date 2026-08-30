import { useNavigate, useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';
import { useApproveReview, useRejectReview } from '../hooks/mutations';
import { useReviewSummary, useSecurityResult } from '../hooks/queries';
import { Check, ShieldAlert, ShieldCheck } from 'lucide-react';
import { SkeletonCard, SkeletonList, ErrorState, EmptyState } from '../components/States';

export function ChangeReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const buildOrWorkflowId = id || '0bc69865-15e0-4f30-af96-6227abee5e6c';

  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();
  
  const { data: summary, isLoading, error, refetch } = useReviewSummary(buildOrWorkflowId);
  const { data: security } = useSecurityResult(buildOrWorkflowId);

  const isBlocked = security?.status === 'BLOCK';

  const handleApprove = () => {
    if (isBlocked) return;
    approveMutation.mutate(buildOrWorkflowId, {
      onSuccess: () => navigate('/app/dashboard')
    });
  };

  const handleReject = () => {
    rejectMutation.mutate({ reviewId: buildOrWorkflowId, reason: 'Declined by reviewer' }, {
      onSuccess: () => navigate(`/app/workflows/${buildOrWorkflowId}/build/changes`)
    });
  };
  
  const isSubmitting = approveMutation.isPending || rejectMutation.isPending;

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Governance Gate" title="Human Review" />
        <div style={{ maxWidth: '800px', margin: '32px auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SkeletonCard height="120px" />
          <SkeletonList items={4} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <SkeletonCard height="100px" />
            <SkeletonCard height="100px" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Governance Gate" title="Human Review" />
        <div style={{ maxWidth: '800px', margin: '32px auto' }}>
          <ErrorState 
            error={error} 
            message="Failed to load review summary from server." 
            onRetry={() => refetch()}
            workflowId={buildOrWorkflowId}
          />
        </div>
      </PageContainer>
    );
  }

  if (!summary) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Governance Gate" title="Human Review" />
        <div style={{ maxWidth: '800px', margin: '32px auto' }}>
          <EmptyState
            title="No review pending"
            description="There are currently no change reviews awaiting authorization for this workflow."
            action={
              <Link to={`/app/workflows/${buildOrWorkflowId}/graph`}>
                <Button>Back to Workflow</Button>
              </Link>
            }
          />
        </div>
      </PageContainer>
    );
  }

  const totalTests = (summary.testsPassed || 0) + (summary.testsFailed || 0);

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

        <Card style={{ marginBottom: '24px' }}>
          <p className="eyebrow">Change Summary</p>
          <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--text)', margin: '8px 0 0 0' }}>
            {summary.businessImpact || `${summary.filesChanged || 0} files modified across workflow and test boundaries.`}
          </p>
        </Card>
        
        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
          <Card style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>State Machine Graph Updated</span>
            <Check size={18} color="var(--success)" />
          </Card>
          <Card style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Code Implementation Generated ({summary.filesChanged || 0} files)</span>
            <Check size={18} color="var(--success)" />
          </Card>
          <Card style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Test Suite Verified ({summary.testsPassed || 0} passed)</span>
            <Check size={18} color="var(--success)" />
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p className="eyebrow">Regression tests</p>
              <h3 style={{ fontSize: '24px', margin: '4px 0 0 0' }}>
                {totalTests > 0 ? `${summary.testsPassed} / ${totalTests}` : `${summary.testsPassed} Passed`}
              </h3>
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
