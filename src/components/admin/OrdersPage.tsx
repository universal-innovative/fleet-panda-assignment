import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrderStore, useHubStore, useDriverStore, useToastStore, useProductStore } from '../../store';
import { Icons } from '../ui/Icons';
import Modal from '../common/Modal';
import EmptyState from '../common/EmptyState';
import { cn, STATUS_COLORS, STATUS_LABELS, getProductLabel, formatDate, getToday } from '../../utils/helpers';
import type { Order, OrderStatus, ProductType } from '../../types';

export default function OrdersPage() {
  const { orders, addOrder, assignDriver, updateStatus, deleteOrder } = useOrderStore();
  const hubs = useHubStore((s) => s.hubs);
  const drivers = useDriverStore((s) => s.drivers);
  const products = useProductStore((s) => s.products);
  const addToast = useToastStore((s) => s.addToast);

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState('');

  const terminals = hubs.filter((h) => h.type === 'terminal');

  const [form, setForm] = useState({
    destinationId: '',
    product: 'diesel' as ProductType,
    quantity: 5000,
    deliveryDate: getToday(),
    assignedDriverId: null as string | null,
    status: 'pending' as OrderStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Open create modal from URL param
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setCreateOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (search) {
        const dest = hubs.find((h) => h.id === o.destinationId);
        const driver = drivers.find((d) => d.id === o.assignedDriverId);
        const q = search.toLowerCase();
        if (!o.id.toLowerCase().includes(q) && !(dest?.name || '').toLowerCase().includes(q) && !(driver?.name || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [orders, search, statusFilter, hubs, drivers]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.destinationId) e.destinationId = 'Select a destination';
    if (form.quantity <= 0) e.quantity = 'Must be positive';
    if (!form.deliveryDate) e.deliveryDate = 'Select a date';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCreate() {
    if (!validate()) return;
    const result = addOrder(form);
    if (!result.success) {
      addToast({ type: 'error', title: 'Order creation blocked', message: result.error });
      return;
    }
    addToast({ type: 'success', title: 'Order created', message: `${form.quantity}L ${getProductLabel(form.product)} order placed` });
    setCreateOpen(false);
    setForm({ destinationId: '', product: 'diesel', quantity: 5000, deliveryDate: getToday(), assignedDriverId: null, status: 'pending' });
  }

  function handleAssign() {
    if (!assignOpen || !selectedDriver) return;
    const result = assignDriver(assignOpen, selectedDriver);
    if (!result.success) {
      addToast({ type: 'error', title: 'Assignment blocked', message: result.error });
      return;
    }
    addToast({ type: 'success', title: 'Driver assigned' });
    setAssignOpen(null);
    setSelectedDriver('');
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Orders</h1>
          <p className="text-sm text-surface-500 mt-1">{orders.length} total orders</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary"><Icons.Plus size={16} /> Create Order</button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'assigned', 'in-transit', 'delivered', 'failed'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('btn btn-sm', statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white text-surface-600 border border-surface-300')}>
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
              {s !== 'all' && <span className="ml-1 text-xs opacity-70">({orders.filter((o) => o.status === s).length})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Icons.Package size={48} />} title="No orders found" action={<button onClick={() => setCreateOpen(true)} className="btn-primary btn-sm"><Icons.Plus size={14} /> Create Order</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50/50">
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Order</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Destination</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Product</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Qty</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Driver</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((order) => {
                  const dest = hubs.find((h) => h.id === order.destinationId);
                  const driver = drivers.find((d) => d.id === order.assignedDriverId);
                  const sc = STATUS_COLORS[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-surface-600">{order.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-surface-900">{dest?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-surface-100 text-surface-700">{getProductLabel(order.product)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-surface-900">{order.quantity.toLocaleString()}L</td>
                      <td className="px-4 py-3 text-sm text-surface-600 hidden md:table-cell">{formatDate(order.deliveryDate)}</td>
                      <td className="px-4 py-3 text-sm text-surface-600 hidden md:table-cell">{driver?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('badge', sc.bg, sc.text)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {order.status === 'pending' && (
                            <button onClick={() => { setAssignOpen(order.id); setSelectedDriver(''); }} className="btn-secondary btn-sm">
                              Assign
                            </button>
                          )}
                          {(order.status === 'pending' || order.status === 'assigned') && (
                            <button onClick={() => { deleteOrder(order.id); addToast({ type: 'info', title: 'Order deleted' }); }} className="btn-ghost btn-sm text-danger-600"><Icons.Trash size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Order" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Destination</label>
              <select value={form.destinationId} onChange={(e) => setForm({ ...form, destinationId: e.target.value })} className={cn('select-field', errors.destinationId && 'border-danger-500')}>
                <option value="">Select terminal...</option>
                {terminals.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </select>
              {errors.destinationId && <p className="text-xs text-danger-600 mt-1">{errors.destinationId}</p>}
            </div>
            <div>
              <label className="label">Product</label>
              <select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value as ProductType })} className="select-field">
                {products.map((p) => (<option key={p.id} value={p.code}>{p.name}</option>))}
              </select>
            </div>
            <div>
              <label className="label">Quantity (Liters)</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} className={cn('input-field', errors.quantity && 'border-danger-500')} />
              {errors.quantity && <p className="text-xs text-danger-600 mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="label">Delivery Date</label>
              <input type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} className={cn('input-field', errors.deliveryDate && 'border-danger-500')} />
            </div>
            <div>
              <label className="label">Assign Driver (Optional)</label>
              <select value={form.assignedDriverId || ''} onChange={(e) => setForm({ ...form, assignedDriverId: e.target.value || null, status: e.target.value ? 'assigned' : 'pending' })} className="select-field">
                <option value="">Unassigned</option>
                {drivers.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} className="btn-primary">Create Order</button>
          </div>
        </div>
      </Modal>

      {/* Assign Driver Modal */}
      <Modal isOpen={!!assignOpen} onClose={() => setAssignOpen(null)} title="Assign Driver" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Select Driver</label>
            <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} className="select-field">
              <option value="">Choose driver...</option>
              {drivers.map((d) => (<option key={d.id} value={d.id}>{d.name} ({d.license})</option>))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button onClick={() => setAssignOpen(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleAssign} disabled={!selectedDriver} className="btn-primary">Assign Driver</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
