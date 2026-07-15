"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { PortalThemeToggle } from "@/app/components/cliente/PortalThemeToggle";
import { useT } from "@/app/lib/i18n/I18nProvider";
import { UserCircle, LogOut, Loader2, Sun } from "lucide-react";

interface Props {
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string | null;
  roleLabel: string;
  profileHref: string;
  initialTheme?: "dark" | "light";
}

/**
 * Menu de conta no avatar do topo (canto superior direito) — fonte única do
 * perfil no Hub (identidade, Meu Perfil, tema e sair). Substitui o antigo menu
 * expansível do rodapé da sidebar.
 */
export function AccountMenu({ name, email, initials, avatarUrl, roleLabel, profileHref, initialTheme = "dark" }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [pending, startTrans] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  function handleSignOut() {
    startTrans(async () => {
      const result = await signOut();
      if (result?.redirectTo) window.location.href = result.redirectTo;
    });
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hub-topbar-avatar"
        aria-label={t("common.myProfile")}
        aria-expanded={open}
      >
        {avatarUrl
          ? <img src={avatarUrl} alt="" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : initials}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 60,
            width: 244, background: "var(--card-bg)", border: "1px solid var(--card-border)",
            borderRadius: 12, boxShadow: "var(--shadow-lg, 0 12px 32px rgba(0,0,0,0.22))", overflow: "hidden",
          }}
        >
          {/* Identidade */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 12px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: "var(--text)", flexShrink: 0, overflow: "hidden" }}>
              {avatarUrl ? <img src={avatarUrl} alt="" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
            </div>
            <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
              <p style={{ margin: "1px 0 0", fontSize: "11px", color: "var(--text-faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</p>
            </div>
          </div>

          {/* Conta */}
          <div style={{ padding: 6 }}>
            <Link href={profileHref} role="menuitem" onClick={() => setOpen(false)} className="hub-menu-item"
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 8, textDecoration: "none", color: "var(--text)", fontSize: "13.5px" }}>
              <UserCircle size={16} style={{ color: "var(--text-faint)" }} /> {t("common.myProfile")}
              <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--primary)" }}>{roleLabel}</span>
            </Link>
          </div>

          <div style={{ height: 1, background: "var(--border)" }} />

          {/* Preferências */}
          <div style={{ padding: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: "13.5px", color: "var(--text-muted)" }}>
                <Sun size={16} style={{ color: "var(--text-faint)" }} /> {t("common.theme")}
              </span>
              <PortalThemeToggle initialTheme={initialTheme} />
            </div>
          </div>

          <div style={{ height: 1, background: "var(--border)" }} />

          {/* Sair */}
          <div style={{ padding: 6 }}>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={pending}
              className="hub-menu-item"
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 8, border: "none", background: "none", cursor: pending ? "not-allowed" : "pointer", color: "var(--c-danger)", fontSize: "13.5px", fontWeight: 600, fontFamily: "inherit", opacity: pending ? 0.6 : 1 }}
            >
              {pending ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <LogOut size={16} />}
              {pending ? t("common.signingOut") : t("common.signOut")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
