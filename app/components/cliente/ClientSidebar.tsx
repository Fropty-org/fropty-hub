"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { PortalThemeToggle } from "./PortalThemeToggle";
import type { ClientUser } from "../../lib/types/cliente";
import { PORTAL_NAV_ITEMS, PORTAL_NAV_GROUPS } from "../../lib/constants/portal-nav";
import {
  LayoutDashboard, MessageCircle, CreditCard, UserCircle, BookOpen, Map,
  MessageSquarePlus, FolderKanban, FileSignature,
  Menu, X, PanelLeftClose, PanelLeftOpen, Search, Sparkles,
  MessagesSquare, LayoutGrid, CalendarDays,
} from "lucide-react";
import Image from "next/image";

interface NavItem {
  id:     string;
  href:   string;
  icon:   string;
  label:  string;
  badge?: number;
  group?: string;
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

export function ClientSidebar({ navItems, initialTheme = "dark" }: Props) {
  const pathname              = usePathname();
  const nav                   = navItems ?? DEFAULT_NAV;
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

  const W = collapsed ? 60 : 224;

  const sidebar = (
    <aside
      className={`portal-sidebar${mobileOpen ? " open" : ""}`}
      style={{ width: W, transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden" }}
    >
      {/* Close button — mobile only */}
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

        {/* ── Header: logo + collapse toggle ── */}
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
              Fropty<span style={{ color: "var(--ac)" }}>Hub</span>
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

        {/* ── Search ── */}
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
            <span style={{ flex: 1 }}>Buscar…</span>
            <kbd style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 3, padding: "1px 5px", fontSize: "10px", fontFamily: "inherit", lineHeight: "15px" }}>⌘K</kbd>
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

        {/* ── Nav ── */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {Object.entries(
            nav.reduce<Record<string, NavItem[]>>((acc, item) => {
              const g = item.group ?? "principal";
              (acc[g] ??= []).push(item);
              return acc;
            }, {})
          ).map(([groupKey, items]) => (
            <div key={groupKey} style={{ marginBottom: collapsed ? 4 : 6 }}>
              {!collapsed && (
                <p style={{ fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-faint)", padding: "0 10px", margin: "8px 0 4px" }}>
                  {PORTAL_NAV_GROUPS[groupKey] ?? groupKey}
                </p>
              )}
              {items.map(({ id, href, icon, label, badge }) => {
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
                  color: active ? "var(--sidebar-active-text)" : "var(--text-muted)",
                  background: active ? "var(--sidebar-active-bg)" : "transparent",
                  paddingLeft: 10,
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
            </div>
          ))}
        </nav>

        {/* O perfil/menu de conta (identidade, plano/tokens, tema, sair) vive no
            avatar do topo (AccountMenu, HubTopbar). Rodapé removido para não duplicar. */}
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
            Fropty<span style={{ color: "var(--ac)" }}>Hub</span>
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

