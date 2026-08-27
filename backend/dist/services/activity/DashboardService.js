"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const index_1 = require("../../db/index");
class DashboardService {
    /**
     * totalWorkflows: count(workflows)
     * activeWorkflows: workflows whose current version status is ACTIVE/PUBLISHED.
     * pendingTasks: jobs in QUEUED/RUNNING.
     * bobChanges: build_changes count associated with active/recent builds.
     */
    async getDashboardStats(projectId) {
        const totalWorkflowsQuery = await index_1.db
            .selectFrom('workflows')
            .where('project_id', '=', projectId)
            .select((eb) => eb.fn.count('id').as('count'))
            .executeTakeFirst();
        const totalWorkflows = Number(totalWorkflowsQuery?.count || 0);
        const activeWorkflowsQuery = await index_1.db
            .selectFrom('workflows as w')
            .innerJoin('workflow_versions as wv', 'wv.workflow_id', 'w.id')
            .where('w.project_id', '=', projectId)
            .where('wv.status', 'in', ['ACTIVE', 'PUBLISHED'])
            .select((eb) => eb.fn.count('w.id').as('count'))
            .executeTakeFirst();
        const activeWorkflows = Number(activeWorkflowsQuery?.count || 0);
        // Jobs are global or project-specific? The schema has `build_id` on jobs.
        // Let's count jobs related to the project's blueprints/versions.
        const pendingTasksQuery = await index_1.db
            .selectFrom('jobs as j')
            .innerJoin('builds as b', 'b.id', 'j.build_id')
            .innerJoin('blueprints as bp', 'bp.id', 'b.blueprint_id')
            .innerJoin('workflow_versions as wv', 'wv.id', 'bp.version_id')
            .innerJoin('workflows as w', 'w.id', 'wv.workflow_id')
            .where('w.project_id', '=', projectId)
            .where('j.status', 'in', ['QUEUED', 'RUNNING'])
            .select((eb) => eb.fn.count('j.id').as('count'))
            .executeTakeFirst();
        const pendingTasks = Number(pendingTasksQuery?.count || 0);
        const bobChangesQuery = await index_1.db
            .selectFrom('build_changes as bc')
            .innerJoin('builds as b', 'b.id', 'bc.build_id')
            .innerJoin('blueprints as bp', 'bp.id', 'b.blueprint_id')
            .innerJoin('workflow_versions as wv', 'wv.id', 'bp.version_id')
            .innerJoin('workflows as w', 'w.id', 'wv.workflow_id')
            .where('w.project_id', '=', projectId)
            .select((eb) => eb.fn.count('bc.id').as('count'))
            .executeTakeFirst();
        const bobChanges = Number(bobChangesQuery?.count || 0);
        return {
            totalWorkflows,
            activeWorkflows,
            pendingTasks,
            bobChanges,
        };
    }
    async getActivity(projectId, limit = 50) {
        const activities = await index_1.db
            .selectFrom('activity_events')
            .selectAll()
            .where('project_id', '=', projectId)
            .orderBy('timestamp', 'desc')
            .orderBy('id', 'desc')
            .limit(limit)
            .execute();
        return activities.map(a => ({
            id: a.id,
            title: a.title,
            source: a.source,
            timestamp: a.timestamp,
            event_type: a.event_type,
            message: a.message,
            actor: a.actor,
            entity_type: a.entity_type,
            entity_id: a.entity_id,
            workflow_version: a.workflow_version
        }));
    }
}
exports.DashboardService = DashboardService;
