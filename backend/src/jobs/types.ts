export enum JobType {
  EXTRACTION = 'EXTRACTION',
  IMPLEMENTATION = 'IMPLEMENTATION',
  TESTING = 'TESTING',
  SECURITY_SCAN = 'SECURITY_SCAN',
  EXECUTION = 'EXECUTION'
}

export enum JobStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

// Defines common progression stages to make progress deterministic
export const ExtractionStages = [
  { name: 'QUEUED', progress: 0 },
  { name: 'PARSING', progress: 20 },
  { name: 'EXTRACTING', progress: 50 },
  { name: 'VALIDATING', progress: 80 },
  { name: 'COMPLETED', progress: 100 }
];

export const ImplementationStages = [
  { name: 'QUEUED', progress: 0 },
  { name: 'ANALYZING', progress: 20 },
  { name: 'PLANNING', progress: 35 },
  { name: 'IMPLEMENTING', progress: 60 },
  { name: 'TESTING', progress: 85 },
  { name: 'COMPLETED', progress: 100 }
];

export const TestingStages = [
  { name: 'QUEUED', progress: 0 },
  { name: 'RUNNING', progress: 50 },
  { name: 'COMPLETED', progress: 100 }
];

export const ExecutionStages = [
  { name: 'QUEUED', progress: 0 },
  { name: 'RUNNING', progress: 50 },
  { name: 'COMPLETED', progress: 100 }
];
