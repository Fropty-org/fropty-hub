"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Loader2, AlertTriangle, CalendarCheck } from "lucide-react";
import { useToast } from "@/app/components/ui/Toast";
import { useT } from "@/app/lib/i18n/I18nProvider";
import { adminDeleteUser, adminRenewAccess } from "@/app/actions/admin";

interface Props {
  userId: string;
  name: string;
  email: string;
  role: "cliente" | "admin";
}

export function UserRowMenu({ userId, name, email, role }: Props) {
  const t = useT();
  const router = useRouter();
  const { show, ToastComponent } = useToast();
  const [open, setOpen]       = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [pos, setPos]         = useState<{ top: number; right: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  const who = name || email || "usuário";

  function openMenu() {
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 4, right: Math.max(8, window.innerWidth - r.right) });
    setConfirm(false);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !panelRef.current?.contains(t)) { setOpen(false); setConfirm(false); }
    }
    function close() { setOpen(false); setConfirm(false); }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  function doDelete() {
    const fd = new FormData();
    fd.set("user_id", userId);
    startTransition(async () => {
      const res = await adminDeleteUser(fd);
      if (res?.error) {
        show(res.error, "error");
      } else {
        show(t("admin.users.menu.deleted", { who }), "success");
        setConfirm(false);
        setOpen(false);
        router.refresh();
      }
    });
  }

  function renew() {
    const fd = new FormData();
    fd.set("user_id", userId);
    fd.set("days", "30");
    setOpen(false);
    startTransition(async () => {
      const res = await adminRenewAccess(fd);
      if (res?.error) show(res.error, "error");
      else { show(t("admin.users.menu.renewed", { who }), "success"); router.refresh(); }
    });
  }

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? (setOpen(false), setConfirm(false)) : openMenu())}
        title={t("admin.users.menu.actions")}
        style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        <MoreHorizontal size={14} />
      </button>

      {open && pos && typeof document !== "undefined" && createPortal(
        !confirm ? (
          <div ref={panelRef} style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 1000, minWidth: 150, background: "var(--surface-elevated, var(--card-bg))", border: "1px solid var(--border)", borderRadius: 9, boxShadow: "var(--shadow-dropdown, 0 8px 24px rgba(0,0,0,0.18))", overflow: "hidden", padding: 4 }}>
            <button type="button" onClick={() => { setOpen(false); router.push(`/admin/usuarios/${userId}/editar`); }} style={menuItem}>
              <Pencil size={13} /> {t("admin.users.menu.edit")}
            </button>
            {role === "cliente" && (
              <button type="button" onClick={renew} disabled={pending} style={menuItem} title={t("admin.users.menu.renewTitle")}>
                <CalendarCheck size={13} /> {t("admin.users.menu.renew")}
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirm(true)}
              disabled={role === "admin"}
              title={role === "admin" ? t("admin.users.menu.cannotDeleteAdmin") : t("admin.users.menu.deleteTitle")}
              style={{ ...menuItem, color: role === "admin" ? "var(--text-faint)" : "var(--c-danger)", cursor: role === "admin" ? "not-allowed" : "pointer" }}
            >
              <Trash2 size={13} /> {t("admin.users.menu.delete")}
            </button>
          </div>
        ) : (
          <div ref={panelRef} style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 1000, width: 240, background: "var(--surface-elevated, var(--card-bg))", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "var(--shadow-dropdown, 0 8px 24px rgba(0,0,0,0.18))", padding: 14 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <AlertTriangle size={15} style={{ color: "var(--c-danger)", flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text)", fontWeight: 600, lineHeight: 1.4 }}>
                {t("admin.users.menu.confirm", { who })}
              </p>
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setConfirm(false)} disabled={pending} style={{ padding: "5px 11px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "11.5px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {t("admin.users.menu.cancel")}
              </button>
              <button type="button" onClick={doDelete} disabled={pending} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7, border: "none", background: "var(--c-danger)", color: "#fff", fontSize: "11.5px", fontWeight: 700, cursor: pending ? "wait" : "pointer", fontFamily: "inherit" }}>
                {pending ? <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> : <Trash2 size={12} />}
                {t("admin.users.menu.delete")}
              </button>
            </div>
          </div>
        ),
        document.body,
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
