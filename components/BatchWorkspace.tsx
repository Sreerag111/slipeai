'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileImage,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Download,
  Archive,
  Sliders,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  ArrowLeft,
  Settings2,
  Info,
  FolderArchive,
  Check,
  Zap,
} from 'lucide-react';
import { FeatureConfig, BatchItem, BatchJob } from '@/lib/types';
import { useBatchStore } from '@/lib/batchStore';
import { BeforeAfterModal } from './BeforeAfterModal';
import { ZipExportModal } from './ZipExportModal';
import { downloadBatchAsZip } from '@/lib/zipHelper';
import { saveAs } from 'file-saver';

interface BatchWorkspaceProps {
  feature: FeatureConfig;
}

export function BatchWorkspace({ feature }: BatchWorkspaceProps) {
  const {
    batches,
    currentBatchId,
    createOrGetBatchForFeature,
    addUploadedFiles,
    loadSampleBatch,
    removeFileItem,
    clearBatchItems,
    updateBatchSettings,
    startBatchProcessing,
    startSingleProcessing,
    pauseBatchProcessing,
    resumeBatchProcessing,
    retryFailedItems,
    selectedItemIds,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    previewItem,
    openPreview,
    closePreview,
    isPreviewOpen,
    isBackendLive,
  } = useBatchStore();

  const [activeTab, setActiveTab] = useState<'queue' | 'settings'>('queue');
  const [uploadMode, setUploadMode] = useState<'single' | 'batch'>('batch');
  const [isDragging, setIsDragging] = useState(false);
  const [namingRule, setNamingRule] = useState('{name}_enhanced');
  const [preserveOriginalNames, setPreserveOriginalNames] = useState(true);

  // Auto-switch mode based on URL query (?mode=single)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const modeParam = new URLSearchParams(window.location.search).get('mode');
      if (modeParam === 'single') {
        setUploadMode('single');
      }
    }
  }, []);

  // ZIP modal state
  const [zipModalOpen, setZipModalOpen] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStatusText, setZipStatusText] = useState('');
  const [zipComplete, setZipComplete] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or fetch active batch for this feature
  useEffect(() => {
    createOrGetBatchForFeature(feature.id);
  }, [feature.id, createOrGetBatchForFeature]);

  // Find target batch
  const currentBatch = batches.find((b) => b.id === currentBatchId) ||
    batches.find((b) => b.featureId === feature.id) || {
      id: 'BATCH-DEFAULT',
      featureId: feature.id,
      featureTitle: feature.title,
      name: `${feature.title} Batch`,
      totalItems: 0,
      completedItems: 0,
      failedItems: 0,
      totalSizeBytes: 0,
      status: 'idle',
      overallProgress: 0,
      createdAt: new Date().toISOString(),
      settings: feature.defaultSettings,
      items: [],
    };

  const completedCount = currentBatch.items.filter((i) => i.status === 'completed').length;
  const failedCount = currentBatch.items.filter((i) => i.status === 'failed').length;
  const processingCount = currentBatch.items.filter((i) => i.status === 'processing' || i.status === 'uploading').length;

  // File drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (uploadMode === 'single') {
        addUploadedFiles(feature.id, [e.dataTransfer.files[0]]);
      } else {
        const files = Array.from(e.dataTransfer.files);
        addUploadedFiles(feature.id, files);
      }
    }
  };

  const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addUploadedFiles(feature.id, [e.target.files[0]]);
      e.target.value = '';
    }
  };

  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      addUploadedFiles(feature.id, files);
      e.target.value = '';
    }
  };

  // ZIP packaging trigger
  const handleDownloadAllZip = async () => {
    const completedItems = currentBatch.items.filter((i) => i.status === 'completed');
    if (completedItems.length === 0) {
      alert('No completed items to download. Start the batch first.');
      return;
    }

    setZipModalOpen(true);
    setZipProgress(10);
    setZipStatusText('Preparing batch package...');
    setZipComplete(false);
    setZipError(null);

    try {
      await downloadBatchAsZip(
        completedItems,
        `${feature.id}_batch_${currentBatch.id}.zip`,
        namingRule,
        (pct, text) => {
          setZipProgress(pct);
          setZipStatusText(text);
        }
      );
      setZipComplete(true);
      setZipStatusText('Archive successfully generated and downloaded!');
    } catch (err: any) {
      setZipError(err.message || 'Error compiling archive.');
    }
  };

  // Download selected
  const handleDownloadSelected = async () => {
    const selectedItems = currentBatch.items.filter(
      (i) => selectedItemIds.includes(i.id) && i.status === 'completed'
    );
    if (selectedItems.length === 0) {
      alert('Please select at least one completed item to download.');
      return;
    }

    if (selectedItems.length === 1) {
      const item = selectedItems[0];
      saveAs(item.enhancedUrl || item.originalUrl, `${item.name.replace(/\.[^/.]+$/, '')}_enhanced.jpg`);
      return;
    }

    setZipModalOpen(true);
    setZipProgress(10);
    setZipStatusText(`Packaging ${selectedItems.length} selected assets...`);
    setZipComplete(false);
    setZipError(null);

    try {
      await downloadBatchAsZip(
        selectedItems,
        `${feature.id}_selected_${selectedItems.length}_assets.zip`,
        namingRule,
        (pct, text) => {
          setZipProgress(pct);
          setZipStatusText(text);
        }
      );
      setZipComplete(true);
      setZipStatusText('Selected items archive downloaded.');
    } catch (err: any) {
      setZipError(err.message || 'Error compiling archive.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Breadcrumbs & Top Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-slate-900 flex items-center space-x-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Features Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-blue-600 font-semibold">Batch Workspace</span>
          </div>

          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{feature.title}</h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
              {currentBatch.id}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">{feature.tagline}</p>
        </div>

        {/* Global Batch Controls */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {/* Quick Upload Buttons: Single Upload next to Batch Upload */}
          <button
            onClick={() => {
              setUploadMode('single');
              singleFileInputRef.current?.click();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
              uploadMode === 'single'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <FileImage className="w-3.5 h-3.5" />
            <span>Single Upload</span>
          </button>

          <button
            onClick={() => {
              setUploadMode('batch');
              batchFileInputRef.current?.click();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
              uploadMode === 'batch'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Batch Upload</span>
          </button>

          <button
            onClick={() => loadSampleBatch(feature.id)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <span>Load Sample Batch</span>
          </button>

          {currentBatch.status === 'running' ? (
            <button
              onClick={() => pauseBatchProcessing(currentBatch.id)}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Processing</span>
            </button>
          ) : (
            <>
              {/* Start Single Processing */}
              <button
                onClick={() => startSingleProcessing(currentBatch.id)}
                disabled={currentBatch.items.length === 0}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
                  currentBatch.items.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : uploadMode === 'single'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
                }`}
                title="Process single photo individually"
              >
                <span>Start Single Processing</span>
              </button>

              {/* Start Batch Processing */}
              <button
                onClick={() => startBatchProcessing(currentBatch.id)}
                disabled={currentBatch.items.length === 0}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
                  currentBatch.items.length === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300'
                    : uploadMode === 'batch'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                    : 'bg-slate-900 hover:bg-blue-600 text-white shadow-sm'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Batch Processing</span>
              </button>
            </>
          )}

          {failedCount > 0 && (
            <button
              onClick={() => retryFailedItems(currentBatch.id)}
              className="px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-700 border border-rose-300 rounded-lg text-xs font-medium flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Failed ({failedCount})</span>
            </button>
          )}

          <button
            onClick={handleDownloadAllZip}
            disabled={completedCount === 0}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              completedCount === 0
                ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Download All ZIP ({completedCount})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Upload & Settings | Right Processing Queue Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Drag & Drop Upload Zone + Feature Configuration */}
        <div className="lg:col-span-4 space-y-5">
          {/* Upload Mode Selector: Single Upload next to Batch Upload */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs shadow-sm">
            <button
              type="button"
              onClick={() => setUploadMode('single')}
              className={`flex-1 py-1.5 px-3 rounded-md font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                uploadMode === 'single'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileImage className="w-3.5 h-3.5 text-blue-600" />
              <span>Single Upload</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('batch')}
              className={`flex-1 py-1.5 px-3 rounded-md font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                uploadMode === 'batch'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span>Batch Upload</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all shadow-container ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-blue-500/80 bg-white text-slate-900'
            }`}
          >
            <input
              type="file"
              ref={singleFileInputRef}
              onChange={handleSingleFileChange}
              multiple={false}
              accept="image/jpeg,image/png,image/webp,image/tiff"
              className="hidden"
            />
            <input
              type="file"
              ref={batchFileInputRef}
              onChange={handleBatchFileChange}
              multiple
              accept="image/jpeg,image/png,image/webp,image/tiff"
              className="hidden"
            />

            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto mb-3">
              {uploadMode === 'single' ? <FileImage className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">
              {uploadMode === 'single'
                ? 'Drop 1 image here for single photo processing'
                : 'Drop images here to batch process'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              or choose an upload option below
            </p>

            {/* Direct buttons inside dropzone: Single Upload next to Batch Upload */}
            <div className="mt-4 flex items-center justify-center space-x-2.5">
              <button
                type="button"
                onClick={() => {
                  setUploadMode('single');
                  singleFileInputRef.current?.click();
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
                  uploadMode === 'single'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <FileImage className="w-3.5 h-3.5" />
                <span>Single Upload</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUploadMode('batch');
                  batchFileInputRef.current?.click();
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
                  uploadMode === 'batch'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Batch Upload</span>
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center space-x-2 text-[10px] text-slate-400 font-mono">
              <span>JPEG, PNG, TIFF, WebP</span>
              <span>•</span>
              <span>Up to 500MB / file</span>
            </div>
          </div>

          {/* Feature Configuration Panel */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 shadow-container text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Settings2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {feature.title} Settings
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Profile: Studio High</span>
            </div>

            {/* Dynamic Feature Settings Fields */}
            <div className="space-y-3.5">
              {feature.settingsSchema.map((field) => {
                const currentValue = currentBatch.settings[field.id] ?? field.defaultValue;

                return (
                  <div key={field.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700">{field.label}</label>
                      {field.type === 'slider' && (
                        <span className="text-xs font-mono text-blue-600 font-medium">
                          {currentValue}
                          {field.id.includes('Strength') || field.id.includes('Recovery') ? '%' : ''}
                        </span>
                      )}
                    </div>

                    {field.description && (
                      <p className="text-[11px] text-slate-500 leading-tight">{field.description}</p>
                    )}

                    {field.type === 'select' && (
                      <select
                        value={currentValue}
                        onChange={(e) =>
                          updateBatchSettings(currentBatch.id, { [field.id]: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                      >
                        {field.options?.map((opt) => (
                          <option key={String(opt.value)} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'slider' && (
                      <input
                        type="range"
                        min={field.min ?? 0}
                        max={field.max ?? 100}
                        step={field.step ?? 1}
                        value={currentValue}
                        onChange={(e) =>
                          updateBatchSettings(currentBatch.id, { [field.id]: Number(e.target.value) })
                        }
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    )}

                    {field.type === 'switch' && (
                      <button
                        type="button"
                        onClick={() =>
                          updateBatchSettings(currentBatch.id, { [field.id]: !currentValue })
                        }
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-between border transition-all ${
                          currentValue
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span>{field.label}</span>
                        <span
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                            currentValue ? 'bg-blue-600 text-white' : 'bg-slate-300 text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Export & Naming Rules */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
                <span>Output Naming Rule</span>
                <span className="text-[10px] text-slate-400 font-mono">Pattern</span>
              </label>
              <input
                type="text"
                value={namingRule}
                onChange={(e) => setNamingRule(e.target.value)}
                placeholder="{name}_enhanced"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="preserveNames"
                  checked={preserveOriginalNames}
                  onChange={(e) => setPreserveOriginalNames(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <label htmlFor="preserveNames" className="text-[11px] text-slate-600 cursor-pointer">
                  Preserve original folder structure in export
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Processing Queue Table & Results */}
        <div className="lg:col-span-8 space-y-4">
          {/* Queue Metric Header Bar */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-container text-slate-900">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-xs text-slate-500 block">Queue Status</span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {currentBatch.items.length} Assets
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({(currentBatch.totalSizeBytes / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200" />

              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1 text-emerald-600 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{completedCount} Done</span>
                </span>
                <span className="flex items-center space-x-1 text-amber-600 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{processingCount} Active</span>
                </span>
                {failedCount > 0 && (
                  <span className="flex items-center space-x-1 text-rose-600 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{failedCount} Failed</span>
                  </span>
                )}
              </div>
            </div>

            {/* Overall Batch Progress */}
            <div className="w-full sm:w-48">
              <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1">
                <span>Batch Progress</span>
                <span className="text-slate-900 font-semibold">{currentBatch.overallProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${currentBatch.overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Table Actions Toolbar */}
          <div className="flex items-center justify-between px-1 text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => selectAllItems(currentBatch.id)}
                className="text-slate-600 hover:text-slate-900 flex items-center space-x-1 font-medium transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Select All</span>
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={deselectAllItems}
                className="text-slate-600 hover:text-slate-900 flex items-center space-x-1 font-medium transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Deselect All</span>
              </button>
              {selectedItemIds.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 font-mono text-[11px] font-medium">
                  {selectedItemIds.length} Selected
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {selectedItemIds.length > 0 && (
                <button
                  onClick={handleDownloadSelected}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-blue-600 text-white rounded text-xs flex items-center space-x-1 transition-colors shadow-sm"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Selected</span>
                </button>
              )}
              {currentBatch.items.length > 0 && (
                <button
                  onClick={() => clearBatchItems(currentBatch.id)}
                  className="text-slate-500 hover:text-rose-600 p-1 rounded transition-colors"
                  title="Clear All Batch Items"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Batch Items Queue Table */}
          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-container text-slate-900">
            {currentBatch.items.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                  <FileImage className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">No assets in this workspace yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Drag and drop photographs here, browse from your local disk, or click “Load Sample Batch” above to test immediately.
                </p>
                <div className="flex items-center justify-center space-x-2 pt-1 flex-wrap gap-y-2">
                  <button
                    onClick={() => {
                      setUploadMode('single');
                      singleFileInputRef.current?.click();
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1.5 shadow-sm"
                  >
                    <FileImage className="w-3.5 h-3.5" />
                    <span>Single Upload</span>
                  </button>
                  <button
                    onClick={() => {
                      setUploadMode('batch');
                      batchFileInputRef.current?.click();
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1.5 shadow-sm"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Batch Upload</span>
                  </button>
                  <button
                    onClick={() => loadSampleBatch(feature.id)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium inline-flex items-center space-x-1.5 shadow-sm"
                  >
                    <span>Sample Assets</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={
                            currentBatch.items.length > 0 &&
                            selectedItemIds.length === currentBatch.items.length
                          }
                          onChange={(e) =>
                            e.target.checked
                              ? selectAllItems(currentBatch.id)
                              : deselectAllItems()
                          }
                          className="rounded border-slate-300 text-blue-600"
                        />
                      </th>
                      <th className="py-3 px-2">Asset</th>
                      <th className="py-3 px-3">Filename</th>
                      <th className="py-3 px-3">Size</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 w-32">Progress</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentBatch.items.map((item, idx) => {
                      const isSelected = selectedItemIds.includes(item.id);

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-blue-50/60' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 px-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleItemSelection(item.id)}
                              className="rounded border-slate-300 text-blue-600"
                            />
                          </td>

                          {/* Thumbnail */}
                          <td className="py-3 px-2">
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

                          {/* Filename */}
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-900 truncate max-w-[200px]" title={item.name}>
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              #{idx + 1} · {item.mimeType.replace('image/', '').toUpperCase()}
                            </div>
                          </td>

                          {/* Size */}
                          <td className="py-3 px-3 font-mono text-slate-600">
                            {(item.originalSize / (1024 * 1024)).toFixed(2)} MB
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            {item.status === 'completed' && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Completed</span>
                              </span>
                            )}
                            {item.status === 'processing' && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>Processing</span>
                              </span>
                            )}
                            {item.status === 'uploading' && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                                <span>Uploading</span>
                              </span>
                            )}
                            {item.status === 'queued' && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                                <span>Queued</span>
                              </span>
                            )}
                            {item.status === 'failed' && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertCircle className="w-3 h-3" />
                                <span>Failed</span>
                              </span>
                            )}
                          </td>

                          {/* Progress */}
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                                <div
                                  className={`h-full rounded-full transition-all duration-200 ${
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

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => openPreview(item)}
                                className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                title="Inspect Before / After"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {item.status !== 'completed' && (
                                <button
                                  onClick={() => startSingleProcessing(currentBatch.id, item.id)}
                                  className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                  title="Start Single Processing for this photo"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                </button>
                              )}

                              {item.status === 'completed' && (
                                <button
                                  onClick={() =>
                                    saveAs(
                                      item.enhancedUrl || item.originalUrl,
                                      `${item.name.replace(/\.[^/.]+$/, '')}_enhanced.jpg`
                                    )
                                  }
                                  className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                                  title="Download Enhanced Image"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => removeFileItem(currentBatch.id, item.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Remove File"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Before / After Inspection Modal */}
      <BeforeAfterModal item={previewItem} isOpen={isPreviewOpen} onClose={closePreview} />

      {/* ZIP Packaging Progress Modal */}
      <ZipExportModal
        isOpen={zipModalOpen}
        progress={zipProgress}
        statusText={zipStatusText}
        isComplete={zipComplete}
        error={zipError}
        onClose={() => setZipModalOpen(false)}
        onRetry={handleDownloadAllZip}
      />
    </div>
  );
}
