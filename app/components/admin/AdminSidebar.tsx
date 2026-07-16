"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { PortalThemeToggle } from "@/app/components/cliente/PortalThemeToggle";
import { useT } from "@/app/lib/i18n/I18nProvider";
import {
  LayoutDashboard, Users, CreditCard, MessageCircle, BarChart2, ShieldCheck,
  BookOpen, Map, MessageSquarePlus, FolderKanban, FileSignature,
  HeartPulse, Menu, PanelLeftClose,
  ChevronDown, UserPlus, ListFilter,
  LayoutGrid, CalendarDays,
} from "lucide-react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";

type SubItem = { id: string; href: string; label: string; Icon?: LucideIcon };
type NavItem = { id: string; href: string; Icon: LucideIcon; label: string; group?: string; subItems?: SubItem[] };

const NAV: NavItem[] = [
  { id: "overview",          href: "/admin/overview",          Icon: LayoutDashboard,   label: "admin.nav.overview",         group: "main" },
  {
    id: "usuarios", href: "/admin/usuarios", Icon: Users, label: "admin.nav.users", group: "main",
    subItems: [
      { id: "usuarios-overview", href: "/admin/usuarios",      label: "admin.nav.usersOverview",   Icon: ListFilter },
      { id: "usuarios-novo",     href: "/admin/usuarios/novo", label: "admin.nav.usersNew",  Icon: UserPlus },
    ],
  },
  { id: "customer-success",  href: "/admin/customer-success",  Icon: HeartPulse,        label: "admin.nav.customerSuccess",    group: "main" },
  { id: "projetos",          href: "/admin/projetos",          Icon: FolderKanban,      label: "admin.nav.projects",            group: "ops" },
  { id: "contratos",         href: "/admin/contratos",         Icon: FileSignature,     label: "admin.nav.contracts",           group: "ops" },
  { id: "financeiro",        href: "/admin/financeiro",        Icon: CreditCard,        label: "admin.nav.finance",          group: "ops" },
  { id: "suporte",           href: "/admin/suporte",           Icon: MessageCircle,     label: "admin.nav.serviceDesk",        group: "ops" },
  { id: "kanban",            href: "/admin/kanban",            Icon: LayoutGrid,        label: "admin.nav.kanban",              group: "ops" },
  { id: "calendario",        href: "/admin/calendario",        Icon: CalendarDays,      label: "admin.nav.calendar",          group: "ops" },
  { id: "roadmap",           href: "/admin/roadmap",           Icon: Map,               label: "admin.nav.roadmap",             group: "produto" },
  { id: "feedback",          href: "/admin/feedback",          Icon: MessageSquarePlus, label: "admin.nav.feedback",            group: "produto" },
  { id: "base-conhecimento", href: "/admin/base-conhecimento", Icon: BookOpen,          label: "admin.nav.knowledgeBase",group: "produto" },
  { id: "analytics",         href: "/admin/analytics",         Icon: BarChart2,         label: "admin.nav.analytics",           group: "sistema" },
  { id: "audit",             href: "/admin/audit",             Icon: ShieldCheck,       label: "admin.nav.audit",           group: "sistema" },
];

interface Props {
  name:          string;
  initials:      string;
  userId:        string;
  initialTheme?: "dark" | "light";
  avatarUrl?:    string | null;
}

