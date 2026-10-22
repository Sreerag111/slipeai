'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  CheckCircle2,
  Trash2,
  Building2,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Send,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Media Engineer' | 'Marketing Editor' | 'Viewer';
  status: 'active' | 'invited';
  lastActive: string;
}

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm-1',
    name: 'Sreeram K.',
    email: 'sreeram@slipe.ai',
    role: 'Owner',
    status: 'active',
    lastActive: 'Just now',
  },
  {
    id: 'm-2',
    name: 'Elena Rostova',
    email: 'elena@slipe.ai',
    role: 'Admin',
    status: 'active',
    lastActive: '24 mins ago',
  },
  {
    id: 'm-3',
    name: 'Marcus Vance',
    email: 'marcus@slipe.ai',
    role: 'Media Engineer',
    status: 'active',
    lastActive: '2 hours ago',
  },
  {
    id: 'm-4',
    name: 'Sophia Chen',
    email: 'sophia@slipe.ai',
    role: 'Marketing Editor',
    status: 'active',
    lastActive: 'Yesterday',
  },
  {
    id: 'm-5',
    name: 'External Audit Bot',
    email: 'api-service@slipe.ai',
    role: 'Viewer',
    status: 'active',
    lastActive: '3 hours ago',
  },
];

export default function TeamManagementPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Member['role']>('Media Engineer');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    success: boolean;
    emailSent: boolean;
    gmailComposeUrl: string;
    mailtoUrl: string;
    inviteUrl: string;
    recipientEmail: string;
    message: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          orgName: 'Slipe AI Studios',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setInviteResult(data);

        // Add to local members list
        setMembers((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}`,
            name: inviteEmail.split('@')[0],
            email: inviteEmail,
            role: inviteRole,
            status: 'invited',
            lastActive: 'Invite Sent',
          },
        ]);

        // If email was not auto-sent via server SMTP, automatically open Gmail compose so she gets it right now!
        if (!data.emailSent && data.gmailComposeUrl) {
          window.open(data.gmailComposeUrl, '_blank');
        }
      }
    } catch (err) {
      console.error('Failed to send invite:', err);
    } finally {
      setIsSending(false);
    }
  };

  const copyInviteUrl = () => {
    if (!inviteResult?.inviteUrl) return;
    navigator.clipboard.writeText(inviteResult.inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Team & RBAC</h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage organization workspaces, seat allocations, and role-based permissions for media operators.
          </p>
        </div>

        <button
          onClick={() => {
            setInviteResult(null);
            setShowInviteModal(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Organization Meta Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-container text-slate-900">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Slipe AI Studios</h3>
            <span className="text-xs text-slate-500 font-mono">Org ID: org_slipe_enterprise · Enterprise Tier</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block">SEATS UTILIZED</span>
            <span className="text-slate-900 font-semibold">{members.length} / 20 Seats</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-500 block">WORKSPACE STATUS</span>
            <span className="text-emerald-600 font-semibold">Enterprise Ready</span>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-container text-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{member.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{member.email}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                      {member.role}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {member.status === 'active' ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200">
                        <span>Invited</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-500">
                    {member.lastActive}
                  </td>

                  <td className="py-3 px-4 text-right">
                    {member.role !== 'Owner' && (
                      <button
                        onClick={() => removeMember(member.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-2xl space-y-4 text-slate-900">
            <h3 className="text-base font-bold text-slate-900">Invite Team Member</h3>

            {!inviteResult ? (
              <>
                <p className="text-xs text-slate-500">
                  Enter her email address to send an official invitation to the Slipe AI Enterprise workspace.
                </p>

                <form onSubmit={handleSendInvite} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-slate-700 block mb-1 font-medium">Corporate or Gmail Address</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-medium">Role & Permission Level</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    >
                      <option value="Admin">Admin (Full Workspace Management)</option>
                      <option value="Media Engineer">Media Engineer (Batch Processing & Exports)</option>
                      <option value="Marketing Editor">Marketing Editor (Ad Generation & Campaigns)</option>
                      <option value="Viewer">Viewer (Read & Audit Only)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 py-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSending}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center space-x-1.5"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Invitation</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success / Delivery Screen */
              <div className="space-y-4 pt-1">
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Invitation Ready for {inviteResult.recipientEmail}</h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      {inviteResult.emailSent
                        ? `An invitation email was dispatched to ${inviteResult.recipientEmail}.`
                        : `We opened a direct Gmail compose tab addressed to ${inviteResult.recipientEmail} with the pre-filled invitation template!`}
                    </p>
                  </div>
                </div>

                {/* Direct Gmail Dispatch Trigger */}
                <div className="space-y-2">
                  <a
                    href={inviteResult.gmailComposeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send via Gmail to {inviteResult.recipientEmail}</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>

                  <button
                    onClick={copyInviteUrl}
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Invite Link Copied!' : 'Copy Direct Invitation Link'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                      setInviteResult(null);
                    }}
                    className="w-full py-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
