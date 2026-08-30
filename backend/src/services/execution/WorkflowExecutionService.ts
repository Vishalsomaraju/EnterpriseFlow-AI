import { db } from '../../db/index';
import { GraphValidator } from '../../domain/workflow-engine/GraphValidator';
import { RuleEvaluator } from '../../domain/workflow-engine/RuleEvaluator';
import { WorkflowExecutionInput } from '../../domain/workflow-engine/ExecutionInputSchema';
import { randomUUID } from 'crypto';

export class WorkflowExecutionService {
  async execute(jobId: string, executionId: string, workflowId: string, versionId: string, inputSnapshot: WorkflowExecutionInput, _idempotencyKey: string) {
    try {
      const nodes = await db.selectFrom('workflow_nodes').where('version_id', '=', versionId).selectAll().execute();
      const edges = await db.selectFrom('workflow_edges').where('version_id', '=', versionId).selectAll().execute();
      const rules = await db.selectFrom('business_rules').where('version_id', '=', versionId).selectAll().execute();
      const normalizedNodes = nodes.map(node => ({ id: node.id, label: node.name, type: node.type, automated: node.kind === 'automated' }));
      const normalizedEdges = edges.map(edge => ({
        id: edge.id, sourceId: edge.source_id, targetId: edge.target_id,
        condition: edge.label || undefined, type: edge.is_branch ? 'BRANCH' as const : 'DEFAULT' as const
      }));
      const validation = GraphValidator.validate(normalizedNodes, normalizedEdges);
      if (!validation.isValid) throw new Error(`Invalid workflow graph: ${validation.errors.join('; ')}`);

      const incoming = new Set(edges.map(edge => edge.target_id));
      let currentNode = nodes.find(node => node.type.toUpperCase() === 'TRIGGER') || nodes.find(node => !incoming.has(node.id));
      if (!currentNode) throw new Error('Graph has no start node');

      await db.updateTable('workflow_executions').set({ status: 'RUNNING' }).where('id', '=', executionId).execute();
      await this.logGlobalEvent(executionId, versionId, 'Workflow Execution Started', `Started execution ${executionId}`, 'WORKFLOW_EXECUTION_STARTED');

      let currentStatus = 'RUNNING';
      const visited = new Set<string>();
      while (currentNode && currentStatus === 'RUNNING') {
        if (visited.has(currentNode.id)) throw new Error(`Workflow traversal revisited node ${currentNode.id}`);
        visited.add(currentNode.id);
        const nodeId: string = currentNode.id;
        const outgoingEdges: typeof edges = edges.filter(edge => edge.source_id === nodeId);
        const nodeRules = rules.filter(rule => rule.node_id === nodeId);
        let decision: unknown = null;
        let nextNodeId: string | null = null;
        let nodeStatus = 'COMPLETED';
        let failureReason: string | null = null;

        if (nodeRules.length > 0) {
          const evaluated = nodeRules.map(rule => ({ rule, result: RuleEvaluator.evaluate(rule.condition, inputSnapshot) }));
          const matched = evaluated.find(item => item.result.matched);
          if (!matched) {
            nodeStatus = 'FAILED';
            currentStatus = 'FAILED';
            const ruleDescriptions = nodeRules.map(r => r.name || r.description || r.condition).join(', ');
            failureReason = `Node ${currentNode.name} validation failed: ${ruleDescriptions}`;
          } else {
            decision = { ruleId: matched.rule.id, condition: matched.rule.condition, result: matched.result };
            const actionTarget = matched.rule.action?.match(/["']([^"']+)["']/)?.[1]?.toLowerCase();
            const targetEdge: (typeof edges)[number] | undefined = outgoingEdges.find(edge =>
              edge.label && (edge.label.toLowerCase() === matched.rule.condition.toLowerCase() ||
                Boolean(actionTarget && edge.label.toLowerCase().includes(actionTarget)))
            );
            if (targetEdge) nextNodeId = targetEdge.target_id;
            else if (outgoingEdges.length === 1) nextNodeId = outgoingEdges[0].target_id;
            else {
              nodeStatus = 'FAILED';
              currentStatus = 'FAILED';
              failureReason = `No edge matches rule ${matched.rule.id}`;
            }
          }
        } else if (outgoingEdges.length === 1) {
          nextNodeId = outgoingEdges[0].target_id;
        } else if (outgoingEdges.length > 1) {
          const defaultEdge = outgoingEdges.find(edge => !edge.is_branch && !edge.label);
          if (defaultEdge) nextNodeId = defaultEdge.target_id;
          else {
            nodeStatus = 'FAILED';
            currentStatus = 'FAILED';
            failureReason = 'Branching node has no matching rule';
          }
        }

        await db.insertInto('workflow_execution_history').values({
          id: randomUUID(), execution_id: executionId, event: currentNode.name,
          metadata: { nodeId, nodeName: currentNode.name, status: nodeStatus, input: inputSnapshot, decision, nextNodeId, failureReason }
        }).execute();

        if (currentStatus === 'FAILED') {
          await db.updateTable('workflow_executions').set({ status: 'FAILED', completed_at: new Date(), failure_reason: failureReason }).where('id', '=', executionId).execute();
          await this.logGlobalEvent(executionId, versionId, 'Workflow Execution Failed', `Failed at ${currentNode.name}: ${failureReason}`, 'WORKFLOW_EXECUTION_FAILED');
          break;
        }
        if (!nextNodeId) {
          currentStatus = 'COMPLETED';
          await db.updateTable('workflow_executions').set({ status: 'COMPLETED', completed_at: new Date() }).where('id', '=', executionId).execute();
          await this.logGlobalEvent(executionId, versionId, 'Workflow Execution Completed', 'Completed successfully', 'WORKFLOW_EXECUTION_COMPLETED');
          break;
        }
        currentNode = nodes.find(node => node.id === nextNodeId);
        if (!currentNode) throw new Error(`Workflow edge targets missing node ${nextNodeId}`);
      }
      await db.updateTable('jobs').set({ status: currentStatus }).where('id', '=', jobId).execute();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await db.updateTable('workflow_executions').set({ status: 'FAILED', completed_at: new Date(), failure_reason: message }).where('id', '=', executionId).execute();
      await db.updateTable('jobs').set({ status: 'FAILED' }).where('id', '=', jobId).execute();
      await this.logGlobalEvent(executionId, versionId, 'Workflow Execution Error', message, 'WORKFLOW_EXECUTION_ERROR');
    }
  }

  private async logGlobalEvent(executionId: string, versionId: string, title: string, message: string, eventType: string) {
    await db.insertInto('activity_events').values({
      id: `act_${randomUUID()}`, title, message, source: 'SYSTEM', event_type: eventType, status: 'SUCCESS',
      actor: 'System', entity_type: 'WORKFLOW_EXECUTION', entity_id: executionId, workflow_version: versionId, metadata: { executionId }
    }).execute();
  }
}

export const workflowExecutionService = new WorkflowExecutionService();