export function AdminSidebar({ initialTheme = "dark" }: Props) {
  const t = useT();
  const pathname              = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);
  // Track which accordion items are expanded
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // Auto-expand if current path is under usuarios
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin/usuarios")) {
      return new Set(["usuarios"]);
    }
    return new Set();
  });

  // Auto-expand accordion based on current path
  useEffect(() => {
    NAV.forEach(item => {
      if (item.subItems && pathname.startsWith(item.href)) {
        setExpanded(prev => new Set([...prev, item.id]));
      }
    });
  }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem("hub-admin-sidebar-collapsed");
    const isCollapsed = saved === "1";
    if (isCollapsed) setCollapsed(true);
    document.documentElement.style.setProperty("--sidebar-w", isCollapsed ? "60px" : "224px");
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("hub-admin-sidebar-collapsed", next ? "1" : "0");
    document.documentElement.style.setProperty("--sidebar-w", next ? "60px" : "224px");
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }


  const W = collapsed ? 60 : 224;

  const groups = NAV.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group ?? "main";
    (acc[g] ??= []).push(item);
    return acc;
  }, {});

  function isItemActive(item: NavItem) {
    if (item.subItems) {
      // Active if any sub-item matches
      return item.subItems.some(s => pathname === s.href || pathname.startsWith(s.href + "/"))
          || pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center",
    justifyContent: collapsed ? "center" : "flex-start",
    gap: collapsed ? 0 : 9,
    padding: collapsed ? "8px 0" : "6px 10px",
    borderRadius: "var(--r-md)",
    fontSize: "13px", fontWeight: active ? 600 : 500,
    textDecoration: "none",
    color: active ? "var(--text)" : "var(--text-muted)",
    background: active ? "var(--sidebar-active-bg)" : "transparent",
    transition: "background 0.12s, color 0.12s",
    whiteSpace: "nowrap", overflow: "hidden",
    marginBottom: 2,
    cursor: "pointer",
  });

  const sidebar = (
    <aside
      className={`portal-sidebar${mobileOpen ? " open" : ""}`}
      style={{ width: W, transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden" }}
    >
      <div style={{
        display: "flex", flexDirection: "column", height: "100%",
        padding: collapsed ? "16px 0" : "16px 10px",
        transition: "padding 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          marginBottom: 20, paddingLeft: collapsed ? 0 : 2, flexShrink: 0,
        }}>
          {collapsed ? (
            <button onClick={toggleCollapse} title={t("admin.nav.expand")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Image src="/favicon.svg" alt="Fropty Hub" width={28} height={28} unoptimized />
            </button>
          ) : (
            <>
              <Link href="/admin/overview" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", overflow: "hidden" }}>
                <Image src="/favicon.svg" alt="Fropty Hub" width={28} height={28} unoptimized style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
                  Fropty<span style={{ color: "var(--ac)" }}>Hub</span>
                </span>
              </Link>
              <button onClick={toggleCollapse} title={t("admin.nav.collapse")} className="portal-sidebar-toggle" style={{ width: 26, height: 26, borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", cursor: "pointer", color: "var(--text-faint)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <PanelLeftClose size={13} />
              </button>
            </>
          )}
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {Object.entries(groups).map(([groupKey, items]) => (
            <div key={groupKey} style={{ marginBottom: collapsed ? 4 : 16 }}>
              {!collapsed && (
                <p style={{
                  fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.10em",
                  textTransform: "uppercase", color: "var(--text-faint)",
                  padding: "0 10px", margin: "0 0 5px 0",
                }}>
                  {t("admin.nav.groups." + groupKey)}
                </p>
              )}
              {items.map((item) => {
                const { id, href, Icon, label, subItems } = item;
                const active     = isItemActive(item);
                const isExpanded = expanded.has(id);

                if (subItems && !collapsed) {
                  return (
                    <div key={id} style={{ marginBottom: 2 }}>
                      {/* Accordion trigger */}
                      <button
                        onClick={() => toggleExpand(id)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center",
                          gap: 9, padding: "6px 10px", borderRadius: "var(--r-md)",
                          fontSize: "13px", fontWeight: active ? 600 : 500,
                          color: active ? "var(--text)" : "var(--text-muted)",
                          background: active && !isExpanded ? "var(--sidebar-active-bg)" : "transparent",
                          border: "none", cursor: "pointer", fontFamily: "inherit",
                          transition: "background 0.12s, color 0.12s",
                          whiteSpace: "nowrap", overflow: "hidden",
                        }}
                        onMouseEnter={e => { if (!active || isExpanded) (e.currentTarget as HTMLButtonElement).style.background = "var(--sidebar-item-hover)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = (active && !isExpanded) ? "var(--sidebar-active-bg)" : "transparent"; (e.currentTarget as HTMLButtonElement).style.color = active ? "var(--text)" : "var(--text-muted)"; }}
                      >
                        <span style={{ flexShrink: 0, display: "flex", opacity: active ? 1 : 0.65 }}>
                          <Icon size={16} />
                        </span>
                        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis" }}>{t(label)}</span>
                        <span style={{ flexShrink: 0, color: "var(--text-faint)", transition: "transform 0.2s", transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)", display: "flex" }}>
                          <ChevronDown size={13} />
                        </span>
                      </button>

                      {/* Sub-items */}
                      {isExpanded && (
                        <div style={{ paddingLeft: 26, paddingTop: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                          {subItems.map(sub => {
                            const subActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
                            const SubIcon = sub.Icon;
                            return (
                              <Link
                                key={sub.id}
                                href={sub.href}
                                onClick={() => setMobileOpen(false)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 9,
                                  padding: "6px 10px", borderRadius: "var(--r-md)",
                                  fontSize: "13px", fontWeight: subActive ? 600 : 500,
                                  color: subActive ? "var(--text)" : "var(--text-muted)",
                                  background: subActive ? "var(--sidebar-active-bg)" : "transparent",
                                  textDecoration: "none",
                                  transition: "background 0.12s, color 0.12s",
                                  whiteSpace: "nowrap",
                                }}
                                onMouseEnter={e => { if (!subActive) { (e.currentTarget as HTMLAnchorElement).style.background = "var(--sidebar-item-hover)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; } }}
                                onMouseLeave={e => { if (!subActive) { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; } }}
                              >
                                {SubIcon && <SubIcon size={13} style={{ opacity: subActive ? 1 : 0.6, flexShrink: 0 }} />}
                                {t(sub.label)}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Regular item (or collapsed with subItems → just show icon, link to main href)
                return (
                  <Link
                    key={id}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? t(label) : undefined}
                    style={navLinkStyle(active)}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = "var(--sidebar-item-hover)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; } }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; } }}
                  >
                    <span style={{ flexShrink: 0, display: "flex", opacity: active ? 1 : 0.65 }}>
                      <Icon size={16} />
                    </span>
                    {!collapsed && (
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{t(label)}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* O perfil/menu de conta vive no avatar do topo (AccountMenu, HubTopbar).
            O rodapé de identidade foi removido daqui para não duplicar. */}
      </div>
    </aside>
  );

  return (
    <>
      <div className="portal-topbar">
        <button onClick={() => setMobileOpen(true)} aria-label={t("admin.nav.openMenu")} style={{ width: 36, height: 36, borderRadius: "var(--r-md)", background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Menu size={17} />
        </button>
        <Link href="/admin/overview" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flex: 1 }}>
          <Image src="/favicon.svg" alt="Fropty Hub" width={22} height={22} unoptimized />
          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
            Fropty<span style={{ color: "var(--ac)" }}>Hub</span>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", marginLeft: 5 }}>Admin</span>
          </span>
        </Link>
        <PortalThemeToggle initialTheme={initialTheme} />
      </div>

      <div className={`portal-overlay${mobileOpen ? " open" : ""}`} onClick={() => setMobileOpen(false)} aria-hidden />
      {sidebar}
    </>
  );
}




