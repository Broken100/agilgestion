// apps/web/stores/sri-store.ts
import { create } from 'zustand';
import { apiFetch } from '@/lib/api-client';

interface SriState {
  queueStatus: Record<string, 'PENDING' | 'SENDING' | 'COMPLETED' | 'FAILED'>;
  isOnline: boolean;

  setQueueStatus: (ventaId: string, status: 'PENDING' | 'SENDING' | 'COMPLETED' | 'FAILED') => void;
  setOnline: (online: boolean) => void;
  processQueue: () => Promise<void>;
}

export const useSriStore = create<SriState>((set, get) => ({
  queueStatus: {},
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,

  setQueueStatus: (ventaId, status) => {
    set((state) => ({
      queueStatus: { ...state.queueStatus, [ventaId]: status },
    }));
  },

  setOnline: (online) => {
    set({ isOnline: online });
    if (online) {
      get().processQueue();
    }
  },

  processQueue: async () => {
    try {
      await apiFetch('/api/sri-sync', { method: 'POST' });
    } catch (err) {
      console.error('SRI sync queue error:', err);
    }
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useSriStore.getState().setOnline(true));
  window.addEventListener('offline', () => useSriStore.getState().setOnline(false));
}