"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { signOut } from "../../actions/auth";
import { PortalThemeToggle } from "./PortalThemeToggle";
import type { ClientUser } from "../../lib/types/cliente";
import {
  LayoutDashboard, MessageCircle, CreditCard, UserCircle, BookOpen, Map, MessageSquarePlus,
  FolderKanban, FileSignature,
  ChevronRight, ChevronLeft, X, Menu, LogOut, Loader2,
} from "lucide-react";

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
  initialTheme?: "dark" | "light";
}

const DEFAULT_NAV: NavItem[] = [
  { id: "dashboard",        href: "/portal/dashboard",        icon: "LayoutDashboard",    label: "Painel" },
  { id: "suporte",          href: "/portal/suporte",          icon: "MessageCircle",      label: "Suporte" },
  { id: "projetos",         href: "/portal/projetos",         icon: "FolderKanban",       label: "Projetos" },
  { id: "contratos",        href: "/portal/contratos",        icon: "FileSignature",      label: "Contratos" },
  { id: "financeiro",       href: "/portal/financeiro",       icon: "CreditCard",         label: "Financeiro" },
  { id: "roadmap",          href: "/portal/roadmap",          icon: "Map",                label: "Roadmap" },
  { id: "feedback",         href: "/portal/feedback",         icon: "MessageSquarePlus",  label: "Feedback" },
  { id: "base-conhecimento",href: "/portal/base-conhecimento",icon: "BookOpen",           label: "Base de Conhecimento" },
  { id: "perfil",           href: "/portal/perfil",           icon: "UserCircle",         label: "Meu Perfil" },
];

const LUCIDE_NAV_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard, MessageCircle, CreditCard, UserCircle, BookOpen, Map, MessageSquarePlus,
  FolderKanban, FileSignature,
};

function NavIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = LUCIDE_NAV_ICONS[name];
  if (!Icon) return null;
  return <Icon size={size} />;
}

const COLLAPSED_W = 56;
const EXPANDED_W  = 220;

export function ClientSidebar({ user, navItems, initialTheme = "dark" }: Props) {
  const pathname = usePathname();
  const NAV      = navItems ?? DEFAULT_NAV;
  const [pending,    startTransition] = useTransition();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [collapsed,  setCollapsed]    = useState(false);

  // Persiste o estado collapsed no localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", next ? "1" : "0");
  }

  const w = collapsed ? COLLAPSED_W : EXPANDED_W;

  const sidebarContent = (
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
        {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
      </button>

      {/* Close button — mobile only */}
      <button
        className="portal-sidebar-close"
        onClick={() => setMobileOpen(false)}
        aria-label="Fechar menu"
      >
        <X size={14} />
      </button>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", marginBottom: 24 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", minWidth: 0 }}>
          <Image src="/hub-logo.png" alt="FroptyHub" width={26} height={26} className="rounded-md" style={{ flexShrink: 0 }} />
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", whiteSpace: "nowrap" }}>
              Fropty<span style={{ color: "var(--primary)" }}>Hub</span>
            </span>
          )}
        </Link>
      </div>

      {/* User section */}
      {collapsed ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 20 }}>
          {/* Iniciais */}
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--primary)", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>
            {user.avatarInitials}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--primary)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {user.avatarInitials}
            </div>
            <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
              <p title={user.name} style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name}
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.plan ? `Plano ${user.plan === "pro" ? "Pro" : "Basico"}` : "Sem plano"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {NAV.map(({ id, href, icon, label, badge }) => {
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
                background: isActive ? "rgba(91,87,232,0.15)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--text-muted)",
                transition: "background 0.15s, color 0.15s",
                position: "relative",
              }}
            >
              <NavIcon name={icon} size={18} />
              {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
              {!collapsed && badge != null && badge > 0 && (
                <span style={{
                  minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999,
                  background: "var(--primary)", color: "#fff",
                  fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                }}>
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
              {collapsed && badge != null && badge > 0 && (
                <span style={{
                  position: "absolute", top: 6, right: 6,
                  width: 8, height: 8, borderRadius: "50%",
                  background: "var(--primary)",
                }} />
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
        {pending ? <Loader2 size={collapsed ? 18 : 16} style={{ animation: "spin 1s linear infinite" }} /> : <LogOut size={collapsed ? 18 : 16} />}
        {!collapsed && (pending ? "Saindo..." : "Sair")}
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
          <Menu size={18} />
        </button>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none", flex: 1 }}>
          <Image src="/hub-logo.png" alt="FroptyHub" width={22} height={22} className="rounded-md" />
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>
            Fropty<span style={{ color: "var(--primary)" }}>Hub</span>
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
