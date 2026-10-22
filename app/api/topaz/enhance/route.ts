import { NextRequest, NextResponse } from 'next/server';
import { topazClient } from '@/lib/topaz';

export async function GET() {
  const result = await topazClient.checkConnection();
  return NextResponse.json({
    status: result.ok ? 'connected' : 'error',
    code: result.status,
    message: result.message,
    provider: 'Slipe AI Engine (Image v1)',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      endpoint = '/image/v1/enhance',
      featureId = 'upscale',
      imageUrl,
      settings = {},
      filename = 'asset.jpg',
    } = body;

    const apiKey = process.env.TOPAZ_API_KEY || '5012739d-5a5b-48ca-a5e3-1b808ba3d9a8';
    const baseUrl = process.env.TOPAZ_API_BASE || 'https://api.topazlabs.com/image/v1';

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'No image payload provided' }, { status: 400 });
    }

    let imageBuffer: Buffer | null = null;
    let mimeType = 'image/jpeg';

    // Parse Base64 Data URL
    if (imageUrl.startsWith('data:')) {
      const parts = imageUrl.split(',');
      mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      imageBuffer = Buffer.from(parts[1], 'base64');
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Remote URL
      const fetched = await fetch(imageUrl);
      if (fetched.ok) {
        const arrayBuf = await fetched.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuf);
        mimeType = fetched.headers.get('content-type') || 'image/jpeg';
      }
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Could not decode image data from client upload.',
      }, { status: 400 });
    }

    // Determine target endpoint based on featureId or explicit endpoint
    let targetEndpoint = '/enhance';
    if (featureId === 'sharpen') {
      targetEndpoint = '/sharpen';
    } else if (featureId === 'enhance-quality') {
      targetEndpoint = '/denoise';
    } else if (featureId === 'fix-lighting' || featureId === 'balance-color') {
      targetEndpoint = '/lighting';
    } else {
      const clean = endpoint.replace(/^\/image\/v1/, '');
      targetEndpoint = clean.startsWith('/') ? clean : `/${clean}`;
    }

    const fullUrl = `${baseUrl}${targetEndpoint}`;

    // Construct form data for Topaz API
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: mimeType });
    formData.append('image', blob, filename || 'photo.jpg');

    // Output format
    const outFormat = settings.outputFormat === 'png' ? 'png' : 'jpeg';
    formData.append('output_format', outFormat);

    // Feature specific arguments
    if (featureId === 'upscale') {
      const scaleStr = String(settings.scaleFactor || '4').replace(/[^0-9]/g, '') || '4';
      formData.append('scale_factor', scaleStr);
      if (settings.model) {
        formData.append('model', String(settings.model));
      }
    } else if (featureId === 'sharpen') {
      if (settings.sharpenModel) {
        formData.append('model', String(settings.sharpenModel));
      }
    } else if (featureId === 'enhance-quality') {
      if (settings.noiseReductionModel) {
        formData.append('model', String(settings.noiseReductionModel));
      }
    }

    const topazRes = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
      },
      body: formData,
    });

    if (topazRes.ok) {
      const contentType = topazRes.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await topazRes.json();
        return NextResponse.json({
          success: true,
          enhancedUrl: json.output_url || json.url || json.dataUrl,
          processId: json.process_id || json.id,
        });
      } else {
        const outArrayBuf = await topazRes.arrayBuffer();
        const base64 = Buffer.from(outArrayBuf).toString('base64');
        const finalDataUrl = `data:${contentType || 'image/jpeg'};base64,${base64}`;
        return NextResponse.json({
          success: true,
          enhancedUrl: finalDataUrl,
          sizeBytes: outArrayBuf.byteLength,
        });
      }
    } else {
      const errText = await topazRes.text();
      console.warn(`[Topaz API Error] HTTP ${topazRes.status} on ${targetEndpoint}:`, errText);

      // If dedicated endpoint failed, try standard fallback /enhance
      if (targetEndpoint !== '/enhance') {
        try {
          const fallbackForm = new FormData();
          fallbackForm.append('image', new Blob([new Uint8Array(imageBuffer)], { type: mimeType }), filename || 'photo.jpg');
          fallbackForm.append('output_format', 'jpeg');

          const fbRes = await fetch(`${baseUrl}/enhance`, {
            method: 'POST',
            headers: { 'X-API-Key': apiKey },
            body: fallbackForm,
          });

          if (fbRes.ok) {
            const fbBuf = await fbRes.arrayBuffer();
            const fbBase64 = Buffer.from(fbBuf).toString('base64');
            return NextResponse.json({
              success: true,
              enhancedUrl: `data:image/jpeg;base64,${fbBase64}`,
              sizeBytes: fbBuf.byteLength,
            });
          }
        } catch (fbErr) {
          console.error('Fallback error:', fbErr);
        }
      }

      return NextResponse.json({
        success: false,
        error: `API error (${topazRes.status}): ${errText.slice(0, 200)}`,
      }, { status: topazRes.status });
    }
  } catch (err: any) {
    console.error('[Topaz Route Exception]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal processing error' },
      { status: 500 }
    );
  }
}
