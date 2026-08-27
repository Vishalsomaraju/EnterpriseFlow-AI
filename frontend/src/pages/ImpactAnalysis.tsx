import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ReactFlow, Controls, Background, BackgroundVariant, useNodesState, useEdgesState } from '@xyflow/react';
import type { Node, Edge, NodeMouseHandler } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';
import { ImpactNode } from '../components/nodes/ImpactNode';
import { WorkflowEdge } from '../components/edges/WorkflowEdge';
import { useImpactAnalysis } from '../hooks/queries';
import { LoadingState, ErrorState } from '../components/States';

const nodeTypes = { impactNode: ImpactNode };
const edgeTypes = { customEdge: WorkflowEdge };

export function ImpactAnalysisPage() {
  const { data: impact, isLoading, error } = useImpactAnalysis('R-001');
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);

  const initialNodes: Node[] = [
    { id: 'n1', type: 'impactNode', position: { x: 50, y: 150 }, data: { label: 'RULE', type: 'Business Rule', name: 'Approval Threshold', reason: 'Value updated to ₹10L', dependency: 'User Configuration', status: 'Modified', variant: 'warning' } },
    { id: 'n2', type: 'impactNode', position: { x: 300, y: 150 }, data: { label: 'WORKFLOW', type: 'Graph Node', name: 'Approval Router', reason: 'Branch conditions evaluated dynamically', dependency: 'Business Rule (RULE)', status: 'Modified', variant: 'info' } },
    { id: 'n3', type: 'impactNode', position: { x: 550, y: 150 }, data: { label: 'BLUEPRINT', type: 'Automation Schema', name: 'Approval Service Contract', reason: 'Routing mapping impacted', dependency: 'Workflow Node (WORKFLOW)', status: 'Modified', variant: 'info' } },
    { id: 'n4', type: 'impactNode', position: { x: 800, y: 150 }, data: { label: 'CODE', type: 'Source File', name: 'approval.service.ts', reason: 'AST rewrite triggered for boundary', dependency: 'Blueprint (BLUEPRINT)', status: 'Modified', variant: 'ai' } },
    { id: 'n5', type: 'impactNode', position: { x: 1050, y: 50 }, data: { label: 'TESTS', type: 'Test Suite', name: 'Regression', reason: 'Test assertions require boundary alignment', dependency: 'Code (CODE)', status: 'Modified', variant: 'success' } },
    { id: 'n6', type: 'impactNode', position: { x: 1050, y: 250 }, data: { label: 'DOCS', type: 'API Spec', name: 'API Documentation', reason: 'Downstream effect of code modifications', dependency: 'Code (CODE)', status: 'Modified', variant: 'info' } },
    { id: 'n7', type: 'impactNode', position: { x: 1300, y: 150 }, data: { label: 'REVIEW', type: 'Governance', name: 'Human Review Gate', reason: 'Approval required for upstream changes', dependency: 'Tests & Docs', status: 'Pending', variant: 'warning' } },
  ];

  const initialEdges: Edge[] = [
    { id: 'e1', source: 'n1', target: 'n2', type: 'customEdge' },
    { id: 'e2', source: 'n2', target: 'n3', type: 'customEdge' },
    { id: 'e3', source: 'n3', target: 'n4', type: 'customEdge' },
    { id: 'e4', source: 'n4', target: 'n5', type: 'customEdge' },
    { id: 'e5', source: 'n4', target: 'n6', type: 'customEdge' },
    { id: 'e6', source: 'n5', target: 'n7', type: 'customEdge' },
    { id: 'e7', source: 'n6', target: 'n7', type: 'customEdge' },
  ];

  const [nodes, , onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState<Edge>(initialEdges);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeData(node.data);
  }, []);

  if (isLoading) {
    return (
      <PageContainer variant="full">
        <PageHeader eyebrow="Impact Analysis" title="EnterpriseFlow Propagation Map" />
        <LoadingState message="Calculating change impact..." />
      </PageContainer>
    );
  }

  if (error || !impact) {
    return (
      <PageContainer variant="full">
        <PageHeader eyebrow="Impact Analysis" title="EnterpriseFlow Propagation Map" />
        <ErrorState error={error} message="Failed to load impact analysis." />
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="full">
      <PageHeader 
        eyebrow="Impact Analysis" 
        title="EnterpriseFlow Propagation Map"
        actions={
          <Link to="/app/workflows/w_1043/graph">
            <Button variant="primary">Back to graph</Button>
          </Link>
        }
      />

      <section style={{ marginTop: '24px', marginBottom: '24px', display: 'flex', gap: '32px', alignItems: 'stretch' }}>
        <Card style={{ flex: 1 }}>
          <p className="eyebrow">Business rule changed</p>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>₹5,00,000</span>
            <span style={{ color: 'var(--muted)', fontSize: '20px' }}>→</span>
            <span>₹10,00,000</span>
          </div>
        </Card>
        
        <Card style={{ flex: 2 }}>
          <p className="eyebrow">Affected components</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            {['Approval Router', 'Approval Service', 'Workflow Graph', 'Tests', 'API Documentation'].map(item => (
              <span key={item} className="pill" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                {item}
              </span>
            ))}
          </div>
        </Card>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', height: '600px' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', overflow: 'hidden' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls />
          </ReactFlow>
        </div>

        <Card>
          {selectedNodeData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Node Inspector</span>
                <h3 style={{ fontSize: '20px', marginTop: '8px', color: 'var(--accent)', margin: 0 }}>{selectedNodeData.label}</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Type</label>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{selectedNodeData.type}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Name</label>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{selectedNodeData.name}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Reason Affected</label>
                  <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{selectedNodeData.reason}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Source Dependency</label>
                  <div style={{ fontSize: '14px', padding: '4px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', display: 'inline-block' }}>{selectedNodeData.dependency}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Affected Status</label>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: selectedNodeData.status === 'Modified' ? 'var(--warning)' : 'var(--text)' }}>
                    {selectedNodeData.status}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', fontSize: '14px', textAlign: 'center' }}>
              Select a node in the graph<br/>to view propagation impact
            </div>
          )}
        </Card>
      </section>
    </PageContainer>
  );
}
