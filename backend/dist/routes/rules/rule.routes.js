"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruleRoutes = void 0;
const RuleService_1 = require("../../services/rules/RuleService");
const RuleChangeSchema_1 = require("../../domain/rule-engine/RuleChangeSchema");
const ImpactAnalysisSchema_1 = require("../../domain/impact-engine/ImpactAnalysisSchema");
const ruleRoutes = async (app) => {
    app.post('/:id/impact', async (request, reply) => {
        try {
            const parsed = ImpactAnalysisSchema_1.ImpactAnalysisRequestSchema.parse(request.body);
            const impact = await RuleService_1.ruleService.analyzeRuleImpact(request.params.id, parsed.expression, parsed.sampleInput);
            return reply.send(impact);
        }
        catch (err) {
            request.log.error(err);
            return reply.status(400).send({ error: { message: err.message } });
        }
    });
    app.put('/:id', async (request, reply) => {
        try {
            const parsed = RuleChangeSchema_1.RuleChangeRequestSchema.parse(request.body);
            const result = await RuleService_1.ruleService.changeRule(request.params.id, parsed.expression, parsed.baseVersion);
            return reply.send({ success: true, newVersionId: result.newVersionId, newVersionNumber: result.newVersionNumber });
        }
        catch (err) {
            request.log.error(err);
            if (err.message.startsWith('Conflict:')) {
                return reply.status(409).send({ error: { message: err.message } });
            }
            return reply.status(400).send({ error: { message: err.message } });
        }
    });
};
exports.ruleRoutes = ruleRoutes;
