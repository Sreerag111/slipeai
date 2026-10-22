import { NextResponse } from 'next/server';
import { INITIAL_METRICS } from '@/lib/demoData';

export async function GET() {
  const usageHistory = [
    { day: 'Oct 01', photoCredits: 780, adGenCredits: 140, total: 920 },
    { day: 'Oct 04', photoCredits: 1120, adGenCredits: 230, total: 1350 },
    { day: 'Oct 07', photoCredits: 940, adGenCredits: 180, total: 1120 },
    { day: 'Oct 10', photoCredits: 1450, adGenCredits: 310, total: 1760 },
    { day: 'Oct 13', photoCredits: 1890, adGenCredits: 420, total: 2310 },
    { day: 'Oct 16', photoCredits: 1650, adGenCredits: 390, total: 2040 },
    { day: 'Oct 19', photoCredits: 2120, adGenCredits: 510, total: 2630 },
    { day: 'Oct 21 (Today)', photoCredits: 890, adGenCredits: 190, total: 1080 },
  ];

  return NextResponse.json({
    metrics: INITIAL_METRICS,
    usageHistory,
    organization: {
      id: 'org_slipe_enterprise',
      name: 'Slipe AI Enterprise Media',
      tier: 'Enterprise Scale Plan',
      slaGuarantee: '99.98% High-Concurrency SLA',
      allocatedCredits: 50000,
      usedCredits: 7150,
      balanceCredits: 42850,
      resetDate: '2026-11-01T00:00:00Z',
    },
  });
}
