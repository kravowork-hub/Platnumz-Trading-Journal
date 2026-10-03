import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  message: string;
}

interface AndroidToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const AndroidToast: React.FC<AndroidToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none max-w-sm w-full px-4 flex justify-center animate-slideUp">
      <div className="pointer-events-auto bg-[#161B26]/95 backdrop-blur-md border border-[#263148] shadow-2xl rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-white max-w-xs sm:max-w-md">
        {toast.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        {toast.type === 'WARNING' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
        {toast.type === 'INFO' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
        
        <span className="font-medium text-gray-200 leading-snug">{toast.message}</span>

        <button 
          onClick={onDismiss}
          className="ml-auto pl-2 text-gray-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
