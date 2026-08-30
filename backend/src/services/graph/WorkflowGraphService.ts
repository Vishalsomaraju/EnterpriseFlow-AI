import { db } from '../../db/index';
import { GraphNormalizer } from '../../domain/workflow-engine/GraphNormalizer';
import { GraphValidator } from '../../domain/workflow-engine/GraphValidator';
import { WorkflowGraphDTO } from '../../domain/workflow-engine/types';

export class WorkflowGraphService {
  static async resolveWorkflowVersion(idOrProjectId: string) {
    // 1. Try finding version directly by workflow_id
    let version = await db
      .selectFrom('workflow_versions')
      .where('workflow_id', '=', idOrProjectId)
      .orderBy('version', 'desc')
      .selectAll()
      .executeTakeFirst();

    if (!version) {
      // 2. Try finding workflow where project_id = idOrProjectId or id = idOrProjectId
      const workflow = await db
        .selectFrom('workflows')
        .where((eb) => eb.or([
          eb('project_id', '=', idOrProjectId),
          eb('id', '=', idOrProjectId)
        ]))
        .orderBy('created_at', 'desc')
        .selectAll()
        .executeTakeFirst();

      if (workflow) {
        version = await db
          .selectFrom('workflow_versions')
          .where('workflow_id', '=', workflow.id)
          .orderBy('version', 'desc')
          .selectAll()
          .executeTakeFirst();
      }
    }

    if (!version) {
      // 3. Try finding version directly by version id
      version = await db
        .selectFrom('workflow_versions')
        .where('id', '=', idOrProjectId)
        .orderBy('version', 'desc')
        .selectAll()
        .executeTakeFirst();
    }

    return version;
  }

  static async getGraph(workflowId: string): Promise<WorkflowGraphDTO> {
    // 1. Get the active or latest version for this workflow or project ID
    const version = await this.resolveWorkflowVersion(workflowId);

    if (!version) {
      throw new Error(`Workflow version not found for workflow: ${workflowId}`);
    }

    const versionId = version.id;

    // 2. Query nodes, edges, rules from the database
    const dbNodes = await db
      .selectFrom('workflow_nodes')
      .select(['id', 'kind', 'type', 'name'])
      .where('version_id', '=', versionId)
      .execute();

    const dbEdges = await db
      .selectFrom('workflow_edges')
      .select(['id', 'source_id', 'target_id', 'label', 'is_branch'])
      .where('version_id', '=', versionId)
      .execute();

    const dbRules = await db
      .selectFrom('business_rules')
      .select(['id', 'name', 'description', 'condition', 'action', 'node_id'])
      .where('version_id', '=', versionId)
      .execute();

    // 3. Normalize to domain models
    const { nodes, edges, rules } = GraphNormalizer.normalize(
      dbNodes.map(n => ({ ...n, kind: n.kind || 'UNKNOWN', metadata: {} })), 
      dbEdges, 
      dbRules.map(r => ({ ...r, description: r.description || '', name: r.name || undefined, node_id: r.node_id || '' }))
    );

    // 4. Validate graph integrity
    const validation = GraphValidator.validate(nodes, edges);
    if (!validation.isValid) {
      throw new Error(`Invalid workflow graph: ${validation.errors.join('; ')}`);
    }

    // 5. Translate Canonical Domain Model -> API DTO
    const dto: WorkflowGraphDTO = {
      nodes: nodes.map(n => ({
        id: n.id,
        label: n.label,
        kind: n.type, // Map Domain 'type' to API 'kind'
        type: n.automated ? 'automated' : 'human'
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.sourceId,
        target: e.targetId,
        label: e.condition || null,
        isBranch: e.type === 'BRANCH'
      })),
      rules: rules.map(r => ({
        id: r.id,
        description: r.name || 'Rule',
        condition: r.condition,
        action: r.action,
        nodeId: r.nodeId || ''
      }))
    };

    return dto;
  }
}
