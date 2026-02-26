import { create } from 'zustand';
import type { Order, OrderStatus } from '../types';
import { createResource, deleteResource, listResource, patchResource } from '../api/resources';
import { showApiErrorToast } from './apiErrors';
import { useAllocationStore } from './allocationStore';
import { generateId } from '../utils/id';

interface OrderStore {
  orders: Order[];
  isLoading: boolean;
  isLoaded: boolean;
  loadOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  updateOrder: (id: string, data: Partial<Order>) => void;
  assignDriver: (orderId: string, driverId: string) => { success: boolean; error?: string };
  updateStatus: (orderId: string, status: OrderStatus, failReason?: string) => void;
  deleteOrder: (id: string) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  isLoading: false,
  isLoaded: false,
  loadOrders: async () => {
    if (get().isLoading || get().isLoaded) return;
    set({ isLoading: true });
    try {
      const orders = await listResource<Order>('orders');
      set({ orders, isLoaded: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      showApiErrorToast('Could not load orders', 'Please check API connectivity and retry.', error);
    }
  },
  addOrder: (data) => {
    if (data.assignedDriverId) {
      const allocation = useAllocationStore
        .getState()
        .allocations.find((a) => a.driverId === data.assignedDriverId && a.date === data.deliveryDate);
      if (!allocation) {
        return { success: false, error: 'Cannot assign order. Allocate a vehicle to this driver for the delivery date first.' };
      }
      const shiftEnded = allocation.shiftEnded;
      if (shiftEnded) {
        return { success: false, error: 'Cannot assign order. Driver shift has already ended for this date.' };
      }
    }

    const newOrder: Order = { ...data, id: generateId('order'), createdAt: new Date().toISOString() };
    set((s) => ({ orders: [...s.orders, newOrder] }));
    void createResource('orders', newOrder).catch((error) => {
      set((s) => ({ orders: s.orders.filter((o) => o.id !== newOrder.id) }));
      showApiErrorToast('Could not create order', 'Please try again.', error);
    });
    return { success: true };
  },
  updateOrder: (id, data) => {
    const prevOrder = useOrderStore.getState().orders.find((o) => o.id === id);
    set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, ...data } : o)) }));
    void patchResource<Order>('orders', id, data).catch((error) => {
      if (prevOrder) {
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? prevOrder : o)) }));
      }
      showApiErrorToast('Could not update order', 'Changes were reverted.', error);
    });
  },
  assignDriver: (orderId, driverId) => {
    const order = useOrderStore.getState().orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    const allocation = useAllocationStore
      .getState()
      .allocations.find((a) => a.driverId === driverId && a.date === order.deliveryDate);
    if (!allocation) {
      return { success: false, error: 'Cannot assign order. Allocate a vehicle to this driver for the delivery date first.' };
    }
    const shiftEnded = allocation.shiftEnded;
    if (shiftEnded) {
      return { success: false, error: 'Cannot assign order. Driver shift has already ended for this date.' };
    }

    const prevOrder = useOrderStore.getState().orders.find((o) => o.id === orderId);
    const patch: Partial<Order> = { assignedDriverId: driverId, status: 'assigned' };
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, ...patch } : o)),
    }));
    void patchResource<Order>('orders', orderId, patch).catch((error) => {
      if (prevOrder) {
        set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? prevOrder : o)) }));
      }
      showApiErrorToast('Could not assign driver', 'Changes were reverted.', error);
    });
    return { success: true };
  },
  updateStatus: (orderId, status, failReason) => {
    const prevOrder = useOrderStore.getState().orders.find((o) => o.id === orderId);
    const patch: Partial<Order> = {
      status,
      ...(status === 'delivered' ? { deliveredAt: new Date().toISOString(), failReason: undefined } : {}),
      ...(status === 'failed' ? { failReason } : {}),
    };
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, ...patch } : o)),
    }));
    void patchResource<Order>('orders', orderId, patch).catch((error) => {
      if (prevOrder) {
        set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? prevOrder : o)) }));
      }
      showApiErrorToast('Could not update status', 'Changes were reverted.', error);
    });
  },
  deleteOrder: (id) => {
    const removedOrder = useOrderStore.getState().orders.find((o) => o.id === id);
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
    void deleteResource('orders', id).catch((error) => {
      if (removedOrder) {
        set((s) => ({ orders: [...s.orders, removedOrder] }));
      }
      showApiErrorToast('Could not delete order', 'The item was restored.', error);
    });
  },
}));
