"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const api_error_1 = require("../errors/api.error");
function errorHandler(error, request, reply) {
    // Extract standard Fastify request ID
    const requestId = request.id;
    if (error instanceof api_error_1.ApiError) {
        reply.status(error.statusCode).send({
            error: {
                code: error.code,
                message: error.message,
                requestId,
                fieldErrors: error.fieldErrors || []
            }
        });
        return;
    }
    // Handle validation errors from Fastify JSON Schema
    if (error.validation) {
        reply.status(400).send({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Request validation failed',
                requestId,
                fieldErrors: error.validation
            }
        });
        return;
    }
    // Log internal server errors (keep stack trace in logs only)
    request.log.error({ err: error, reqId: requestId }, 'Unhandled exception');
    // Do not expose stack traces, DB credentials, or paths in the API response
    reply.status(500).send({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected internal error occurred',
            requestId,
            fieldErrors: []
        }
    });
}
