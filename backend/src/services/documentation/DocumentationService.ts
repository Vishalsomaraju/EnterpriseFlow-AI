import { db } from '../../db/index';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

export class DocumentationService {
  async generateAndPersistDocs(buildId: string): Promise<void> {
    const repoPath = path.resolve(__dirname, '../../../../demo-repository/invoice-automation');
    
    const docsToSave = [];
    
    // Check for README
    const readmePath = path.join(repoPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      docsToSave.push({
        id: randomUUID(),
        build_id: buildId,
        title: 'Project README',
        content: fs.readFileSync(readmePath, 'utf-8'),
        path: 'README.md',
        artifact_type: 'readme'
      });
    }

    // Mock an architectural generated summary for MVP
    docsToSave.push({
      id: randomUUID(),
      build_id: buildId,
      title: 'Invoice Implementation Architecture',
      content: '# Invoice Engine Summary\n\nAutomatically generated engineering documentation for this build.',
      path: 'docs/architecture.md',
      artifact_type: 'architecture'
    });

    if (docsToSave.length > 0) {
      await db.insertInto('documentation_artifacts').values(docsToSave).execute();
      
      const { EvidenceWriter } = await import('../build/EvidenceWriter');
      for (const doc of docsToSave) {
        await EvidenceWriter.writeDocumentation(buildId, doc);
      }
    }
  }

  async getDocumentation(buildId: string) {
    return db.selectFrom('documentation_artifacts').selectAll().where('build_id', '=', buildId).execute();
  }
}

export const documentationService = new DocumentationService();
