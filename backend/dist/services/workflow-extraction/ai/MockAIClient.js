"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockAIClient = void 0;
class MockAIClient {
    async extractWorkflow(input) {
        // Simulate network delay for AI processing
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // Handle different testing scenarios via the input scenario flag
        if (input.scenario === 'malformed') {
            return {
                // Missing workflow name, duplicate node IDs
                steps: [
                    { id: 'duplicate-1', name: 'Step 1' },
                    { id: 'duplicate-1', name: 'Step 2' },
                ],
            };
        }
        if (input.scenario === 'circular') {
            return {
                name: 'Circular Workflow',
                actors: ['Employee'],
                systems: ['System A'],
                steps: [
                    { id: 'NODE-1', name: 'Node 1', type: 'SYSTEM_TASK' },
                    { id: 'NODE-2', name: 'Node 2', type: 'SYSTEM_TASK' },
                ],
                rules: [
                    {
                        id: 'RULE-1',
                        name: 'Go to 2',
                        expression: 'true',
                        source_node_id: 'NODE-1',
                        target_node_id: 'NODE-2',
                    },
                    {
                        id: 'RULE-2',
                        name: 'Go to 1',
                        expression: 'true',
                        source_node_id: 'NODE-2',
                        target_node_id: 'NODE-1',
                    },
                ]
            };
        }
        if (input.scenario === 'orphan') {
            return {
                name: 'Orphan Workflow',
                actors: ['Employee'],
                systems: ['System A'],
                steps: [
                    { id: 'NODE-1', name: 'Node 1', type: 'SYSTEM_TASK' },
                    { id: 'NODE-2', name: 'Node 2', type: 'SYSTEM_TASK' },
                ],
                rules: [
                    {
                        id: 'RULE-1',
                        name: 'Only node 1',
                        expression: 'true',
                        source_node_id: 'NODE-1',
                        target_node_id: 'NODE-1',
                    }
                ]
            };
        }
        // Default: The canonical invoice approval demo (successful extraction)
        const canonicalInvoiceOutput = {
            name: 'Invoice Approval',
            actors: ['Employee', 'Finance Manager', 'CFO'],
            systems: ['Email', 'PO System', 'ERP'],
            steps: [
                { id: 'NODE-invoice-received', name: 'Invoice Received', type: 'TRIGGER' },
                { id: 'NODE-vendor-validation', name: 'Vendor Validation', type: 'SYSTEM_TASK' },
                { id: 'NODE-duplicate-check', name: 'Duplicate Check', type: 'SYSTEM_TASK' },
                { id: 'NODE-po-matching', name: 'PO Matching', type: 'SYSTEM_TASK' },
                { id: 'NODE-approval-routing', name: 'Approval Routing', type: 'HUMAN_TASK' },
                { id: 'NODE-erp-update', name: 'ERP Update', type: 'SYSTEM_TASK' },
                { id: 'NODE-audit-log', name: 'Audit Log', type: 'SYSTEM_TASK' },
            ],
            decisions: [
                { id: 'NODE-amount-verification', name: 'Amount Verification', conditions: ['amount < 500000', 'amount >= 500000'] },
            ],
            rules: [
                { id: 'RULE-1', name: 'Proceed to vendor validation', expression: 'always', source_node_id: 'NODE-invoice-received', target_node_id: 'NODE-vendor-validation' },
                { id: 'RULE-2', name: 'Proceed to duplicate check', expression: 'always', source_node_id: 'NODE-vendor-validation', target_node_id: 'NODE-duplicate-check' },
                { id: 'RULE-3', name: 'Proceed to PO matching', expression: 'always', source_node_id: 'NODE-duplicate-check', target_node_id: 'NODE-po-matching' },
                { id: 'RULE-4', name: 'Proceed to Amount verification', expression: 'always', source_node_id: 'NODE-po-matching', target_node_id: 'NODE-amount-verification' },
                { id: 'RULE-5', name: 'Manager Approval Rule', expression: 'amount < 500000', source_node_id: 'NODE-amount-verification', decision_node_id: 'NODE-amount-verification', target_node_id: 'NODE-approval-routing' },
                { id: 'RULE-6', name: 'CFO Approval Rule', expression: 'amount >= 500000', source_node_id: 'NODE-amount-verification', decision_node_id: 'NODE-amount-verification', target_node_id: 'NODE-approval-routing' },
                { id: 'RULE-7', name: 'Proceed to ERP update', expression: 'always', source_node_id: 'NODE-approval-routing', target_node_id: 'NODE-erp-update' },
                { id: 'RULE-8', name: 'Proceed to Audit Log', expression: 'always', source_node_id: 'NODE-erp-update', target_node_id: 'NODE-audit-log' },
            ],
            integrations: ['vendor_api', 'purchase_order_api', 'erp_api'],
            requirements: ['Duplicate invoices rejected', 'Unmatched PO requires manual review', 'Threshold requires CFO approval'],
            bottlenecks: [],
            acceptance_criteria: ['All approved invoices must be synced to ERP'],
        };
        return canonicalInvoiceOutput;
    }
}
exports.MockAIClient = MockAIClient;
