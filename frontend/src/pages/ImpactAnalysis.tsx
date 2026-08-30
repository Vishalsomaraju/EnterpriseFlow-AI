import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type { Node, Edge, NodeMouseHandler } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { PageContainer } from '../components/layout/PageContainer';
import { ImpactNode } from '../components/nodes/ImpactNode';
import type { ImpactNodeType } from '../components/nodes/ImpactNode';
import { WorkflowEdge } from '../components/edges/WorkflowEdge';
import { useWorkflowGraph, useImpactAnalysis } from '../hooks/queries';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import type { ImpactAnalysisResponse } from '../api/types';
import type { BadgeStatus } from '../components/Badge';

const WORKFLOW_ID = '0bc69865-15e0-4f30-af96-6227abee5e6c';
const RULE_ID = 'RULE-manager-approval';

const nodeTypes = { impactNode: ImpactNode };
const edgeTypes = { customEdge: WorkflowEdge };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function riskToBadgeStatus(level?: string): BadgeStatus {
  switch (level) {
    case 'CRITICAL': return 'DANGER';
    case 'HIGH': return 'DANGER';
    case 'MEDIUM': return 'WARNING';
    case 'LOW': return 'ACTIVE';
    default: return 'DEFAULT';
  }
}

function severityToVariant(severity: string): ImpactNodeType['data']['variant'] {
  switch (severity) {
    case 'CRITICAL': return 'danger';
    case 'HIGH': return 'danger';
    case 'MEDIUM': return 'warning';
    default: return 'info';
  }
}

