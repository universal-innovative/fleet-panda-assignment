import React from 'react';
import { useToastStore } from '../../store';
import { Icons } from '../ui/Icons';
import { cn } from '../../utils/helpers';

const toastStyles = {
  success: 'bg-success-50 border-success-500 text-success-700',
  error: 'bg-danger-50 border-danger-500 text-danger-700',
  warning: 'bg-warning-50 border-warning-500 text-warning-600',
  info: 'bg-brand-50 border-brand-500 text-brand-700',
};

const toastIcons = {
  success: <Icons.Check size={18} />,
  error: <Icons.X size={18} />,
  warning: <Icons.AlertTriangle size={18} />,
  info: <Icons.Eye size={18} />,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 shadow-elevated animate-slide-up',
            toastStyles[toast.type]
          )}
        >
          <span className="mt-0.5 shrink-0">{toastIcons[toast.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.message && <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <Icons.X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
