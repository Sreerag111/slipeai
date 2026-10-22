import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const GCLOUD_PATH = process.env.GCLOUD_PATH || 'C:\\Users\\sreer\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd';
const VM_NAME = process.env.GCP_VM_NAME || 'slipe-ltx-video-worker';
const VM_ZONE = process.env.GCP_VM_ZONE || 'us-central1-c';
const GCP_PROJECT = process.env.GCP_PROJECT_ID || 'paceai-4733a';
const WORKER_URL = process.env.LTX_VIDEO_WORKER_URL || 'http://34.123.184.87:8000';

export type VmStatus = 'RUNNING' | 'TERMINATED' | 'PROVISIONING' | 'STAGING' | 'STOPPING' | 'SUSPENDED' | 'UNKNOWN';

export async function getGcpVmStatus(): Promise<VmStatus> {
  try {
    const cmd = `"${GCLOUD_PATH}" compute instances describe ${VM_NAME} --zone=${VM_ZONE} --project=${GCP_PROJECT} --format="get(status)"`;
    const { stdout } = await execAsync(cmd, { timeout: 15000 });
    const status = stdout.trim().toUpperCase() as VmStatus;
    return status || 'UNKNOWN';
  } catch (err: any) {
    console.error('[gcpVmManager] Error getting VM status:', err?.message || err);
    return 'UNKNOWN';
  }
}

export async function startGcpVm(): Promise<{ success: boolean; status?: string; error?: string }> {
  try {
    const currentStatus = await getGcpVmStatus();
    if (currentStatus === 'RUNNING') {
      return { success: true, status: 'RUNNING' };
    }

    console.log(`[gcpVmManager] Initiating asynchronous start for VM ${VM_NAME}...`);
    const cmd = `"${GCLOUD_PATH}" compute instances start ${VM_NAME} --zone=${VM_ZONE} --project=${GCP_PROJECT} --async`;
    await execAsync(cmd, { timeout: 20000 });
    return { success: true, status: 'STARTING' };
  } catch (err: any) {
    // If already starting or running, treat as success
    if (err?.message?.includes('already running') || err?.message?.includes('RUNNING')) {
      return { success: true, status: 'RUNNING' };
    }
    console.error('[gcpVmManager] Failed to start VM:', err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function stopGcpVm(): Promise<{ success: boolean; error?: string }> {
  try {
    const currentStatus = await getGcpVmStatus();
    if (currentStatus === 'TERMINATED' || currentStatus === 'STOPPING') {
      return { success: true };
    }

    console.log(`[gcpVmManager] Initiating asynchronous stop for VM ${VM_NAME} to save compute costs...`);
    const cmd = `"${GCLOUD_PATH}" compute instances stop ${VM_NAME} --zone=${VM_ZONE} --project=${GCP_PROJECT} --async`;
    await execAsync(cmd, { timeout: 20000 });
    return { success: true };
  } catch (err: any) {
    // If already stopping or stopped, treat as success
    if (err?.message?.includes('STOPPING') || err?.message?.includes('TERMINATED')) {
      return { success: true };
    }
    console.error('[gcpVmManager] Failed to stop VM:', err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function pollWorkerReady(maxWaitSeconds = 90): Promise<boolean> {
  const startTime = Date.now();
  while ((Date.now() - startTime) < maxWaitSeconds * 1000) {
    try {
      const res = await fetch(`${WORKER_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'healthy' && data.model_loaded) {
          console.log('[gcpVmManager] Worker is healthy and model loaded!');
          return true;
        }
      }
    } catch {
      // Still booting or service starting up
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return false;
}