/** Build ReactFlow nodes + edges from an ImpactAnalysisResponse. */
function buildGraphFromImpact(impact: ImpactAnalysisResponse): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Root node: the changed rule
  nodes.push({
    id: 'rule-root',
    type: 'impactNode',
    position: { x: 50, y: 200 },
    data: {
      label: 'RULE',
      title: impact.rule?.id ?? RULE_ID,
      description: impact.rule
        ? `${impact.rule.oldExpression} → ${impact.rule.newExpression}`
        : 'Rule analyzed',
      variant: impact.rule?.oldExpression !== impact.rule?.newExpression ? 'warning' : 'info',
    } satisfies ImpactNodeType['data'],
  });

  const directItems = impact.directImpact ?? [];
  const downstreamItems = impact.downstreamImpact ?? [];

  // Direct impact nodes
  directItems.forEach((comp, i) => {
    const id = `direct-${i}`;
    nodes.push({
      id,
      type: 'impactNode',
      position: { x: 380, y: 80 + i * 180 },
      data: {
        label: comp.type,
        title: comp.name,
        description: comp.reason,
        metrics: comp.severity,
        variant: severityToVariant(comp.severity),
      } satisfies ImpactNodeType['data'],
    });
    edges.push({ id: `e-root-${id}`, source: 'rule-root', target: id, type: 'customEdge' });
  });

  // Downstream impact nodes
  downstreamItems.forEach((comp, i) => {
    const id = `downstream-${i}`;
    // Attach downstream to the last direct-impact node or to the root
    const parentId = directItems.length > 0 ? `direct-${directItems.length - 1}` : 'rule-root';
    nodes.push({
      id,
      type: 'impactNode',
      position: { x: 710, y: 80 + i * 180 },
      data: {
        label: comp.type,
        title: comp.name,
        description: comp.reason,
        metrics: comp.severity,
        variant: severityToVariant(comp.severity),
      } satisfies ImpactNodeType['data'],
    });
    edges.push({ id: `e-down-${id}`, source: parentId, target: id, type: 'customEdge' });
  });

  // If there is nothing to show, add a placeholder node
  if (nodes.length === 1) {
    nodes.push({
      id: 'no-deps',
      type: 'impactNode',
      position: { x: 380, y: 200 },
      data: {
        label: 'INFO',
        title: 'No dependencies found',
        description: 'No workflow nodes, files, or tests are registered as dependents of this rule.',
        variant: 'info',
      } satisfies ImpactNodeType['data'],
    });
    edges.push({ id: 'e-root-no-deps', source: 'rule-root', target: 'no-deps', type: 'customEdge' });
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ImpactAnalysisPage() {
  // Load the workflow graph so we can show the current rule expression
  const { data: graph, isLoading: graphLoading, error: graphError } = useWorkflowGraph(WORKFLOW_ID);

  // The expression that the user is currently typing (draft)
  const [draftExpression, setDraftExpression] = useState('');

  // The expression that was submitted for analysis (only set when user clicks Analyze)
  const [submittedExpression, setSubmittedExpression] = useState<string | undefined>(undefined);

  const currentRule = graph?.rules?.find(r => r.id === RULE_ID);

  // Pre-populate the draft with the current rule's condition once when it loads.
  // Uses an initialised flag via functional state update to avoid a second render.
  useEffect(() => {
    if (currentRule?.condition) {
      setDraftExpression(prev => (prev === '' ? currentRule.condition! : prev));
    }
  }, [currentRule?.condition]);

  // The impact query — only fires when submittedExpression has a value
  const {
    data: impact,
    isLoading: impactLoading,
    error: impactError,
  } = useImpactAnalysis(RULE_ID, submittedExpression);

  // ReactFlow state — rebuilt whenever impact data changes
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [selectedNodeData, setSelectedNodeData] = useState<ImpactNodeType['data'] | null>(null);

  useEffect(() => {
    if (!impact) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const graphData = buildGraphFromImpact(impact);
    setNodes(graphData.nodes);
    setEdges(graphData.edges);
    setSelectedNodeData(null);
  }, [impact, setNodes, setEdges, setSelectedNodeData]);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeData(node.data as ImpactNodeType['data']);
  }, [setSelectedNodeData]);

  const handleAnalyze = useCallback(() => {
    const trimmed = draftExpression.trim();
    if (!trimmed) return;
    setSubmittedExpression(trimmed);
    setSelectedNodeData(null);
  }, [draftExpression, setSelectedNodeData]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  if (graphLoading) {
    return (
      <PageContainer variant="full">
        <PageHeader eyebrow="Impact Analysis" title="Rule Impact Analyzer" />
        <LoadingState message="Loading rule data..." />
      </PageContainer>
    );
  }

  if (graphError) {
    return (
      <PageContainer variant="full">
        <PageHeader eyebrow="Impact Analysis" title="Rule Impact Analyzer" />
        <ErrorState error={graphError} message="Failed to load workflow rule data." />
      </PageContainer>
    );
  }

  const isChanged = impact && impact.rule
    ? impact.rule.oldExpression !== impact.rule.newExpression
    : false;

  const trimmedDraft = draftExpression.trim();
  const canAnalyze = trimmedDraft.length > 0;

  return (
    <PageContainer variant="full">
      <PageHeader
        eyebrow="Impact Analysis"
        title="Rule Impact Analyzer"
        actions={
          <Link to={`/app/workflows/${WORKFLOW_ID}/graph`}>
            <Button variant="secondary">Back to graph</Button>
          </Link>
        }
      />

      {/* ── Expression editor ─────────────────────────────────────────── */}
      <section style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'end' }}>
            {/* Current expression */}
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Current rule · {RULE_ID}
              </label>
              <div
                data-testid="current-expression"
                style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  padding: '10px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--muted)',
                  minHeight: '40px',
                }}
              >
                {currentRule?.condition ?? <em>Not found</em>}
              </div>
            </div>

            {/* Proposed expression */}
            <div>
              <label
                htmlFor="proposed-expression"
                style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Proposed expression
              </label>
              <input
                id="proposed-expression"
                data-testid="proposed-expression-input"
                type="text"
                value={draftExpression}
                onChange={e => setDraftExpression(e.target.value)}
                placeholder="e.g. amount < 500000"
                style={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  padding: '10px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text)',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              variant="primary"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              data-testid="analyze-button"
            >
              Analyze Impact
            </Button>
            {!canAnalyze && (
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Enter a proposed expression to analyze its impact.
              </span>
            )}
          </div>
        </Card>
      </section>

      {/* ── Impact result area ────────────────────────────────────────── */}
      {submittedExpression && (
        <section style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {impactLoading && <LoadingState message="Calculating change impact..." />}

          {!impactLoading && impactError && (
            <ErrorState error={impactError} message="Impact analysis request failed." />
          )}

          {!impactLoading && !impactError && impact && (
            <>
              {/* Summary bar */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Card style={{ flex: 1, minWidth: '200px' }}>
                  <p className="eyebrow">Rule</p>
                  <div style={{ fontFamily: 'monospace', fontSize: '13px', marginTop: '4px', color: 'var(--muted)' }} data-testid="summary-rule-id">
                    {impact.rule?.id}
                  </div>
                  {isChanged ? (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text)', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        data-testid="old-expression"
                      >
                        {impact.rule?.oldExpression}
                      </span>
                      <span style={{ color: 'var(--muted)' }}>→</span>
                      <span
                        style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--accent)', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--accent)' }}
                        data-testid="new-expression"
                      >
                        {impact.rule?.newExpression}
                      </span>
                    </div>
                  ) : (
                    <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--muted)' }} data-testid="unchanged-notice">
                      No change from current expression.
                    </div>
                  )}
                </Card>

                <Card style={{ minWidth: '180px' }}>
                  <p className="eyebrow">Risk</p>
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Badge status={riskToBadgeStatus(impact.risk?.level)} data-testid="risk-badge">
                      {impact.risk?.level ?? 'UNKNOWN'}
                    </Badge>
                    <span style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }} data-testid="risk-reason">
                      {impact.risk?.reason}
                    </span>
                  </div>
                </Card>

                <Card style={{ flex: 2, minWidth: '260px' }}>
                  <p className="eyebrow">Affected components</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {impact.affected_nodes.map(n => (
                      <span key={n} className="pill" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>{n}</span>
                    ))}
                    {impact.affected_files.map(f => (
                      <span key={f} className="pill" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>{f}</span>
                    ))}
                    {impact.affected_tests.map(t => (
                      <span key={t} className="pill" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>{t}</span>
                    ))}
                    {impact.affected_docs.map(d => (
                      <span key={d} className="pill" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>{d}</span>
                    ))}
                    {impact.affected_nodes.length === 0 &&
                      impact.affected_files.length === 0 &&
                      impact.affected_tests.length === 0 &&
                      impact.affected_docs.length === 0 && (
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>No registered dependencies found.</span>
                      )}
                  </div>
                </Card>
              </div>

              {/* Evaluation result */}
              {impact.evaluation && (
                <Card>
                  <p className="eyebrow">Before / After evaluation</p>
                  <div style={{ display: 'flex', gap: '24px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Input</span>
                      <code style={{ fontSize: '13px' }} data-testid="eval-input">{JSON.stringify(impact.evaluation.input)}</code>
                    </div>
                    {impact.evaluation.before != null && (
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Before</span>
                        <code style={{ fontSize: '13px' }} data-testid="eval-before">{impact.evaluation.before}</code>
                      </div>
                    )}
                    {impact.evaluation.after != null && (
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>After</span>
                        <code style={{ fontSize: '13px' }} data-testid="eval-after">{impact.evaluation.after}</code>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Semantic Business Impact */}
              {impact.semantic && (
                <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <Card style={{ borderLeft: '4px solid var(--accent)' }}>
                    <p className="eyebrow" style={{ color: 'var(--accent)' }}>Business Impact</p>
                    <div style={{ marginTop: '12px', fontSize: '14px', lineHeight: 1.6, color: 'var(--text)' }} data-testid="semantic-business-impact">
                      {impact.semantic.businessImpact}
                    </div>
                    
                    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: 'var(--bg)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Old Threshold</span>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                          {(() => {
                            const isCurrency = impact.rule?.oldExpression.toLowerCase().includes('amount');
                            const v = impact.semantic?.oldThreshold;
                            if (v == null) return '';
                            return isCurrency ? v.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : v;
                          })()}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>New Threshold</span>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                          {(() => {
                            const isCurrency = impact.rule?.oldExpression.toLowerCase().includes('amount');
                            const v = impact.semantic?.newThreshold;
                            if (v == null) return '';
                            return isCurrency ? v.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : v;
                          })()}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Delta</span>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: impact.semantic.delta && impact.semantic.delta > 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {(() => {
                            const delta = impact.semantic?.delta ?? 0;
                            const isCurrency = impact.rule?.oldExpression.toLowerCase().includes('amount');
                            const formatted = isCurrency ? Math.abs(delta).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : Math.abs(delta);
                            return delta > 0 ? `+${formatted}` : `-${formatted}`;
                          })()}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Affected Range</span>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                          {impact.semantic.affectedRange}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <p className="eyebrow">Reviewer Recommendations</p>
                    <ul style={{ paddingLeft: '20px', margin: '12px 0 0 20px', color: 'var(--text)', fontSize: '14px', lineHeight: 1.5 }} data-testid="semantic-reviewer-checks">
                      {impact.semantic.reviewerChecks.map((check, idx) => (
                        <li key={idx} style={{ marginBottom: '8px' }}>{check}</li>
                      ))}
                    </ul>
                  </Card>
                </section>
              )}

              {/* Propagation graph */}
              <section style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', height: '520px' }}>
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
                    minZoom={0.4}
                    maxZoom={1.5}
                  >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                    <Controls />
                  </ReactFlow>
                </div>

                <Card>
                  {selectedNodeData ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Node Inspector</span>
                        <h3 style={{ fontSize: '18px', marginTop: '8px', color: 'var(--accent)', margin: 0 }}>{selectedNodeData.label}</h3>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Name</label>
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>{selectedNodeData.title}</div>
                        </div>
                        {selectedNodeData.metrics && (
                          <div>
                            <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Severity</label>
                            <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedNodeData.metrics}</div>
                          </div>
                        )}
                        <div>
                          <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Reason</label>
                          <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{selectedNodeData.description}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', fontSize: '14px', textAlign: 'center' }}>
                      Select a node in the graph<br />to view propagation impact
                    </div>
                  )}
                </Card>
              </section>
            </>
          )}
        </section>
      )}

      {/* Initial state — no expression submitted yet */}
      {!submittedExpression && (
        <div style={{ marginTop: '32px' }}>
          <EmptyState
            title="No analysis run yet"
            description="Enter a proposed rule expression above and click Analyze Impact to see how a change propagates through the system."
          />
        </div>
      )}
    </PageContainer>
  );
}
