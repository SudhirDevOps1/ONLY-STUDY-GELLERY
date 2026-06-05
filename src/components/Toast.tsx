import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Toast as ToastType } from '../types';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-500/90 dark:bg-green-600/90',
          icon: <CheckCircle2 className="w-5 h-5" />,
          border: 'border-green-400'
        };
      case 'error':
        return {
          bg: 'bg-red-500/90 dark:bg-red-600/90',
          icon: <AlertCircle className="w-5 h-5" />,
          border: 'border-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/90 dark:bg-amber-600/90',
          icon: <AlertTriangle className="w-5 h-5" />,
          border: 'border-amber-400'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500/90 dark:bg-blue-600/90',
          icon: <Info className="w-5 h-5" />,
          border: 'border-blue-400'
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`${styles.bg} backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-2xl border ${styles.border} flex items-center gap-3 min-w-[280px] max-w-md animate-slide-in`}
      role="alert"
    >
      <div className="flex-shrink-0">{styles.icon}</div>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};

// Hook to use toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastType[]>([]);

  const showToast = (type: ToastType['type'], message: string, duration?: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message, duration }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, showToast, dismissToast };
};
