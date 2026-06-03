import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { ToastMessage } from '../lib/utils';

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { message, type } = customEvent.detail;
        const newToast: ToastMessage = {
          id: `${Date.now()}-${Math.random()}`,
          message,
          type: type || 'success'
        };
        setToasts(prev => [...prev, newToast]);
      }
    };

    window.addEventListener('ilg_show_toast', handleToast);
    return () => window.removeEventListener('ilg_show_toast', handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
          let borderBg = 'border-emerald-100 bg-emerald-50/95 shadow-emerald-100/30';
          if (toast.type === 'error') {
            icon = <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />;
            borderBg = 'border-rose-100 bg-rose-50/95 shadow-rose-100/30';
          } else if (toast.type === 'info') {
            icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
            borderBg = 'border-blue-100 bg-blue-50/95 shadow-blue-100/30';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.2 }}
              onAnimationComplete={() => {
                // Auto dismiss
                setTimeout(() => removeToast(toast.id), 3800);
              }}
              className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-xs text-sm font-semibold text-slate-800 ${borderBg}`}
            >
              {icon}
              <div className="flex-1 min-w-0 pr-1 text-xs md:text-sm leading-tight">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
