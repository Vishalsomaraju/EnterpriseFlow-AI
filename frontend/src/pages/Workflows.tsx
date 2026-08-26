import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useProjects } from '../hooks/queries';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

export function WorkflowsPage() {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) {
    return (
      <>
        <PageHeader eyebrow="Workspace" title="Workflows" />
        <LoadingState message="Loading workflows..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader eyebrow="Workspace" title="Workflows" />
        <ErrorState error={error} message="Failed to load workflows." />
      </>
    );
  }

  return (
    <>
      <PageHeader 
        eyebrow="Workspace" 
        title="Workflows" 
        actions={
          <Link to="/app/workflows/new">
            <Button>Create Workflow</Button>
          </Link>
        } 
      />
      
      <div style={{ padding: '24px 0' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search workflows..." 
            style={{ 
              padding: '8px 12px', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius-md)', 
              width: '300px',
              fontSize: '14px'
            }} 
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" className="active" style={{ background: 'var(--surface)' }}>All</Button>
            <Button variant="ghost" size="sm">Active</Button>
            <Button variant="ghost" size="sm">Draft</Button>
            <Button variant="ghost" size="sm">Needs Review</Button>
          </div>
        </div>

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
          <div className="validation-card" style={{ padding: 0 }}>
            <table style={{ width: '100%', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px' }}>Name</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px' }}>Nodes</th>
                  <th style={{ padding: '16px' }}>Last Updated</th>
                  <th style={{ padding: '16px' }}></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, idx) => (
                  <tr key={project.id} style={{ borderTop: idx > 0 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '16px', fontWeight: 500 }}>
                      <Link to={`/app/workflows/${project.id}/graph`} style={{ color: 'var(--text)', textDecoration: 'none' }}>
                        {project.name}
                      </Link>
                    </td>
                    <td style={{ padding: '16px' }}><Badge variant="success">Active</Badge></td>
                    <td style={{ padding: '16px' }}>--</td>
                    <td style={{ padding: '16px', color: 'var(--muted)' }}>{new Date(project.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <Link to={`/app/workflows/${project.id}/graph`}>
                        <Button variant="secondary" size="sm">View Graph</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
