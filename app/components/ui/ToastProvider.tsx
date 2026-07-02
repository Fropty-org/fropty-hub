"use client";

import {
  createContext, useCallback, useContext, useRef, useState, type ReactNode,
} from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X, type LucideIcon } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id:      number;
  message: string;
  type:    ToastType;
  leaving: boolean;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, LucideIcon> = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
};

const COLORS: Record<ToastType, string> = {
  success: "var(--c-success)",
  error:   "var(--c-danger)",
  info:    "var(--primary)",
  warning: "var(--c-warning)",
};

const DURATION = 4500;

/**
 * Toast global do Hub. Montar uma vez por área (portal/admin); qualquer
 * client component descendente dispara com `useGlobalToast().show(...)`.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 250);
  }, []);

  const show = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId.current++;
    setToasts((ts) => [...ts.slice(-3), { id, message, type, leaving: false }]);
    setTimeout(() => dismiss(id), DURATION);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {toasts.length > 0 && (
        <div
          aria-live="polite"
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            display: "flex", flexDirection: "column", gap: 10,
            maxWidth: "min(360px, calc(100vw - 48px))",
          }}
        >
          {toasts.map((t) => {
            const Icon = ICONS[t.type];
            return (
              <div
                key={t.id}
                role="status"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 16px",
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderLeft: `3px solid ${COLORS[t.type]}`,
                  borderRadius: "var(--r-md)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  opacity: t.leaving ? 0 : 1,
                  transform: t.leaving ? "translateY(8px)" : "translateY(0)",
                  transition: "opacity 0.25s ease, transform 0.25s ease",
                  animation: "toastIn 0.25s ease both",
                }}
              >
                <Icon size={18} style={{ color: COLORS[t.type], flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text)", lineHeight: 1.45, flex: 1 }}>
                  {t.message}
                </p>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Fechar aviso"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 2, flexShrink: 0, display: "flex" }}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
          <style>{`@keyframes toastIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }`}</style>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useGlobalToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useGlobalToast deve ser usado dentro de <ToastProvider>");
  return ctx;
}

interface ActionFeedbackOpts {
  /** toast de sucesso (omitir para não exibir) */
  success?: string;
  /** fallback quando a action falha sem mensagem própria */
  error?: string;
}

/**
 * Padroniza o feedback de server actions que retornam `{ error?: string }`:
 * mostra a mensagem de erro da action (ou o fallback) em toast, e o toast
 * de sucesso quando informado. Retorna o resultado para o caller decidir o resto.
 */
export function useActionFeedback() {
  const { show } = useGlobalToast();
  const [pending, setPending] = useState(false);

  const run = useCallback(async <T extends { error?: string | null } | null | void>(
    action: () => Promise<T>,
    opts: ActionFeedbackOpts = {},
  ): Promise<T | undefined> => {
    setPending(true);
    try {
      const result = await action();
      const err = result && typeof result === "object" ? result.error : null;
      if (err) {
        show(err || opts.error || "Algo deu errado. Tente novamente.", "error");
      } else if (opts.success) {
        show(opts.success, "success");
      }
      return result;
    } catch {
      show(opts.error ?? "Algo deu errado. Tente novamente.", "error");
      return undefined;
    } finally {
      setPending(false);
    }
  }, [show]);

  return { run, pending };
}
