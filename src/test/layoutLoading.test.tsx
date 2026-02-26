import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, waitFor } from '@testing-library/react';
import AdminLayout from '../components/admin/AdminLayout';
import DriverLayout from '../components/driver/DriverLayout';
import {
  useActiveDriverStore,
  useAllocationStore,
  useDriverStore,
  useGPSStore,
  useHubStore,
  useOrderStore,
  useProductStore,
  useShiftHistoryStore,
  useVehicleStore,
} from '../store';

describe('route-aware loading', () => {
  beforeEach(() => {
    useDriverStore.setState({
      drivers: [{ id: 'd1', name: 'Driver 1', license: 'DL-1', phone: '1' }],
      loadDrivers: vi.fn(async () => undefined),
      isLoaded: false,
      isLoading: false,
    });
    useProductStore.setState({ products: [], loadProducts: vi.fn(async () => undefined), isLoaded: false, isLoading: false });
    useHubStore.setState({ hubs: [], loadHubs: vi.fn(async () => undefined), isLoaded: false, isLoading: false });
    useVehicleStore.setState({ vehicles: [], loadVehicles: vi.fn(async () => undefined), isLoaded: false, isLoading: false });
    useOrderStore.setState({ orders: [], loadOrders: vi.fn(async () => undefined), isLoaded: false, isLoading: false });
    useAllocationStore.setState({ allocations: [], loadAllocations: vi.fn(async () => undefined), isLoaded: false, isLoading: false });
    useGPSStore.setState({ updates: [], loadUpdates: vi.fn(async () => undefined), isLoaded: false, isLoading: false });
    useShiftHistoryStore.setState({ history: [], loadHistory: vi.fn(async () => undefined), isLoaded: false, isLoading: false });
    useActiveDriverStore.setState({ activeDriverId: 'd1' });
  });

  it('loads gps updates in admin fleet-map route', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/fleet-map']}>
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="fleet-map" element={<div>map</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(useGPSStore.getState().loadUpdates).toHaveBeenCalled();
    });
  });

  it('loads gps updates in driver map route', async () => {
    render(
      <MemoryRouter initialEntries={['/driver/map']}>
        <Routes>
          <Route path="/driver/*" element={<DriverLayout />}>
            <Route path="map" element={<div>map</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(useGPSStore.getState().loadUpdates).toHaveBeenCalled();
    });
  });

  it('loads history in driver history route', async () => {
    render(
      <MemoryRouter initialEntries={['/driver/history']}>
        <Routes>
          <Route path="/driver/*" element={<DriverLayout />}>
            <Route path="history" element={<div>history</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(useShiftHistoryStore.getState().loadHistory).toHaveBeenCalled();
    });
  });
});
