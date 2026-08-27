import { db } from './src/db/index';
async function run() {
  const v1 = await db.selectFrom('workflow_versions').where('version', '=', 1).select('id').executeTakeFirst();
  const nodes = await db.selectFrom('nodes').where('version_id', '=', v1?.id as string).selectAll().execute();
  const edges = await db.selectFrom('edges').where('version_id', '=', v1?.id as string).selectAll().execute();
  console.log('NODES:');
  nodes.forEach(n => console.log(`  - ${n.id} : ${n.name} (type: ${n.type})`));
  console.log('EDGES:');
  edges.forEach(e => console.log(`  - ${e.source_id} -> ${e.target_id} (${e.label})`));
  process.exit(0);
}
run();
