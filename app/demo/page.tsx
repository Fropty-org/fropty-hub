"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useToasts, ToastContainer } from "./components/Toast";
import LoginScreen from "./components/LoginScreen";
import SegmentSelector from "./components/SegmentSelector";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import type { Role, Section, CartItem, Order, Notification, ProfileData, Product } from "./components/data";
import { INITIAL_NOTIFICATIONS } from "./components/data";

// Loja (existing)
const Dashboard = dynamic(() => import("./components/Dashboard"), { ssr: false });
const Catalog = dynamic(() => import("./components/Catalog"), { ssr: false });
const Orders = dynamic(() => import("./components/Orders"), { ssr: false });
const Customers = dynamic(() => import("./components/Customers"), { ssr: false });
const Financial = dynamic(() => import("./components/Financial"), { ssr: false });
const AdminPanel = dynamic(() => import("./components/AdminPanel"), { ssr: false });
const Notifications = dynamic(() => import("./components/Notifications"), { ssr: false });
const Profile = dynamic(() => import("./components/Profile"), { ssr: false });

// Barbearia
const BarbDashboard = dynamic(() => import("./components/barbearia/Dashboard"), { ssr: false });
const BarbAgenda = dynamic(() => import("./components/barbearia/Agenda"), { ssr: false });
const BarbServicos = dynamic(() => import("./components/barbearia/Servicos"), { ssr: false });
const BarbEquipe = dynamic(() => import("./components/barbearia/Equipe"), { ssr: false });
const BarbFila = dynamic(() => import("./components/barbearia/FilaEspera"), { ssr: false });
const BarbClientes = dynamic(() => import("./components/barbearia/Clientes"), { ssr: false });
const BarbRelatorios = dynamic(() => import("./components/barbearia/Relatorios"), { ssr: false });

// Oficina
const OfDashboard = dynamic(() => import("./components/oficina/Dashboard"), { ssr: false });
const OfOrdens = dynamic(() => import("./components/oficina/OrdensServico"), { ssr: false });
const OfVeiculos = dynamic(() => import("./components/oficina/Veiculos"), { ssr: false });
const OfEstoque = dynamic(() => import("./components/oficina/Estoque"), { ssr: false });
const OfMecanicos = dynamic(() => import("./components/oficina/Mecanicos"), { ssr: false });
const OfClientes = dynamic(() => import("./components/oficina/ClientesVeiculos"), { ssr: false });
const OfRelatorios = dynamic(() => import("./components/oficina/Relatorios"), { ssr: false });

export type Segment = "loja" | "barbearia" | "oficina";

const SEGMENT_LABELS: Record<Segment, string> = {
  loja: "Mercadinho / Loja",
  barbearia: "Barbearia",
  oficina: "Oficina Mecânica",
};

const SECTION_LABELS: Record<string, string> = {
  // loja
  dashboard: "Dashboard", catalog: "Catálogo", orders: "Pedidos",
  customers: "Clientes", financial: "Financeiro", notifications: "Notificações",
  profile: "Perfil", admin: "Admin",
  // barbearia
  barb_dashboard: "Dashboard", barb_agenda: "Agenda", barb_servicos: "Serviços",
  barb_equipe: "Equipe", barb_fila: "Fila de Espera", barb_clientes: "Clientes",
  barb_relatorios: "Relatórios",
  // oficina
  of_dashboard: "Dashboard", of_ordens: "Ordens de Serviço", of_veiculos: "Veículos",
  of_estoque: "Estoque", of_mecanicos: "Mecânicos", of_clientes: "Clientes",
  of_relatorios: "Relatórios",
};

type SectionKey = Section | `barb_${string}` | `of_${string}`;

