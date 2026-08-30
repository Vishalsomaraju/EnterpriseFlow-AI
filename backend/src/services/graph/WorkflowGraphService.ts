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
    let version = await this.resolveWorkflowVersion(workflowId);

    if (!version) {
      // Check if workflow exists in workflows table
      const workflow = await db
        .selectFrom('workflows')
        .where((eb) => eb.or([
          eb('id', '=', workflowId),
          eb('project_id', '=', workflowId)
        ]))
        .orderBy('created_at', 'desc')
        .selectAll()
        .executeTakeFirst();

      if (workflow) {
        return {
          status: 'DRAFT',
          workflowName: workflow.name || undefined,
          nodes: [],
          edges: [],
          rules: []
        };
      }

      // Check if project exists in projects table
      const project = await db
        .selectFrom('projects')
        .where('id', '=', workflowId)
        .selectAll()
        .executeTakeFirst();

      if (project) {
        return {
          status: 'DRAFT',
          workflowName: project.name || undefined,
          nodes: [],
          edges: [],
          rules: []
        };
      }

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

    // 3. If the version has no nodes, return a structured empty-graph response.
    //    This correctly represents DRAFT workflows or test-scaffolded workflows that
    //    have a version row but no graph data yet — rather than throwing a 500.
    if (dbNodes.length === 0) {
      const workflow = await db
        .selectFrom('workflows')
        .select(['name'])
        .where('id', '=', version.workflow_id)
        .executeTakeFirst();

      return {
        status: version.status || 'DRAFT',
        workflowName: workflow?.name ?? undefined,
        nodes: [],
        edges: [],
        rules: [],
      };
    }

    const dbActors = await db
      .selectFrom('workflow_actors')
      .select(['id', 'name', 'role'])
      .where('version_id', '=', versionId)
      .execute();

    const dbSystems = await db
      .selectFrom('workflow_systems')
      .select(['id', 'name', 'description'])
      .where('version_id', '=', versionId)
      .execute();

    // 4. Normalize to domain models
    const { nodes, edges, rules } = GraphNormalizer.normalize(
      dbNodes.map(n => ({ ...n, kind: n.kind || 'UNKNOWN', metadata: {} })), 
      dbEdges, 
      dbRules.map(r => ({ ...r, description: r.description || '', name: r.name || undefined, node_id: r.node_id || '' }))
    );

    // 5. Validate graph integrity
    const validation = GraphValidator.validate(nodes, edges);
    if (!validation.isValid) {
      throw new Error(`Invalid workflow graph: ${validation.errors.join('; ')}`);
    }

    // 6. Construct Bottlenecks from Decision Gates and Human Governance Checkpoints
    const bottlenecks = nodes
      .filter(n => !n.automated || n.type === 'DECISION')
      .map(n => ({
        id: `gate-${n.id}`,
        title: n.label,
        description: !n.automated
          ? 'Human intervention and governance checkpoint required for verification.'
          : 'Decision evaluation gate determining branching workflow execution paths.'
      }));

    // 7. Translate Canonical Domain Model -> API DTO
    const dto: WorkflowGraphDTO = {
      status: version.status,
      actors: dbActors.map(a => ({ id: a.id, name: a.name, role: a.role })),
      systems: dbSystems.map(s => ({ id: s.id, name: s.name, description: s.description })),
      bottlenecks,
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
