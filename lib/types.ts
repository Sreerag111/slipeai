// Slipe AI Enterprise Type Definitions

export type FeatureCategory = 'photo' | 'ad_generation' | 'video_generation';

export type FeatureId =
  | 'upscale'
  | 'bw-to-color'
  | 'refine'
  | 'dust-scratch'
  | 'clean-up'
  | 'fix-lighting'
  | 'sharpen'
  | 'remove-bg'
  | 'enhance-quality'
  | 'balance-color'
  | 'ad-generator'
  | 'video-generator';

export interface FeatureConfig {
  id: FeatureId;
  title: string;
  shortDescription: string;
  category: FeatureCategory;
  iconName: string;
  tagline: string;
  topazSupported: boolean;
  topazEndpoint?: string;
  defaultSettings: Record<string, any>;
  settingsSchema: FeatureSettingField[];
}

export interface FeatureSettingField {
  id: string;
  label: string;
  description?: string;
  type: 'select' | 'slider' | 'switch' | 'radio' | 'text';
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: any;
}

export type JobStatus = 'queued' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface BatchItem {
  id: string;
  batchId: string;
  name: string;
  originalSize: number; // in bytes
  mimeType: string;
  width?: number;
  height?: number;
  status: JobStatus;
  progress: number; // 0 to 100
  etaSeconds?: number;
  originalUrl: string;
  enhancedUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  topazProcessId?: string;
  settingsSnapshot: Record<string, any>;
  processedAt?: string;
}

export interface BatchJob {
  id: string;
  featureId: FeatureId;
  featureTitle: string;
  name: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  totalSizeBytes: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  overallProgress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  settings: Record<string, any>;
  items: BatchItem[];
}

export interface AdCreativePrompt {
  prompt: string;
  negativePrompt?: string;
  campaignType: 'product_launch' | 'flash_sale' | 'brand_awareness' | 'seasonal' | 'ugc_style';
  aspectRatio: '1:1' | '4:5' | '16:9' | '9:16';
  platformPreset: 'instagram' | 'facebook' | 'google_ads' | 'ecommerce';
  variationsCount: number;
  headlineOverlay?: string;
  ctaText?: string;
  productImage?: string;
}

export interface GeneratedAdCreative {
  id: string;
  title: string;
  prompt: string;
  aspectRatio: '1:1' | '4:5' | '16:9' | '9:16';
  platform: string;
  campaignType: string;
  imageUrl: string;
  createdAt: string;
  selected: boolean;
  headline?: string;
  cta?: string;
}

export interface MetricSummary {
  totalProcessed: number;
  activeBatches: number;
  completedBatches: number;
  failedFiles: number;
  creditsRemaining: number;
  totalCredits: number;
  totalStorageBytes: number;
  monthlyPhotoCalls: number;
  monthlyAdGenCalls: number;
  resetDate: string;
  planName: string;
}

export type VideoAspectRatio = '16:9' | '9:16' | '1:1';
export type VideoResolution = '1080p' | '720p';

export interface VideoGenerationSettings {
  prompt: string;
  negativePrompt?: string;
  inputImageUrl?: string;
  resolution: VideoResolution;
  width: number;
  height: number;
  durationSeconds: number; // e.g. 5
  fps: number; // e.g. 24
  numInferenceSteps: number; // e.g. 30 - 40
  guidanceScale: number; // e.g. 3.0
  seed?: number;
  modelCheckpoint: string; // e.g. 'Lightricks/LTX-Video'
  upscaleMethod?: 'realesrgan' | 'compact' | 'lanczos_ffmpeg';
}

export interface VideoGenerationJob {
  id: string;
  userId?: string;
  prompt: string;
  mode: 'text-to-video' | 'image-to-video';
  inputImageUrl?: string;
  status: 'queued' | 'processing' | 'starting_gpu' | 'denoising' | 'decoding' | 'upscaling' | 'encoding' | 'completed' | 'failed';
  progress: number; // 0 to 100
  etaSeconds?: number;
  currentStage?: string;
  settings: VideoGenerationSettings;
  videoUrl?: string;
  thumbnailUrl?: string;
  fileSizeBytes?: number;
  durationSeconds?: number;
  width?: number;
  height?: number;
  fps?: number;
  inferenceTimeMs?: number;
  upscaleTimeMs?: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}
