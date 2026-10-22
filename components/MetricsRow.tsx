'use client';

import React from 'react';
import {
  FileCheck2,
  Layers,
  CheckCircle,
  AlertOctagon,
  Coins,
} from 'lucide-react';
import { INITIAL_METRICS } from '@/lib/demoData';
import { useBatchStore } from '@/lib/batchStore';

export function MetricsRow() {
  const { batches } = useBatchStore();

  // Dynamically augment metrics with active batch state
  const runningBatchesCount = batches.filter((b) => b.status === 'running').length;
  const completedBatchesCount = batches.filter((b) => b.status === 'completed').length;
  const totalCompletedFiles = batches.reduce((acc, b) => acc + b.completedItems, 0);

  const metrics = [
    {
      label: 'Total Files Processed',
      value: (INITIAL_METRICS.totalProcessed + totalCompletedFiles).toLocaleString(),
      change: '+14.2% this week',
      icon: FileCheck2,
      accent: 'text-blue-400',
    },
    {
      label: 'Active Batches',
      value: String(runningBatchesCount || INITIAL_METRICS.activeBatches),
      change: 'Processing concurrent queue',
      icon: Layers,
      accent: 'text-amber-400',
    },
    {
      label: 'Completed Batches',
      value: (INITIAL_METRICS.completedBatches + completedBatchesCount).toLocaleString(),
      change: '100% verifiable output',
      icon: CheckCircle,
      accent: 'text-emerald-400',
    },
    {
      label: 'Failed Files',
      value: String(INITIAL_METRICS.failedFiles),
      change: '99.99% Reliability SLA',
      icon: AlertOctagon,
      accent: 'text-rose-400',
    },
    {
      label: 'Images Remaining',
      value: INITIAL_METRICS.creditsRemaining.toLocaleString(),
      change: '50,000 Total Allocation',
      icon: Coins,
      accent: 'text-cyan-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-container hover:shadow-container-hover transition-all flex flex-col justify-between text-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 truncate pr-1">{m.label}</span>
              <Icon className={`w-4 h-4 shrink-0 ${m.accent}`} />
            </div>

            <div className="mt-2.5">
              <div className="text-xl font-bold tracking-tight text-slate-900 font-mono">{m.value}</div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center space-x-1 truncate font-mono">
                <span>{m.change}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
