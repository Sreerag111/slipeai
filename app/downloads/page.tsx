'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Download,
  Archive,
  Search,
  Filter,
  Eye,
  CheckSquare,
  Square,
  Calendar,
  Layers,
  FileImage,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  SlidersHorizontal,
} from 'lucide-react';
import { useBatchStore } from '@/lib/batchStore';
import { BatchItem } from '@/lib/types';
import { BeforeAfterModal } from '@/components/BeforeAfterModal';
import { ZipExportModal } from '@/components/ZipExportModal';
import { downloadBatchAsZip } from '@/lib/zipHelper';
import { saveAs } from 'file-saver';

export default function DownloadCenterPage() {
  const { batches, openPreview, previewItem, closePreview, isPreviewOpen } = useBatchStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeature, setSelectedFeature] = useState<string>('all');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed'>('completed');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // ZIP Modal
  const [zipModalOpen, setZipModalOpen] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStatusText, setZipStatusText] = useState('');
  const [zipComplete, setZipComplete] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  // Aggregate all items across all batches
  const allItems: (BatchItem & { featureTitle: string; batchName: string })[] = useMemo(() => {
    const list: (BatchItem & { featureTitle: string; batchName: string })[] = [];
    batches.forEach((b) => {
      b.items.forEach((item) => {
        list.push({
          ...item,
          featureTitle: b.featureTitle,
          batchName: b.name,
        });
      });
    });
    return list;
  }, [batches]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batchId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBatch = selectedBatchId === 'all' || item.batchId === selectedBatchId;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && item.status === 'completed') ||
        (statusFilter === 'failed' && item.status === 'failed');

      return matchesSearch && matchesBatch && matchesStatus;
    });
  }, [allItems, searchQuery, selectedBatchId, statusFilter]);

  const completedFiltered = filteredItems.filter((i) => i.status === 'completed');
  const totalVolumeBytes = completedFiltered.reduce((acc, cur) => acc + cur.originalSize, 0);

  const toggleSelect = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter((i) => i !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const selectAll = () => setSelectedItemIds(filteredItems.map((i) => i.id));
  const deselectAll = () => setSelectedItemIds([]);

  const handleDownloadSelected = async () => {
    const targets = filteredItems.filter(
      (i) => selectedItemIds.includes(i.id) && i.status === 'completed'
    );
    if (targets.length === 0) {
      alert('Please select completed files to download.');
      return;
    }

    if (targets.length === 1) {
      const it = targets[0];
      saveAs(it.enhancedUrl || it.originalUrl, `${it.name.replace(/\.[^/.]+$/, '')}_enhanced.jpg`);
      return;
    }

    setZipModalOpen(true);
    setZipProgress(10);
    setZipStatusText(`Packaging ${targets.length} selected assets into ZIP...`);
    setZipComplete(false);
    setZipError(null);

    try {
      await downloadBatchAsZip(
        targets,
        `slipe_download_center_selected_${targets.length}.zip`,
        '{name}_enhanced',
        (pct, text) => {
          setZipProgress(pct);
          setZipStatusText(text);
        }
      );
      setZipComplete(true);
      setZipStatusText('Selected items archive downloaded.');
    } catch (e: any) {
      setZipError(e.message || 'Failed packaging archive.');
    }
  };

  const handleDownloadAllCompleted = async () => {
    if (completedFiltered.length === 0) {
      alert('No completed files found in the current filter.');
      return;
    }

    setZipModalOpen(true);
    setZipProgress(10);
    setZipStatusText(`Packaging all ${completedFiltered.length} completed files...`);
    setZipComplete(false);
    setZipError(null);

    try {
      await downloadBatchAsZip(
        completedFiltered,
        `slipe_bulk_export_${Date.now()}.zip`,
        '{name}_enhanced',
        (pct, text) => {
          setZipProgress(pct);
          setZipStatusText(text);
        }
      );
      setZipComplete(true);
      setZipStatusText('Complete archive downloaded.');
    } catch (e: any) {
      setZipError(e.message || 'Failed compiling download.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Download Center</h1>
          <p className="text-xs text-slate-600 mt-1">
            Search, preview, select, and bulk-download all photo enhancement outputs and AI ad creatives.
          </p>
        </div>

        {/* Global Bulk Actions */}
        <div className="flex items-center space-x-2.5">
          {selectedItemIds.length > 0 && (
            <button
              onClick={handleDownloadSelected}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Selected ({selectedItemIds.length})</span>
            </button>
          )}

          <button
            onClick={handleDownloadAllCompleted}
            disabled={completedFiltered.length === 0}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
              completedFiltered.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Download All Completed as ZIP ({completedFiltered.length})</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-container text-slate-900">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename or batch ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto overflow-x-auto">
          {/* Batch Selector */}
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} ({b.featureTitle})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="completed">Completed Only</option>
            <option value="failed">Failed Only</option>
            <option value="all">All Statuses</option>
          </select>

          {/* Stats Pill */}
          <div className="hidden lg:flex items-center space-x-2 font-mono text-slate-600 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <HardDrive className="w-3.5 h-3.5 text-blue-600" />
            <span>{(totalVolumeBytes / (1024 * 1024)).toFixed(1)} MB Output</span>
          </div>
        </div>
      </div>

      {/* Selection toolbar */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center space-x-2">
          <button onClick={selectAll} className="text-slate-600 hover:text-slate-900 flex items-center space-x-1 font-medium transition-colors">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Select All</span>
          </button>
          <span className="text-slate-300">|</span>
          <button onClick={deselectAll} className="text-slate-600 hover:text-slate-900 flex items-center space-x-1 font-medium transition-colors">
            <Square className="w-3.5 h-3.5" />
            <span>Deselect All</span>
          </button>
          {selectedItemIds.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 font-mono text-[11px] font-semibold">
              {selectedItemIds.length} Selected
            </span>
          )}
        </div>
        <div className="text-slate-500 font-mono text-[11px]">
          Showing {filteredItems.length} assets
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-container text-slate-900">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <FileImage className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-800">No matching assets found</h4>
            <p className="text-xs text-slate-500">
              Run a batch in any feature workspace or adjust your filter query.
            </p>
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
                        filteredItems.length > 0 &&
                        selectedItemIds.length === filteredItems.length
                      }
                      onChange={(e) => (e.target.checked ? selectAll() : deselectAll())}
                      className="rounded border-slate-300 text-blue-600"
                    />
                  </th>
                  <th className="py-3 px-2">Asset</th>
                  <th className="py-3 px-3">Filename</th>
                  <th className="py-3 px-3">Batch ID & Feature</th>
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const isSelected = selectedItemIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/60' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded border-slate-300 text-blue-600"
                        />
                      </td>

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

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-900 truncate max-w-[220px]" title={item.name}>
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.mimeType.replace('image/', '').toUpperCase()}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono text-slate-800 font-medium">{item.batchId}</span>
                        <div className="text-[10px] text-blue-600 font-medium">{item.featureTitle}</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-600">
                        {(item.originalSize / (1024 * 1024)).toFixed(2)} MB
                      </td>

                      <td className="py-3 px-3">
                        {item.status === 'completed' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openPreview(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Inspect Before / After"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {item.status === 'completed' && (
                            <button
                              onClick={() =>
                                saveAs(
                                  item.enhancedUrl || item.originalUrl,
                                  `${item.name.replace(/\.[^/.]+$/, '')}_enhanced.jpg`
                                )
                              }
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                              title="Download Asset"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Modals */}
      <BeforeAfterModal item={previewItem} isOpen={isPreviewOpen} onClose={closePreview} />

      <ZipExportModal
        isOpen={zipModalOpen}
        progress={zipProgress}
        statusText={zipStatusText}
        isComplete={zipComplete}
        error={zipError}
        onClose={() => setZipModalOpen(false)}
      />
    </div>
  );
}
