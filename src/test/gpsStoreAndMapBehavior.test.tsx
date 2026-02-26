import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import FleetMapPage from '../components/admin/FleetMapPage';
import { useAllocationStore, useDriverStore, useGPSStore, useHubStore, useOrderStore, useToastStore, useVehicleStore } from '../store';
import { getToday } from '../utils/helpers';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TileLayer: () => <div />,
  Marker: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useMap: () => ({ invalidateSize: vi.fn() }),
}));

vi.mock('leaflet', () => {
  const divIcon = vi.fn(() => ({}));
  return {
    default: { divIcon },
    divIcon,
  };
});

describe('gps store + fleet map behavior', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    useDriverStore.setState({ drivers: [{ id: 'd1', name: 'D1', license: 'DL-1', phone: '1' }, { id: 'd2', name: 'D2', license: 'DL-2', phone: '2' }] });
    useVehicleStore.setState({ vehicles: [{ id: 'v1', registration: 'TRK-1', capacity: 1, type: 'Tanker' }, { id: 'v2', registration: 'TRK-2', capacity: 1, type: 'Truck' }] });
    useHubStore.setState({ hubs: [{ id: 't1', name: 'T1', type: 'terminal', address: 'A', coordinates: { lat: 1, lng: 1 }, inventory: {} }] });
    useOrderStore.setState({
      orders: [
        { id: 'o1', destinationId: 't1', product: 'diesel', quantity: 1, deliveryDate: getToday(), assignedDriverId: 'd1', status: 'assigned', createdAt: new Date().toISOString() },
        { id: 'o2', destinationId: 't1', product: 'diesel', quantity: 1, deliveryDate: getToday(), assignedDriverId: 'd2', status: 'failed', createdAt: new Date().toISOString() },
      ],
    });
    useAllocationStore.setState({
      allocations: [
        { id: 'a1', vehicleId: 'v1', driverId: 'd1', date: getToday(), shiftStarted: true, shiftEnded: false },
        { id: 'a2', vehicleId: 'v2', driverId: 'd2', date: getToday(), shiftStarted: true, shiftEnded: true },
      ],
    });
    useGPSStore.setState({
      updates: [
        { driverId: 'd1', vehicleId: 'v1', coordinates: { lat: 1, lng: 1 }, timestamp: new Date().toISOString(), speed: 10, heading: 10 },
        { driverId: 'd2', vehicleId: 'v2', coordinates: { lat: 1, lng: 1 }, timestamp: new Date().toISOString(), speed: 0, heading: 10 },
      ],
      isLoaded: true,
      isLoading: false,
    });
  });

  it('loadUpdates success + failure paths', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([{ driverId: 'd1', vehicleId: 'v1', coordinates: { lat: 1, lng: 1 }, timestamp: new Date().toISOString(), speed: 0, heading: 0 }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    useGPSStore.setState({ updates: [], isLoaded: false, isLoading: false });
    await useGPSStore.getState().loadUpdates();
    expect(useGPSStore.getState().updates.length).toBe(1);

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('network'));
    useGPSStore.setState({ updates: [], isLoaded: false, isLoading: false });
    await useGPSStore.getState().loadUpdates();
    expect(useToastStore.getState().toasts.some((t) => t.type === 'error')).toBe(true);
  });

  it('shows only active vehicles on fleet map and includes new status options', () => {
    render(
      <MemoryRouter>
        <FleetMapPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('1 vehicles tracked')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});
