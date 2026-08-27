"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentationService = exports.DocumentationService = void 0;
const index_1 = require("../../db/index");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class DocumentationService {
    async generateAndPersistDocs(buildId) {
        const repoPath = path_1.default.resolve(__dirname, '../../../../demo-repository/invoice-automation');
        const docsToSave = [];
        // Check for README
        const readmePath = path_1.default.join(repoPath, 'README.md');
        if (fs_1.default.existsSync(readmePath)) {
            docsToSave.push({
                id: `doc_${Date.now()}_readme`,
                build_id: buildId,
                title: 'Project README',
                content: fs_1.default.readFileSync(readmePath, 'utf-8'),
                path: 'README.md',
                artifact_type: 'readme'
            });
        }
        // Mock an architectural generated summary for MVP
        docsToSave.push({
            id: `doc_${Date.now()}_arch`,
            build_id: buildId,
            title: 'Invoice Implementation Architecture',
            content: '# Invoice Engine Summary\n\nAutomatically generated engineering documentation for this build.',
            path: 'docs/architecture.md',
            artifact_type: 'architecture'
        });
        if (docsToSave.length > 0) {
            await index_1.db.insertInto('documentation_artifacts').values(docsToSave).execute();
        }
    }
    async getDocumentation(buildId) {
        return index_1.db.selectFrom('documentation_artifacts').selectAll().where('build_id', '=', buildId).execute();
    }
}
exports.DocumentationService = DocumentationService;
exports.documentationService = new DocumentationService();
