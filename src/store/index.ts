export { useHubStore } from './hubStore';
export { useDriverStore } from './driverStore';
export { useVehicleStore } from './vehicleStore';
export { useProductStore } from './productStore';
export { useOrderStore } from './orderStore';
export { useAllocationStore } from './allocationStore';
export { useGPSStore } from './gpsStore';
export { useShiftHistoryStore } from './shiftHistoryStore';
export { useToastStore } from './toastStore';
export { useActiveDriverStore } from './activeDriverStore';
export { hydrateStoresFromApi } from './bootstrap';

import { useHubStore } from './hubStore';
import { useDriverStore } from './driverStore';
import { useVehicleStore } from './vehicleStore';
import { useProductStore } from './productStore';
import { useOrderStore } from './orderStore';
import { useAllocationStore } from './allocationStore';
import { useGPSStore } from './gpsStore';
import { useShiftHistoryStore } from './shiftHistoryStore';
import { useToastStore } from './toastStore';
import { useActiveDriverStore } from './activeDriverStore';

const stores = {
  useHubStore,
  useDriverStore,
  useVehicleStore,
  useProductStore,
  useOrderStore,
  useAllocationStore,
  useGPSStore,
  useShiftHistoryStore,
  useToastStore,
  useActiveDriverStore,
};

export default stores;
