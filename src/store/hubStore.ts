import { create } from 'zustand';
import type { Hub } from '../types';
import { initialHubs, generateId } from '../data/mockData';
import { createResource, deleteResource, listResource, patchResource } from '../api/resources';
import { showApiErrorToast } from './apiErrors';

interface HubStore {
  hubs: Hub[];
  isLoading: boolean;
  isLoaded: boolean;
  loadHubs: () => Promise<void>;
  addHub: (hub: Omit<Hub, 'id'>) => void;
  updateHub: (id: string, data: Partial<Hub>) => void;
  deleteHub: (id: string) => void;
  updateInventory: (hubId: string, product: string, delta: number) => void;
}

export const useHubStore = create<HubStore>((set, get) => ({
  hubs: initialHubs,
  isLoading: false,
  isLoaded: false,
  loadHubs: async () => {
    if (get().isLoading || get().isLoaded) return;
    set({ isLoading: true });
    try {
      const hubs = await listResource<Hub>('hubs');
      set({ hubs, isLoaded: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      showApiErrorToast('Could not load locations', 'Using local fallback data.', error);
    }
  },
  addHub: (data) => {
    const newHub: Hub = { ...data, id: generateId('hub') };
    set((s) => ({ hubs: [...s.hubs, newHub] }));
    void createResource('hubs', newHub).catch((error) => {
      set((s) => ({ hubs: s.hubs.filter((h) => h.id !== newHub.id) }));
      showApiErrorToast('Could not create location', 'Please try again.', error);
    });
  },
  updateHub: (id, data) => {
    const prevHub = useHubStore.getState().hubs.find((h) => h.id === id);
    set((s) => ({ hubs: s.hubs.map((h) => (h.id === id ? { ...h, ...data } : h)) }));
    void patchResource<Hub>('hubs', id, data).catch((error) => {
      if (prevHub) {
        set((s) => ({ hubs: s.hubs.map((h) => (h.id === id ? prevHub : h)) }));
      }
      showApiErrorToast('Could not update location', 'Changes were reverted.', error);
    });
  },
  deleteHub: (id) => {
    const removedHub = useHubStore.getState().hubs.find((h) => h.id === id);
    set((s) => ({ hubs: s.hubs.filter((h) => h.id !== id) }));
    void deleteResource('hubs', id).catch((error) => {
      if (removedHub) {
        set((s) => ({ hubs: [...s.hubs, removedHub] }));
      }
      showApiErrorToast('Could not delete location', 'The item was restored.', error);
    });
  },
  updateInventory: (hubId, product, delta) => {
    const previousInventory = useHubStore.getState().hubs.find((h) => h.id === hubId)?.inventory;
    const nextInventory = (inventory: Record<string, number>) => ({
      ...inventory,
      [product]: (inventory[product] || 0) + delta,
    });

    set((s) => ({
      hubs: s.hubs.map((h) =>
        h.id === hubId
          ? { ...h, inventory: nextInventory(h.inventory) }
          : h
      ),
    }));

    const hub = useHubStore.getState().hubs.find((h) => h.id === hubId);
    if (hub) {
      void patchResource<Hub>('hubs', hubId, { inventory: hub.inventory }).catch((error) => {
        if (previousInventory) {
          set((s) => ({
            hubs: s.hubs.map((h) => (h.id === hubId ? { ...h, inventory: previousInventory } : h)),
          }));
        }
        showApiErrorToast('Could not update inventory', 'Inventory change was reverted.', error);
      });
    }
  },
}));
