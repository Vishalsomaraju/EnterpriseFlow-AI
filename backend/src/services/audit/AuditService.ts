import { db } from '../../db';

export interface AuditEvent {
  id: string;
  title: string;
  message: string;
  eventType: string;
  source: string;
  status?: string;
  projectId?: string;
  workflowVersion?: string;
  entityType?: string;
  entityId?: string;
  metadata?: unknown;
}

export class AuditService {
  static async record(event: AuditEvent): Promise<void> {
    await db.insertInto('activity_events').values({
      id: event.id,
      title: event.title,
      message: event.message,
      source: event.source,
      event_type: event.eventType,
      status: event.status || 'SUCCESS',
      project_id: event.projectId || null,
      workflow_version: event.workflowVersion || null,
      entity_type: event.entityType || null,
      entity_id: event.entityId || null,
      metadata: event.metadata || null
    }).execute();
  }
}
