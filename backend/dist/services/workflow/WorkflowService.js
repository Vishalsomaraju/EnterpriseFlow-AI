"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const index_1 = require("../../db/index");
const uuid_1 = require("uuid");
class WorkflowService {
    static async persistExtractedWorkflow(documentId, jobId, data) {
        return await index_1.db.transaction().execute(async (trx) => {
            // 1. Get project ID if document exists
            let projectId = null;
            if (documentId) {
                const doc = await trx
                    .selectFrom('documents')
                    .select('project_id')
                    .where('id', '=', documentId)
                    .executeTakeFirst();
                if (doc) {
                    projectId = doc.project_id;
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
                }
                else {
                    projectId = (0, uuid_1.v4)();
                    await trx.insertInto('projects')
                        .values({ id: projectId, name: 'Default Project' })
                        .execute();
                }
            }
            // 2. Create Workflow
            const workflowId = (0, uuid_1.v4)();
            await trx.insertInto('workflows')
                .values({
                id: workflowId,
                project_id: projectId,
                name: data.name
            })
                .execute();
            // 3. Create Workflow Version
            const versionId = (0, uuid_1.v4)();
            await trx.insertInto('workflow_versions')
                .values({
                id: versionId,
                workflow_id: workflowId,
                version: 1,
                status: 'DRAFT'
            })
                .execute();
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
            const steps = data.steps || [];
            for (const step of steps) {
                await trx.insertInto('workflow_nodes')
                    .values({
                    id: step.id,
                    version_id: versionId,
                    name: step.name,
                    type: step.type,
                    kind: 'STEP'
                })
                    .execute();
            }
            const decisions = data.decisions || [];
            for (const decision of decisions) {
                await trx.insertInto('workflow_nodes')
                    .values({
                    id: decision.id,
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
                const ruleId = rule.id;
                await trx.insertInto('business_rules')
                    .values({
                    id: ruleId,
                    version_id: versionId,
                    name: rule.name || 'Rule',
                    condition: rule.expression,
                    node_id: rule.decision_node_id || rule.source_node_id,
                })
                    .execute();
                const targets = Array.isArray(rule.target_node_id) ? rule.target_node_id : [rule.target_node_id];
                for (const target of targets) {
                    // Rule dependency
                    await trx.insertInto('rule_dependencies')
                        .values({
                        business_rule_id: ruleId,
                        target_type: 'NODE',
                        target_id: target,
                    })
                        .execute();
                    // Edge representation
                    const edgeId = `edge-${rule.source_node_id}-${target}`;
                    await trx.insertInto('workflow_edges')
                        .values({
                        id: edgeId,
                        version_id: versionId,
                        source_id: rule.source_node_id,
                        target_id: target,
                        label: rule.name,
                        is_branch: !!rule.decision_node_id,
                    })
                        .execute();
                }
            }
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
exports.WorkflowService = WorkflowService;
