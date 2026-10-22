import { NextRequest, NextResponse } from 'next/server';
import { videoJobsStore } from '@/lib/videoStore';
import { VideoGenerationJob } from '@/lib/types';
import { stopGcpVm } from '@/lib/gcpVmManager';

// Tracks whether an auto-shutdown has already been scheduled for this job completion
const shutdownScheduled = new Set<string>();

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  const existingLocalJob = videoJobsStore.get(jobId);

  // 1. If already completed locally, return stored result directly
  if (existingLocalJob && existingLocalJob.status === 'completed' && existingLocalJob.videoUrl) {
    return NextResponse.json(existingLocalJob);
  }

  // 2. Query the live Google Cloud GPU worker
  const workerUrl = process.env.LTX_VIDEO_WORKER_URL || 'http://34.123.184.87:8000';
  if (workerUrl) {
    try {
      const res = await fetch(`${workerUrl}/api/v1/jobs/${jobId}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const workerData = await res.json();

        const updatedJob: VideoGenerationJob = {
          id: jobId,
          prompt: existingLocalJob?.prompt || 'Cinematic LTX-Video Generation',
          mode: existingLocalJob?.mode || 'text-to-video',
          inputImageUrl: existingLocalJob?.inputImageUrl,
          status: workerData.status,
          progress: workerData.progress,
          currentStage: workerData.current_stage,
          videoUrl: workerData.video_url || existingLocalJob?.videoUrl,
          width: workerData.width || 1920,
          height: workerData.height || 1080,
          fps: workerData.fps || 24,
          durationSeconds: workerData.duration_seconds || 5,
          inferenceTimeMs: workerData.inference_time_ms,
          upscaleTimeMs: workerData.upscale_time_ms,
          error: workerData.error,
          settings: existingLocalJob?.settings || {
            prompt: 'Live LTX-Video generation',
            resolution: '1080p',
            width: 1920,
            height: 1080,
            durationSeconds: 5,
            fps: 24,
            numInferenceSteps: 25,
            guidanceScale: 3.0,
            modelCheckpoint: 'Lightricks/LTX-Video',
          },
          createdAt: existingLocalJob?.createdAt || new Date().toISOString(),
          completedAt: workerData.status === 'completed' ? (existingLocalJob?.completedAt || new Date().toISOString()) : undefined,
        };

        videoJobsStore.set(jobId, updatedJob);

        // Auto-Stop Trigger: When the user receives the completed output, turn off the GPU
        if (workerData.status === 'completed' && !shutdownScheduled.has(jobId)) {
          shutdownScheduled.add(jobId);
          console.log(`[jobs/${jobId}] Output delivered to user! Initiating auto-shutdown of Cloud GPU to prevent idle cost...`);
          
          // Schedule graceful shutdown after short delay so user's browser finishes downloading
          setTimeout(async () => {
            try {
              // Verify no other active jobs are queued
              let anyActive = false;
              videoJobsStore.forEach((j) => {
                if (j.id !== jobId && (j.status === 'queued' || j.status === 'processing')) {
                  anyActive = true;
                }
              });

              if (!anyActive) {
                console.log('[jobs/route] No other active jobs found. Powering down Cloud GPU worker...');
                await stopGcpVm();
              } else {
                console.log('[jobs/route] Other active jobs in queue, keeping GPU awake.');
              }
            } catch (err) {
              console.warn('[jobs/route] Error during auto-stop:', err);
            }
          }, 6000); // 6-second grace window
        }

        return NextResponse.json(updatedJob);
      }
    } catch (e: any) {
      // If worker query fails (e.g. worker is sleeping or shutting down), fall back to local store
      console.warn(`[jobs/${jobId}] Worker poll note: ${e.message}`);
    }
  }

  // 3. Fallback to local store
  if (existingLocalJob) {
    return NextResponse.json(existingLocalJob);
  }

  return NextResponse.json({ error: 'Job not found' }, { status: 404 });
}
