
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
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
      <>
        <PageHeader eyebrow="Governance Gate" title="Human Review" />
        <LoadingState message="Loading review summary..." />
      </>
    );
  }

  if (error || !summary) {
    return (
      <>
        <PageHeader eyebrow="Governance Gate" title="Human Review" />
        <ErrorState error={error} message="Failed to load review summary." />
      </>
    );
  }

  return (
    <>
      <PageHeader 
        eyebrow="Governance Gate" 
        title="Human Review"
      />

      <div style={{ maxWidth: '800px', margin: '40px auto' }}>
        
        <div className="validation-card" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '8px' }}>Business rule:</h2>
          <div style={{ fontSize: '24px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--danger)' }}>₹5L</span>
            <ArrowRight size={24} color="var(--muted)" />
            <span style={{ color: 'var(--success)' }}>₹10L</span>
          </div>
        </div>
        
        <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ fontSize: '15px' }}>Workflow Updated</strong>
            <Check size={20} color="var(--success)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ fontSize: '15px' }}>Code Updated</strong>
            <Check size={20} color="var(--success)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ fontSize: '15px' }}>Tests Updated</strong>
            <Check size={20} color="var(--success)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ fontSize: '15px' }}>Documentation Updated</strong>
            <Check size={20} color="var(--success)" />
          </div>
        </div>

        <div className="summary-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', marginBottom: '32px' }}>
          <div>
            <span style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>Regression tests:</span>
            <strong style={{ fontSize: '20px' }}>{summary.testsPassed} / {summary.testsPassed + summary.testsFailed}</strong>
          </div>
          <Check size={24} color="var(--success)" />
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={handleReject} disabled={isSubmitting}>Reject Change</Button>
          <Button onClick={handleApprove} disabled={isSubmitting}>{isSubmitting ? 'Approving...' : 'Approve Change'}</Button>
        </div>

      </div>
    </>
  );
}
