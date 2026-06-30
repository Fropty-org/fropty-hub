"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { signOut } from "../../actions/auth";
import { PortalThemeToggle } from "./PortalThemeToggle";
import type { ClientUser } from "../../lib/types/cliente";
import { PORTAL_NAV_ITEMS } from "../../lib/constants/portal-nav";
import {
  LayoutDashboard, MessageCircle, CreditCard, UserCircle, BookOpen, Map,
  MessageSquarePlus, FolderKanban, FileSignature, LogOut, Loader2,
  Menu, X, PanelLeftClose, PanelLeftOpen, Search, Coins, Sparkles,
  MessagesSquare, LayoutGrid, CalendarDays,
} from "lucide-react";
import Image from "next/image";

interface NavItem {
  id:     string;
  href:   string;
  icon:   string;
  label:  string;
  badge?: number;
}

interface Props {
  user:          ClientUser;
  navItems?:     NavItem[];
  initialTheme?: "dark" | "light";
}

const DEFAULT_NAV: NavItem[] = PORTAL_NAV_ITEMS;

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard, MessageCircle, CreditCard, UserCircle, BookOpen, Map,
  MessageSquarePlus, FolderKanban, FileSignature, Sparkles,
  MessagesSquare, LayoutGrid, CalendarDays,
};

function NavIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name];
  return Icon ? <Icon size={size} /> : null;
}

const PLAN_LABEL: Record<string, string> = { basico: "BÃ¡sico", pro: "Pro", sem_plano: "Sem plano" };

