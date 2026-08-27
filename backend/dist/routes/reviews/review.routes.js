"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoutes = void 0;
const ReviewService_1 = require("../../services/review/ReviewService");
const reviewRoutes = async (app) => {
    app.post('/builds/:buildId/reviews', async (request, reply) => {
        try {
            const review = await ReviewService_1.reviewService.submitReview(request.params.buildId, request.body.versionId, request.body.reviewer, request.body.comments);
            return reply.send(review);
        }
        catch (err) {
            return reply.status(500).send({ error: { message: err.message } });
        }
    });
    app.post('/:id/approve', async (request, reply) => {
        try {
            await ReviewService_1.reviewService.approveReview(request.params.id);
            return reply.send({ success: true });
        }
        catch (err) {
            return reply.status(400).send({ error: { message: err.message } });
        }
    });
    app.post('/:id/reject', async (request, reply) => {
        try {
            await ReviewService_1.reviewService.rejectReview(request.params.id, request.body?.comments);
            return reply.send({ success: true });
        }
        catch (err) {
            return reply.status(400).send({ error: { message: err.message } });
        }
    });
};
exports.reviewRoutes = reviewRoutes;
