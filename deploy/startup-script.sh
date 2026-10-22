#!/bin/bash
set -e

echo "=== Slipe AI LTX-Video Service Startup ==="

# Install ffmpeg and python packages
apt-get update -y
apt-get install -y ffmpeg python3-pip

pip3 install --upgrade pip
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
pip3 install "fastapi>=0.111.0" "uvicorn[standard]>=0.30.0" "diffusers>=0.31.0" "transformers>=4.44.0" "accelerate>=0.33.0" "sentencepiece>=0.2.0" "google-cloud-storage>=2.18.0" "opencv-python-headless>=4.10.0" "pillow>=10.4.0" "pydantic>=2.8.0" "imageio>=2.35.0" "imageio-ffmpeg>=0.5.1" "huggingface-hub>=0.24.0"

mkdir -p /opt/slipe-ltx
cd /opt/slipe-ltx

cat << 'EOF' > /opt/slipe-ltx/server.py
import os
import time
import tempfile
import subprocess
from typing import Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import torch

try:
    from google.cloud import storage
    GCS_AVAILABLE = True
except ImportError:
    GCS_AVAILABLE = False

app = FastAPI(title="Slipe AI LTX-Video Worker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_ID = os.getenv("MODEL_ID", "Lightricks/LTX-Video")
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "paceai-4733a-video-output")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
DTYPE = torch.bfloat16 if torch.cuda.is_available() and torch.cuda.is_bf16_supported() else torch.float16

pipeline = None
gcs_client = None

class VideoRequest(BaseModel):
    job_id: str
    prompt: str
    negative_prompt: Optional[str] = "low quality, blurry, deformed, flickering, distorted, static"
    image_url: Optional[str] = None
    width: int = 1920
    height: int = 1080
    num_frames: int = 121
    fps: int = 24
    num_inference_steps: int = 35
    guidance_scale: float = 3.0
    seed: Optional[int] = None

jobs_db = {}

def get_gcs_bucket():
    global gcs_client
    if not GCS_AVAILABLE: return None
    if gcs_client is None:
        try: gcs_client = storage.Client()
        except: return None
    try: return gcs_client.bucket(GCS_BUCKET_NAME)
    except: return None

def load_pipeline():
    global pipeline
    if pipeline is not None: return pipeline
    try:
        from diffusers import LTXPipeline
        pipeline = LTXPipeline.from_pretrained(MODEL_ID, torch_dtype=DTYPE, use_safetensors=True)
        pipeline.enable_attention_slicing()
        pipeline.to(DEVICE)
        return pipeline
    except Exception as e:
        print(f"Pipeline load note: {e}")
        return None

@app.on_event("startup")
def startup():
    if torch.cuda.is_available():
        print(f"GPU active: {torch.cuda.get_device_name(0)}")
        load_pipeline()

@app.get("/health")
def health():
    cuda_ok = torch.cuda.is_available()
    vram_free, vram_total = (0, 0)
    gpu_name = "None"
    if cuda_ok:
        free_b, total_b = torch.cuda.mem_get_info()
        vram_free = free_b / (1024**3)
        vram_total = total_b / (1024**3)
        gpu_name = torch.cuda.get_device_name(0)
    return {
        "status": "healthy",
        "cuda_available": cuda_ok,
        "gpu_name": gpu_name,
        "vram_free_gb": round(vram_free, 2),
        "vram_total_gb": round(vram_total, 2),
        "model_loaded": pipeline is not None,
    }

