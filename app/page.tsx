'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  Download,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Zap,
  Video,
} from 'lucide-react';
import { FEATURES } from '@/lib/features';
import { FeatureCard } from '@/components/FeatureCard';
import { MetricsRow } from '@/components/MetricsRow';
import { useBatchStore } from '@/lib/batchStore';
import { RECENT_BATCH_HISTORY } from '@/lib/demoData';

export default function DashboardPage() {
  const { batches, isBackendLive } = useBatchStore();

  // Combine stored batches with recent history
  const activeBatches = batches.length > 0 ? batches : RECENT_BATCH_HISTORY;

  return (
    <div className="space-y-10">
      {/* Top Enterprise Metric Row */}
      <MetricsRow />

      {/* Main Dashboard Hero Section */}
      <div className="relative rounded-2xl bg-white border border-slate-200/90 p-8 md:p-10 overflow-hidden shadow-hero-shade text-slate-900">
        <div className="relative z-10 max-w-3xl space-y-3">
          <h1
            className="original-hero-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight"
            style={{
              fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
              fontWeight: 800,
            }}
          >
            Enhance at Scale.
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Batch-process photos and generate advertising creatives with AI. Upload thousands of assets, process them efficiently, and download your results in bulk.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/workspace/upscale"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>Launch Batch Upscaler</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/workspace/ad-generator"
              className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
            >
              <span>AI Ad Image Generator</span>
            </Link>

            <Link
              href="/workspace/video-generator"
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
            >
              <Video className="w-3.5 h-3.5" />
              <span>AI Video Generator</span>
              <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-mono font-bold">1080p</span>
            </Link>

            <Link
              href="/queue"
              className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center space-x-1 transition-colors"
            >
              <span>View Processing Queue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none" />
      </div>

      {/* Feature Grid: Centerpiece of Dashboard (4 cols on wide screens, 3 cols md, 2 cols sm) */}
      <section id="features" className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">AI Enhancement Tools & Generative Suite</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Select any feature container to open its dedicated batch processing workspace.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold">{FEATURES.length} Modular Engines</span>
        </div>

        {/* Responsive Grid: 4 cols on desktop, 3 on md, 2 on sm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </section>

      {/* Below the Grid: Recent Batches & Processing Queue Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {/* Left Column (8 cols): Recent Batches Table */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Batch Operations</h3>
            </div>
            <Link href="/history" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
              View All History →
            </Link>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-container text-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Batch ID</th>
                    <th className="py-3 px-3">Feature</th>
                    <th className="py-3 px-3">Assets</th>
                    <th className="py-3 px-3">Progress</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeBatches.slice(0, 5).map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {batch.id}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-800 font-medium">{batch.featureTitle}</span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {(batch.totalSizeBytes / (1024 * 1024)).toFixed(1)} MB
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {batch.completedItems}/{batch.totalItems}
                      </td>
                      <td className="py-3 px-3 w-36">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all"
                              style={{ width: `${batch.overallProgress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-600">
                            {batch.overallProgress}%
                          </span>
                        </div>
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
                            <span>Processing</span>
                          </span>
                        )}
                        {batch.status === 'idle' && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                            <span>Ready</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/workspace/${batch.featureId}`}
                          className="px-2.5 py-1 bg-white hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200 rounded text-xs transition-colors inline-block shadow-sm"
                        >
                          Open Workspace
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): API Usage Summary & Allocation Meter */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">API Usage & Allocation</h3>
            <Link href="/api-usage" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
              Details →
            </Link>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 shadow-container text-slate-900">
            <div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Monthly Images Remaining</span>
                <span className="font-mono text-slate-900 font-semibold">42,850 / 50,000</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full w-[85%] rounded-full" />
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-slate-700">Slipe Photo AI Calls</span>
                </span>
                <span className="font-mono text-slate-900 font-medium">21,450 reqs</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-slate-700">AI Ad Generation Calls</span>
                </span>
                <span className="font-mono text-slate-900 font-medium">3,820 reqs</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-slate-700">Next Quota Reset Date</span>
                </span>
                <span className="font-mono text-slate-900 font-medium">Nov 1, 2026</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex space-x-2">
              <Link
                href="/billing"
                className="flex-1 py-1.5 text-center text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm"
              >
                Upgrade Plan
              </Link>
              <Link
                href="/settings"
                className="flex-1 py-1.5 text-center text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
