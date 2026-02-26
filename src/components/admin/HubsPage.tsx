import React, { useState, useMemo } from 'react';
import { useHubStore, useToastStore } from '../../store';
import { Icons } from '../ui/Icons';
import Modal from '../common/Modal';
import EmptyState from '../common/EmptyState';
import { cn } from '../../utils/helpers';
import type { Hub } from '../../types';

const defaultHub: Omit<Hub, 'id'> = {
  name: '',
  type: 'terminal',
  address: '',
  coordinates: { lat: 37.77, lng: -122.42 },
  inventory: {},
};

export default function HubsPage() {
  const { hubs, addHub, updateHub, deleteHub } = useHubStore();
  const addToast = useToastStore((s) => s.addToast);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'hub' | 'terminal'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<Hub | null>(null);
  const [form, setForm] = useState(defaultHub);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return hubs.filter((h) => {
      if (typeFilter !== 'all' && h.type !== typeFilter) return false;
      if (search && !h.name.toLowerCase().includes(search.toLowerCase()) && !h.address.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [hubs, search, typeFilter]);

  function openCreate() {
    setEditingHub(null);
    setForm(defaultHub);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(hub: Hub) {
    setEditingHub(hub);
    setForm({ name: hub.name, type: hub.type, address: hub.address, coordinates: hub.coordinates, inventory: hub.inventory });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (form.coordinates.lat < -90 || form.coordinates.lat > 90) e.lat = 'Invalid latitude';
    if (form.coordinates.lng < -180 || form.coordinates.lng > 180) e.lng = 'Invalid longitude';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    if (editingHub) {
      updateHub(editingHub.id, form);
      addToast({ type: 'success', title: 'Hub updated', message: `${form.name} has been updated` });
    } else {
      addHub(form);
      addToast({ type: 'success', title: 'Hub created', message: `${form.name} has been added` });
    }
    setModalOpen(false);
  }

  function handleDelete(hub: Hub) {
    if (confirm(`Delete "${hub.name}"? This action cannot be undone.`)) {
      deleteHub(hub.id);
      addToast({ type: 'info', title: 'Hub deleted', message: `${hub.name} has been removed` });
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Hubs & Terminals</h1>
          <p className="text-sm text-surface-500 mt-1">{hubs.length} locations configured</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Icons.Plus size={16} /> Add Location
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search hubs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'hub', 'terminal'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn('btn btn-sm', typeFilter === t ? 'bg-brand-600 text-white' : 'bg-white text-surface-600 border border-surface-300')}
            >
              {t === 'all' ? 'All' : t === 'hub' ? 'Hubs' : 'Terminals'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Icons.Warehouse size={48} />} title="No locations found" description="Add your first hub or terminal to get started" action={<button onClick={openCreate} className="btn-primary btn-sm"><Icons.Plus size={14} /> Add Location</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Address</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Coordinates</th>
                  <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((hub) => (
                  <tr key={hub.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold', hub.type === 'hub' ? 'bg-success-500' : 'bg-purple-500')}>
                          {hub.type === 'hub' ? 'H' : 'T'}
                        </div>
                        <span className="text-sm font-medium text-surface-900">{hub.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('badge', hub.type === 'hub' ? 'bg-success-50 text-success-700' : 'bg-purple-50 text-purple-700')}>
                        {hub.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-surface-600">{hub.address}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-surface-500 font-mono">
                      {hub.coordinates.lat.toFixed(4)}, {hub.coordinates.lng.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(hub)} className="btn-ghost btn-sm" title="Edit">
                          <Icons.Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(hub)} className="btn-ghost btn-sm text-danger-600 hover:bg-danger-50" title="Delete">
                          <Icons.Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingHub ? 'Edit Location' : 'Add Location'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={cn('input-field', errors.name && 'border-danger-500')}
                placeholder="Downtown Distribution Hub"
              />
              {errors.name && <p className="text-xs text-danger-600 mt-1">{errors.name}</p>}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'hub' | 'terminal' })}
                className="select-field"
              >
                <option value="hub">Hub</option>
                <option value="terminal">Terminal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={cn('input-field', errors.address && 'border-danger-500')}
              placeholder="123 Main St, City, State"
            />
            {errors.address && <p className="text-xs text-danger-600 mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={form.coordinates.lat}
                onChange={(e) => setForm({ ...form, coordinates: { ...form.coordinates, lat: parseFloat(e.target.value) || 0 } })}
                className={cn('input-field', errors.lat && 'border-danger-500')}
              />
              {errors.lat && <p className="text-xs text-danger-600 mt-1">{errors.lat}</p>}
            </div>
            <div>
              <label className="label">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={form.coordinates.lng}
                onChange={(e) => setForm({ ...form, coordinates: { ...form.coordinates, lng: parseFloat(e.target.value) || 0 } })}
                className={cn('input-field', errors.lng && 'border-danger-500')}
              />
              {errors.lng && <p className="text-xs text-danger-600 mt-1">{errors.lng}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">
              {editingHub ? 'Save Changes' : 'Create Location'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
