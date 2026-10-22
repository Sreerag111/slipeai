'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  Sparkles,
  Layers,
  Download,
  Archive,
  RefreshCw,
  CheckCircle2,
  Image as ImageIcon,
  Sliders,
  CheckSquare,
  Square,
  Eye,
  ArrowLeft,
  UploadCloud,
  FileImage,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { GeneratedAdCreative } from '@/lib/types';
import { ZipExportModal } from './ZipExportModal';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const PROMPT_SUGGESTIONS = [
  'Minimalist luxury perfume bottle on volcanic obsidian rock with soft morning fog',
  'Futuristic athletic runner sneakers in suspended anti-gravity neon studio lighting',
  'Organic botanical facial serum with dewy droplets and lush green monstera shadows',
  'Titanium automatic chronograph watch resting on architectural concrete slab',
  'Ergonomic Scandinavian oak armchair in sunlit modern Copenhagen loft apartment',
];

const INITIAL_VARIATIONS: GeneratedAdCreative[] = [
  {
    id: 'ad-var-1',
    title: 'Instagram Feed Creative (1:1)',
    prompt: 'Minimalist luxury aesthetic for premium product launch',
    aspectRatio: '1:1',
    platform: 'Instagram',
    campaignType: 'Product Launch',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
    createdAt: new Date().toISOString(),
    selected: false,
    headline: 'Engineered Precision',
    cta: 'Shop Collection',
  },
  {
    id: 'ad-var-2',
    title: 'Instagram & Facebook Mobile (4:5)',
    prompt: 'Minimalist luxury aesthetic for premium product launch',
    aspectRatio: '4:5',
    platform: 'Instagram',
    campaignType: 'Product Launch',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
    createdAt: new Date().toISOString(),
    selected: false,
    headline: 'Acoustic Perfection',
    cta: 'Pre-Order Now',
  },
  {
    id: 'ad-var-3',
    title: 'Google Display Network Banner (16:9)',
    prompt: 'Minimalist luxury aesthetic for premium product launch',
    aspectRatio: '16:9',
    platform: 'Google Ads',
    campaignType: 'Product Launch',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=85',
    createdAt: new Date().toISOString(),
    selected: false,
    headline: 'Next-Gen Wearable Tech',
    cta: 'Learn More',
  },
  {
    id: 'ad-var-4',
    title: 'Reels & TikTok Story Creative (9:16)',
    prompt: 'Minimalist luxury aesthetic for premium product launch',
    aspectRatio: '9:16',
    platform: 'Instagram',
    campaignType: 'Product Launch',
    imageUrl: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=1200&q=85',
    createdAt: new Date().toISOString(),
    selected: false,
    headline: 'Step Into Tomorrow',
    cta: 'Swipe Up',
  },
];

