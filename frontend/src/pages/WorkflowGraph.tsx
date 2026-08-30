import { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowGraph } from '../hooks/queries';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';
import { SkeletonMetrics, SkeletonCanvas, ErrorState, EmptyState } from '../components/States';
import { Link, useParams } from 'react-router-dom';

import { WorkflowNode } from '../components/nodes/WorkflowNode';
import { WorkflowEdge } from '../components/edges/WorkflowEdge';
import type { WorkflowRule } from '../types';

const nodeTypes = { customNode: WorkflowNode };
const edgeTypes = { customEdge: WorkflowEdge };

const WORKFLOW_FALLBACK_ID = '0bc69865-15e0-4f30-af96-6227abee5e6c';

export function WorkflowGraphPage() {
  const { id = WORKFLOW_FALLBACK_ID } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const { data: graphData, isLoading, error, refetch } = useWorkflowGraph(id);

  useEffect(() => {
    if (graphData) {
      const initialNodes = graphData.nodes.map((n, index) => ({
        id: n.id,
        type: 'customNode',
        position: n.position || { x: 280, y: index * 130 + 40 },
        data: { label: n.label, kind: n.kind, type: n.type },
      }));
      const initialEdges = graphData.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'customEdge',
        data: { label: e.label }
      }));
      setNodes(initialNodes);
      setEdges(initialEdges);
      setRules(graphData.rules);
      
      const defaultNode = initialNodes.find(n => n.id === 'n6' || n.id.includes('amount') || n.id.includes('approval')) || initialNodes[0];
      setSelectedNode(defaultNode || null);
    }
  }, [graphData, setNodes, setEdges]);

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    if (nodes.length > 0) setSelectedNode(nodes[0]);
  }, []);

  if (isLoading) {
    return (
      <PageContainer variant="full">
        <PageHeader 
          eyebrow="Workflow Graph" 
          title="State Machine Graph" 
        />
        <SkeletonMetrics count={4} />
        <div style={{ marginTop: '24px' }}>
          <SkeletonCanvas height="640px" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer variant="full">
        <PageHeader eyebrow="Workflow Graph" title="State Machine Graph" />
        <div style={{ marginTop: '24px' }}>
          <ErrorState 
            error={error} 
            message="Failed to retrieve workflow graph from the database." 
            onRetry={() => refetch()}
          />
        </div>
      </PageContainer>
    );
  }

  const totalSteps = graphData?.nodes?.length || 0;
  const totalEdges = graphData?.edges?.length || 0;
  const totalRules = graphData?.rules?.length || 0;
  const humanCheckpoints = graphData?.nodes?.filter(n => n.type === 'human' || n.kind?.toLowerCase().includes('human')).length || 0;

  const isDraft = graphData?.status === 'DRAFT' && totalSteps === 0;
  const pageTitle = isDraft
    ? (graphData?.workflowName || 'Workflow')
    : 'Deterministic State Machine';

  return (
    <PageContainer variant="full">
      <PageHeader 
        eyebrow="Workflow Graph" 
        title={pageTitle}
        actions={
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {isDraft ? (
              <Badge status="DEFAULT">DRAFT — No Graph Yet</Badge>
            ) : (
              <Badge status="COMPLETED">Schema Validated</Badge>
            )}
            <Link to={`/app/workflows/${id}/analysis`}>
              <Button variant="secondary">Analysis</Button>
            </Link>
            <Link to={`/app/workflows/${id}/impact`}>
              <Button>Analyze Impact</Button>
            </Link>
          </div>
        }
      />

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '20px' }}>
        <Card>
          <p className="eyebrow">Workflow steps</p>
          <h3 style={{ fontSize: '28px', margin: '4px 0' }}>{totalSteps}</h3>
          <small style={{ color: 'var(--muted)' }}>Persisted state machine nodes</small>
        </Card>
        <Card>
          <p className="eyebrow">Transitions</p>
          <h3 style={{ fontSize: '28px', margin: '4px 0' }}>{totalEdges}</h3>
          <small style={{ color: 'var(--muted)' }}>Directed execution edges</small>
        </Card>
        <Card>
          <p className="eyebrow">Business rules</p>
          <h3 style={{ fontSize: '28px', margin: '4px 0', color: totalRules > 0 ? 'var(--accent)' : 'var(--muted)' }}>{totalRules}</h3>
          <small style={{ color: 'var(--muted)' }}>Deterministic policy constraints</small>
        </Card>
        <Card>
          <p className="eyebrow">Human checkpoints</p>
          <h3 style={{ fontSize: '28px', margin: '4px 0', color: humanCheckpoints > 0 ? 'var(--warning)' : 'var(--text)' }}>{humanCheckpoints}</h3>
          <small style={{ color: 'var(--muted)' }}>Manual governance gates</small>
        </Card>
      </section>

      {totalSteps === 0 ? (
        <div style={{ marginTop: '24px' }}>
          <EmptyState
            title={
              graphData?.status === 'DRAFT'
                ? `"${graphData?.workflowName || 'This workflow'}" is a Draft`
                : 'No workflow nodes found'
            }
            description={
              graphData?.status === 'DRAFT'
                ? 'This workflow version is in DRAFT state and has no graph nodes persisted yet. Add steps to the workflow to see the graph here.'
                : 'This workflow version has no state machine nodes mapped yet.'
            }
          />
        </div>
      ) : (
        <section className="graph-layout" style={{ marginTop: '24px' }}>
          <div className="graph-canvas-panel dark-mode">
            <div className="canvas-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge status="DEFAULT">Canonical dependency view</Badge>
              <span style={{ fontSize: '12px', color: 'var(--dark-muted)' }}>Click a node to inspect rules</span>
            </div>
            <div className="workflow-canvas" style={{ height: '680px', marginTop: '16px' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onSelectionChange={onSelectionChange}
                fitView
              >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#97a3b6" />
                <Controls />
              </ReactFlow>
            </div>
          </div>

          <aside className="inspector-panel dark-mode" style={{ background: 'var(--dark-surface)', color: 'var(--dark-text)' }}>
            {selectedNode ? (
              <>
                <div className="inspector-head" style={{ marginBottom: '20px' }}>
                  <p className="eyebrow" style={{ color: 'var(--dark-muted)' }}>Node inspector</p>
                  <h2 id="inspector-title" style={{ margin: 0 }}>{(selectedNode.data as any).label}</h2>
                </div>
                <div className="inspector-block" style={{ marginBottom: '20px' }}>
                  <Badge status={(selectedNode.data as any).type === 'human' ? 'WARNING' : 'COMPLETED'}>
                    {(selectedNode.data as any).kind || (selectedNode.data as any).type}
                  </Badge>
                  <p className="inspector-text" style={{ marginTop: '12px', color: 'var(--dark-muted)' }}>
                    Node ID: <code>{selectedNode.id}</code>
                  </p>
                </div>
                
                {rules.filter(r => r.nodeId === selectedNode.id).length > 0 ? (
                  <>
                    <div className="inspector-block" style={{ marginBottom: '20px' }}>
                      <p className="eyebrow" style={{ color: 'var(--dark-muted)' }}>Rules enforced</p>
                      <ul className="rule-list" style={{ color: 'var(--dark-muted)', paddingLeft: '18px', fontSize: '13px', lineHeight: '1.5' }}>
                        {rules.filter(r => r.nodeId === selectedNode.id).map(rule => (
                          <li key={rule.id}>{rule.description || rule.condition}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="inspector-block">
                      <p className="eyebrow" style={{ color: 'var(--dark-muted)' }}>Deterministic rule payload</p>
                      <pre className="schema-block" style={{ background: '#111827', padding: '12px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', border: '1px solid var(--dark-border)' }}>
{JSON.stringify({
  ruleId: rules.find(r => r.nodeId === selectedNode.id)?.id,
  condition: rules.find(r => r.nodeId === selectedNode.id)?.condition,
  action: rules.find(r => r.nodeId === selectedNode.id)?.action
}, null, 2)}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="inspector-block" style={{ marginTop: '16px', color: 'var(--dark-muted)', fontSize: '13px' }}>
                    No business rule constraints assigned directly to this node.
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: 'var(--dark-muted)' }}>Select a node in the graph to inspect details</div>
            )}
          </aside>
        </section>
      )}
    </PageContainer>
  );
}
