import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageContainer } from '../components/layout/PageContainer';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { useWorkflowGraph } from '../hooks/queries';
import { useRuleChangeMutation } from '../hooks/mutations';
import { SkeletonMetrics, SkeletonCard, ErrorState } from '../components/States';

export function BlueprintPage() {
  const { id = '0bc69865-15e0-4f30-af96-6227abee5e6c' } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [editingRule, setEditingRule] = useState(false);
  const [ruleAmount, setRuleAmount] = useState('10,00,000');
  const [ruleAction, setRuleAction] = useState('CFO Approval');
  const [ruleChanged, setRuleChanged] = useState(false);

  const { data: graph, isLoading, error, refetch } = useWorkflowGraph(id);
  const { mutate: changeRule, isPending: isChangingRule } = useRuleChangeMutation(id);

  if (isLoading) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Automation Blueprint" title="Blueprint Specification" />
        <SkeletonMetrics count={4} />
        <div style={{ marginTop: '24px' }}>
          <SkeletonCard height="240px" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Automation Blueprint" title="Blueprint Specification" />
        <div style={{ marginTop: '24px' }}>
          <ErrorState 
            error={error} 
            message="Failed to load blueprint specification from database." 
            onRetry={() => refetch()}
            workflowId={id}
          />
        </div>
      </PageContainer>
    );
  }

  const nodes = graph?.nodes || [];
  const rules = graph?.rules || [];
  const automatedSteps = nodes.filter(n => n.type === 'automated' || n.kind?.toLowerCase().includes('task') || n.kind?.toLowerCase().includes('trigger')).length;
  const humanSteps = nodes.filter(n => n.type === 'human' || n.kind?.toLowerCase().includes('human')).length;

  const handleSaveRule = () => {
    const amount = Number(ruleAmount.replace(/,/g, ''));
    const rule = rules.find((candidate) => candidate.action?.includes('CFO')) || rules[0];
    if (!rule || !Number.isFinite(amount) || amount <= 0) return;

    changeRule({ ruleId: rule.id, updates: { baseVersion: 1, expression: `amount >= ${amount}` } }, {
      onSuccess: () => {
        setEditingRule(false);
        setRuleChanged(true);
      }
    });
  };

  const tabs = ['Overview', 'Workflow', 'Rules', 'Integrations', 'Acceptance Criteria'];

  return (
    <PageContainer variant="wide">
      <PageHeader 
        eyebrow="Automation Blueprint" 
        title="Blueprint Specification"
        actions={
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Badge status="COMPLETED">Ready for Engineering</Badge>
            <Link to={`/app/workflows/${id}/build`}>
              <Button>Send to Bob <ArrowRight size={16} style={{ marginLeft: '8px' }} /></Button>
            </Link>
          </div>
        }
      />

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', marginTop: '24px' }}>
        <div style={{ display: 'flex', gap: '32px', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                padding: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: 600,
                color: activeTab === tab ? 'var(--text)' : 'var(--muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        {activeTab === 'Overview' && (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <Card>
              <p className="eyebrow">Automated steps</p>
              <h3 style={{ fontSize: '28px', margin: '4px 0' }}>{automatedSteps}</h3>
              <small style={{ color: 'var(--muted)' }}>Nodes in the state machine</small>
            </Card>
            <Card>
              <p className="eyebrow">Human steps</p>
              <h3 style={{ fontSize: '28px', margin: '4px 0' }}>{humanSteps}</h3>
              <small style={{ color: 'var(--muted)' }}>Governance checkpoints</small>
            </Card>
            <Card>
              <p className="eyebrow">Integrations</p>
              <h3 style={{ fontSize: '28px', margin: '4px 0' }}>3</h3>
              <small style={{ color: 'var(--muted)' }}>ERP, PO System, Mail Server</small>
            </Card>
            <Card>
              <p className="eyebrow">Business rules</p>
              <h3 style={{ fontSize: '28px', margin: '4px 0', color: rules.length > 0 ? 'var(--accent)' : 'var(--muted)' }}>{rules.length}</h3>
              <small style={{ color: 'var(--muted)' }}>Enforcement policies active</small>
            </Card>
            <Card style={{ gridColumn: '1 / -1' }}>
              <p className="eyebrow">Acceptance criteria</p>
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {rules.length > 0 ? (
                  rules.map((r, idx) => (
                    <p key={r.id} style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                      {idx + 1}. Rule ({r.id}): {r.description || `When ${r.condition} then ${r.action}`}
                    </p>
                  ))
                ) : (
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
                    Workflow executes deterministically from intake trigger to terminal audit state.
                  </p>
                )}
              </div>
            </Card>
          </section>
        )}

        {activeTab === 'Rules' && (
          <section>
            {!editingRule && !ruleChanged ? (
              <div style={{ maxWidth: '600px' }}>
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', margin: 0 }}>Approval Threshold</h3>
                      <p style={{ marginTop: '8px', color: 'var(--muted)', marginBottom: 0 }}>
                        Invoices above <strong style={{ color: 'var(--text)' }}>₹{ruleAmount}</strong> require <strong style={{ color: 'var(--text)' }}>{ruleAction}</strong>
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setEditingRule(true)}>Edit Rule</Button>
                  </div>
                </Card>
              </div>
            ) : editingRule ? (
              <div style={{ maxWidth: '600px' }}>
                <Card style={{ border: '1px solid var(--accent)' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '16px', margin: 0 }}>Edit Business Rule — Approval Threshold</h3>
                  <div style={{ display: 'grid', gap: '16px', marginBottom: '24px', marginTop: '16px' }}>
                    <div>
                      <label htmlFor="rule-amount-input" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Invoices above:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--muted)' }}>₹</span>
                        <input 
                          id="rule-amount-input"
                          type="text" 
                          value={ruleAmount}
                          onChange={e => setRuleAmount(e.target.value)}
                          style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', width: '200px', background: 'var(--bg)', color: 'var(--text)' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="rule-action-select" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>require:</label>
                      <select 
                        id="rule-action-select"
                        value={ruleAction}
                        onChange={e => setRuleAction(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', width: '200px', background: 'var(--surface)', color: 'var(--text)' }}
                      >
                        <option>Finance Manager Approval</option>
                        <option>CFO Approval</option>
                        <option>CEO Approval</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="ghost" onClick={() => setEditingRule(false)}>Cancel</Button>
                    <Button disabled={isChangingRule} onClick={handleSaveRule}>
                      {isChangingRule ? 'Saving...' : 'Save Change'}
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <div style={{ maxWidth: '600px' }}>
                <Card style={{ border: '1px solid var(--warning)', background: 'var(--warning-tint)' }}>
                  <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', margin: 0 }}>
                    <AlertTriangle size={18} /> Rule Change Detected
                  </h3>
                  <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text)', marginBottom: 0 }}>
                    The approval threshold was updated to <strong>₹{ruleAmount}</strong>. This is a core capability change that propagates through the system.
                  </p>
                  <div style={{ marginTop: '16px', padding: '16px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <strong style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text)' }}>This change affects:</strong>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>Approval Router</li>
                      <li>Approval Service</li>
                      <li>Tests</li>
                      <li>API documentation</li>
                    </ul>
                  </div>
                  <div style={{ marginTop: '24px' }}>
                    <Link to={`/app/workflows/${id}/impact`}>
                      <Button>View Impact</Button>
                    </Link>
                  </div>
                </Card>
              </div>
            )}
          </section>
        )}

        {activeTab === 'Workflow' && (
          <Card>
            <p className="eyebrow">Canonical Nodes</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {nodes.map(n => (
                <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <strong>{n.label}</strong>
                    <small style={{ color: 'var(--muted)', display: 'block' }}>ID: {n.id}</small>
                  </div>
                  <Badge status={n.type === 'human' ? 'WARNING' : 'COMPLETED'}>{n.kind || n.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'Integrations' && (
          <Card>
            <p className="eyebrow">System Connections</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
              <Badge status="DEFAULT">Email Notifications (SMTP)</Badge>
              <Badge status="DEFAULT">Purchase Order System</Badge>
              <Badge status="DEFAULT">Enterprise ERP</Badge>
            </div>
          </Card>
        )}

        {activeTab === 'Acceptance Criteria' && (
          <Card>
            <p className="eyebrow">Validation Criteria</p>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rules.map((r, idx) => (
                <p key={r.id} style={{ margin: 0, fontSize: '14px' }}>
                  {idx + 1}. {r.description || `When ${r.condition} then ${r.action}`}
                </p>
              ))}
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
