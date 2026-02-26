import { create } from 'zustand';
import type { ShiftRecord, VehicleAllocation } from '../types';
import { createResource, deleteResource, listResource, patchResource } from '../api/resources';
import { showApiErrorToast } from './apiErrors';
import { useOrderStore } from './orderStore';
import { useHubStore } from './hubStore';
import { useShiftHistoryStore } from './shiftHistoryStore';
import { generateId } from '../utils/id';

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
  allocations: [],
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
      showApiErrorToast('Could not load allocations', 'Please check API connectivity and retry.', error);
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
    const prevHistory = useShiftHistoryStore.getState().history;
    const allocation = get().allocations.find((a) => a.id === allocId);
    if (!allocation) return;

    const endTime = new Date().toISOString();
    const assignedOrders = useOrderStore
      .getState()
      .orders.filter((o) => o.assignedDriverId === allocation.driverId && o.deliveryDate === allocation.date);
    const hubs = useHubStore.getState().hubs;
    const deliveries = assignedOrders.map((order) => {
      const destinationName = hubs.find((h) => h.id === order.destinationId)?.name ?? 'Unknown';
      return {
        orderId: order.id,
        destinationId: order.destinationId,
        destinationName,
        product: order.product,
        quantity: order.quantity,
        status: order.status === 'delivered' || order.status === 'failed' ? order.status : 'pending',
        completedAt: order.deliveredAt,
        failReason: order.failReason,
      };
    });

    const historyRecord: ShiftRecord = {
      id: `shift-${allocId}`,
      driverId: allocation.driverId,
      vehicleId: allocation.vehicleId,
      date: allocation.date,
      startTime: allocation.startTime ?? endTime,
      endTime,
      deliveries,
    };
    useShiftHistoryStore.getState().upsertRecord(historyRecord);

    set((s) => ({
      allocations: s.allocations.map((a) => (a.id === allocId ? { ...a, shiftEnded: true, endTime } : a)),
    }));
    void patchResource<ShiftRecord>('shiftHistory', historyRecord.id, historyRecord).catch(() =>
      createResource('shiftHistory', historyRecord).catch(() => undefined)
    );
    void patchResource<VehicleAllocation>('allocations', allocId, { shiftEnded: true, endTime }).catch((error) => {
      if (prevAllocation) {
        set((s) => ({ allocations: s.allocations.map((a) => (a.id === allocId ? prevAllocation : a)) }));
      }
      useShiftHistoryStore.setState({ history: prevHistory });
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
