"use client";
import { useState } from "react";
import { BARBEIROS, type Barbeiro } from "./data";

const FAKE_AGENDA = [
  "09:00 - Carlos M.", "10:30 - João P.", "14:00 - Livre",
  "15:00 - Pedro A.", "16:30 - Marcos T.", "17:00 - Livre"
];
const FULL_AGENDA = [
  "08:00 - Livre", "09:00 - Carlos M.", "09:45 - Rafael S.",
  "10:30 - João P.", "11:15 - Livre", "13:00 - André C.",
  "14:00 - Livre", "15:00 - Pedro A.", "16:30 - Marcos T.", "17:30 - Livre"
];

function StatusBadge({ status }: { status: Barbeiro["status"] }) {
  const map = {
    disponivel: { label: "🟢 Disponível", bg: "#10B98120", color: "#10B981" },
    atendendo: { label: "🟡 Atendendo", bg: "#f5952020", color: "#f59520" },
    folga: { label: "🔴 Folga", bg: "#ef444420", color: "#ef4444" },
  };
  const cfg = map[status];
  return (
    <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
      {cfg.label}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#c9a84c", fontSize: 14 }}>
      {[1,2,3,4,5].map(i => (
        <i key={i} className={i <= Math.round(rating) ? "ti ti-star-filled" : "ti ti-star"} />
      ))}
    </span>
  );
}

export default function Equipe({ addToast }: { addToast: (type: "success"|"error"|"warning"|"info", msg: string) => void }) {
  const [barbeiros] = useState<Barbeiro[]>(BARBEIROS);
  const [selectedBarb, setSelectedBarb] = useState<Barbeiro | null>(null);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, margin: 0 }}>Nossa Equipe</h2>
        <span style={{
          background: "#c9a84c20", color: "#c9a84c",
          borderRadius: 20, padding: "2px 12px", fontSize: 13, fontWeight: 700
        }}>
          {barbeiros.length} barbeiros
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {barbeiros.map(b => (
          <div key={b.id} style={{
            background: "var(--card-bg)", border: "1px solid var(--card-border)",
            borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 12
          }}>
            {/* Top */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%", background: b.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 22, flexShrink: 0
              }}>
                {b.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text)" }}>{b.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{b.specialty}</div>
              </div>
            </div>

            <StatusBadge status={b.status} />

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Stars rating={b.rating} />
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                {b.rating.toFixed(1)} ({b.reviewCount} avaliações)
              </span>
            </div>

            {/* Atendimentos */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13 }}>
              <i className="ti ti-scissors" style={{ color: "#c9a84c" }} />
              Atendimentos este mês: <strong style={{ color: "var(--text)" }}>{b.monthlyCount}</strong>
            </div>

            {/* Mini agenda */}
            <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Agenda de hoje
              </div>
              {FAKE_AGENDA.slice(0, 3).map((item, i) => (
                <div key={i} style={{
                  fontSize: 12, color: item.includes("Livre") ? "var(--text-faint)" : "var(--text-muted)",
                  padding: "2px 0"
                }}>
                  {item}
                </div>
              ))}
            </div>

            {/* Ver agenda */}
            <button
              onClick={() => setSelectedBarb(b)}
              style={{
                background: "transparent",
                border: "1.5px solid var(--border)",
                borderRadius: 8, padding: "8px 0", cursor: "pointer",
                color: "var(--text-muted)", fontWeight: 600, fontSize: 13,
                transition: "border-color 0.2s, color 0.2s"
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#c9a84c";
                (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
              }}
            >
              Ver agenda completa
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedBarb && (
        <div
          onClick={() => setSelectedBarb(null)}
          style={{
            position: "fixed", inset: 0, background: "#00000080",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%", background: selectedBarb.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 28, flexShrink: 0
              }}>
                {selectedBarb.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, color: "var(--text)" }}>{selectedBarb.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 6 }}>{selectedBarb.specialty}</div>
                <StatusBadge status={selectedBarb.status} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "var(--text-faint)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Agenda completa de hoje
              </div>
              {FULL_AGENDA.map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 0", borderBottom: "1px solid var(--border)",
                  color: item.includes("Livre") ? "var(--text-faint)" : "var(--text)",
                  fontSize: 14
                }}>
                  <i className={item.includes("Livre") ? "ti ti-clock" : "ti ti-user"} style={{ color: item.includes("Livre") ? "var(--text-faint)" : "#c9a84c", fontSize: 14 }} />
                  {item}
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Atendimentos/mês", value: selectedBarb.monthlyCount, icon: "ti-scissors" },
                { label: "Avaliação", value: selectedBarb.rating.toFixed(1) + " ★", icon: "ti-star" },
                { label: "Avaliações", value: selectedBarb.reviewCount, icon: "ti-message" },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: "var(--surface-2)", borderRadius: 10, padding: "12px 14px", textAlign: "center"
                }}>
                  <i className={`ti ${stat.icon}`} style={{ color: "#c9a84c", fontSize: 18 }} />
                  <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text)", margin: "4px 0 2px" }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedBarb(null)}
              style={{
                width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "10px 0", cursor: "pointer", color: "var(--text-muted)",
                fontWeight: 600, fontSize: 14
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
