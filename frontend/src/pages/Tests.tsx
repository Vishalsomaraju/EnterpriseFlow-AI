import { useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';
import { useTests } from '../hooks/queries';
import { TestResult } from '../components/build/TestResult';
import { SkeletonCard, SkeletonList, ErrorState, EmptyState } from '../components/States';

export function TestsPage() {
  const { id = '0bc69865-15e0-4f30-af96-6227abee5e6c' } = useParams();
  const { data: tests = [], isLoading, error, refetch } = useTests(id);

  const totalPassed = tests.reduce((total, test) => total + (test.status === 'Passed' ? 1 : 0), 0);
  const totalFailed = tests.reduce((total, test) => total + (test.status === 'Failed' ? 1 : 0), 0);
  const totalDisplay = tests.length;

  if (isLoading) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Validation" title="Test Execution" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginTop: '24px' }}>
          <SkeletonList items={4} />
          <SkeletonCard height="240px" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Validation" title="Test Execution" />
        <div style={{ marginTop: '24px' }}>
          <ErrorState 
            error={error} 
            message="Failed to load test execution results from server." 
            onRetry={() => refetch()}
            workflowId={id}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="wide">
      <PageHeader 
        eyebrow="Validation" 
        title="Test Execution"
        actions={
          totalDisplay > 0 ? (
            <Badge status={totalFailed > 0 ? 'WARNING' : 'COMPLETED'}>
              {totalFailed > 0 ? `${totalFailed} Failed` : 'All Tests Passed'}
            </Badge>
          ) : (
            <Badge status="DEFAULT">No Test Runs</Badge>
          )
        }
      />

      {totalDisplay === 0 ? (
        <div style={{ marginTop: '24px' }}>
          <EmptyState
            title="No test evidence available yet"
            description="Automated tests will appear here once the testing phase is executed for this build."
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginTop: '24px' }}>
          <main>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tests.map(test => (
                <TestResult key={test.id} test={test} />
              ))}
            </div>
          </main>
          
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
              <h1 style={{ fontSize: '36px', color: totalFailed > 0 ? 'var(--danger)' : 'var(--success)', margin: 0 }}>
                {totalPassed} / {totalDisplay}
              </h1>
              <p style={{ color: 'var(--muted)', marginTop: '8px', margin: 0, fontSize: '14px', fontWeight: 500 }}>
                Tests Passed
              </p>
            </Card>

            <Card>
              <h3 style={{ fontSize: '15px', marginBottom: '12px', margin: 0 }}>Execution Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Total Tests</span>
                  <strong>{totalDisplay}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Passed</span>
                  <strong style={{ color: 'var(--success)' }}>{totalPassed}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Failed</span>
                  <strong style={{ color: totalFailed > 0 ? 'var(--danger)' : 'var(--text)' }}>{totalFailed}</strong>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      )}
    </PageContainer>
  );
}
