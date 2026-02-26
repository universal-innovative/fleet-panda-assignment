import React, { useEffect, useRef } from 'react';
import { Icons } from '../ui/Icons';
import { cn } from '../../utils/helpers';

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onConfirm?: () => void;
  confirmLabel?: string;
  variant?: 'primary' | 'danger';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen = true, onClose, title, children, size = 'md', onConfirm, confirmLabel, variant = 'primary' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="absolute inset-0 bg-surface-950/40 backdrop-blur-sm animate-fade-in" />
      <div
        className={cn(
          'relative w-full bg-white rounded-2xl shadow-modal animate-slide-up',
          sizeClasses[size]
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-display font-semibold text-surface-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
            aria-label="Close modal"
          >
            <Icons.X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {onConfirm && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-200">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              onClick={onConfirm}
              className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
            >
              {confirmLabel || 'Confirm'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
