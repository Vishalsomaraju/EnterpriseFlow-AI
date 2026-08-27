"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    code;
    message;
    fieldErrors;
    constructor(statusCode, code, message, fieldErrors) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.message = message;
        this.fieldErrors = fieldErrors;
        this.name = 'ApiError';
    }
    static badRequest(message, code = 'BAD_REQUEST', fieldErrors) {
        return new ApiError(400, code, message, fieldErrors);
    }
    static notFound(message = 'Not found', code = 'NOT_FOUND') {
        return new ApiError(404, code, message);
    }
    static conflict(message, code = 'CONFLICT') {
        return new ApiError(409, code, message);
    }
    static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
        return new ApiError(500, code, message);
    }
}
exports.ApiError = ApiError;
