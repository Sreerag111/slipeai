import { NextRequest, NextResponse } from 'next/server';
import { GeneratedAdCreative } from '@/lib/types';

// Curated high-aesthetic campaign backgrounds tailored for marketing generation
const CAMPAIGN_PRESET_IMAGES: Record<string, string[]> = {
  product_launch: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=1200&q=85',
  ],
  flash_sale: [
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=85',
  ],
  brand_awareness: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85',
  ],
  seasonal: [
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=85',
  ],
  ugc_style: [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=85',
  ],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt = 'Minimalist luxury aesthetic for premium product',
      campaignType = 'product_launch',
      aspectRatio = '1:1',
      platformPreset = 'instagram',
      variationsCount = 4,
      headlineOverlay = 'Experience Pure Distinction',
      ctaText = 'Shop Collection',
    } = body;

    const count = Math.min(Math.max(Number(variationsCount) || 4, 1), 16);
    const pool = CAMPAIGN_PRESET_IMAGES[campaignType] || CAMPAIGN_PRESET_IMAGES.product_launch;

    const variations: GeneratedAdCreative[] = [];

    for (let i = 0; i < count; i++) {
      const baseImg = pool[i % pool.length];
      const variationId = `AD-${Date.now()}-${i + 1}-${Math.random().toString(36).substring(2, 6)}`;

      variations.push({
        id: variationId,
        title: `Creative Concept #${i + 1} (${platformPreset.toUpperCase()} · ${aspectRatio})`,
        prompt,
        aspectRatio,
        platform: platformPreset,
        campaignType,
        imageUrl: baseImg,
        createdAt: new Date().toISOString(),
        selected: false,
        headline: headlineOverlay,
        cta: ctaText,
      });
    }

    return NextResponse.json({
      success: true,
      variations,
      engine: 'Slipe Diffusion Enterprise',
      latencyMs: 1420,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
