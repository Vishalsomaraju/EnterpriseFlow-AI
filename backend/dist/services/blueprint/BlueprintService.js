"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlueprintService = void 0;
const index_1 = require("../../db/index");
const WorkflowGraphService_1 = require("../graph/WorkflowGraphService");
const BlueprintGenerator_1 = require("../../domain/blueprint/BlueprintGenerator");
const BlueprintValidator_1 = require("../../domain/blueprint/BlueprintValidator");
const AppError_1 = require("../../errors/AppError");
class BlueprintService {
    /**
     * Generates, validates, and persists a blueprint for the current workflow version.
     * If a blueprint already exists for this version, it returns the existing one (idempotent).
     */
    static async generateAndPersistBlueprint(workflowId) {
        // 1. Get the current active version
        const versionRow = await index_1.db
            .selectFrom('workflow_versions')
            .where('workflow_id', '=', workflowId)
            .orderBy('version', 'desc')
            .limit(1)
            .selectAll()
            .executeTakeFirst();
        if (!versionRow) {
            throw new AppError_1.AppError('NOT_FOUND', 'Workflow version not found', 'BlueprintService');
        }
        const versionId = versionRow.id;
        // 2. Check if blueprint already exists for this version
        const existingBlueprint = await index_1.db
            .selectFrom('blueprints')
            .where('workflow_version_id', '=', versionId)
            .selectAll()
            .executeTakeFirst();
        if (existingBlueprint) {
            return {
                blueprint: existingBlueprint.schema_json,
                status: existingBlueprint.validation_status,
                errors: existingBlueprint.validation_errors || []
            };
        }
        // 3. Generate Blueprint
        // Fetch Graph
        const graphData = await WorkflowGraphService_1.WorkflowGraphService.getGraph(workflowId);
        // Fetch Workflow Info
        const workflow = await index_1.db
            .selectFrom('workflows')
            .where('id', '=', workflowId)
            .selectAll()
            .executeTakeFirstOrThrow();
        // Fetch Actors
        const dbActors = await index_1.db
            .selectFrom('workflow_actors')
            .where('version_id', '=', versionId)
            .selectAll()
            .execute();
        // Fetch Systems
        const dbSystems = await index_1.db
            .selectFrom('workflow_systems')
            .where('version_id', '=', versionId)
            .selectAll()
            .execute();
        // Fetch AC (Documents? or we just mock acceptance criteria if not in DB yet)
        // For now we will return some hardcoded AC if none exists since the schema doesn't have an explicit acceptance criteria table
        const acceptanceCriteria = [
            "All invoices > 5L route to CFO.",
            "Duplicate invoices must be rejected."
        ];
        const context = {
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
            type: n.kind, // In DTO, type is 'automated', kind is 'DECISION'
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
            condition: e.label,
            type: e.isBranch ? 'BRANCH' : 'DEFAULT'
        }));
        const engineRules = graphData.rules.map(r => ({
            id: r.id,
            condition: r.condition || '',
            action: r.action,
            nodeId: r.nodeId,
            name: r.description
        }));
        const generatedBlueprint = BlueprintGenerator_1.BlueprintGenerator.generate(context, engineNodes, engineEdges, engineRules);
        // 4. Validate Blueprint
        const validationResult = BlueprintValidator_1.BlueprintValidator.validate(generatedBlueprint);
        const status = validationResult.isValid ? 'VALID' : 'INVALID';
        // 5. Persist
        await index_1.db
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
    static async getBlueprint(workflowId) {
        const versionRow = await index_1.db
            .selectFrom('workflow_versions')
            .where('workflow_id', '=', workflowId)
            .orderBy('version', 'desc')
            .limit(1)
            .selectAll()
            .executeTakeFirst();
        if (!versionRow) {
            return null;
        }
        const existingBlueprint = await index_1.db
            .selectFrom('blueprints')
            .where('workflow_version_id', '=', versionRow.id)
            .selectAll()
            .executeTakeFirst();
        if (!existingBlueprint) {
            return null;
        }
        return {
            blueprint: existingBlueprint.schema_json,
            status: existingBlueprint.validation_status,
            errors: existingBlueprint.validation_errors || []
        };
    }
}
exports.BlueprintService = BlueprintService;
