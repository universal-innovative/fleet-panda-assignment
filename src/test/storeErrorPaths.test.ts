import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import {
  useAllocationStore,
  useDriverStore,
  useHubStore,
  useOrderStore,
  useProductStore,
  useToastStore,
  useVehicleStore,
} from '../store';

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('store error paths', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useToastStore.setState({ toasts: [] });
    useDriverStore.setState({ drivers: [{ id: 'd1', name: 'A', license: 'DL-1', phone: '1' }], isLoaded: false, isLoading: false });
    useProductStore.setState({ products: [{ id: 'p1', code: 'diesel', name: 'Diesel' }], isLoaded: false, isLoading: false });
    useVehicleStore.setState({ vehicles: [{ id: 'v1', registration: 'TRK-1', capacity: 1, type: 'Tanker' }], isLoaded: false, isLoading: false });
    useHubStore.setState({
      hubs: [{ id: 'h1', name: 'Hub', type: 'hub', address: 'A', coordinates: { lat: 1, lng: 1 }, inventory: { diesel: 10 } }],
      isLoaded: false,
      isLoading: false,
    });
    useAllocationStore.setState({
      allocations: [{ id: 'a1', vehicleId: 'v1', driverId: 'd1', date: '2026-02-26', shiftStarted: false, shiftEnded: false }],
      isLoaded: false,
      isLoading: false,
    });
    useOrderStore.setState({
      orders: [
        {
          id: 'o1',
          destinationId: 'h1',
          product: 'diesel',
          quantity: 1,
          deliveryDate: '2026-02-26',
          assignedDriverId: null,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ],
      isLoaded: false,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles load failures with toast notifications', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    await useDriverStore.getState().loadDrivers();
    await useProductStore.getState().loadProducts();
    await useVehicleStore.getState().loadVehicles();
    await useHubStore.getState().loadHubs();
    await useOrderStore.getState().loadOrders();
    await useAllocationStore.getState().loadAllocations();
    expect(useToastStore.getState().toasts.filter((t) => t.type === 'error').length).toBeGreaterThan(0);
  });

  it('rolls back optimistic update/delete operations on API failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));

    act(() => {
      useDriverStore.getState().updateDriver('d1', { name: 'Changed' });
      useDriverStore.getState().deleteDriver('d1');
      useProductStore.getState().updateProduct('p1', { name: 'Changed' });
      useProductStore.getState().deleteProduct('p1');
      useVehicleStore.getState().updateVehicle('v1', { registration: 'TRK-X' });
      useVehicleStore.getState().deleteVehicle('v1');
      useHubStore.getState().updateHub('h1', { name: 'Changed' });
      useHubStore.getState().deleteHub('h1');
      useOrderStore.getState().updateOrder('o1', { quantity: 9 });
      useOrderStore.getState().updateStatus('o1', 'failed', 'reason');
      useOrderStore.getState().deleteOrder('o1');
      useAllocationStore.getState().startShift('a1');
      useAllocationStore.getState().endShift('a1');
      useAllocationStore.getState().deleteAllocation('a1');
      useHubStore.getState().updateInventory('h1', 'diesel', -5);
    });
    await flush();

    expect(useDriverStore.getState().drivers.some((d) => d.id === 'd1')).toBe(true);
    expect(useProductStore.getState().products.some((p) => p.id === 'p1')).toBe(true);
    expect(useVehicleStore.getState().vehicles.some((v) => v.id === 'v1')).toBe(true);
    expect(useHubStore.getState().hubs.some((h) => h.id === 'h1')).toBe(true);
    expect(useOrderStore.getState().orders.some((o) => o.id === 'o1')).toBe(true);
    expect(useAllocationStore.getState().allocations.some((a) => a.id === 'a1')).toBe(true);
  });
});
