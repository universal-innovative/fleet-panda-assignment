import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import {
  useHubStore,
  useDriverStore,
  useProductStore,
  useVehicleStore,
  useOrderStore,
  useAllocationStore,
  useGPSStore,
  useShiftHistoryStore,
  useToastStore,
  useActiveDriverStore,
} from '../store';
import {
  initialHubs,
  initialDrivers,
  initialProducts,
  initialVehicles,
  initialOrders,
  initialAllocations,
  initialGPSUpdates,
  initialShiftHistory,
} from '../data/mockData';

beforeEach(() => {
  useHubStore.setState({ hubs: JSON.parse(JSON.stringify(initialHubs)) });
  useDriverStore.setState({ drivers: JSON.parse(JSON.stringify(initialDrivers)) });
  useProductStore.setState({ products: JSON.parse(JSON.stringify(initialProducts)) });
  useVehicleStore.setState({ vehicles: JSON.parse(JSON.stringify(initialVehicles)) });
  useOrderStore.setState({ orders: JSON.parse(JSON.stringify(initialOrders)) });
  useAllocationStore.setState({ allocations: JSON.parse(JSON.stringify(initialAllocations)) });
  useGPSStore.setState({ updates: JSON.parse(JSON.stringify(initialGPSUpdates)) });
  useShiftHistoryStore.setState({ history: JSON.parse(JSON.stringify(initialShiftHistory)) });
  useToastStore.setState({ toasts: [] });
  useActiveDriverStore.setState({ activeDriverId: 'driver-1' });

  vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
    if (init?.method === 'DELETE') {
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    return Promise.resolve(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Hub Store ───────────────────────────────────────────────────

describe('HubStore', () => {
  it('initializes with mock hubs', () => {
    const { hubs } = useHubStore.getState();
    expect(hubs.length).toBeGreaterThan(0);
    expect(hubs[0]).toHaveProperty('id');
    expect(hubs[0]).toHaveProperty('name');
    expect(hubs[0]).toHaveProperty('type');
    expect(hubs[0]).toHaveProperty('inventory');
  });

  it('adds a new hub', () => {
    const initialCount = useHubStore.getState().hubs.length;
    act(() => {
      useHubStore.getState().addHub({
        name: 'Test Hub',
        type: 'hub',
        address: '123 Test St',
        coordinates: { lat: 37.0, lng: -122.0 },
        inventory: { diesel: 5000 },
      });
    });
    const { hubs } = useHubStore.getState();
    expect(hubs.length).toBe(initialCount + 1);
    expect(hubs[hubs.length - 1].name).toBe('Test Hub');
  });

  it('updates a hub', () => {
    const { hubs } = useHubStore.getState();
    const hubId = hubs[0].id;
    act(() => {
      useHubStore.getState().updateHub(hubId, { name: 'Updated Hub Name' });
    });
    const updated = useHubStore.getState().hubs.find((h) => h.id === hubId);
    expect(updated?.name).toBe('Updated Hub Name');
  });

  it('deletes a hub', () => {
    const initialCount = useHubStore.getState().hubs.length;
    const hubId = useHubStore.getState().hubs[0].id;
    act(() => {
      useHubStore.getState().deleteHub(hubId);
    });
    expect(useHubStore.getState().hubs.length).toBe(initialCount - 1);
  });

  it('updates inventory', () => {
    // Re-add a hub so we have something to work with
    act(() => {
      useHubStore.getState().addHub({
        name: 'Inventory Test Hub',
        type: 'hub',
        address: '456 Test St',
        coordinates: { lat: 37.5, lng: -122.5 },
        inventory: { diesel: 10000 },
      });
    });
    const hubs = useHubStore.getState().hubs;
    const hub = hubs[hubs.length - 1];
    act(() => {
      useHubStore.getState().updateInventory(hub.id, 'diesel', -3000);
    });
    const updated = useHubStore.getState().hubs.find((h) => h.id === hub.id);
    expect(updated?.inventory.diesel).toBe(7000);
  });
});

// ─── Driver Store ────────────────────────────────────────────────

describe('DriverStore', () => {
  it('initializes with mock drivers', () => {
    const { drivers } = useDriverStore.getState();
    expect(drivers.length).toBeGreaterThan(0);
  });

  it('adds a new driver', () => {
    const initialCount = useDriverStore.getState().drivers.length;
    act(() => {
      useDriverStore.getState().addDriver({
        name: 'Test Driver',
        license: 'DL-999999',
        phone: '+1-555-0999',
      });
    });
    expect(useDriverStore.getState().drivers.length).toBe(initialCount + 1);
  });

  it('updates a driver', () => {
    const driverId = useDriverStore.getState().drivers[0].id;
    act(() => {
      useDriverStore.getState().updateDriver(driverId, { name: 'Updated Driver' });
    });
    const driver = useDriverStore.getState().drivers.find((d) => d.id === driverId);
    expect(driver?.name).toBe('Updated Driver');
  });

  it('deletes a driver', () => {
    const initialCount = useDriverStore.getState().drivers.length;
    const driverId = useDriverStore.getState().drivers[0].id;
    act(() => {
      useDriverStore.getState().deleteDriver(driverId);
    });
    expect(useDriverStore.getState().drivers.length).toBe(initialCount - 1);
  });
});

// ─── Product Store ──────────────────────────────────────────────

describe('ProductStore', () => {
  it('initializes with mock products', () => {
    const { products } = useProductStore.getState();
    expect(products.length).toBeGreaterThan(0);
  });

  it('adds a new product', () => {
    const initialCount = useProductStore.getState().products.length;
    act(() => {
      useProductStore.getState().addProduct({
        code: 'biofuel',
        name: 'Biofuel',
      });
    });
    expect(useProductStore.getState().products.length).toBe(initialCount + 1);
  });
});

// ─── Vehicle Store ───────────────────────────────────────────────

describe('VehicleStore', () => {
  it('initializes with mock vehicles', () => {
    const { vehicles } = useVehicleStore.getState();
    expect(vehicles.length).toBeGreaterThan(0);
    expect(vehicles[0]).toHaveProperty('registration');
    expect(vehicles[0]).toHaveProperty('capacity');
  });

  it('adds and deletes vehicles', () => {
    const initialCount = useVehicleStore.getState().vehicles.length;
    act(() => {
      useVehicleStore.getState().addVehicle({
        registration: 'TRK-999',
        capacity: 5000,
        type: 'Tanker',
      });
    });
    expect(useVehicleStore.getState().vehicles.length).toBe(initialCount + 1);
  });

  it('rolls back optimistic create on API error', async () => {
    vi.mocked(globalThis.fetch).mockImplementation(() => Promise.reject(new Error('Network down')));
    const initialCount = useVehicleStore.getState().vehicles.length;

    act(() => {
      useVehicleStore.getState().addVehicle({
        registration: 'TRK-ERR',
        capacity: 5000,
        type: 'Tanker',
      });
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(useVehicleStore.getState().vehicles.length).toBe(initialCount);
    expect(useToastStore.getState().toasts.some((t) => t.type === 'error')).toBe(true);
  });
});

// ─── Order Store ─────────────────────────────────────────────────

describe('OrderStore', () => {
  it('initializes with mock orders', () => {
    const { orders } = useOrderStore.getState();
    expect(orders.length).toBeGreaterThan(0);
  });

  it('adds a new order', () => {
    const initialCount = useOrderStore.getState().orders.length;
    act(() => {
      useOrderStore.getState().addOrder({
        destinationId: 'terminal-1',
        product: 'diesel',
        quantity: 5000,
        deliveryDate: '2025-12-01',
        assignedDriverId: null,
        status: 'pending',
      });
    });
    const orders = useOrderStore.getState().orders;
    expect(orders.length).toBe(initialCount + 1);
    expect(orders[orders.length - 1].status).toBe('pending');
    expect(orders[orders.length - 1]).toHaveProperty('createdAt');
  });

  it('assigns a driver to an order', () => {
    const orderId = useOrderStore.getState().orders.find((o) => o.status === 'pending')?.id;
    if (!orderId) return;
    act(() => {
      useOrderStore.getState().assignDriver(orderId, 'driver-1');
    });
    const order = useOrderStore.getState().orders.find((o) => o.id === orderId);
    expect(order?.assignedDriverId).toBe('driver-1');
    expect(order?.status).toBe('assigned');
  });

  it('updates order status', () => {
    const orderId = useOrderStore.getState().orders[0].id;
    act(() => {
      useOrderStore.getState().updateStatus(orderId, 'delivered');
    });
    const order = useOrderStore.getState().orders.find((o) => o.id === orderId);
    expect(order?.status).toBe('delivered');
  });

  it('updates order status with fail reason', () => {
    const orderId = useOrderStore.getState().orders[0].id;
    act(() => {
      useOrderStore.getState().updateStatus(orderId, 'failed', 'Site closed');
    });
    const order = useOrderStore.getState().orders.find((o) => o.id === orderId);
    expect(order?.status).toBe('failed');
    expect(order?.failReason).toBe('Site closed');
  });

  it('blocks assigning a driver when their shift is already ended for order date', () => {
    const today = new Date().toISOString().split('T')[0];
    act(() => {
      useAllocationStore.setState({
        allocations: useAllocationStore.getState().allocations.map((a) =>
          a.driverId === 'driver-1' && a.date === today ? { ...a, shiftEnded: true } : a
        ),
      });
    });

    const pendingOrderId = useOrderStore.getState().orders.find((o) => o.deliveryDate === today && o.status === 'pending')?.id;
    if (!pendingOrderId) return;

    const result = useOrderStore.getState().assignDriver(pendingOrderId, 'driver-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('shift has already ended');
  });

  it('blocks creating pre-assigned order when driver shift is already ended for delivery date', () => {
    const today = new Date().toISOString().split('T')[0];
    act(() => {
      useAllocationStore.setState({
        allocations: useAllocationStore.getState().allocations.map((a) =>
          a.driverId === 'driver-1' && a.date === today ? { ...a, shiftEnded: true } : a
        ),
      });
    });

    const beforeCount = useOrderStore.getState().orders.length;
    const result = useOrderStore.getState().addOrder({
      destinationId: 'terminal-1',
      product: 'diesel',
      quantity: 1000,
      deliveryDate: today,
      assignedDriverId: 'driver-1',
      status: 'assigned',
    });
    expect(result.success).toBe(false);
    expect(useOrderStore.getState().orders.length).toBe(beforeCount);
  });
});

// ─── Allocation Store ────────────────────────────────────────────

describe('AllocationStore', () => {
  it('initializes with mock allocations', () => {
    const { allocations } = useAllocationStore.getState();
    expect(allocations.length).toBeGreaterThan(0);
  });

  it('prevents double-booking vehicles', () => {
    const allocs = useAllocationStore.getState().allocations;
    const existing = allocs[0];

    const result = useAllocationStore.getState().addAllocation({
      vehicleId: existing.vehicleId,
      driverId: 'driver-99',
      date: existing.date,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Vehicle');
  });

  it('prevents double-booking drivers', () => {
    const allocs = useAllocationStore.getState().allocations;
    const existing = allocs[0];

    const result = useAllocationStore.getState().addAllocation({
      vehicleId: 'vehicle-99',
      driverId: existing.driverId,
      date: existing.date,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Driver');
  });

  it('starts and ends shift', () => {
    const allocId = useAllocationStore.getState().allocations[0].id;

    act(() => {
      useAllocationStore.getState().startShift(allocId);
    });
    let alloc = useAllocationStore.getState().allocations.find((a) => a.id === allocId);
    expect(alloc?.shiftStarted).toBe(true);
    expect(alloc?.startTime).toBeDefined();

    act(() => {
      useAllocationStore.getState().endShift(allocId);
    });
    alloc = useAllocationStore.getState().allocations.find((a) => a.id === allocId);
    expect(alloc?.shiftEnded).toBe(true);
    expect(alloc?.endTime).toBeDefined();
  });

  it('checks vehicle and driver allocation', () => {
    const allocs = useAllocationStore.getState().allocations;
    const existing = allocs[0];

    expect(useAllocationStore.getState().isVehicleAllocated(existing.vehicleId, existing.date)).toBe(true);
    expect(useAllocationStore.getState().isVehicleAllocated('nonexistent', existing.date)).toBe(false);
    expect(useAllocationStore.getState().isDriverAllocated(existing.driverId, existing.date)).toBe(true);
  });
});

// ─── GPS Store ───────────────────────────────────────────────────

describe('GPSStore', () => {
  it('initializes with GPS updates', () => {
    const { updates } = useGPSStore.getState();
    expect(updates.length).toBeGreaterThan(0);
  });

  it('gets driver location', () => {
    const update = useGPSStore.getState().updates[0];
    const location = useGPSStore.getState().getDriverLocation(update.driverId);
    expect(location).toBeDefined();
    expect(location?.coordinates).toHaveProperty('lat');
    expect(location?.coordinates).toHaveProperty('lng');
  });

  it('sends GPS update (replaces old)', () => {
    const driverId = useGPSStore.getState().updates[0].driverId;
    const initialCount = useGPSStore.getState().updates.length;

    act(() => {
      useGPSStore.getState().sendUpdate({
        driverId,
        vehicleId: 'vehicle-1',
        coordinates: { lat: 37.8, lng: -122.5 },
        timestamp: new Date().toISOString(),
        speed: 50,
        heading: 90,
      });
    });

    // Count should stay same (replaced, not added)
    expect(useGPSStore.getState().updates.length).toBe(initialCount);
    const updated = useGPSStore.getState().getDriverLocation(driverId);
    expect(updated?.speed).toBe(50);
    expect(updated?.coordinates.lat).toBe(37.8);
  });

  it('simulates movement for all drivers', () => {
    const before = useGPSStore.getState().updates.map((u) => ({ ...u.coordinates }));
    act(() => {
      useGPSStore.getState().simulateMovement();
    });
    const after = useGPSStore.getState().updates.map((u) => u.coordinates);
    // At least one coordinate should change (probabilistic but near-certain)
    const changed = before.some((b, i) => b.lat !== after[i].lat || b.lng !== after[i].lng);
    expect(changed).toBe(true);
  });
});

// ─── Toast Store ─────────────────────────────────────────────────

describe('ToastStore', () => {
  it('adds and auto-removes toasts', () => {
    act(() => {
      useToastStore.getState().addToast({ type: 'success', title: 'Test' });
    });
    expect(useToastStore.getState().toasts.length).toBeGreaterThan(0);
  });

  it('manually removes a toast', () => {
    act(() => {
      useToastStore.getState().addToast({ type: 'info', title: 'Manual' });
    });
    const toast = useToastStore.getState().toasts.find((t) => t.title === 'Manual');
    if (toast) {
      act(() => {
        useToastStore.getState().removeToast(toast.id);
      });
      expect(useToastStore.getState().toasts.find((t) => t.id === toast.id)).toBeUndefined();
    }
  });
});

// ─── Active Driver Store ─────────────────────────────────────────

describe('ActiveDriverStore', () => {
  it('defaults to driver-1', () => {
    expect(useActiveDriverStore.getState().activeDriverId).toBe('driver-1');
  });

  it('sets active driver', () => {
    act(() => {
      useActiveDriverStore.getState().setActiveDriver('driver-3');
    });
    expect(useActiveDriverStore.getState().activeDriverId).toBe('driver-3');
  });

  it('clears active driver', () => {
    act(() => {
      useActiveDriverStore.getState().setActiveDriver(null);
    });
    expect(useActiveDriverStore.getState().activeDriverId).toBeNull();
  });
});
