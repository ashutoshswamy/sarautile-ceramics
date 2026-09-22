"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { gsap, useGSAP, useHoverTween } from "@/lib/gsap";

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
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const dismissRef = useRef<HTMLButtonElement>(null);

  useGSAP(() => {
    if (!ref.current) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 8, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: "power3.out" }
      );
    });
    return () => mm.revert();
  }, []);

  useHoverTween(dismissRef, { opacity: 1 }, { opacity: 0.7 });

  return (
    <div
      ref={ref}
      role="status"
      style={{ boxShadow: "var(--shadow-card)" }}
      className={`flex w-full max-w-sm items-start gap-2.5 rounded-2xl border px-4 py-3 ${
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
        ref={dismissRef}
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 cursor-pointer"
      >
        <X size={15} strokeWidth={1.8} />
      </button>
    </div>
  );
}
