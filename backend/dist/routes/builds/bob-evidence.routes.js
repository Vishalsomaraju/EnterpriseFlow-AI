"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bobRoutes = void 0;
const BobEvidenceService_1 = require("../../../domain/bob/BobEvidenceService");
const bobRoutes = async (app) => {
    app.post('/:id/bob/events', async (request, reply) => {
        try {
            const payload = { build_id: request.params.id, ...request.body };
            await BobEvidenceService_1.bobEvidenceService.processEvent(payload);
            return reply.status(202).send({ status: 'accepted' });
        }
        catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                return reply.status(400).send({ error: 'VALIDATION_ERROR', details: JSON.parse(error.message) });
            }
            request.log.error(error);
            return reply.status(500).send({ error: 'INTERNAL_ERROR' });
        }
    });
    app.post('/:id/bob/plan', async (request, reply) => {
        try {
            const payload = { build_id: request.params.id, ...request.body };
            await BobEvidenceService_1.bobEvidenceService.processPlan(payload);
            return reply.status(202).send({ status: 'accepted' });
        }
        catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                return reply.status(400).send({ error: 'VALIDATION_ERROR', details: JSON.parse(error.message) });
            }
            request.log.error(error);
            return reply.status(500).send({ error: 'INTERNAL_ERROR' });
        }
    });
    app.post('/:id/bob/changes', async (request, reply) => {
        try {
            const payload = { build_id: request.params.id, ...request.body };
            await BobEvidenceService_1.bobEvidenceService.processChanges(payload);
            return reply.status(202).send({ status: 'accepted' });
        }
        catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                return reply.status(400).send({ error: 'VALIDATION_ERROR', details: JSON.parse(error.message) });
            }
            request.log.error(error);
            return reply.status(500).send({ error: 'INTERNAL_ERROR' });
        }
    });
    app.post('/:id/bob/tests', async (request, reply) => {
        try {
            const payload = { build_id: request.params.id, ...request.body };
            await BobEvidenceService_1.bobEvidenceService.processTestResults(payload);
            return reply.status(202).send({ status: 'accepted' });
        }
        catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                return reply.status(400).send({ error: 'VALIDATION_ERROR', details: JSON.parse(error.message) });
            }
            request.log.error(error);
            return reply.status(500).send({ error: 'INTERNAL_ERROR' });
        }
    });
};
exports.bobRoutes = bobRoutes;
