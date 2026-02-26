import { create } from 'zustand';
import type { GPSUpdate } from '../types';
import { initialGPSUpdates } from '../data/mockData';

interface GPSStore {
  updates: GPSUpdate[];
  sendUpdate: (update: GPSUpdate) => void;
  getDriverLocation: (driverId: string) => GPSUpdate | undefined;
  simulateMovement: () => void;
}

export const useGPSStore = create<GPSStore>((set, get) => ({
  updates: initialGPSUpdates,
  sendUpdate: (update) =>
    set((s) => {
      const filtered = s.updates.filter((u) => u.driverId !== update.driverId);
      return { updates: [...filtered, update] };
    }),
  getDriverLocation: (driverId) => get().updates.find((u) => u.driverId === driverId),
  simulateMovement: () =>
    set((s) => ({
      updates: s.updates.map((u) => ({
        ...u,
        coordinates: {
          lat: u.coordinates.lat + (Math.random() - 0.5) * 0.003,
          lng: u.coordinates.lng + (Math.random() - 0.5) * 0.003,
        },
        speed: Math.floor(Math.random() * 45) + 5,
        heading: Math.floor(Math.random() * 360),
        timestamp: new Date().toISOString(),
      })),
    })),
}));

