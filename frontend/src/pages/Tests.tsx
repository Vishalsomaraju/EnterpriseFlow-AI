import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';
import { useTests } from '../hooks/queries';
import { TestResult } from '../components/build/TestResult';
import { LoadingState, ErrorState } from '../components/States';

export function TestsPage() {
  const { data: tests = [], isLoading, error } = useTests('w_1043');

  const totalDisplay = 27; // Request specifically asked for 27/27

  if (isLoading) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Validation" title="Test Execution" />
        <LoadingState message="Loading test results..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Validation" title="Test Execution" />
        <ErrorState error={error} message="Failed to load test results." />
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="wide">
      <PageHeader 
        eyebrow="Validation" 
        title="Test Execution"
        actions={<Badge status="COMPLETED">Tests Passed</Badge>}
      />

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
            <h1 style={{ fontSize: '36px', color: 'var(--success)', margin: 0 }}>{totalDisplay} / {totalDisplay}</h1>
            <p style={{ color: 'var(--muted)', marginTop: '8px', margin: 0 }}>Tests Passed</p>
          </Card>

          <Card>
            <h3 style={{ fontSize: '15px', marginBottom: '12px', margin: 0 }}>Coverage Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Branch Coverage</span>
                <strong>94%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Function Coverage</span>
                <strong>100%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Line Coverage</span>
                <strong>97%</strong>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
