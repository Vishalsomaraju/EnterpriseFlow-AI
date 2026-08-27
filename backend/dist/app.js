"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const error_handler_1 = require("./middleware/error-handler");
const db_1 = require("./db");
const kysely_1 = require("kysely");
const document_routes_1 = require("./routes/projects/document.routes");
const job_routes_1 = require("./routes/jobs/job.routes");
const workflow_routes_1 = require("./routes/workflows/workflow.routes");
const blueprint_routes_1 = require("./routes/blueprints/blueprint.routes");
const build_routes_1 = require("./routes/builds/build.routes");
const bob_evidence_routes_1 = require("./routes/builds/bob-evidence.routes");
const review_routes_1 = require("./routes/reviews/review.routes");
const rule_routes_1 = require("./routes/rules/rule.routes");
const dashboard_routes_1 = __importDefault(require("./routes/activity/dashboard.routes"));
const execution_routes_1 = __importDefault(require("./routes/executions/execution.routes"));
function buildApp() {
    const app = (0, fastify_1.default)({
        logger: true,
    });
    app.register(cors_1.default, {
        origin: '*',
    });
    app.setErrorHandler(error_handler_1.errorHandler);
    app.get('/health', async (request, reply) => {
        return { status: 'ok', time: new Date().toISOString() };
    });
    app.get('/ready', async (request, reply) => {
        try {
            await (0, kysely_1.sql) `SELECT 1`.execute(db_1.db);
            return { status: 'ready', database: 'connected' };
        }
        catch (error) {
            request.log.error(error);
            return reply.status(503).send({ status: 'unavailable', database: 'disconnected' });
        }
    });
    app.register(document_routes_1.documentRoutes);
    app.register(job_routes_1.jobRoutes);
    app.register(workflow_routes_1.workflowRoutes, { prefix: '/workflows' });
    app.register(blueprint_routes_1.blueprintRoutes, { prefix: '/blueprints' });
    app.register(build_routes_1.buildRoutes, { prefix: '/builds' });
    app.register(bob_evidence_routes_1.bobRoutes, { prefix: '/builds' });
    app.register(review_routes_1.reviewRoutes, { prefix: '/reviews' });
    app.register(rule_routes_1.ruleRoutes, { prefix: '/rules' });
    app.register(dashboard_routes_1.default);
    app.register(execution_routes_1.default);
    return app;
}
