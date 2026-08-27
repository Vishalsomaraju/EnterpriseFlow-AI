"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionStages = exports.TestingStages = exports.ImplementationStages = exports.ExtractionStages = exports.JobStatus = exports.JobType = void 0;
var JobType;
(function (JobType) {
    JobType["EXTRACTION"] = "EXTRACTION";
    JobType["IMPLEMENTATION"] = "IMPLEMENTATION";
    JobType["TESTING"] = "TESTING";
    JobType["SECURITY_SCAN"] = "SECURITY_SCAN";
    JobType["EXECUTION"] = "EXECUTION";
})(JobType || (exports.JobType = JobType = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["QUEUED"] = "QUEUED";
    JobStatus["RUNNING"] = "RUNNING";
    JobStatus["COMPLETED"] = "COMPLETED";
    JobStatus["FAILED"] = "FAILED";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
// Defines common progression stages to make progress deterministic
exports.ExtractionStages = [
    { name: 'QUEUED', progress: 0 },
    { name: 'PARSING', progress: 20 },
    { name: 'EXTRACTING', progress: 50 },
    { name: 'VALIDATING', progress: 80 },
    { name: 'COMPLETED', progress: 100 }
];
exports.ImplementationStages = [
    { name: 'QUEUED', progress: 0 },
    { name: 'ANALYZING', progress: 20 },
    { name: 'PLANNING', progress: 35 },
    { name: 'IMPLEMENTING', progress: 60 },
    { name: 'TESTING', progress: 85 },
    { name: 'COMPLETED', progress: 100 }
];
exports.TestingStages = [
    { name: 'QUEUED', progress: 0 },
    { name: 'RUNNING', progress: 50 },
    { name: 'COMPLETED', progress: 100 }
];
exports.ExecutionStages = [
    { name: 'QUEUED', progress: 0 },
    { name: 'RUNNING', progress: 50 },
    { name: 'COMPLETED', progress: 100 }
];
