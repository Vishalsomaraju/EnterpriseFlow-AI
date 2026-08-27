"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dashboardRoutes;
const DashboardService_1 = require("../../services/activity/DashboardService");
const dashboardService = new DashboardService_1.DashboardService();
async function dashboardRoutes(app) {
    app.get('/projects/:projectId/stats/dashboard', async (request, reply) => {
        const { projectId } = request.params;
        const stats = await dashboardService.getDashboardStats(projectId);
        return stats;
    });
    app.get('/projects/:projectId/activity', async (request, reply) => {
        const { projectId } = request.params;
        const query = request.query;
        const limit = query.limit ? parseInt(query.limit, 10) : 50;
        const activity = await dashboardService.getActivity(projectId, limit);
        return activity;
    });
}
