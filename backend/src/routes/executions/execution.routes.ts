import { FastifyInstance } from 'fastify';
import { db } from '../../db/index';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { JobWorker } from '../../jobs/JobWorker';
import { JobType } from '../../jobs/types';
import { WorkflowExecutionInputSchema } from '../../domain/workflow-engine/ExecutionInputSchema';

const ExecutePayloadSchema = z.object({
  versionId: z.string(),
  invoiceData: WorkflowExecutionInputSchema,
  idempotencyKey: z.string().optional()
});

export default async function executionRoutes(app: FastifyInstance) {
  // Trigger execution
  app.post('/workflows/:workflowId/execute', async (request, reply) => {
    const { workflowId } = request.params as { workflowId: string };
    const { versionId, invoiceData, idempotencyKey } = ExecutePayloadSchema.parse(request.body);
    const key = idempotencyKey || randomUUID();

    // Check idempotency
    const existingExec = await db.selectFrom('workflow_executions')
      .where('idempotency_key', '=', key)
      .selectAll()
      .executeTakeFirst();
      
    if (existingExec) {
      return reply.code(409).send({ error: { message: 'Execution with this idempotency key already exists', executionId: existingExec.id } });
    }

    // Validate workflow and version
    const version = await db.selectFrom('workflow_versions')
      .where('id', '=', versionId)
      .where('workflow_id', '=', workflowId)
      .selectAll()
      .executeTakeFirst();
      
    if (!version) {
      return reply.code(404).send({ error: { message: 'Workflow version not found' } });
    }

    // 1. Create execution record
    const executionId = `exec_${randomUUID()}`;
    await db.insertInto('workflow_executions').values({
      id: executionId,
      version_id: versionId,
      status: 'QUEUED',
      input_snapshot: invoiceData,
      idempotency_key: key
    }).execute();

    // 2. Create EXECUTION job
    const jobId = randomUUID();
    await db.insertInto('jobs').values({
      id: jobId,
      type: JobType.EXECUTION,
      status: 'QUEUED',
      resource_id: executionId
    }).execute();

    // 3. Dispatch to JobWorker asynchronously
    JobWorker.dispatch(jobId, JobType.EXECUTION, executionId);

    return reply.code(202).send({ jobId, status: 'QUEUED', executionId });
  });

  // Get execution state (Frontend shape)
  app.get('/workflows/:workflowId/execution', async (request, reply) => {
    const { workflowId } = request.params as { workflowId: string };

    const versions = await db.selectFrom('workflow_versions').select('id').where('workflow_id', '=', workflowId).execute();
    const versionIds = versions.map(v => v.id);

    let execution = null;
    if (versionIds.length > 0) {
      execution = await db.selectFrom('workflow_executions')
        .where('version_id', 'in', versionIds)
        .orderBy('started_at', 'desc')
        .selectAll()
        .executeTakeFirst();
    }

    if (!execution) {
      return reply.code(404).send({ error: { message: 'Execution not found' } });
    }

    const history = await db.selectFrom('workflow_execution_history')
      .where('execution_id', '=', execution.id)
      .orderBy('timestamp', 'asc')
      .selectAll()
      .execute();

    // Re-shape for frontend UI
    const mappedHistory = history.map(h => ({
      nodeId: h.metadata?.nodeId || h.event,
      label: h.metadata?.nodeName || h.event,
      status: h.metadata?.status || 'COMPLETED',
      timestamp: h.timestamp
    }));

    return {
      execution: {
        id: execution.id,
        workflowId: workflowId,
        workflowVersionId: execution.version_id,
        status: execution.status,
        currentNodeId: mappedHistory.length > 0 ? mappedHistory[mappedHistory.length - 1].nodeId : null
      },
      input: execution.input_snapshot,
      history: mappedHistory
    };
  });
}
