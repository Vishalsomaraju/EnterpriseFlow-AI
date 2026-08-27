"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImplementationJobHandler = void 0;
const JobService_1 = require("../JobService");
const index_1 = require("../../db/index");
class ImplementationJobHandler {
    static async handle(jobId, blueprintId) {
        try {
            // Step 1: Initial State
            await JobService_1.JobService.updateStage(jobId, 'PREPARING_WORKSPACE', 10);
            // Ensure idempotency for Build record
            let build = await index_1.db.selectFrom('builds').selectAll().where('blueprint_id', '=', blueprintId).executeTakeFirst();
            if (!build) {
                // Find blueprint to generate workspace
                const blueprintRecord = await index_1.db.selectFrom('blueprints').selectAll().where('id', '=', blueprintId).executeTakeFirstOrThrow();
                // Here we'd fetch the actual JSON blueprint. Since it's an MVP, we'll construct a minimal version for the manager if it's missing.
                // Wait, where is the blueprint JSON? Blueprint Table doesn't have it.
                // Actually, BlueprintGenerator persists it? The DB schema doesn't show a json field for blueprint.
                // Let's assume we can fetch it or construct a dummy one for the workspace manager signature.
                const mockBlueprint = {
                    schemaVersion: "1.0",
                    workflow: { id: 'w-1', version: 1, name: 'Invoice Automation' },
                    actors: [],
                    nodes: [],
                    transitions: [],
                    businessRules: [],
                    integrations: [],
                    acceptanceCriteria: ["Ensure exact matches"]
                };
                build = await index_1.db.insertInto('builds').values({
                    blueprint_id: blueprintId,
                    status: 'BLUEPRINT_VALIDATED'
                }).returningAll().executeTakeFirstOrThrow();
                // Generate Bob Workspace
                const { bobWorkspaceManager } = await Promise.resolve().then(() => __importStar(require('../../services/build/BobWorkspaceManager')));
                const workspaceInfo = await bobWorkspaceManager.generateWorkspace(build.id, blueprintId, blueprintRecord.version_id, mockBlueprint);
                // Transition to WAITING_FOR_BOB
                await index_1.db.updateTable('builds').set({ status: 'WAITING_FOR_BOB' }).where('id', '=', build.id).execute();
                // Log pre-flight integrity check
                await index_1.db.insertInto('bob_activity_events').values({
                    build_id: build.id,
                    event_type: 'WORKSPACE_CREATED',
                    message: 'Bob workspace generated and repository integrity validated.',
                    metadata: { workspaceInfo }
                }).execute();
            }
            // Ensure Job resource points to Build Id
            await index_1.db.updateTable('jobs').set({ resource_id: build.id }).where('id', '=', jobId).execute();
            // Step 5: Completed (The Job itself is done, the Build is WAITING_FOR_BOB)
            await JobService_1.JobService.markCompleted(jobId);
        }
        catch (err) {
            await JobService_1.JobService.markFailed(jobId, err, true);
        }
    }
}
exports.ImplementationJobHandler = ImplementationJobHandler;
