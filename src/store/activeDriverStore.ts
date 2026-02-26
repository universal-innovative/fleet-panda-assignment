import { create } from 'zustand';

interface ActiveDriverStore {
  activeDriverId: string | null;
  setActiveDriver: (id: string | null) => void;
}

export const useActiveDriverStore = create<ActiveDriverStore>((set) => ({
  activeDriverId: 'driver-1',
  setActiveDriver: (id) => set({ activeDriverId: id }),
}));

