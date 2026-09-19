"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";
type Toast = { id: number; message: string; type: ToastType };

const ToastContext = createContext<((message: string, type?: ToastType) => void) | null>(null);

export function useToast() {
  const push = useContext(ToastContext);
  if (!push) throw new Error("useToast must be used within <ToastProvider>");
  return push;
}

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = nextId.current++;
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  return (
    <ToastContext value={push}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 px-4 pb-6 sm:items-end sm:pr-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            style={{ boxShadow: "var(--shadow-card)" }}
            className={`toast-in flex w-full max-w-sm items-start gap-2.5 rounded-2xl border px-4 py-3 ${
              toast.type === "error"
                ? "bg-warn-bg border-transparent text-warn-ink"
                : "bg-ink border-transparent text-paper"
            }`}
          >
            {toast.type === "error" ? (
              <XCircle size={18} strokeWidth={1.8} className="mt-0.5 shrink-0" aria-hidden />
            ) : (
              <CheckCircle2 size={18} strokeWidth={1.8} className="mt-0.5 shrink-0" aria-hidden />
            )}
            <p className="flex-1 text-sm leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="shrink-0 opacity-70 transition-opacity hover:opacity-100 cursor-pointer"
            >
              <X size={15} strokeWidth={1.8} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}
