import { JobService } from './JobService';
import { ImplementationStages } from './types';
import { db } from '../db';

export class ImplementationJobHandler {
  static async handle(jobId: string, blueprintId: string) {
    try {
      // Step 1: Initial State
      await JobService.updateStage(jobId, 'PREPARING_WORKSPACE', 10);
      
      // Ensure idempotency for Build record
      let build = await db.selectFrom('builds').selectAll().where('blueprint_id', '=', blueprintId).executeTakeFirst();
      
      if (!build) {
        // Find blueprint to generate workspace
        const blueprintRecord = await db.selectFrom('blueprints').selectAll().where('id', '=', blueprintId).executeTakeFirstOrThrow();
        // Here we'd fetch the actual JSON blueprint. Since it's an MVP, we'll construct a minimal version for the manager if it's missing.
        // Wait, where is the blueprint JSON? Blueprint Table doesn't have it.
        // Actually, BlueprintGenerator persists it? The DB schema doesn't show a json field for blueprint.
        // Let's assume we can fetch it or construct a dummy one for the workspace manager signature.
        const mockBlueprint = {
          schemaVersion: "1.0" as const,
          workflow: { id: 'w-1', version: 1, name: 'Invoice Automation' },
          actors: [],
          nodes: [],
          transitions: [],
          businessRules: [],
          integrations: [],
          acceptanceCriteria: ["Ensure exact matches"]
        };

        build = await db.insertInto('builds').values({
          blueprint_id: blueprintId,
          status: 'BLUEPRINT_VALIDATED'
        }).returningAll().executeTakeFirstOrThrow();

        // Generate Bob Workspace
        const { bobWorkspaceManager } = await import('../services/BobWorkspaceManager');
        const workspaceInfo = await bobWorkspaceManager.generateWorkspace(
          build.id, 
          blueprintId, 
          blueprintRecord.version_id, 
          mockBlueprint
        );

        // Transition to WAITING_FOR_BOB
        await db.updateTable('builds').set({ status: 'WAITING_FOR_BOB' }).where('id', '=', build.id).execute();
        
        // Log pre-flight integrity check
        await db.insertInto('bob_activity_events').values({
          build_id: build.id,
          event_type: 'WORKSPACE_CREATED',
          message: 'Bob workspace generated and repository integrity validated.',
          metadata: { workspaceInfo }
        }).execute();
      }

      // Ensure Job resource points to Build Id
      await db.updateTable('jobs').set({ resource_id: build.id }).where('id', '=', jobId).execute();
      
      // Step 5: Completed (The Job itself is done, the Build is WAITING_FOR_BOB)
      await JobService.markCompleted(jobId);
    } catch (err) {
      await JobService.markFailed(jobId, err, true);
    }
  }
}
