'use client';

import { create } from 'zustand';
import { BatchJob, BatchItem, FeatureId } from './types';
import { RECENT_BATCH_HISTORY, SAMPLE_BATCH_ITEMS } from './demoData';
import { FEATURES, getFeatureById } from './features';
import { syncBatchToFirebase } from './firebase';

export interface BatchStoreState {
  batches: BatchJob[];
  currentBatchId: string | null;
  isBackendLive: boolean;
  selectedItemIds: string[];
  previewItem: BatchItem | null;
  isPreviewOpen: boolean;

  // Actions
  setBackendLive: (live: boolean) => void;
  createOrGetBatchForFeature: (featureId: FeatureId) => BatchJob;
  addUploadedFiles: (featureId: FeatureId, fileList: File[]) => void;
  loadSampleBatch: (featureId: FeatureId) => void;
  removeFileItem: (batchId: string, itemId: string) => void;
  clearBatchItems: (batchId: string) => void;
  updateBatchSettings: (batchId: string, settings: Record<string, any>) => void;
  startBatchProcessing: (batchId: string) => Promise<void>;
  startSingleProcessing: (batchId: string, itemId?: string) => Promise<void>;
  pauseBatchProcessing: (batchId: string) => void;
  resumeBatchProcessing: (batchId: string) => void;
  retryFailedItems: (batchId: string) => Promise<void>;
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: (batchId: string) => void;
  deselectAllItems: () => void;
  openPreview: (item: BatchItem) => void;
  closePreview: () => void;
  setCurrentBatchId: (batchId: string) => void;
}

const STORAGE_KEY = 'slipe_ai_enterprise_batches_v1';

function loadStoredBatches(): BatchJob[] {
  if (typeof window === 'undefined') return RECENT_BATCH_HISTORY as unknown as BatchJob[];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not read localStorage batches:', e);
  }
  return RECENT_BATCH_HISTORY as unknown as BatchJob[];
}

