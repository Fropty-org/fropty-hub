"use client";

import { useState, useEffect } from "react";
import { Toast, type ToastState } from "./Toast";

export function OficinaDesktop() {
  const [activeNav, setActiveNav] = useState<"os" | "pecas" | "clientes">("os");
  const [screen, setScreen] = useState<"list" | "search" | "detail">("list");
  const [searchText, setSearchText] = useState("");
  const [toast, setToast] = useState<ToastState>({ visible: false });
  const [animStep, setAnimStep] = useState(0);

  const orders = [
    { id: "OS-047", car: "Fiat Uno · BRA-2A49",   service: "Troca de óleo",     status: "Em andamento", statusColor: "#f59e0b", bg: "#fffbeb" },
    { id: "OS-046", car: "Honda Civic · SP-5J12", service: "Freios dianteiros", status: "Ag. peça",     statusColor: "#ef4444", bg: "#fef2f2" },
    { id: "OS-045", car: "VW Gol · MG-3F78",      service: "Revisão geral",     status: "Concluído",   statusColor: "#22c55e", bg: "#f0fdf4" },
  ];
  const parts = ["Filtro de óleo", "Pastilha de freio", "Correia dentada", "Vela de ignição"];
  const filtered = parts.filter(p => p.toLowerCase().includes(searchText.toLowerCase()));

  const navItems: { id: "os" | "pecas" | "clientes"; icon: string; label: string }[] = [
    { id: "os",       icon: "📋", label: "OS" },
    { id: "pecas",    icon: "🔩", label: "Peças" },
    { id: "clientes", icon: "👥", label: "Clientes" },
  ];

  useEffect(() => {
    setActiveNav("os"); setScreen("list"); setSearchText("");
    const sequence: [number, () => void][] = [
      [1200, () => { setActiveNav("pecas"); setScreen("search"); }],
      [1900, () => setSearchText("f")],
      [2300, () => setSearchText("fr")],
      [2700, () => setSearchText("frei")],
      [3200, () => setScreen("detail")],
      [4600, () => setToast({ visible: true, message: "✓ Peça adicionada à OS-046", color: "#f59e0b" })],
      [6600, () => setToast({ visible: false })],
      [7500, () => { setActiveNav("os"); setScreen("list"); setSearchText(""); }],
    ];
    const timers = sequence.map(([d, fn]) => setTimeout(fn, d));
    return () => timers.forEach(clearTimeout);
  }, [animStep]);

  useEffect(() => {
    const t = setTimeout(() => setAnimStep(s => s + 1), 10000);
    return () => clearTimeout(t);
  }, [animStep]);

  return (
    <div style={{ flex: 1, display: "flex", fontFamily: "system-ui, sans-serif", overflow: "hidden", position: "relative" }}>
      <div style={{ width: 96, background: "#181490", display: "flex", flexDirection: "column", padding: "10px 0", flexShrink: 0 }}>
        <div style={{ padding: "0 10px 10px", borderBottom: "1px solid #334155", marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>🔧 Oficina</div>
          <div style={{ fontSize: 9, color: "#64748b" }}>do Zé</div>
        </div>
        {navItems.map(item => (
          <div key={item.id} style={{
            padding: "9px 10px",
            display: "flex", alignItems: "center", gap: 7,
            cursor: "pointer",
            background: activeNav === item.id ? "rgba(255,255,255,0.08)" : "transparent",
            borderLeft: activeNav === item.id ? "2px solid #f59e0b" : "2px solid transparent",
            transition: "all 0.2s",
          }} onClick={() => setActiveNav(item.id)}>
            <span style={{ fontSize: 13 }}>{item.icon}</span>
            <span style={{ fontSize: 10, color: activeNav === item.id ? "#fff" : "#64748b", fontWeight: activeNav === item.id ? 600 : 400 }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: "#181490", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>
            {activeNav === "os" ? "Ordens de Serviço" : activeNav === "pecas" ? "Estoque de Peças" : "Clientes"}
          </div>
          {activeNav === "os" && <div style={{ fontSize: 9, background: "#f59e0b", color: "#fff", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>3 abertas</div>}
        </div>

        <div style={{ flex: 1, padding: "10px", overflowY: "auto", background: "#f8fafc" }}>
          {screen === "list" && orders.map((o, i) => (
            <div key={i} style={{ background: o.bg, borderRadius: 8, padding: "8px 10px", marginBottom: 8, borderLeft: `3px solid ${o.statusColor}` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>{o.id}</span>
                <span style={{ fontSize: 9, background: o.statusColor + "20", color: o.statusColor, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>{o.status}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", marginTop: 3 }}>{o.car}</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>{o.service}</div>
            </div>
          ))}

          {(screen === "search" || screen === "detail") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ background: "#fff", borderRadius: 8, padding: "7px 10px", display: "flex", alignItems: "center", gap: 6, border: "1.5px solid #0ea5e9" }}>
                <span style={{ fontSize: 12 }}>🔍</span>
                <span style={{ fontSize: 12, color: searchText ? "#0f172a" : "#94a3b8" }}>
                  {searchText || "Buscar peça..."}
                  {screen === "search" && <span style={{ borderRight: "2px solid #0ea5e9" }}>&nbsp;</span>}
                </span>
              </div>
              {screen === "search" && (searchText ? filtered : parts).map((p, i) => (
                <div key={i} style={{ padding: "8px 10px", background: "#fff", borderRadius: 8, display: "flex", justifyContent: "space-between", border: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 11, color: "#0f172a" }}>{p}</span>
                  <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 600 }}>Em estoque</span>
                </div>
              ))}
              {screen === "detail" && (
                <div style={{ background: "#fff", borderRadius: 10, padding: "12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Pastilha de freio</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Ref: PF-2847 · Bosch</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <div style={{ flex: 1, background: "#f0fdf4", borderRadius: 8, padding: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#16a34a" }}>12</div>
                      <div style={{ fontSize: 9, color: "#64748b" }}>Em estoque</div>
                    </div>
                    <div style={{ flex: 1, background: "#fffbeb", borderRadius: 8, padding: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b" }}>R$48</div>
                      <div style={{ fontSize: 9, color: "#64748b" }}>Custo unit.</div>
                    </div>
                  </div>
                  <button style={{
                    width: "100%", marginTop: 10, background: "#f59e0b",
                    color: "#fff", border: "none", borderRadius: 8,
                    padding: "9px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}>Adicionar à OS-046</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Toast visible={toast.visible} message={toast.message} color="#f59e0b" />
    </div>
  );
}
