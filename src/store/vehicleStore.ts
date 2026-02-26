import { create } from 'zustand';
import type { Vehicle } from '../types';
import { createResource, deleteResource, listResource, patchResource } from '../api/resources';
import { showApiErrorToast } from './apiErrors';
import { generateId } from '../utils/id';

interface VehicleStore {
  vehicles: Vehicle[];
  isLoading: boolean;
  isLoaded: boolean;
  loadVehicles: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: [],
  isLoading: false,
  isLoaded: false,
  loadVehicles: async () => {
    if (get().isLoading || get().isLoaded) return;
    set({ isLoading: true });
    try {
      const vehicles = await listResource<Vehicle>('vehicles');
      set({ vehicles, isLoaded: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      showApiErrorToast('Could not load vehicles', 'Please check API connectivity and retry.', error);
    }
  },
  addVehicle: (data) => {
    const newVehicle: Vehicle = { ...data, id: generateId('vehicle') };
    set((s) => ({ vehicles: [...s.vehicles, newVehicle] }));
    void createResource('vehicles', newVehicle).catch((error) => {
      set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== newVehicle.id) }));
      showApiErrorToast('Could not create vehicle', 'Please try again.', error);
    });
  },
  updateVehicle: (id, data) => {
    const prevVehicle = useVehicleStore.getState().vehicles.find((v) => v.id === id);
    set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, ...data } : v)) }));
    void patchResource<Vehicle>('vehicles', id, data).catch((error) => {
      if (prevVehicle) {
        set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? prevVehicle : v)) }));
      }
      showApiErrorToast('Could not update vehicle', 'Changes were reverted.', error);
    });
  },
  deleteVehicle: (id) => {
    const removedVehicle = useVehicleStore.getState().vehicles.find((v) => v.id === id);
    set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) }));
    void deleteResource('vehicles', id).catch((error) => {
      if (removedVehicle) {
        set((s) => ({ vehicles: [...s.vehicles, removedVehicle] }));
      }
      showApiErrorToast('Could not delete vehicle', 'The item was restored.', error);
    });
  },
}));
