import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { BatchItem } from './types';

export interface ZipProgressCallback {
  (percentage: number, currentFileName: string): void;
}

/**
 * Downloads a list of completed batch items packed into a high-compression ZIP archive.
 */
export async function downloadBatchAsZip(
  items: BatchItem[],
  zipFilename: string = 'slipe_ai_batch_export.zip',
  namingPattern: string = '{name}_enhanced',
  onProgress?: ZipProgressCallback
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder('slipe_enhanced_assets');

  // Filter only completed items with enhanced URLs
  const validItems = items.filter((item) => item.status === 'completed' && item.enhancedUrl);

  if (validItems.length === 0) {
    throw new Error('No completed items available to package into ZIP archive.');
  }

  let processedCount = 0;

  for (const item of validItems) {
    const rawUrl = item.enhancedUrl || item.originalUrl;
    const progressBase = Math.round((processedCount / validItems.length) * 80);
    onProgress?.(progressBase, `Fetching ${item.name}...`);

    try {
      let fileData: Blob | ArrayBuffer;

      if (rawUrl.startsWith('data:')) {
        // Convert base64 Data URL to Blob
        const [header, base64Data] = rawUrl.split(',');
        const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        fileData = new Blob([byteArray], { type: mime });
      } else {
        // Fetch remote URL
        const res = await fetch(rawUrl, { mode: 'cors' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        fileData = await res.blob();
      }

      // Compute final clean output filename
      const dotIndex = item.name.lastIndexOf('.');
      const baseName = dotIndex !== -1 ? item.name.substring(0, dotIndex) : item.name;
      const ext = dotIndex !== -1 ? item.name.substring(dotIndex) : '.jpg';
      const cleanFileName = `${baseName}_enhanced${ext}`;

      folder?.file(cleanFileName, fileData);
    } catch (err) {
      console.warn(`[ZIP Packaging] Skipped ${item.name} due to fetch error:`, err);
    }

    processedCount++;
  }

  // Generate ZIP file with compression
  onProgress?.(85, 'Compressing ZIP package...');
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      const currentPct = 85 + Math.round((metadata.percent / 100) * 15);
      onProgress?.(currentPct, `Archiving (${Math.round(metadata.percent)}%)...`);
    }
  );

  onProgress?.(100, 'Download starting...');
  saveAs(zipBlob, zipFilename);
  return zipBlob;
}
