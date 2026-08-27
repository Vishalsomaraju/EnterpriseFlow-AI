import { db } from './src/db/index';
async function run() {
  const executions = await db.selectFrom('workflow_executions').selectAll().execute();
  for (const exec of executions) {
    const history = await db.selectFrom('workflow_execution_history').where('execution_id', '=', exec.id).orderBy('timestamp', 'asc').selectAll().execute();
    console.log(`EXECUTION ${exec.id}`);
    history.forEach((h: any) => console.log(`  - ${h.event} (metadata: ${JSON.stringify(h.metadata)})`));
  }
  process.exit(0);
}
run();
