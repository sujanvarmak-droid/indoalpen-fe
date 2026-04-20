import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '@/features/ui/uiSlice';
import { cn } from '@/utils/cn';

const typeStyles = {
  success: 'border-l-4 border-success bg-green-50 text-green-800',
  error:   'border-l-4 border-danger bg-red-50 text-red-800',
  info:    'border-l-4 border-brand-light bg-blue-50 text-blue-800',
};

const ToastItem = ({ toast }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg min-w-[280px] max-w-sm',
        'animate-slide-in',
        typeStyles[toast.type] ?? typeStyles.info
      )}
    >
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="text-current opacity-60 hover:opacity-100 transition-opacity shrink-0"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const Toast = () => {
  const toastQueue = useSelector((state) => state.ui.toastQueue);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {toastQueue.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