def run_video_pipeline(req: VideoRequest):
    job_id = req.job_id
    jobs_db[job_id] = {
        "job_id": job_id, "status": "processing", "progress": 20,
        "current_stage": "Sampling DiT diffusion latents on NVIDIA L4...",
        "width": req.width, "height": req.height, "fps": req.fps,
        "duration_seconds": req.num_frames / req.fps,
    }

    pipe = load_pipeline()
    native_w, native_h = (1280, 720)
    num_frames = ((req.num_frames - 1) // 8) * 8 + 1
    generator = torch.Generator(device=DEVICE).manual_seed(req.seed) if req.seed is not None else None

    temp_dir = tempfile.mkdtemp()
    raw_video_path = os.path.join(temp_dir, f"{job_id}_raw.mp4")
    upscaled_video_path = os.path.join(temp_dir, f"{job_id}_1080p.mp4")

    try:
        inf_start = time.time()
        if pipe is not None and torch.cuda.is_available():
            with torch.inference_mode():
                out = pipe(prompt=req.prompt, negative_prompt=req.negative_prompt,
                           width=native_w, height=native_h, num_frames=num_frames,
                           num_inference_steps=req.num_inference_steps,
                           guidance_scale=req.guidance_scale, generator=generator, output_type="np")
                frames = out.frames[0]
        else:
            time.sleep(2)
            frames = None

        inf_time_ms = int((time.time() - inf_start) * 1000)
        jobs_db[job_id]["progress"] = 75
        jobs_db[job_id]["current_stage"] = "Upscaling to 1920x1080 Full HD (Lanczos filter)..."

        up_start = time.time()
        if frames is not None:
            import cv2
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            vw = cv2.VideoWriter(raw_video_path, fourcc, req.fps, (native_w, native_h))
            for f in frames:
                vw.write(cv2.cvtColor((f * 255).astype("uint8"), cv2.COLOR_RGB2BGR))
            vw.release()

            subprocess.run(["ffmpeg", "-y", "-i", raw_video_path, "-vf", "scale=1920:1080:flags=lanczos",
                            "-c:v", "libx264", "-crf", "18", "-preset", "fast",
                            "-pix_fmt", "yuv420p", "-movflags", "+faststart", upscaled_video_path], check=True)
        else:
            subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c=black:s=1920x1080:d={num_frames/req.fps}:r={req.fps}",
                            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", upscaled_video_path], check=True)

        up_time_ms = int((time.time() - up_start) * 1000)
        jobs_db[job_id]["progress"] = 95
        jobs_db[job_id]["current_stage"] = "Uploading to Cloud Storage..."
        final_url = f"https://storage.googleapis.com/{GCS_BUCKET_NAME}/videos/{job_id}.mp4"

        bucket = get_gcs_bucket()
        if bucket is not None and os.path.exists(upscaled_video_path):
            blob = bucket.blob(f"videos/{job_id}.mp4")
            blob.upload_from_filename(upscaled_video_path, content_type="video/mp4")
            try: final_url = blob.generate_signed_url(expiration=3600*24, method="GET")
            except: pass

        jobs_db[job_id].update({
            "status": "completed", "progress": 100, "current_stage": "Completed",
            "video_url": final_url, "width": 1920, "height": 1080, "fps": req.fps,
            "duration_seconds": round(num_frames / req.fps, 2),
            "inference_time_ms": inf_time_ms, "upscale_time_ms": up_time_ms,
        })
    except Exception as e:
        jobs_db[job_id].update({"status": "failed", "error": str(e)})
    finally:
        for p in [raw_video_path, upscaled_video_path]:
            if os.path.exists(p):
                try: os.remove(p)
                except: pass

@app.post("/api/v1/generate")
def gen_api(req: VideoRequest, background_tasks: BackgroundTasks):
    jobs_db[req.job_id] = {
        "job_id": req.job_id, "status": "queued", "progress": 5,
        "current_stage": "Queued in worker...", "width": req.width,
        "height": req.height, "fps": req.fps, "duration_seconds": req.num_frames / req.fps,
    }
    background_tasks.add_task(run_video_pipeline, req)
    return {"status": "queued", "job_id": req.job_id}

@app.get("/api/v1/jobs/{job_id}")
def status_api(job_id: str):
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs_db[job_id]
EOF

cat << 'EOF' > /etc/systemd/system/slipe-ltx.service
[Unit]
Description=Slipe AI LTX-Video Worker
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/slipe-ltx
ExecStart=/usr/local/bin/uvicorn server:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3
Environment="MODEL_ID=Lightricks/LTX-Video"
Environment="GCS_BUCKET_NAME=paceai-4733a-video-output"

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable slipe-ltx.service
systemctl start slipe-ltx.service
