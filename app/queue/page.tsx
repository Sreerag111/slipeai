'use client';

import React from 'react';
import Link from 'next/link';
import {
  ListOrdered,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Archive,
  Download,
  Sparkles,
} from 'lucide-react';
import { useBatchStore } from '@/lib/batchStore';
import { BeforeAfterModal } from '@/components/BeforeAfterModal';

export default function ProcessingQueuePage() {
  const {
    batches,
    startBatchProcessing,
    pauseBatchProcessing,
    retryFailedItems,
    openPreview,
    previewItem,
    closePreview,
    isPreviewOpen,
  } = useBatchStore();

  // Aggregate all items across all batches
  const allQueueItems = batches.flatMap((b) =>
    b.items.map((it) => ({
      ...it,
      featureTitle: b.featureTitle,
      batchName: b.name,
      batchStatus: b.status,
    }))
  );

  const queuedCount = allQueueItems.filter((i) => i.status === 'queued').length;
  const processingCount = allQueueItems.filter((i) => i.status === 'processing' || i.status === 'uploading').length;
  const completedCount = allQueueItems.filter((i) => i.status === 'completed').length;
  const failedCount = allQueueItems.filter((i) => i.status === 'failed').length;

  const handlePauseAll = () => {
    batches.forEach((b) => {
      if (b.status === 'running') pauseBatchProcessing(b.id);
    });
  };

  const handleResumeAll = () => {
    batches.forEach((b) => {
      if (b.status === 'paused' || b.status === 'idle') startBatchProcessing(b.id);
    });
  };

  const handleRetryAllFailed = () => {
    batches.forEach((b) => {
      if (b.failedItems > 0) retryFailedItems(b.id);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Processing Queue</h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time multi-batch asynchronous processing monitor with concurrency control.
          </p>
        </div>

        {/* Global Queue Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handlePauseAll}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Pause className="w-3.5 h-3.5 text-amber-400" />
            <span>Pause All</span>
          </button>

          <button
            onClick={handleResumeAll}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume All</span>
          </button>

          {failedCount > 0 && (
            <button
              onClick={handleRetryAllFailed}
              className="px-3.5 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-700 border border-rose-300 rounded-lg text-xs font-medium flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry All Failed ({failedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-container text-slate-900">
          <span className="text-xs text-slate-500 block">Active Processing</span>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">{processingCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-container text-slate-900">
          <span className="text-xs text-slate-500 block">Pending in Queue</span>
          <div className="text-2xl font-bold text-blue-600 font-mono mt-1">{queuedCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-container text-slate-900">
          <span className="text-xs text-slate-500 block">Completed Today</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">{completedCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-container text-slate-900">
          <span className="text-xs text-slate-500 block">Failed / Timed Out</span>
          <div className="text-2xl font-bold text-rose-600 font-mono mt-1">{failedCount}</div>
        </div>
      </div>

      {/* Global Queue Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-container text-slate-900">
        {allQueueItems.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ListOrdered className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-800">Processing queue is currently empty</h4>
            <p className="text-xs text-slate-500">
              Launch a batch processing job from any feature workspace to queue tasks.
            </p>
            <Link
              href="/workspace/upscale"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium inline-block shadow-sm"
            >
              Go to Upscale Workspace
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-3">Thumbnail</th>
                  <th className="py-3 px-3">Filename</th>
                  <th className="py-3 px-3">Feature</th>
                  <th className="py-3 px-3">Batch ID</th>
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 w-36">Progress</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allQueueItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div
                        onClick={() => openPreview(item)}
                        className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group relative shrink-0"
                      >
                        <img
                          src={item.enhancedUrl || item.thumbnailUrl || item.originalUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900 truncate max-w-[200px]" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.mimeType.replace('image/', '').toUpperCase()}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {item.featureTitle}
                    </td>

                    <td className="py-3 px-3 font-mono text-blue-600 font-medium">
                      {item.batchId}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {(item.originalSize / (1024 * 1024)).toFixed(2)} MB
                    </td>

                    <td className="py-3 px-3">
                      {item.status === 'completed' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                          <span>Processing</span>
                        </span>
                      )}
                      {item.status === 'uploading' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                          <span>Uploading</span>
                        </span>
                      )}
                      {item.status === 'queued' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                          <span>Queued</span>
                        </span>
                      )}
                      {item.status === 'failed' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.status === 'completed'
                                ? 'bg-emerald-500'
                                : item.status === 'failed'
                                ? 'bg-rose-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 w-8 text-right">
                          {item.progress}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openPreview(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        title="Inspect"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BeforeAfterModal item={previewItem} isOpen={isPreviewOpen} onClose={closePreview} />
    </div>
  );
}
