"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationQuerySchema = exports.uuidParamSchema = void 0;
exports.uuidParamSchema = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid' },
    },
    required: ['id'],
};
exports.paginationQuerySchema = {
    type: 'object',
    properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    },
};
