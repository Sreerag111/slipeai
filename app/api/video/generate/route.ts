import { NextRequest, NextResponse } from 'next/server';
import { VideoGenerationJob, VideoGenerationSettings } from '@/lib/types';
import { INITIAL_METRICS } from '@/lib/demoData';
import { videoJobsStore } from '@/lib/videoStore';
import { getGcpVmStatus, startGcpVm, pollWorkerReady } from '@/lib/gcpVmManager';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      jobId,
      prompt,
      negativePrompt,
      mode = 'text-to-video',
      inputImageUrl,
      resolution = '1080p',
      durationSeconds = 5,
      fps = 24,
      guidanceScale = 3.0,
      numInferenceSteps = 25,
      seed,
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Atomic Credit Validation & Allocation
    // 1080p Full HD uses 10 credits; 720p uses 6 credits
    const creditCost = resolution === '1080p' ? 10 : 6;
    if (INITIAL_METRICS.creditsRemaining < creditCost) {
      return NextResponse.json(
        { error: 'Insufficient enterprise credits to initiate video generation' },
        { status: 402 }
      );
    }

    // Deduct credits atomically
    INITIAL_METRICS.creditsRemaining -= creditCost;

    const id = jobId || `VID-${Date.now().toString().slice(-4)}-LTX`;
    const width = resolution === '1080p' ? 1920 : 1280;
    const height = resolution === '1080p' ? 1080 : 720;
    // Calculate LTX-Video 8k + 1 frames
    const numFrames = durationSeconds <= 3 ? 49 : 121;

    const settings: VideoGenerationSettings = {
      prompt,
      negativePrompt,
      inputImageUrl,
      resolution,
      width,
      height,
      durationSeconds,
      fps,
      numInferenceSteps,
      guidanceScale,
      seed: seed || Math.floor(Math.random() * 1000000),
      modelCheckpoint: 'Lightricks/LTX-Video',
      upscaleMethod: 'lanczos_ffmpeg',
    };

    const initialJob: VideoGenerationJob = {
      id,
      prompt,
      mode,
      inputImageUrl,
      status: 'queued',
      progress: 5,
      currentStage: 'Initializing task...',
      settings,
      width,
      height,
      durationSeconds: round(numFrames / fps, 2),
      fps,
      createdAt: new Date().toISOString(),
    };

    videoJobsStore.set(id, initialJob);

    // Asynchronous dispatch pipeline with Auto-Wake
    dispatchWithAutoWake(id, settings, numFrames);

    return NextResponse.json({
      success: true,
      job: initialJob,
      remainingCredits: INITIAL_METRICS.creditsRemaining,
    });
  } catch (error: any) {
    console.error('[generate/route] Video generation API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

function round(val: number, dec: number) {
  return Number(Math.round(Number(val + 'e' + dec)) + 'e-' + dec);
}

// Handles checking VM status, auto-waking the GPU if sleeping, and forwarding the job
async function dispatchWithAutoWake(jobId: string, settings: VideoGenerationSettings, numFrames: number) {
  const workerUrl = process.env.LTX_VIDEO_WORKER_URL || 'http://34.123.184.87:8000';

  try {
    // 1. Check if VM is running
    const vmStatus = await getGcpVmStatus();
    console.log(`[generate] Current GCP VM status: ${vmStatus}`);

    if (vmStatus !== 'RUNNING') {
      const current = videoJobsStore.get(jobId);
      if (current) {
        videoJobsStore.set(jobId, {
          ...current,
          progress: 10,
          currentStage: 'Waking up NVIDIA L4 Cloud GPU (cold boot ~35s)...',
        });
      }

      console.log('[generate] Auto-waking GPU instance...');
      await startGcpVm();
    }

    // Always ensure the FastAPI worker and LTX model are loaded and responding on port 8000
    const isReady = await pollWorkerReady(90);
    if (!isReady) {
      const failedJob = videoJobsStore.get(jobId);
      if (failedJob) {
        videoJobsStore.set(jobId, {
          ...failedJob,
          status: 'failed',
          currentStage: 'GPU boot timeout. Please try again.',
          error: 'GPU worker failed to report ready within 90 seconds',
        });
      }
      return;
    }

    // 2. Worker is healthy -> dispatch job
    const current = videoJobsStore.get(jobId);
    if (current) {
      videoJobsStore.set(jobId, {
        ...current,
        progress: 15,
        currentStage: 'Queued on NVIDIA L4 GPU worker...',
      });
    }

    const payload = {
      job_id: jobId,
      prompt: settings.prompt,
      negative_prompt: settings.negativePrompt,
      image_url: settings.inputImageUrl,
      width: settings.width,
      height: settings.height,
      num_frames: numFrames,
      fps: settings.fps,
      num_inference_steps: settings.numInferenceSteps || 25,
      guidance_scale: settings.guidanceScale || 3.0,
      seed: settings.seed,
    };

    console.log(`[generate] Forwarding job ${jobId} to GPU worker...`);
    const res = await fetch(`${workerUrl}/api/v1/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Worker returned HTTP ${res.status}: ${text}`);
    }
  } catch (err: any) {
    console.error(`[generate] Error dispatching job ${jobId}:`, err);
    const existing = videoJobsStore.get(jobId);
    if (existing) {
      videoJobsStore.set(jobId, {
        ...existing,
        status: 'failed',
        currentStage: `Error: ${err?.message || 'Failed to dispatch to GPU worker'}`,
        error: err?.message,
      });
    }
  }
}
