import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAllocationStore, useDriverStore, useVehicleStore, useToastStore } from '../../store';
import { Icons } from '../ui/Icons';
import Modal from '../common/Modal';
import { cn, getToday, formatDate } from '../../utils/helpers';

export default function AllocationsPage() {
  const { allocations, addAllocation, deleteAllocation } = useAllocationStore();
  const drivers = useDriverStore((s) => s.drivers);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [form, setForm] = useState({ vehicleId: '', driverId: '', date: getToday() });
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('new') !== '1') return;
    const driverId = searchParams.get('driverId') || '';
    const date = searchParams.get('date') || getToday();
    setForm((prev) => ({ ...prev, driverId, date }));
    setCreateOpen(true);
  }, [searchParams]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentMonth]);

  const today = getToday();

  function getAllocationsForDate(day: number): typeof allocations {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allocations.filter((a) => a.date === dateStr);
  }

  function handleCreate() {
    setError('');
    if (!form.vehicleId || !form.driverId || !form.date) {
      setError('All fields are required');
      return;
    }
    const result = addAllocation(form);
    if (!result.success) {
      setError(result.error || 'Allocation failed');
      addToast({ type: 'error', title: 'Allocation Failed', message: result.error });
      return;
    }
    addToast({ type: 'success', title: 'Vehicle allocated' });
    const returnTo = searchParams.get('returnTo');
    const resume = searchParams.get('resume');
    if (returnTo) {
      const decodedReturnTo = decodeURIComponent(returnTo);
      const query = resume ? `?resume=${encodeURIComponent(resume)}` : '';
      navigate(`${decodedReturnTo}${query}`);
      return;
    }
    setCreateOpen(false);
    setForm({ vehicleId: '', driverId: '', date: getToday() });
  }

  function prevMonth() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 lg:p-6 space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Vehicle Allocations</h1>
          <p className="text-sm text-surface-500 mt-1">{allocations.length} active allocations</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary"><Icons.Plus size={16} /> Allocate Vehicle</button>
      </div>

      {/* Calendar Navigation */}
      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-surface-100">
          <button onClick={prevMonth} className="btn-ghost btn-sm"><Icons.ChevronRight size={16} className="rotate-180" /></button>
          <h2 className="font-display font-semibold text-surface-900">{monthLabel}</h2>
          <button onClick={nextMonth} className="btn-ghost btn-sm"><Icons.ChevronRight size={16} /></button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="calendar-cell header">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="calendar-cell bg-surface-50/50" />;
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayAllocs = getAllocationsForDate(day);
              const isToday = dateStr === today;
              return (
                <div key={day} className={cn('calendar-cell', isToday && 'today')}>
                  <span className={cn('text-xs font-medium', isToday ? 'text-brand-600 font-bold' : 'text-surface-600')}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayAllocs.slice(0, 3).map((alloc) => {
                      const driver = drivers.find((d) => d.id === alloc.driverId);
                      const vehicle = vehicles.find((v) => v.id === alloc.vehicleId);
                      return (
                        <div
                          key={alloc.id}
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer group relative',
                            alloc.shiftEnded ? 'bg-surface-100 text-surface-500' :
                            alloc.shiftStarted ? 'bg-success-50 text-success-700' :
                            'bg-brand-50 text-brand-700'
                          )}
                          title={`${driver?.name} → ${vehicle?.registration}`}
                        >
                          {vehicle?.registration} · {driver?.name?.split(' ')[0]}
                        </div>
                      );
                    })}
                    {dayAllocs.length > 3 && (
                      <span className="text-[10px] text-surface-400">+{dayAllocs.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Today's Allocations List */}
      <div className="card">
        <div className="p-4 border-b border-surface-100">
          <h2 className="font-semibold text-surface-900">All Allocations</h2>
        </div>
        <div className="divide-y divide-surface-100">
          {allocations.length === 0 ? (
            <p className="p-8 text-center text-sm text-surface-400">No allocations yet</p>
          ) : (
            allocations.map((alloc) => {
              const driver = drivers.find((d) => d.id === alloc.driverId);
              const vehicle = vehicles.find((v) => v.id === alloc.vehicleId);
              return (
                <div key={alloc.id} className="flex items-center justify-between p-4 hover:bg-surface-50">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <p className="font-medium text-surface-900">{driver?.name}</p>
                      <p className="text-xs text-surface-500">{vehicle?.registration} · {vehicle?.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-surface-500">{formatDate(alloc.date)}</span>
                    <span className={cn('badge', alloc.shiftEnded ? 'bg-surface-100 text-surface-500' : alloc.shiftStarted ? 'bg-success-50 text-success-700' : 'bg-brand-50 text-brand-600')}>
                      {alloc.shiftEnded ? 'Ended' : alloc.shiftStarted ? 'Active' : 'Scheduled'}
                    </span>
                    {!alloc.shiftStarted && (
                      <button onClick={() => { deleteAllocation(alloc.id); addToast({ type: 'info', title: 'Allocation removed' }); }} className="btn-ghost btn-sm text-danger-600">
                        <Icons.Trash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Allocation Modal */}
      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); setError(''); }} title="Allocate Vehicle">
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-danger-50 text-danger-700 text-sm">
              <Icons.AlertTriangle size={16} />
              {error}
            </div>
          )}
          <div>
            <label className="label">Vehicle</label>
            <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className="select-field">
              <option value="">Select vehicle...</option>
              {vehicles.map((v) => (<option key={v.id} value={v.id}>{v.registration} ({v.type} · {v.capacity.toLocaleString()}L)</option>))}
            </select>
          </div>
          <div>
            <label className="label">Driver</label>
            <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} className="select-field">
              <option value="">Select driver...</option>
              {drivers.map((d) => (<option key={d.id} value={d.id}>{d.name} ({d.license})</option>))}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button onClick={() => { setCreateOpen(false); setError(''); }} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} className="btn-primary">Allocate</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
