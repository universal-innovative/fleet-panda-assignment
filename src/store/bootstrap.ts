import type { Hub, Driver, Vehicle, Order, VehicleAllocation, Product } from '../types';
import { listResource } from '../api/resources';
import { useHubStore } from './hubStore';
import { useDriverStore } from './driverStore';
import { useVehicleStore } from './vehicleStore';
import { useOrderStore } from './orderStore';
import { useAllocationStore } from './allocationStore';
import { useProductStore } from './productStore';

export async function hydrateStoresFromApi(): Promise<void> {
  const [hubs, drivers, vehicles, orders, allocations, products] = await Promise.all([
    listResource<Hub>('hubs'),
    listResource<Driver>('drivers'),
    listResource<Vehicle>('vehicles'),
    listResource<Order>('orders'),
    listResource<VehicleAllocation>('allocations'),
    listResource<Product>('products'),
  ]);

  useHubStore.setState({ hubs });
  useDriverStore.setState({ drivers });
  useVehicleStore.setState({ vehicles });
  useOrderStore.setState({ orders });
  useAllocationStore.setState({ allocations });
  useProductStore.setState({ products });
}
