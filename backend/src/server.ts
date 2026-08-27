import { buildApp } from './app';
import * as dotenv from 'dotenv';
import { JobWorker } from './jobs/JobWorker';

dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

async function start() {
  const app = buildApp();
  try {
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`Server listening on http://0.0.0.0:${port}`);
    
    // Start the asynchronous job recovery loop
    JobWorker.startRecoveryWorker();
    app.log.info('Background job worker started');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
