import { FastifyInstance } from 'fastify';
import { DashboardService } from '../../services/activity/DashboardService';
import { z } from 'zod';

const dashboardService = new DashboardService();

export default async function dashboardRoutes(app: FastifyInstance) {
  app.get('/projects/:projectId/stats/dashboard', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const stats = await dashboardService.getDashboardStats(projectId);
    return stats;
  });

  app.get('/projects/:projectId/activity', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const query = request.query as { limit?: string };
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    
    const activity = await dashboardService.getActivity(projectId, limit);
    return activity;
  });
}
