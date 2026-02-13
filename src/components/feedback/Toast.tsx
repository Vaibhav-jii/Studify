import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose,
  duration = 4000 
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle2 size={20} className="text-[var(--color-success)]" />,
    error: <AlertCircle size={20} className="text-[var(--color-error)]" />,
    info: <Info size={20} className="text-[var(--color-accent-blue)]" />
  };

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5 duration-300">
      <div className="glass-card rounded-[var(--radius-md)] p-4 pr-12 min-w-[300px] max-w-md shadow-[0_20px_40px_rgba(88,76,120,0.2)]">
        <div className="flex items-start gap-3">
          {icons[type]}
          <p className="flex-1 text-sm font-medium text-[var(--color-text-primary)]">
            {message}
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Close notification"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = React.useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return {
    toast,
    showToast,
    hideToast
  };
}
