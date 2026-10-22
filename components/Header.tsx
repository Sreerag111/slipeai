'use client';

import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  ChevronDown,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const [showOrgMenu, setShowOrgMenu] = useState(false);

  return (
    <header className="h-16 px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Search Input Bar */}
      <div className="flex items-center space-x-3 w-72 md:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search batches, assets, jobs (⌘K)..."
            className="w-full bg-slate-100/90 hover:bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Controls: SlipeAI Status with Logo, Org, User */}
      <div className="flex items-center space-x-3.5">
        {/* SlipeAI Live Status Pill with uploaded logo (White Container with Shade) */}
        <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-medium shadow-sm">
          <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 border border-slate-200 bg-white">
            <img src="/slipe-logo.png" alt="Slipe AI Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-900 font-bold tracking-tight">Slipe AI</span>
          </div>
          <span className="text-black font-mono text-[10px] font-bold border-l border-slate-200 pl-2 tracking-wider">ENTERPRISE</span>
        </div>

        {/* Organization Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowOrgMenu(!showOrgMenu)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="max-w-[120px] truncate font-medium">Slipe AI Studios</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showOrgMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 text-slate-400 font-mono text-[10px]">
                ORGANIZATIONS
              </div>
              <button
                onClick={() => setShowOrgMenu(false)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900">Slipe AI Studios</div>
                  <div className="text-[10px] text-slate-500">Enterprise Scale Tier</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => setShowOrgMenu(false)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-600"
              >
                <div className="font-medium text-slate-800">Acme Global E-Commerce</div>
                <div className="text-[10px] text-slate-500">Production Tier</div>
              </button>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <Link
                  href="/team"
                  onClick={() => setShowOrgMenu(false)}
                  className="block px-3 py-1.5 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage Organizations →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar with Slipe AI Logo */}
        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm shrink-0 bg-white">
          <img src="/slipe-logo.png" alt="Slipe AI Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
