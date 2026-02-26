import React from 'react';
import { Link } from 'react-router-dom';
import { useHubStore, useDriverStore, useVehicleStore, useOrderStore, useAllocationStore, useGPSStore } from '../../store';
import { Icons } from '../ui/Icons';
import { cn, STATUS_COLORS, STATUS_LABELS, formatDate, getToday, getProductLabel } from '../../utils/helpers';
import type { OrderStatus } from '../../types';

export default function AdminDashboard() {
  const hubs = useHubStore((s) => s.hubs);
  const drivers = useDriverStore((s) => s.drivers);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const orders = useOrderStore((s) => s.orders);
  const allocations = useAllocationStore((s) => s.allocations);
  const gpsUpdates = useGPSStore((s) => s.updates);

  const today = getToday();
  const todayOrders = orders.filter((o) => o.deliveryDate === today);
  const todayAllocations = allocations.filter((a) => a.date === today);
  const activeShifts = todayAllocations.filter((a) => a.shiftStarted && !a.shiftEnded);

  const ordersByStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: 'Total Hubs', value: hubs.filter((h) => h.type === 'hub').length, icon: Icons.Warehouse, color: 'bg-brand-50 text-brand-600' },
    { label: 'Terminals', value: hubs.filter((h) => h.type === 'terminal').length, icon: Icons.MapPin, color: 'bg-purple-50 text-purple-600' },
    { label: 'Active Drivers', value: activeShifts.length, icon: Icons.Users, color: 'bg-success-50 text-success-600' },
    { label: 'GPS Tracked', value: gpsUpdates.length, icon: Icons.Navigation, color: 'bg-warning-50 text-warning-600' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900">Dashboard</h1>
        <p className="text-sm text-surface-500 mt-1">Fleet overview for {formatDate(new Date().toISOString())}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.color)}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-surface-900">{stat.value}</p>
            <p className="text-xs text-surface-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Orders */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-4 border-b border-surface-100">
            <h2 className="font-semibold text-surface-900">Today's Orders</h2>
            <Link to="/admin/orders" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-surface-100">
            {todayOrders.length === 0 ? (
              <p className="p-8 text-center text-sm text-surface-400">No orders for today</p>
            ) : (
              todayOrders.slice(0, 6).map((order) => {
                const dest = hubs.find((h) => h.id === order.destinationId);
                const driver = drivers.find((d) => d.id === order.assignedDriverId);
                const sc = STATUS_COLORS[order.status];
                return (
                  <div key={order.id} className="flex items-center justify-between p-4 hover:bg-surface-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn('badge', sc.bg, sc.text)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />
                        {STATUS_LABELS[order.status]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-900 truncate">
                          {dest?.name || order.destinationId}
                        </p>
                        <p className="text-xs text-surface-500">
                          {getProductLabel(order.product)} · {order.quantity.toLocaleString()}L
                          {driver && ` · ${driver.name}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-surface-400 font-mono shrink-0">{order.id}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="card">
          <div className="p-4 border-b border-surface-100">
            <h2 className="font-semibold text-surface-900">Order Summary</h2>
          </div>
          <div className="p-4 space-y-3">
            {(['pending', 'assigned', 'in-transit', 'delivered', 'failed'] as OrderStatus[]).map((status) => {
              const count = ordersByStatus[status] || 0;
              const total = orders.length || 1;
              const sc = STATUS_COLORS[status];
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full', sc.dot)} />
                      <span className="text-sm text-surface-700">{STATUS_LABELS[status]}</span>
                    </div>
                    <span className="text-sm font-semibold text-surface-900">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-100 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', sc.dot)}
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-surface-100">
            <p className="text-sm text-surface-500">
              Total: <span className="font-semibold text-surface-900">{orders.length} orders</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Active Allocations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card p-4">
          <h2 className="font-semibold text-surface-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/orders?new=1" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-surface-300 hover:border-brand-400 hover:bg-brand-50/50 transition-all group">
              <Icons.Plus size={24} className="text-surface-400 group-hover:text-brand-600" />
              <span className="text-sm font-medium text-surface-600 group-hover:text-brand-700">New Order</span>
            </Link>
            <Link to="/admin/allocations?new=1" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-surface-300 hover:border-brand-400 hover:bg-brand-50/50 transition-all group">
              <Icons.Calendar size={24} className="text-surface-400 group-hover:text-brand-600" />
              <span className="text-sm font-medium text-surface-600 group-hover:text-brand-700">Allocate Vehicle</span>
            </Link>
            <Link to="/admin/fleet-map" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-surface-300 hover:border-brand-400 hover:bg-brand-50/50 transition-all group">
              <Icons.Map size={24} className="text-surface-400 group-hover:text-brand-600" />
              <span className="text-sm font-medium text-surface-600 group-hover:text-brand-700">Fleet Map</span>
            </Link>
            <Link to="/admin/inventory" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-surface-300 hover:border-brand-400 hover:bg-brand-50/50 transition-all group">
              <Icons.Fuel size={24} className="text-surface-400 group-hover:text-brand-600" />
              <span className="text-sm font-medium text-surface-600 group-hover:text-brand-700">Inventory</span>
            </Link>
          </div>
        </div>

        {/* Active Shifts */}
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-surface-100">
            <h2 className="font-semibold text-surface-900">Today's Allocations</h2>
            <span className="badge bg-success-50 text-success-700">
              {activeShifts.length} active
            </span>
          </div>
          <div className="divide-y divide-surface-100">
            {todayAllocations.length === 0 ? (
              <p className="p-8 text-center text-sm text-surface-400">No allocations for today</p>
            ) : (
              todayAllocations.map((alloc) => {
                const driver = drivers.find((d) => d.id === alloc.driverId);
                const vehicle = vehicles.find((v) => v.id === alloc.vehicleId);
                return (
                  <div key={alloc.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-surface-900">{driver?.name}</p>
                      <p className="text-xs text-surface-500">{vehicle?.registration} · {vehicle?.type}</p>
                    </div>
                    <span className={cn('badge', alloc.shiftEnded ? 'bg-surface-100 text-surface-500' : alloc.shiftStarted ? 'bg-success-50 text-success-700' : 'bg-surface-100 text-surface-600')}>
                      {alloc.shiftEnded ? 'Ended' : alloc.shiftStarted ? 'Active' : 'Not Started'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

