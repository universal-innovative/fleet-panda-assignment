import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useActiveDriverStore, useGPSStore, useHubStore, useOrderStore, useDriverStore, useVehicleStore, useAllocationStore, useToastStore } from '../../store';
import { Icons } from '../ui/Icons';
import { cn, getToday, getRelativeTime, getProductLabel } from '../../utils/helpers';

function createIcon(className: string, label: string) {
  return L.divIcon({
    className: '',
    html: `<div class="${className}">${label}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
    setTimeout(() => map.invalidateSize(), 100);
  }, []);
  return null;
}

export default function DriverLiveMap() {
  const activeDriverId = useActiveDriverStore((s) => s.activeDriverId);
  const { updates, sendUpdate, getDriverLocation } = useGPSStore();
  const hubs = useHubStore((s) => s.hubs);
  const orders = useOrderStore((s) => s.orders);
  const drivers = useDriverStore((s) => s.drivers);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const allocations = useAllocationStore((s) => s.allocations);
  const addToast = useToastStore((s) => s.addToast);

  const today = getToday();
  const allocation = allocations.find((a) => a.driverId === activeDriverId && a.date === today);
  const vehicle = allocation ? vehicles.find((v) => v.id === allocation.vehicleId) : null;
  const driverLocation = activeDriverId ? getDriverLocation(activeDriverId) : undefined;
  const todayOrders = orders.filter((o) => o.assignedDriverId === activeDriverId && o.deliveryDate === today);

  const destinations = todayOrders
    .filter((o) => o.status !== 'delivered' && o.status !== 'failed')
    .map((o) => hubs.find((h) => h.id === o.destinationId))
    .filter(Boolean);

  const [sending, setSending] = useState(false);

  function handleSendGPS() {
    if (!activeDriverId || !allocation) return;
    setSending(true);

    // Simulate location change
    const current = driverLocation?.coordinates || { lat: 37.7749, lng: -122.4194 };
    const newLat = current.lat + (Math.random() - 0.5) * 0.005;
    const newLng = current.lng + (Math.random() - 0.5) * 0.005;

    setTimeout(() => {
      sendUpdate({
        driverId: activeDriverId,
        vehicleId: allocation.vehicleId,
        coordinates: { lat: newLat, lng: newLng },
        timestamp: new Date().toISOString(),
        speed: Math.floor(Math.random() * 40) + 10,
        heading: Math.floor(Math.random() * 360),
      });
      setSending(false);
      addToast({ type: 'success', title: 'GPS Updated', message: `Location: ${newLat.toFixed(4)}, ${newLng.toFixed(4)}` });
    }, 800);
  }

  const center: [number, number] = driverLocation
    ? [driverLocation.coordinates.lat, driverLocation.coordinates.lng]
    : [37.7749, -122.4194];

  const allPositions: [number, number][] = [
    center,
    ...destinations.map((d) => [d!.coordinates.lat, d!.coordinates.lng] as [number, number]),
  ];

  // Route line from driver to destinations
  const routeLine = destinations.length > 0
    ? [center, ...destinations.map((d) => [d!.coordinates.lat, d!.coordinates.lng] as [number, number])]
    : [];

  const driverIcon = createIcon('vehicle-marker in-transit', vehicle?.registration?.slice(-3) || '📍');

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Info bar */}
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-surface-900">Live Location</h2>
          {driverLocation && (
            <p className="text-xs text-surface-500 mt-0.5">
              Speed: {driverLocation.speed} km/h · Heading: {driverLocation.heading}° · Updated {getRelativeTime(driverLocation.timestamp)}
            </p>
          )}
        </div>
        <button
          onClick={handleSendGPS}
          disabled={!allocation?.shiftStarted || allocation?.shiftEnded || sending}
          className="btn-primary"
        >
          {sending ? (
            <><Icons.RefreshCw size={16} className="animate-spin" /> Sending...</>
          ) : (
            <><Icons.Navigation size={16} /> Send GPS Update</>
          )}
        </button>
      </div>

      {/* Map */}
      <div className="card overflow-hidden" style={{ height: 400 }}>
        <MapContainer center={center} zoom={13} className="h-full w-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <FitBounds positions={allPositions} />

          {/* Driver location */}
          {driverLocation && (
            <Marker position={[driverLocation.coordinates.lat, driverLocation.coordinates.lng]} icon={driverIcon}>
              <Popup>
                <div className="p-2 text-sm">
                  <p className="font-semibold">Your Location</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {driverLocation.coordinates.lat.toFixed(4)}, {driverLocation.coordinates.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Destination markers */}
          {destinations.map((dest) => {
            const icon = createIcon('terminal-marker', 'D');
            return (
              <Marker
                key={dest!.id}
                position={[dest!.coordinates.lat, dest!.coordinates.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="p-2 text-sm">
                    <p className="font-semibold">{dest!.name}</p>
                    <p className="text-xs text-gray-500">{dest!.address}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Route line */}
          {routeLine.length > 1 && (
            <Polyline
              positions={routeLine}
              pathOptions={{ color: '#3388ff', weight: 3, dashArray: '10, 10', opacity: 0.6 }}
            />
          )}
        </MapContainer>
      </div>

      {/* Destination list */}
      {destinations.length > 0 && (
        <div className="card">
          <div className="p-4 border-b border-surface-100">
            <h3 className="font-semibold text-surface-900 text-sm">Remaining Destinations</h3>
          </div>
          <div className="divide-y divide-surface-100">
            {destinations.map((dest, i) => {
              const order = todayOrders.find((o) => o.destinationId === dest!.id);
              return (
                <div key={dest!.id} className="p-4 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-surface-900">{dest!.name}</p>
                    <p className="text-xs text-surface-500">{order ? `${getProductLabel(order.product)} · ${order.quantity.toLocaleString()}L` : ''}</p>
                  </div>
                  <Icons.ChevronRight size={16} className="text-surface-400" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

