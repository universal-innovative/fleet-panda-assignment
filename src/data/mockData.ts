import type { Hub, Driver, Vehicle, Order, VehicleAllocation, GPSUpdate, ShiftRecord, Product } from '../types';

// ─── Hubs & Terminals ───────────────────────────────────────────

export const initialHubs: Hub[] = [
  {
    id: 'hub-1',
    name: 'Downtown Distribution Hub',
    type: 'hub',
    address: '123 Main St, San Francisco, CA',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    inventory: { diesel: 45000, petrol: 38000, kerosene: 12000 },
  },
  {
    id: 'hub-2',
    name: 'Bayshore Fuel Depot',
    type: 'hub',
    address: '456 Bayshore Blvd, San Francisco, CA',
    coordinates: { lat: 37.7349, lng: -122.4014 },
    inventory: { diesel: 52000, petrol: 41000, kerosene: 8000, lpg: 15000 },
  },
  {
    id: 'terminal-1',
    name: 'Marina Gas Station',
    type: 'terminal',
    address: '789 Marina Blvd, San Francisco, CA',
    coordinates: { lat: 37.8049, lng: -122.4364 },
    inventory: { diesel: 3200, petrol: 5800 },
  },
  {
    id: 'terminal-2',
    name: 'Mission Fuel Stop',
    type: 'terminal',
    address: '321 Mission St, San Francisco, CA',
    coordinates: { lat: 37.7849, lng: -122.3994 },
    inventory: { diesel: 1200, petrol: 800 },
  },
  {
    id: 'terminal-3',
    name: 'Sunset Petroleum',
    type: 'terminal',
    address: '654 Sunset Blvd, San Francisco, CA',
    coordinates: { lat: 37.7549, lng: -122.4894 },
    inventory: { diesel: 4500, petrol: 6200, kerosene: 1500 },
  },
  {
    id: 'terminal-4',
    name: 'Richmond Energy Point',
    type: 'terminal',
    address: '987 Clement St, San Francisco, CA',
    coordinates: { lat: 37.7826, lng: -122.4649 },
    inventory: { diesel: 500, petrol: 300 },
  },
  {
    id: 'terminal-5',
    name: 'Potrero Fuel Center',
    type: 'terminal',
    address: '147 Potrero Ave, San Francisco, CA',
    coordinates: { lat: 37.7629, lng: -122.4074 },
    inventory: { diesel: 7800, petrol: 4500, lpg: 2000 },
  },
  {
    id: 'terminal-6',
    name: 'Embarcadero Station',
    type: 'terminal',
    address: '258 Embarcadero, San Francisco, CA',
    coordinates: { lat: 37.7934, lng: -122.3937 },
    inventory: { diesel: 2100, petrol: 1800, kerosene: 600 },
  },
];

// ─── Drivers ────────────────────────────────────────────────────

export const initialDrivers: Driver[] = [
  { id: 'driver-1', name: 'Marcus Rivera', license: 'DL-784512', phone: '+1-555-0101' },
  { id: 'driver-2', name: 'Sarah Chen', license: 'DL-923841', phone: '+1-555-0102' },
  { id: 'driver-3', name: 'James Okafor', license: 'DL-567123', phone: '+1-555-0103' },
  { id: 'driver-4', name: 'Elena Vasquez', license: 'DL-345678', phone: '+1-555-0104' },
  { id: 'driver-5', name: 'Raj Patel', license: 'DL-891234', phone: '+1-555-0105' },
  { id: 'driver-6', name: 'Tom Nguyen', license: 'DL-654321', phone: '+1-555-0106' },
];

// ─── Vehicles ───────────────────────────────────────────────────

export const initialVehicles: Vehicle[] = [
  { id: 'vehicle-1', registration: 'TRK-101', capacity: 8000, type: 'Tanker' },
  { id: 'vehicle-2', registration: 'TRK-202', capacity: 12000, type: 'Tanker' },
  { id: 'vehicle-3', registration: 'TRK-303', capacity: 6000, type: 'Truck' },
  { id: 'vehicle-4', registration: 'VAN-404', capacity: 3000, type: 'Van' },
  { id: 'vehicle-5', registration: 'TRK-505', capacity: 10000, type: 'Tanker' },
  { id: 'vehicle-6', registration: 'TRK-606', capacity: 8000, type: 'Tanker' },
  { id: 'vehicle-7', registration: 'VAN-707', capacity: 4000, type: 'Van' },
];

// ─── Products ───────────────────────────────────────────────────

export const initialProducts: Product[] = [
  { id: 'product-1', code: 'diesel', name: 'Diesel' },
  { id: 'product-2', code: 'petrol', name: 'Petrol' },
  { id: 'product-3', code: 'kerosene', name: 'Kerosene' },
  { id: 'product-4', code: 'lpg', name: 'LPG' },
];

