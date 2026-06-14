"use client";

import { useState, useRef } from "react";
import { ConsultorioApp } from "./demos/ConsultorioApp";
import { OficinaApp } from "./demos/OficinaApp";
import { DocesApp } from "./demos/DocesApp";
import { BarbeariaApp } from "./demos/BarbeariaApp";
import { PetShopApp } from "./demos/PetShopApp";
import { ConsultorioDesktop } from "./demos/ConsultorioDesktop";
import { OficinaDesktop } from "./demos/OficinaDesktop";
import { DocesDesktop } from "./demos/DocesDesktop";
import { BarbeariaDesktop } from "./demos/BarbeariaDesktop";
import { ImobiliariaDesktop } from "./demos/ImobiliariaDesktop";

/* ── Dados dos demos ──────────────────────────────────────────── */
const MOBILE_DEMOS = [
  { label: "Consultório Dra. Ana", tagline: "Agendamento de consultas online", accent: "#0ea5e9", component: <ConsultorioApp /> },
  { label: "Oficina do Zé",        tagline: "Gestão de ordens de serviço",    accent: "#f59e0b", component: <OficinaApp /> },
  { label: "Doces da Carol",       tagline: "Catálogo, pedidos e pagamento",  accent: "#ec4899", component: <DocesApp /> },
  { label: "Barbearia do João",    tagline: "Agendamento com fila virtual",   accent: "#7c3aed", component: <BarbeariaApp /> },
  { label: "Pet Shop Vida Animal", tagline: "Loja online com delivery",       accent: "#10b981", component: <PetShopApp /> },
];

const DESKTOP_DEMOS = [
  { label: "Consultório Dra. Ana",  tagline: "Painel web de agendamentos",          accent: "#0ea5e9", component: <ConsultorioDesktop /> },
  { label: "Oficina do Zé",         tagline: "Dashboard de ordens de serviço",      accent: "#f59e0b", component: <OficinaDesktop /> },
  { label: "Doces da Carol",        tagline: "Loja online com catálogo e checkout", accent: "#ec4899", component: <DocesDesktop /> },
  { label: "Barbearia do João",     tagline: "Painel admin da barbearia",           accent: "#7c3aed", component: <BarbeariaDesktop /> },
  { label: "Imobiliária Express",   tagline: "Gestão de imóveis e propostas",       accent: "#5B57E8", component: <ImobiliariaDesktop /> },
];

