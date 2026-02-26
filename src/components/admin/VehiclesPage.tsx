import React, { useState, useMemo } from 'react';
import { useVehicleStore, useToastStore } from '../../store';
import { Icons } from '../ui/Icons';
import Modal from '../common/Modal';
import EmptyState from '../common/EmptyState';
import { cn, validateRegistration } from '../../utils/helpers';
import type { Vehicle } from '../../types';

const defaultVehicle = { registration: '', capacity: 8000, type: 'Tanker' as Vehicle['type'] };

export default function VehiclesPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicleStore();
  const addToast = useToastStore((s) => s.addToast);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | Vehicle['type']>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(defaultVehicle);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (typeFilter !== 'all' && v.type !== typeFilter) return false;
      if (search && !v.registration.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [vehicles, search, typeFilter]);

  function openCreate() { setEditing(null); setForm(defaultVehicle); setErrors({}); setModalOpen(true); }
  function openEdit(v: Vehicle) { setEditing(v); setForm({ registration: v.registration, capacity: v.capacity, type: v.type }); setErrors({}); setModalOpen(true); }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.registration.trim()) e.registration = 'Registration is required';
    else if (!validateRegistration(form.registration)) e.registration = 'Format: TRK-101';
    if (form.capacity <= 0) e.capacity = 'Must be positive';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    if (editing) {
      updateVehicle(editing.id, form);
      addToast({ type: 'success', title: 'Vehicle updated' });
    } else {
      addVehicle(form);
      addToast({ type: 'success', title: 'Vehicle added', message: `${form.registration} registered` });
    }
    setModalOpen(false);
  }

  const typeIcons = { Tanker: '🛢️', Truck: '🚛', Van: '🚐' };

  return (
    <div className="p-4 lg:p-6 space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Vehicles</h1>
          <p className="text-sm text-surface-500 mt-1">{vehicles.length} vehicles in fleet</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Icons.Plus size={16} /> Add Vehicle</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" placeholder="Search vehicles..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <div className="flex gap-2">
          {(['all', 'Tanker', 'Truck', 'Van'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={cn('btn btn-sm', typeFilter === t ? 'bg-brand-600 text-white' : 'bg-white text-surface-600 border border-surface-300')}>
              {t === 'all' ? 'All' : `${typeIcons[t]} ${t}`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Icons.Truck size={48} />} title="No vehicles found" action={<button onClick={openCreate} className="btn-primary btn-sm"><Icons.Plus size={14} /> Add Vehicle</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((vehicle) => (
            <div key={vehicle.id} className="card-hover p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{typeIcons[vehicle.type]}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(vehicle)} className="btn-ghost btn-sm"><Icons.Edit size={14} /></button>
                  <button onClick={() => { deleteVehicle(vehicle.id); addToast({ type: 'info', title: 'Vehicle removed' }); }} className="btn-ghost btn-sm text-danger-600"><Icons.Trash size={14} /></button>
                </div>
              </div>
              <h3 className="text-lg font-display font-bold text-surface-900">{vehicle.registration}</h3>
              <div className="flex items-center gap-3 mt-2 text-xs text-surface-500">
                <span className="badge bg-surface-100 text-surface-600">{vehicle.type}</span>
                <span>{vehicle.capacity.toLocaleString()}L capacity</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Vehicle' : 'Add Vehicle'}>
        <div className="space-y-4">
          <div>
            <label className="label">Registration</label>
            <input type="text" value={form.registration} onChange={(e) => setForm({ ...form, registration: e.target.value.toUpperCase() })} className={cn('input-field', errors.registration && 'border-danger-500')} placeholder="TRK-101" />
            {errors.registration && <p className="text-xs text-danger-600 mt-1">{errors.registration}</p>}
          </div>
          <div>
            <label className="label">Capacity (Liters)</label>
            <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} className={cn('input-field', errors.capacity && 'border-danger-500')} />
            {errors.capacity && <p className="text-xs text-danger-600 mt-1">{errors.capacity}</p>}
          </div>
          <div>
            <label className="label">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Vehicle['type'] })} className="select-field">
              <option value="Tanker">Tanker</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">{editing ? 'Save Changes' : 'Add Vehicle'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
