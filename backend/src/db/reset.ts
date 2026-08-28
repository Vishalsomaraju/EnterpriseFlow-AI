import { db } from './index';
import { sql } from 'kysely';

export async function resetDatabase() {
  console.log('Resetting database...');

  // Truncate tables in dependency-safe order
  await sql`TRUNCATE TABLE
    activity_events,
    workflow_execution_history,
    workflow_executions,
    reviews,
    documentation_artifacts,
    security_scans,
    test_results,
    test_runs,
    build_changes,
    bob_activity_events,
    build_subagents,
    build_plans,
    jobs,
    builds,
    blueprints,
    rule_dependencies,
    business_rules,
    workflow_edges,
    workflow_nodes,
    workflow_systems,
    workflow_actors,
    workflow_versions,
    documents,
    workflows,
    projects
  CASCADE`.execute(db);

  console.log('Database truncated successfully.');

  // Re-run seed
  const { up: seedUp } = await import('./migrations/002_seed_data');
  await seedUp(db);

  console.log('Database re-seeded successfully.');
  await db.destroy();
}

if (require.main === module || process.argv[1]?.includes('reset')) {
  resetDatabase().catch((e) => {
    console.error('Failed to reset database:', e);
    process.exit(1);
  });
}
