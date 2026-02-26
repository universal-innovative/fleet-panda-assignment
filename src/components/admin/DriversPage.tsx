import React, { useState, useMemo } from 'react';
import { useDriverStore, useToastStore } from '../../store';
import { Icons } from '../ui/Icons';
import Modal from '../common/Modal';
import EmptyState from '../common/EmptyState';
import { cn, validatePhone, validateLicense } from '../../utils/helpers';
import type { Driver } from '../../types';

const defaultDriver = { name: '', license: '', phone: '' };

export default function DriversPage() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useDriverStore();
  const addToast = useToastStore((s) => s.addToast);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState(defaultDriver);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    if (!search) return drivers;
    const q = search.toLowerCase();
    return drivers.filter((d) => d.name.toLowerCase().includes(q) || d.license.toLowerCase().includes(q) || d.phone.includes(q));
  }, [drivers, search]);

  function openCreate() {
    setEditing(null);
    setForm(defaultDriver);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(d: Driver) {
    setEditing(d);
    setForm({ name: d.name, license: d.license, phone: d.phone });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.license.trim()) e.license = 'License is required';
    else if (!validateLicense(form.license)) e.license = 'Format: XX-123456';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!validatePhone(form.phone)) e.phone = 'Invalid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    if (editing) {
      updateDriver(editing.id, form);
      addToast({ type: 'success', title: 'Driver updated' });
    } else {
      addDriver(form);
      addToast({ type: 'success', title: 'Driver added', message: `${form.name} has been registered` });
    }
    setModalOpen(false);
  }

  function handleDelete(d: Driver) {
    if (confirm(`Remove driver "${d.name}"?`)) {
      deleteDriver(d.id);
      addToast({ type: 'info', title: 'Driver removed' });
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Drivers</h1>
          <p className="text-sm text-surface-500 mt-1">{drivers.length} registered drivers</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Icons.Plus size={16} /> Add Driver</button>
      </div>

      <div className="relative max-w-xs">
        <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input type="text" placeholder="Search drivers..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Icons.Users size={48} />} title="No drivers found" action={<button onClick={openCreate} className="btn-primary btn-sm"><Icons.Plus size={14} /> Add Driver</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((driver) => (
            <div key={driver.id} className="card-hover p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                    {driver.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-surface-900">{driver.name}</h3>
                    <p className="text-xs text-surface-500 font-mono">{driver.license}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(driver)} className="btn-ghost btn-sm"><Icons.Edit size={14} /></button>
                  <button onClick={() => handleDelete(driver)} className="btn-ghost btn-sm text-danger-600"><Icons.Trash size={14} /></button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-surface-100 flex items-center gap-2 text-xs text-surface-500">
                <span>📞 {driver.phone}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Driver' : 'Add Driver'}>
        <div className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cn('input-field', errors.name && 'border-danger-500')} placeholder="John Smith" />
            {errors.name && <p className="text-xs text-danger-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="label">License Number</label>
            <input type="text" value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value.toUpperCase() })} className={cn('input-field', errors.license && 'border-danger-500')} placeholder="DL-123456" />
            {errors.license && <p className="text-xs text-danger-600 mt-1">{errors.license}</p>}
          </div>
          <div>
            <label className="label">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={cn('input-field', errors.phone && 'border-danger-500')} placeholder="+1-555-0100" />
            {errors.phone && <p className="text-xs text-danger-600 mt-1">{errors.phone}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">{editing ? 'Save Changes' : 'Add Driver'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
