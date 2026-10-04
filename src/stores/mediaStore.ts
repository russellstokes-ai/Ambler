import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import {
  MediaAsset,
  UploadQueueItem,
  UploadStatus,
  mapDbMediaAssetWithSignedUrls,
  uploadMedia as uploadMediaAsset,
  deleteMedia as deleteMediaAsset,
} from '../features/media/mediaService';

interface MediaState {
  mediaByEvent: Record<string, MediaAsset[]>;
  uploadQueue: UploadQueueItem[];
  isUploading: boolean;
  isInitialized: boolean;
  isLoadingGallery: boolean;

  initStore: () => Promise<void>;
  loadEventMedia: (eventId: string) => Promise<MediaAsset[]>;
  uploadMedia: (eventId: string, items: UploadQueueItem[]) => Promise<void>;
  deleteMedia: (eventId: string, mediaId: string) => Promise<boolean>;
  clearUploadQueue: () => void;
  retryFailed: (eventId: string) => Promise<void>;
  cancelUpload: (mediaId: string) => void;
  updateUploadProgress: (mediaId: string, progress: number) => void;
  setUploadStatus: (mediaId: string, status: UploadStatus) => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  mediaByEvent: {},
  uploadQueue: [],
  isUploading: false,
  isInitialized: false,
  isLoadingGallery: false,

  initStore: async () => {
    if (get().isInitialized) return;
    set({ isInitialized: true });
  },

  loadEventMedia: async (eventId: string) => {
    set({ isLoadingGallery: true });
    try {
      const { data, error } = await supabase
        .from('media_assets')
        .select('*, profiles(display_name), media_reactions(id)')
        .eq('event_id', eventId)
        .eq('is_deleted', false)
        .order('captured_at', { ascending: true });

      if (error) throw error;

      const media = await Promise.all((data ?? []).map((row) => mapDbMediaAssetWithSignedUrls(row as any)));
      set((state) => ({
        mediaByEvent: { ...state.mediaByEvent, [eventId]: media },
        isLoadingGallery: false,
      }));
      return media;
    } catch {
      set({ isLoadingGallery: false });
      return [];
    }
  },

  uploadMedia: async (eventId: string, items: UploadQueueItem[]) => {
    if (items.length === 0) return;

    set((state) => ({
      isUploading: true,
      uploadQueue: [...state.uploadQueue, ...items],
    }));

    for (const item of items) {
      const activeItem = get().uploadQueue.find((q) => q.mediaId === item.mediaId);
      if (!activeItem || activeItem.status === 'cancelled') continue;

      get().setUploadStatus(item.mediaId, 'uploading');

      try {
        const uploaded = await uploadMediaAsset(eventId, item, (progress) => {
          const current = get().uploadQueue.find((q) => q.mediaId === item.mediaId);
          if (!current || current.status === 'cancelled') return;
          get().updateUploadProgress(item.mediaId, progress);
        });

        const current = get().uploadQueue.find((q) => q.mediaId === item.mediaId);
        if (!current || current.status === 'cancelled') continue;

        set((state) => {
          const eventMedia = state.mediaByEvent[eventId] ?? [];
          return {
            mediaByEvent: {
              ...state.mediaByEvent,
              [eventId]: [...eventMedia.filter((m) => m.id !== uploaded.id), uploaded],
            },
          };
        });

        get().updateUploadProgress(item.mediaId, 100);
        get().setUploadStatus(item.mediaId, 'uploaded');
      } catch {
        const current = get().uploadQueue.find((q) => q.mediaId === item.mediaId);
        if (current?.status !== 'cancelled') {
          get().setUploadStatus(item.mediaId, 'failed');
        }
      }
    }

    const remaining = get().uploadQueue.filter((q) => q.status === 'queued' || q.status === 'uploading');
    if (remaining.length === 0) {
      set({ isUploading: false });
      setTimeout(() => {
        set((state) => ({
          uploadQueue: state.uploadQueue.filter((item) => item.status === 'failed' || item.status === 'uploading'),
        }));
      }, 1500);
    }
  },

  deleteMedia: async (eventId: string, mediaId: string) => {
    const item = get().mediaByEvent[eventId]?.find((m) => m.id === mediaId);

    try {
      await deleteMediaAsset(mediaId, item?.storagePath, item?.thumbnailPath);
      set((state) => {
        const eventMedia = state.mediaByEvent[eventId] ?? [];
        return {
          mediaByEvent: {
            ...state.mediaByEvent,
            [eventId]: eventMedia.filter((m) => m.id !== mediaId),
          },
        };
      });
      return true;
    } catch {
      return false;
    }
  },

  clearUploadQueue: () => {
    set({ uploadQueue: [] });
  },

  retryFailed: async (eventId: string) => {
    const failed = get().uploadQueue.filter((q) => q.status === 'failed');
    if (failed.length === 0) return;

    set((state) => ({
      uploadQueue: state.uploadQueue.map((q) =>
        q.status === 'failed' ? { ...q, status: 'queued' as UploadStatus, progress: 0 } : q,
      ),
    }));

    await get().uploadMedia(
      eventId,
      failed.map((item) => ({
        ...item,
        status: 'queued' as UploadStatus,
        progress: 0,
      })),
    );
  },

  cancelUpload: (mediaId: string) => {
    set((state) => ({
      uploadQueue: state.uploadQueue.map((q) =>
        q.mediaId === mediaId ? { ...q, status: 'cancelled' as UploadStatus } : q,
      ),
    }));
  },

  updateUploadProgress: (mediaId: string, progress: number) => {
    set((state) => ({
      uploadQueue: state.uploadQueue.map((q) =>
        q.mediaId === mediaId ? { ...q, progress } : q,
      ),
    }));
  },

  setUploadStatus: (mediaId: string, status: UploadStatus) => {
    set((state) => ({
      uploadQueue: state.uploadQueue.map((q) =>
        q.mediaId === mediaId ? { ...q, status } : q,
      ),
    }));
  },
}));
