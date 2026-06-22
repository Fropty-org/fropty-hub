"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { signOut } from "@/app/actions/auth";
import { PortalThemeToggle } from "@/app/components/cliente/PortalThemeToggle";
import { NotificationBell } from "@/app/components/NotificationBell";

const NAV = [
  { id: "overview",   href: "/admin/overview",   icon: "ti-layout-dashboard", label: "Visão Geral" },
  { id: "usuarios",   href: "/admin/usuarios",   icon: "ti-users",            label: "Usuários" },
  { id: "financeiro", href: "/admin/financeiro", icon: "ti-credit-card",      label: "Financeiro" },
  { id: "suporte",    href: "/portal/suporte",   icon: "ti-message-circle",   label: "Suporte" },
  { id: "analytics",  href: "/admin/analytics",  icon: "ti-chart-bar",        label: "Analytics" },
  { id: "audit",      href: "/admin/audit",      icon: "ti-shield-check",     label: "Auditoria" },
  { id: "perfil",     href: "/admin/perfil",     icon: "ti-user-circle",      label: "Meu Perfil" },
];

const COLLAPSED_W = 56;
const EXPANDED_W  = 220;

interface Props {
  name: string;
  initials: string;
  userId: string;
  initialTheme?: "dark" | "light";
}

export function AdminSidebar({ name, initials, userId, initialTheme = "dark" }: Props) {
  const pathname = usePathname();
  const [pending,    startTransition] = useTransition();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [collapsed,  setCollapsed]    = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("admin-sidebar-collapsed", next ? "1" : "0");
  }

  const w = collapsed ? COLLAPSED_W : EXPANDED_W;

  return (
    <>
      {/* Mobile topbar */}
      <div className="portal-topbar">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          style={{
            width: 36, height: 36, borderRadius: 9,
            background: "var(--surface)", border: "1px solid var(--border)",
            cursor: "pointer", color: "var(--text-muted)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <i className="ti ti-menu-2" style={{ fontSize: 18 }} />
        </button>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none", flex: 1 }}>
          <Image src="/logo-icon.png" alt="Fropty" width={22} height={22} className="rounded-md portal-logo--dark" />
          <Image src="/logo-icon-dark.png" alt="Fropty" width={22} height={22} className="rounded-md portal-logo--light" />
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>
            Fropty<span style={{ color: "#EF9F27" }}>Admin</span>
          </span>
        </Link>
        <PortalThemeToggle initialTheme={initialTheme} />
      </div>

      {/* Overlay */}
      <div
        className={`portal-overlay${mobileOpen ? " open" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />

      <aside
        className={`portal-sidebar${mobileOpen ? " open" : ""}`}
        style={{
          width: w,
          minHeight: "100vh",
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: collapsed ? "20px 0" : "24px 16px",
          flexShrink: 0,
          position: "relative",
          transition: "width 0.2s ease, padding 0.2s ease",
          overflow: "visible",
        }}
      >
        {/* Aba de collapse na borda direita — apenas desktop */}
        <button
          onClick={toggleCollapse}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className="portal-sidebar-toggle"
          style={{
            position: "absolute",
            top: "50%",
            right: -12,
            transform: "translateY(-50%)",
            width: 12,
            height: 48,
            borderRadius: "0 6px 6px 0",
            border: "1px solid var(--border)",
            borderLeft: "none",
            background: "var(--surface-2)",
            cursor: "pointer",
            color: "var(--text-faint)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            padding: 0,
            transition: "background 0.15s, color 0.15s",
          }}
        >
          <i
            className={`ti ${collapsed ? "ti-chevron-right" : "ti-chevron-left"}`}
            style={{ fontSize: 10 }}
          />
        </button>

        <button
          className="portal-sidebar-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
        >
          <i className="ti ti-x" />
        </button>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", minWidth: 0 }}>
            <Image src="/logo-icon.png" alt="Fropty" width={26} height={26} className="rounded-md portal-logo--dark" style={{ flexShrink: 0 }} />
            <Image src="/logo-icon-dark.png" alt="Fropty" width={26} height={26} className="rounded-md portal-logo--light" style={{ flexShrink: 0 }} />
            {!collapsed && (
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", whiteSpace: "nowrap" }}>
                Fropty<span style={{ color: "#EF9F27" }}>Admin</span>
              </span>
            )}
          </Link>
        </div>

        {/* User section */}
        {collapsed ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#EF9F27", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {initials}
            </div>
            <NotificationBell userId={userId} />
            <PortalThemeToggle initialTheme={initialTheme} />
          </div>
        ) : (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", background: "var(--surface-2)", borderRadius: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EF9F27", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                <p title={name} style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {name}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "#EF9F27" }}>Administrador</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 8 }}>
              <NotificationBell userId={userId} />
              <PortalThemeToggle initialTheme={initialTheme} />
            </div>
          </div>
        )}

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV.map(({ id, href, icon, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={id}
                href={href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: collapsed ? 0 : 10,
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "10px 0" : "9px 12px",
                  borderRadius: 9,
                  fontSize: "13px", fontWeight: 600, textDecoration: "none",
                  background: isActive ? "rgba(239,159,39,0.12)" : "transparent",
                  color: isActive ? "#EF9F27" : "var(--text-muted)",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <i className={`ti ${icon}`} style={{ fontSize: collapsed ? 18 : 16, flexShrink: 0 }} />
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => startTransition(async () => {
            const result = await signOut();
            if (result?.redirectTo) window.location.href = result.redirectTo;
          })}
          disabled={pending}
          title={collapsed ? "Sair" : undefined}
          style={{
            display: "flex", alignItems: "center",
            gap: collapsed ? 0 : 8,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "10px 0" : "9px 12px",
            borderRadius: 9,
            fontSize: "13px", fontWeight: 600,
            color: "var(--text-faint)", background: "none", border: "none",
            cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.6 : 1, marginTop: 8,
            fontFamily: "inherit", width: "100%", textAlign: "left",
          }}
        >
          <i className={`ti ${pending ? "ti-loader-2" : "ti-logout"}`} style={{ fontSize: collapsed ? 18 : 16 }} />
          {!collapsed && (pending ? "Saindo..." : "Sair")}
        </button>
      </aside>
    </>
  );
}
