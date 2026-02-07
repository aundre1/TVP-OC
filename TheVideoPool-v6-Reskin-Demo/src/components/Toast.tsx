// ============================================
// THE VIDEO POOL - TOAST NOTIFICATIONS v5.5
// Minimal pill style (Council Approved)
// Single line, bottom center, backdrop blur
// ============================================

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, AlertTriangle, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/appStore';
import { Toast as ToastType } from '@/types';

// Icon mapping for toast types
const TOAST_ICONS = {
  success: Check,
  error: X,
  warning: AlertTriangle,
  info: Info,
};

// Single Toast Component
function ToastItem({ toast, onDismiss }: { toast: ToastType; onDismiss: () => void }) {
  const Icon = TOAST_ICONS[toast.type];

  return (
    <div
      className={clsx(
        'toast',
        `toast--${toast.type}`,
        'flex items-center gap-2.5 px-5 py-3',
        'bg-[rgba(17,17,22,0.95)] backdrop-blur-xl',
        'border border-tvp-border-default rounded-pill',
        'text-tvp-text-primary text-sm font-medium',
        'shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
        'animate-toast-in'
      )}
      onClick={onDismiss}
      role="alert"
    >
      <Icon
        className={clsx('w-4 h-4 flex-shrink-0 toast-icon', {
          'text-tvp-status-success': toast.type === 'success',
          'text-tvp-status-error': toast.type === 'error',
          'text-tvp-status-warning': toast.type === 'warning',
          'text-tvp-accent-cyan': toast.type === 'info',
        })}
      />
      <span className="whitespace-nowrap">{toast.message}</span>
    </div>
  );
}

// Toast Container Component
export default function ToastContainer() {
  const { toasts, dismissToast } = useAppStore();

  // Don't render anything if no toasts
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toast-container fixed bottom-6 left-1/2 -translate-x-1/2 z-1000 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
}

// Hook for showing toasts (convenience export)
export function useToast() {
  const { showToast, dismissToast, clearToasts } = useAppStore();

  return {
    success: (message: string, duration?: number) => showToast('success', message, duration),
    error: (message: string, duration?: number) => showToast('error', message, duration),
    warning: (message: string, duration?: number) => showToast('warning', message, duration),
    info: (message: string, duration?: number) => showToast('info', message, duration),
    dismiss: dismissToast,
    clearAll: clearToasts,
  };
}
