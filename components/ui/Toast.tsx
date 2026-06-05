import React, { createContext, useContext, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'info' | 'warning';
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

const icons: Record<ToastTone, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};
const toneStyles: Record<ToastTone, string> = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-info',
};

let counter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = ++counter;
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div
          className="fixed top-4 right-4 z-[200] flex flex-col gap-2"
          aria-live="polite"
          aria-atomic="true"
        >
          <AnimatePresence>
            {items.map((t) => {
              const Icon = icons[t.tone];
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: 40, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-elevation-2 min-w-[260px] max-w-sm"
                >
                  <Icon size={20} className={toneStyles[t.tone]} />
                  <p className="text-sm font-semibold text-slate-700">{t.message}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
