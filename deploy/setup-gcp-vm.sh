#!/usr/bin/env bash
# ==============================================================================
# Slipe AI Enterprise - Google Cloud LTX-Video Deployment Script
# Provisions NVIDIA L4 (24GB VRAM) on Compute Engine (g2-standard-8)
# ==============================================================================

set -euo pipefail

PROJECT_ID="paceai-4733a"
ZONE="us-central1-a"
INSTANCE_NAME="slipe-ltx-video-worker"
MACHINE_TYPE="g2-standard-8"
ACCELERATOR="type=nvidia-l4,count=1"
DISK_SIZE="100GB"
BUCKET_NAME="paceai-4733a-video-output"

echo "=========================================================="
echo " Slipe AI Enterprise - LTX-Video GPU Deployment on GCP"
echo " Target Project: $PROJECT_ID"
echo " Zone: $ZONE"
echo " Machine Type: $MACHINE_TYPE (1x NVIDIA L4 24GB VRAM)"
echo "=========================================================="

# 1. Enable Required Google Cloud APIs
echo "[1/6] Enabling required GCP APIs..."
gcloud services enable \
    compute.googleapis.com \
    storage.googleapis.com \
    logging.googleapis.com \
    --project="$PROJECT_ID"

# 2. Create Private Cloud Storage Bucket for Video Outputs
echo "[2/6] Configuring Google Cloud Storage Bucket: gs://$BUCKET_NAME..."
if ! gsutil ls -b "gs://$BUCKET_NAME" >/dev/null 2>&1; then
    gsutil mb -p "$PROJECT_ID" -c STANDARD -l us-central1 -b on "gs://$BUCKET_NAME"
    echo "Bucket gs://$BUCKET_NAME created successfully."
else
    echo "Bucket gs://$BUCKET_NAME already exists."
fi

# 3. Create Firewall Rule for Worker API (Port 8000)
echo "[3/6] Configuring VPC firewall rule for inference worker..."
if ! gcloud compute firewall-rules describe allow-ltx-worker --project="$PROJECT_ID" >/dev/null 2>&1; then
    gcloud compute firewall-rules create allow-ltx-worker \
        --project="$PROJECT_ID" \
        --direction=INGRESS \
        --priority=1000 \
        --network=default \
        --action=ALLOW \
        --rules=tcp:8000 \
        --source-ranges=0.0.0.0/0 \
        --target-tags=ltx-video-worker
    echo "Firewall rule created."
fi

# 4. Provision Compute Engine G2 Instance with NVIDIA L4 GPU
echo "[4/6] Provisioning G2 Compute Engine Instance ($MACHINE_TYPE)..."
gcloud compute instances create "$INSTANCE_NAME" \
    --project="$PROJECT_ID" \
    --zone="$ZONE" \
    --machine-type="$MACHINE_TYPE" \
    --accelerator="$ACCELERATOR" \
    --maintenance-policy=TERMINATE \
    --tags=ltx-video-worker \
    --image-family=common-cu124-ubuntu-2204 \
    --image-project=deeplearning-platform-release \
    --boot-disk-size="$DISK_SIZE" \
    --boot-disk-type=pd-ssd \
    --scopes=https://www.googleapis.com/auth/cloud-platform \
    --metadata=install-nvidia-driver=True

echo "Instance provisioned. Waiting for instance to initialize..."
sleep 30

# 5. Fetch External IP
EXTERNAL_IP=$(gcloud compute instances describe "$INSTANCE_NAME" \
    --project="$PROJECT_ID" \
    --zone="$ZONE" \
    --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

echo "=========================================================="
echo " Instance deployed successfully!"
echo " External IP: http://$EXTERNAL_IP:8000"
echo " Worker Health Check: http://$EXTERNAL_IP:8000/health"
echo " Next: Configure LTX_VIDEO_WORKER_URL=http://$EXTERNAL_IP:8000 in .env.local"
echo "=========================================================="