export function AdGeneratorWorkspace() {
  const [prompt, setPrompt] = useState('Minimalist luxury aesthetic for premium product launch');
  const [campaignType, setCampaignType] = useState('product_launch');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '16:9' | '9:16'>('1:1');
  const [platformPreset, setPlatformPreset] = useState<'instagram' | 'facebook' | 'google_ads' | 'ecommerce'>('instagram');
  const [variationsCount, setVariationsCount] = useState<number>(4);
  const [headlineOverlay, setHeadlineOverlay] = useState('Experience Pure Distinction');
  const [ctaText, setCtaText] = useState('Shop Collection');
  const [productImage, setProductImage] = useState<string | null>(null);

  const [variations, setVariations] = useState<GeneratedAdCreative[]>(INITIAL_VARIATIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewCreative, setPreviewCreative] = useState<GeneratedAdCreative | null>(null);

  // ZIP Modal
  const [zipModalOpen, setZipModalOpen] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStatusText, setZipStatusText] = useState('');
  const [zipComplete, setZipComplete] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  const selectedCount = variations.filter((v) => v.selected).length;

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductImage(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ad-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          campaignType,
          aspectRatio,
          platformPreset,
          variationsCount,
          headlineOverlay,
          ctaText,
          productImage,
        }),
      });

      const data = await res.json();
      if (data.success && data.variations) {
        setVariations(data.variations);
      }
    } catch (err) {
      console.error('Error generating creatives:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelectCreative = (id: string) => {
    setVariations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, selected: !v.selected } : v))
    );
  };

  const selectAll = () => setVariations((prev) => prev.map((v) => ({ ...v, selected: true })));
  const deselectAll = () => setVariations((prev) => prev.map((v) => ({ ...v, selected: false })));

  const handleDownloadSingle = (creative: GeneratedAdCreative) => {
    saveAs(creative.imageUrl, `ad_creative_${creative.id}_${creative.aspectRatio.replace(':', 'x')}.jpg`);
  };

  const handleBulkZipDownload = async (onlySelected: boolean = false) => {
    const targets = onlySelected ? variations.filter((v) => v.selected) : variations;
    if (targets.length === 0) {
      alert('No creatives selected to download.');
      return;
    }

    setZipModalOpen(true);
    setZipProgress(15);
    setZipStatusText(`Packaging ${targets.length} advertising creatives into high-res ZIP...`);
    setZipComplete(false);
    setZipError(null);

    try {
      const zip = new JSZip();
      const folder = zip.folder('ad_creatives_campaign');

      let idx = 0;
      for (const item of targets) {
        setZipProgress(20 + Math.round((idx / targets.length) * 60));
        setZipStatusText(`Fetching ${item.title}...`);

        const res = await fetch(item.imageUrl);
        const blob = await res.blob();
        folder?.file(`creative_${idx + 1}_${item.aspectRatio.replace(':', 'x')}.jpg`, blob);
        idx++;
      }

      setZipProgress(85);
      setZipStatusText('Compressing campaign assets...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      setZipProgress(100);
      setZipComplete(true);
      setZipStatusText('Campaign ZIP archive downloaded.');
      saveAs(zipBlob, `slipe_ai_ad_campaign_${Date.now()}.zip`);
    } catch (e: any) {
      setZipError(e.message || 'Failed packaging creatives');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-slate-900 flex items-center space-x-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-blue-600 font-semibold">Advertising Suite</span>
          </div>

          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Ad Image Generator</h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
              Slipe Diffusion
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Generate production-ready advertising images for product campaigns, social media, e-commerce listings, and promotional banners.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center space-x-2.5">
          {selectedCount > 0 && (
            <button
              onClick={() => handleBulkZipDownload(true)}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Selected ({selectedCount})</span>
            </button>
          )}

          <button
            onClick={() => handleBulkZipDownload(false)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-all"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Download All as ZIP ({variations.length})</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Prompt & Campaign Config | Right Variations Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Prompt Engineering & Settings */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 shadow-container text-slate-900">
            {/* Prompt Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                <span>Campaign Creative Prompt</span>
                <span className="text-[10px] text-slate-400 font-mono">Natural Language</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe your desired advertising setting, lighting, mood, materials..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />

              {/* Prompt Suggestions */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">Quick Inspiration Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_SUGGESTIONS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(preset)}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 truncate max-w-[240px]"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Product Image Upload */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                <span>Optional Product Asset</span>
                <span className="text-[10px] text-slate-400">Foreground Placement</span>
              </label>
              <div className="flex items-center space-x-3">
                {productImage ? (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-blue-500/50">
                    <img src={productImage} alt="Product" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setProductImage(null)}
                      className="absolute inset-0 bg-black/60 text-white text-[10px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex-1 py-3 px-4 border border-dashed border-slate-300 hover:border-blue-500/80 rounded-lg cursor-pointer flex items-center justify-center space-x-2 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 transition-colors">
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                    <span>Upload Transparent Product PNG</span>
                    <input type="file" accept="image/*" onChange={handleProductUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Aspect Ratio Selection */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-xs font-semibold text-slate-900">Target Aspect Ratio</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '1:1', label: '1:1 Square', sub: 'Feed / Shopify' },
                  { id: '4:5', label: '4:5 Portrait', sub: 'IG / FB Feed' },
                  { id: '16:9', label: '16:9 Wide', sub: 'Google Ads / Web' },
                  { id: '9:16', label: '9:16 Story', sub: 'Reels / TikTok' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id as any)}
                    className={`py-2 px-1 rounded-lg text-center border transition-all ${
                      aspectRatio === ratio.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="text-xs font-mono font-medium">{ratio.id}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 truncate">{ratio.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Presets */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-xs font-semibold text-slate-900">Platform Preset</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'instagram', label: 'Instagram (Feed & Story)' },
                  { id: 'facebook', label: 'Facebook Ads & Shop' },
                  { id: 'google_ads', label: 'Google Display Network' },
                  { id: 'ecommerce', label: 'E-Commerce Hero & PDP' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatformPreset(p.id as any)}
                    className={`py-2 px-2.5 rounded-lg text-left border transition-all truncate ${
                      platformPreset === p.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Objective & Variations Count */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-900 block mb-1">Campaign Type</label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="product_launch">Product Launch</option>
                  <option value="flash_sale">Flash Sale / Promo</option>
                  <option value="brand_awareness">Brand Awareness</option>
                  <option value="seasonal">Seasonal / Holiday</option>
                  <option value="ugc_style">UGC Organic Style</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-900 block mb-1">Batch Variations</label>
                <select
                  value={variationsCount}
                  onChange={(e) => setVariationsCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value={2}>2 Variations</option>
                  <option value={4}>4 Variations</option>
                  <option value={8}>8 Variations</option>
                  <option value={16}>16 Variations</option>
                </select>
              </div>
            </div>

            {/* Ad Overlay Text */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">Headline Overlay</label>
                <input
                  type="text"
                  value={headlineOverlay}
                  onChange={(e) => setHeadlineOverlay(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">Call To Action (CTA)</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            {/* Generate Action Button */}
            <div className="pt-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition-all"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing {variationsCount} Ad Variations...</span>
                  </>
                ) : (
                  <span>Generate Batch Creatives ({variationsCount} Variations)</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Creative Variations Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Gallery Top Toolbar */}
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
              {selectedCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 font-mono text-[11px] font-semibold">
                  {selectedCount} Selected
                </span>
              )}
            </div>

            <div className="text-slate-500 font-mono text-[11px]">
              Engine: <span className="text-blue-600 font-semibold">Separate Diffusion Cluster</span>
            </div>
          </div>

          {/* Variations Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {variations.map((creative) => (
              <div
                key={creative.id}
                className={`group relative rounded-xl overflow-hidden border transition-all bg-white flex flex-col justify-between shadow-container text-slate-900 ${
                  creative.selected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Image Container with Dynamic Aspect Ratio */}
                <div className="relative w-full aspect-square bg-black overflow-hidden">
                  <img
                    src={creative.imageUrl}
                    alt={creative.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Creative Text Overlay Preview */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-4 flex flex-col justify-between pointer-events-none">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white border border-white/20">
                        {creative.aspectRatio} · {creative.platform}
                      </span>
                    </div>

                    <div>
                      {creative.headline && (
                        <h4 className="text-sm font-bold text-white drop-shadow-md leading-tight">
                          {creative.headline}
                        </h4>
                      )}
                      {creative.cta && (
                        <div className="mt-2 inline-block px-2.5 py-1 rounded bg-white text-black text-[10px] font-bold shadow-md">
                          {creative.cta}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Checkbox Overlay */}
                  <button
                    onClick={() => toggleSelectCreative(creative.id)}
                    className="absolute top-3 right-3 p-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20 text-white hover:bg-black/90 transition-colors z-10"
                  >
                    {creative.selected ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-400 fill-current" />
                    ) : (
                      <div className="w-4 h-4 rounded border border-white/50" />
                    )}
                  </button>
                </div>

                {/* Card Bottom Meta & Actions */}
                <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 truncate max-w-[160px]">{creative.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{creative.campaignType}</div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleDownloadSingle(creative)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-600 text-slate-600 hover:text-white border border-slate-200 transition-colors"
                      title="Download Asset"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-600 text-slate-600 hover:text-white border border-slate-200 transition-colors"
                      title="Regenerate Variation"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ZIP Packaging Modal */}
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
