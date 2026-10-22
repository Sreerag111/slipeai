'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Grid,
  Layers,
  Megaphone,
  ListOrdered,
  Download,
  History,
  BarChart3,
  CreditCard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Video,
} from 'lucide-react';
import { useBatchStore } from '@/lib/batchStore';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  highlight?: boolean;
  badge?: string;
  badgeCount?: number;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { batches } = useBatchStore();

  // Calculate total active items in queue
  const activeQueuedCount = batches.reduce(
    (acc, b) => (b.status === 'running' ? acc + b.items.filter((i) => i.status === 'queued' || i.status === 'processing').length : acc),
    0
  );

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'All Features', href: '/#features', icon: Grid },
    { name: 'Batch Processing', href: '/workspace/upscale', icon: Layers },
    {
      name: 'AI Ad Image Generator',
      href: '/workspace/ad-generator',
      icon: Megaphone,
      highlight: true,
    },
    {
      name: 'AI Video Generator',
      href: '/workspace/video-generator',
      icon: Video,
      highlight: true,
      badge: '1080p',
    },
    {
      name: 'Processing Queue',
      href: '/queue',
      icon: ListOrdered,
      badgeCount: activeQueuedCount > 0 ? activeQueuedCount : undefined,
    },
    { name: 'Download Center', href: '/downloads', icon: Download },
    { name: 'Batch History', href: '/history', icon: History },
    { name: 'API Usage', href: '/api-usage', icon: BarChart3 },
    { name: 'Credits & Billing', href: '/billing', icon: CreditCard },
    { name: 'Team Management', href: '/team', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between shadow-sm ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200">
          {!collapsed ? (
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center bg-black shadow-sm shrink-0">
                <img src="/slipe-logo.png" alt="Slipe AI Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-slate-900 block">SLIPE AI</span>
                <span className="text-[10px] font-mono tracking-wider text-black block -mt-1 font-bold">
                  ENTERPRISE
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center bg-black shadow-sm">
                <img src="/slipe-logo.png" alt="Slipe AI Logo" className="w-full h-full object-cover" />
              </div>
            </Link>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || (item.href.startsWith('/workspace') && pathname.startsWith('/workspace'));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-800'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </div>

                {!collapsed && (
                  <div className="flex items-center space-x-1.5">
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded ${
                        isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.badgeCount !== undefined && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 border border-amber-500/30 rounded-full animate-pulse">
                        {item.badgeCount}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer: White Container with Shade for Enterprise Plan */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-white border border-slate-200/90 text-slate-900 shadow-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-slate-900">Enterprise Plan</span>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between font-mono">
              <span>Images Remaining:</span>
              <span className="text-slate-900 font-semibold">42,850</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-200">
              <div className="bg-blue-600 h-full w-[85%] rounded-full" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Enterprise Scale Tier">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center bg-white shadow-sm">
              <img src="/slipe-logo.png" alt="Slipe AI Logo" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
