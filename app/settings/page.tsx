'use client';

import React, { useState } from 'react';
import {
  Settings,
  Save,
  Check,
  Shield,
  FolderArchive,
  Cpu,
  Database,
  Lock,
} from 'lucide-react';

export default function SettingsPage() {
  const [defaultFormat, setDefaultFormat] = useState('original');
  const [namingTemplate, setNamingTemplate] = useState('{name}_enhanced');
  const [preserveMetadata, setPreserveMetadata] = useState(true);
  const [preserveFolderTree, setPreserveFolderTree] = useState(true);
  const [autoSyncFirebase, setAutoSyncFirebase] = useState(true);
  const [compressionLevel, setCompressionLevel] = useState('6');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Settings</h1>
          <p className="text-xs text-slate-600 mt-1">
            Global pipeline configuration, export naming tokens, and backend security defaults.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-all"
        >
          {saved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Saved Successfully' : 'Save Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Output & Packaging Naming Rules */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 shadow-container text-slate-900">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
            <FolderArchive className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Batch Export & Naming Tokens</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-700 block mb-1 font-medium">Default Filename Template</label>
              <input
                type="text"
                value={namingTemplate}
                onChange={(e) => setNamingTemplate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Available tokens: <code className="text-blue-600 font-mono">{'{name}'}</code>,{' '}
                <code className="text-blue-600 font-mono">{'{batch_id}'}</code>,{' '}
                <code className="text-blue-600 font-mono">{'{feature}'}</code>,{' '}
                <code className="text-blue-600 font-mono">{'{scale}'}</code>,{' '}
                <code className="text-blue-600 font-mono">{'{timestamp}'}</code>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-slate-700 block mb-1 font-medium">Default Export Container</label>
                <select
                  value={defaultFormat}
                  onChange={(e) => setDefaultFormat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white"
                >
                  <option value="original">Preserve Original File Extension</option>
                  <option value="jpeg">Convert All to High-Quality JPEG (.jpg)</option>
                  <option value="png">Lossless PNG with Alpha (.png)</option>
                  <option value="tiff">16-bit Master TIFF (.tiff)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-medium">ZIP Compression Level</label>
                <select
                  value={compressionLevel}
                  onChange={(e) => setCompressionLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white"
                >
                  <option value="0">Store (No compression - Ultra Fast)</option>
                  <option value="6">Level 6 (Deflate Standard - Balanced)</option>
                  <option value="9">Level 9 (Maximum Compression)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveMetadata}
                  onChange={(e) => setPreserveMetadata(e.target.checked)}
                  className="rounded border-slate-300 bg-white text-blue-600 focus:ring-0"
                />
                <span className="text-slate-700">Preserve EXIF, Color Profiles (ICC), and IPTC Metadata</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveFolderTree}
                  onChange={(e) => setPreserveFolderTree(e.target.checked)}
                  className="rounded border-slate-300 bg-white text-blue-600 focus:ring-0"
                />
                <span className="text-slate-700">Retain nested directory tree in batch ZIP archives</span>
              </label>
            </div>
          </div>
        </div>

        {/* Security & Cloud Sync */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 shadow-container text-slate-900">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Security & Cloud Storage Policies</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSyncFirebase}
                onChange={(e) => setAutoSyncFirebase(e.target.checked)}
                className="rounded border-slate-300 bg-white text-blue-600 focus:ring-0"
              />
              <span className="text-slate-700">
                Continuous cloud database synchronization and zero-data-loss protection
              </span>
            </label>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Zero-Retention Privacy Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Enhancement payloads processed through Slipe AI secure servers are purged after session delivery. No customer training or archival retention is permitted.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
