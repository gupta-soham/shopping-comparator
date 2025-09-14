"use client";

import * as React from "react";
import { Toast, ToastViewport } from "./toast";
import type { ToastActionElement } from "./toast";

export type ToastVariant = "default" | "destructive";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
  action?: ToastActionElement;
}

type ToastContextValue = {
  pushToast: (t: Omit<ToastItem, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const pushToast = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, durationMs: 3500, variant: "default", ...t };
    setToasts((prev) => [item, ...prev]);
    const duration = item.durationMs ?? 3500;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, duration);
    }
  }, []);

  const value = React.useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} />
    </ToastContext.Provider>
  );
};

export const Toaster: React.FC<{ toasts: ToastItem[] }> = ({ toasts }) => {
  return (
    <div>
      <ToastViewport />
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-[420px] flex-col gap-2">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            title={t.title}
            description={t.description}
            variant={t.variant}
            action={t.action}
          />
        ))}
      </div>
    </div>
  );
};
