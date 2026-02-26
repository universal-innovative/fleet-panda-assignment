import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useActiveDriverStore, useAllocationStore, useDriverStore, useHubStore, useOrderStore, useVehicleStore } from '../../store';
import { Icons } from '../ui/Icons';
import { cn } from '../../utils/helpers';

const navItems = [
  { to: '/driver', icon: Icons.Play, label: 'My Shift', end: true },
  { to: '/driver/map', icon: Icons.Map, label: 'Live Map' },
  { to: '/driver/deliveries', icon: Icons.Package, label: 'Deliveries' },
  { to: '/driver/history', icon: Icons.History, label: 'History' },
];

export default function DriverLayout() {
  const location = useLocation();
  const { activeDriverId, setActiveDriver } = useActiveDriverStore();
  const loadDrivers = useDriverStore((s) => s.loadDrivers);
  const loadOrders = useOrderStore((s) => s.loadOrders);
  const loadAllocations = useAllocationStore((s) => s.loadAllocations);
  const loadHubs = useHubStore((s) => s.loadHubs);
  const loadVehicles = useVehicleStore((s) => s.loadVehicles);
  const drivers = useDriverStore((s) => s.drivers);
  const activeDriver = drivers.find((d) => d.id === activeDriverId);

  useEffect(() => {
    void loadDrivers();
    if (location.pathname.startsWith('/driver/map')) {
      void Promise.all([loadAllocations(), loadOrders(), loadHubs(), loadVehicles()]);
    } else if (location.pathname.startsWith('/driver/deliveries')) {
      void Promise.all([loadAllocations(), loadOrders(), loadHubs()]);
    } else if (location.pathname.startsWith('/driver/history')) {
      void Promise.all([loadVehicles(), loadHubs()]);
    } else {
      void Promise.all([loadAllocations(), loadOrders(), loadVehicles(), loadHubs()]);
    }
  }, [loadAllocations, loadDrivers, loadHubs, loadOrders, loadVehicles, location.pathname]);

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Top Header */}
      <header className="bg-surface-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Icons.Truck size={16} />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight">FleetPulse</span>
              <span className="block text-[10px] text-surface-400 font-mono uppercase tracking-widest -mt-0.5">Driver</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={activeDriverId || ''}
              onChange={(e) => setActiveDriver(e.target.value || null)}
              className="bg-white/10 text-white text-xs rounded-lg px-3 py-1.5 border border-white/20 outline-none"
            >
              <option value="" className="text-surface-900">Select driver...</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id} className="text-surface-900">{d.name}</option>
              ))}
            </select>
            <NavLink to="/admin" className="text-xs text-surface-400 hover:text-white transition-colors">
              Admin →
            </NavLink>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-surface-50 text-surface-900'
                      : 'text-surface-400 hover:text-white hover:bg-white/5'
                  )
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {!activeDriverId ? (
          <div className="card p-12 text-center">
            <Icons.Users size={48} className="text-surface-300 mx-auto mb-4" />
            <h2 className="text-lg font-display font-semibold text-surface-700 mb-2">Select a Driver</h2>
            <p className="text-sm text-surface-500">Choose a driver from the dropdown above to view their shift details</p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
