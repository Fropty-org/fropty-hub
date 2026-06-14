"use client";

import { useState, useEffect } from "react";
import { Toast, type ToastState } from "./Toast";

const APPOINTMENTS = [
  { client: "Lucas M.", service: "Combo", barber: "Carlos", time: "09:00", status: "confirmed" },
  { client: "Felipe R.", service: "Corte", barber: "Rafael", time: "10:30", status: "confirmed" },
  { client: "André K.", service: "Barba", barber: "Diego", time: "11:00", status: "pending" },
  { client: "Matheus P.", service: "Combo", barber: "Carlos", time: "14:00", status: "confirmed" },
];

export function BarbeariaDesktop() {
  const [active, setActive] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState>({ visible: false });
  const [animStep, setAnimStep] = useState(0);

  useEffect(() => {
    const seq: [number, () => void][] = [
      [1200, () => setActive(2)],
      [2800, () => { setToast({ visible: true, message: "✓ Status atualizado!", color: "#7c3aed" }); }],
      [4800, () => { setToast({ visible: false }); setActive(null); }],
    ];
    const timers = seq.map(([d, fn]) => setTimeout(fn, d));
    return () => timers.forEach(clearTimeout);
  }, [animStep]);

  useEffect(() => {
    const t = setTimeout(() => setAnimStep(s => s + 1), 7000);
    return () => clearTimeout(t);
  }, [animStep]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif", background: "#0f0f0f", position: "relative" }}>
      {/* Header */}
      <div style={{ background: "#1a1a1a", padding: "8px 14px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>✂️ Barbearia do João · Admin</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Agenda", "Clientes", "Financeiro", "Config"].map((item, i) => (
            <div key={item} style={{ fontSize: 9, color: i === 0 ? "#7c3aed" : "#9ca3af", fontWeight: i === 0 ? 700 : 400, padding: "3px 8px", borderRadius: 6, background: i === 0 ? "rgba(124,58,237,0.15)" : "transparent", cursor: "pointer" }}>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 140, borderRight: "1px solid #2a2a2a", padding: "10px 8px", background: "#151515" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Hoje</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Agendamentos", val: "8" },
              { label: "Concluídos", val: "3" },
              { label: "Receita", val: "R$ 280" },
            ].map(({ label, val }) => (
              <div key={label} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#7c3aed" }}>{val}</div>
                <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 1 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "10px 12px", overflowY: "auto", background: "#111" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", marginBottom: 8 }}>Agendamentos do dia</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {APPOINTMENTS.map((a, i) => (
              <div
                key={i}
                onClick={() => setActive(active === i ? null : i)}
                style={{
                  background: active === i ? "rgba(124,58,237,0.15)" : "#1a1a1a",
                  border: `1px solid ${active === i ? "#7c3aed" : "#2a2a2a"}`,
                  borderRadius: 10, padding: "8px 10px",
                  display: "flex", alignItems: "center", gap: 8,
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", minWidth: 32 }}>{a.time}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{a.client}</div>
                  <div style={{ fontSize: 9, color: "#9ca3af" }}>{a.service} · {a.barber}</div>
                </div>
                <div style={{
                  fontSize: 9, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                  background: a.status === "confirmed" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                  color: a.status === "confirmed" ? "#10b981" : "#f59e0b",
                }}>
                  {a.status === "confirmed" ? "Confirmado" : "Pendente"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Toast visible={toast.visible} message={toast.message} color={toast.color} />
    </div>
  );
}
