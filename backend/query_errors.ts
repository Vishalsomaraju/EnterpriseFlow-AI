import { db } from './src/db/index';
async function run() {
  const result = await db.selectFrom('blueprints').select('validation_errors').orderBy('created_at', 'desc').limit(1).executeTakeFirst();
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}
run();
