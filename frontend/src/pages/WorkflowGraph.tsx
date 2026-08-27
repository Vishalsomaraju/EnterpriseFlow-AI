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
import { Link } from 'react-router-dom';

import { WorkflowNode } from '../components/nodes/WorkflowNode';
import { WorkflowEdge } from '../components/edges/WorkflowEdge';
import type { WorkflowRule } from '../types';

const nodeTypes = { customNode: WorkflowNode };
const edgeTypes = { customEdge: WorkflowEdge };

export function WorkflowGraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const { data: graphData } = useWorkflowGraph('w_1043');

  useEffect(() => {
    if (graphData) {
      const initialNodes = graphData.nodes.map((n) => ({
        id: n.id,
        type: 'customNode',
        position: n.position || { x: 320, y: 0 },
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
      
      const defaultNode = initialNodes.find(n => n.id === 'n6') || initialNodes[0];
      setSelectedNode(defaultNode);
    }
  }, [graphData, setNodes, setEdges]);

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    if (nodes.length > 0) setSelectedNode(nodes[0]);
  }, []);

  return (
    <PageContainer variant="full">
      <PageHeader 
        eyebrow="Workflow Graph" 
        title="Invoice Approval state machine"
        actions={
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Badge status="COMPLETED">Schema validated</Badge>
            <Link to="/app/workflows/w_1043/impact">
              <Button>View impact</Button>
            </Link>
          </div>
        }
      />

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '20px' }}>
        <Card>
          <p className="eyebrow">Extraction summary</p>
          <h3 style={{ fontSize: '28px', margin: '4px 0' }}>12</h3>
          <small style={{ color: 'var(--muted)' }}>steps • 4 actors, 3 decisions</small>
        </Card>
        <Card>
          <p className="eyebrow">Ambiguities</p>
          <h3 style={{ fontSize: '28px', margin: '4px 0', color: 'var(--warning)' }}>2</h3>
          <small style={{ color: 'var(--muted)' }}>Threshold amount & missing PO</small>
        </Card>
        <Card>
          <p className="eyebrow">Structured schema</p>
          <h3 style={{ fontSize: '28px', margin: '4px 0' }}>v1.4</h3>
          <small style={{ color: 'var(--muted)' }}>workflow.invoice-approval</small>
        </Card>
        <Card>
          <p className="eyebrow">Rule engine</p>
          <h3 style={{ fontSize: '28px', margin: '4px 0' }}>0</h3>
          <small style={{ color: 'var(--muted)' }}>Dynamic prompt-time routings</small>
        </Card>
      </section>

      <section className="graph-layout" style={{ marginTop: '24px' }}>
        <div className="graph-canvas-panel dark-mode">
          <div className="canvas-toolbar">
            <Badge status="DEFAULT">Canonical dependency view</Badge>
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
                  {(selectedNode.data as any).kind}
                </Badge>
                <p className="inspector-text" style={{ marginTop: '12px', color: 'var(--dark-muted)' }}>
                  This node represents a step in the deterministic state machine.
                </p>
              </div>
              
              {rules.filter(r => r.nodeId === selectedNode.id).length > 0 && (
                <>
                  <div className="inspector-block" style={{ marginBottom: '20px' }}>
                    <p className="eyebrow" style={{ color: 'var(--dark-muted)' }}>Rules enforced</p>
                    <ul className="rule-list" style={{ color: 'var(--dark-muted)', paddingLeft: '18px', fontSize: '13px', lineHeight: '1.5' }}>
                      {rules.filter(r => r.nodeId === selectedNode.id).map(rule => (
                        <li key={rule.id}>{rule.description}</li>
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
              )}
            </>
          ) : (
            <div style={{ color: 'var(--dark-muted)' }}>Select a node to inspect</div>
          )}
        </aside>
      </section>
    </PageContainer>
  );
}
