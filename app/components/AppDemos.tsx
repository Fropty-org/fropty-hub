"use client";

import { useState } from "react";
import { PhoneFrame } from "./demos/PhoneFrame";
import { DesktopFrame } from "./demos/DesktopFrame";
import { ConsultorioApp } from "./demos/ConsultorioApp";
import { OficinaApp } from "./demos/OficinaApp";
import { DocesApp } from "./demos/DocesApp";
import { ConsultorioDesktop } from "./demos/ConsultorioDesktop";
import { OficinaDesktop } from "./demos/OficinaDesktop";
import { DocesDesktop } from "./demos/DocesDesktop";

export default function AppDemos() {
  const [view, setView] = useState<"mobile" | "desktop">("mobile");

  return (
    <section
      id="exemplos"
      style={{
        padding: "56px 16px",
        scrollMarginTop: "80px",
        background: "var(--surface)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          Exemplos reais
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>
          Veja o que é possível
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 460, margin: "0 auto" }}>
          Apps reais para negócios reais — do seu jeito, com a sua cara.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 44 }}>
        <div style={{ position: "relative", display: "inline-flex", borderBottom: "1px solid var(--border)" }}>
          <button
            onClick={() => setView("mobile")}
            style={{
              padding: "8px 28px",
              background: "none", border: "none", cursor: "pointer",
              color: view === "mobile" ? "var(--text)" : "var(--text-muted)",
              fontWeight: view === "mobile" ? 500 : 400,
              fontSize: 14,
              transition: "color 0.2s",
            }}
          >
            Mobile
          </button>
          <button
            onClick={() => setView("desktop")}
            style={{
              padding: "8px 28px",
              background: "none", border: "none", cursor: "pointer",
              color: view === "desktop" ? "var(--text)" : "var(--text-muted)",
              fontWeight: view === "desktop" ? 500 : 400,
              fontSize: 14,
              transition: "color 0.2s",
            }}
          >
            Computador
          </button>
          <div style={{
            position: "absolute",
            bottom: -1,
            left: view === "mobile" ? 0 : "50%",
            width: "50%",
            height: 2,
            background: "var(--primary)",
            borderRadius: 1,
            transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }} />
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center", alignItems: "flex-start" }}>
        {view === "mobile" ? (
          <>
            <PhoneFrame label="Consultório Dra. Ana" tagline="Agendamento de consultas online" accentColor="#0ea5e9">
              <ConsultorioApp />
            </PhoneFrame>
            <PhoneFrame label="Oficina do Zé" tagline="Gestão de ordens de serviço" accentColor="#f59e0b">
              <OficinaApp />
            </PhoneFrame>
            <PhoneFrame label="Doces da Carol" tagline="Catálogo, pedidos e pagamento" accentColor="#ec4899">
              <DocesApp />
            </PhoneFrame>
          </>
        ) : (
          <>
            <DesktopFrame label="Consultório Dra. Ana" tagline="Painel web de agendamentos" accentColor="#0ea5e9">
              <ConsultorioDesktop />
            </DesktopFrame>
            <DesktopFrame label="Oficina do Zé" tagline="Dashboard de ordens de serviço" accentColor="#f59e0b">
              <OficinaDesktop />
            </DesktopFrame>
            <DesktopFrame label="Doces da Carol" tagline="Loja online com catálogo e checkout" accentColor="#ec4899">
              <DocesDesktop />
            </DesktopFrame>
          </>
        )}
      </div>
    </section>
  );
}
