import { db } from '../../db/index';
import { ValidatedExtractionOutput } from '../../schemas/extraction.schema';
import { v4 as uuidv4 } from 'uuid';

export class WorkflowService {
  static async persistExtractedWorkflow(
    documentId: string | undefined,
    jobId: string,
    data: ValidatedExtractionOutput
  ): Promise<string> {
    return await db.transaction().execute(async (trx) => {
      // 1. Get project ID and existing workflow ID if document exists
      let projectId: string | null = null;
      let workflowId: string | null = null;
      if (documentId) {
        const doc = await trx
          .selectFrom('documents')
          .select(['project_id', 'workflow_id'])
          .where('id', '=', documentId)
          .executeTakeFirst();
        
        if (doc) {
          projectId = doc.project_id;
          workflowId = doc.workflow_id;
        }
      }

      if (!projectId) {
        // Fallback for tests/demo if no doc is provided - find or create a default project
        const project = await trx
          .selectFrom('projects')
          .select('id')
          .limit(1)
          .executeTakeFirst();

        if (project) {
          projectId = project.id;
        } else {
          projectId = uuidv4();
          await trx.insertInto('projects')
            .values({ id: projectId, name: 'Default Project' })
            .execute();
        }
      }

      // 2. Create Workflow if not already existing
      if (!workflowId) {
        workflowId = uuidv4();
        await trx.insertInto('workflows')
          .values({
            id: workflowId,
            project_id: projectId!,
            name: data.name
          })
          .execute();
      } else {
        await trx.updateTable('workflows')
          .set({ name: data.name })
          .where('id', '=', workflowId)
          .execute();
      }

      // 3. Create or reuse Workflow Version
      const existingVersion = await trx
        .selectFrom('workflow_versions')
        .where('workflow_id', '=', workflowId)
        .orderBy('version', 'desc')
        .selectAll()
        .executeTakeFirst();

      let versionId: string;
      if (existingVersion) {
        versionId = existingVersion.id;
        await trx.deleteFrom('workflow_nodes').where('version_id', '=', versionId).execute();
        await trx.deleteFrom('workflow_edges').where('version_id', '=', versionId).execute();
        await trx.deleteFrom('workflow_actors').where('version_id', '=', versionId).execute();
        await trx.deleteFrom('workflow_systems').where('version_id', '=', versionId).execute();
        await trx.deleteFrom('business_rules').where('version_id', '=', versionId).execute();
      } else {
        versionId = uuidv4();
        await trx.insertInto('workflow_versions')
          .values({
            id: versionId,
            workflow_id: workflowId,
            version: 1,
            status: 'DRAFT'
          })
          .execute();
      }

      // 4. Update Document
      if (documentId) {
        await trx.updateTable('documents')
          .set({ workflow_id: workflowId, extraction_status: 'COMPLETED' })
          .where('id', '=', documentId)
          .execute();
      }

      // 5. Actors & Systems
      const actors = data.actors || [];
      for (const actor of actors) {
        await trx.insertInto('workflow_actors')
          .values({
            version_id: versionId,
            name: actor,
          })
          .execute();
      }

      const systems = data.systems || [];
      for (const system of systems) {
        await trx.insertInto('workflow_systems')
          .values({
            version_id: versionId,
            name: system,
          })
          .execute();
      }

      // 6. Nodes (Steps + Decisions)
      const nodeIdMap = new Map<string, string>();
      const steps = data.steps || [];
      for (const step of steps) {
        const scopedId = `${versionId}-${step.id}`;
        nodeIdMap.set(step.id, scopedId);
        await trx.insertInto('workflow_nodes')
          .values({
            id: scopedId,
            version_id: versionId,
            name: step.name,
            type: step.type,
            kind: 'STEP'
          })
          .execute();
      }

      const decisions = data.decisions || [];
      for (const decision of decisions) {
        const scopedId = `${versionId}-${decision.id}`;
        nodeIdMap.set(decision.id, scopedId);
        await trx.insertInto('workflow_nodes')
          .values({
            id: scopedId,
            version_id: versionId,
            name: decision.name,
            type: 'DECISION',
            kind: 'DECISION'
          })
          .execute();
      }

      // 7. Rules and Edges
      const rules = data.rules || [];
      for (const rule of rules) {
        const scopedRuleId = `${versionId}-${rule.id}`;
        const scopedSourceId = nodeIdMap.get(rule.source_node_id) || rule.source_node_id;
        const scopedDecisionId = rule.decision_node_id ? (nodeIdMap.get(rule.decision_node_id) || rule.decision_node_id) : undefined;
        
        await trx.insertInto('business_rules')
          .values({
            id: scopedRuleId,
            version_id: versionId,
            name: rule.name || 'Rule',
            condition: rule.expression,
            node_id: scopedDecisionId || scopedSourceId,
          })
          .execute();

        const targets = Array.isArray(rule.target_node_id) ? rule.target_node_id : [rule.target_node_id];
        
        for (const target of targets) {
          const scopedTargetId = nodeIdMap.get(target) || target;
          
          // Rule dependency
          await trx.insertInto('rule_dependencies')
            .values({
              business_rule_id: scopedRuleId,
              target_type: 'NODE',
              target_id: scopedTargetId,
            })
            .execute();

          // Edge representation
          const edgeId = `edge-${versionId}-${rule.id}-${target}`;
          await trx.insertInto('workflow_edges')
            .values({
              id: edgeId,
              version_id: versionId,
              source_id: scopedSourceId,
              target_id: scopedTargetId,
              label: rule.name,
              is_branch: !!rule.decision_node_id,
            })
            .execute();
        }
      }

      await trx.insertInto('activity_events').values([
        {
          id: `workflow-created-${workflowId}`,
          title: 'Workflow Created',
          message: `Workflow ${workflowId} created from extraction job ${jobId}`,
          source: 'EXTRACTION',
          event_type: 'WORKFLOW_CREATED',
          status: 'SUCCESS',
          project_id: projectId,
          entity_type: 'WORKFLOW',
          entity_id: workflowId,
          workflow_version: versionId,
          metadata: { documentId, jobId, ruleCount: rules.length }
        },
        {
          id: `extraction-completed-${jobId}`,
          title: 'Extraction Completed',
          message: `Workflow extraction persisted for ${workflowId}`,
          source: 'EXTRACTION',
          event_type: 'EXTRACTION_COMPLETED',
          status: 'SUCCESS',
          project_id: projectId,
          entity_type: 'WORKFLOW_VERSION',
          entity_id: versionId,
          workflow_version: versionId,
          metadata: { documentId, jobId }
        }
      ]).execute();

      // 8. Mark Job Completed
      await trx.updateTable('jobs')
        .set({
          status: 'COMPLETED',
          stage: 'PERSISTED',
          progress: 100,
          resource_id: versionId, // Returning version ID as resource reference
          completed_at: new Date()
        })
        .where('id', '=', jobId)
        .execute();

      return versionId;
    });
  }
}
