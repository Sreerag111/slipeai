'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, Sliders, Maximize2, ShieldCheck, Sparkles } from 'lucide-react';
import { BatchItem } from '@/lib/types';
import { saveAs } from 'file-saver';

interface BeforeAfterModalProps {
  item: BatchItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BeforeAfterModal({ item, isOpen, onClose }: BeforeAfterModalProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side'>('split');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const originalSrc = item.originalUrl;
  const enhancedSrc = item.enhancedUrl || item.originalUrl;

  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  const handleDownload = () => {
    const url = enhancedSrc;
    saveAs(url, `${item.name.replace(/\.[^/.]+$/, '')}_enhanced.jpg`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-6xl h-[88vh] bg-[#0E131C] border border-[#232B3C] rounded-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#202838] bg-[#121722]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-white text-sm md:text-base">{item.name}</h3>
                <span className="px-2 py-0.5 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  {item.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Size: {(item.originalSize / (1024 * 1024)).toFixed(2)} MB · {item.width ? `${item.width} × ${item.height}` : 'Original Dimensions Preserved'}
              </p>
            </div>
          </div>

          {/* View Modes & Actions */}
          <div className="flex items-center space-x-3">
            <div className="bg-[#1A2230] p-1 rounded-lg border border-[#2A3448] flex items-center space-x-1 text-xs">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded transition-colors ${
                  viewMode === 'split' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Split Slider
              </button>
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`px-3 py-1 rounded transition-colors ${
                  viewMode === 'side-by-side' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Side-by-Side
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Enhanced</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Center Viewport */}
        <div className="flex-1 relative bg-[#07090D] flex items-center justify-center p-6 overflow-hidden select-none">
          {viewMode === 'split' ? (
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerUp}
              className="relative max-w-full max-h-full rounded-lg overflow-hidden border border-[#1E2638] shadow-2xl cursor-ew-resize"
              style={{ width: '850px', height: '560px' }}
            >
              {/* Enhanced image (Full background) */}
              <img
                src={enhancedSrc}
                alt="Enhanced preview"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />

              {/* Original image (Clipped by slider position) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <img
                  src={originalSrc}
                  alt="Original preview"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>

              {/* Split Slider Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-lg pointer-events-auto">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Corner Watermarks */}
              <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded text-xs font-mono font-medium text-slate-300 border border-white/10">
                Original Input
              </div>
              <div className="absolute bottom-4 right-4 bg-blue-900/80 backdrop-blur-md px-3 py-1 rounded text-xs font-mono font-medium text-blue-200 border border-blue-500/30 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>AI Enhanced Output</span>
              </div>
            </div>
          ) : (
            /* Side-by-Side View */
            <div className="grid grid-cols-2 gap-4 w-full h-full max-w-5xl">
              <div className="flex flex-col h-full bg-[#111620] border border-[#202838] rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-[#161C28] border-b border-[#202838] text-xs font-medium text-slate-300 flex justify-between">
                  <span>Original Source Asset</span>
                  <span className="text-slate-500 font-mono">1x Base</span>
                </div>
                <div className="flex-1 flex items-center justify-center p-2 bg-black/50">
                  <img src={originalSrc} alt="Original" className="max-w-full max-h-[55vh] object-contain rounded" />
                </div>
              </div>

              <div className="flex flex-col h-full bg-[#111620] border border-blue-500/30 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-blue-950/40 border-b border-blue-500/20 text-xs font-medium text-blue-300 flex justify-between">
                  <span>AI Enhanced Result</span>
                  <span className="text-blue-400 font-mono">Precision Processed</span>
                </div>
                <div className="flex-1 flex items-center justify-center p-2 bg-black/50">
                  <img src={enhancedSrc} alt="Enhanced" className="max-w-full max-h-[55vh] object-contain rounded" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Info */}
        <div className="px-6 py-3 border-t border-[#202838] bg-[#10141D] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span>Drag slider horizontally to inspect texture reconstruction</span>
          </div>
          <div className="font-mono text-slate-500">
            ID: {item.id}
          </div>
        </div>
      </div>
    </div>
  );
}
