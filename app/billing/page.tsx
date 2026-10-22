'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ArrowRight,
  Download,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const tiers = [
    {
      name: 'Starter Studio',
      price: billingCycle === 'annual' ? '$490/mo' : '$590/mo',
      period: 'billed annually',
      description: 'Ideal for independent photo restoration and boutique e-commerce studios.',
      credits: '10,000 Images / month',
      features: [
        'All 10 Slipe AI photo enhancement features',
        'AI Ad Image Generator (500 variations)',
        'Concurrent queue: 5 jobs',
        'Standard bulk ZIP exports',
        'Email SLA: 24-hour turnaround',
      ],
      current: false,
    },
    {
      name: 'Enterprise Scale Plan',
      price: billingCycle === 'annual' ? '$1,490/mo' : '$1,790/mo',
      period: 'billed annually',
      description: 'Our premier tier for high-volume catalogs, creative agencies, and marketplace platforms.',
      credits: '50,000 Images / month',
      features: [
        'Dedicated Slipe AI high-throughput clusters',
        'Unlimited AI Ad Image Generator variations',
        'Unlimited concurrent batch workers',
        'Priority multi-gigabyte ZIP packaging',
        'Custom export naming & folder preservation',
        '99.98% High-Availability SLA guarantee',
        'Dedicated Solutions Architect support',
      ],
      current: true,
    },
    {
      name: 'Global Custom Tier',
      price: 'Custom Pricing',
      period: 'tailored contracts',
      description: 'For Fortune 500 enterprises processing millions of assets with bespoke security.',
      credits: '500,000+ Images / month',
      features: [
        'On-premise or VPC Slipe AI model deployment',
        'Custom model fine-tuning for brand guidelines',
        'SOC2 Type II & ISO 27001 compliance',
        'Custom Firebase or AWS S3 direct sync',
        '24/7 Phone & Slack war room SLA',
      ],
      current: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Credits & Billing Management</h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage your organization subscription, credit reload thresholds, and enterprise billing invoices.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-200 p-1 rounded-lg border border-slate-300 text-xs">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 py-1 rounded transition-colors ${
              billingCycle === 'monthly' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-3 py-1 rounded transition-colors flex items-center space-x-1 ${
              billingCycle === 'annual' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Annual</span>
            <span className="text-[10px] text-emerald-600 font-mono font-semibold">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Current Quota Status Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-container text-slate-900">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 block font-semibold">
            CURRENT SUBSCRIPTION
          </span>
          <div className="flex items-center space-x-3 mt-1">
            <h3 className="text-lg font-bold text-slate-900">Enterprise Scale Plan</h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            42,850 of 50,000 images remaining. Cycle renews on November 1, 2026.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all">
            + Purchase Image Add-on (10k)
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-xl p-6 flex flex-col justify-between border transition-all bg-white shadow-container text-slate-900 ${
              tier.current
                ? 'border-blue-500 ring-2 ring-blue-500/20'
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-base">{tier.name}</h4>
                {tier.current && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    YOUR PLAN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2 min-h-[36px]">{tier.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-2xl font-black text-slate-900 font-mono">{tier.price}</div>
                <div className="text-[11px] text-slate-500 font-mono">{tier.period}</div>
                <div className="mt-2 text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 inline-block">
                  {tier.credits}
                </div>
              </div>

              {/* Features List */}
              <ul className="mt-5 space-y-2 text-xs text-slate-600">
                {tier.features.map((feat, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              {tier.current ? (
                <button
                  disabled
                  className="w-full py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-xs font-semibold cursor-default"
                >
                  Current Active Plan
                </button>
              ) : (
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm">
                  {tier.price === 'Custom Pricing' ? 'Contact Sales' : 'Switch to Plan'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
