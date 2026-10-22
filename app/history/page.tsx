'use client';

import React from 'react';
import Link from 'next/link';
import {
  History,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Archive,
  Download,
  RotateCcw,
  Sparkles,
  Calendar,
  HardDrive,
} from 'lucide-react';
import { useBatchStore } from '@/lib/batchStore';
import { RECENT_BATCH_HISTORY } from '@/lib/demoData';

export default function BatchHistoryPage() {
  const { batches } = useBatchStore();

  const allBatches = batches.length > 0 ? batches : RECENT_BATCH_HISTORY;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit-Friendly Batch History</h1>
          <p className="text-xs text-slate-600 mt-1">
            Complete audit trail of all historical enhancement and generation batch jobs across your organization.
          </p>
        </div>

        <Link
          href="/workspace/upscale"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1.5 shadow-md transition-all"
        >
          <span>New Batch Operation</span>
        </Link>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-container text-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-3">Job Name</th>
                <th className="py-3 px-3">Feature Engine</th>
                <th className="py-3 px-3">Completed / Total</th>
                <th className="py-3 px-3">Archive Size</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {batch.id}
                  </td>

                  <td className="py-3 px-3 font-medium text-slate-800">
                    {batch.name}
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {batch.featureTitle}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-700">
                    {batch.completedItems} / {batch.totalItems} items
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600">
                    {(batch.totalSizeBytes / (1024 * 1024)).toFixed(1)} MB
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-500">
                    {new Date(batch.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="py-3 px-3">
                    {batch.status === 'completed' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    )}
                    {batch.status === 'running' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                        <span>Running</span>
                      </span>
                    )}
                    {batch.status === 'idle' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                        <span>Ready</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/workspace/${batch.featureId}`}
                        className="px-2.5 py-1 bg-white hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200 rounded text-xs transition-colors inline-block shadow-sm"
                      >
                        Inspect Workspace
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
