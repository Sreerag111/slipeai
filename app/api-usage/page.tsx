'use client';

import React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Coins,
  Cpu,
  Layers,
  Sparkles,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { INITIAL_METRICS } from '@/lib/demoData';

export default function ApiUsagePage() {
  const usageBreakdown = [
    { day: 'Oct 01', photo: 780, adGen: 140, total: 920 },
    { day: 'Oct 04', photo: 1120, adGen: 230, total: 1350 },
    { day: 'Oct 07', photo: 940, adGen: 180, total: 1120 },
    { day: 'Oct 10', photo: 1450, adGen: 310, total: 1760 },
    { day: 'Oct 13', photo: 1890, adGen: 420, total: 2310 },
    { day: 'Oct 16', photo: 1650, adGen: 390, total: 2040 },
    { day: 'Oct 19', photo: 2120, adGen: 510, total: 2630 },
    { day: 'Oct 21 (Today)', photo: 890, adGen: 190, total: 1080 },
  ];

  const maxVal = 2700;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">API Usage & Credit Telemetry</h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time metering of Slipe AI enhancement compute, generative ad creative requests, and plan quotas.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/billing"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
          >
            Upgrade Plan Allocation
          </Link>
          <a
            href="mailto:enterprise@slipe.ai?subject=Enterprise%20High-Volume%20Contract"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors shadow-sm"
          >
            Contact Sales
          </a>
        </div>
      </div>

      {/* Top Quota Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-container text-slate-900 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Images Allocated</span>
          <div className="text-2xl font-bold text-slate-900 font-mono">50,000</div>
          <span className="text-[10px] text-slate-500 font-mono">Enterprise Tier Base</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-container text-slate-900 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Images Remaining</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono">42,850</div>
          <span className="text-[10px] text-emerald-600 font-mono font-medium">85.7% Healthy Balance</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-container text-slate-900 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Slipe Photo AI Usage</span>
          <div className="text-2xl font-bold text-blue-600 font-mono">21,450</div>
          <span className="text-[10px] text-blue-600 font-mono">API calls this period</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-container text-slate-900 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Ad Creative Generation</span>
          <div className="text-2xl font-bold text-cyan-600 font-mono">3,820</div>
          <span className="text-[10px] text-cyan-600 font-mono">Diffusion synthesis calls</span>
        </div>
      </div>

      {/* Monthly Interactive Usage Chart */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-4 shadow-container text-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Daily API Consumption Volume (October 2026)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated daily calls across Slipe AI Photo Enhancers and Generative Ad Diffusion.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-slate-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
              <span>Photo Enhancement AI</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
              <span>Ad Gen Engine</span>
            </span>
          </div>
        </div>

        {/* CSS Bar Chart */}
        <div className="h-64 pt-6 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-200 pb-3">
          {usageBreakdown.map((item, idx) => {
            const heightPct = Math.round((item.total / maxVal) * 100);
            const photoPct = Math.round((item.photo / item.total) * 100);
            const adGenPct = 100 - photoPct;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                  {item.total}
                </div>
                <div
                  className="w-full max-w-[42px] rounded-t-md overflow-hidden bg-slate-100 flex flex-col justify-end transition-all group-hover:brightness-95"
                  style={{ height: `${heightPct}%` }}
                >
                  <div className="bg-cyan-500 w-full" style={{ height: `${adGenPct}%` }} />
                  <div className="bg-blue-600 w-full" style={{ height: `${photoPct}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-2 truncate max-w-[60px]">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Billing Period Reset Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <span className="font-semibold text-slate-900">Current Billing Cycle</span>
              <p className="text-[11px] text-slate-500">Quota resets automatically in 11 days on Nov 1, 2026</p>
            </div>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-2">
            <Link
              href="/billing"
              className="text-blue-600 hover:text-blue-500 font-semibold underline"
            >
              Adjust Auto-Reload Limits →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