function saveStoredBatches(batches: BatchJob[]) {
  if (typeof window === 'undefined') return;
  try {
    // Only persist lightweight metadata without giant data blobs
    const sanitized = batches.map((b) => ({
      ...b,
      items: b.items.slice(0, 50).map((i) => ({
        ...i,
        originalUrl: i.originalUrl.startsWith('data:') ? i.originalUrl.slice(0, 100) : i.originalUrl,
        enhancedUrl: i.enhancedUrl?.startsWith('data:') ? i.enhancedUrl.slice(0, 100) : i.enhancedUrl,
      })),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.warn('Could not save batches to localStorage:', e);
  }
}

export const useBatchStore = create<BatchStoreState>((set, get) => ({
  batches: loadStoredBatches(),
  currentBatchId: null,
  isBackendLive: true, // Default to Live Topaz API Backend mode
  selectedItemIds: [],
  previewItem: null,
  isPreviewOpen: false,

  setBackendLive: (live: boolean) => set({ isBackendLive: live }),

  createOrGetBatchForFeature: (featureId: FeatureId) => {
    const { batches } = get();
    const feat = getFeatureById(featureId);
    const existing = batches.find((b) => b.featureId === featureId && (b.status === 'idle' || b.status === 'running'));

    if (existing) {
      set({ currentBatchId: existing.id });
      return existing;
    }

    const newId = `BATCH-${Math.floor(1000 + Math.random() * 9000)}-${featureId.slice(0, 3).toUpperCase()}`;
    const newBatch: BatchJob = {
      id: newId,
      featureId,
      featureTitle: feat?.title || 'Photo Processing',
      name: `${feat?.title || 'Batch'} Job #${newId.slice(-4)}`,
      totalItems: 0,
      completedItems: 0,
      failedItems: 0,
      totalSizeBytes: 0,
      status: 'idle',
      overallProgress: 0,
      createdAt: new Date().toISOString(),
      settings: feat?.defaultSettings || {},
      items: [],
    };

    const updated = [newBatch, ...batches];
    set({ batches: updated, currentBatchId: newId });
    saveStoredBatches(updated);
    syncBatchToFirebase(newBatch);
    return newBatch;
  },

  addUploadedFiles: (featureId: FeatureId, fileList: File[]) => {
    const { batches, currentBatchId, createOrGetBatchForFeature } = get();
    let batchId = currentBatchId;

    let targetBatch = batches.find((b) => b.id === batchId && b.featureId === featureId);
    if (!targetBatch) {
      targetBatch = createOrGetBatchForFeature(featureId);
      batchId = targetBatch.id;
    }

    fileList.forEach((file, idx) => {
      const tempUrl = URL.createObjectURL(file);
      const itemId = `item-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;

      const initialItem: BatchItem = {
        id: itemId,
        batchId: batchId!,
        name: file.name,
        originalSize: file.size,
        mimeType: file.type || 'image/jpeg',
        status: 'queued',
        progress: 0,
        originalUrl: tempUrl,
        thumbnailUrl: tempUrl,
        settingsSnapshot: { ...targetBatch!.settings },
      };

      // Add item to batch
      const currBatches = get().batches;
      const b = currBatches.find((x) => x.id === batchId);
      if (b) {
        const combined = [...b.items, initialItem];
        const updatedB: BatchJob = {
          ...b,
          items: combined,
          totalItems: combined.length,
          totalSizeBytes: combined.reduce((acc, cur) => acc + cur.originalSize, 0),
        };
        set({ batches: currBatches.map((x) => (x.id === batchId ? updatedB : x)) });
      }

      // Convert to full Data URL asynchronously so server has raw binary access
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          const freshBatches = get().batches.map((batchObj) => {
            if (batchObj.id !== batchId) return batchObj;
            return {
              ...batchObj,
              items: batchObj.items.map((it) => (it.id === itemId ? { ...it, originalUrl: dataUrl, thumbnailUrl: dataUrl } : it)),
            };
          });
          set({ batches: freshBatches });
          saveStoredBatches(freshBatches);
        }
      };
      reader.readAsDataURL(file);
    });
  },

  loadSampleBatch: (featureId: FeatureId) => {
    const { batches, currentBatchId, createOrGetBatchForFeature } = get();
    let batchId = currentBatchId;

    let targetBatch = batches.find((b) => b.id === batchId && b.featureId === featureId);
    if (!targetBatch) {
      targetBatch = createOrGetBatchForFeature(featureId);
      batchId = targetBatch.id;
    }

    const samples = SAMPLE_BATCH_ITEMS[featureId] || SAMPLE_BATCH_ITEMS['upscale'] || [];
    const sampleItems: BatchItem[] = samples.map((sample, idx) => ({
      id: `sample-${featureId}-${Date.now()}-${idx}`,
      batchId: batchId!,
      name: sample.name,
      originalSize: sample.size,
      mimeType: 'image/jpeg',
      width: sample.width,
      height: sample.height,
      status: 'queued',
      progress: 0,
      originalUrl: sample.originalUrl,
      thumbnailUrl: sample.originalUrl,
      enhancedUrl: sample.enhancedUrl,
      settingsSnapshot: { ...targetBatch!.settings },
    }));

    const combinedItems = [...targetBatch.items, ...sampleItems];
    const totalBytes = combinedItems.reduce((acc, curr) => acc + curr.originalSize, 0);

    const updatedBatch: BatchJob = {
      ...targetBatch,
      items: combinedItems,
      totalItems: combinedItems.length,
      totalSizeBytes: totalBytes,
    };

    const updatedBatches = batches.map((b) => (b.id === batchId ? updatedBatch : b));
    set({ batches: updatedBatches });
    saveStoredBatches(updatedBatches);
  },

  removeFileItem: (batchId: string, itemId: string) => {
    const { batches, selectedItemIds } = get();
    const updatedBatches = batches.map((b) => {
      if (b.id !== batchId) return b;
      const filtered = b.items.filter((item) => item.id !== itemId);
      return {
        ...b,
        items: filtered,
        totalItems: filtered.length,
        totalSizeBytes: filtered.reduce((acc, cur) => acc + cur.originalSize, 0),
        completedItems: filtered.filter((i) => i.status === 'completed').length,
        failedItems: filtered.filter((i) => i.status === 'failed').length,
      };
    });
    set({
      batches: updatedBatches,
      selectedItemIds: selectedItemIds.filter((id) => id !== itemId),
    });
    saveStoredBatches(updatedBatches);
  },

  clearBatchItems: (batchId: string) => {
    const { batches } = get();
    const updatedBatches = batches.map((b) => {
      if (b.id !== batchId) return b;
      return {
        ...b,
        items: [],
        totalItems: 0,
        totalSizeBytes: 0,
        completedItems: 0,
        failedItems: 0,
        overallProgress: 0,
        status: 'idle' as const,
      };
    });
    set({ batches: updatedBatches, selectedItemIds: [] });
    saveStoredBatches(updatedBatches);
  },

  updateBatchSettings: (batchId: string, settings: Record<string, any>) => {
    const { batches } = get();
    const updatedBatches = batches.map((b) => {
      if (b.id !== batchId) return b;
      return { ...b, settings: { ...b.settings, ...settings } };
    });
    set({ batches: updatedBatches });
    saveStoredBatches(updatedBatches);
  },

  startBatchProcessing: async (batchId: string) => {
    const { batches, isBackendLive } = get();
    const batch = batches.find((b) => b.id === batchId);
    if (!batch || batch.items.length === 0) return;

    // Set batch to running
    const markRunningBatches = batches.map((b) =>
      b.id === batchId ? { ...b, status: 'running' as const, startedAt: new Date().toISOString() } : b
    );
    set({ batches: markRunningBatches });

    // Process queued or failed items
    const itemsToProcess = [...batch.items];
    const totalCount = itemsToProcess.length;

    for (let index = 0; index < totalCount; index++) {
      const currentItem = itemsToProcess[index];
      if (currentItem.status === 'completed') continue;

      // Update state to processing
      const updateItemState = (status: BatchItem['status'], progress: number, enhancedUrl?: string, error?: string) => {
        const stateBatches = get().batches.map((b) => {
          if (b.id !== batchId) return b;
          const updatedItems = b.items.map((it) =>
            it.id === currentItem.id ? { ...it, status, progress, enhancedUrl: enhancedUrl || it.enhancedUrl, error } : it
          );
          const completed = updatedItems.filter((i) => i.status === 'completed').length;
          const failed = updatedItems.filter((i) => i.status === 'failed').length;
          const overallPct = Math.round((completed / (updatedItems.length || 1)) * 100);

          return {
            ...b,
            items: updatedItems,
            completedItems: completed,
            failedItems: failed,
            overallProgress: overallPct,
            status: completed + failed >= updatedItems.length ? ('completed' as const) : ('running' as const),
            completedAt: completed + failed >= updatedItems.length ? new Date().toISOString() : undefined,
          };
        });
        set({ batches: stateBatches });
      };

      updateItemState('uploading', 15);
      await new Promise((r) => setTimeout(r, 200));

      updateItemState('processing', 35);
      await new Promise((r) => setTimeout(r, 250));

      updateItemState('processing', 75);

      try {
        let enhancedResultUrl: string | undefined;

        // Ensure payload is an absolute URL or valid Base64 Data URL (convert blob: if needed)
        let payloadUrl = currentItem.originalUrl;
        if (payloadUrl.startsWith('blob:')) {
          try {
            const bRes = await fetch(payloadUrl);
            const blob = await bRes.blob();
            payloadUrl = await new Promise<string>((resolve, reject) => {
              const r = new FileReader();
              r.onloadend = () => resolve(r.result as string);
              r.onerror = reject;
              r.readAsDataURL(blob);
            });
          } catch (blobErr) {
            console.warn('Could not read blob URL to base64:', blobErr);
          }
        }

        const feat = getFeatureById(batch.featureId);
        if (isBackendLive && feat?.topazSupported) {
          const apiRes = await fetch('/api/topaz/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              featureId: batch.featureId,
              endpoint: feat.topazEndpoint,
              imageUrl: payloadUrl,
              settings: batch.settings,
              filename: currentItem.name,
            }),
          });

          const data = await apiRes.json();
          if (data.success && data.enhancedUrl) {
            enhancedResultUrl = data.enhancedUrl;
          } else {
            throw new Error(data.error || 'Enhancement failed');
          }
        } else {
          enhancedResultUrl = currentItem.enhancedUrl || currentItem.originalUrl;
        }

        updateItemState('completed', 100, enhancedResultUrl);
      } catch (err: any) {
        updateItemState('failed', 0, undefined, err.message || 'Processing error');
      }

      await new Promise((r) => setTimeout(r, 120));
    }

    const finalBatches = get().batches;
    saveStoredBatches(finalBatches);
    const finalBatch = finalBatches.find((b) => b.id === batchId);
    if (finalBatch) syncBatchToFirebase(finalBatch);
  },

  startSingleProcessing: async (batchId: string, itemId?: string) => {
    const { batches, isBackendLive } = get();
    const batch = batches.find((b) => b.id === batchId);
    if (!batch || batch.items.length === 0) return;

    let targetItem = itemId
      ? batch.items.find((i) => i.id === itemId)
      : batch.items.find((i) => i.status !== 'completed');

    if (!targetItem) {
      targetItem = batch.items[0];
    }
    if (!targetItem) return;

    const currentItem = targetItem;

    const updateItemState = (status: BatchItem['status'], progress: number, enhancedUrl?: string, error?: string) => {
      const stateBatches = get().batches.map((b) => {
        if (b.id !== batchId) return b;
        const updatedItems = b.items.map((it) =>
          it.id === currentItem.id ? { ...it, status, progress, enhancedUrl: enhancedUrl || it.enhancedUrl, error } : it
        );
        const completed = updatedItems.filter((i) => i.status === 'completed').length;
        const failed = updatedItems.filter((i) => i.status === 'failed').length;
        const overallPct = Math.round((completed / (updatedItems.length || 1)) * 100);

        return {
          ...b,
          items: updatedItems,
          completedItems: completed,
          failedItems: failed,
          overallProgress: overallPct,
          status: status === 'completed' || status === 'failed'
            ? (completed + failed >= updatedItems.length ? ('completed' as const) : ('idle' as const))
            : ('running' as const),
        };
      });
      set({ batches: stateBatches });
    };

    updateItemState('uploading', 15);
    await new Promise((r) => setTimeout(r, 200));

    updateItemState('processing', 40);
    await new Promise((r) => setTimeout(r, 250));

    updateItemState('processing', 75);

    try {
      let enhancedResultUrl: string | undefined;
      let payloadUrl = currentItem.originalUrl;
      if (payloadUrl.startsWith('blob:')) {
        try {
          const bRes = await fetch(payloadUrl);
          const blob = await bRes.blob();
          payloadUrl = await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result as string);
            r.onerror = reject;
            r.readAsDataURL(blob);
          });
        } catch (blobErr) {
          console.warn('Could not read blob URL to base64:', blobErr);
        }
      }

      const feat = getFeatureById(batch.featureId);
      if (isBackendLive && feat?.topazSupported) {
        const apiRes = await fetch('/api/topaz/enhance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            featureId: batch.featureId,
            endpoint: feat.topazEndpoint,
            imageUrl: payloadUrl,
            settings: batch.settings,
            filename: currentItem.name,
          }),
        });

        const data = await apiRes.json();
        if (data.success && data.enhancedUrl) {
          enhancedResultUrl = data.enhancedUrl;
        } else {
          throw new Error(data.error || 'Enhancement failed');
        }
      } else {
        enhancedResultUrl = currentItem.enhancedUrl || currentItem.originalUrl;
      }

      updateItemState('completed', 100, enhancedResultUrl);
    } catch (err: any) {
      updateItemState('failed', 0, undefined, err.message || 'Processing error');
    }

    const finalBatches = get().batches;
    saveStoredBatches(finalBatches);
    const finalBatch = finalBatches.find((b) => b.id === batchId);
    if (finalBatch) syncBatchToFirebase(finalBatch);
  },

  pauseBatchProcessing: (batchId: string) => {
    const { batches } = get();
    const updated = batches.map((b) => (b.id === batchId ? { ...b, status: 'paused' as const } : b));
    set({ batches: updated });
    saveStoredBatches(updated);
  },

  resumeBatchProcessing: (batchId: string) => {
    get().startBatchProcessing(batchId);
  },

  retryFailedItems: async (batchId: string) => {
    const { batches } = get();
    const updated = batches.map((b) => {
      if (b.id !== batchId) return b;
      const resetItems = b.items.map((it) => (it.status === 'failed' ? { ...it, status: 'queued' as const, progress: 0, error: undefined } : it));
      return { ...b, items: resetItems, failedItems: 0, status: 'idle' as const };
    });
    set({ batches: updated });
    await get().startBatchProcessing(batchId);
  },

  toggleItemSelection: (itemId: string) => {
    const { selectedItemIds } = get();
    if (selectedItemIds.includes(itemId)) {
      set({ selectedItemIds: selectedItemIds.filter((id) => id !== itemId) });
    } else {
      set({ selectedItemIds: [...selectedItemIds, itemId] });
    }
  },

  selectAllItems: (batchId: string) => {
    const { batches } = get();
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;
    const allIds = batch.items.map((i) => i.id);
    set({ selectedItemIds: allIds });
  },

  deselectAllItems: () => set({ selectedItemIds: [] }),

  openPreview: (item: BatchItem) => set({ previewItem: item, isPreviewOpen: true }),
  closePreview: () => set({ previewItem: null, isPreviewOpen: false }),
  setCurrentBatchId: (batchId: string) => set({ currentBatchId: batchId }),
}));