export function ClientSidebar({ user, navItems, initialTheme = "dark" }: Props) {
  const pathname              = usePathname();
  const nav                   = navItems ?? DEFAULT_NAV;
  const [pending, startTrans] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hub-sidebar-collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("hub-sidebar-collapsed", next ? "1" : "0");
  }

  function handleSignOut() {
    startTrans(async () => {
      const result = await signOut();
      if (result?.redirectTo) window.location.href = result.redirectTo;
    });
  }

  const W = collapsed ? 60 : 224;
  const planKey   = (user.plan ?? "sem_plano") as string;
  const planLabel = PLAN_LABEL[planKey] ?? planKey;
  const hasPlan   = planKey !== "sem_plano";

  const sidebar = (
    <aside
      className={`portal-sidebar${mobileOpen ? " open" : ""}`}
      style={{ width: W, transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden" }}
    >
      {/* Close button â€” mobile only */}
      <button
        className="portal-sidebar-close"
        onClick={() => setMobileOpen(false)}
        aria-label="Fechar menu"
        style={{
          position: "absolute", top: 14, right: 14, width: 28, height: 28,
          borderRadius: "var(--r-sm)", border: "1px solid var(--border)",
          background: "var(--surface-2)", cursor: "pointer", color: "var(--text-faint)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <X size={13} />
      </button>

      <div style={{
        display: "flex", flexDirection: "column", height: "100%",
        padding: collapsed ? "16px 0" : "16px 12px",
        transition: "padding 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
      }}>

        {/* â”€â”€ Header: logo + collapse toggle â”€â”€ */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          marginBottom: 20, paddingLeft: collapsed ? 0 : 2,
          flexShrink: 0,
        }}>
          <Link href="/portal/dashboard" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", overflow: "hidden" }}>
            <Image
              src="/favicon.svg"
              alt="Fropty Hub"
              width={28}
              height={28}
              unoptimized
              style={{ flexShrink: 0 }}
            />
            <span style={{
              fontSize: "14px", fontWeight: 700, color: "var(--text)",
              whiteSpace: "nowrap", letterSpacing: "-0.01em",
              opacity: collapsed ? 0 : 1,
              maxWidth: collapsed ? 0 : 160,
              transition: "opacity 0.18s, max-width 0.22s",
              overflow: "hidden",
            }}>
              Fropty<span style={{ background: "linear-gradient(90deg,#e040fb,#7c3aed,#2563eb,#16a34a,#ea580c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Hub</span>
            </span>
          </Link>

          {!collapsed && (
            <button
              onClick={toggleCollapse}
              title="Recolher menu"
              className="portal-sidebar-toggle"
              style={{
                width: 26, height: 26, borderRadius: "var(--r-sm)",
                border: "1px solid var(--border)", background: "var(--surface-2)",
                cursor: "pointer", color: "var(--text-faint)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PanelLeftClose size={13} />
            </button>
          )}

          {collapsed && (
            <button
              onClick={toggleCollapse}
              title="Expandir menu"
              style={{
                width: 30, height: 30, borderRadius: "var(--r-sm)",
                border: "1px solid var(--border)", background: "var(--surface-2)",
                cursor: "pointer", color: "var(--text-faint)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <PanelLeftOpen size={13} />
            </button>
          )}
        </div>

        {/* â”€â”€ Search â”€â”€ */}
        {!collapsed ? (
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, metaKey: true, bubbles: true }))}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "7px 10px", marginBottom: 10,
              background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: "var(--r-md)", cursor: "pointer", color: "var(--text-faint)",
              fontSize: "12px", fontFamily: "inherit", textAlign: "left",
              transition: "border-color 0.15s", flexShrink: 0,
            }}
          >
            <Search size={13} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>Buscarâ€¦</span>
            <kbd style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 3, padding: "1px 5px", fontSize: "10px", fontFamily: "inherit", lineHeight: "15px" }}>âŒ˜K</kbd>
          </button>
        ) : (
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, metaKey: true, bubbles: true }))}
            title="Buscar (Ctrl+K)"
            style={{
              width: 32, height: 32, borderRadius: "var(--r-md)", marginBottom: 8, alignSelf: "center",
              background: "var(--surface-2)", border: "1px solid var(--border)",
              cursor: "pointer", color: "var(--text-faint)", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Search size={14} />
          </button>
        )}

        {/* â”€â”€ Nav â”€â”€ */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {nav.map(({ id, href, icon, label, badge }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={id}
                href={href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: collapsed ? 0 : 9,
                  padding: collapsed ? "10px 0" : "8px 10px",
                  borderRadius: "var(--r-md)",
                  fontSize: "13px", fontWeight: active ? 600 : 500,
                  textDecoration: "none",
                  color: active ? "var(--sidebar-item-active-text)" : "var(--text-muted)",
                  background: active ? "var(--sidebar-item-active)" : "transparent",
                  borderLeft: active && !collapsed ? "2px solid var(--primary)" : "2px solid transparent",
                  paddingLeft: active && !collapsed ? 9 : 10,
                  transition: "background 0.12s, color 0.12s",
                  position: "relative", whiteSpace: "nowrap", overflow: "hidden",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "var(--sidebar-item-hover)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                  }
                }}
              >
                <span style={{ flexShrink: 0, display: "flex", opacity: active ? 1 : 0.65 }}>
                  <NavIcon name={icon} size={16} />
                </span>
                {!collapsed && <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>}
                {!collapsed && badge != null && badge > 0 && (
                  <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: "var(--r-full)", background: "var(--primary)", color: "#fff", fontSize: 10, fontWeight: 800, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
                {collapsed && badge != null && badge > 0 && (
                  <span style={{ position: "absolute", top: 7, right: 9, width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* â”€â”€ Footer: theme + user + logout â”€â”€ */}
        <div style={{ flexShrink: 0, marginTop: 8 }}>
          <div style={{ height: 1, background: "var(--border)", marginBottom: 8 }} />

          {/* Theme row â€” only when expanded */}
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 10px", marginBottom: 4 }}>
              <span style={{ fontSize: "12px", color: "var(--text-faint)", fontWeight: 500 }}>Tema</span>
              <PortalThemeToggle initialTheme={initialTheme} />
            </div>
          )}

          {/* User row (Aceternity pattern) */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: collapsed ? "6px 0" : "7px 10px",
            borderRadius: "var(--r-md)",
            gap: 8,
          }}>
            {/* Avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              background: "var(--surface-2)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: 700, color: "var(--text)",
            }}
              title={collapsed ? user.name : undefined}
            >
              {user.avatarInitials}
            </div>

            {/* Name + plan â€” expanded */}
            {!collapsed && (
              <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "12.5px", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.name}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                  <span style={{
                    fontSize: "10px", fontWeight: 700,
                    color: hasPlan ? "var(--primary)" : "var(--text-faint)",
                    background: hasPlan ? "rgba(91,87,232,0.10)" : "var(--surface-3)",
                    border: `1px solid ${hasPlan ? "rgba(91,87,232,0.20)" : "var(--border)"}`,
                    borderRadius: "var(--r-full)", padding: "1px 7px",
                  }}>
                    {planLabel}
                  </span>
                  {user.tokenBalance != null && user.tokenBalance > 0 && (
                    <span style={{ fontSize: "10px", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 2 }}>
                      <Coins size={9} />{user.tokenBalance}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Logout â€” expanded */}
            {!collapsed && (
              <button
                onClick={handleSignOut}
                disabled={pending}
                title="Sair"
                style={{
                  width: 28, height: 28, borderRadius: "var(--r-sm)",
                  border: "1px solid var(--border)", background: "var(--surface-2)",
                  cursor: pending ? "not-allowed" : "pointer",
                  color: "var(--text-faint)", opacity: pending ? 0.5 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "color 0.12s, background 0.12s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--c-danger)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--c-danger)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-faint)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                }}
              >
                {pending ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <LogOut size={13} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="portal-topbar">
        <button onClick={() => setMobileOpen(true)} aria-label="Abrir menu" style={{ width: 36, height: 36, borderRadius: "var(--r-md)", background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Menu size={17} />
        </button>
        <Link href="/portal/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flex: 1 }}>
          <Image src="/favicon.svg" alt="Fropty Hub" width={22} height={22} unoptimized />
          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
            Fropty<span style={{ background: "linear-gradient(90deg,#e040fb,#7c3aed,#2563eb,#16a34a,#ea580c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Hub</span>
          </span>
        </Link>
        <PortalThemeToggle initialTheme={initialTheme} />
      </div>

      {/* Overlay mobile */}
      <div className={`portal-overlay${mobileOpen ? " open" : ""}`} onClick={() => setMobileOpen(false)} aria-hidden />

      {sidebar}
    </>
  );
}

