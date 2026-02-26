import { create } from 'zustand';
import type { Driver } from '../types';
import { createResource, deleteResource, listResource, patchResource } from '../api/resources';
import { showApiErrorToast } from './apiErrors';
import { generateId } from '../utils/id';

interface DriverStore {
  drivers: Driver[];
  isLoading: boolean;
  isLoaded: boolean;
  loadDrivers: () => Promise<void>;
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, data: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
}

export const useDriverStore = create<DriverStore>((set, get) => ({
  drivers: [],
  isLoading: false,
  isLoaded: false,
  loadDrivers: async () => {
    if (get().isLoading || get().isLoaded) return;
    set({ isLoading: true });
    try {
      const drivers = await listResource<Driver>('drivers');
      set({ drivers, isLoaded: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      showApiErrorToast('Could not load drivers', 'Please check API connectivity and retry.', error);
    }
  },
  addDriver: (data) => {
    const newDriver: Driver = { ...data, id: generateId('driver') };
    set((s) => ({ drivers: [...s.drivers, newDriver] }));
    void createResource('drivers', newDriver).catch((error) => {
      set((s) => ({ drivers: s.drivers.filter((d) => d.id !== newDriver.id) }));
      showApiErrorToast('Could not create driver', 'Please try again.', error);
    });
  },
  updateDriver: (id, data) => {
    const prevDriver = useDriverStore.getState().drivers.find((d) => d.id === id);
    set((s) => ({ drivers: s.drivers.map((d) => (d.id === id ? { ...d, ...data } : d)) }));
    void patchResource<Driver>('drivers', id, data).catch((error) => {
      if (prevDriver) {
        set((s) => ({ drivers: s.drivers.map((d) => (d.id === id ? prevDriver : d)) }));
      }
      showApiErrorToast('Could not update driver', 'Changes were reverted.', error);
    });
  },
  deleteDriver: (id) => {
    const removedDriver = useDriverStore.getState().drivers.find((d) => d.id === id);
    set((s) => ({ drivers: s.drivers.filter((d) => d.id !== id) }));
    void deleteResource('drivers', id).catch((error) => {
      if (removedDriver) {
        set((s) => ({ drivers: [...s.drivers, removedDriver] }));
      }
      showApiErrorToast('Could not delete driver', 'The item was restored.', error);
    });
  },
}));
