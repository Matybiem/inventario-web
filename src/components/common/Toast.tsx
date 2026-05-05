import { useApp } from '@/context/AppContext';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg
            text-white text-[14px] font-medium
            animate-in slide-in-from-right-8 fade-in duration-300
            ${toast.type === 'success' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}
          `}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
