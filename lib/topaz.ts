// Server-side Topaz Labs API Client
// Note: This file only executes on the server (API routes / server actions).
// The API key is NEVER sent to the client browser.

export interface TopazEnhanceOptions {
  model?: string;
  output_format?: string;
  crop_to_fill?: boolean;
  scale_factor?: string;
  face_recovery?: boolean;
  face_recovery_strength?: number;
  denoise_strength?: number;
  sharpen_strength?: number;
}

export class TopazClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.TOPAZ_API_KEY || '5012739d-5a5b-48ca-a5e3-1b808ba3d9a8';
    this.baseUrl = process.env.TOPAZ_API_BASE || 'https://api.topazlabs.com/image/v1';
  }

  getHeaders() {
    return {
      'X-API-Key': this.apiKey,
      'Accept': 'application/json, image/*',
    };
  }

  /**
   * Health check / Ping endpoint to verify Topaz API connection
   */
  async checkConnection(): Promise<{ ok: boolean; status: number; message: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/enhance`, {
        method: 'OPTIONS',
        headers: this.getHeaders(),
      });
      return {
        ok: res.status >= 200 && res.status < 400,
        status: res.status,
        message: res.status === 204 ? 'Topaz Platform API Connected (Ready)' : `Status ${res.status}`,
      };
    } catch (err: any) {
      return {
        ok: false,
        status: 500,
        message: err?.message || 'Network error reaching Topaz API',
      };
    }
  }

  /**
   * Submit an image for AI Enhancement
   */
  async enhanceImage(
    endpoint: string,
    imageBuffer: Buffer,
    mimeType: string,
    options: TopazEnhanceOptions = {}
  ): Promise<{ success: boolean; dataUrl?: string; processId?: string; error?: string }> {
    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      const formData = new FormData();
      const blob = new Blob([new Uint8Array(imageBuffer)], { type: mimeType });
      formData.append('image', blob, 'upload.jpg');

      if (options.model) formData.append('model', options.model);
      if (options.output_format) formData.append('output_format', options.output_format);
      if (options.scale_factor) formData.append('scale_factor', options.scale_factor);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Topaz API error (${response.status}): ${errorText.slice(0, 300)}`,
        };
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        return {
          success: true,
          processId: json.process_id || json.request_id || json.id,
          dataUrl: json.output_url || json.url,
        };
      } else {
        // Direct image binary returned
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return {
          success: true,
          dataUrl: `data:${contentType};base64,${base64}`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Internal error dispatching to Topaz API',
      };
    }
  }
}

export const topazClient = new TopazClient();
