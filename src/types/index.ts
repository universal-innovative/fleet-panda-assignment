// ─── Core Entities ──────────────────────────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Hub {
  id: string;
  name: string;
  type: 'hub' | 'terminal';
  address: string;
  coordinates: Coordinates;
  inventory: Record<string, number>;
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  phone: string;
  avatar?: string;
}

export interface Vehicle {
  id: string;
  registration: string;
  capacity: number;
  type: 'Tanker' | 'Truck' | 'Van';
}

export type OrderStatus = 'pending' | 'assigned' | 'in-transit' | 'delivered' | 'failed';
export type ProductType = string;

export interface Product {
  id: string;
  code: ProductType;
  name: string;
}

export interface Order {
  id: string;
  destinationId: string;
  product: ProductType;
  quantity: number;
  deliveryDate: string;
  assignedDriverId: string | null;
  status: OrderStatus;
  priority?: 'normal' | 'urgent';
  createdAt: string;
  deliveredAt?: string;
  failReason?: string;
}

export interface VehicleAllocation {
  id: string;
  vehicleId: string;
  driverId: string;
  date: string;
  shiftStarted: boolean;
  shiftEnded: boolean;
  startTime?: string;
  endTime?: string;
}

// ─── GPS & Real-time ────────────────────────────────────────────

export interface GPSUpdate {
  driverId: string;
  vehicleId: string;
  coordinates: Coordinates;
  timestamp: string;
  speed: number;
  heading: number;
}

// ─── Shift & Delivery ───────────────────────────────────────────

export interface ShiftRecord {
  id: string;
  driverId: string;
  vehicleId: string;
  date: string;
  startTime: string;
  endTime?: string;
  deliveries: DeliveryRecord[];
}

export interface DeliveryRecord {
  orderId: string;
  destinationId: string;
  destinationName: string;
  product: ProductType;
  quantity: number;
  status: 'pending' | 'delivered' | 'failed';
  completedAt?: string;
  failReason?: string;
}

// ─── UI State ───────────────────────────────────────────────────

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data?: unknown;
}
