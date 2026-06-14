"use client";

import { useState, useEffect } from "react";
import { Toast, type ToastState } from "./Toast";

export function OficinaApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screen, setScreen] = useState<"list" | "search" | "detail">("list");
  const [searchText, setSearchText] = useState("");
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "" });
  const [animStep, setAnimStep] = useState(0);

  const orders = [
    { id: "OS-047", car: "Fiat Uno · BRA-2A49",    service: "Troca de óleo",      status: "Em andamento", statusColor: "#f59e0b", bg: "#fffbeb" },
    { id: "OS-046", car: "Honda Civic · SP-5J12",  service: "Freios dianteiros",  status: "Ag. peça",     statusColor: "#ef4444", bg: "#fef2f2" },
    { id: "OS-045", car: "VW Gol · MG-3F78",       service: "Revisão geral",      status: "Concluído",    statusColor: "#22c55e", bg: "#f0fdf4" },
  ];
  const parts = ["Filtro de óleo", "Pastilha de freio", "Correia dentada", "Vela de ignição", "Amortecedor"];
  const filtered = parts.filter(p => p.toLowerCase().includes(searchText.toLowerCase()));

  useEffect(() => {
    const sequence: [number, () => void][] = [
      [800,  () => setSidebarOpen(true)],
      [2000, () => { setSidebarOpen(false); setScreen("search"); }],
      [2600, () => setSearchText("f")],
      [3000, () => setSearchText("fr")],
      [3300, () => setSearchText("fre")],
      [3600, () => setSearchText("frei")],
      [4000, () => setSearchText("freid")],
      [4200, () => setSearchText("frei")],
      [4500, () => setScreen("detail")],
      [5500, () => {
        setToast({ visible: true, message: "✓ Peça adicionada à OS-046", color: "#f59e0b" });
        setTimeout(() => setToast({ visible: false }), 2000);
      }],
      [8000, () => { setScreen("list"); setSearchText(""); setSidebarOpen(false); }],
    ];
    const timers: ReturnType<typeof setTimeout>[] = sequence.map(([delay, fn]) => setTimeout(fn, delay));
    return () => timers.forEach(t => clearTimeout(t));
  }, [animStep]);

  useEffect(() => {
    const t = setTimeout(() => setAnimStep(s => s + 1), 9000);
    return () => clearTimeout(t);
  }, [animStep]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", background: "#f8fafc", fontFamily: "system-ui, sans-serif", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
        zIndex: 20, opacity: sidebarOpen ? 1 : 0,
        transition: "opacity 0.3s", pointerEvents: sidebarOpen ? "auto" : "none",
      }} onClick={() => setSidebarOpen(false)} />
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: 180, background: "#181490", zIndex: 30,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        padding: "16px 0",
      }}>
        <div style={{ padding: "0 16px 12px", borderBottom: "1px solid #334155" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>🔧 Oficina do Zé</div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Sistema de OS</div>
        </div>
        {(([["📋","Ordens de Serviço"],["🔩","Estoque de Peças"],["👥","Clientes"],["📊","Relatórios"],["⚙️","Configurações"]] as [string,string][]).map(([icon, label]) => (
          <div key={label} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            onClick={() => { if (label === "Estoque de Peças") { setSidebarOpen(false); setScreen("search"); } }}>
            <span style={{ fontSize: 14 }}>{icon}</span>
            <span style={{ fontSize: 11, color: label === "Ordens de Serviço" ? "#fff" : "#94a3b8", fontWeight: label === "Ordens de Serviço" ? 600 : 400 }}>{label}</span>
          </div>
        )))}
      </div>

      <div style={{ background: "#181490", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div onClick={() => setSidebarOpen(true)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 3, padding: 4 }}>
          {([0,1,2] as number[]).map(i => <div key={i} style={{ width: 16, height: 2, background: "#fff", borderRadius: 1 }} />)}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", flex: 1 }}>
          {screen === "list"   && "Ordens de Serviço"}
          {screen === "search" && "Estoque de Peças"}
          {screen === "detail" && "Resultado da busca"}
        </div>
        {screen === "list" && <div style={{ fontSize: 10, background: "#f59e0b", color: "#fff", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>3 abertas</div>}
      </div>

      {screen === "list" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
          {orders.map((o, i) => (
            <div key={i} style={{ background: o.bg, borderRadius: 10, padding: "8px 10px", marginBottom: 8, borderLeft: `3px solid ${o.statusColor}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>{o.id}</span>
                <span style={{ fontSize: 9, background: o.statusColor + "20", color: o.statusColor, padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>{o.status}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", marginTop: 3 }}>{o.car}</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>{o.service}</div>
            </div>
          ))}
        </div>
      )}

      {screen === "search" && (
        <div style={{ flex: 1, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, color: "#64748b" }}>Buscar peça para OS-046</div>
          <div style={{ background: "#fff", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", gap: 6, border: "1.5px solid #0ea5e9" }}>
            <span style={{ fontSize: 12 }}>🔍</span>
            <span style={{ fontSize: 12, color: searchText ? "#0f172a" : "#94a3b8" }}>
              {searchText || "Buscar peça..."}
              <span style={{ borderRight: "2px solid #0ea5e9" }}>&nbsp;</span>
            </span>
          </div>
          <div style={{ flex: 1 }}>
            {(searchText ? filtered : parts).map((p, i) => (
              <div key={i} style={{ padding: "8px 10px", background: "#fff", borderRadius: 8, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#0f172a" }}>{p}</span>
                <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 600 }}>Em estoque</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === "detail" && (
        <div style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "12px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Pastilha de freio</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Ref: PF-2847 · Bosch</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <div style={{ flex: 1, background: "#f0fdf4", borderRadius: 8, padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#16a34a" }}>12</div>
                <div style={{ fontSize: 9, color: "#64748b" }}>Em estoque</div>
              </div>
              <div style={{ flex: 1, background: "#fffbeb", borderRadius: 8, padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f59e0b" }}>R$48</div>
                <div style={{ fontSize: 9, color: "#64748b" }}>Custo unit.</div>
              </div>
            </div>
            <button style={{
              width: "100%", marginTop: 10, background: "#f59e0b",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "9px", fontSize: 11, fontWeight: 700, cursor: "pointer",
            }}>Adicionar à OS-046</button>
          </div>
        </div>
      )}

      <Toast visible={toast.visible} message={toast.message} color="#f59e0b" />

      <div style={{ height: 50, background: "#181490", display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0 }}>
        {(([["📋","OS"],["🔩","Peças"],["👥","Clientes"],["📊","Stats"]] as [string,string][]).map(([icon, label]) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{ fontSize: 8, color: "#94a3b8" }}>{label}</span>
          </div>
        )))}
      </div>
    </div>
  );
}
