import fs from 'fs/promises';
import path from 'path';
import { bobWorkspaceManager } from './BobWorkspaceManager';

export class EvidenceWriter {
  private static async directory(buildId: string, name: string): Promise<string> {
    const manifest = await bobWorkspaceManager.readManifest(buildId);
    const directory = path.join(manifest.workspace, name);
    await fs.mkdir(directory, { recursive: true });
    return directory;
  }

  static async writePlan(buildId: string, planJson: unknown): Promise<void> {
    const manifest = await bobWorkspaceManager.readManifest(buildId);
    await fs.writeFile(
      path.join(await this.directory(buildId, 'plans'), 'submitted-plan.json'),
      JSON.stringify({ buildId, workflowId: manifest.workflowId, workflowVersionId: manifest.workflowVersionId, bobSessionId: manifest.bobSessionId, recordedAt: new Date().toISOString(), plan: planJson }, null, 2) + '\n',
      'utf8',
    );
  }

  static async writeActivity(buildId: string, event: { event_type?: string } & Record<string, unknown>): Promise<void> {
    const manifest = await bobWorkspaceManager.readManifest(buildId);
    const eventId = typeof event.event_id === 'string' ? event.event_id : `${event.event_type || 'event'}_${manifest.bobSessionId}`;
    const filename = `activity_${eventId.replace(/[^a-zA-Z0-9_.-]/g, '_')}.json`;
    await fs.writeFile(
      path.join(await this.directory(buildId, 'activities'), filename),
      JSON.stringify({ buildId, workflowId: manifest.workflowId, workflowVersionId: manifest.workflowVersionId, bobSessionId: manifest.bobSessionId, recordedAt: new Date().toISOString(), ...event }, null, 2) + '\n',
      'utf8',
    );
  }

  static async writeChange(buildId: string, file: { file_path: string; change_type: string; diff?: string }): Promise<void> {
    const manifest = await bobWorkspaceManager.readManifest(buildId);
    const sanitizedName = file.file_path.replace(/[/\\:]/g, '_');
    const filename = `diff_${sanitizedName}.patch`;
    await fs.writeFile(
      path.join(await this.directory(buildId, 'changes'), filename),
      `# Build: ${buildId}\n# Workflow: ${manifest.workflowId}\n# Version: ${manifest.workflowVersionId}\n# Bob session: ${manifest.bobSessionId}\n${file.diff || `--- a/${file.file_path}\n+++ b/${file.file_path}\n# ${file.change_type}`}`,
      'utf8',
    );
  }

  static async writeTestRun(buildId: string, testRun: { test_run_id?: string; id?: string } & Record<string, unknown>): Promise<void> {
    const manifest = await bobWorkspaceManager.readManifest(buildId);
    const runId = testRun.test_run_id || testRun.id;
    if (!runId) throw new Error('Test evidence must include a test run ID');
    const filename = `test_run_${runId}.json`;
    await fs.writeFile(
      path.join(await this.directory(buildId, 'tests'), filename),
      JSON.stringify({ buildId, workflowId: manifest.workflowId, workflowVersionId: manifest.workflowVersionId, bobSessionId: manifest.bobSessionId, recordedAt: new Date().toISOString(), ...testRun }, null, 2) + '\n',
      'utf8',
    );
  }

  static async writeSecurity(buildId: string, scan: unknown): Promise<void> {
    const manifest = await bobWorkspaceManager.readManifest(buildId);
    await fs.writeFile(
      path.join(await this.directory(buildId, 'security'), 'security-scan.json'),
      JSON.stringify({ buildId, workflowId: manifest.workflowId, workflowVersionId: manifest.workflowVersionId, bobSessionId: manifest.bobSessionId, recordedAt: new Date().toISOString(), scan }, null, 2) + '\n',
      'utf8',
    );
  }

  static async writeDocumentation(buildId: string, doc: { title: string; content: string; path?: string }): Promise<void> {
    const manifest = await bobWorkspaceManager.readManifest(buildId);
    const sanitizedName = (doc.path || doc.title).replace(/[/\\:]/g, '_');
    const filename = sanitizedName.endsWith('.md') ? sanitizedName : `${sanitizedName}.md`;
    await fs.writeFile(
      path.join(await this.directory(buildId, 'documentation'), filename),
      `<!-- Build ID: ${buildId} -->\n<!-- Workflow ID: ${manifest.workflowId} -->\n<!-- Workflow Version: ${manifest.workflowVersionId} -->\n<!-- Bob Session: ${manifest.bobSessionId} -->\n# ${doc.title}\n\n${doc.content}`,
      'utf8',
    );
  }
}
