import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useGPSStore, useDriverStore, useVehicleStore, useHubStore, useOrderStore, useAllocationStore } from '../../store';
import { Icons } from '../ui/Icons';
import { cn, getRelativeTime, STATUS_LABELS, STATUS_COLORS, getToday } from '../../utils/helpers';
import type { OrderStatus } from '../../types';

// Custom marker icons
function createIcon(className: string, label: string) {
  return L.divIcon({
    className: '',
    html: `<div class="${className}">${label}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function MapRefresh({ onRefresh }: { onRefresh: () => void }) {
  const map = useMap();
  useEffect(() => {
    // Invalidate map size on mount to fix rendering issues
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

export default function FleetMapPage() {
  const gpsUpdates = useGPSStore((s) => s.updates);
  const simulateMovement = useGPSStore((s) => s.simulateMovement);
  const drivers = useDriverStore((s) => s.drivers);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const hubs = useHubStore((s) => s.hubs);
  const orders = useOrderStore((s) => s.orders);
  const allocations = useAllocationStore((s) => s.allocations);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [filterDriver, setFilterDriver] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | OrderStatus>('all');
  const [showHubs, setShowHubs] = useState(true);

  const today = getToday();
  const todayAllocations = allocations.filter((a) => a.date === today && a.shiftStarted && !a.shiftEnded);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      simulateMovement();
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, simulateMovement]);

  const handleManualRefresh = useCallback(() => {
    simulateMovement();
    setLastRefresh(new Date());
  }, [simulateMovement]);

  const filteredUpdates = useMemo(() => {
    return gpsUpdates.filter((u) => {
      if (filterDriver && u.driverId !== filterDriver) return false;
      if (filterVehicle && u.vehicleId !== filterVehicle) return false;
      if (filterStatus !== 'all') {
        const driverOrders = orders.filter((o) => o.assignedDriverId === u.driverId);
        const hasStatus = driverOrders.some((o) => o.status === filterStatus);
        if (!hasStatus) return false;
      }
      return true;
    });
  }, [gpsUpdates, filterDriver, filterVehicle, filterStatus, orders]);

  const center: [number, number] = [37.7749, -122.4194];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Controls */}
      <div className="p-4 bg-white border-b border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-display font-bold text-surface-900">Fleet Map</h1>
          <span className="badge bg-brand-50 text-brand-700">
            {filteredUpdates.length} vehicles tracked
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterDriver} onChange={(e) => setFilterDriver(e.target.value)} className="select-field py-1.5 text-xs w-auto">
            <option value="">All Drivers</option>
            {drivers.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
          </select>
          <select value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)} className="select-field py-1.5 text-xs w-auto">
            <option value="">All Vehicles</option>
            {vehicles.map((v) => (<option key={v.id} value={v.id}>{v.registration}</option>))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)} className="select-field py-1.5 text-xs w-auto">
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="in-transit">In Transit</option>
          </select>
          <label className="flex items-center gap-2 text-xs text-surface-600 cursor-pointer">
            <input type="checkbox" checked={showHubs} onChange={(e) => setShowHubs(e.target.checked)} className="rounded border-surface-300" />
            Show Hubs
          </label>
          <div className="flex items-center gap-2 ml-2">
            <label className="flex items-center gap-2 text-xs text-surface-600 cursor-pointer">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded border-surface-300" />
              Auto (30s)
            </label>
            <button onClick={handleManualRefresh} className="btn-secondary btn-sm" title="Refresh now">
              <Icons.RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={center} zoom={13} className="h-full w-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <MapRefresh onRefresh={handleManualRefresh} />

          {/* Vehicle markers */}
          {filteredUpdates.map((update) => {
            const driver = drivers.find((d) => d.id === update.driverId);
            const vehicle = vehicles.find((v) => v.id === update.vehicleId);
            const alloc = todayAllocations.find((a) => a.driverId === update.driverId);
            const driverOrders = orders.filter((o) => o.assignedDriverId === update.driverId && o.deliveryDate === today);
            const isMoving = update.speed > 0;

            const icon = createIcon(
              `vehicle-marker ${isMoving ? 'in-transit' : 'idle'}`,
              vehicle?.registration?.slice(-3) || '?'
            );

            return (
              <Marker
                key={update.driverId}
                position={[update.coordinates.lat, update.coordinates.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="p-3 min-w-[220px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs">
                        {driver?.name?.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-surface-900">{driver?.name}</p>
                        <p className="text-xs text-surface-500">{vehicle?.registration} · {vehicle?.type}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-surface-500">Speed</span>
                        <span className="font-medium">{update.speed} km/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-surface-500">Heading</span>
                        <span className="font-medium">{update.heading}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-surface-500">Last Update</span>
                        <span className="font-medium">{getRelativeTime(update.timestamp)}</span>
                      </div>
                      {driverOrders.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-surface-100">
                          <p className="font-medium text-surface-700 mb-1">Deliveries ({driverOrders.length})</p>
                          {driverOrders.map((o) => {
                            const dest = hubs.find((h) => h.id === o.destinationId);
                            const sc = STATUS_COLORS[o.status];
                            return (
                              <div key={o.id} className="flex items-center gap-1.5 mt-1">
                                <span className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />
                                <span className="truncate">{dest?.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Hub/Terminal markers */}
          {showHubs && hubs.map((hub) => {
            const icon = createIcon(
              hub.type === 'hub' ? 'hub-marker' : 'terminal-marker',
              hub.type === 'hub' ? 'H' : 'T'
            );
            return (
              <Marker
                key={hub.id}
                position={[hub.coordinates.lat, hub.coordinates.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="p-3 min-w-[180px]">
                    <p className="font-semibold text-sm">{hub.name}</p>
                    <p className="text-xs text-surface-500 mb-2">{hub.type} · {hub.address}</p>
                    <div className="space-y-1 text-xs">
                      {Object.entries(hub.inventory).map(([product, qty]) => (
                        <div key={product} className="flex justify-between">
                          <span className="capitalize text-surface-500">{product}</span>
                          <span className="font-medium">{(qty as number).toLocaleString()}L</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur rounded-xl shadow-card p-3 text-xs">
          <p className="font-semibold text-surface-700 mb-2">Legend</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f79009] border-2 border-white shadow" /> In Transit</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#667085] border-2 border-white shadow" /> Idle</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-lg bg-[#17b26a] border-2 border-white shadow" /> Hub</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-lg bg-[#8b5cf6] border-2 border-white shadow" /> Terminal</div>
          </div>
          <p className="mt-2 pt-2 border-t border-surface-200 text-surface-400">
            Updated {getRelativeTime(lastRefresh.toISOString())}
          </p>
        </div>
      </div>
    </div>
  );
}
