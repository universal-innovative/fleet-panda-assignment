import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { DashboardSkeleton, Skeleton, TableSkeleton } from '../components/common/Skeleton';
import { Icons } from '../components/ui/Icons';
import { getApiErrorMessage, showApiErrorToast } from '../store/apiErrors';
import { useToastStore } from '../store/toastStore';
import { hydrateStoresFromApi } from '../store/bootstrap';
import {
  useAllocationStore,
  useDriverStore,
  useGPSStore,
  useHubStore,
  useOrderStore,
  useProductStore,
  useShiftHistoryStore,
  useVehicleStore,
} from '../store';

describe('runtime coverage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all icon components', () => {
    const iconEntries = Object.entries(Icons);
    const Test = () => (
      <div>
        {iconEntries.map(([name, Icon]) => (
          <span data-testid={`icon-${name}`} key={name}>
            <Icon size={14} className="x" />
          </span>
        ))}
      </div>
    );
    render(<Test />);
    expect(screen.getByTestId('icon-Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('icon-Speed')).toBeInTheDocument();
  });

  it('covers skeleton components', () => {
    const { container } = render(
      <div>
        <Skeleton className="h-3 w-3" />
        <TableSkeleton rows={2} cols={2} />
        <DashboardSkeleton />
      </div>,
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('handles error boundary default fallback and reset', () => {
    function Crasher() {
      throw new Error('boom');
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <ErrorBoundary>
        <Crasher />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
    screen.getByText('Try Again').click();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('renders error boundary custom fallback', () => {
    function Crasher() {
      throw new Error('x');
    }
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <ErrorBoundary fallback={<div>custom fallback</div>}>
        <Crasher />
      </ErrorBoundary>,
    );
    expect(screen.getByText('custom fallback')).toBeInTheDocument();
  });

  it('covers apiErrors helpers', () => {
    expect(getApiErrorMessage(new Error('msg'), 'fallback')).toBe('msg');
    expect(getApiErrorMessage('bad', 'fallback')).toBe('fallback');
    showApiErrorToast('Oops', 'fallback', new Error('boom'));
    const toast = useToastStore.getState().toasts[0];
    expect(toast.title).toBe('Oops');
    expect(toast.message).toBe('boom');
  });

  it('hydrates stores from API including gps and shift history', async () => {
    const payloads: Record<string, unknown[]> = {
      hubs: [{ id: 'h1', name: 'Hub', type: 'hub', address: 'a', coordinates: { lat: 1, lng: 2 }, inventory: {} }],
      drivers: [{ id: 'd1', name: 'Driver', license: 'DL-1', phone: '555' }],
      vehicles: [{ id: 'v1', registration: 'TRK-1', capacity: 1, type: 'Tanker' }],
      orders: [{ id: 'o1', destinationId: 'h1', product: 'diesel', quantity: 1, deliveryDate: '2026-02-26', assignedDriverId: null, status: 'pending', createdAt: new Date().toISOString() }],
      allocations: [{ id: 'a1', vehicleId: 'v1', driverId: 'd1', date: '2026-02-26', shiftStarted: false, shiftEnded: false }],
      products: [{ id: 'p1', code: 'diesel', name: 'Diesel' }],
      gpsUpdates: [{ driverId: 'd1', vehicleId: 'v1', coordinates: { lat: 1, lng: 2 }, timestamp: new Date().toISOString(), speed: 0, heading: 0 }],
      shiftHistory: [{ id: 's1', driverId: 'd1', vehicleId: 'v1', date: '2026-02-25', startTime: new Date().toISOString(), endTime: new Date().toISOString(), deliveries: [] }],
    };

    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      const key = Object.keys(payloads).find((k) => url.endsWith(`/${k}`));
      const body = key ? payloads[key] : [];
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    });

    await hydrateStoresFromApi();
    expect(useHubStore.getState().hubs.length).toBe(1);
    expect(useDriverStore.getState().drivers.length).toBe(1);
    expect(useVehicleStore.getState().vehicles.length).toBe(1);
    expect(useOrderStore.getState().orders.length).toBe(1);
    expect(useAllocationStore.getState().allocations.length).toBe(1);
    expect(useProductStore.getState().products.length).toBe(1);
    expect(useGPSStore.getState().updates.length).toBe(1);
    expect(useShiftHistoryStore.getState().history.length).toBe(1);
  });
});

describe('main entry', () => {
  it('calls ReactDOM createRoot render', async () => {
    const renderMock = vi.fn();
    const createRootMock = vi.fn(() => ({ render: renderMock }));

    vi.doMock('react-dom/client', () => ({
      default: { createRoot: createRootMock },
    }));

    const el = document.createElement('div');
    el.id = 'root';
    document.body.appendChild(el);

    await import('../main');

    expect(createRootMock).toHaveBeenCalled();
    expect(renderMock).toHaveBeenCalled();
  });
});
