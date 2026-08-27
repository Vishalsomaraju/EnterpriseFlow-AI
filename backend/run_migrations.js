const { db } = require('./dist/db/index.js');
const { Migrator } = require('kysely/migration');
const path = require('path');
const fs = require('fs/promises');

class CustomMigrationProvider {
  async getMigrations() {
    const migrations = {};
    const dir = path.join(__dirname, 'dist', 'db', 'migrations');
    const files = await fs.readdir(dir);
    for (const file of files) {
      if (file.endsWith('.js')) {
         migrations[file] = require(path.join(dir, file));
      }
    }
    return migrations;
  }
}

async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new CustomMigrationProvider(),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`Migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`Failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('Failed to migrate');
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
