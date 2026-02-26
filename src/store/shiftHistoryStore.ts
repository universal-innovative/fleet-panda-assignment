import { create } from 'zustand';
import type { ShiftRecord } from '../types';
import { initialShiftHistory } from '../data/mockData';

interface ShiftHistoryStore {
  history: ShiftRecord[];
  addRecord: (record: ShiftRecord) => void;
}

export const useShiftHistoryStore = create<ShiftHistoryStore>((set) => ({
  history: initialShiftHistory,
  addRecord: (record) => set((s) => ({ history: [record, ...s.history] })),
}));

