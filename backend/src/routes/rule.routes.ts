import { FastifyPluginAsync } from 'fastify';
import { ruleService } from '../services/RuleService';
import { RuleChangeRequestSchema } from '../domain/rules/RuleChangeSchema';
import { ImpactAnalysisRequestSchema } from '../domain/rules/ImpactAnalysisSchema';

export const ruleRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Params: { id: string } }>('/:id/impact', async (request, reply) => {
    try {
      const parsed = ImpactAnalysisRequestSchema.parse(request.body);
      const impact = await ruleService.analyzeRuleImpact(request.params.id, parsed.expression, parsed.sampleInput);
      return reply.send(impact);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(400).send({ error: { message: err.message } });
    }
  });

  app.put<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const parsed = RuleChangeRequestSchema.parse(request.body);
      const result = await ruleService.changeRule(request.params.id, parsed.expression, parsed.baseVersion);
      return reply.send({ success: true, newVersionId: result.newVersionId, newVersionNumber: result.newVersionNumber });
    } catch (err: any) {
      request.log.error(err);
      if (err.message.startsWith('Conflict:')) {
        return reply.status(409).send({ error: { message: err.message } });
      }
      return reply.status(400).send({ error: { message: err.message } });
    }
  });
};
