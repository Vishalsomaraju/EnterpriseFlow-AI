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
import { LoadingState, ErrorState } from '../components/States';

export function BlueprintPage() {
  const { id = 'w_1043' } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [editingRule, setEditingRule] = useState(false);
  const [ruleAmount, setRuleAmount] = useState('5,00,000');
  const [ruleAction, setRuleAction] = useState('CFO Approval');
  const [ruleChanged, setRuleChanged] = useState(false);

  const { isLoading, error } = useWorkflowGraph(id);
  const { mutate: changeRule, isPending: isChangingRule } = useRuleChangeMutation(id);

  if (isLoading) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Automation Blueprint" title="Invoice Approval" />
        <LoadingState message="Loading blueprint rules..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer variant="wide">
        <PageHeader eyebrow="Automation Blueprint" title="Invoice Approval" />
        <ErrorState error={error} message="Failed to load blueprint rules." />
      </PageContainer>
    );
  }

  const handleSaveRule = () => {
    changeRule({ ruleId: 'R-001', updates: { amount: ruleAmount, action: ruleAction } }, {
      onSuccess: () => {
        setEditingRule(false);
        setRuleChanged(true);
      }
    });
  };

  const tabs = ['Overview', 'Workflow', 'Rules', 'Integrations', 'Approvals', 'Acceptance Criteria'];

  return (
    <PageContainer variant="wide">
      <PageHeader 
        eyebrow="Automation Blueprint" 
        title="Invoice Approval"
        actions={
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Badge status="COMPLETED">Ready for Engineering</Badge>
            <Button variant="secondary">Edit Blueprint</Button>
            <Link to="/app/workflows/w_1043/build">
              <Button>Send to Bob <ArrowRight size={16} style={{ marginLeft: '8px' }} /></Button>
            </Link>
          </div>
        }
      />

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', marginTop: '24px' }}>
        <div style={{ display: 'flex', gap: '32px' }}>
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
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        {activeTab === 'Overview' && (
          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <Card>
              <p className="eyebrow">Automated steps</p>
              <h3 style={{ margin: 0 }}>7 Nodes</h3>
            </Card>
            <Card>
              <p className="eyebrow">Human steps</p>
              <h3 style={{ margin: 0 }}>3 Checkpoints</h3>
            </Card>
            <Card>
              <p className="eyebrow">Integrations</p>
              <h3 style={{ margin: 0 }}>ERP, PO System, Mail Server</h3>
            </Card>
            <Card>
              <p className="eyebrow">Business rules</p>
              <h3 style={{ margin: 0 }}>2 Enforcement Policies</h3>
            </Card>
            <Card style={{ gridColumn: '1 / -1' }}>
              <p className="eyebrow">Acceptance criteria</p>
              <h3 style={{ fontSize: '15px', margin: 0, lineHeight: 1.5 }}>1. All invoices &gt; 5L route to CFO. <br/>2. Duplicate invoices must be rejected. <br/>3. PO mismatch requires Finance Manager review.</h3>
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
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Invoices above:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--muted)' }}>₹</span>
                        <input 
                          type="text" 
                          value={ruleAmount}
                          onChange={e => setRuleAmount(e.target.value)}
                          style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', width: '200px', background: 'var(--bg)', color: 'var(--text)' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>require:</label>
                      <select 
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
                    <Link to="/app/workflows/w_1043/impact">
                      <Button>View Impact</Button>
                    </Link>
                  </div>
                </Card>
              </div>
            )}
          </section>
        )}

        {/* Other Tabs placeholder */}
        {['Workflow', 'Integrations', 'Approvals', 'Acceptance Criteria'].includes(activeTab) && (
          <Card>
            <p className="eyebrow">{activeTab}</p>
            <p style={{ marginTop: '8px', color: 'var(--muted)', margin: 0 }}>Configured according to the canonical state machine.</p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
