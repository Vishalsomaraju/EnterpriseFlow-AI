"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    db: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/enterprise_flow',
    },
    server: {
        port: parseInt(process.env.PORT || '3001', 10),
        env: process.env.NODE_ENV || 'development',
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    }
};
