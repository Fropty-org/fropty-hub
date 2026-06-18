"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTransition, useState } from "react";
import { signOut } from "../../actions/auth";
import { AvatarUpload } from "./AvatarUpload";
import { PortalThemeToggle } from "./PortalThemeToggle";
import { NotificationBell } from "@/app/components/NotificationBell";
import type { ClientUser } from "../../lib/types/cliente";

interface NavItem {
  id: string;
  href: string;
  icon: string;
  label: string;
  badge?: number;
}

interface Props {
  user: ClientUser;
  navItems?:     NavItem[];
  avatarUrl?:    string | null;
  initialTheme?: "dark" | "light";
}

const DEFAULT_NAV: NavItem[] = [
  { id: "dashboard", href: "/area-cliente/dashboard", icon: "ti-layout-dashboard", label: "Painel" },
  { id: "tokens",    href: "/area-cliente/tokens",    icon: "ti-coins",             label: "Tokens" },
];

export function ClientSidebar({ user, navItems, avatarUrl, initialTheme = "dark" }: Props) {
  const pathname = usePathname();
  const NAV = navItems ?? DEFAULT_NAV;
  const [pending,    startTransition] = useTransition();
  const [mobileOpen, setMobileOpen]   = useState(false);

  const sidebarContent = (
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
      {/* Close button — mobile only */}
      <button
        className="portal-sidebar-close"
        onClick={() => setMobileOpen(false)}
        aria-label="Fechar menu"
      >
        <i className="ti ti-x" />
      </button>

      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, textDecoration: "none" }}>
        <Image src="/logo-icon.png" alt="Fropty Apps" width={26} height={26} className="rounded-md" />
        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>
          Fropty<span style={{ color: "var(--primary)" }}>Apps</span>
        </span>
      </Link>

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 12 }}>
        <AvatarUpload userId={user.id} currentUrl={avatarUrl ?? null} initials={user.avatarInitials} size={36} />
        <div style={{ overflow: "hidden", flex: 1 }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user.name.split(" ")[0]}
          </p>
          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user.plan ? `Plano ${user.plan === "pro" ? "Pro" : "Básico"}` : "Sem plano"}
          </p>
        </div>
        <NotificationBell userId={user.id} />
        <PortalThemeToggle initialTheme={initialTheme} />
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {NAV.map(({ id, href, icon, label, badge }) => {
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
                background: isActive ? "rgba(91,87,232,0.15)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--text-muted)",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <i className={`ti ${icon}`} style={{ fontSize: 16 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge != null && badge > 0 && (
                <span style={{
                  minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999,
                  background: "var(--primary)", color: "#fff",
                  fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                }}>
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
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
          cursor: pending ? "not-allowed" : "pointer",
          opacity: pending ? 0.6 : 1, marginTop: 8,
          fontFamily: "inherit", width: "100%", textAlign: "left",
        }}
      >
        <i className={`ti ${pending ? "ti-loader-2" : "ti-logout"}`} style={{ fontSize: 16 }} />
        {pending ? "Saindo..." : "Sair"}
      </button>
    </aside>
  );

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
            Fropty<span style={{ color: "var(--primary)" }}>Apps</span>
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

      {sidebarContent}
    </>
  );
}
