"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition, useState, useEffect, useRef } from "react";
import { signOut } from "@/app/actions/auth";
import { PortalThemeToggle } from "@/app/components/cliente/PortalThemeToggle";
import {
  LayoutDashboard, Users, CreditCard, MessageCircle, BarChart2, ShieldCheck,
  UserCircle, BookOpen, Map, MessageSquarePlus, FolderKanban, FileSignature,
  HeartPulse, Menu, LogOut, Loader2, PanelLeftClose, Shield,
  ChevronUp, ChevronDown, UserPlus, ListFilter,
} from "lucide-react";
import { NotificationBell } from "@/app/components/NotificationBell";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";

type SubItem = { id: string; href: string; label: string; Icon?: LucideIcon };
type NavItem = { id: string; href: string; Icon: LucideIcon; label: string; group?: string; subItems?: SubItem[] };

const NAV: NavItem[] = [
  { id: "overview",          href: "/admin/overview",          Icon: LayoutDashboard,   label: "Visão Geral",         group: "main" },
  {
    id: "usuarios", href: "/admin/usuarios", Icon: Users, label: "Usuários", group: "main",
    subItems: [
      { id: "usuarios-overview", href: "/admin/usuarios",      label: "Visão Geral",   Icon: ListFilter },
      { id: "usuarios-novo",     href: "/admin/usuarios/novo", label: "Novo Usuário",  Icon: UserPlus },
    ],
  },
  { id: "customer-success",  href: "/admin/customer-success",  Icon: HeartPulse,        label: "Customer Success",    group: "main" },
  { id: "projetos",          href: "/admin/projetos",          Icon: FolderKanban,      label: "Projetos",            group: "ops" },
  { id: "contratos",         href: "/admin/contratos",         Icon: FileSignature,     label: "Contratos",           group: "ops" },
  { id: "financeiro",        href: "/admin/financeiro",        Icon: CreditCard,        label: "Financeiro",          group: "ops" },
  { id: "suporte",           href: "/portal/suporte",          Icon: MessageCircle,     label: "Suporte",             group: "ops" },
  { id: "roadmap",           href: "/admin/roadmap",           Icon: Map,               label: "Roadmap",             group: "produto" },
  { id: "feedback",          href: "/admin/feedback",          Icon: MessageSquarePlus, label: "Feedback",            group: "produto" },
  { id: "base-conhecimento", href: "/admin/base-conhecimento", Icon: BookOpen,          label: "Base de Conhecimento",group: "produto" },
  { id: "analytics",         href: "/admin/analytics",         Icon: BarChart2,         label: "Analytics",           group: "sistema" },
  { id: "audit",             href: "/admin/audit",             Icon: ShieldCheck,       label: "Auditoria",           group: "sistema" },
];

const GROUP_LABELS: Record<string, string> = {
  main: "Principal", ops: "Operações", produto: "Produto", sistema: "Sistema",
};

interface Props {
  name:          string;
  initials:      string;
  userId:        string;
  initialTheme?: "dark" | "light";
  avatarUrl?:    string | null;
}

