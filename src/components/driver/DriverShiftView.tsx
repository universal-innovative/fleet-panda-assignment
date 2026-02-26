import React from 'react';
import { useActiveDriverStore, useAllocationStore, useDriverStore, useVehicleStore, useOrderStore, useHubStore, useToastStore } from '../../store';
import { Icons } from '../ui/Icons';
import { cn, getToday, STATUS_COLORS, STATUS_LABELS, getProductLabel, formatTime } from '../../utils/helpers';

export default function DriverShiftView() {
  const activeDriverId = useActiveDriverStore((s) => s.activeDriverId);
  const drivers = useDriverStore((s) => s.drivers);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const hubs = useHubStore((s) => s.hubs);
  const { allocations, startShift, endShift } = useAllocationStore();
  const orders = useOrderStore((s) => s.orders);
  const addToast = useToastStore((s) => s.addToast);

  const today = getToday();
  const driver = drivers.find((d) => d.id === activeDriverId);
  const allocation = allocations.find((a) => a.driverId === activeDriverId && a.date === today);
  const vehicle = allocation ? vehicles.find((v) => v.id === allocation.vehicleId) : null;
  const todayOrders = orders.filter((o) => o.assignedDriverId === activeDriverId && o.deliveryDate === today);

  function handleStartShift() {
    if (!allocation) return;
    startShift(allocation.id);
    addToast({ type: 'success', title: 'Shift Started', message: 'Drive safe! Your deliveries are listed below.' });
  }

  function handleEndShift() {
    if (!allocation) return;
    const pendingDeliveries = todayOrders.filter((o) => o.status !== 'delivered' && o.status !== 'failed');
    if (pendingDeliveries.length > 0) {
      if (!confirm(`You have ${pendingDeliveries.length} pending deliveries. End shift anyway?`)) return;
    }
    endShift(allocation.id);
    addToast({ type: 'info', title: 'Shift Ended', message: 'Thanks for today\'s work!' });
  }

  if (!allocation) {
    return (
      <div className="card p-12 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
          <Icons.Calendar size={32} className="text-surface-400" />
        </div>
        <h2 className="text-lg font-display font-semibold text-surface-700 mb-2">No Allocation Today</h2>
        <p className="text-sm text-surface-500 max-w-sm mx-auto">
          {driver?.name} has no vehicle allocated for today. Contact admin to get a vehicle assigned.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Shift Card */}
      <div className={cn('card overflow-hidden', allocation.shiftStarted && !allocation.shiftEnded ? 'ring-2 ring-success-500/30' : '')}>
        <div className={cn('px-4 py-3', allocation.shiftEnded ? 'bg-surface-100' : allocation.shiftStarted ? 'bg-success-50' : 'bg-brand-50')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('w-2.5 h-2.5 rounded-full', allocation.shiftEnded ? 'bg-surface-400' : allocation.shiftStarted ? 'bg-success-500 animate-pulse-soft' : 'bg-brand-500')}>
              </div>
              <span className={cn('text-sm font-semibold', allocation.shiftEnded ? 'text-surface-600' : allocation.shiftStarted ? 'text-success-700' : 'text-brand-700')}>
                {allocation.shiftEnded ? 'Shift Ended' : allocation.shiftStarted ? 'Shift Active' : 'Ready to Start'}
              </span>
            </div>
            {allocation.startTime && (
              <span className="text-xs text-surface-500">
                Started {formatTime(allocation.startTime)}
                {allocation.endTime && ` — Ended ${formatTime(allocation.endTime)}`}
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-surface-500 mb-1">Driver</p>
              <p className="text-sm font-semibold text-surface-900">{driver?.name}</p>
              <p className="text-xs text-surface-500">{driver?.license}</p>
            </div>
            <div>
              <p className="text-xs text-surface-500 mb-1">Vehicle</p>
              <p className="text-sm font-semibold text-surface-900">{vehicle?.registration}</p>
              <p className="text-xs text-surface-500">{vehicle?.type} · {vehicle?.capacity.toLocaleString()}L</p>
            </div>
          </div>

          <div className="flex gap-3">
            {!allocation.shiftStarted && (
              <button onClick={handleStartShift} className="btn-success flex-1 btn-lg">
                <Icons.Play size={18} /> Start Shift
              </button>
            )}
            {allocation.shiftStarted && !allocation.shiftEnded && (
              <button onClick={handleEndShift} className="btn-danger flex-1">
                <Icons.Square size={16} /> End Shift
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Today's Deliveries */}
      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-surface-100">
          <h2 className="font-semibold text-surface-900">Today's Deliveries</h2>
          <span className="badge bg-surface-100 text-surface-600">{todayOrders.length} orders</span>
        </div>
        {todayOrders.length === 0 ? (
          <div className="p-8 text-center text-sm text-surface-400">No deliveries assigned for today</div>
        ) : (
          <div className="divide-y divide-surface-100">
            {todayOrders.map((order) => {
              const dest = hubs.find((h) => h.id === order.destinationId);
              const sc = STATUS_COLORS[order.status];
              return (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center">
                      <Icons.MapPin size={18} className="text-surface-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">{dest?.name}</p>
                      <p className="text-xs text-surface-500">{getProductLabel(order.product)} · {order.quantity.toLocaleString()}L</p>
                    </div>
                  </div>
                  <span className={cn('badge', sc.bg, sc.text)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-xl font-display font-bold text-surface-900">{todayOrders.filter((o) => o.status === 'delivered').length}</p>
          <p className="text-xs text-success-600">Completed</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl font-display font-bold text-surface-900">{todayOrders.filter((o) => o.status !== 'delivered' && o.status !== 'failed').length}</p>
          <p className="text-xs text-brand-600">Pending</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl font-display font-bold text-surface-900">{todayOrders.filter((o) => o.status === 'failed').length}</p>
          <p className="text-xs text-danger-600">Failed</p>
        </div>
      </div>
    </div>
  );
}


