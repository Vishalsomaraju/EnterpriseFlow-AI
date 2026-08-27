import { db } from '../../db/index';
import { WorkflowGraphService } from '../graph/WorkflowGraphService';
import { BlueprintGenerator, WorkflowContext } from '../../domain/blueprint/BlueprintGenerator';
import { BlueprintValidator } from '../../domain/blueprint/BlueprintValidator';
import { AutomationBlueprint } from '../../domain/blueprint/types';
import { AppError } from '../../errors/AppError';

export class BlueprintService {
  /**
   * Generates, validates, and persists a blueprint for the current workflow version.
   * If a blueprint already exists for this version, it returns the existing one (idempotent).
   */
  public static async generateAndPersistBlueprint(workflowId: string): Promise<{ blueprint: AutomationBlueprint, status: string, errors: string[] }> {
    // 1. Get the current active version
    const versionRow = await db
      .selectFrom('workflow_versions')
      .where('workflow_id', '=', workflowId)
      .orderBy('version', 'desc')
      .limit(1)
      .selectAll()
      .executeTakeFirst();

    if (!versionRow) {
      throw new AppError('Workflow version not found', 'NOT_FOUND', 404);
    }

    const versionId = versionRow.id;

    // 2. Check if blueprint already exists for this version
    const existingBlueprint = await db
      .selectFrom('blueprints')
      .where('workflow_version_id', '=', versionId)
      .selectAll()
      .executeTakeFirst();

    if (existingBlueprint) {
      return {
        blueprint: existingBlueprint.schema_json as unknown as AutomationBlueprint,
        status: existingBlueprint.validation_status,
        errors: (existingBlueprint.validation_errors as string[]) || []
      };
    }

    // 3. Generate Blueprint
    // Fetch Graph
    const graphData = await WorkflowGraphService.getGraph(workflowId);
    
    // Fetch Workflow Info
    const workflow = await db
      .selectFrom('workflows')
      .where('id', '=', workflowId)
      .selectAll()
      .executeTakeFirstOrThrow();

    // Fetch Actors
    const dbActors = await db
      .selectFrom('workflow_actors')
      .where('version_id', '=', versionId)
      .selectAll()
      .execute();

    // Fetch Systems
    const dbSystems = await db
      .selectFrom('workflow_systems')
      .where('version_id', '=', versionId)
      .selectAll()
      .execute();

    // Generate acceptance criteria from business rules
    const acceptanceCriteria = graphData.rules.map(r => 
      `Rule ${r.id}: When ${r.condition || 'default'} then ${r.action || 'continue'}`
    );
    if (acceptanceCriteria.length === 0) {
      acceptanceCriteria.push("Workflow executes from start to terminal state");
    }

    const context: WorkflowContext = {
      workflow: {
        id: workflow.id,
        version: versionRow.version,
        name: workflow.name || 'Unnamed Workflow'
      },
      actors: dbActors.map(a => ({ id: a.id, name: a.name, role: a.role || undefined })),
      systems: dbSystems.map(s => ({ id: s.id, name: s.name, description: s.description || undefined })),
      acceptanceCriteria
    };

    // Need raw engine elements for generator. 
    // WorkflowGraphService.getGraph returns DTOs, but we need the internal domain elements.
    // Instead of duplicating logic, let's extract it or map from DTOs.
    // Mapping from DTOs is safer for now.
    
    const engineNodes = graphData.nodes.map(n => ({
      id: n.id,
      type: n.kind,
      label: n.label,
      automated: n.type === 'automated',
      inputs: {},
      outputs: {},
      ruleIds: graphData.rules.filter(r => r.nodeId === n.id).map(r => r.id)
    }));

    const engineEdges = graphData.edges.map(e => ({
      id: e.id,
      sourceId: e.source,
      targetId: e.target,
      condition: e.label || undefined,
      type: e.isBranch ? 'BRANCH' as const : 'DEFAULT' as const
    }));

    const engineRules = graphData.rules.map(r => ({
      id: r.id,
      condition: r.condition || '',
      action: r.action,
      nodeId: r.nodeId,
      name: r.description
    }));

    const generatedBlueprint = BlueprintGenerator.generate(context, engineNodes, engineEdges, engineRules);

    // 4. Validate Blueprint
    const validationResult = BlueprintValidator.validate(generatedBlueprint);
    if (!validationResult.isValid) {
      console.log("BLUEPRINT VALIDATION ERRORS:", validationResult.errors);
    }
    const status = validationResult.isValid ? 'VALID' : 'INVALID';

    // 5. Persist
    await db
      .insertInto('blueprints')
      .values({
        workflow_version_id: versionId,
        schema_json: generatedBlueprint,
        validation_status: status,
        validation_errors: JSON.stringify(validationResult.errors)
      })
      .execute();

    return {
      blueprint: generatedBlueprint,
      status,
      errors: validationResult.errors
    };
  }

  public static async getBlueprint(workflowId: string): Promise<{ blueprint: AutomationBlueprint, status: string, errors: string[] } | null> {
    const versionRow = await db
      .selectFrom('workflow_versions')
      .where('workflow_id', '=', workflowId)
      .orderBy('version', 'desc')
      .limit(1)
      .selectAll()
      .executeTakeFirst();

    if (!versionRow) {
      return null;
    }

    const existingBlueprint = await db
      .selectFrom('blueprints')
      .where('workflow_version_id', '=', versionRow.id)
      .selectAll()
      .executeTakeFirst();

    if (!existingBlueprint) {
      return null;
    }

    return {
      blueprint: existingBlueprint.schema_json as unknown as AutomationBlueprint,
      status: existingBlueprint.validation_status,
      errors: (existingBlueprint.validation_errors as string[]) || []
    };
  }
}
