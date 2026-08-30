import { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index';
import { ExtractionService } from '../../services/workflow-extraction/ExtractionService';

export const projectRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (request, reply) => {
    try {
      const rows = await db.selectFrom('projects')
        .leftJoin('workflows', 'workflows.project_id', 'projects.id')
        .select([
          'projects.id as id',
          'projects.name as name',
          'projects.created_at as created_at',
          'workflows.id as workflow_id'
        ])
        .orderBy('projects.created_at', 'asc')
        .execute();

      const uniqueMap = new Map<string, any>();
      for (const row of rows) {
        if (!uniqueMap.has(row.id)) {
          uniqueMap.set(row.id, row);
        } else if (row.workflow_id && !uniqueMap.get(row.id).workflow_id) {
          uniqueMap.set(row.id, row);
        }
      }

      return reply.send(Array.from(uniqueMap.values()));
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });

  app.post<{ Body: { name: string; description?: string; filename?: string } }>('/', async (request, reply) => {
    try {
      if (!request.body || !request.body.name) {
        return reply.status(400).send({ error: 'Name is required' });
      }

      // 1. Insert Project
      const project = await db.insertInto('projects')
        .values({
          name: request.body.name
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      // 2. Insert Workflow for this project
      const workflow = await db.insertInto('workflows')
        .values({
          project_id: project.id,
          name: request.body.name
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      // 3. Insert initial DRAFT workflow version
      const version = await db.insertInto('workflow_versions')
        .values({
          workflow_id: workflow.id,
          version: 1,
          status: 'DRAFT'
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      // 4. If description or document metadata is provided, insert document
      let document = null;
      if (request.body.filename || request.body.description) {
        const filename = request.body.filename || 'Standard_Operating_Procedure.pdf';
        document = await db.insertInto('documents')
          .values({
            project_id: project.id,
            workflow_id: workflow.id,
            filename,
            mime_type: 'application/pdf',
            storage_path: `/uploads/${project.id}/${filename}`,
            extraction_status: 'UPLOADED'
          })
          .returningAll()
          .executeTakeFirst();

        // If a real document filename was provided, run the extraction pipeline
        if (document && request.body.filename) {
          await ExtractionService.extract(document.id);
        }
      }
        
      return reply.send({
        id: project.id,
        name: project.name,
        created_at: project.created_at,
        workflow_id: workflow.id,
        workflowId: workflow.id,
        versionId: version.id,
        documentId: document?.id
      });
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'INTERNAL_ERROR' });
    }
  });
};
