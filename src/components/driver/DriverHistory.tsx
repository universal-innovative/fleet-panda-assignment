import React from 'react';
import { useActiveDriverStore, useShiftHistoryStore, useVehicleStore, useHubStore, useDriverStore } from '../../store';
import { Icons } from '../ui/Icons';
import { EmptyState } from '../common/EmptyState';
import { cn, getProductLabel } from '../../utils/helpers';

export default function DriverHistory() {
  const activeDriverId = useActiveDriverStore((s) => s.activeDriverId);
  const shiftHistory = useShiftHistoryStore((s) => s.history);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const hubs = useHubStore((s) => s.hubs);
  const drivers = useDriverStore((s) => s.drivers);

  const driver = drivers.find((d) => d.id === activeDriverId);
  const driverShifts = shiftHistory
    .filter((s) => s.driverId === activeDriverId)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!activeDriverId) {
    return <EmptyState icon={<Icons.User size={24} />} title="No Driver Selected" message="Select a driver from the top menu to view history." />;
  }

  if (driverShifts.length === 0) {
    return <EmptyState icon={<Icons.Clock size={24} />} title="No History" message="No past shift records found for this driver." />;
  }

  // Summary stats
  const totalShifts = driverShifts.length;
  const totalDeliveries = driverShifts.reduce((sum, s) => sum + s.deliveries.length, 0);
  const successfulDeliveries = driverShifts.reduce(
    (sum, s) => sum + s.deliveries.filter((d) => d.status === 'delivered').length,
    0
  );
  const totalVolume = driverShifts.reduce(
    (sum, s) => sum + s.deliveries.filter((d) => d.status === 'delivered').reduce((v, d) => v + d.quantity, 0),
    0
  );
  const successRate = totalDeliveries > 0 ? Math.round((successfulDeliveries / totalDeliveries) * 100) : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Shifts', value: totalShifts, icon: <Icons.Calendar size={16} />, color: 'text-brand-600' },
          { label: 'Deliveries', value: totalDeliveries, icon: <Icons.Package size={16} />, color: 'text-surface-900' },
          { label: 'Success Rate', value: `${successRate}%`, icon: <Icons.CheckCircle size={16} />, color: 'text-emerald-600' },
          { label: 'Volume (L)', value: totalVolume.toLocaleString(), icon: <Icons.Fuel size={16} />, color: 'text-blue-600' },
        ].map((s) => (
          <div key={s.label} className="card p-3">
            <div className="flex items-center gap-1.5 text-surface-500 mb-1">
              {s.icon}
              <span className="text-xs">{s.label}</span>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Shift records */}
      <div className="card">
        <div className="p-4 border-b border-surface-100">
          <h3 className="font-semibold text-surface-900">Shift History</h3>
        </div>
        <div className="divide-y divide-surface-100">
          {driverShifts.map((shift) => {
            const vehicle = vehicles.find((v) => v.id === shift.vehicleId);
            const delivered = shift.deliveries.filter((d) => d.status === 'delivered').length;
            const failed = shift.deliveries.filter((d) => d.status === 'failed').length;
            const volume = shift.deliveries
              .filter((d) => d.status === 'delivered')
              .reduce((sum, d) => sum + d.quantity, 0);

            const dateObj = new Date(shift.date + 'T00:00:00');
            const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <div key={shift.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-surface-900">{dateStr}</p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {vehicle?.registration || 'Unknown Vehicle'} • {shift.startTime} – {shift.endTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-surface-900">{volume.toLocaleString()} L</p>
                    <p className="text-xs text-surface-500">{shift.deliveries.length} stops</p>
                  </div>
                </div>

                {/* Delivery badges */}
                <div className="flex items-center gap-3 mt-2">
                  {delivered > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Icons.CheckCircle size={12} /> {delivered} delivered
                    </span>
                  )}
                  {failed > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                      <Icons.XCircle size={12} /> {failed} failed
                    </span>
                  )}
                </div>

                {/* Delivery details */}
                {shift.deliveries.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {shift.deliveries.map((del, i) => {
                      const dest = hubs.find((h) => h.id === del.destinationId);
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs text-surface-600 pl-2 border-l-2 border-surface-100">
                          <span className={del.status === 'delivered' ? 'text-emerald-500' : 'text-red-500'}>
                            {del.status === 'delivered' ? '✓' : '✗'}
                          </span>
                          <span className="font-medium">{dest?.name || 'Unknown'}</span>
                          <span className="text-surface-400">•</span>
                          <span>{getProductLabel(del.product)}</span>
                          <span className="text-surface-400">•</span>
                          <span>{del.quantity.toLocaleString()} L</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

