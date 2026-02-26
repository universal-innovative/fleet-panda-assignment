import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import App from '../App';
import HubsPage from '../components/admin/HubsPage';
import AdminDashboard from '../components/admin/AdminDashboard';
import DriversPage from '../components/admin/DriversPage';
import ProductsPage from '../components/admin/ProductsPage';
import VehiclesPage from '../components/admin/VehiclesPage';
import OrdersPage from '../components/admin/OrdersPage';
import AllocationsPage from '../components/admin/AllocationsPage';
import InventoryPage from '../components/admin/InventoryPage';
import FleetMapPage from '../components/admin/FleetMapPage';
import DriverShiftView from '../components/driver/DriverShiftView';
import DriverDeliveries from '../components/driver/DriverDeliveries';
import DriverLiveMap from '../components/driver/DriverLiveMap';
import DriverHistory from '../components/driver/DriverHistory';
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
import {
  initialAllocations,
  initialDrivers,
  initialGPSUpdates,
  initialHubs,
  initialOrders,
  initialProducts,
  initialShiftHistory,
  initialVehicles,
} from '../data/mockData';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tile" />,
  Marker: ({ children }: { children: React.ReactNode }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Polyline: () => <div data-testid="polyline" />,
  useMap: () => ({ invalidateSize: vi.fn(), fitBounds: vi.fn() }),
}));

vi.mock('leaflet', () => {
  const divIcon = vi.fn(() => ({}));
  const latLngBounds = vi.fn(() => ({}));
  return {
    default: { divIcon, latLngBounds },
    divIcon,
    latLngBounds,
  };
});

function seedStores() {
  useHubStore.setState({ hubs: JSON.parse(JSON.stringify(initialHubs)) });
  useDriverStore.setState({ drivers: JSON.parse(JSON.stringify(initialDrivers)) });
  useProductStore.setState({ products: JSON.parse(JSON.stringify(initialProducts)) });
  useVehicleStore.setState({ vehicles: JSON.parse(JSON.stringify(initialVehicles)) });
  useOrderStore.setState({ orders: JSON.parse(JSON.stringify(initialOrders)) });
  useAllocationStore.setState({ allocations: JSON.parse(JSON.stringify(initialAllocations)) });
  useGPSStore.setState({ updates: JSON.parse(JSON.stringify(initialGPSUpdates)) });
  useShiftHistoryStore.setState({ history: JSON.parse(JSON.stringify(initialShiftHistory)) });
  useActiveDriverStore.setState({ activeDriverId: 'driver-1' });
}

describe('page coverage smoke tests', () => {
  beforeEach(() => {
    seedStores();
  });

  it('renders core admin pages', () => {
    render(
      <MemoryRouter>
        <HubsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Hubs & Terminals')).toBeInTheDocument();
  });

  it('renders remaining admin pages', () => {
    const pages = [AdminDashboard, DriversPage, ProductsPage, VehiclesPage, OrdersPage, AllocationsPage, InventoryPage, FleetMapPage];
    const labels = ['Dashboard', 'Drivers', 'Products', 'Vehicles', 'Orders', 'Vehicle Allocations', 'Inventory Dashboard', 'Fleet Map'];
    pages.forEach((Page, index) => {
      render(
        <MemoryRouter>
          <Page />
        </MemoryRouter>,
      );
      expect(screen.getAllByText(labels[index])[0]).toBeInTheDocument();
    });
  });

  it('renders driver pages', () => {
    render(
      <MemoryRouter>
        <DriverShiftView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Today's Deliveries")).toBeInTheDocument();

    render(
      <MemoryRouter>
        <DriverDeliveries />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Pending Deliveries|No Deliveries/)).toBeInTheDocument();

    render(
      <MemoryRouter>
        <DriverLiveMap />
      </MemoryRouter>,
    );
    expect(screen.getByText('Live Location')).toBeInTheDocument();

    render(
      <MemoryRouter>
        <DriverHistory />
      </MemoryRouter>,
    );
    expect(screen.getByText('Shift History')).toBeInTheDocument();
  });

  it('renders App routes', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/hubs']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Hubs & Terminals' })).toBeInTheDocument();
  });

  it('renders nested route wrappers', () => {
    render(
      <MemoryRouter initialEntries={['/driver/history']}>
        <Routes>
          <Route path="/driver/history" element={<DriverHistory />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Shift History')).toBeInTheDocument();
  });
});
