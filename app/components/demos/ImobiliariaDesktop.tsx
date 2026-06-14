"use client";

import { useState, useEffect } from "react";
import { Toast, type ToastState } from "./Toast";

const PROPERTIES = [
  { title: "Apto 3 qts - Jardins", price: "R$ 850k", area: "92m²", type: "Venda", tag: "Destaque", img: "🏢" },
  { title: "Casa 4 qts - Alphaville", price: "R$ 1,2M", area: "240m²", type: "Venda", tag: "Novo", img: "🏠" },
  { title: "Sala Comercial - Centro", price: "R$ 4.500/mês", area: "55m²", type: "Aluguel", tag: "", img: "🏗️" },
  { title: "Cobertura Duplex - Moema", price: "R$ 2,1M", area: "310m²", type: "Venda", tag: "Premium", img: "✨" },
];

export function ImobiliariaDesktop() {
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState<"Todos" | "Venda" | "Aluguel">("Todos");
  const [toast, setToast] = useState<ToastState>({ visible: false });
  const [animStep, setAnimStep] = useState(0);

  useEffect(() => {
    const seq: [number, () => void][] = [
      [1000, () => setFilter("Venda")],
      [2500, () => setSelected(1)],
      [4200, () => { setToast({ visible: true, message: "✓ Imóvel salvo nos favoritos!", color: "#5B57E8" }); }],
      [6200, () => { setToast({ visible: false }); setSelected(null); setFilter("Todos"); }],
    ];
    const timers = seq.map(([d, fn]) => setTimeout(fn, d));
    return () => timers.forEach(clearTimeout);
  }, [animStep]);

  useEffect(() => {
    const t = setTimeout(() => setAnimStep(s => s + 1), 8000);
    return () => clearTimeout(t);
  }, [animStep]);

  const filtered = filter === "Todos" ? PROPERTIES : PROPERTIES.filter(p => p.type === filter);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif", background: "#f8fafc", position: "relative" }}>
      {/* Header */}
      <div style={{ background: "#fff", padding: "8px 14px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>🏠 Imobiliária Express</div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Todos", "Venda", "Aluguel"].map(f => (
            <button key={f} onClick={() => setFilter(f as typeof filter)} style={{ fontSize: 9, padding: "4px 10px", borderRadius: 20, border: `1px solid ${filter === f ? "#5B57E8" : "#e2e8f0"}`, background: filter === f ? "#5B57E8" : "#fff", color: filter === f ? "#fff" : "#64748b", fontWeight: filter === f ? 700 : 400, cursor: "pointer", transition: "all 0.2s" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 6, padding: "8px 12px", background: "#fff", borderBottom: "1px solid #f1f5f9" }}>
        {[{ label: "Imóveis", val: "142" }, { label: "Visitas hoje", val: "28" }, { label: "Propostas", val: "7" }].map(({ label, val }) => (
          <div key={label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#5B57E8" }}>{val}</div>
            <div style={{ fontSize: 8, color: "#94a3b8" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Property grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {(filtered.length > 0 ? filtered : PROPERTIES).map((p, i) => (
            <div
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              style={{
                background: "#fff",
                border: `1.5px solid ${selected === i ? "#5B57E8" : "#e2e8f0"}`,
                borderRadius: 10, overflow: "hidden",
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: selected === i ? "0 4px 12px rgba(91,87,232,0.15)" : "none",
              }}
            >
              <div style={{ height: 52, background: selected === i ? "rgba(91,87,232,0.1)" : "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                {p.img}
              </div>
              <div style={{ padding: "8px 8px" }}>
                {p.tag && (
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#5B57E8", background: "rgba(91,87,232,0.1)", padding: "1px 6px", borderRadius: 20, marginBottom: 4, display: "inline-block" }}>{p.tag}</span>
                )}
                <div style={{ fontSize: 10, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>{p.title}</div>
                <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>{p.area} · {p.type}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#5B57E8", marginTop: 4 }}>{p.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Toast visible={toast.visible} message={toast.message} color={toast.color} />
    </div>
  );
}
