"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/app/components/ui/Toast";
import { adminDeleteUser } from "@/app/actions/admin";

interface Props {
  userId: string;
  name: string;
  email: string;
  role: "cliente" | "admin";
}

export function UserRowMenu({ userId, name, email, role }: Props) {
  const router = useRouter();
  const { show, ToastComponent } = useToast();
  const [open, setOpen]       = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  const who = name || email || "usuário";

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function doDelete() {
    const fd = new FormData();
    fd.set("user_id", userId);
    startTransition(async () => {
      const res = await adminDeleteUser(fd);
      if (res?.error) {
        show(res.error, "error");
      } else {
        show(`${who} foi excluído.`, "success");
        setConfirm(false);
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <div ref={ref} style={{ position: "relative", display: "flex", justifyContent: "center" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Ações"
        style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        <MoreHorizontal size={14} />
      </button>

      {open && !confirm && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 30, minWidth: 150, background: "var(--surface-elevated, var(--card-bg))", border: "1px solid var(--border)", borderRadius: 9, boxShadow: "var(--shadow-dropdown, 0 8px 24px rgba(0,0,0,0.18))", overflow: "hidden", padding: 4 }}>
          <button type="button" onClick={() => { setOpen(false); router.push(`/admin/usuarios/${userId}/editar`); }} style={menuItem}>
            <Pencil size={13} /> Editar
          </button>
          <button
            type="button"
            onClick={() => setConfirm(true)}
            disabled={role === "admin"}
            title={role === "admin" ? "Administradores não podem ser excluídos aqui" : "Excluir usuário"}
            style={{ ...menuItem, color: role === "admin" ? "var(--text-faint)" : "var(--c-danger)", cursor: role === "admin" ? "not-allowed" : "pointer" }}
          >
            <Trash2 size={13} /> Excluir
          </button>
        </div>
      )}

      {open && confirm && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 30, width: 240, background: "var(--surface-elevated, var(--card-bg))", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "var(--shadow-dropdown, 0 8px 24px rgba(0,0,0,0.18))", padding: 14 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <AlertTriangle size={15} style={{ color: "var(--c-danger)", flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text)", fontWeight: 600, lineHeight: 1.4 }}>
              Excluir <strong>{who}</strong> em definitivo? Todos os dados (chamados, projetos, tokens) serão removidos.
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setConfirm(false)} disabled={pending} style={{ padding: "5px 11px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "11.5px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Cancelar
            </button>
            <button type="button" onClick={doDelete} disabled={pending} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7, border: "none", background: "var(--c-danger)", color: "#fff", fontSize: "11.5px", fontWeight: 700, cursor: pending ? "wait" : "pointer", fontFamily: "inherit" }}>
              {pending ? <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> : <Trash2 size={12} />}
              Excluir
            </button>
          </div>
        </div>
      )}

      {ToastComponent}
    </div>
  );
}

const menuItem: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, width: "100%",
  padding: "7px 10px", borderRadius: 6, border: "none", background: "none",
  color: "var(--text)", fontSize: "12.5px", fontWeight: 600, cursor: "pointer",
  fontFamily: "inherit", textAlign: "left",
};
