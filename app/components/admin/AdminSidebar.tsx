"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTransition, useState } from "react";
import { signOut } from "@/app/actions/auth";
import { PortalThemeToggle } from "@/app/components/cliente/PortalThemeToggle";
import { NotificationBell } from "@/app/components/NotificationBell";

const NAV = [
  { id: "overview",   href: "/admin/overview",   icon: "ti-layout-dashboard", label: "Visão Geral" },
  { id: "usuarios",   href: "/admin/usuarios",   icon: "ti-users",            label: "Usuários" },
  { id: "projetos",   href: "/admin/projetos",   icon: "ti-folder",           label: "Projetos" },
  { id: "financeiro", href: "/admin/financeiro", icon: "ti-credit-card",      label: "Financeiro" },
  { id: "analytics",  href: "/admin/analytics",  icon: "ti-chart-bar",        label: "Analytics" },
  { id: "audit",      href: "/admin/audit",      icon: "ti-shield-check",     label: "Auditoria" },
  { id: "perfil",     href: "/portal/perfil",    icon: "ti-user-circle",      label: "Meu Perfil" },
];

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
          <Image src="/logo-icon.png" alt="Fropty" width={22} height={22} className="rounded-md" />
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
          width: 220,
          minHeight: "100vh",
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <button
          className="portal-sidebar-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
        >
          <i className="ti ti-x" />
        </button>

        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, textDecoration: "none" }}>
          <Image src="/logo-icon.png" alt="Fropty" width={26} height={26} className="rounded-md" />
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>
            Fropty<span style={{ color: "#EF9F27" }}>Admin</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, padding: "12px", background: "var(--surface-2)", borderRadius: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EF9F27", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {name.split(" ")[0]}
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#EF9F27" }}>Administrador</p>
          </div>
          <NotificationBell userId={userId} />
          <PortalThemeToggle initialTheme={initialTheme} />
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV.map(({ id, href, icon, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={id}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 9,
                  fontSize: "13px", fontWeight: 600, textDecoration: "none",
                  background: isActive ? "rgba(239,159,39,0.12)" : "transparent",
                  color: isActive ? "#EF9F27" : "var(--text-muted)",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <i className={`ti ${icon}`} style={{ fontSize: 16 }} />
                {label}
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
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 12px", borderRadius: 9,
            fontSize: "13px", fontWeight: 600,
            color: "var(--text-faint)", background: "none", border: "none",
            cursor: "pointer", opacity: pending ? 0.6 : 1, marginTop: 8,
            fontFamily: "inherit", width: "100%", textAlign: "left",
          }}
        >
          <i className={`ti ${pending ? "ti-loader-2" : "ti-logout"}`} style={{ fontSize: 16 }} />
          {pending ? "Saindo..." : "Sair"}
        </button>
      </aside>
    </>
  );
}
