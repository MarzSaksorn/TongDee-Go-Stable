import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { X, AlertTriangle, CheckCircle2, Info } from "lucide-react";

type ToastType = "info" | "error" | "success";

interface Toast {
  message: string;
  type: ToastType;
  id: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const idRef = React.useRef(0);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++idRef.current;
    setToast({ message, type, id });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3000);
  }, []);

  const dismiss = useCallback(() => {
    setToast(null);
  }, []);

  const iconMap: Record<ToastType, React.ReactNode> = {
    info: <Info className="w-4 h-4 text-primary" />,
    error: <AlertTriangle className="w-4 h-4 text-rose-500" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  };

  const borderMap: Record<ToastType, string> = {
    info: "border-primary/20",
    error: "border-rose-200 dark:border-rose-500/30",
    success: "border-emerald-200 dark:border-emerald-500/30",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] max-w-[85%] w-full pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-2.5 bg-card/95 backdrop-blur-md text-foreground text-xs font-semibold py-3 px-4 rounded-2xl shadow-xl border ${borderMap[toast.type]}`}>
            {iconMap[toast.type]}
            <span className="flex-1">{toast.message}</span>
            <button onClick={dismiss} className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
