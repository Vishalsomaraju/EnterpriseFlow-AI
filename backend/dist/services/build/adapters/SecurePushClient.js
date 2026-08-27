"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securePushClient = exports.SecurePushClient = void 0;
class SecurePushClient {
    async scanChanges(buildId) {
        // For MVP, deterministic local mock.
        // In a real environment, this would call the external SecurePush service.
        // Simulate some logic based on buildId
        if (buildId.includes('fail')) {
            return { status: 'BLOCK', critical: 1, high: 2, medium: 0, low: 0 };
        }
        if (buildId.includes('warn')) {
            return { status: 'WARN', critical: 0, high: 0, medium: 3, low: 5 };
        }
        return { status: 'PASS', critical: 0, high: 0, medium: 0, low: 2 };
    }
}
exports.SecurePushClient = SecurePushClient;
exports.securePushClient = new SecurePushClient();
