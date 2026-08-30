import type { Project, WorkflowGraph, ImpactAnalysisResult, Build, BobActivityEvent, BobSubagent, CodeDiff, SecurityResult, TestRun, ReviewSummary } from '../types';

const MOCK_DELAY = 800;

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), MOCK_DELAY));
}

export const MockApi = {
  getDashboardStats: (): Promise<{ totalWorkflows: number, activeWorkflows: number, pendingTasks: number, bobChanges: number }> => {
    return delay({
      totalWorkflows: 12,
      activeWorkflows: 8,
      pendingTasks: 3,
      bobChanges: 1
    });
  },

  getActivity: (): Promise<Array<{ id: string, title: string, source: string, timestamp: string }>> => {
    return delay([
      { id: '1', title: 'Expense Policy extracted', source: 'System', timestamp: '3 hours ago' },
      { id: '2', title: 'Invoice Approval workflow deployed', source: 'Admin', timestamp: 'Yesterday' }
    ]);
  },

  changeRule: (_ruleId: string, _updates: any): Promise<void> => {
    return delay(undefined);
  },

  getWorkflowExecution: (_workflowId: string): Promise<any> => {
    return delay({
      id: 'INV-1043',
      amount: '8,10,000',
      status: 'Awaiting Approval',
      steps: [
        { name: 'Vendor Validated', status: 'success' },
        { name: 'Duplicate Detection Passed', status: 'success' },
        { name: 'PO Matching Passed', status: 'success' },
        { name: 'Amount < ₹10L Threshold Checked', status: 'success' },
        { name: 'Manager Approval Requested (Current Step)', status: 'current' },
        { name: 'ERP Integration Sync (Pending)', status: 'pending' },
      ],
      assignedTo: 'Finance Team',
      timeElapsed: '4 hours',
      history: [
        { event: 'Started', timestamp: 'Oct 24, 09:12 AM' },
        { event: 'Validation Complete', timestamp: 'Oct 24, 09:15 AM' },
        { event: 'Routed to Manager', timestamp: 'Oct 24, 09:16 AM' }
      ]
    });
  },

  getDocumentation: (_workflowId: string): Promise<any> => {
    return delay({
      endpoints: [
        { method: 'POST', path: '/api/v1/invoices/approve', desc: 'Routes an invoice to the correct final approver based on the dynamically configured threshold.', body: '{\n  "invoiceId": "string",\n  "amount": "number",\n  "vendorId": "string"\n}' }
      ],
      rules: [
        { condition: '< ₹10,00,000', action: 'Routes to Finance Manager.' },
        { condition: '>= ₹10,00,000', action: 'Routes to CFO.' }
      ]
    });
  },

  getProjects: (): Promise<Project[]> => {
    return delay([
      {
        id: 'p_1001',
        name: 'Invoice Automation',
        created_at: '2023-10-27T10:00:00Z',
      }
    ]);
  },

  getWorkflowGraph: (_id: string): Promise<WorkflowGraph> => {
    return delay({
      nodes: [
        { id: 'n1', label: 'Invoice Received', kind: 'Automated intake', type: 'automated', position: { x: 320, y: 0 } },
        { id: 'n2', label: 'Vendor Validation', kind: 'Automated validation', type: 'automated', position: { x: 320, y: 100 } },
        { id: 'n3', label: 'Duplicate Check', kind: 'Automated validation', type: 'automated', position: { x: 320, y: 200 } },
        { id: 'n4', label: 'Reject / Match PO', kind: 'Automated decision', type: 'automated', position: { x: 320, y: 300 } },
        { id: 'n5', label: 'Verify Amount', kind: 'Automated validation', type: 'automated', position: { x: 320, y: 400 } },
        { id: 'n6', label: 'Approval Router', kind: 'Human checkpoint', type: 'automated', position: { x: 320, y: 500 } },
        { id: 'n7', label: 'Manager Approval', kind: 'Human approval', type: 'human', position: { x: 180, y: 600 } },
        { id: 'n8', label: 'CFO Approval', kind: 'Human approval', type: 'human', position: { x: 460, y: 600 } },
        { id: 'n9', label: 'ERP Update', kind: 'Automated writeback', type: 'automated', position: { x: 320, y: 700 } },
        { id: 'n10', label: 'Audit Log', kind: 'Automated compliance', type: 'automated', position: { x: 320, y: 800 } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' },
        { id: 'e4', source: 'n4', target: 'n5' },
        { id: 'e5', source: 'n5', target: 'n6' },
        { id: 'e6', source: 'n6', target: 'n7', label: 'Under 10L', isBranch: true },
        { id: 'e7', source: 'n6', target: 'n8', label: '10L or above', isBranch: true },
        { id: 'e8', source: 'n7', target: 'n9' },
        { id: 'e9', source: 'n8', target: 'n9' },
        { id: 'e10', source: 'n9', target: 'n10' },
      ],
      rules: [
        { id: 'R-001', description: 'Amounts below ₹10,00,000 route to Finance Manager.', condition: 'amount < 1000000', action: 'MANAGER_APPROVAL', nodeId: 'n6' },
        { id: 'R-002', description: 'Amounts at or above ₹10,00,000 route to CFO.', condition: 'amount >= 1000000', action: 'CFO_APPROVAL', nodeId: 'n6' },
      ]
    });
  },

  analyzeRuleImpact: (_ruleId: string, _expression: string): Promise<ImpactAnalysisResult> => {
    return delay({
      affected_files: ['src/approval.service.ts', 'src/routing.ts', 'src/review-summary.ts'],
      affected_tests: ['tests/approval.test.ts', 'tests/routing.test.ts', 'tests/manager-route.test.ts', 'tests/cfo-route.test.ts', 'tests/regression.test.ts'],
      affected_nodes: ['n6', 'n7', 'n8'],
      affected_docs: ['docs/policies.md', 'docs/invoice-runbook.md']
    });
  },

  getBuildOverview: (_buildId: string): Promise<Build> => {
    return delay({
      id: 'b_9912',
      workflowId: 'w_1043',
      status: 'TESTING',
      stages: [
        { id: 's1', name: 'Blueprint Validated', status: 'COMPLETED' },
        { id: 's2', name: 'Bob Repository Analyzed', status: 'COMPLETED' },
        { id: 's3', name: 'Implementation Plan', status: 'COMPLETED' },
        { id: 's4', name: 'Implementation', status: 'COMPLETED' },
        { id: 's5', name: 'Security Validation', status: 'COMPLETED' },
        { id: 's6', name: 'Tests', status: 'ACTIVE' },
        { id: 's7', name: 'Documentation', status: 'PENDING' },
        { id: 's8', name: 'Ready for Human Review', status: 'PENDING' },
      ]
    });
  },

  getBobActivity: (_buildId: string): Promise<BobActivityEvent[]> => {
    return delay([
      { id: 'a1', timestamp: new Date(Date.now() - 60000).toISOString(), eventType: 'info', message: 'Cloning repository EnterpriseFlow-Demo', agent: 'Bob', status: 'done', source: 'bob-core' },
      { id: 'a2', timestamp: new Date(Date.now() - 45000).toISOString(), eventType: 'info', message: 'Analyzing project dependencies', agent: 'Bob', status: 'done', source: 'bob-core' },
      { id: 'a3', timestamp: new Date(Date.now() - 30000).toISOString(), eventType: 'success', message: 'Implementation plan generated', agent: 'PlannerAgent', status: 'done', source: 'subagent' },
      { id: 'a4', timestamp: new Date(Date.now() - 15000).toISOString(), eventType: 'info', message: 'Modifying src/approval.service.ts', agent: 'CoderAgent', status: 'done', source: 'subagent' },
      { id: 'a5', timestamp: new Date().toISOString(), eventType: 'log', message: 'Running test suite...', agent: 'TestAgent', status: 'running', source: 'subagent' },
    ]);
  },

  getBobSubagents: (_buildId: string): Promise<BobSubagent[]> => {
    return delay([
      { id: 'sa1', name: 'PlannerAgent', task: 'Map blueprint to source files', status: 'COMPLETED', result: '3 files identified for modification.' },
      { id: 'sa2', name: 'CoderAgent', task: 'Implement AST modifications', status: 'COMPLETED', result: 'approval.service.ts updated.' },
      { id: 'sa3', name: 'SecurityAgent', task: 'Static analysis for elevated privileges', status: 'COMPLETED', result: 'No issues found.' },
      { id: 'sa4', name: 'TestAgent', task: 'Run boundary and regression tests', status: 'RUNNING' }
    ]);
  },

  getCodeDiff: (_buildId: string): Promise<CodeDiff> => {
    return delay({
      files: [
        { path: 'src/approval.service.ts', additions: 1, deletions: 1, status: 'modified' },
        { path: 'tests/manager-route.test.ts', additions: 4, deletions: 0, status: 'modified' }
      ],
      patch: `@@ -42,7 +42,7 @@
 export function getApprovalRoute(amount: number) {
-  if (amount >= 500000) return 'CFO_APPROVAL';
+  if (amount >= 1000000) return 'CFO_APPROVAL';
   return 'MANAGER_APPROVAL';
 }`
    });
  },

  getSecurityResult: (_buildId: string): Promise<SecurityResult> => {
    return delay({
      status: 'PASS',
      critical: 0,
      high: 0,
      medium: 0,
      low: 1
    });
  },

  getTests: (_workflowId: string): Promise<TestRun[]> => {
    return delay([
      { id: 't1', name: 'Vendor validation suite', status: 'Passed', durationMs: 420 },
      { id: 't2', name: 'Duplicate detection bounds', status: 'Passed', durationMs: 110 },
      { id: 't3', name: 'PO matching integration', status: 'Passed', durationMs: 850 },
      { id: 't4', name: 'Manager approval routing (Amount < 10L)', status: 'Passed', durationMs: 34 },
      { id: 't5', name: 'CFO approval routing (Amount >= 10L)', status: 'Passed', durationMs: 29 },
      { id: 't6', name: 'Missing PO exception handling', status: 'Passed', durationMs: 50 },
      { id: 't7', name: 'Audit logging sink verification', status: 'Passed', durationMs: 120 }
    ]);
  },

  getReviewSummary: (_workflowId: string): Promise<ReviewSummary> => {
    return delay({
      filesChanged: 3,
      testsPassed: 27,
      testsFailed: 0,
      rulesChanged: 1,
      businessImpact: 'Approval routing boundary shifted from ₹5L to ₹10L. Projected to reduce CFO bottleneck by 34%, delegating 1,400 monthly invoices to Finance Managers.'
    });
  },

  approveReview: (_workflowId: string): Promise<boolean> => {
    return delay(true);
  },

  rejectReview: (_workflowId: string): Promise<boolean> => {
    return delay(true);
  }
};
