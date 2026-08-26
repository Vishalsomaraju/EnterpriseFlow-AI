import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Table } from '../components/Table';
import { PageContainer } from '../components/layout/PageContainer';
import { Section } from '../components/layout/Section';
import { useProjects } from '../hooks/queries';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

export function WorkflowsPage() {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Workspace" title="Workflows" />
        <LoadingState message="Loading workflows..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Workspace" title="Workflows" />
        <ErrorState error={error} message="Failed to load workflows." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        eyebrow="Workspace" 
        title="Workflows" 
        actions={
          <Link to="/app/workflows/new">
            <Button>Create Workflow</Button>
          </Link>
        } 
      />
      
      <Section>
        {(!projects || projects.length === 0) ? (
          <EmptyState 
            title="No workflows found" 
            description="Get started by mapping your first business process."
            action={
              <Link to="/app/workflows/new">
                <Button>Create Workflow</Button>
              </Link>
            }
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Nodes</th>
                <th>Last Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td style={{ fontWeight: 500 }}>
                    <Link to={`/app/workflows/${project.id}/graph`} style={{ color: 'var(--text)', textDecoration: 'none' }}>
                      {project.name}
                    </Link>
                  </td>
                  <td><Badge status="ACTIVE" /></td>
                  <td>--</td>
                  <td style={{ color: 'var(--muted)' }}>{new Date(project.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/app/workflows/${project.id}/graph`}>
                      <Button variant="secondary" size="sm">View Graph</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    </PageContainer>
  );
}
