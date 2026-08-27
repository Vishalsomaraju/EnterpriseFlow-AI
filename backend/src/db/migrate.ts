import * as path from 'path';
import { promises as fs } from 'fs';
import { pathToFileURL } from 'url';
import {
  Migrator,
  FileMigrationProvider,
} from 'kysely/migration';
import { db } from './index';

async function migrateToLatest() {
  const migrationsPath = path.join(process.cwd(), 'src', 'db', 'migrations');

  // Custom provider that uses file:// URLs for Windows ESM compatibility
  const provider: any = {
    getMigrations: async () => {
      const migrations: Record<string, any> = {};
      const files = await fs.readdir(migrationsPath);
      for (const file of files.sort()) {
        if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
        const filePath = path.join(migrationsPath, file);
        const fileUrl = pathToFileURL(filePath).href;
        const mod = await import(fileUrl);
        const name = file.replace(/\.(ts|js)$/, '');
        migrations[name] = mod;
      }
      return migrations;
    }
  };

  const migrator = new Migrator({ db, provider });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it: any) => {
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
