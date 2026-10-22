'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, CheckCircle2, Building2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

function InviteContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'team.member@gmail.com';
  const orgName = searchParams.get('org') || 'Slipe AI Studios';
  const token = searchParams.get('token') || 'inv_default';

  const [accepted, setAccepted] = useState(false);

  return (
    <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl p-8 shadow-hero-shade text-center space-y-6 text-slate-900">
      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center bg-white mx-auto shadow-sm">
        <img src="/slipe-logo.png" alt="Slipe AI Logo" className="w-full h-full object-cover" />
      </div>

      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 font-semibold">
          WORKSPACE INVITATION
        </span>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Join {orgName}</h1>
        <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
          You have been invited to join the enterprise workspace as a media collaborator for{' '}
          <span className="text-slate-900 font-semibold">{email}</span>.
        </p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2 text-xs">
        <div className="flex justify-between text-slate-500">
          <span>Organization:</span>
          <span className="text-slate-900 font-medium">{orgName}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Target Account:</span>
          <span className="text-slate-900 font-mono font-medium">{email}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Enterprise SLA:</span>
          <span className="text-emerald-600 font-semibold">99.98% High Availability</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Assigned Role:</span>
          <span className="text-blue-600 font-semibold">Media Engineer</span>
        </div>
      </div>

      {!accepted ? (
        <button
          onClick={() => setAccepted(true)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2"
        >
          <span>Accept Invitation & Enter Platform</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-center space-x-2 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Workspace Access Granted!</span>
          </div>
          <Link
            href="/"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center space-x-2 shadow-md"
          >
            <span>Go to Slipe AI Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span>Loading invitation payload...</span>
          </div>
        }
      >
        <InviteContent />
      </Suspense>
    </div>
  );
}
