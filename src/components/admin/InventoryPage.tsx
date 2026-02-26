import React, { useState, useMemo } from 'react';
import { useHubStore, useProductStore } from '../../store';
import { Icons } from '../ui/Icons';
import { cn, getInventoryLevel, INVENTORY_COLORS, formatLiters } from '../../utils/helpers';

export default function InventoryPage() {
  const hubs = useHubStore((s) => s.hubs);
  const products = useProductStore((s) => s.products);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'hub' | 'terminal'>('all');
  const [alertFilter, setAlertFilter] = useState(false);

  const filtered = useMemo(() => {
    return hubs.filter((h) => {
      if (typeFilter !== 'all' && h.type !== typeFilter) return false;
      if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (alertFilter) {
        const hasAlert = Object.values(h.inventory).some((qty) => getInventoryLevel(qty as number) === 'critical' || getInventoryLevel(qty as number) === 'low');
        if (!hasAlert) return false;
      }
      return true;
    });
  }, [hubs, search, typeFilter, alertFilter]);

  // Summary stats
  const totalInventory = useMemo(() => {
    const totals: Record<string, number> = {};
    hubs.forEach((h) => {
      Object.entries(h.inventory).forEach(([product, qty]) => {
        totals[product] = (totals[product] || 0) + (qty as number);
      });
    });
    return totals;
  }, [hubs]);

  const alertCount = useMemo(() => {
    return hubs.filter((h) =>
      Object.values(h.inventory).some((qty) => {
        const level = getInventoryLevel(qty as number);
        return level === 'critical' || level === 'low';
      })
    ).length;
  }, [hubs]);

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900">Inventory Dashboard</h1>
        <p className="text-sm text-surface-500 mt-1">Real-time fuel inventory across all locations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <div key={product.id} className="card p-4">
            <p className="text-xs text-surface-500 uppercase tracking-wider">{product.name}</p>
            <p className="text-xl font-display font-bold text-surface-900 mt-1">{formatLiters(totalInventory[product.code] || 0)}</p>
          </div>
        ))}
        <div className="card p-4 border-danger-200 bg-danger-50/30">
          <p className="text-xs text-danger-600 uppercase tracking-wider">Low Stock Alerts</p>
          <p className="text-xl font-display font-bold text-danger-700 mt-1">{alertCount} locations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" placeholder="Search locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <div className="flex gap-2">
          {(['all', 'hub', 'terminal'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={cn('btn btn-sm', typeFilter === t ? 'bg-brand-600 text-white' : 'bg-white text-surface-600 border border-surface-300')}>
              {t === 'all' ? 'All' : t === 'hub' ? 'Hubs' : 'Terminals'}
            </button>
          ))}
          <button
            onClick={() => setAlertFilter(!alertFilter)}
            className={cn('btn btn-sm', alertFilter ? 'bg-danger-600 text-white' : 'bg-white text-danger-600 border border-danger-300')}
          >
            <Icons.AlertTriangle size={14} /> Alerts Only
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50/50">
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Location</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Type</th>
                {products.map((p) => (
                  <th key={p.id} className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">{p.name}</th>
                ))}
                <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((hub) => {
                const hasAlert = Object.values(hub.inventory).some((qty) => {
                  const level = getInventoryLevel(qty as number);
                  return level === 'critical' || level === 'low';
                });
                return (
                  <tr key={hub.id} className={cn('hover:bg-surface-50 transition-colors', hasAlert && 'bg-danger-50/20')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold', hub.type === 'hub' ? 'bg-success-500' : 'bg-purple-500')}>
                          {hub.type === 'hub' ? 'H' : 'T'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-900">{hub.name}</p>
                          <p className="text-xs text-surface-500">{hub.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('badge', hub.type === 'hub' ? 'bg-success-50 text-success-700' : 'bg-purple-50 text-purple-700')}>
                        {hub.type}
                      </span>
                    </td>
                    {products.map((product) => {
                      const qty = (hub.inventory[product.code] as number) || 0;
                      const level = getInventoryLevel(qty);
                      const colors = INVENTORY_COLORS[level];
                      return (
                        <td key={product.id} className="px-4 py-3 text-right">
                          {qty > 0 ? (
                            <div className="inline-flex flex-col items-end">
                              <span className={cn('text-sm font-medium', level === 'critical' ? 'text-danger-700' : level === 'low' ? 'text-warning-600' : 'text-surface-900')}>
                                {qty.toLocaleString()}L
                              </span>
                              <div className="w-16 h-1 rounded-full bg-surface-100 mt-1 overflow-hidden">
                                <div className={cn('h-full rounded-full', colors.bar)} style={{ width: `${Math.min((qty / 10000) * 100, 100)}%` }} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-surface-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right">
                      {hasAlert ? (
                        <span className="badge bg-danger-50 text-danger-700">
                          <Icons.AlertTriangle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="badge bg-success-50 text-success-700">
                          <Icons.Check size={12} /> OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