// ─── Orders ─────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export const initialOrders: Order[] = [
  {
    id: 'order-1',
    destinationId: 'terminal-1',
    product: 'diesel',
    quantity: 5000,
    deliveryDate: today,
    assignedDriverId: 'driver-1',
    status: 'assigned',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'order-2',
    destinationId: 'terminal-2',
    product: 'petrol',
    quantity: 3000,
    deliveryDate: today,
    assignedDriverId: 'driver-1',
    status: 'assigned',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'order-3',
    destinationId: 'terminal-3',
    product: 'diesel',
    quantity: 7000,
    deliveryDate: today,
    assignedDriverId: 'driver-2',
    status: 'assigned',
    createdAt: new Date(Date.now() - 72000000).toISOString(),
  },
  {
    id: 'order-4',
    destinationId: 'terminal-4',
    product: 'petrol',
    quantity: 4000,
    deliveryDate: today,
    assignedDriverId: 'driver-3',
    status: 'in-transit',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'order-5',
    destinationId: 'terminal-5',
    product: 'kerosene',
    quantity: 2500,
    deliveryDate: tomorrow,
    assignedDriverId: null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'order-6',
    destinationId: 'terminal-6',
    product: 'diesel',
    quantity: 6000,
    deliveryDate: tomorrow,
    assignedDriverId: null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'order-7',
    destinationId: 'terminal-1',
    product: 'petrol',
    quantity: 4500,
    deliveryDate: tomorrow,
    assignedDriverId: 'driver-4',
    status: 'assigned',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'order-8',
    destinationId: 'terminal-3',
    product: 'lpg',
    quantity: 3500,
    deliveryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    assignedDriverId: 'driver-2',
    status: 'delivered',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

// ─── Vehicle Allocations ────────────────────────────────────────

export const initialAllocations: VehicleAllocation[] = [
  { id: 'alloc-1', vehicleId: 'vehicle-1', driverId: 'driver-1', date: today, shiftStarted: false, shiftEnded: false },
  { id: 'alloc-2', vehicleId: 'vehicle-2', driverId: 'driver-2', date: today, shiftStarted: false, shiftEnded: false },
  { id: 'alloc-3', vehicleId: 'vehicle-3', driverId: 'driver-3', date: today, shiftStarted: true, shiftEnded: false, startTime: new Date(Date.now() - 3600000).toISOString() },
  { id: 'alloc-4', vehicleId: 'vehicle-5', driverId: 'driver-4', date: tomorrow, shiftStarted: false, shiftEnded: false },
];

// ─── GPS Updates (simulated positions) ──────────────────────────

export const initialGPSUpdates: GPSUpdate[] = [
  {
    driverId: 'driver-1',
    vehicleId: 'vehicle-1',
    coordinates: { lat: 37.7790, lng: -122.4200 },
    timestamp: new Date().toISOString(),
    speed: 0,
    heading: 0,
  },
  {
    driverId: 'driver-2',
    vehicleId: 'vehicle-2',
    coordinates: { lat: 37.7650, lng: -122.4510 },
    timestamp: new Date().toISOString(),
    speed: 35,
    heading: 270,
  },
  {
    driverId: 'driver-3',
    vehicleId: 'vehicle-3',
    coordinates: { lat: 37.7780, lng: -122.4450 },
    timestamp: new Date(Date.now() - 60000).toISOString(),
    speed: 28,
    heading: 180,
  },
];

// ─── Shift History ──────────────────────────────────────────────

export const initialShiftHistory: ShiftRecord[] = [
  {
    id: 'shift-1',
    driverId: 'driver-1',
    vehicleId: 'vehicle-1',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    startTime: new Date(Date.now() - 86400000 - 28800000).toISOString(),
    endTime: new Date(Date.now() - 86400000).toISOString(),
    deliveries: [
      { orderId: 'order-old-1', destinationId: 'terminal-1', destinationName: 'Marina Gas Station', product: 'diesel', quantity: 4500, status: 'delivered', completedAt: new Date(Date.now() - 86400000 - 14400000).toISOString() },
      { orderId: 'order-old-2', destinationId: 'terminal-3', destinationName: 'Sunset Petroleum', product: 'petrol', quantity: 3200, status: 'delivered', completedAt: new Date(Date.now() - 86400000 - 7200000).toISOString() },
    ],
  },
  {
    id: 'shift-2',
    driverId: 'driver-2',
    vehicleId: 'vehicle-2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    startTime: new Date(Date.now() - 86400000 - 25200000).toISOString(),
    endTime: new Date(Date.now() - 86400000 - 3600000).toISOString(),
    deliveries: [
      { orderId: 'order-8', destinationId: 'terminal-3', destinationName: 'Sunset Petroleum', product: 'lpg', quantity: 3500, status: 'delivered', completedAt: new Date(Date.now() - 86400000 - 10800000).toISOString() },
      { orderId: 'order-old-3', destinationId: 'terminal-4', destinationName: 'Richmond Energy Point', product: 'diesel', quantity: 2000, status: 'failed', failReason: 'Terminal closed - no staff present' },
    ],
  },
];

// ─── Helper: generate unique ID ─────────────────────────────────

let counter = 100;
export const generateId = (prefix: string): string => {
  counter++;
  return `${prefix}-${counter}`;
};
