"use client";
import { useState, useEffect, useRef } from "react";

const HOURLY = [2, 8, 12, 6, 4, 11, 14, 9, 7, 5, 3, 1];
const HOURS = ["8h","9h","10h","11h","12h","13h","14h","15h","16h","17h","18h","19h"];
const TOP3 = [
  { rank: "🥇", nome: "Combo (Corte + Barba)", count: 47, revenue: 3290 },
  { rank: "🥈", nome: "Corte Masculino", count: 38, revenue: 1710 },
  { rank: "🥉", nome: "Barba", count: 29, revenue: 1015 },
];
const STATS = [
  { label: "Serviço mais vendido", value: "Combo (Corte + Barba)", sub: "47 este mês", icon: "ti-scissors", color: "#c9a84c" },
  { label: "Barbeiro destaque", value: "Rafael Costa", sub: "87 atendimentos", icon: "ti-star", color: "#5B57E8" },
  { label: "Taxa de cancelamento", value: "4,2%", sub: "Baixíssima ✓", icon: "ti-x", color: "#ef4444" },
  { label: "Horário de pico", value: "10h–11h e 14h–15h", sub: "Alta demanda", icon: "ti-clock", color: "#3b82f6" },
];

export default function Relatorios({ addToast }: { addToast: (type: "success"|"error"|"warning"|"info", msg: string) => void }) {
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<unknown>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) return;

    function loadChart() {
      const win = window as unknown as { Chart?: unknown };
      if (!win.Chart) {
        setTimeout(loadChart, 100);
        return;
      }
      if (!chartRef.current) return;

      const ChartClass = win.Chart as new (el: HTMLCanvasElement, cfg: unknown) => { destroy: () => void };

      if (chartInstance.current) {
        (chartInstance.current as { destroy: () => void }).destroy();
      }

      chartInstance.current = new ChartClass(chartRef.current, {
        type: "bar",
        data: {
          labels: HOURS,
          datasets: [{
            label: "Atendimentos",
            data: HOURLY,
            backgroundColor: "#c9a84c",
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx: { parsed: { y: number } }) => ` ${ctx.parsed.y} atendimentos`
              }
            }
          },
          scales: {
            x: {
              grid: { color: "rgba(255,255,255,0.05)" },
              ticks: { color: "#9ca3af" }
            },
            y: {
              grid: { color: "rgba(255,255,255,0.05)" },
              ticks: { color: "#9ca3af", stepSize: 2 },
              beginAtZero: true
            }
          }
        }
      });
    }

    // Ensure Chart.js CDN is loaded
    if (!(window as unknown as { Chart?: unknown }).Chart) {
      const existing = document.querySelector('script[src*="chart.js"]');
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        document.head.appendChild(script);
        script.onload = loadChart;
      } else {
        existing.addEventListener("load", loadChart);
      }
    } else {
      loadChart();
    }

    return () => {
      if (chartInstance.current) {
        (chartInstance.current as { destroy: () => void }).destroy();
      }
    };
  }, [loading]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ height: 28, background: "var(--surface-2)", borderRadius: 8, width: 160, marginBottom: 8 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 100, background: "var(--surface-2)", borderRadius: 14 }} />
          ))}
        </div>
        <div style={{ height: 240, background: "var(--surface-2)", borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, margin: 0 }}>Relatórios</h2>
        <button
          onClick={() => addToast("info", "Relatório da barbearia gerado! Baixando...")}
          style={{
            background: "#c9a84c", border: "none", borderRadius: 8,
            padding: "9px 18px", cursor: "pointer", color: "#111",
            fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6
          }}
        >
          <i className="ti ti-download" /> Exportar relatório
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {STATS.map(s => (
          <div key={s.label} style={{
            background: "var(--card-bg)", border: "1px solid var(--card-border)",
            borderRadius: 14, padding: 20
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: s.color + "20",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12
            }}>
              <i className={`ti ${s.icon}`} style={{ color: s.color, fontSize: 20 }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {s.label}
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: s.label === "Taxa de cancelamento" ? "#10B981" : "var(--text-muted)" }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{
        background: "var(--card-bg)", border: "1px solid var(--card-border)",
        borderRadius: 14, padding: 24
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 16 }}>
          Atendimentos por horário
        </div>
        <div style={{ height: 220, position: "relative" }}>
          <canvas ref={chartRef} />
        </div>
      </div>

      {/* Top 3 serviços */}
      <div style={{
        background: "var(--card-bg)", border: "1px solid var(--card-border)",
        borderRadius: 14, padding: 24
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 16 }}>
          Top 3 Serviços
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TOP3.map(s => (
            <div key={s.nome} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{s.rank}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{s.nome}</span>
                  <span style={{ color: "var(--text-faint)", fontSize: 13 }}>{s.count} atend.</span>
                </div>
                <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    background: "#c9a84c",
                    width: `${(s.count / 47) * 100}%`,
                    transition: "width 0.6s ease"
                  }} />
                </div>
              </div>
              <span style={{ color: "#c9a84c", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                R$ {s.revenue.toLocaleString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
