"use client";

import { useState, useEffect } from "react";
import { Toast, type ToastState } from "./Toast";

const BARBERS = [
  { name: "Carlos", specialty: "Degradê & Barba", avatar: "C", color: "#7c3aed" },
  { name: "Rafael", specialty: "Clássico & Navalhado", avatar: "R", color: "#0ea5e9" },
  { name: "Diego", specialty: "Afro & Tranças", avatar: "D", color: "#f59e0b" },
];

const SERVICES = [
  { id: "corte", label: "Corte", price: "R$ 35", icon: "✂️" },
  { id: "barba", label: "Barba", price: "R$ 25", icon: "🪒" },
  { id: "combo", label: "Combo", price: "R$ 55", icon: "⭐" },
];

const HOURS = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

export function BarbeariaApp() {
  const [screen, setScreen] = useState<"home" | "book" | "confirm">("home");
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "" });

  const showToast = (msg: string, color?: string) => {
    setToast({ visible: true, message: msg, color });
    setTimeout(() => setToast({ visible: false, message: "" }), 2400);
  };

  useEffect(() => {
    const seq: [number, () => void][] = [
      [1800, () => { setScreen("book"); }],
      [2800, () => setSelectedBarber(0)],
      [3600, () => setSelectedService("combo")],
      [4400, () => setSelectedHour("14:00")],
      [5200, () => setScreen("confirm")],
      [6600, () => { showToast("✓ Agendado com sucesso!", "#7c3aed"); }],
      [9000, () => { setScreen("home"); setSelectedBarber(null); setSelectedService(null); setSelectedHour(null); }],
    ];
    const timers = seq.map(([d, fn]) => setTimeout(fn, d));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif", position: "relative", background: "#0f0f0f" }}>
      {/* Header */}
      <div style={{ background: "#1a1a1a", padding: "10px 14px 8px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>Barbearia do João</div>
          <div style={{ fontSize: 9, color: "#9ca3af" }}>Centro · Aberto até 19h</div>
        </div>
        <div style={{ fontSize: 18 }}>✂️</div>
      </div>

      {screen === "home" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {/* Banner */}
          <div style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>Sua vez está chegando!</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>Fila atual: 2 à sua frente</div>
            <div style={{ marginTop: 8, background: "rgba(255,255,255,0.15)", borderRadius: 6, padding: "5px 10px", display: "inline-block" }}>
              <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>~20 min</span>
            </div>
          </div>
          {/* Barbers */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nossos barbeiros</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {BARBERS.map((b, i) => (
              <div key={i} style={{ background: "#1a1a1a", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, border: "1px solid #2a2a2a" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: b.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{b.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{b.name}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af" }}>{b.specialty}</div>
                </div>
                <div style={{ fontSize: 9, background: "#14532d", color: "#4ade80", padding: "2px 7px", borderRadius: 20, fontWeight: 600 }}>Livre</div>
              </div>
            ))}
          </div>
          <button onClick={() => setScreen("book")} style={{ width: "100%", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "11px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Agendar horário →
          </button>
        </div>
      )}

      {screen === "book" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Novo agendamento</div>
          {/* Barber */}
          <div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 6 }}>Escolha o barbeiro</div>
            <div style={{ display: "flex", gap: 6 }}>
              {BARBERS.map((b, i) => (
                <div key={i} onClick={() => setSelectedBarber(i)} style={{ flex: 1, padding: "8px 4px", borderRadius: 10, textAlign: "center", background: selectedBarber === i ? b.color : "#1a1a1a", border: `1px solid ${selectedBarber === i ? b.color : "#2a2a2a"}`, cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{b.avatar}</div>
                  <div style={{ fontSize: 9, color: selectedBarber === i ? "rgba(255,255,255,0.9)" : "#9ca3af", marginTop: 2 }}>{b.name}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Service */}
          <div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 6 }}>Serviço</div>
            <div style={{ display: "flex", gap: 6 }}>
              {SERVICES.map(s => (
                <div key={s.id} onClick={() => setSelectedService(s.id)} style={{ flex: 1, padding: "8px 4px", borderRadius: 10, textAlign: "center", background: selectedService === s.id ? "#7c3aed" : "#1a1a1a", border: `1px solid ${selectedService === s.id ? "#7c3aed" : "#2a2a2a"}`, cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ fontSize: 14 }}>{s.icon}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#fff", marginTop: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 9, color: selectedService === s.id ? "rgba(255,255,255,0.75)" : "#9ca3af" }}>{s.price}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Hours */}
          <div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 6 }}>Horário disponível</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
              {HOURS.map(h => (
                <div key={h} onClick={() => setSelectedHour(h)} style={{ padding: "7px 4px", borderRadius: 8, textAlign: "center", background: selectedHour === h ? "#7c3aed" : "#1a1a1a", border: `1px solid ${selectedHour === h ? "#7c3aed" : "#2a2a2a"}`, color: selectedHour === h ? "#fff" : "#9ca3af", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>{h}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {screen === "confirm" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✂️</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", textAlign: "center" }}>Confirmar agendamento</div>
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: "12px 16px", width: "100%" }}>
            <div style={{ fontSize: 12, color: "#7c3aed", fontWeight: 700 }}>Sexta-feira, 14:00</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Carlos · Combo (✂️ + 🪒) · R$ 55</div>
          </div>
          <button style={{ width: "100%", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "11px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Confirmar agendamento
          </button>
        </div>
      )}

      {/* Bottom nav */}
      <div style={{ height: 50, background: "#1a1a1a", borderTop: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0 }}>
        {([["🏠","Início"],["📅","Agenda"],["✂️","Serviços"],["👤","Perfil"]] as [string,string][]).map(([icon, label]) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{ fontSize: 8, color: "#9ca3af" }}>{label}</span>
          </div>
        ))}
      </div>

      <Toast visible={toast.visible} message={toast.message} color={toast.color} />
    </div>
  );
}
