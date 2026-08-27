import { db } from '../db';
import path from 'path';
import fs from 'fs';

export class DocumentationService {
  async generateAndPersistDocs(buildId: string): Promise<void> {
    const repoPath = path.resolve(__dirname, '../../../../demo-repository/invoice-automation');
    
    const docsToSave = [];
    
    // Check for README
    const readmePath = path.join(repoPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      docsToSave.push({
        id: `doc_${Date.now()}_readme`,
        build_id: buildId,
        title: 'Project README',
        content: fs.readFileSync(readmePath, 'utf-8'),
        path: 'README.md',
        artifact_type: 'readme'
      });
    }

    // Mock an architectural generated summary for MVP
    docsToSave.push({
      id: `doc_${Date.now()}_arch`,
      build_id: buildId,
      title: 'Invoice Implementation Architecture',
      content: '# Invoice Engine Summary\n\nAutomatically generated engineering documentation for this build.',
      path: 'docs/architecture.md',
      artifact_type: 'architecture'
    });

    if (docsToSave.length > 0) {
      await db.insertInto('documentation_artifacts').values(docsToSave).execute();
    }
  }

  async getDocumentation(buildId: string) {
    return db.selectFrom('documentation_artifacts').selectAll().where('build_id', '=', buildId).execute();
  }
}

export const documentationService = new DocumentationService();
