import { NextRequest, NextResponse } from 'next/server';
import { getGcpVmStatus, startGcpVm, stopGcpVm } from '@/lib/gcpVmManager';

export async function GET() {
  try {
    const status = await getGcpVmStatus();
    let isHealthy = false;

    if (status === 'RUNNING') {
      try {
        const workerUrl = process.env.LTX_VIDEO_WORKER_URL || 'http://34.123.184.87:8000';
        const res = await fetch(`${workerUrl}/health`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const healthData = await res.json();
          isHealthy = healthData.status === 'healthy';
        }
      } catch {
        isHealthy = false;
      }
    }

    return NextResponse.json({
      status,
      isHealthy,
      ip: '34.123.184.87',
      isSleeping: status === 'TERMINATED' || status === 'STOPPING',
      isWaking: status === 'PROVISIONING' || status === 'STAGING',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to check worker status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action; // 'start' | 'stop'

    if (action === 'start') {
      const res = await startGcpVm();
      return NextResponse.json(res);
    } else if (action === 'stop') {
      const res = await stopGcpVm();
      return NextResponse.json(res);
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "start" or "stop"' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Worker control error' }, { status: 500 });
  }
}
