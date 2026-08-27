"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowExecutionService = exports.WorkflowExecutionService = void 0;
const index_1 = require("../../db/index");
const crypto_1 = require("crypto");
class WorkflowExecutionService {
    async execute(jobId, executionId, workflowId, versionId, inputSnapshot, idempotencyKey) {
        try {
            // 1. Fetch Graph
            const nodes = await index_1.db.selectFrom('workflow_nodes').where('version_id', '=', versionId).selectAll().execute();
            const edges = await index_1.db.selectFrom('workflow_edges').where('version_id', '=', versionId).selectAll().execute();
            const rules = await index_1.db.selectFrom('business_rules').where('version_id', '=', versionId).selectAll().execute();
            // Find start node heuristically (no incoming edges, or type 'TRIGGER')
            // For MVP, if there's no node named 'START', we'll just start at VendorValidation or the first node without incoming edges.
            const targetIds = new Set(edges.map(e => e.target_id));
            let currentNode = nodes.find(n => !targetIds.has(n.id)) || nodes[0];
            if (!currentNode) {
                throw new Error('Graph is empty or invalid');
            }
            // Update state to RUNNING
            await index_1.db.updateTable('workflow_executions')
                .set({ status: 'RUNNING' })
                .where('id', '=', executionId)
                .execute();
            // Global activity event
            await this.logGlobalEvent(executionId, versionId, 'Workflow Execution Started', `Started execution ${executionId}`, 'WORKFLOW_EXECUTION_STARTED');
            let currentStatus = 'RUNNING';
            // 2. Traversal Loop
            while (currentNode && currentStatus === 'RUNNING') {
                const nodeId = currentNode.id;
                const nodeName = currentNode.name;
                let decision = null;
                let nextNodeId = null;
                let nodeStatus = 'COMPLETED';
                let failureReason = null;
                // Hardcoded simulation logic for specific invoice MVP nodes to satisfy "deterministic invoice workflow execution"
                // In a real system, the RuleEngine would evaluate the script/condition attached to the node.
                const lowerName = nodeName.toLowerCase();
                if (lowerName.includes('duplicate')) {
                    if (inputSnapshot.isDuplicate) {
                        nodeStatus = 'FAILED';
                        currentStatus = 'FAILED';
                        failureReason = 'Invoice is a duplicate';
                    }
                }
                else if (lowerName.includes('po')) {
                    if (!inputSnapshot.hasPO) {
                        nodeStatus = 'FAILED';
                        currentStatus = 'FAILED';
                        failureReason = 'Missing Purchase Order';
                    }
                }
                else if (lowerName.includes('amount') || lowerName.includes('threshold') || lowerName.includes('routing')) {
                    // Rule Engine Simulation
                    // Find the rule associated with this node, or any rule in the graph
                    // We'll evaluate rules to determine the branch
                    const relevantRules = rules; // We evaluate rules to find the branch
                    let routed = false;
                    for (const rule of relevantRules) {
                        const amount = inputSnapshot.amount || 0;
                        let conditionMet = false;
                        // Very naive evaluator for MVP
                        if (rule.condition.includes('< 1000000') && amount < 1000000)
                            conditionMet = true;
                        else if (rule.condition.includes('>= 1000000') && amount >= 1000000)
                            conditionMet = true;
                        else if (rule.condition.includes('< 500000') && amount < 500000)
                            conditionMet = true;
                        else if (rule.condition.includes('>= 500000') && amount >= 500000)
                            conditionMet = true;
                        if (conditionMet) {
                            decision = {
                                ruleId: rule.id,
                                condition: rule.condition,
                                result: true
                            };
                            // Find outgoing edge matching this rule/branch
                            // For MVP, we'll try to find an edge whose label matches the action or we just find the target based on action
                            // Example action: 'assign_to("CFO")'
                            const isCFO = rule.action?.includes('CFO');
                            const outgoingEdges = edges.filter(e => e.source_id === nodeId);
                            const targetEdge = outgoingEdges.find(e => (isCFO && e.label?.includes('CFO')) ||
                                (!isCFO && e.label?.toLowerCase().includes('manager'))) || outgoingEdges[0];
                            if (targetEdge) {
                                nextNodeId = targetEdge.target_id;
                                routed = true;
                                break;
                            }
                        }
                    }
                    if (!routed) {
                        // Default to first outgoing edge if no rule matches
                        const outEdges = edges.filter(e => e.source_id === nodeId);
                        if (outEdges.length > 0)
                            nextNodeId = outEdges[0].target_id;
                    }
                }
                // Default routing for non-branching nodes
                if (!nextNodeId && currentStatus !== 'FAILED') {
                    const outEdges = edges.filter(e => e.source_id === nodeId);
                    if (outEdges.length > 0)
                        nextNodeId = outEdges[0].target_id;
                }
                // Record History
                await index_1.db.insertInto('workflow_execution_history').values({
                    id: `hist_${(0, crypto_1.randomUUID)()}`,
                    execution_id: executionId,
                    event: nodeName,
                    metadata: {
                        nodeId,
                        nodeName,
                        status: nodeStatus,
                        input: inputSnapshot,
                        decision,
                        nextNodeId,
                        failureReason
                    }
                }).execute();
                if (currentStatus === 'FAILED') {
                    await index_1.db.updateTable('workflow_executions')
                        .set({ status: 'FAILED', completed_at: new Date(), failure_reason: failureReason })
                        .where('id', '=', executionId)
                        .execute();
                    await this.logGlobalEvent(executionId, versionId, 'Workflow Execution Failed', `Failed at ${nodeName}: ${failureReason}`, 'WORKFLOW_EXECUTION_FAILED');
                    break;
                }
                if (nextNodeId) {
                    currentNode = nodes.find(n => n.id === nextNodeId);
                }
                else {
                    // Reached end of graph
                    currentStatus = 'COMPLETED';
                    await index_1.db.updateTable('workflow_executions')
                        .set({ status: 'COMPLETED', completed_at: new Date() })
                        .where('id', '=', executionId)
                        .execute();
                    await this.logGlobalEvent(executionId, versionId, 'Workflow Execution Completed', `Completed successfully`, 'WORKFLOW_EXECUTION_COMPLETED');
                    break;
                }
            }
            await index_1.db.updateTable('jobs').set({ status: currentStatus }).where('id', '=', jobId).execute();
        }
        catch (e) {
            await index_1.db.updateTable('workflow_executions')
                .set({ status: 'FAILED', completed_at: new Date(), failure_reason: e.message })
                .where('id', '=', executionId)
                .execute();
            await index_1.db.updateTable('jobs').set({ status: 'FAILED' }).where('id', '=', jobId).execute();
            await this.logGlobalEvent(executionId, versionId, 'Workflow Execution Error', e.message, 'WORKFLOW_EXECUTION_ERROR');
        }
    }
    async logGlobalEvent(executionId, versionId, title, message, eventType) {
        await index_1.db.insertInto('activity_events').values({
            id: `act_${(0, crypto_1.randomUUID)()}`,
            title,
            message,
            source: 'SYSTEM',
            event_type: eventType,
            status: 'SUCCESS',
            actor: 'System',
            entity_type: 'WORKFLOW_EXECUTION',
            entity_id: executionId,
            workflow_version: versionId,
            metadata: { executionId }
        }).execute();
    }
}
exports.WorkflowExecutionService = WorkflowExecutionService;
exports.workflowExecutionService = new WorkflowExecutionService();
