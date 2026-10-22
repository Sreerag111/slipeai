'use client';

import React from 'react';
import Link from 'next/link';
import {
  Maximize2,
  Palette,
  SlidersHorizontal,
  ShieldAlert,
  Eraser,
  SunMedium,
  Focus,
  Scissors,
  Wand2,
  Sliders,
  Megaphone,
  ArrowRight,
  Layers,
  Video,
} from 'lucide-react';
import { FeatureConfig } from '@/lib/types';

const ICON_MAP: Record<string, React.ElementType> = {
  Maximize2,
  Palette,
  SlidersHorizontal,
  ShieldAlert,
  Eraser,
  SunMedium,
  Focus,
  Scissors,
  Wand2,
  Sliders,
  Megaphone,
  Video,
};

interface FeatureCardProps {
  feature: FeatureConfig;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = ICON_MAP[feature.iconName] || Layers;
  const isAdGen = feature.id === 'ad-generator';
  const isVideoGen = feature.id === 'video-generator';

  const href = isAdGen
    ? '/workspace/ad-generator'
    : isVideoGen
    ? '/workspace/video-generator'
    : `/workspace/${feature.id}`;

  return (
    <div
      className={`feature-card group relative aspect-square rounded-2xl p-5 flex flex-col justify-between border transition-all ${
        isAdGen || isVideoGen
          ? 'bg-white border-blue-300 shadow-container hover:shadow-container-hover ring-2 ring-blue-500/10'
          : 'bg-white border-slate-200/90 hover:border-blue-400 shadow-container hover:shadow-container-hover'
      }`}
    >
      {/* Top row: Icon + Engine Badge */}
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
            isAdGen || isVideoGen
              ? 'bg-blue-600/10 border-blue-200 text-blue-600 shadow-sm'
              : 'bg-slate-50 border-slate-200 text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-200'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>

        {isAdGen && (
          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
            Campaign AI
          </span>
        )}
      </div>

      {/* Middle: Title & Description */}
      <div className="my-auto pt-2">
        <h3 className="font-bold text-slate-900 text-base tracking-tight group-hover:text-blue-600 transition-colors">
          {feature.title}
        </h3>
        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">
          {feature.shortDescription}
        </p>
      </div>

      {/* Bottom: Action Buttons - Single Upload next to Batch Upload */}
      <div className="pt-3 border-t border-slate-100 flex items-center space-x-2">
        <Link
          href={`${href}?mode=single`}
          className="flex-1 py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
          title="Upload 1 photo for quick processing"
        >
          <span>Single Upload</span>
        </Link>
        <Link
          href={`${href}?mode=batch`}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all shadow-sm ${
            isAdGen
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
              : 'bg-slate-900 hover:bg-blue-600 text-white shadow-sm'
          }`}
          title="Batch upload multiple photos"
        >
          <span>Batch Upload</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
