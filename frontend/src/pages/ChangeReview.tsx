import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';
import { useApproveReview, useRejectReview } from '../hooks/mutations';
import { useReviewSummary } from '../hooks/queries';
import { Check, ArrowRight } from 'lucide-react';
import { LoadingState, ErrorState } from '../components/States';

export function ChangeReviewPage() {
  const navigate = useNavigate();
  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();
  
  const { data: summary, isLoading, error } = useReviewSummary('w_1043');

  const handleApprove = () => {
    approveMutation.mutate('w_1043', {
      onSuccess: () => navigate('/app/dashboard')
    });
  };

  const handleReject = () => {
    rejectMutation.mutate({ reviewId: 'w_1043', reason: 'Declined' }, {
      onSuccess: () => navigate('/app/workflows/w_1043/build/changes')
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

        <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <p className="eyebrow">Regression tests</p>
            <h3 style={{ fontSize: '28px', margin: '4px 0 0 0' }}>{summary.testsPassed} / {summary.testsPassed + summary.testsFailed}</h3>
          </div>
          <Check size={32} color="var(--success)" />
        </Card>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={handleReject} disabled={isSubmitting}>Reject Change</Button>
          <Button onClick={handleApprove} disabled={isSubmitting}>{isSubmitting ? 'Approving...' : 'Approve Change'}</Button>
        </div>

      </div>
    </PageContainer>
  );
}
