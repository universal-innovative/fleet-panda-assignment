import { create } from 'zustand';
import type { ShiftRecord } from '../types';
import { listResource } from '../api/resources';
import { showApiErrorToast } from './apiErrors';

interface ShiftHistoryStore {
  history: ShiftRecord[];
  isLoading: boolean;
  isLoaded: boolean;
  loadHistory: () => Promise<void>;
  addRecord: (record: ShiftRecord) => void;
  upsertRecord: (record: ShiftRecord) => void;
  removeRecord: (id: string) => void;
}

export const useShiftHistoryStore = create<ShiftHistoryStore>((set, get) => ({
  history: [],
  isLoading: false,
  isLoaded: false,
  loadHistory: async () => {
    if (get().isLoading || get().isLoaded) return;
    set({ isLoading: true });
    try {
      const history = await listResource<ShiftRecord>('shiftHistory');
      set({ history, isLoaded: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      showApiErrorToast('Could not load shift history', 'Please check API connectivity and retry.', error);
    }
  },
  addRecord: (record) => set((s) => ({ history: [record, ...s.history] })),
  upsertRecord: (record) =>
    set((s) => {
      const existingIndex = s.history.findIndex((r) => r.id === record.id);
      if (existingIndex === -1) {
        return { history: [record, ...s.history] };
      }
      return {
        history: s.history.map((r) => (r.id === record.id ? record : r)),
      };
    }),
  removeRecord: (id) => set((s) => ({ history: s.history.filter((r) => r.id !== id) })),
}));