/* ── Phone Frame ─────────────────────────────────────────────── */
function PhoneFrame({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div style={{
      width: 240, height: 490, background: "#111",
      borderRadius: 42, padding: "10px 7px 12px",
      boxShadow: `0 32px 72px ${accent}50, 0 8px 24px rgba(0,0,0,0.5)`,
      position: "relative", flexShrink: 0,
    }}>
      {/* Dynamic island */}
      <div style={{
        position: "absolute", top: 13, left: "50%", transform: "translateX(-50%)",
        width: 72, height: 18, background: "#000", borderRadius: 12, zIndex: 10,
      }} />
      <div style={{
        width: "100%", height: "100%", borderRadius: 35,
        overflow: "hidden", display: "flex", flexDirection: "column",
        background: "#f8fafc",
      }}>
        {/* Status bar */}
        <div style={{
          height: 28, background: "#f8fafc", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          padding: "0 16px 0 10px", flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#1e293b" }}>9:41</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <svg width="13" height="9" viewBox="0 0 13 9"><rect x="0" y="2.5" width="2.5" height="6.5" rx="0.8" fill="#1e293b"/><rect x="3.5" y="1.5" width="2.5" height="7.5" rx="0.8" fill="#1e293b"/><rect x="7" y="0" width="2.5" height="9" rx="0.8" fill="#1e293b"/><rect x="10.5" y="1" width="2.5" height="7" rx="0.8" fill="#ccc"/></svg>
            <svg width="14" height="11" viewBox="0 0 14 11"><path d="M7 2C9 2 10.8 2.8 12 4.1L13.2 2.8C11.6 1.1 9.4 0 7 0S2.4 1.1.8 2.8L2 4.1C3.2 2.8 5 2 7 2Z" fill="#1e293b"/><path d="M7 5C8.2 5 9.2 5.5 10 6.2L11.2 4.9C10 3.8 8.6 3.1 7 3.1S4 3.8 2.8 4.9L4 6.2C4.8 5.5 5.8 5 7 5Z" fill="#1e293b"/><circle cx="7" cy="9" r="1.8" fill="#1e293b"/></svg>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: 18, height: 9, border: "1.5px solid #1e293b", borderRadius: 2.5, padding: 1.5, display: "flex", alignItems: "center" }}>
                <div style={{ width: "80%", height: "100%", background: "#1e293b", borderRadius: 1 }} />
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Desktop Frame ───────────────────────────────────────────── */
function DesktopFrame({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div style={{
      width: 580, background: "#1a1f2e",
      borderRadius: 12, overflow: "hidden",
      boxShadow: `0 32px 72px ${accent}40, 0 8px 24px rgba(0,0,0,0.5)`,
      flexShrink: 0,
    }}>
      {/* Browser chrome */}
      <div style={{
        height: 34, background: "#252d3d",
        display: "flex", alignItems: "center", padding: "0 12px", gap: 8,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
        </div>
        <div style={{ flex: 1, height: 20, background: "#1a2035", borderRadius: 5, display: "flex", alignItems: "center", padding: "0 10px", gap: 4 }}>
          <i className="ti ti-lock" style={{ fontSize: 9, color: "#64748b" }} />
          <span style={{ fontSize: 9, color: "#64748b" }}>app.fropty.com</span>
        </div>
        <i className="ti ti-refresh" style={{ fontSize: 11, color: "#64748b" }} />
      </div>
      <div style={{ height: 360, background: "#f8fafc", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

/* ── Carrossel ───────────────────────────────────────────────── */
function Carousel({ items, type }: {
  items: typeof MOBILE_DEMOS;
  type: "mobile" | "desktop";
}) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const prev = () => setActive(i => Math.max(0, i - 1));
  const next = () => setActive(i => Math.min(items.length - 1, i + 1));

  return (
    <div style={{ position: "relative" }}>
      {/* Track */}
      <div style={{ overflow: "hidden", position: "relative" }}>
        <div
          ref={trackRef}
          style={{
            display: "flex",
            gap: type === "mobile" ? 32 : 40,
            transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
            transform: `translateX(calc(50% - ${type === "mobile" ? 120 : 290}px - ${active * (type === "mobile" ? 272 : 620)}px))`,
            willChange: "transform",
            padding: "32px 0 48px",
          }}
        >
          {items.map((item, i) => {
            const isActive = i === active;
            return (
              <div
                key={i}
                onClick={() => !isActive && setActive(i)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 20,
                  opacity: isActive ? 1 : 0.35,
                  transform: isActive ? "scale(1)" : "scale(0.88)",
                  transition: "opacity 0.4s, transform 0.4s",
                  cursor: isActive ? "default" : "pointer",
                }}
              >
                {type === "mobile" ? (
                  <PhoneFrame accent={item.accent}>
                    {item.component}
                  </PhoneFrame>
                ) : (
                  <DesktopFrame accent={item.accent}>
                    {item.component}
                  </DesktopFrame>
                )}
                <div style={{ textAlign: "center", opacity: isActive ? 1 : 0, transition: "opacity 0.4s", pointerEvents: "none" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{item.tagline}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        disabled={active === 0}
        aria-label="Anterior"
        style={{
          position: "absolute",
          left: 16, top: "50%", transform: "translateY(-80%)",
          width: 44, height: 44, borderRadius: "50%",
          border: "1px solid var(--border)",
          background: "var(--surface)",
          color: active === 0 ? "var(--text-faint)" : "var(--text)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: active === 0 ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          zIndex: 10,
        }}
      >
        <i className="ti ti-chevron-left" style={{ fontSize: 18 }} />
      </button>
      <button
        onClick={next}
        disabled={active === items.length - 1}
        aria-label="Próximo"
        style={{
          position: "absolute",
          right: 16, top: "50%", transform: "translateY(-80%)",
          width: 44, height: 44, borderRadius: "50%",
          border: "1px solid var(--border)",
          background: "var(--surface)",
          color: active === items.length - 1 ? "var(--text-faint)" : "var(--text)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: active === items.length - 1 ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          zIndex: 10,
        }}
      >
        <i className="ti ti-chevron-right" style={{ fontSize: 18 }} />
      </button>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 4 }}>
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Ir para demo ${i + 1}`}
            style={{
              width: i === active ? 24 : 7,
              height: 7,
              borderRadius: 4,
              border: "none",
              background: i === active ? "var(--primary)" : "var(--border)",
              cursor: "pointer",
              transition: "all 0.3s",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────── */
export default function AppDemos() {
  const [view, setView] = useState<"mobile" | "desktop">("mobile");

  return (
    <section
      id="exemplos"
      style={{
        scrollMarginTop: 80,
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span className="section-chip" style={{ marginBottom: 16, display: "inline-flex" }}>
            <i className="ti ti-device-mobile" style={{ fontSize: 13 }} />
            Exemplos reais
          </span>
          <h2 style={{
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            fontWeight: 800, lineHeight: 1.1,
            color: "var(--text)",
            fontFamily: "var(--font-plus-jakarta), sans-serif",
            margin: "0 0 12px",
          }}>
            Veja o que é possível
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 480, margin: "0 auto" }}>
            Apps reais para negócios reais — do seu jeito, com a sua cara.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <div style={{ position: "relative", display: "inline-flex", borderBottom: "1px solid var(--border)" }}>
            {(["mobile", "desktop"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "10px 32px",
                  background: "none", border: "none", cursor: "pointer",
                  color: view === v ? "var(--text)" : "var(--text-muted)",
                  fontWeight: view === v ? 700 : 400,
                  fontSize: 14, transition: "color 0.2s",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <i className={`ti ${v === "mobile" ? "ti-device-mobile" : "ti-device-laptop"}`} style={{ fontSize: 15 }} />
                {v === "mobile" ? "Mobile" : "Computador"}
              </button>
            ))}
            <div style={{
              position: "absolute", bottom: -1,
              left: view === "mobile" ? 0 : "50%",
              width: "50%", height: 2,
              background: "var(--primary)", borderRadius: 1,
              transition: "left 0.28s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
        </div>
      </div>

      {/* Carousel */}
      <Carousel key={view} items={view === "mobile" ? MOBILE_DEMOS : DESKTOP_DEMOS} type={view} />

      <div style={{ height: 24 }} />
    </section>
  );
}
