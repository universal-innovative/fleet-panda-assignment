import type { Hub, Driver, Vehicle, Order, VehicleAllocation, Product, GPSUpdate, ShiftRecord } from '../types';
import { listResource } from '../api/resources';
import { useHubStore } from './hubStore';
import { useDriverStore } from './driverStore';
import { useVehicleStore } from './vehicleStore';
import { useOrderStore } from './orderStore';
import { useAllocationStore } from './allocationStore';
import { useProductStore } from './productStore';
import { useGPSStore } from './gpsStore';
import { useShiftHistoryStore } from './shiftHistoryStore';

export async function hydrateStoresFromApi(): Promise<void> {
  const [hubs, drivers, vehicles, orders, allocations, products, updates, history] = await Promise.all([
    listResource<Hub>('hubs'),
    listResource<Driver>('drivers'),
    listResource<Vehicle>('vehicles'),
    listResource<Order>('orders'),
    listResource<VehicleAllocation>('allocations'),
    listResource<Product>('products'),
    listResource<GPSUpdate>('gpsUpdates'),
    listResource<ShiftRecord>('shiftHistory'),
  ]);

  useHubStore.setState({ hubs });
  useDriverStore.setState({ drivers });
  useVehicleStore.setState({ vehicles });
  useOrderStore.setState({ orders });
  useAllocationStore.setState({ allocations });
  useProductStore.setState({ products });
  useGPSStore.setState({ updates });
  useShiftHistoryStore.setState({ history });
}
