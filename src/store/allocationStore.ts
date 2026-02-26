import { create } from 'zustand';
import type { VehicleAllocation } from '../types';
import { initialAllocations, generateId } from '../data/mockData';
import { createResource, deleteResource, listResource, patchResource } from '../api/resources';
import { showApiErrorToast } from './apiErrors';

interface AllocationStore {
  allocations: VehicleAllocation[];
  isLoading: boolean;
  isLoaded: boolean;
  loadAllocations: () => Promise<void>;
  addAllocation: (alloc: Omit<VehicleAllocation, 'id' | 'shiftStarted' | 'shiftEnded'>) => { success: boolean; error?: string };
  startShift: (allocId: string) => void;
  endShift: (allocId: string) => void;
  deleteAllocation: (id: string) => void;
  isVehicleAllocated: (vehicleId: string, date: string) => boolean;
  isDriverAllocated: (driverId: string, date: string) => boolean;
}

export const useAllocationStore = create<AllocationStore>((set, get) => ({
  allocations: initialAllocations,
  isLoading: false,
  isLoaded: false,
  loadAllocations: async () => {
    if (get().isLoading || get().isLoaded) return;
    set({ isLoading: true });
    try {
      const allocations = await listResource<VehicleAllocation>('allocations');
      set({ allocations, isLoaded: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      showApiErrorToast('Could not load allocations', 'Using local fallback data.', error);
    }
  },
  addAllocation: (data) => {
    const state = get();
    if (state.isVehicleAllocated(data.vehicleId, data.date)) {
      return { success: false, error: 'Vehicle is already allocated for this date' };
    }
    if (state.isDriverAllocated(data.driverId, data.date)) {
      return { success: false, error: 'Driver is already allocated for this date' };
    }

    const newAllocation: VehicleAllocation = {
      ...data,
      id: generateId('alloc'),
      shiftStarted: false,
      shiftEnded: false,
    };
    set((s) => ({ allocations: [...s.allocations, newAllocation] }));
    void createResource('allocations', newAllocation).catch((error) => {
      set((s) => ({ allocations: s.allocations.filter((a) => a.id !== newAllocation.id) }));
      showApiErrorToast('Could not create allocation', 'Please try again.', error);
    });
    return { success: true };
  },
  startShift: (allocId) => {
    const prevAllocation = useAllocationStore.getState().allocations.find((a) => a.id === allocId);
    const startTime = new Date().toISOString();
    set((s) => ({
      allocations: s.allocations.map((a) => (a.id === allocId ? { ...a, shiftStarted: true, startTime } : a)),
    }));
    void patchResource<VehicleAllocation>('allocations', allocId, { shiftStarted: true, startTime }).catch((error) => {
      if (prevAllocation) {
        set((s) => ({ allocations: s.allocations.map((a) => (a.id === allocId ? prevAllocation : a)) }));
      }
      showApiErrorToast('Could not start shift', 'Shift state was reverted.', error);
    });
  },
  endShift: (allocId) => {
    const prevAllocation = useAllocationStore.getState().allocations.find((a) => a.id === allocId);
    const endTime = new Date().toISOString();
    set((s) => ({
      allocations: s.allocations.map((a) => (a.id === allocId ? { ...a, shiftEnded: true, endTime } : a)),
    }));
    void patchResource<VehicleAllocation>('allocations', allocId, { shiftEnded: true, endTime }).catch((error) => {
      if (prevAllocation) {
        set((s) => ({ allocations: s.allocations.map((a) => (a.id === allocId ? prevAllocation : a)) }));
      }
      showApiErrorToast('Could not end shift', 'Shift state was reverted.', error);
    });
  },
  deleteAllocation: (id) => {
    const removedAllocation = useAllocationStore.getState().allocations.find((a) => a.id === id);
    set((s) => ({ allocations: s.allocations.filter((a) => a.id !== id) }));
    void deleteResource('allocations', id).catch((error) => {
      if (removedAllocation) {
        set((s) => ({ allocations: [...s.allocations, removedAllocation] }));
      }
      showApiErrorToast('Could not delete allocation', 'The item was restored.', error);
    });
  },
  isVehicleAllocated: (vehicleId, date) => get().allocations.some((a) => a.vehicleId === vehicleId && a.date === date),
  isDriverAllocated: (driverId, date) => get().allocations.some((a) => a.driverId === driverId && a.date === date),
}));