const SIDEBAR_ITEMS: Record<Segment, { key: SectionKey; icon: string; label: string; adminOnly?: boolean }[]> = {
  loja: [
    { key: "dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
    { key: "catalog", icon: "ti-package", label: "Catálogo" },
    { key: "orders", icon: "ti-shopping-bag", label: "Pedidos" },
    { key: "customers", icon: "ti-users", label: "Clientes" },
    { key: "financial", icon: "ti-chart-bar", label: "Financeiro" },
    { key: "notifications", icon: "ti-bell", label: "Notificações" },
    { key: "profile", icon: "ti-user-circle", label: "Perfil" },
    { key: "admin", icon: "ti-shield-lock", label: "Admin", adminOnly: true },
  ],
  barbearia: [
    { key: "barb_dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
    { key: "barb_agenda", icon: "ti-calendar", label: "Agenda" },
    { key: "barb_servicos", icon: "ti-scissors", label: "Serviços" },
    { key: "barb_equipe", icon: "ti-users", label: "Equipe" },
    { key: "barb_fila", icon: "ti-list-numbers", label: "Fila de Espera" },
    { key: "barb_clientes", icon: "ti-user-circle", label: "Clientes" },
    { key: "barb_relatorios", icon: "ti-chart-bar", label: "Relatórios" },
  ],
  oficina: [
    { key: "of_dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
    { key: "of_ordens", icon: "ti-clipboard-list", label: "Ordens de Serviço" },
    { key: "of_veiculos", icon: "ti-car", label: "Veículos" },
    { key: "of_estoque", icon: "ti-box", label: "Estoque" },
    { key: "of_mecanicos", icon: "ti-tool", label: "Mecânicos" },
    { key: "of_clientes", icon: "ti-users", label: "Clientes" },
    { key: "of_relatorios", icon: "ti-chart-bar", label: "Relatórios" },
  ],
};

function defaultSection(seg: Segment): SectionKey {
  return seg === "loja" ? "dashboard" : seg === "barbearia" ? "barb_dashboard" : "of_dashboard";
}

export default function DemoPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [segment, setSegment] = useState<Segment | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [storeOpen, setStoreOpen] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [profile, setProfile] = useState<ProfileData>({ name: "Visitante Demo", email: "visitante@fropty.com", phone: "(11) 99999-0000", whatsapp: "(11) 99999-0000" });
  const { toasts, addToast, dismissToast } = useToasts();

  useEffect(() => {
    const saved = ((localStorage.getItem("fropty-theme") ?? localStorage.getItem("theme")) as "dark" | "light") || "dark";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
    const savedSeg = localStorage.getItem("fropty_demo_segment") as Segment | null;
    if (savedSeg) setSegment(savedSeg);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("fropty-theme", next);
  }

  function handleLogin(r: Role) {
    setRole(r);
    addToast("success", r === "admin" ? "Bem-vindo, Admin! Acesso completo liberado." : "Bem-vindo, Visitante! Explore o sistema à vontade.");
  }

  function handleSelectSegment(seg: Segment) {
    setSegment(seg);
    localStorage.setItem("fropty_demo_segment", seg);
    setActiveSection(defaultSection(seg));
  }

  function handleSwitchSegment(seg: Segment) {
    addToast("info", `Alternando para: ${SEGMENT_LABELS[seg]}...`);
    setTimeout(() => {
      setSegment(seg);
      localStorage.setItem("fropty_demo_segment", seg);
      setActiveSection(defaultSection(seg));
    }, 400);
  }

  function handleLogout() { setRole(null); setSegment(null); setActiveSection("dashboard"); setSidebarOpen(false); }

  function handleAddToCart(product: Product) {
    setCartItems(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      return ex ? prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { product, qty: 1 }];
    });
  }

  function handleAddOrder(order: Order) {
    setOrders(prev => [order, ...prev]);
    setNotifications(prev => [{ id: Date.now(), type: "order", title: "Pedido realizado", message: `Pedido ${order.id} — ${order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, time: "agora mesmo", read: false }, ...prev]);
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  if (!role) return (<><LoginScreen onLogin={handleLogin} /><ToastContainer toasts={toasts} onDismiss={dismissToast} /></>);
  if (!segment) return (<><SegmentSelector onSelect={handleSelectSegment} /><ToastContainer toasts={toasts} onDismiss={dismissToast} /></>);

  const items = SIDEBAR_ITEMS[segment].filter(i => !i.adminOnly || role === "admin");

  return (
    <>
      <style>{`
        *{box-sizing:border-box}body{margin:0;overflow-x:hidden}
        @keyframes sectionFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .section-animate{animation:sectionFadeIn 0.25s ease both}
        .demo-main{margin-left:220px;min-height:100vh;background:var(--bg);padding-top:60px}
        @media(max-width:768px){.demo-main{margin-left:0!important}}
      `}</style>

      {/* Sidebar */}
      <div className={`portal-sidebar${sidebarOpen ? " open" : ""}`} style={{ background: "var(--nav-bg)", backdropFilter: "blur(14px)", borderRight: "1px solid var(--border)" }}>
        <button className="portal-sidebar-close" onClick={() => setSidebarOpen(false)}><i className="ti ti-x" /></button>
        <div style={{ padding: "20px 16px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#5B57E8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff", flexShrink: 0 }}>F</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Fropty</span>
        </div>
        <nav style={{ padding: "4px 8px", flex: 1 }}>
          {items.map(item => {
            const active = activeSection === item.key;
            return (
              <button key={item.key} onClick={() => { setActiveSection(item.key); setSidebarOpen(false); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", background: active ? "rgba(91,87,232,0.15)" : "transparent", color: active ? "var(--primary)" : "var(--text-muted)", fontSize: 14, fontWeight: active ? 600 : 400, cursor: "pointer", marginBottom: 2, textAlign: "left" }}>
                {item.adminOnly && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF9F27", flexShrink: 0 }} />}
                <i className={`ti ${item.icon}`} style={{ fontSize: 18, color: active ? "var(--primary)" : "var(--text-muted)" }} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "12px 16px 20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 8 }}>Segmento atual</div>
          {(["loja", "barbearia", "oficina"] as Segment[]).map(seg => (
            <button key={seg} onClick={() => seg !== segment && handleSwitchSegment(seg)}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 10px", borderRadius: 8, border: "1px solid", borderColor: seg === segment ? "rgba(91,87,232,0.4)" : "transparent", background: seg === segment ? "rgba(91,87,232,0.1)" : "transparent", color: seg === segment ? "var(--primary)" : "var(--text-faint)", fontSize: 12, cursor: seg === segment ? "default" : "pointer", marginBottom: 4 }}>
              {seg === "loja" ? "🛒" : seg === "barbearia" ? "✂️" : "🔧"} {SEGMENT_LABELS[seg]}
            </button>
          ))}
        </div>
      </div>
      <div className={`portal-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Header */}
      <Header
        role={role} activeSection={activeSection as Section}
        notifCount={unreadCount} cartCount={cartCount} theme={theme}
        onToggleTheme={toggleTheme}
        onNotifications={() => setActiveSection("notifications")}
        onCart={() => setCartOpen(true)}
        onProfile={() => setActiveSection("profile")}
        onLogout={handleLogout}
        sectionLabels={SECTION_LABELS as Record<Section, string>}
        onMenuOpen={() => setSidebarOpen(true)}
        segment={segment} onSwitchSegment={handleSwitchSegment}
      />

      {/* Main content */}
      <main className="demo-main">
        <div key={`${segment}-${activeSection}`} className="section-animate">
          {/* Loja */}
          {segment === "loja" && activeSection === "dashboard" && <Dashboard storeOpen={storeOpen} onToggleStore={v => { setStoreOpen(v); addToast(v ? "success" : "warning", v ? "Loja aberta!" : "Loja fechada."); }} addToast={addToast} />}
          {segment === "loja" && activeSection === "catalog" && <Catalog cartItems={cartItems} onAddToCart={handleAddToCart} addToast={addToast} />}
          {segment === "loja" && activeSection === "orders" && <Orders cartItems={cartItems} onUpdateCart={setCartItems} orders={orders} onAddOrder={handleAddOrder} addToast={addToast} isOpen={cartOpen} onClose={() => setCartOpen(false)} />}
          {segment === "loja" && activeSection === "customers" && <Customers addToast={addToast} />}
          {segment === "loja" && activeSection === "financial" && <Financial addToast={addToast} />}
          {segment === "loja" && activeSection === "notifications" && <Notifications notifications={notifications} onUpdate={setNotifications} />}
          {segment === "loja" && activeSection === "profile" && <Profile profile={profile} onSave={setProfile} addToast={addToast} />}
          {segment === "loja" && activeSection === "admin" && role === "admin" && <AdminPanel addToast={addToast} />}

          {/* Barbearia */}
          {segment === "barbearia" && activeSection === "barb_dashboard" && <BarbDashboard addToast={addToast} />}
          {segment === "barbearia" && activeSection === "barb_agenda" && <BarbAgenda addToast={addToast} />}
          {segment === "barbearia" && activeSection === "barb_servicos" && <BarbServicos addToast={addToast} />}
          {segment === "barbearia" && activeSection === "barb_equipe" && <BarbEquipe addToast={addToast} />}
          {segment === "barbearia" && activeSection === "barb_fila" && <BarbFila addToast={addToast} />}
          {segment === "barbearia" && activeSection === "barb_clientes" && <BarbClientes addToast={addToast} />}
          {segment === "barbearia" && activeSection === "barb_relatorios" && <BarbRelatorios addToast={addToast} />}

          {/* Oficina */}
          {segment === "oficina" && activeSection === "of_dashboard" && <OfDashboard addToast={addToast} />}
          {segment === "oficina" && activeSection === "of_ordens" && <OfOrdens addToast={addToast} />}
          {segment === "oficina" && activeSection === "of_veiculos" && <OfVeiculos addToast={addToast} />}
          {segment === "oficina" && activeSection === "of_estoque" && <OfEstoque addToast={addToast} />}
          {segment === "oficina" && activeSection === "of_mecanicos" && <OfMecanicos addToast={addToast} />}
          {segment === "oficina" && activeSection === "of_clientes" && <OfClientes addToast={addToast} />}
          {segment === "oficina" && activeSection === "of_relatorios" && <OfRelatorios addToast={addToast} />}
        </div>
      </main>

      {/* Cart drawer (loja only, outside section) */}
      {segment === "loja" && activeSection !== "orders" && (
        <Orders cartItems={cartItems} onUpdateCart={setCartItems} orders={orders} onAddOrder={handleAddOrder} addToast={addToast} isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
