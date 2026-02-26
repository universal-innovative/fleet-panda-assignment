import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icons } from '../ui/Icons';
import { cn } from '../../utils/helpers';
import { useAllocationStore, useDriverStore, useGPSStore, useHubStore, useOrderStore, useProductStore, useToastStore, useVehicleStore } from '../../store';

const navItems = [
  { to: '/admin', icon: Icons.Dashboard, label: 'Dashboard', end: true },
  { to: '/admin/fleet-map', icon: Icons.Map, label: 'Fleet Map' },
  { to: '/admin/orders', icon: Icons.Package, label: 'Orders' },
  { to: '/admin/allocations', icon: Icons.Calendar, label: 'Allocations' },
  { to: '/admin/inventory', icon: Icons.Fuel, label: 'Inventory' },
  { to: '/admin/hubs', icon: Icons.Warehouse, label: 'Hubs & Terminals' },
  { to: '/admin/drivers', icon: Icons.Users, label: 'Drivers' },
  { to: '/admin/products', icon: Icons.Fuel, label: 'Products' },
  { to: '/admin/vehicles', icon: Icons.Truck, label: 'Vehicles' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);

  const loadHubs = useHubStore((s) => s.loadHubs);
  const loadDrivers = useDriverStore((s) => s.loadDrivers);
  const loadProducts = useProductStore((s) => s.loadProducts);
  const loadVehicles = useVehicleStore((s) => s.loadVehicles);
  const loadOrders = useOrderStore((s) => s.loadOrders);
  const loadAllocations = useAllocationStore((s) => s.loadAllocations);
  const loadGpsUpdates = useGPSStore((s) => s.loadUpdates);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/admin/hubs')) void loadHubs();
    if (path.startsWith('/admin/products')) void loadProducts();
    if (path.startsWith('/admin/drivers')) void loadDrivers();
    if (path.startsWith('/admin/vehicles')) void loadVehicles();
    if (path.startsWith('/admin/orders')) {
      void Promise.all([loadOrders(), loadHubs(), loadDrivers(), loadProducts()]);
    }
    if (path.startsWith('/admin/allocations')) {
      void Promise.all([loadAllocations(), loadVehicles(), loadDrivers()]);
    }
    if (path.startsWith('/admin/fleet-map')) {
      void Promise.all([loadDrivers(), loadVehicles(), loadHubs(), loadOrders(), loadAllocations(), loadGpsUpdates()]);
    }
    if (path.startsWith('/admin/inventory')) {
      void Promise.all([loadHubs(), loadProducts()]);
    }
    if (path === '/admin') {
      void Promise.all([loadHubs(), loadDrivers(), loadVehicles(), loadOrders(), loadAllocations(), loadGpsUpdates()]);
    }
  }, [location.pathname, loadAllocations, loadDrivers, loadGpsUpdates, loadHubs, loadOrders, loadProducts, loadVehicles]);

  const searchablePages = useMemo(() => ([
    ...navItems,
    { to: '/admin/hubs', label: 'terminals', icon: Icons.Warehouse },
    { to: '/admin/fleet-map', label: 'map', icon: Icons.Map },
  ]), []);

  function handleGlobalSearch() {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    const match = searchablePages.find((item) => item.label.toLowerCase().includes(q));
    if (match) {
      navigate(match.to);
      return;
    }
    addToast({ type: 'info', title: 'No page match', message: `No admin page found for "${searchQuery}"` });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-surface-950/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface-950 flex flex-col transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Icons.Navigation size={16} className="text-white" />
          </div>
          <div>
            <span className="text-white font-display font-bold text-lg tracking-tight">FleetPulse</span>
            <span className="block text-[10px] text-surface-400 font-mono uppercase tracking-widest -mt-0.5">Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                      : 'text-surface-400 hover:text-white hover:bg-white/5'
                  )
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Driver Portal link */}
        <div className="p-3 border-t border-white/10">
          <NavLink
            to="/driver"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Icons.Truck size={18} />
            Driver Portal →
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100"
          >
            <Icons.Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-50 border border-surface-200">
              <Icons.Search size={16} className="text-surface-400" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGlobalSearch();
                }}
                className="bg-transparent text-sm outline-none w-48 placeholder:text-surface-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-50 text-success-700 text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse-soft" />
              System Online
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
