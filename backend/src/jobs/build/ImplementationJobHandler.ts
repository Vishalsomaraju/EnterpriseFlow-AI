import { JobService } from '../JobService';
import { db } from '../../db/index';

export class ImplementationJobHandler {
  static async handle(jobId: string, blueprintId: string) {
    try {
      // EnterpriseFlow prepares the handoff; IBM Bob performs the engineering work.
      await JobService.updateStage(jobId, 'PREPARING_WORKSPACE', 10);

      // Ensure idempotency for Build record
      let build = await db
        .selectFrom('builds')
        .selectAll()
        .where('blueprint_id', '=', blueprintId)
        .where('status', 'in', ['BLUEPRINT_VALIDATED', 'WAITING_FOR_BOB', 'IMPLEMENTING', 'TESTING', 'REVIEW'])
        .orderBy('created_at', 'desc')
        .executeTakeFirst();

      if (!build) {
        // Find blueprint to generate workspace
        const blueprintRecord = await db.selectFrom('blueprints').selectAll().where('id', '=', blueprintId).executeTakeFirstOrThrow();
        const blueprintJson = blueprintRecord.schema_json;

        build = await db.insertInto('builds').values({
          blueprint_id: blueprintId,
          status: 'BLUEPRINT_VALIDATED'
        }).returningAll().executeTakeFirstOrThrow();

        // Generate Bob Workspace
        const { bobWorkspaceManager } = await import('../../services/build/BobWorkspaceManager');
        const workspaceInfo = await bobWorkspaceManager.generateWorkspace(
          build.id,
          blueprintId,
          blueprintRecord.workflow_version_id,
          blueprintJson
        );

        // The next transition is performed only by evidence from the actual Bob session.
        await db.updateTable('builds').set({ status: 'WAITING_FOR_BOB' }).where('id', '=', build.id).execute();

        // Record only the workspace handoff that was actually prepared.
        await db.insertInto('bob_activity_events').values({
          build_id: build.id,
          event_type: 'WORKSPACE_CREATED',
          message: 'EnterpriseFlow prepared a Bob handoff workspace.',
          metadata: { workspaceInfo }
        }).execute();
        await db.insertInto('activity_events').values({
          id: `bob-build-${build.id}`,
          title: 'Bob Build Prepared',
          message: `Bob workspace prepared for build ${build.id}`,
          source: 'BOB',
          event_type: 'BOB_BUILD_PREPARED',
          status: 'SUCCESS',
          entity_type: 'BUILD',
          entity_id: build.id,
          workflow_version: blueprintRecord.workflow_version_id,
          metadata: { blueprintId, workspaceInfo }
        }).execute();
      }

      // Ensure Job resource points to Build Id
      await db.updateTable('jobs').set({ resource_id: build.id }).where('id', '=', jobId).execute();

      // Preparation is complete. Bob must now run externally against the repository.
      await JobService.markCompleted(jobId);
    } catch (err) {
      await JobService.markFailed(jobId, err, true);
    }
  }
}
