import { VideoGenerationJob } from './types';

// Shared in-memory job repository for active server session
// In production deployment, backed by Cloud Firestore or Memorystore Redis
declare global {
  var __videoJobsStore: Map<string, VideoGenerationJob> | undefined;
}

if (!global.__videoJobsStore) {
  global.__videoJobsStore = new Map<string, VideoGenerationJob>();
}

export const videoJobsStore = global.__videoJobsStore;
