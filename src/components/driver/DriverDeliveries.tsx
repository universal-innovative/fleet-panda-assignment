import React, { useState } from 'react';
import { useActiveDriverStore, useOrderStore, useHubStore, useAllocationStore, useToastStore } from '../../store';
import { Icons } from '../ui/Icons';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { cn, getToday, getProductLabel, STATUS_LABELS, STATUS_COLORS } from '../../utils/helpers';
import type { Order } from '../../types';

type DeliveryAction = 'complete' | 'fail';

export default function DriverDeliveries() {
  const activeDriverId = useActiveDriverStore((s) => s.activeDriverId);
  const orders = useOrderStore((s) => s.orders);
  const updateStatus = useOrderStore((s) => s.updateStatus);
  const updateInventory = useHubStore((s) => s.updateInventory);
  const hubs = useHubStore((s) => s.hubs);
  const allocations = useAllocationStore((s) => s.allocations);
  const addToast = useToastStore((s) => s.addToast);

  const today = getToday();
  const allocation = allocations.find((a) => a.driverId === activeDriverId && a.date === today);
  const todayOrders = orders.filter((o) => o.assignedDriverId === activeDriverId && o.deliveryDate === today);

  const [actionModal, setActionModal] = useState<{ order: Order; action: DeliveryAction } | null>(null);
  const [notes, setNotes] = useState('');
  const [deliveredQty, setDeliveredQty] = useState('');

  const pending = todayOrders.filter((o) => o.status === 'assigned' || o.status === 'in-transit');
  const completed = todayOrders.filter((o) => o.status === 'delivered' || o.status === 'failed');

  function openAction(order: Order, action: DeliveryAction) {
    setActionModal({ order, action });
    setNotes('');
    setDeliveredQty(action === 'complete' ? String(order.quantity) : '0');
  }

  function handleConfirm() {
    if (!actionModal) return;
    const { order, action } = actionModal;
    const quantity = Math.max(0, Math.min(order.quantity, Number(deliveredQty) || order.quantity));

    if (action === 'complete') {
      updateStatus(order.id, 'delivered');
      if (quantity > 0) {
        updateInventory(order.destinationId, order.product, quantity);
      }
      addToast({
        type: 'success',
        title: 'Delivery Completed',
        message: `${getProductLabel(order.product)} delivered to ${hubs.find((h) => h.id === order.destinationId)?.name || 'destination'}`,
      });
    } else {
      if (!notes.trim()) {
        addToast({ type: 'error', title: 'Failure reason required' });
        return;
      }
      updateStatus(order.id, 'failed', notes.trim() || 'Delivery failed');
      addToast({
        type: 'warning',
        title: 'Delivery Failed',
        message: `${getProductLabel(order.product)} delivery marked as failed${notes ? ': ' + notes : ''}`,
      });
    }
    setActionModal(null);
  }

  function handleStartDelivery(order: Order) {
    updateStatus(order.id, 'in-transit');
    addToast({
      type: 'info',
      title: 'Delivery Started',
      message: `En route to ${hubs.find((h) => h.id === order.destinationId)?.name || 'destination'}`,
    });
  }

  if (!activeDriverId) {
    return <EmptyState icon={<Icons.User size={24} />} title="No Driver Selected" message="Select a driver from the top menu to view deliveries." />;
  }

  if (!allocation) {
    return <EmptyState icon={<Icons.Truck size={24} />} title="No Allocation Today" message="You don't have a vehicle allocated for today." />;
  }

  const stats = {
    total: todayOrders.length,
    pending: pending.length,
    delivered: todayOrders.filter((o) => o.status === 'delivered').length,
    failed: todayOrders.filter((o) => o.status === 'failed').length,
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-surface-900' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
          { label: 'Delivered', value: stats.delivered, color: 'text-emerald-600' },
          { label: 'Failed', value: stats.failed, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-surface-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending deliveries */}
      {pending.length > 0 && (
        <div className="card">
          <div className="p-4 border-b border-surface-100">
            <h3 className="font-semibold text-surface-900 flex items-center gap-2">
              <Icons.Clock size={16} className="text-amber-500" />
              Pending Deliveries ({pending.length})
            </h3>
          </div>
          <div className="divide-y divide-surface-100">
            {pending.map((order) => {
              const dest = hubs.find((h) => h.id === order.destinationId);
              return (
                <div key={order.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-surface-900 text-sm">{dest?.name || 'Unknown'}</h4>
                        <span className={cn('badge', STATUS_COLORS[order.status].bg, STATUS_COLORS[order.status].text)}>{STATUS_LABELS[order.status]}</span>
                      </div>
                      <p className="text-xs text-surface-500">{dest?.address}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-surface-600">
                        <span className="font-medium">{getProductLabel(order.product)}</span>
                        <span>•</span>
                        <span>{order.quantity.toLocaleString()} L</span>
                        {order.priority === 'urgent' && (
                          <>
                            <span>•</span>
                            <span className="text-red-600 font-medium">URGENT</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === 'assigned' && (
                      <button onClick={() => handleStartDelivery(order)} className="btn-primary text-xs px-3 py-1.5">
                        <Icons.Navigation size={14} /> Start Delivery
                      </button>
                    )}
                    {order.status === 'in-transit' && (
                      <>
                        <button onClick={() => openAction(order, 'complete')} className="btn-primary text-xs px-3 py-1.5 !bg-emerald-600 hover:!bg-emerald-700">
                          <Icons.CheckCircle size={14} /> Mark Delivered
                        </button>
                        <button onClick={() => openAction(order, 'fail')} className="btn-secondary text-xs px-3 py-1.5 !text-red-600 !border-red-200 hover:!bg-red-50">
                          <Icons.XCircle size={14} /> Mark Failed
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed deliveries */}
      {completed.length > 0 && (
        <div className="card">
          <div className="p-4 border-b border-surface-100">
            <h3 className="font-semibold text-surface-900 flex items-center gap-2">
              <Icons.CheckCircle size={16} className="text-emerald-500" />
              Completed ({completed.length})
            </h3>
          </div>
          <div className="divide-y divide-surface-100">
            {completed.map((order) => {
              const dest = hubs.find((h) => h.id === order.destinationId);
              return (
                <div key={order.id} className="p-4 flex items-center gap-3">
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', order.status === 'delivered' ? 'bg-emerald-100' : 'bg-red-100')}>
                    {order.status === 'delivered' ? (
                      <Icons.CheckCircle size={16} className="text-emerald-600" />
                    ) : (
                      <Icons.XCircle size={16} className="text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-surface-900">{dest?.name || 'Unknown'}</p>
                    <p className="text-xs text-surface-500">
                      {getProductLabel(order.product)} • {order.quantity.toLocaleString()} L
                      {order.deliveredAt && ` • Delivered at ${new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                  <span className={cn('badge', STATUS_COLORS[order.status].bg, STATUS_COLORS[order.status].text)}>{STATUS_LABELS[order.status]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {todayOrders.length === 0 && (
        <EmptyState
          icon={<Icons.Package size={24} />}
          title="No Deliveries"
          message="You have no deliveries scheduled for today."
        />
      )}

      {/* Action Modal */}
      {actionModal && (
        <Modal
          title={actionModal.action === 'complete' ? 'Confirm Delivery' : 'Report Failed Delivery'}
          onClose={() => setActionModal(null)}
          onConfirm={handleConfirm}
          confirmLabel={actionModal.action === 'complete' ? 'Confirm Delivery' : 'Mark as Failed'}
          variant={actionModal.action === 'complete' ? 'primary' : 'danger'}
        >
          <div className="space-y-4">
            <div className="bg-surface-50 rounded-lg p-3">
              <p className="text-sm font-medium text-surface-900">
                {hubs.find((h) => h.id === actionModal.order.destinationId)?.name}
              </p>
              <p className="text-xs text-surface-500 mt-1">
                {getProductLabel(actionModal.order.product)} • {actionModal.order.quantity.toLocaleString()} L
              </p>
            </div>

            {actionModal.action === 'complete' && (
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Delivered Quantity (L)</label>
                <input
                  type="number"
                  value={deliveredQty}
                  onChange={(e) => setDeliveredQty(e.target.value)}
                  className="input w-full"
                  min={0}
                  max={actionModal.order.quantity}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                {actionModal.action === 'complete' ? 'Notes (optional)' : 'Reason for failure'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input w-full h-20 resize-none"
                placeholder={actionModal.action === 'complete' ? 'Any delivery notes...' : 'Why was this delivery unsuccessful?'}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