export function AdminSidebar({ name, initials, userId, initialTheme = "dark", avatarUrl }: Props) {
  const pathname              = usePathname();
  const [pending, startTrans] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [popPos,     setPopPos]     = useState<{ bottom: number; left: number } | null>(null);
  // Track which accordion items are expanded
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // Auto-expand if current path is under usuarios
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin/usuarios")) {
      return new Set(["usuarios"]);
    }
    return new Set();
  });
  const footerRef  = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Auto-expand accordion based on current path
  useEffect(() => {
    NAV.forEach(item => {
      if (item.subItems && pathname.startsWith(item.href)) {
        setExpanded(prev => new Set([...prev, item.id]));
      }
    });
  }, [pathname]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      const popEl = document.getElementById("admin-user-popover");
      if (
        footerRef.current && !footerRef.current.contains(e.target as Node) &&
        (!popEl || !popEl.contains(e.target as Node))
      ) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  function handleMenuToggle() {
    if (!menuOpen && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPopPos({
        bottom: window.innerHeight - r.top + 8,
        left: collapsed ? r.right + 8 : r.left,
      });
    }
    setMenuOpen(o => !o);
  }

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

  function handleSignOut() {
    startTrans(async () => {
      const result = await signOut();
      if (result?.redirectTo) window.location.href = result.redirectTo;
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
    background: active ? "var(--surface-2)" : "transparent",
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
            <button onClick={toggleCollapse} title="Expandir menu" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Image src="/logo-icon.png" alt="Fropty Hub" width={28} height={28} style={{ objectFit: "contain", borderRadius: 6 }} />
            </button>
          ) : (
            <>
              <Link href="/admin/overview" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", overflow: "hidden" }}>
                <Image src="/logo-icon.png" alt="Fropty Hub" width={28} height={28} style={{ objectFit: "contain", flexShrink: 0, borderRadius: 6 }} />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
                  Fropty<span style={{ background: "linear-gradient(90deg,#9333ea,#3b82f6,#22c55e,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Hub</span>
                </span>
              </Link>
              <button onClick={toggleCollapse} title="Recolher menu" className="portal-sidebar-toggle" style={{ width: 26, height: 26, borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", cursor: "pointer", color: "var(--text-faint)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
                  {GROUP_LABELS[groupKey] ?? groupKey}
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
                          background: active && !isExpanded ? "var(--surface-2)" : "transparent",
                          border: "none", cursor: "pointer", fontFamily: "inherit",
                          transition: "background 0.12s, color 0.12s",
                          whiteSpace: "nowrap", overflow: "hidden",
                        }}
                        onMouseEnter={e => { if (!active || isExpanded) (e.currentTarget as HTMLButtonElement).style.background = "var(--sidebar-item-hover)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = (active && !isExpanded) ? "var(--surface-2)" : "transparent"; (e.currentTarget as HTMLButtonElement).style.color = active ? "var(--text)" : "var(--text-muted)"; }}
                      >
                        <span style={{ flexShrink: 0, display: "flex", opacity: active ? 1 : 0.65 }}>
                          <Icon size={16} />
                        </span>
                        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
                        <span style={{ flexShrink: 0, color: "var(--text-faint)", transition: "transform 0.2s", transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)", display: "flex" }}>
                          <ChevronDown size={13} />
                        </span>
                      </button>

                      {/* Sub-items */}
                      {isExpanded && (
                        <div style={{ paddingLeft: 26, paddingTop: 2 }}>
                          {subItems.map(sub => {
                            const subActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
                            const SubIcon = sub.Icon;
                            return (
                              <Link
                                key={sub.id}
                                href={sub.href}
                                onClick={() => setMobileOpen(false)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 8,
                                  padding: "5px 10px", borderRadius: "var(--r-md)",
                                  fontSize: "12.5px", fontWeight: subActive ? 600 : 500,
                                  color: subActive ? "var(--text)" : "var(--text-muted)",
                                  background: subActive ? "var(--surface-2)" : "transparent",
                                  textDecoration: "none", marginBottom: 1,
                                  transition: "background 0.12s, color 0.12s",
                                  whiteSpace: "nowrap",
                                }}
                                onMouseEnter={e => { if (!subActive) { (e.currentTarget as HTMLAnchorElement).style.background = "var(--sidebar-item-hover)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; } }}
                                onMouseLeave={e => { if (!subActive) { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; } }}
                              >
                                {SubIcon && <SubIcon size={13} style={{ opacity: subActive ? 1 : 0.6, flexShrink: 0 }} />}
                                {sub.label}
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
                    title={collapsed ? label : undefined}
                    style={navLinkStyle(active)}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = "var(--sidebar-item-hover)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; } }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; } }}
                  >
                    <span style={{ flexShrink: 0, display: "flex", opacity: active ? 1 : 0.65 }}>
                      <Icon size={16} />
                    </span>
                    {!collapsed && (
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div ref={footerRef} style={{ flexShrink: 0, marginTop: 8 }}>
          <div style={{ height: 1, background: "var(--border)", marginBottom: 6 }} />
          <button
            ref={triggerRef}
            onClick={handleMenuToggle}
            title={collapsed ? name : undefined}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: 8, padding: collapsed ? "6px 0" : "7px 10px",
              borderRadius: "var(--r-md)", background: menuOpen ? "var(--surface-2)" : "transparent",
              border: "none", cursor: "pointer", color: "var(--text)", fontFamily: "inherit",
              transition: "background 0.12s",
            }}
            onMouseEnter={e => { if (!menuOpen) (e.currentTarget as HTMLButtonElement).style.background = "var(--sidebar-item-hover)"; }}
            onMouseLeave={e => { if (!menuOpen) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface-2)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "var(--text)", overflow: "hidden" }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
                  : initials}
              </div>
              <span style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, borderRadius: "50%", background: "var(--sidebar-bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                <Shield size={7} style={{ color: "var(--primary)", opacity: 0.8 }} />
              </span>
            </div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, overflow: "hidden", minWidth: 0, textAlign: "left" }}>
                  <p style={{ margin: 0, fontSize: "12.5px", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
                  <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 3 }}>
                    <Shield size={8} style={{ color: "var(--primary)", opacity: 0.7 }} /> Administrador
                  </p>
                </div>
                <ChevronUp size={12} style={{ flexShrink: 0, color: "var(--text-faint)", transform: menuOpen ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }} />
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {menuOpen && popPos && (
        <div
          id="admin-user-popover"
          style={{
            position: "fixed", bottom: popPos.bottom, left: popPos.left,
            width: 232, background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
            overflow: "hidden", zIndex: 9999,
          }}
        >
          <div style={{ padding: "14px 14px 12px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--surface-2)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: "var(--text)", flexShrink: 0, overflow: "hidden" }}>
              {avatarUrl ? <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" /> : initials}
            </div>
            <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
              <p style={{ margin: 0, fontSize: "10.5px", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 3 }}>
                <Shield size={8} style={{ color: "var(--primary)" }} /> Administrador · Fropty Hub
              </p>
            </div>
          </div>
          <div style={{ padding: "6px" }}>
            <p style={{ margin: "2px 10px 3px", fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-faint)" }}>Conta</p>
            <Link href="/admin/perfil" onClick={() => setMenuOpen(false)} style={dropItem} onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)"} onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}>
              <UserCircle size={14} /> Meu Perfil
            </Link>
            <Link href="/admin/usuarios" onClick={() => setMenuOpen(false)} style={dropItem} onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)"} onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}>
              <Users size={14} /> Gerenciar Usuários
            </Link>
            <Link href="/admin/financeiro" onClick={() => setMenuOpen(false)} style={dropItem} onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)"} onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}>
              <CreditCard size={14} /> Financeiro
            </Link>
          </div>
          <div style={{ height: 1, background: "var(--border)" }} />
          <div style={{ padding: "6px" }}>
            <p style={{ margin: "2px 10px 3px", fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-faint)" }}>Preferências</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: "var(--r-md)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                Tema
              </span>
              <PortalThemeToggle initialTheme={initialTheme} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: "var(--r-md)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                Notificações
              </span>
              <NotificationBell userId={userId} />
            </div>
          </div>
          <div style={{ height: 1, background: "var(--border)" }} />
          <div style={{ padding: "6px" }}>
            <p style={{ margin: "2px 10px 3px", fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-faint)" }}>Sistema</p>
            <Link href="/admin/analytics" onClick={() => setMenuOpen(false)} style={dropItem} onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)"} onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}>
              <BarChart2 size={14} /> Analytics
            </Link>
            <Link href="/admin/audit" onClick={() => setMenuOpen(false)} style={dropItem} onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)"} onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}>
              <ShieldCheck size={14} /> Auditoria
            </Link>
          </div>
          <div style={{ height: 1, background: "var(--border)" }} />
          <div style={{ padding: "6px" }}>
            <button
              onClick={handleSignOut}
              disabled={pending}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: "var(--r-md)", fontSize: "13px", fontWeight: 500, color: "var(--c-danger)", background: "none", border: "none", cursor: pending ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: pending ? 0.5 : 1 }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,38,38,0.07)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              {pending ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <LogOut size={13} />}
              {pending ? "Saindo…" : "Sair"}
            </button>
          </div>
        </div>
      )}

      <div className="portal-topbar">
        <button onClick={() => setMobileOpen(true)} aria-label="Abrir menu" style={{ width: 36, height: 36, borderRadius: "var(--r-md)", background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Menu size={17} />
        </button>
        <Link href="/admin/overview" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flex: 1 }}>
          <Image src="/logo-icon.png" alt="Fropty Hub" width={22} height={22} style={{ objectFit: "contain", borderRadius: 5 }} />
          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
            Fropty<span style={{ background: "linear-gradient(90deg,#9333ea,#3b82f6,#22c55e,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Hub</span>
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

const dropItem: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "7px 10px", borderRadius: "var(--r-md)",
  fontSize: "13px", fontWeight: 500, color: "var(--text-muted)",
  textDecoration: "none", transition: "background 0.1s",
};
