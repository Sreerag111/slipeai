'use client';

import React from 'react';
import { Archive, CheckCircle2, AlertCircle, Loader2, Download, X } from 'lucide-react';

interface ZipExportModalProps {
  isOpen: boolean;
  progress: number;
  statusText: string;
  isComplete: boolean;
  error?: string | null;
  onClose: () => void;
  onRetry?: () => void;
}

export function ZipExportModal({
  isOpen,
  progress,
  statusText,
  isComplete,
  error,
  onClose,
  onRetry,
}: ZipExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-2xl flex flex-col items-center text-center text-slate-900">
        {!isComplete && !error && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Status Icon */}
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4">
          {error ? (
            <AlertCircle className="w-8 h-8 text-rose-500" />
          ) : isComplete ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          ) : (
            <Archive className="w-8 h-8 text-blue-600 animate-pulse" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-slate-900">
          {error ? 'Archive Generation Failed' : isComplete ? 'ZIP Archive Ready' : 'Packaging ZIP Archive...'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">{statusText}</p>

        {/* Progress Bar */}
        {!error && (
          <div className="w-full mt-6">
            <div className="flex justify-between text-xs font-mono text-slate-500 mb-2">
              <span>{isComplete ? 'Complete' : 'Compressing assets'}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="w-full mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 text-left">
            {error}
          </div>
        )}

        {/* Action button */}
        <div className="mt-6 flex space-x-3 w-full">
          {error ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200"
              >
                Close
              </button>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium"
                >
                  Retry Archive
                </button>
              )}
            </>
          ) : isComplete ? (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center justify-center space-x-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Done</span>
            </button>
          ) : (
            <div className="w-full flex items-center justify-center space-x-2 text-xs text-slate-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Preserving original filenames and directory structure</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
